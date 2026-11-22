import path from "path";
import os from "os";

const NOTES_BASE = path.join(os.homedir(), "Documents", "GarosNotes");

// Archivo oculto con el estado de las notas fijadas (favoritos). Vive en la
// raíz de NOTES_BASE, así que nunca se lista ni se indexa como una nota.
const FAVORITOS = path.join(NOTES_BASE, ".favoritos.json");

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
    FAVORITOS,
    PAPELERA,
    PAPELERA_CARPETAS,
    PAPELERA_NOTAS,
    folderPath,
    notePath,
    papeleraCarpetasPath,
    papeleraNotasPath,
};
