import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { openDatabase } from "./database/connection.js";

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
      app.exit(1);
    });
}

app.whenReady().then(() => {
  const storagePath = join(app.getPath("userData"), "storage");
  mkdirSync(storagePath, { recursive: true });

  const databasePath = join(storagePath, "maildock.db");
  const database = openDatabase(databasePath);

  app.once("will-quit", () => {
    database.close();
  });

  console.log("Database ready:", databasePath);

  ipcMain.handle("app:get-version", () => app.getVersion());

  createWindow();

  // Reopen on macOS dock click.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})
.catch((error: unknown) => {
  console.error("Failed to start MailDock:", error);
  app.exit(1);
});

app.on("window-all-closed", () => {
    // Keep the app running on macOS.
    if (process.platform !== "darwin") {
        app.quit();
    }
});