class FolderManager {
	constructor(folderListId) {
		this.folderList = document.getElementById(folderListId);
		this.carpetaAEliminar = null; // Para almacenar qué carpeta se va a eliminar
	}

	async crearCarpeta(nombre) {
		console.log("Intentando crear carpeta:", nombre);
		try {
			const res = await window.api.crearCarpeta(nombre);
			if (res.ok) {
				console.log("Carpeta creada exitosamente");
				this.cerrarModal();
				await this.mostrarCarpetas();
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en crearCarpeta:", error);
			alert("Error al crear carpeta: " + error.message);
		}
	}

	async eliminarCarpeta(nombre) {
		console.log("Intentando eliminar carpeta:", nombre);
		try {
			const res = await window.api.eliminarCarpeta(nombre);
			if (res.ok) {
				console.log("Carpeta eliminada exitosamente");
				this.cerrarModalEliminar();
				await this.mostrarCarpetas();
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en eliminarCarpeta:", error);
			alert("Error al eliminar carpeta: " + error.message);
		}
	}

	async mostrarCarpetas() {
		try {
			const res = await window.api.listarCarpetas();
			this.folderList.innerHTML = "";
			if (res.ok) {
				if (res.carpetas.length === 0) {
					this.folderList.innerHTML = "<li>No hay carpetas</li>";
				} else {
					res.carpetas.forEach((nombre) => {
						const li = document.createElement("li");
						li.className = "folder-item";

						// Crear el contenedor del nombre de la carpeta
						const nombreSpan = document.createElement("span");
						nombreSpan.textContent = nombre;

						// Crear el contenedor de botones de control
						const controlsDiv = document.createElement("div");
						controlsDiv.className = "controls-folders";

						// Botón de eliminar
						const btnEliminar = document.createElement("button");
						btnEliminar.innerHTML = "🗑️";
						btnEliminar.onclick = (e) => {
							e.stopPropagation(); // Evitar que se seleccione la carpeta
							this.abrirModalEliminar(nombre);
						};

						controlsDiv.appendChild(btnEliminar);
						li.appendChild(nombreSpan);
						li.appendChild(controlsDiv);
						this.folderList.appendChild(li);
					});
				}
			} else {
				this.folderList.innerHTML = `<li>Error: ${res.error}</li>`;
			}
		} catch (error) {
			console.error("Error en mostrarCarpetas:", error);
			this.folderList.innerHTML = `<li>Error: ${error.message}</li>`;
		}
	}

	abrirModal() {
		document.getElementById("modal").style.display = "block";
		document.getElementById("folder-name").value = "";
		document.getElementById("folder-name").focus();
	}

	cerrarModal() {
		document.getElementById("modal").style.display = "none";
	}

	abrirModalEliminar(nombreCarpeta) {
		this.carpetaAEliminar = nombreCarpeta;
		document.getElementById(
			"titulo-variable"
		).textContent = `¿Quieres eliminar la carpeta "${nombreCarpeta}"?`;
		document.getElementById("modal-delete").style.display = "block";
	}

	cerrarModalEliminar() {
		document.getElementById("modal-delete").style.display = "none";
		this.carpetaAEliminar = null;
	}

	bindEvents() {
		document.getElementById("create-folder").addEventListener("click", () => {
			console.log("Click en crear carpeta");
			this.abrirModal();
		});

		document.getElementById("close-modal").addEventListener("click", () => {
			this.cerrarModal();
		});

		document.getElementById("save-folder").addEventListener("click", async () => {
			const nombre = document.getElementById("folder-name").value.trim();
			console.log("Click en guardar, nombre:", nombre);
			if (!nombre) {
				alert("El nombre no puede estar vacío");
				return;
			}
			await this.crearCarpeta(nombre);
		});

		// Eventos para eliminar carpeta
		document.getElementById("delete-file").addEventListener("click", async () => {
			if (this.carpetaAEliminar) {
				await this.eliminarCarpeta(this.carpetaAEliminar);
			}
		});

		document
			.getElementById("close-modal-delete-file")
			.addEventListener("click", () => {
				this.cerrarModalEliminar();
			});

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				this.cerrarModal();
				this.cerrarModalEliminar();
			}
		});
	}
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM cargado");

	// Verificar que window.api existe
	if (typeof window.api === "undefined") {
		console.error("window.api no está disponible");
		return;
	}

	console.log("window.api disponible:", window.api);

	const folderManager = new FolderManager("folders");
	folderManager.bindEvents();
	folderManager.mostrarCarpetas();
});
