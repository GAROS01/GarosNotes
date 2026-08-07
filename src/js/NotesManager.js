import { eventBus } from "./EventBus.js";
import { QuillEditor } from "./QuillEditor.js";
import { AutoSave } from "./AutoSave.js";

class NotesManager {
	constructor(noteListId) {
		this.noteList = document.getElementById(noteListId);
		this.carpetaActual = null;
		this.notaActual = null;
		this.notaAEliminar = null;
		this.quillEditor = new QuillEditor();
		this.autoSave = new AutoSave({
			quillEditor: this.quillEditor,
			onSave: () => this.guardarNotaActual(),
			onRename: () => this.renombrarNotaActual(),
		});
		this._initEventListeners();
	}

	_initEventListeners() {
		eventBus.on("folder:renamed", ({ oldName, newName }) => {
			if (this.carpetaActual === oldName) {
				this.carpetaActual = newName;
				if (this.notaActual) {
					this.notaActual.carpeta = newName;
				}
			}
		});

		eventBus.on("folder:deleted", ({ name }) => {
			if (this.carpetaActual === name) {
				this.carpetaActual = null;
				this.noteList.innerHTML = "<li>Selecciona una carpeta</li>";
				if (this.notaActual) {
					document.getElementById("main").style.display = "none";
					document.getElementById("placeholder-message").style.display = "flex";
					this.notaActual = null;
				}
			}
		});

		eventBus.on("folder:selected", ({ name }) => {
			this.mostrarNotasDeCarpeta(name);
		});
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

				// Actualizar la lista de notas
				await this.mostrarNotasDeCarpeta(nombreCarpeta);

				// Abrir automáticamente la nota recién creada
				console.log("Abriendo nota recién creada:", nombreNota);
				await this.abrirNota(nombreCarpeta, nombreNota);
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

				// Actualizar estado ANTES de cargar el título
				this.notaActual = { carpeta: nombreCarpeta, nombre: nombreNota };

				// Cargar título
				document.getElementById("titulo-nota").value = nombreNota;

				if (!this.quillEditor.editor) {
					this.quillEditor.init();
				}

				this.quillEditor.loadContent(res.contenido);
				this.autoSave.setup();
				this.quillEditor.focus();

				console.log("Nota abierta correctamente:", nombreNota);
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en abrirNota:", error);
			alert("Error al abrir nota: " + error.message);
		}
	}



	async guardarNotaActual() {
		if (!this.notaActual || !this.quillEditor.editor) return;

		try {
			const contenido = this.quillEditor.getContent();

			const res = await window.api.guardarNota(
				this.notaActual.carpeta,
				this.notaActual.nombre,
				contenido
			);

			if (res.ok) {
				console.log("Nota guardada automáticamente");
				// Opcional: mostrar indicador visual de guardado
				this.mostrarIndicadorGuardado();
			} else {
				console.error("Error al guardar nota:", res.error);
			}
		} catch (error) {
			console.error("Error en guardarNotaActual:", error);
		}
	}

	async renombrarNotaActual() {
		if (!this.notaActual) {
			console.log("No hay nota actual para renombrar");
			return;
		}

		const nuevoNombre = document.getElementById("titulo-nota").value.trim();
		console.log(
			"Intentando renombrar:",
			this.notaActual.nombre,
			"→",
			nuevoNombre
		);

		if (!nuevoNombre) {
			console.log("Nombre vacío, revirtiendo");
			document.getElementById("titulo-nota").value = this.notaActual.nombre;
			return;
		}

		if (nuevoNombre === this.notaActual.nombre) {
			console.log("El nombre no ha cambiado");
			return;
		}

		try {
			// Primero guardar el contenido actual
			await this.guardarNotaActual();

			// Luego renombrar el archivo
			const res = await window.api.renombrarNota(
				this.notaActual.carpeta,
				this.notaActual.nombre,
				nuevoNombre
			);

			if (res.ok) {
				console.log(
					"Nota renombrada correctamente de",
					this.notaActual.nombre,
					"a",
					nuevoNombre
				);

				// Actualizar el estado interno
				this.notaActual.nombre = nuevoNombre;

				// Actualizar la lista de notas
				await this.mostrarNotasDeCarpeta(this.notaActual.carpeta);

				// Mostrar indicador de guardado
				this.mostrarIndicadorGuardado("✓ Renombrado");
			} else {
				console.error("Error al renombrar nota:", res.error);
				alert("Error al renombrar: " + res.error);

				// Revertir el título si hay error
				document.getElementById("titulo-nota").value = this.notaActual.nombre;
			}
		} catch (error) {
			console.error("Error en renombrarNotaActual:", error);
			alert("Error al renombrar: " + error.message);

			// Revertir el título si hay error
			document.getElementById("titulo-nota").value = this.notaActual.nombre;
		}
	}

	async flush() {
		if (!this.notaActual || !this.quillEditor.editor) {
			console.log("Flush: no hay nota abierta, nada que guardar");
			return;
		}

		console.log("=== FLUSH ANTES DE CERRAR ===");

		// Ejecutar de inmediato el guardado/renombrado pendiente del autoguardado
		await this.autoSave.flush();

		// Garantizar el guardado del contenido actual
		await this.guardarNotaActual();

		// Si el título cambió y el autoguardado no lo renombró aún, renombrar
		const tituloActual = document.getElementById("titulo-nota").value.trim();
		if (tituloActual && tituloActual !== this.notaActual.nombre) {
			await this.renombrarNotaActual();
		}

		console.log("Flush completado");
	}

	mostrarIndicadorGuardado(mensaje = "✓ Guardado") {
		let indicador = document.getElementById("save-indicator");
		if (!indicador) {
			indicador = document.createElement("div");
			indicador.id = "save-indicator";
			indicador.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 9999;
                transition: opacity 0.3s;
            `;
			document.body.appendChild(indicador);
		}

		indicador.textContent = mensaje;
		indicador.style.opacity = "1";

		setTimeout(() => {
			indicador.style.opacity = "0";
		}, 2000);
	}

	async eliminarNota() {
		console.log("=== ELIMINANDO NOTA ===");
		console.log("Nota a eliminar:", this.notaAEliminar);
		console.log("Carpeta actual:", this.carpetaActual);

		if (this.notaAEliminar && this.carpetaActual) {
			try {
				const res = await window.api.eliminarNota(
					this.carpetaActual,
					this.notaAEliminar
				);
				console.log("Respuesta del API:", res);

				if (res.ok) {
					console.log("Nota eliminada exitosamente");
					document.getElementById("modal-delete").style.display = "none";
					await this.mostrarNotasDeCarpeta(this.carpetaActual);

					// Si era la nota actual, cerrar editor
					if (this.notaActual && this.notaActual.nombre === this.notaAEliminar) {
						document.getElementById("main").style.display = "none";
						document.getElementById("placeholder-message").style.display = "flex";
						this.notaActual = null;
						console.log("Editor cerrado porque se eliminó la nota actual");
					}
				} else {
					console.error("Error del servidor:", res.error);
					alert("Error: " + res.error);
				}
			} catch (error) {
				console.error("Error en eliminarNota:", error);
				alert("Error al eliminar nota: " + error.message);
			}
		} else {
			console.log("No se puede eliminar: notaAEliminar o carpetaActual faltantes");
		}
		this.notaAEliminar = null;
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
		console.log("=== ABRIENDO MODAL ELIMINAR NOTA ===");
		console.log("Nota a eliminar:", nombreNota);

		this.notaAEliminar = nombreNota;

		// Actualizar el texto del modal
		const tituloElement = document.getElementById("titulo-variable");
		if (tituloElement) {
			tituloElement.textContent = `¿Quieres eliminar la nota "${nombreNota}"?`;
		} else {
			// Si no existe el elemento titulo-variable, usar el título del modal
			const modalTitle = document.querySelector("#modal-delete h3");
			if (modalTitle) {
				modalTitle.textContent = `¿Quieres eliminar la nota "${nombreNota}"?`;
			}
		}

		document.getElementById("modal-delete").style.display = "block";
		console.log("Modal abierto, notaAEliminar:", this.notaAEliminar);
	}
}

// Exportar la clase para usar en módulos
export { NotesManager };

