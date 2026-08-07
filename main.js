import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { registerFolderHandlers } from "./ipc/folders.js";
import { registerNoteHandlers } from "./ipc/note.js";
import { registerSearchHandlers } from "./ipc/search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tiempo máximo de espera al flush de cierre del renderer (ms).
const TIEMPO_MAXIMO_FLUSH_MS = 2000;

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

    // Al cerrar la ventana se pide al renderer que flushee los cambios pendientes
    // (autoguardado) antes de destruirla. Un timeout de seguridad evita que la
    // app se cuelgue si el renderer no responde.
    let flushSolicitado = false;
    win.on("close", (event) => {
        // Bloquear SIEMPRE el cierre hasta que el renderer confirme el flush
        // (o expire el timeout de seguridad). Así un doble clic en la X no
        // destruye la ventana antes de que el autoguardado termine.
        event.preventDefault();
        if (flushSolicitado) return;

        flushSolicitado = true;

        win.webContents.send("app:before-close");

        const onConfirmado = () => {
            clearTimeout(timeout);
            win.destroy();
        };
        const timeout = setTimeout(() => {
            ipcMain.removeListener("app:close-confirmed", onConfirmado);
            win.destroy();
        }, TIEMPO_MAXIMO_FLUSH_MS);

        ipcMain.once("app:close-confirmed", onConfirmado);
    });
}

registerFolderHandlers(ipcMain);
registerNoteHandlers(ipcMain);
registerSearchHandlers(ipcMain);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
