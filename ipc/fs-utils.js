import path from "path";
import { access, mkdir, rename } from "fs/promises";
import { folderPath, notePath, papeleraCarpetasPath, papeleraNotasPath } from "./paths.js";

// Comprueba si una ruta existe de forma asíncrona (sin bloquear el proceso
// principal). access() lanza si la ruta no existe; aquí se traduce a boolean.
export async function existeRuta(ruta) {
    try {
        await access(ruta);
        return true;
    } catch {
        return false;
    }
}

// Mueve un elemento (carpeta o nota) a la papelera dentro de NOTES_BASE.
// Para carpetas:  .papelera/carpetas/<nombre>
// Para notas:     .papelera/notas/<carpetaOrigen>/<nombre>.json
// Devuelve la ruta de destino en la papelera.
export async function moverAPapelera(tipo, nombre, carpetaOrigen) {
    const origen = tipo === "carpeta" ? folderPath(nombre) : notePath(carpetaOrigen, nombre);
    const destino =
        tipo === "carpeta"
            ? papeleraCarpetasPath(nombre)
            : papeleraNotasPath(carpetaOrigen, nombre);

    // Asegurar que existe el directorio de destino dentro de la papelera
    await mkdir(path.dirname(destino), { recursive: true });

    if (await existeRuta(destino)) {
        throw new Error("Ya existe un elemento con ese nombre en la papelera");
    }

    await rename(origen, destino);
    return destino;
}
