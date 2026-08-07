// Caracteres que Windows no permite en nombres de archivo o carpeta.
// Incluye los separadores de ruta (para impedir path traversal), los
// caracteres reservados de Windows y los caracteres de control (C0 + DEL).
const CARACTERES_INVALIDOS = /[\/\\:*?"<>|\u0000-\u001F\u007F]/;

// Nombres reservados de Windows. Windows los rechaza también con extensión
// (p. ej. "CON.json"), por eso la comprobación se hace sobre la parte base
// del nombre (antes del primer punto).
const NOMBRES_RESERVADOS = new Set([
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

const LONGITUD_MAXIMA = 100;

/**
 * Valida un nombre de carpeta o nota según las reglas de nombres de Windows.
 *
 * @param {string} nombre - Nombre a validar.
 * @param {"carpeta" | "nota"} tipo - Tipo de elemento que se está validando.
 * @returns {{ ok: boolean, error: string | null }}
 */
export function validarNombre(nombre, tipo) {
    const etiqueta = tipo === "carpeta" ? "La carpeta" : "La nota";

    if (typeof nombre !== "string") {
        return { ok: false, error: `${etiqueta} debe tener un nombre válido` };
    }

    // Las reglas se evalúan sobre el nombre recortado (sin espacios laterales).
    const nombreRecortado = nombre.trim();

    if (nombreRecortado.length === 0) {
        return { ok: false, error: `${etiqueta} no puede estar vacía` };
    }

    if (nombreRecortado.length > LONGITUD_MAXIMA) {
        return {
            ok: false,
            error: `${etiqueta} no puede superar los ${LONGITUD_MAXIMA} caracteres`,
        };
    }

    if (CARACTERES_INVALIDOS.test(nombreRecortado)) {
        return {
            ok: false,
            error: `${etiqueta} contiene caracteres no permitidos (/ \\ : * ? " < > |)`,
        };
    }

    // Windows no permite espacios al inicio o al final. Se comprueba sobre el
    // nombre ORIGINAL: un nombre con espacios laterales se rechaza en lugar de
    // recortarse silenciosamente.
    if (nombre.startsWith(" ") || nombre.endsWith(" ")) {
        return {
            ok: false,
            error: `${etiqueta} no puede empezar ni terminar con espacios`,
        };
    }

    // Impide path traversal: nombres compuestos únicamente por puntos
    // (".", "..", "...") serían un intento de subir de directorio.
    if (/^\.+$/.test(nombreRecortado)) {
        return {
            ok: false,
            error: `${etiqueta} no puede ser solo puntos`,
        };
    }

    // Windows tampoco permite puntos al inicio o al final del nombre.
    if (nombreRecortado.startsWith(".") || nombreRecortado.endsWith(".")) {
        return {
            ok: false,
            error: `${etiqueta} no puede empezar ni terminar con punto`,
        };
    }

    // Nombres reservados de Windows (insensibles a mayúsculas). Se evalúa la
    // parte base (antes del primer punto) porque Windows los rechaza aunque
    // tengan extensión.
    const base = nombreRecortado.split(".")[0];
    if (NOMBRES_RESERVADOS.has(base.toUpperCase())) {
        return {
            ok: false,
            error: `${etiqueta} usa un nombre reservado de Windows`,
        };
    }

    return { ok: true, error: null };
}
