import { FolderManager } from "./js/FolderManager.js";
import { NotesManager } from "./js/NotesManager.js";

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

    // Eventos del modal de renombrar carpeta
    document.getElementById("close-modal-folder-rename").addEventListener("click", () => {
        folderManager.cerrarModalRenombrar();
    });

    document.getElementById("save-folder-rename").addEventListener("click", async () => {
        const nuevoNombre = document.getElementById("folder-new-name").value.trim();
        console.log("Click en renombrar carpeta, nuevo nombre:", nuevoNombre);
        
        if (!nuevoNombre) {
            alert("El nombre no puede estar vacío");
            return;
        }

        if (nuevoNombre === folderManager.carpetaARenombrar) {
            folderManager.cerrarModalRenombrar();
            return;
        }

        await folderManager.renombrarCarpeta(folderManager.carpetaARenombrar, nuevoNombre);
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
            folderManager.cerrarModalRenombrar(); // Nuevo
            notesManager.cerrarModalCrearNota();
        }

        // Atajo de teclado para toggle sidebar: Ctrl + B
        if (e.ctrlKey && e.key === "b") {
            e.preventDefault();
            toggleSidebar();
        }
    });

    // Eventos Enter para los modales
    document.getElementById("folder-name").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("save-folder").click();
        }
    });

    document.getElementById("folder-new-name").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("save-folder-rename").click();
        }
    });

    document.getElementById("note-name").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("save-note").click();
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
