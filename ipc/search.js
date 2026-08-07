import { buscar, normalizar } from "./searchIndex.js";

export function registerSearchHandlers(ipcMain) {
    ipcMain.handle("buscar-notas", async (_event, consulta) => {
        const query = typeof consulta === "string" ? consulta.trim() : "";
        if (!query) return { ok: true, resultados: [] };

        try {
            // La búsqueda se resuelve contra el índice en memoria; solo se
            // releen del disco las notas cuyo timestamp haya cambiado.
            const resultados = await buscar(normalizar(query), 50);
            return { ok: true, resultados };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    });
}
