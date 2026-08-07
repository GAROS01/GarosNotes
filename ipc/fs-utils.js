import { access } from "fs/promises";

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
