const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload cargado correctamente");

contextBridge.exposeInMainWorld("api", {
	crearCarpeta: (nombreCarpeta) =>
		ipcRenderer.invoke("crear-carpeta", nombreCarpeta),
	listarCarpetas: () => ipcRenderer.invoke("listar-carpetas"),
});
