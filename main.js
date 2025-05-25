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
	// win.webContents.openDevTools();
	win.removeMenu();
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

ipcMain.handle("eliminar-carpeta", async (event, nombreCarpeta) => {
	console.log("Eliminando carpeta:", nombreCarpeta);
	const documentsPath = path.join(
		os.homedir(),
		"Documents",
		"GarosNotes",
		nombreCarpeta
	);
	try {
		// Verificar si la carpeta existe
		if (!fs.existsSync(documentsPath)) {
			return { ok: false, error: "La carpeta no existe" };
		}

		// Eliminar la carpeta y todo su contenido
		fs.rmSync(documentsPath, { recursive: true, force: true });
		return { ok: true, path: documentsPath };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});

// IPC Handlers para notas
ipcMain.handle(
	"crear-nota",
	async (event, nombreCarpeta, nombreNota, contenido = "") => {
		console.log("Creando nota:", nombreNota, "en carpeta:", nombreCarpeta);
		const notaPath = path.join(
			os.homedir(),
			"Documents",
			"GarosNotes",
			nombreCarpeta,
			`${nombreNota}.txt`
		);
		try {
			// Verificar que la carpeta existe
			const carpetaPath = path.join(
				os.homedir(),
				"Documents",
				"GarosNotes",
				nombreCarpeta
			);
			if (!fs.existsSync(carpetaPath)) {
				return { ok: false, error: "La carpeta no existe" };
			}

			// Crear el archivo .txt
			fs.writeFileSync(notaPath, contenido, "utf8");
			return { ok: true, path: notaPath };
		} catch (error) {
			return { ok: false, error: error.message };
		}
	}
);

ipcMain.handle("listar-notas", async (event, nombreCarpeta) => {
	console.log("Listando notas de carpeta:", nombreCarpeta);
	const carpetaPath = path.join(
		os.homedir(),
		"Documents",
		"GarosNotes",
		nombreCarpeta
	);
	try {
		if (!fs.existsSync(carpetaPath)) {
			return { ok: false, error: "La carpeta no existe" };
		}

		const archivos = fs
			.readdirSync(carpetaPath, { withFileTypes: true })
			.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".txt"))
			.map((dirent) => dirent.name.replace(".txt", "")); // Quitar la extensión .txt

		return { ok: true, notas: archivos };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});

ipcMain.handle("leer-nota", async (event, nombreCarpeta, nombreNota) => {
	console.log("Leyendo nota:", nombreNota, "de carpeta:", nombreCarpeta);
	const notaPath = path.join(
		os.homedir(),
		"Documents",
		"GarosNotes",
		nombreCarpeta,
		`${nombreNota}.txt`
	);
	try {
		if (!fs.existsSync(notaPath)) {
			return { ok: false, error: "La nota no existe" };
		}

		const contenido = fs.readFileSync(notaPath, "utf8");
		return { ok: true, contenido };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});

ipcMain.handle(
	"guardar-nota",
	async (event, nombreCarpeta, nombreNota, contenido) => {
		console.log("Guardando nota:", nombreNota, "en carpeta:", nombreCarpeta);
		const notaPath = path.join(
			os.homedir(),
			"Documents",
			"GarosNotes",
			nombreCarpeta,
			`${nombreNota}.txt`
		);
		try {
			fs.writeFileSync(notaPath, contenido, "utf8");
			return { ok: true, path: notaPath };
		} catch (error) {
			return { ok: false, error: error.message };
		}
	}
);

ipcMain.handle("eliminar-nota", async (event, nombreCarpeta, nombreNota) => {
	console.log("Eliminando nota:", nombreNota, "de carpeta:", nombreCarpeta);
	const notaPath = path.join(
		os.homedir(),
		"Documents",
		"GarosNotes",
		nombreCarpeta,
		`${nombreNota}.txt`
	);
	try {
		if (!fs.existsSync(notaPath)) {
			return { ok: false, error: "La nota no existe" };
		}

		fs.unlinkSync(notaPath);
		return { ok: true, path: notaPath };
	} catch (error) {
		return { ok: false, error: error.message };
	}
});

ipcMain.handle(
	"renombrar-nota",
	async (event, nombreCarpeta, nombreViejo, nombreNuevo) => {
		console.log(
			"Renombrando nota:",
			nombreViejo,
			"→",
			nombreNuevo,
			"en carpeta:",
			nombreCarpeta
		);
		const rutaVieja = path.join(
			os.homedir(),
			"Documents",
			"GarosNotes",
			nombreCarpeta,
			`${nombreViejo}.txt`
		);
		const rutaNueva = path.join(
			os.homedir(),
			"Documents",
			"GarosNotes",
			nombreCarpeta,
			`${nombreNuevo}.txt`
		);

		try {
			if (!fs.existsSync(rutaVieja)) {
				return { ok: false, error: "La nota no existe" };
			}

			if (fs.existsSync(rutaNueva)) {
				return { ok: false, error: "Ya existe una nota con ese nombre" };
			}

			fs.renameSync(rutaVieja, rutaNueva);
			return { ok: true, path: rutaNueva };
		} catch (error) {
			return { ok: false, error: error.message };
		}
	}
);
