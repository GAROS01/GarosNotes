import { mkdir, readdir, rename } from "fs/promises";
import { existeRuta, moverAPapelera } from "./fs-utils.js";
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
            if (!(await existeRuta(NOTES_BASE))) {
                await mkdir(NOTES_BASE, { recursive: true });
            }
            const carpetas = (await readdir(NOTES_BASE, { withFileTypes: true }))
                .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
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
            if (!(await existeRuta(ruta))) {
                return { ok: false, error: "La carpeta no existe" };
            }
            const destino = await moverAPapelera("carpeta", nombreCarpeta);
            return { ok: true, path: destino };
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

            if (!(await existeRuta(rutaVieja))) {
                return { ok: false, error: "La carpeta no existe" };
            }
            if (await existeRuta(rutaNueva)) {
                return { ok: false, error: "Ya existe una carpeta con ese nombre" };
            }

            await rename(rutaVieja, rutaNueva);
            return { ok: true, path: rutaNueva };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
