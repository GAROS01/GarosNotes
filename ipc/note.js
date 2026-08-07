import fs from "fs";
import { folderPath, notePath } from "./paths.js";
import { validarNombre } from "./validate.js";

// Valida un nombre; devuelve el objeto de error si es inválido o null si es válido.
function validarOError(nombre, tipo) {
    const validacion = validarNombre(nombre, tipo);
    return validacion.ok ? null : { ok: false, error: `Nombre no válido: ${validacion.error}` };
}

export function registerNoteHandlers(ipcMain) {
    ipcMain.handle("crear-nota", async (_event, nombreCarpeta, nombreNota, contenido = "") => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNota, "nota");
        if (invalido) return invalido;

        console.log("Creando nota:", nombreNota, "en carpeta:", nombreCarpeta);
        try {
            const ruta = notePath(nombreCarpeta, nombreNota);
            const carpeta = folderPath(nombreCarpeta);
            if (!fs.existsSync(carpeta)) {
                return { ok: false, error: "La carpeta no existe" };
            }
            fs.writeFileSync(ruta, contenido, "utf8");
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("listar-notas", async (_event, nombreCarpeta) => {
        const invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;

        console.log("Listando notas de carpeta:", nombreCarpeta);
        try {
            const carpeta = folderPath(nombreCarpeta);
            if (!fs.existsSync(carpeta)) {
                return { ok: false, error: "La carpeta no existe" };
            }
            const notas = fs
                .readdirSync(carpeta, { withFileTypes: true })
                .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
                .map((dirent) => dirent.name.replace(".json", ""));
            return { ok: true, notas };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("leer-nota", async (_event, nombreCarpeta, nombreNota) => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNota, "nota");
        if (invalido) return invalido;

        console.log("Leyendo nota:", nombreNota, "de carpeta:", nombreCarpeta);
        try {
            const ruta = notePath(nombreCarpeta, nombreNota);
            if (!fs.existsSync(ruta)) {
                return { ok: false, error: "La nota no existe" };
            }
            const contenido = fs.readFileSync(ruta, "utf8");
            return { ok: true, contenido };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("guardar-nota", async (_event, nombreCarpeta, nombreNota, contenido) => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNota, "nota");
        if (invalido) return invalido;

        console.log("Guardando nota:", nombreNota, "en carpeta:", nombreCarpeta);
        try {
            const ruta = notePath(nombreCarpeta, nombreNota);
            fs.writeFileSync(ruta, contenido, "utf8");
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("eliminar-nota", async (_event, nombreCarpeta, nombreNota) => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNota, "nota");
        if (invalido) return invalido;

        console.log("Eliminando nota:", nombreNota, "de carpeta:", nombreCarpeta);
        try {
            const ruta = notePath(nombreCarpeta, nombreNota);
            if (!fs.existsSync(ruta)) {
                return { ok: false, error: "La nota no existe" };
            }
            fs.unlinkSync(ruta);
            return { ok: true, path: ruta };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("renombrar-nota", async (_event, nombreCarpeta, nombreViejo, nombreNuevo) => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreViejo, "nota");
        if (invalido) return invalido;
        invalido = validarOError(nombreNuevo, "nota");
        if (invalido) return invalido;

        console.log("Renombrando nota:", nombreViejo, "→", nombreNuevo, "en carpeta:", nombreCarpeta);
        try {
            const rutaVieja = notePath(nombreCarpeta, nombreViejo);
            const rutaNueva = notePath(nombreCarpeta, nombreNuevo);

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
    });
}
