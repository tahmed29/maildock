import { app, BrowserWindow } from "electron";
import { join} from "node:path";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "MailDock",
    backgroundColor: "#111827",
    webPreferences: {
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