class Shortcuts {
    constructor({ folderManager, notesManager, searchManager, trashManager, toggleSidebar }) {
        this.folderManager = folderManager;
        this.notesManager = notesManager;
        this.searchManager = searchManager;
        this.trashManager = trashManager;
        this.toggleSidebar = toggleSidebar;
        this._init();
    }

    _init() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.folderManager.cerrarModal();
                this.folderManager.cerrarModalEliminar();
                this.folderManager.cerrarModalRenombrar();
                this.notesManager.cerrarModalCrearNota();
                if (this.searchManager) this.searchManager.cerrar();
                if (this.trashManager) this.trashManager.cerrar();
            }

            if (e.ctrlKey && (e.key === "f" || e.key === "F")) {
                e.preventDefault();
                if (this.searchManager) this.searchManager.abrir();
            }

            if (e.ctrlKey && e.key === "b") {
                e.preventDefault();
                this.toggleSidebar();
            }
        });

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
    }
}

export { Shortcuts };
