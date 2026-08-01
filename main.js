import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { registerFolderHandlers } from "./ipc/folders.js";
import { registerNoteHandlers } from "./ipc/note.js";
import { registerSearchHandlers } from "./ipc/search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 600,
        icon: path.join(__dirname, "src", "img", "img_note_bg.ico"),
        webPreferences: {
            preload: path.join(__dirname, "src", "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.loadFile(path.join(__dirname, "dist", "index.html"));
    win.removeMenu();
}

registerFolderHandlers(ipcMain);
registerNoteHandlers(ipcMain);
registerSearchHandlers(ipcMain);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
