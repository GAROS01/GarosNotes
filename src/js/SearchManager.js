class SearchManager {
    constructor({ folderManager, notesManager }) {
        this.folderManager = folderManager;
        this.notesManager = notesManager;
        this.modal = document.getElementById("modal-search");
        this.input = document.getElementById("search-input");
        this.resultsList = document.getElementById("search-results");
        this.timer = null;
        this._init();
    }

    _init() {
        document
            .getElementById("close-modal-search")
            .addEventListener("click", () => this.cerrar());

        this.input.addEventListener("input", () => {
            clearTimeout(this.timer);
            const consulta = this.input.value.trim();
            if (!consulta) {
                this._limpiarResultados();
                return;
            }
            this.timer = setTimeout(() => this._buscar(consulta), 250);
        });

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const primero = this.resultsList.querySelector("li.search-result");
                if (primero) primero.click();
            }
        });
    }

    abrir() {
        this.modal.style.display = "block";
        this.input.value = "";
        this._limpiarResultados();
        setTimeout(() => this.input.focus(), 50);
    }

    cerrar() {
        clearTimeout(this.timer);
        this.modal.style.display = "none";
        this.input.value = "";
        this._limpiarResultados();
    }

    _limpiarResultados() {
        this.resultsList.innerHTML = "";
    }

    _mostrarMensaje(mensaje) {
        this._limpiarResultados();
        const li = document.createElement("li");
        li.className = "search-empty";
        li.textContent = mensaje;
        this.resultsList.appendChild(li);
    }

    async _buscar(consulta) {
        try {
            const res = await window.api.buscarNotas(consulta);
            if (res.ok) {
                this._renderizar(res.resultados, consulta);
            } else {
                this._mostrarMensaje("Error: " + res.error);
            }
        } catch (error) {
            console.error("Error en búsqueda:", error);
            this._mostrarMensaje("Error al buscar: " + error.message);
        }
    }

    _renderizar(resultados, consulta) {
        this._limpiarResultados();
        if (!resultados || resultados.length === 0) {
            this._mostrarMensaje("Sin resultados para \"" + consulta + "\"");
            return;
        }

        resultados.forEach((r) => {
            const li = document.createElement("li");
            li.className = "search-result";
            li.setAttribute("role", "option");

            const titulo = document.createElement("div");
            titulo.className = "search-result-titulo";
            this._resaltar(titulo, r.nota, consulta);

            const snippet = document.createElement("div");
            snippet.className = "search-result-snippet";
            this._resaltar(snippet, r.snippet, consulta);

            const meta = document.createElement("div");
            meta.className = "search-result-meta";
            meta.textContent = "📁 " + r.carpeta;

            li.appendChild(titulo);
            li.appendChild(snippet);
            li.appendChild(meta);

            li.addEventListener("click", () => this._abrirResultado(r));
            this.resultsList.appendChild(li);
        });
    }

    // Añade el texto con <mark> en las coincidencias usando textContent (sin HTML inseguro)
    _resaltar(contenedor, texto, consulta) {
        if (!texto) {
            contenedor.textContent = "";
            return;
        }

        const qNorm = this._normalizar(consulta);
        if (!qNorm) {
            contenedor.textContent = texto;
            return;
        }
        const idxNorm = this._normalizar(texto).indexOf(qNorm);
        if (idxNorm === -1) {
            contenedor.textContent = texto;
            return;
        }

        // Mapear índice normalizado -> índices del texto original
        let inicio = -1;
        let fin = texto.length;
        let mapaIdx = 0;
        for (let i = 0; i < texto.length; i++) {
            if (this._normalizar(texto[i]) === "") continue;
            if (mapaIdx === idxNorm) inicio = i;
            if (mapaIdx === idxNorm + qNorm.length) {
                fin = i;
                break;
            }
            mapaIdx++;
        }
        if (inicio === -1) {
            contenedor.textContent = texto;
            return;
        }

        contenedor.appendChild(document.createTextNode(texto.slice(0, inicio)));
        const mark = document.createElement("mark");
        mark.textContent = texto.slice(inicio, fin);
        contenedor.appendChild(mark);
        contenedor.appendChild(document.createTextNode(texto.slice(fin)));
    }

    _normalizar(texto) {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    async _abrirResultado(r) {
        this.cerrar();
        this.folderManager.seleccionarCarpeta(r.carpeta);
        await this.notesManager.abrirNota(r.carpeta, r.nota);
    }
}

export { SearchManager };
