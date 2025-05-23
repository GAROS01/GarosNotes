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
	// win.removeMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
