import fs from "fs";
import { mkdir, readdir, rm, rename } from "fs/promises";
import { NOTES_BASE, folderPath } from "./paths.js";
import { validarNombre } from "./validate.js";

// Valida un nombre; devuelve el objeto de error si es inválido o null si es válido.
function validarOError(nombre, tipo) {
    const validacion = validarNombre(nombre, tipo);
    return validacion.ok ? null : { ok: false, error: `Nombre no válido: ${validacion.error}` };
}

export function registerFolderHandlers(ipcMain) {
    ipcMain.handle("crear-carpeta", async (_event, nombreCarpeta) => {
        const invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;

        console.log("Creando carpeta:", nombreCarpeta);
        try {
            const ruta = folderPath(nombreCarpeta);
            await mkdir(ruta, { recursive: true });
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("listar-carpetas", async () => {
        try {
            if (!fs.existsSync(NOTES_BASE)) {
                await mkdir(NOTES_BASE, { recursive: true });
            }
            const carpetas = (await readdir(NOTES_BASE, { withFileTypes: true }))
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);
            return { ok: true, carpetas };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("eliminar-carpeta", async (_event, nombreCarpeta) => {
        const invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;

        console.log("Eliminando carpeta:", nombreCarpeta);
        try {
            const ruta = folderPath(nombreCarpeta);
            if (!fs.existsSync(ruta)) {
                return { ok: false, error: "La carpeta no existe" };
            }
            await rm(ruta, { recursive: true, force: true });
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("renombrar-carpeta", async (_event, nombreViejo, nombreNuevo) => {
        let invalido = validarOError(nombreViejo, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNuevo, "carpeta");
        if (invalido) return invalido;

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

            await rename(rutaVieja, rutaNueva);
            return { ok: true, path: rutaNueva };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
