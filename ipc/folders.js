import fs from "fs";
import { NOTES_BASE, folderPath } from "./paths.js";

export function registerFolderHandlers(ipcMain) {
    ipcMain.handle("crear-carpeta", async (_event, nombreCarpeta) => {
        console.log("Creando carpeta:", nombreCarpeta);
        try {
            const ruta = folderPath(nombreCarpeta);
            fs.mkdirSync(ruta, { recursive: true });
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("listar-carpetas", async () => {
        try {
            if (!fs.existsSync(NOTES_BASE)) {
                fs.mkdirSync(NOTES_BASE, { recursive: true });
            }
            const carpetas = fs
                .readdirSync(NOTES_BASE, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);
            return { ok: true, carpetas };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("eliminar-carpeta", async (_event, nombreCarpeta) => {
        console.log("Eliminando carpeta:", nombreCarpeta);
        try {
            const ruta = folderPath(nombreCarpeta);
            if (!fs.existsSync(ruta)) {
                return { ok: false, error: "La carpeta no existe" };
            }
            fs.rmSync(ruta, { recursive: true, force: true });
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("renombrar-carpeta", async (_event, nombreViejo, nombreNuevo) => {
        console.log("Renombrando carpeta:", nombreViejo, "→", nombreNuevo);
        try {
            const rutaVieja = folderPath(nombreViejo);
            const rutaNueva = folderPath(nombreNuevo);

            if (!fs.existsSync(rutaVieja)) {
                return { ok: false, error: "La carpeta no existe" };
            }
            if (fs.existsSync(rutaNueva)) {
                return { ok: false, error: "Ya existe una carpeta con ese nombre" };
            }

            fs.renameSync(rutaVieja, rutaNueva);
            return { ok: true, path: rutaNueva };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
