import { FolderManager } from "./FolderManager.js";
import { NotesManager } from "./NotesManager.js";
import { SearchManager } from "./SearchManager.js";
import { Shortcuts } from "./Shortcuts.js";

class App {
    constructor() {
        this.folderManager = null;
        this.notesManager = null;
        this._init();
    }

    _init() {
        if (typeof window.api === "undefined") {
            console.error("window.api no está disponible");
            return;
        }

        this.folderManager = new FolderManager("folders");
        this.notesManager = new NotesManager("file-list");
        this.searchManager = new SearchManager({
            folderManager: this.folderManager,
            notesManager: this.notesManager,
        });

        this._registrarEventosDOM();
        new Shortcuts({
            folderManager: this.folderManager,
            notesManager: this.notesManager,
            searchManager: this.searchManager,
            toggleSidebar: () => this._toggleSidebar(),
        });

        this.folderManager.mostrarCarpetas();
    }

    _registrarEventosDOM() {
        document.getElementById("create-folder").addEventListener("click", () => {
            console.log("Click en crear carpeta");
            this.folderManager.abrirModal();
        });

        document.getElementById("create-note").addEventListener("click", () => {
            console.log("Click en crear nota");
            this.notesManager.abrirModalCrearNota();
        });

        document.getElementById("save-note").addEventListener("click", async () => {
            const nombre = document.getElementById("note-name").value.trim();
            console.log("Click en guardar nota, nombre:", nombre);

            if (!this.notesManager.carpetaActual) {
                document.getElementById("error-message").style.display = "block";
                return;
            }

            if (!nombre) {
                alert("El nombre no puede estar vacío");
                return;
            }

            await this.notesManager.crearNota(this.notesManager.carpetaActual, nombre);
        });

        document
            .getElementById("close-modal-create-note")
            .addEventListener("click", () => {
                this.notesManager.cerrarModalCrearNota();
            });

        document.getElementById("close-modal").addEventListener("click", () => {
            this.folderManager.cerrarModal();
        });

        document.getElementById("close-modal-folder-rename").addEventListener("click", () => {
            this.folderManager.cerrarModalRenombrar();
        });

        document.getElementById("save-folder-rename").addEventListener("click", async () => {
            const nuevoNombre = document.getElementById("folder-new-name").value.trim();
            console.log("Click en renombrar carpeta, nuevo nombre:", nuevoNombre);

            if (!nuevoNombre) {
                alert("El nombre no puede estar vacío");
                return;
            }

            if (nuevoNombre === this.folderManager.carpetaARenombrar) {
                this.folderManager.cerrarModalRenombrar();
                return;
            }

            await this.folderManager.renombrarCarpeta(this.folderManager.carpetaARenombrar, nuevoNombre);
        });

        document.getElementById("save-folder").addEventListener("click", async () => {
            const nombre = document.getElementById("folder-name").value.trim();
            console.log("Click en guardar carpeta, nombre:", nombre);
            if (!nombre) {
                alert("El nombre no puede estar vacío");
                return;
            }
            await this.folderManager.crearCarpeta(nombre);
        });

        document.getElementById("delete-file").addEventListener("click", async () => {
            console.log("Click en eliminar");
            if (this.folderManager.carpetaAEliminar) {
                await this.folderManager.eliminarCarpeta(this.folderManager.carpetaAEliminar);
            } else if (this.notesManager.notaAEliminar && this.notesManager.carpetaActual) {
                await this.notesManager.eliminarNota();
            }
        });

        document
            .getElementById("close-modal-delete-file")
            .addEventListener("click", () => {
                this.folderManager.cerrarModalEliminar();
                this.notesManager.notaAEliminar = null;
                document.getElementById("modal-delete").style.display = "none";
            });

        const toggleAsideShow = document.getElementById("toggle-aside");
        const toggleAsideHide = document.getElementById("toggle-aside-hide");

        if (toggleAsideShow) {
            toggleAsideShow.addEventListener("click", () => this._mostrarSidebar());
        }

        if (toggleAsideHide) {
            toggleAsideHide.addEventListener("click", () => this._ocultarSidebar());
        }

        const searchButton = document.getElementById("search-button");
        if (searchButton) {
            searchButton.addEventListener("click", () => this.searchManager.abrir());
        }
    }

    _mostrarSidebar() {
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

    _ocultarSidebar() {
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

    _toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            if (sidebar.classList.contains("hidden")) {
                this._mostrarSidebar();
            } else {
                this._ocultarSidebar();
            }
        }
    }
}

export { App };
