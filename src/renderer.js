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
}

class NotesManager {
	constructor(noteListId) {
		this.noteList = document.getElementById(noteListId);
		this.carpetaActual = null;
		this.notaActual = null;
		this.notaAEliminar = null;
	}

	async crearNota(nombreCarpeta, nombreNota) {
		console.log(
			"Intentando crear nota:",
			nombreNota,
			"en carpeta:",
			nombreCarpeta
		);
		try {
			const res = await window.api.crearNota(nombreCarpeta, nombreNota, "");
			if (res.ok) {
				console.log("Nota creada exitosamente");
				this.cerrarModalCrearNota();
				await this.mostrarNotasDeCarpeta(nombreCarpeta);
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en crearNota:", error);
			alert("Error al crear nota: " + error.message);
		}
	}

	async mostrarNotasDeCarpeta(nombreCarpeta) {
		this.carpetaActual = nombreCarpeta;
		try {
			const res = await window.api.listarNotas(nombreCarpeta);
			this.noteList.innerHTML = "";
			if (res.ok) {
				if (res.notas.length === 0) {
					this.noteList.innerHTML = "<li>No hay notas</li>";
				} else {
					res.notas.forEach((nombre) => {
						const li = document.createElement("li");
						li.className = "file-item";

						// Crear el contenedor del nombre de la nota
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
							this.abrirModalEliminarNota(nombre);
						};

						// Evento click para abrir nota
						li.onclick = () => {
							this.abrirNota(nombreCarpeta, nombre);
						};

						controlsDiv.appendChild(btnEliminar);
						li.appendChild(nombreSpan);
						li.appendChild(controlsDiv);
						this.noteList.appendChild(li);
					});
				}
			} else {
				this.noteList.innerHTML = `<li>Error: ${res.error}</li>`;
			}
		} catch (error) {
			console.error("Error en mostrarNotasDeCarpeta:", error);
			this.noteList.innerHTML = `<li>Error: ${error.message}</li>`;
		}
	}

