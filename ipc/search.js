import { readdir, readFile } from "fs/promises";
import { existeRuta } from "./fs-utils.js";
import { NOTES_BASE, folderPath, notePath } from "./paths.js";

// Extrae el texto plano de un Delta de Quill (JSON) para poder buscarlo.
function deltaToTexto(contenido) {
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

// Normaliza a minúsculas sin acentos (NFD + eliminación de marcas diacríticas)
function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Normaliza el texto en UNA sola pasada (una única llamada a normalize("NFD"))
// y devuelve también un mapa que relaciona cada índice del texto normalizado
// con su posición en el texto ORIGINAL: mapa[i] = índice original del
// carácter normalizado i. Evita re-normalizar carácter a carácter.
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
// de queryNorm en el texto original, insensible a mayúsculas y acentos.
function indiceEnOriginal(texto, queryNorm) {
    const { norm, mapa } = normalizarConMapa(texto);
    const idxNorm = norm.indexOf(queryNorm);
    if (idxNorm === -1) return -1;
    // mapa e índices de norm se construyen en la misma pasada, así que
    // mapa[idxNorm] siempre existe cuando indexOf encuentra la query.
    return mapa[idxNorm];
}

// Crea un snippet legible alrededor de la coincidencia
function crearSnippet(texto, idxOriginal, longitudConsulta = 1) {
    const ventana = 50;
    const inicio = Math.max(0, idxOriginal - ventana);
    const fin = Math.min(texto.length, idxOriginal + longitudConsulta + ventana);
    let snippet = texto.slice(inicio, fin).replace(/\s+/g, " ").trim();
    if (inicio > 0) snippet = "…" + snippet;
    if (fin < texto.length) snippet += "…";
    return snippet;
}

export function registerSearchHandlers(ipcMain) {
    ipcMain.handle("buscar-notas", async (_event, consulta) => {
        const query = typeof consulta === "string" ? consulta.trim() : "";
        if (!query) return { ok: true, resultados: [] };

        const queryNorm = normalizar(query);
        const resultados = [];
        const LIMITE = 50;

        try {
            if (!(await existeRuta(NOTES_BASE))) {
                return { ok: true, resultados };
            }

            const carpetas = (await readdir(NOTES_BASE, { withFileTypes: true }))
                .filter((dirent) => dirent.isDirectory())
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
                    let texto = "";
                    try {
                        const contenido = await readFile(notePath(carpeta, nota), "utf8");
                        texto = deltaToTexto(contenido);
                    } catch {
                        continue;
                    }

                    // Buscar primero en el contenido
                    let idxOriginal = indiceEnOriginal(texto, queryNorm);
                    let snippet = "";
                    if (idxOriginal !== -1) {
                        snippet = crearSnippet(texto, idxOriginal, query.length);
                    } else {
                        // Si no, buscar en el título de la nota
                        idxOriginal = indiceEnOriginal(nota, queryNorm);
                        if (idxOriginal !== -1) {
                            snippet = nota;
                        }
                    }

                    if (idxOriginal !== -1) {
                        resultados.push({ carpeta, nota, snippet, matchIndex: idxOriginal });
                        if (resultados.length >= LIMITE) break;
                    }
                }
                if (resultados.length >= LIMITE) break;
            }

            return { ok: true, resultados };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
