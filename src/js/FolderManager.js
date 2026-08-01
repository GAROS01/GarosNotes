import { eventBus } from "./EventBus.js";

class FolderManager {
	constructor(folderListId) {
		this.folderList = document.getElementById(folderListId);
		this.carpetaAEliminar = null; // Para almacenar qué carpeta se va a eliminar
		this.carpetaARenombrar = null; // Nueva propiedad
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

	async renombrarCarpeta(nombreViejo, nombreNuevo) {
		console.log("Intentando renombrar carpeta:", nombreViejo, "→", nombreNuevo);
		try {
			const res = await window.api.renombrarCarpeta(nombreViejo, nombreNuevo);
			if (res.ok) {
				console.log("Carpeta renombrada exitosamente");
				this.cerrarModalRenombrar();
				await this.mostrarCarpetas();

				eventBus.emit("folder:renamed", { oldName: nombreViejo, newName: nombreNuevo });
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en renombrarCarpeta:", error);
			alert("Error al renombrar carpeta: " + error.message);
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

				eventBus.emit("folder:deleted", { name: nombre });
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

						// Botón de renombrar
						const btnRenombrar = document.createElement("button");
						btnRenombrar.innerHTML = "✏️";
						btnRenombrar.title = "Renombrar carpeta";
						btnRenombrar.onclick = (e) => {
							e.stopPropagation();
							this.abrirModalRenombrar(nombre);
						};

						// Botón de eliminar
						const btnEliminar = document.createElement("button");
						btnEliminar.innerHTML = "🗑️";
						btnEliminar.title = "Eliminar carpeta";
						btnEliminar.onclick = (e) => {
							e.stopPropagation();
							this.abrirModalEliminar(nombre);
						};

					// Guardar el nombre en un atributo data para localizarlo luego
					li.dataset.nombre = nombre;

					// Evento click para seleccionar carpeta
					li.onclick = () => this.seleccionarCarpeta(nombre);

						controlsDiv.appendChild(btnRenombrar);
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

	seleccionarCarpeta(nombre) {
		// Marcar como seleccionada
		document
			.querySelectorAll(".folder-item")
			.forEach((item) => item.classList.remove("selected"));

		const li = [...this.folderList.children].find(
			(item) => item.dataset.nombre === nombre
		);
		if (li) li.classList.add("selected");

		eventBus.emit("folder:selected", { name: nombre });
	}

	abrirModal() {
		document.getElementById("modal").style.display = "block";
		document.getElementById("folder-name").value = "";
		document.getElementById("folder-name").focus();
	}

	cerrarModal() {
		document.getElementById("modal").style.display = "none";
	}

	abrirModalRenombrar(nombreCarpeta) {
		console.log("=== ABRIENDO MODAL RENOMBRAR CARPETA ===");
		console.log("Carpeta a renombrar:", nombreCarpeta);

		this.carpetaARenombrar = nombreCarpeta;
		document.getElementById("modal-rename").style.display = "block";
		document.getElementById("folder-new-name").value = nombreCarpeta;
		
		// Hacer focus y seleccionar todo el texto
		setTimeout(() => {
			const input = document.getElementById("folder-new-name");
			input.focus();
			input.select();
		}, 100);
	}

	cerrarModalRenombrar() {
		console.log("=== CERRANDO MODAL RENOMBRAR ===");
		document.getElementById("modal-rename").style.display = "none";
		this.carpetaARenombrar = null;
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
