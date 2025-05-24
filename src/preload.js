const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload cargado correctamente");

contextBridge.exposeInMainWorld("api", {
	// Carpetas
	crearCarpeta: (nombreCarpeta) =>
		ipcRenderer.invoke("crear-carpeta", nombreCarpeta),
	listarCarpetas: () => ipcRenderer.invoke("listar-carpetas"),
	eliminarCarpeta: (nombreCarpeta) =>
		ipcRenderer.invoke("eliminar-carpeta", nombreCarpeta),

	// Notas (estas faltaban)
	crearNota: (nombreCarpeta, nombreNota, contenido) =>
		ipcRenderer.invoke("crear-nota", nombreCarpeta, nombreNota, contenido),
	listarNotas: (nombreCarpeta) =>
		ipcRenderer.invoke("listar-notas", nombreCarpeta),
	leerNota: (nombreCarpeta, nombreNota) =>
		ipcRenderer.invoke("leer-nota", nombreCarpeta, nombreNota),
	guardarNota: (nombreCarpeta, nombreNota, contenido) =>
		ipcRenderer.invoke("guardar-nota", nombreCarpeta, nombreNota, contenido),
	eliminarNota: (nombreCarpeta, nombreNota) =>
		ipcRenderer.invoke("eliminar-nota", nombreCarpeta, nombreNota),
});
