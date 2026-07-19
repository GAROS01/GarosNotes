import path from "path";
import os from "os";

const NOTES_BASE = path.join(os.homedir(), "Documents", "GarosNotes");

function folderPath(nombreCarpeta) {
    return path.join(NOTES_BASE, nombreCarpeta);
}

function notePath(nombreCarpeta, nombreNota) {
    return path.join(NOTES_BASE, nombreCarpeta, `${nombreNota}.txt`);
}

export { NOTES_BASE, folderPath, notePath };
