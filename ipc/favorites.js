import { mkdir, readFile, writeFile } from "fs/promises";
import { FAVORITOS, NOTES_BASE } from "./paths.js";
import { validarNombre } from "./validate.js";

// El estado de las notas fijadas se guarda en un único archivo oculto en la
// raíz de NOTES_BASE: Documents/GarosNotes/.favoritos.json
//
// Formato: { "Carpeta/Nota": true }
//
// La clave usa "/" como separador; los nombres de carpetas y notas no pueden
// contener ese carácter (ver validate.js), así que es inequívoca. Al empezar
// por punto, el archivo no aparece en ningún listado.

// Devuelve el objeto de error de validación o null si el nombre es válido.
function validarOError(nombre, tipo) {
    const validacion = validarNombre(nombre, tipo);
    return validacion.ok ? null : { ok: false, error: `Nombre no válido: ${validacion.error}` };
}

function clave(carpeta, nota) {
    return `${carpeta}/${nota}`;
}

// Lee el mapa de favoritos. Un archivo inexistente o corrupto se trata como
// "sin favoritos" en lugar de romper la app.
async function leerMapa() {
    try {
        const contenido = await readFile(FAVORITOS, "utf8");
        const datos = JSON.parse(contenido);
        if (datos && typeof datos === "object" && !Array.isArray(datos)) {
            return datos;
        }
        return {};
    } catch {
        return {};
    }
}

async function guardarMapa(mapa) {
    await mkdir(NOTES_BASE, { recursive: true });
    await writeFile(FAVORITOS, JSON.stringify(mapa, null, 2), "utf8");
}

// Nombres de las notas fijadas dentro de una carpeta.
export async function listarFavoritosDeCarpeta(carpeta) {
    const mapa = await leerMapa();
    const prefijo = `${carpeta}/`;
    return Object.keys(mapa)
        .filter((k) => mapa[k] && k.startsWith(prefijo))
        .map((k) => k.slice(prefijo.length));
}

// Alterna el estado de favorito de una nota. Devuelve el estado resultante.
export async function alternarFavorito(carpeta, nota) {
    const mapa = await leerMapa();
    const k = clave(carpeta, nota);
    const favorito = !mapa[k];
    if (favorito) {
        mapa[k] = true;
    } else {
        delete mapa[k];
    }
    await guardarMapa(mapa);
    return favorito;
}

// Mantiene el estado al renombrar una nota. Es tolerante a fallos: si no se
// puede persistir, la operación principal (el renombrado) no debe fallar.
export async function renombrarFavorito(carpeta, nombreViejo, nombreNuevo) {
    try {
        const mapa = await leerMapa();
        const claveVieja = clave(carpeta, nombreViejo);
        if (!mapa[claveVieja]) return;

        delete mapa[claveVieja];
        mapa[clave(carpeta, nombreNuevo)] = true;
        await guardarMapa(mapa);
    } catch (error) {
        console.warn("No se pudo actualizar el estado de favoritos:", error.message);
    }
}

// Mantiene el estado al renombrar una carpeta (también tolerante a fallos).
export async function renombrarCarpetaFavoritos(carpetaVieja, carpetaNueva) {
    try {
        const mapa = await leerMapa();
        const prefijoViejo = `${carpetaVieja}/`;
        let cambiado = false;
        const nuevoMapa = {};

        for (const [k, valor] of Object.entries(mapa)) {
            if (k.startsWith(prefijoViejo)) {
                nuevoMapa[`${carpetaNueva}/${k.slice(prefijoViejo.length)}`] = valor;
                cambiado = true;
            } else {
                nuevoMapa[k] = valor;
            }
        }

        if (cambiado) await guardarMapa(nuevoMapa);
    } catch (error) {
        console.warn("No se pudo actualizar el estado de favoritos:", error.message);
    }
}

export function registerFavoriteHandlers(ipcMain) {
    ipcMain.handle("listar-favoritos", async (_event, nombreCarpeta) => {
        const invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;

        try {
            const favoritos = await listarFavoritosDeCarpeta(nombreCarpeta);
            return { ok: true, favoritos };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });

    ipcMain.handle("alternar-favorito", async (_event, nombreCarpeta, nombreNota) => {
        let invalido = validarOError(nombreCarpeta, "carpeta");
        if (invalido) return invalido;
        invalido = validarOError(nombreNota, "nota");
        if (invalido) return invalido;

        try {
            const favorito = await alternarFavorito(nombreCarpeta, nombreNota);
            return { ok: true, favorito };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
