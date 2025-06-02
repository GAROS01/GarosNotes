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
		console.log("=== ELIMINANDO CARPETA ===");
		console.log("Nombre de carpeta a eliminar:", nombre);

		try {
			const res = await window.api.eliminarCarpeta(nombre);
			console.log("Respuesta del API:", res);

			if (res.ok) {
				console.log("Carpeta eliminada exitosamente");
				this.cerrarModalEliminar();
				await this.mostrarCarpetas();

				// Si era la carpeta actual de notas, limpiar la vista
				if (window.notesManager && window.notesManager.carpetaActual === nombre) {
					window.notesManager.carpetaActual = null;
					window.notesManager.noteList.innerHTML = "<li>Selecciona una carpeta</li>";

					// Si había una nota abierta, cerrar el editor
					if (window.notesManager.notaActual) {
						document.getElementById("main").style.display = "none";
						document.getElementById("placeholder-message").style.display = "flex";
						window.notesManager.notaActual = null;
					}
				}
			} else {
				console.error("Error del servidor:", res.error);
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
							e.stopPropagation();
							this.abrirModalEliminar(nombre);
						};

						// Evento click para seleccionar carpeta
						li.onclick = () => {
							// Marcar como seleccionada
							document
								.querySelectorAll(".folder-item")
								.forEach((item) => item.classList.remove("selected"));
							li.classList.add("selected");

							// Mostrar notas de esta carpeta
							if (window.notesManager) {
								window.notesManager.mostrarNotasDeCarpeta(nombre);
							}
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
		console.log("=== ABRIENDO MODAL ELIMINAR CARPETA ===");
		console.log("Carpeta a eliminar:", nombreCarpeta);

		this.carpetaAEliminar = nombreCarpeta;

		// Actualizar el texto del modal
		const tituloElement = document.getElementById("titulo-variable");
		if (tituloElement) {
			tituloElement.textContent = `¿Quieres eliminar la carpeta "${nombreCarpeta}"?`;
		} else {
			// Si no existe el elemento titulo-variable, usar el título del modal
			const modalTitle = document.querySelector("#modal-delete h3");
			if (modalTitle) {
				modalTitle.textContent = `¿Quieres eliminar la carpeta "${nombreCarpeta}"?`;
			}
		}

		document.getElementById("modal-delete").style.display = "block";
		console.log("Modal abierto, carpetaAEliminar:", this.carpetaAEliminar);
	}

	cerrarModalEliminar() {
		console.log("=== CERRANDO MODAL ELIMINAR ===");
		document.getElementById("modal-delete").style.display = "none";
		this.carpetaAEliminar = null;
		console.log("Modal cerrado, carpetaAEliminar:", this.carpetaAEliminar);
	}
}

// Exportar la clase para usar en módulos
export { FolderManager };