	async abrirNota(nombreCarpeta, nombreNota) {
		console.log("Abriendo nota:", nombreNota, "de carpeta:", nombreCarpeta);
		try {
			const res = await window.api.leerNota(nombreCarpeta, nombreNota);
			if (res.ok) {
				// Ocultar placeholder y mostrar editor
				document.getElementById("placeholder-message").style.display = "none";
				document.getElementById("main").style.display = "flex";

				// Cargar contenido
				document.getElementById("titulo-nota").value = nombreNota;

				// Si usas Quill (editor enriquecido)
				if (window.quill) {
					window.quill.setText(res.contenido);
				}

				this.notaActual = { carpeta: nombreCarpeta, nombre: nombreNota };
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en abrirNota:", error);
			alert("Error al abrir nota: " + error.message);
		}
	}

	abrirModalCrearNota() {
		// Siempre abrir el modal
		document.getElementById("modal-create-note").style.display = "block";
		document.getElementById("note-name").value = "";

		if (!this.carpetaActual) {
			// Mostrar mensaje de error dentro del modal
			document.getElementById("error-message").style.display = "block";
			document.getElementById("note-name").disabled = true;
			document.getElementById("save-note").disabled = true;

			// Cambiar el placeholder para indicar el problema
			document.getElementById("note-name").placeholder =
				"Selecciona una carpeta primero";
		} else {
			// Ocultar mensaje de error y habilitar campos
			document.getElementById("error-message").style.display = "none";
			document.getElementById("note-name").disabled = false;
			document.getElementById("save-note").disabled = false;
			document.getElementById("note-name").placeholder = "Nombre de la nota";

			// Hacer focus en el input
			setTimeout(() => {
				document.getElementById("note-name").focus();
			}, 100);
		}
	}

	cerrarModalCrearNota() {
		document.getElementById("modal-create-note").style.display = "none";
		// Limpiar el estado del modal
		document.getElementById("error-message").style.display = "none";
		document.getElementById("note-name").disabled = false;
		document.getElementById("save-note").disabled = false;
		document.getElementById("note-name").placeholder = "Nombre de la nota";
		document.getElementById("note-name").value = "";
	}

	abrirModalEliminarNota(nombreNota) {
		this.notaAEliminar = nombreNota;
		document.getElementById(
			"titulo-variable"
		).textContent = `¿Quieres eliminar la nota "${nombreNota}"?`;
		document.getElementById("modal-delete").style.display = "block";
	}

	async eliminarNota() {
		if (this.notaAEliminar && this.carpetaActual) {
			try {
				const res = await window.api.eliminarNota(
					this.carpetaActual,
					this.notaAEliminar
				);
				if (res.ok) {
					console.log("Nota eliminada exitosamente");
					document.getElementById("modal-delete").style.display = "none";
					await this.mostrarNotasDeCarpeta(this.carpetaActual);

					// Si era la nota actual, cerrar editor
					if (this.notaActual && this.notaActual.nombre === this.notaAEliminar) {
						document.getElementById("main").style.display = "none";
						document.getElementById("placeholder-message").style.display = "flex";
						this.notaActual = null;
					}
				} else {
					alert("Error: " + res.error);
				}
			} catch (error) {
				console.error("Error en eliminarNota:", error);
				alert("Error al eliminar nota: " + error.message);
			}
		}
		this.notaAEliminar = null;
	}
}

// Variables globales para evitar múltiples instancias
let folderManager = null;
let notesManager = null;
let eventosRegistrados = false;

// Función para registrar eventos una sola vez
function registrarEventos() {
	if (eventosRegistrados) return;

	// Eventos de carpetas
	document.getElementById("create-folder").addEventListener("click", () => {
		console.log("Click en crear carpeta");
		folderManager.abrirModal();
	});

	document.getElementById("close-modal").addEventListener("click", () => {
		folderManager.cerrarModal();
	});

	document.getElementById("save-folder").addEventListener("click", async () => {
		const nombre = document.getElementById("folder-name").value.trim();
		console.log("Click en guardar carpeta, nombre:", nombre);
		if (!nombre) {
			alert("El nombre no puede estar vacío");
			return;
		}
		await folderManager.crearCarpeta(nombre);
	});

	// Eventos de notas
	document.getElementById("create-note").addEventListener("click", () => {
		console.log("Click en crear nota");
		notesManager.abrirModalCrearNota();
	});

	document
		.getElementById("close-modal-create-note")
		.addEventListener("click", () => {
			notesManager.cerrarModalCrearNota();
		});

	document.getElementById("save-note").addEventListener("click", async () => {
		const nombre = document.getElementById("note-name").value.trim();
		console.log("Click en guardar nota, nombre:", nombre);

		// Verificar si hay carpeta seleccionada
		if (!notesManager.carpetaActual) {
			// El botón debería estar deshabilitado, pero por si acaso
			document.getElementById("error-message").style.display = "block";
			return;
		}

		if (!nombre) {
			alert("El nombre no puede estar vacío");
			return;
		}

		await notesManager.crearNota(notesManager.carpetaActual, nombre);
	});

	// Eventos de eliminación
	document.getElementById("delete-file").addEventListener("click", async () => {
		console.log("Click en eliminar");
		if (folderManager.carpetaAEliminar) {
			await folderManager.eliminarCarpeta(folderManager.carpetaAEliminar);
		} else if (notesManager.notaAEliminar && notesManager.carpetaActual) {
			await notesManager.eliminarNota();
		}
	});

	document
		.getElementById("close-modal-delete-file")
		.addEventListener("click", () => {
			folderManager.cerrarModalEliminar();
			notesManager.notaAEliminar = null;
			document.getElementById("modal-delete").style.display = "none";
		});

	// Eventos de teclado
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			folderManager.cerrarModal();
			folderManager.cerrarModalEliminar();
			notesManager.cerrarModalCrearNota();
		}
	});

	eventosRegistrados = true;
	console.log("Eventos registrados correctamente");
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM cargado");

	if (typeof window.api === "undefined") {
		console.error("window.api no está disponible");
		return;
	}

	console.log("window.api disponible:", window.api);

	// Crear instancias una sola vez
	folderManager = new FolderManager("folders");
	notesManager = new NotesManager("file-list");

	// Hacer disponible globalmente
	window.notesManager = notesManager;
	window.folderManager = folderManager;

	// Registrar eventos una sola vez
	registrarEventos();

	// Mostrar carpetas iniciales
	folderManager.mostrarCarpetas();
});
