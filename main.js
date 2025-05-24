import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import os from "os";

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

	win.loadFile(path.join(__dirname, "src", "index.html"));
	win.webContents.openDevTools(); // Para debug
	// win.removeMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

// IPC Handlers
ipcMain.handle("crear-carpeta", async (event, nombreCarpeta) => {
	console.log("Creando carpeta:", nombreCarpeta);
	const documentsPath = path.join(
		os.homedir(),
		"Documents",
		"GarosNotes",
		nombreCarpeta
	);
	try {
		fs.mkdirSync(documentsPath, { recursive: true });
		return { ok: true, path: documentsPath };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});

ipcMain.handle("listar-carpetas", async () => {
	const basePath = path.join(os.homedir(), "Documents", "GarosNotes");
	try {
		if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
		const carpetas = fs
			.readdirSync(basePath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
		return { ok: true, carpetas };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});
