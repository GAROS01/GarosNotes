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

class NotesManager {
	constructor(noteListId) {
		this.noteList = document.getElementById(noteListId);
		this.carpetaActual = null;
		this.notaActual = null;
		this.notaAEliminar = null;
		this.autoguardadoTimer = null;
		this.eventoTituloRegistrado = false; // Para evitar eventos duplicados
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

				// Actualizar estado ANTES de cargar el título
				this.notaActual = { carpeta: nombreCarpeta, nombre: nombreNota };

				// Cargar título
				document.getElementById("titulo-nota").value = nombreNota;

				// Inicializar Quill si no existe
				if (!window.quill) {
					this.inicializarQuill();
				}

				// Cargar contenido en Quill
				if (window.quill) {
					if (res.contenido.trim() === "") {
						window.quill.setText("");
					} else {
						try {
							const delta = JSON.parse(res.contenido);
							window.quill.setContents(delta);
						} catch (e) {
							window.quill.setText(res.contenido);
						}
					}
				}

				// Configurar autoguardado DESPUÉS de cargar todo
				this.configurarAutoguardado();

				// Forzar que Quill recalcule su tamaño después de un pequeño delay
				setTimeout(() => {
					if (window.quill) {
						window.quill.getModule("toolbar").container.style.display = "block";
						window.quill.focus();
					}
				}, 100);
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en abrirNota:", error);
			alert("Error al abrir nota: " + error.message);
		}
	}

	inicializarQuill() {
		console.log("=== INICIANDO QUILL CON SYNTAX: TRUE ===");

		// Verificar que highlight.js está disponible
		if (typeof hljs === "undefined") {
			console.error("❌ highlight.js NO está disponible");
			return;
		} else {
			console.log("✅ highlight.js está disponible");
		}

		// Verificar que Quill está disponible
		if (typeof Quill === "undefined") {
			console.error("❌ Quill NO está disponible");
			return;
		} else {
			console.log("✅ Quill está disponible");
		}

		// Configurar highlight.js
		hljs.configure({
			languages: [
				"javascript",
				"python",
				"java",
				"cpp",
				"html",
				"css",
				"json",
				"sql",
				"bash",
				"typescript",
				"php",
				"csharp",
			],
		});
		console.log("✅ highlight.js configurado");

		// Inicializar Quill con el módulo syntax: true según la documentación
		window.quill = new Quill("#editor-container", {
			theme: "snow",
			modules: {
				syntax: true, // ← Esta es la clave según la documentación
				toolbar: [
					[{ header: [1, 2, 3, 4, 5, 6, false] }],
					[{ font: [] }],
					[{ size: ["small", false, "large", "huge"] }],
					["bold", "italic", "underline", "strike"],
					[{ color: [] }, { background: [] }],
					[{ script: "sub" }, { script: "super" }],
					[{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
					[{ indent: "-1" }, { indent: "+1" }],
					[{ direction: "rtl" }],
					[{ align: [] }],
					["blockquote", "code-block"], // ← Botón para bloques de código
					["link", "image", "video"],
					["clean"],
				],
				history: {
					delay: 1000,
					maxStack: 50,
					userOnly: false,
				},
			},
			placeholder: "Escribe tu nota aquí...",
		});

		console.log("✅ Quill inicializado con syntax: true");
	}

	configurarAutoguardado() {
		if (!window.quill || !this.notaActual) return;

		// Limpiar timer anterior si existe
		if (this.autoguardadoTimer) {
			clearTimeout(this.autoguardadoTimer);
		}

		// Configurar eventos de autoguardado para Quill
		window.quill.on("text-change", () => {
			console.log("Cambio detectado en el editor");

			if (this.autoguardadoTimer) {
				clearTimeout(this.autoguardadoTimer);
			}

			this.autoguardadoTimer = setTimeout(() => {
				this.guardarNotaActual();
			}, 1000);
		});

		// Configurar evento del título SOLO una vez
		if (!this.eventoTituloRegistrado) {
			const tituloInput = document.getElementById("titulo-nota");

			tituloInput.addEventListener("input", () => {
				console.log("Cambio detectado en el título");

				if (this.autoguardadoTimer) {
					clearTimeout(this.autoguardadoTimer);
				}

				this.autoguardadoTimer = setTimeout(() => {
					this.renombrarNotaActual();
				}, 1500); // Un poco más de tiempo para renombrar
			});

			this.eventoTituloRegistrado = true;
			console.log("Evento de título registrado");
		}
	}

	async guardarNotaActual() {
		if (!this.notaActual || !window.quill) return;

		try {
			// Obtener contenido como Delta (formato JSON de Quill)
			const contenido = JSON.stringify(window.quill.getContents());

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

	// Eventos de notas
	document.getElementById("create-note").addEventListener("click", () => {
		console.log("Click en crear nota");
		notesManager.abrirModalCrearNota();
	});

	document.getElementById("save-note").addEventListener("click", async () => {
		const nombre = document.getElementById("note-name").value.trim();
		console.log("Click en guardar nota, nombre:", nombre);

		if (!notesManager.carpetaActual) {
			document.getElementById("error-message").style.display = "block";
			return;
		}

		if (!nombre) {
			alert("El nombre no puede estar vacío");
			return;
		}

		await notesManager.crearNota(notesManager.carpetaActual, nombre);
	});

	document
		.getElementById("close-modal-create-note")
		.addEventListener("click", () => {
			notesManager.cerrarModalCrearNota();
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

	// Eventos para toggle del sidebar
	const toggleAsideShow = document.getElementById("toggle-aside");
	const toggleAsideHide = document.getElementById("toggle-aside-hide");

	if (toggleAsideShow) {
		toggleAsideShow.addEventListener("click", mostrarSidebar);
	}

	if (toggleAsideHide) {
		toggleAsideHide.addEventListener("click", ocultarSidebar);
	}

	// Eventos de teclado
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			folderManager.cerrarModal();
			folderManager.cerrarModalEliminar();
			notesManager.cerrarModalCrearNota();
		}

		// Atajo de teclado para toggle sidebar: Ctrl + B
		if (e.ctrlKey && e.key === "b") {
			e.preventDefault();
			toggleSidebar();
		}
	});

	eventosRegistrados = true;
	console.log("Eventos registrados correctamente");
}

// Funciones para manejar el sidebar
function mostrarSidebar() {
	const sidebar = document.getElementById("sidebar");
	const toggleAside = document.getElementById("toggle-aside");
	const app = document.getElementById("app");

	if (sidebar && toggleAside && app) {
		sidebar.classList.remove("hidden");
		app.classList.remove("sidebar-hidden");
		toggleAside.style.display = "none";
		console.log("Sidebar mostrado");
	}
}

function ocultarSidebar() {
	const sidebar = document.getElementById("sidebar");
	const toggleAside = document.getElementById("toggle-aside");
	const app = document.getElementById("app");

	if (sidebar && toggleAside && app) {
		sidebar.classList.add("hidden");
		app.classList.add("sidebar-hidden");
		toggleAside.style.display = "flex";
		console.log("Sidebar ocultado");
	}
}

function toggleSidebar() {
	const sidebar = document.getElementById("sidebar");
	if (sidebar) {
		if (sidebar.classList.contains("hidden")) {
			mostrarSidebar();
		} else {
			ocultarSidebar();
		}
	}
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM cargado");

	// Esperar a que las librerías estén disponibles
	const esperarLibrerias = () => {
		return new Promise((resolve) => {
			const checkLibs = () => {
				if (typeof hljs !== "undefined" && typeof Quill !== "undefined") {
					console.log("✅ Todas las librerías están disponibles");
					resolve();
				} else {
					console.log("⏳ Esperando librerías...");
					setTimeout(checkLibs, 100);
				}
			};
			checkLibs();
		});
	};

	esperarLibrerias().then(() => {
		if (typeof window.api === "undefined") {
			console.error("window.api no está disponible");
			return;
		}

		// Crear instancias
		folderManager = new FolderManager("folders");
		notesManager = new NotesManager("file-list");

		// Resto de la inicialización...
		window.notesManager = notesManager;
		window.folderManager = folderManager;
		registrarEventos();
		folderManager.mostrarCarpetas();
	});
});
