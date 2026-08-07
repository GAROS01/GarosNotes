import path from "path";
import { mkdir, readdir, rename, rm } from "fs/promises";
import {
    PAPELERA,
    PAPELERA_CARPETAS,
    PAPELERA_NOTAS,
    folderPath,
    notePath,
    papeleraCarpetasPath,
    papeleraNotasPath,
} from "./paths.js";
import { existeRuta } from "./fs-utils.js";
import { validarNombre } from "./validate.js";
import { actualizarEntrada, reindexarCarpeta } from "./searchIndex.js";

export function registerTrashHandlers(ipcMain) {
    // Lista los elementos que están en la papelera (carpetas y notas).
    ipcMain.handle("listar-papelera", async () => {
        try {
            if (!(await existeRuta(PAPELERA))) {
                return { ok: true, carpetas: [], notas: [] };
            }

            let carpetas = [];
            if (await existeRuta(PAPELERA_CARPETAS)) {
                carpetas = (await readdir(PAPELERA_CARPETAS, { withFileTypes: true }))
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);
            }

            const notas = [];
            if (await existeRuta(PAPELERA_NOTAS)) {
                const carpetasOrigen = (await readdir(PAPELERA_NOTAS, { withFileTypes: true }))
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);
                for (const carpetaOrigen of carpetasOrigen) {
                    const notasDeCarpeta = (
                        await readdir(path.join(PAPELERA_NOTAS, carpetaOrigen), {
                            withFileTypes: true,
                        })
                    )
                        .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
                        .map((dirent) => dirent.name.replace(/\.json$/, ""));
                    for (const nota of notasDeCarpeta) {
                        notas.push({ carpeta: carpetaOrigen, nota });
                    }
                }
            }

            return { ok: true, carpetas, notas };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    // Restaura un elemento de la papelera a su ubicación original.
    // tipo: "carpeta" | "nota"; para notas se necesita carpetaOrigen.
    ipcMain.handle("restaurar-elemento", async (_event, tipo, nombre, carpetaOrigen) => {
        try {
            if (tipo === "carpeta") {
                const validacion = validarNombre(nombre, "carpeta");
                if (!validacion.ok) {
                    return { ok: false, error: `Nombre no válido: ${validacion.error}` };
                }
                const origen = papeleraCarpetasPath(nombre);
                const destino = folderPath(nombre);
                if (!(await existeRuta(origen))) {
                    return { ok: false, error: "El elemento no está en la papelera" };
                }
                if (await existeRuta(destino)) {
                    return { ok: false, error: "Ya existe una carpeta con ese nombre" };
                }
                await rename(origen, destino);
                await reindexarCarpeta(nombre);
                return { ok: true, path: destino };
            }

            if (tipo === "nota") {
                const validacionCarpeta = validarNombre(carpetaOrigen, "carpeta");
                if (!validacionCarpeta.ok) {
                    return { ok: false, error: `Nombre no válido: ${validacionCarpeta.error}` };
                }
                const validacionNota = validarNombre(nombre, "nota");
                if (!validacionNota.ok) {
                    return { ok: false, error: `Nombre no válido: ${validacionNota.error}` };
                }
                const origen = papeleraNotasPath(carpetaOrigen, nombre);
                const destino = notePath(carpetaOrigen, nombre);
                if (!(await existeRuta(origen))) {
                    return { ok: false, error: "El elemento no está en la papelera" };
                }
                if (await existeRuta(destino)) {
                    return { ok: false, error: "Ya existe una nota con ese nombre" };
                }
                // Si la carpeta original ya no existe, se recrea para poder restaurar
                await mkdir(folderPath(carpetaOrigen), { recursive: true });
                await rename(origen, destino);
                await actualizarEntrada(carpetaOrigen, nombre);
                return { ok: true, path: destino };
            }

            return { ok: false, error: "Tipo de elemento no válido" };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    // Borra definitivamente todo el contenido de la papelera.
    ipcMain.handle("vaciar-papelera", async () => {
        try {
            if (await existeRuta(PAPELERA)) {
                await rm(PAPELERA, { recursive: true, force: true });
            }
            return { ok: true };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
