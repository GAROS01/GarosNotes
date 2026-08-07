import { readdir, readFile, stat } from "fs/promises";
import { existeRuta } from "./fs-utils.js";
import { NOTES_BASE, folderPath, notePath } from "./paths.js";

// ============================================================================
// Utilidades de texto (compartidas con search.js)
// ============================================================================

// Extrae el texto plano de un Delta de Quill (JSON) para poder buscarlo.
export function deltaToTexto(contenido) {
    try {
        const delta = JSON.parse(contenido);
        const ops = Array.isArray(delta) ? delta : delta.ops;
        if (!Array.isArray(ops)) return "";
        return ops
            .map((op) => (typeof op.insert === "string" ? op.insert : " "))
            .join("");
    } catch {
        // Si no es JSON válido, se busca sobre el contenido crudo
        return typeof contenido === "string" ? contenido : "";
    }
}

// Normaliza a minúsculas sin acentos (NFD + eliminación de marcas diacríticas).
export function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Normaliza el texto en UNA sola pasada (una única llamada a normalize("NFD"))
// y devuelve también un mapa que relaciona cada índice del texto normalizado
// con su posición en el texto ORIGINAL: mapa[i] = índice original del
// carácter normalizado i.
function normalizarConMapa(texto) {
    const nfd = texto.normalize("NFD");
    let norm = "";
    const mapa = [];
    let idxOriginal = 0;
    for (let i = 0; i < nfd.length; i++) {
        const code = nfd.charCodeAt(i);
        // Saltar marcas diacríticas combinadas (pertenecen al carácter previo)
        if (code >= 0x0300 && code <= 0x036f) continue;
        norm += nfd[i].toLowerCase();
        mapa.push(idxOriginal);
        idxOriginal++;
    }
    return { norm, mapa };
}

// Localiza el índice (en el texto ORIGINAL) donde comienza la coincidencia
// de queryNorm, insensible a mayúsculas y acentos.
export function indiceEnOriginal(texto, queryNorm) {
    const { norm, mapa } = normalizarConMapa(texto);
    const idxNorm = norm.indexOf(queryNorm);
    if (idxNorm === -1) return -1;
    return mapa[idxNorm];
}

// Crea un snippet legible alrededor de la coincidencia.
export function crearSnippet(texto, idxOriginal, longitudConsulta = 1) {
    const ventana = 50;
    const inicio = Math.max(0, idxOriginal - ventana);
    const fin = Math.min(texto.length, idxOriginal + longitudConsulta + ventana);
    let snippet = texto.slice(inicio, fin).replace(/\s+/g, " ").trim();
    if (inicio > 0) snippet = "…" + snippet;
    if (fin < texto.length) snippet += "…";
    return snippet;
}

// ============================================================================
// Índice en memoria
// ============================================================================

// Mapa clave -> entrada. Cada entrada guarda los textos normalizados (para
// buscar sin releer el disco), el texto ORIGINAL (para construir el snippet y
// el matchIndex sin releer el archivo) y la fecha de modificación del archivo
// (para detectar cambios externos y reindexar solo lo necesario).
//
// Limitación conocida: el chequeo de timestamp solo cubre entradas ya
// indexadas. Archivos creados o renombrados FUERA de la app (p. ej. editando
// Documents/GarosNotes a mano) no entran en el índice hasta reiniciar.
//
//   clave:        `${carpeta}/${nota}`
//   entrada:      {
//                     carpeta,
//                     nota,
//                     texto,                // texto plano original
//                     textoNormalizado,     // normalizado (para las búsquedas)
//                     tituloNormalizado,    // nombre de la nota normalizado
//                     timestampModificacion // stat().mtimeMs al indexar
//                 }
const indice = new Map();
let construccionPromise = null;
let indiceListo = false;

function clave(carpeta, nota) {
    return `${carpeta}/${nota}`;
}

// Lee una nota del disco y (re)construye su entrada en el índice. Si el
// archivo ya no existe o no se puede leer, elimina la entrada.
async function indexarNota(carpeta, nota) {
    const ruta = notePath(carpeta, nota);
    try {
        const st = await stat(ruta);
        const contenido = await readFile(ruta, "utf8");
        const texto = deltaToTexto(contenido);
        indice.set(clave(carpeta, nota), {
            carpeta,
            nota,
            texto,
            textoNormalizado: normalizar(texto),
            tituloNormalizado: normalizar(nota),
            timestampModificacion: st.mtimeMs,
        });
    } catch {
        indice.delete(clave(carpeta, nota));
    }
}

