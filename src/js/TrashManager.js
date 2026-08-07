class TrashManager {
    constructor({ folderManager, notesManager }) {
        this.folderManager = folderManager;
        this.notesManager = notesManager;
        this.modal = document.getElementById("modal-trash");
        this.lista = document.getElementById("trash-list");
        this._init();
    }

    _init() {
        document
            .getElementById("close-modal-trash")
            .addEventListener("click", () => this.cerrar());

        document
            .getElementById("vaciar-papelera")
            .addEventListener("click", () => this._vaciar());
    }

    async abrir() {
        if (this.modal.style.display === "block") return; // evitar doble apertura
        this.modal.style.display = "block";
        await this._cargar();
    }

    cerrar() {
        this.modal.style.display = "none";
    }

    async _cargar() {
        this.lista.innerHTML = "";
        try {
            const res = await window.api.listarPapelera();
            if (!res.ok) {
                this._mostrarVacio("Error: " + res.error);
                return;
            }

            const { carpetas, notas } = res;
            if (carpetas.length === 0 && notas.length === 0) {
                this._mostrarVacio("La papelera está vacía");
                return;
            }

            carpetas.forEach((nombre) => this._renderCarpeta(nombre));
            notas.forEach(({ carpeta, nota }) => this._renderNota(carpeta, nota));
        } catch (error) {
            console.error("Error al cargar la papelera:", error);
            this._mostrarVacio("Error al cargar la papelera");
        }
    }

    _mostrarVacio(mensaje) {
        const li = document.createElement("li");
        li.className = "trash-empty";
        li.textContent = mensaje;
        this.lista.appendChild(li);
    }

    _renderCarpeta(nombre) {
        const li = this._crearItemBase(nombre, "📁", "Carpeta", () =>
            this._restaurar("carpeta", nombre)
        );
        this.lista.appendChild(li);
    }

    _renderNota(carpeta, nota) {
        const li = this._crearItemBase(nota, "📝", `Nota de "${carpeta}"`, () =>
            this._restaurar("nota", nota, carpeta)
        );
        this.lista.appendChild(li);
    }

    _crearItemBase(nombre, icono, meta, onRestaurar) {
        const li = document.createElement("li");
        li.className = "trash-item";

        const info = document.createElement("div");
        info.className = "trash-item-info";

        const nombreDiv = document.createElement("div");
        nombreDiv.className = "trash-item-nombre";
        nombreDiv.textContent = `${icono} ${nombre}`;

        const metaDiv = document.createElement("div");
        metaDiv.className = "trash-item-meta";
        metaDiv.textContent = meta;

        const btn = document.createElement("button");
        btn.className = "restaurar-btn";
        btn.textContent = "♻️ Restaurar";
        btn.title = "Restaurar este elemento";
        btn.addEventListener("click", onRestaurar);

        info.appendChild(nombreDiv);
        info.appendChild(metaDiv);
        li.appendChild(info);
        li.appendChild(btn);
        return li;
    }

    async _restaurar(tipo, nombre, carpetaOrigen) {
        try {
            const res = await window.api.restaurarElemento(tipo, nombre, carpetaOrigen);
            if (res.ok) {
                await this._cargar();
                this._refrescarVistas();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Error al restaurar:", error);
            alert("Error al restaurar: " + error.message);
        }
    }

    async _vaciar() {
        const confirmar = confirm(
            "¿Vaciar la papelera? Todos los elementos se eliminarán definitivamente."
        );
        if (!confirmar) return;

        try {
            const res = await window.api.vaciarPapelera();
            if (res.ok) {
                await this._cargar();
                this._refrescarVistas();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Error al vaciar la papelera:", error);
            alert("Error al vaciar la papelera: " + error.message);
        }
    }

    // Refresca las listas del sidebar tras restaurar o vaciar
    _refrescarVistas() {
        if (this.folderManager) this.folderManager.mostrarCarpetas();
        if (this.notesManager && this.notesManager.carpetaActual) {
            this.notesManager.mostrarNotasDeCarpeta(this.notesManager.carpetaActual);
        }
    }
}

export { TrashManager };
