import path from "path";
import os from "os";

const NOTES_BASE = path.join(os.homedir(), "Documents", "GarosNotes");

// Papelera interna dentro de NOTES_BASE (oculta de las listas).
const PAPELERA = path.join(NOTES_BASE, ".papelera");
const PAPELERA_CARPETAS = path.join(PAPELERA, "carpetas");
const PAPELERA_NOTAS = path.join(PAPELERA, "notas");

function folderPath(nombreCarpeta) {
    return path.join(NOTES_BASE, nombreCarpeta);
}

function notePath(nombreCarpeta, nombreNota) {
    return path.join(NOTES_BASE, nombreCarpeta, `${nombreNota}.json`);
}

function papeleraCarpetasPath(nombreCarpeta) {
    return path.join(PAPELERA_CARPETAS, nombreCarpeta);
}

function papeleraNotasPath(nombreCarpeta, nombreNota) {
    return path.join(PAPELERA_NOTAS, nombreCarpeta, `${nombreNota}.json`);
}

export {
    NOTES_BASE,
    PAPELERA,
    PAPELERA_CARPETAS,
    PAPELERA_NOTAS,
    folderPath,
    notePath,
    papeleraCarpetasPath,
    papeleraNotasPath,
};