// Construye el índice completo recorriendo NOTES_BASE una sola vez. Si ya hay
// una construcción en curso, devuelve la misma promesa (no se recorre dos veces).
export function construirIndice() {
    if (construccionPromise) return construccionPromise;

    construccionPromise = (async () => {
        indice.clear();
        try {
            if (!(await existeRuta(NOTES_BASE))) return;

            const carpetas = (await readdir(NOTES_BASE, { withFileTypes: true }))
                .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
                .map((dirent) => dirent.name);

            for (const carpeta of carpetas) {
                const carpetaRuta = folderPath(carpeta);
                let notas;
                try {
                    notas = (await readdir(carpetaRuta, { withFileTypes: true }))
                        .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
                        .map((dirent) => dirent.name.replace(/\.json$/, ""));
                } catch {
                    continue;
                }
                for (const nota of notas) {
                    await indexarNota(carpeta, nota);
                }
            }
            console.log(`Índice de búsqueda construido: ${indice.size} notas indexadas`);
            indiceListo = true;
        } catch (error) {
            // Si la construcción falla, se permite reintentar en la siguiente
            // búsqueda en lugar de dejar un índice parcial marcado como listo.
            construccionPromise = null;
            throw error;
        }
    })();

    return construccionPromise;
}

// Actualiza la entrada de una nota (crear-nota, guardar-nota).
export async function actualizarEntrada(carpeta, nota) {
    await indexarNota(carpeta, nota);
}

// Elimina la entrada de una nota (eliminar-nota).
export function eliminarEntrada(carpeta, nota) {
    indice.delete(clave(carpeta, nota));
}

// Reubica la entrada tras renombrar una nota (renombrar-nota).
export async function renombrarEntrada(carpeta, nombreViejo, nombreNuevo) {
    indice.delete(clave(carpeta, nombreViejo));
    await indexarNota(carpeta, nombreNuevo);
}

// Reindexa todas las notas de una carpeta (renombrar-carpeta, restaurar carpeta).
export async function reindexarCarpeta(carpeta) {
    const carpetaRuta = folderPath(carpeta);
    let notas;
    try {
        notas = (await readdir(carpetaRuta, { withFileTypes: true }))
            .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
            .map((dirent) => dirent.name.replace(/\.json$/, ""));
    } catch {
        return;
    }
    for (const nota of notas) {
        await indexarNota(carpeta, nota);
    }
}

// Elimina todas las entradas de una carpeta (eliminar-carpeta).
export function eliminarCarpetaEntradas(carpeta) {
    for (const [k, entrada] of [...indice.entries()]) {
        if (entrada.carpeta === carpeta) indice.delete(k);
    }
}

// Actualiza la carpeta de todas sus entradas tras renombrar una carpeta.
export async function renombrarCarpetaEntradas(carpetaVieja, carpetaNueva) {
    eliminarCarpetaEntradas(carpetaVieja);
    await reindexarCarpeta(carpetaNueva);
}

// Busca en el índice. Solo relee del disco las notas cuyo archivo cambió
// desde la última indexación (timestamp distinto) o que ya no existen.
export async function buscar(queryNorm, limite = 50) {
    if (!indiceListo) await construirIndice();

    const resultados = [];
    for (let entrada of indice.values()) {
        // 1) Frescura: comprobar con stat si el archivo cambió o desapareció
        const ruta = notePath(entrada.carpeta, entrada.nota);
        try {
            const st = await stat(ruta);
            if (st.mtimeMs !== entrada.timestampModificacion) {
                await indexarNota(entrada.carpeta, entrada.nota);
                const reindexada = indice.get(clave(entrada.carpeta, entrada.nota));
                if (!reindexada) continue;
                entrada = reindexada;
            }
        } catch {
            // El archivo ya no existe: eliminar la entrada del índice
            indice.delete(clave(entrada.carpeta, entrada.nota));
            continue;
        }

        // 2) Buscar primero en el contenido
        const idxNorm = entrada.textoNormalizado.indexOf(queryNorm);
        if (idxNorm !== -1) {
            const idxOriginal = indiceEnOriginal(entrada.texto, queryNorm);
            const snippet = crearSnippet(entrada.texto, idxOriginal, queryNorm.length);
            resultados.push({
                carpeta: entrada.carpeta,
                nota: entrada.nota,
                snippet,
                matchIndex: idxOriginal,
            });
        } else {
            // 3) Si no, buscar en el título de la nota
            const idxTitulo = entrada.tituloNormalizado.indexOf(queryNorm);
            if (idxTitulo !== -1) {
                resultados.push({
                    carpeta: entrada.carpeta,
                    nota: entrada.nota,
                    snippet: entrada.nota,
                    matchIndex: indiceEnOriginal(entrada.nota, queryNorm),
                });
            }
        }

        if (resultados.length >= limite) break;
    }
    return resultados;
}
