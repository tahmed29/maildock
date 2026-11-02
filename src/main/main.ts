import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { IpcMainInvokeEvent } from "electron";
import { DatabaseClient } from "./database/client.js";

let database: DatabaseClient | undefined;

if (!app.requestSingleInstanceLock()) {
  app.exit(0);
}

app.on("second-instance", () => {
  const window = BrowserWindow.getAllWindows()[0];

  if (window) {
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  }
});

function checkBucketSender(event: IpcMainInvokeEvent): void {
    const expectedUrl = pathToFileURL(
      join(__dirname, "../renderer/index.html"),
    ).href;

    if (
      event.senderFrame !== event.sender.mainFrame ||
      event.senderFrame?.url !== expectedUrl
    ) {
      throw new Error("Untrusted bucket request.");
    }
  }

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "MailDock",
    backgroundColor: "#111827",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow
    .loadFile(join(__dirname, "../renderer/index.html"))
    .catch((error: unknown) => {
      console.error("Failed to load interface:", error);
      app.quit();
    });
}

app.whenReady().then(async () => {
  const storagePath = join(app.getPath("userData"), "storage");
  mkdirSync(storagePath, { recursive: true });

  const databasePath = join(storagePath, "maildock.db");
  const client = new DatabaseClient(databasePath);
  database = client;

  await client.ping();
  console.log("Database worker ready:", databasePath);

  ipcMain.handle("app:get-version", () => app.getVersion());

  ipcMain.handle("buckets:list", (event) => {
    checkBucketSender(event);
    return client.listBuckets();
  });

  ipcMain.handle("buckets:create", (event, name: unknown) => {
    checkBucketSender(event);
    return client.createBucket(name);
  });

  ipcMain.handle("buckets:remove", (event, bucketId: unknown) => {
    checkBucketSender(event);
    return client.removeBucket(bucketId);
  });

  ipcMain.handle(
    "buckets:rename",
    (event, bucketId: unknown, name: unknown) => {
      checkBucketSender(event);
      return client.renameBucket(bucketId, name);
    },
  );

  createWindow();

  let shutdownStarted = false;
  let canQuit = false;

  app.on("before-quit", (event) => {
    if (canQuit) return;

    event.preventDefault();
    if (shutdownStarted) return;
    shutdownStarted = true;

    void client.close()
      .catch((error: unknown) => {
        console.error("Failed to close database worker:", error);
      })
      .finally(() => {
        canQuit = true;
        app.quit();
      });
  });

  createWindow();

  // Reopen on macOS dock click.
  app.on("activate", () => {
    if (!shutdownStarted && BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})
.catch(async (error: unknown) => {
  console.error("Failed to start MailDock:", error);
  
  try {
    await database?.close();
  } catch (closeError: unknown) {
    console.error("Failed to clean up database worker:", closeError);
  }

  app.exit(1);
});

app.on("window-all-closed", () => {
    // Keep the app running on macOS.
    if (process.platform !== "darwin") {
        app.quit();
    }
});