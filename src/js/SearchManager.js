class SearchManager {
    constructor({ folderManager, notesManager }) {
        this.folderManager = folderManager;
        this.notesManager = notesManager;
        this.modal = document.getElementById("modal-search");
        this.input = document.getElementById("search-input");
        this.resultsList = document.getElementById("search-results");
        this.timer = null;
        // Contador de peticiones: cada búsqueda nueva incrementa el contador y
        // las respuestas de peticiones antiguas se descartan si su id ya no
        // coincide, evitando que una búsqueda vieja pise a una más reciente.
        this.contadorPeticion = 0;
        this.indiceSeleccionado = -1;
        this._init();
    }

    _init() {
        document
            .getElementById("close-modal-search")
            .addEventListener("click", () => this.cerrar());

        this.input.addEventListener("input", () => {
            clearTimeout(this.timer);
            // Invalidar cualquier petición en vuelo en cuanto cambia el input,
            // incluso durante la ventana de debounce: así una respuesta de la
            // consulta anterior nunca se renderiza con un input más reciente.
            this.contadorPeticion++;
            const consulta = this.input.value.trim();
            if (!consulta) {
                this._limpiarResultados();
                return;
            }
            this.timer = setTimeout(() => this._buscar(consulta), 250);
        });

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this._moverSeleccion(1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this._moverSeleccion(-1);
            } else if (e.key === "Enter") {
                e.preventDefault();
                this._abrirSeleccionado();
            }
        });
    }

    abrir() {
        this.contadorPeticion++; // invalidar peticiones en vuelo de un uso anterior
        this.modal.style.display = "block";
        this.input.value = "";
        this._limpiarResultados();
        setTimeout(() => this.input.focus(), 50);
    }

    cerrar() {
        clearTimeout(this.timer);
        this.contadorPeticion++; // descartar respuestas que lleguen tras cerrar
        this.modal.style.display = "none";
        this.input.value = "";
        this._limpiarResultados();
    }

    _limpiarResultados() {
        this.indiceSeleccionado = -1;
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
        // Registrar esta petición como la más reciente; las que lleven un id
        // anterior se descartan al resolver para evitar carreras.
        const idPeticion = ++this.contadorPeticion;
        try {
            const res = await window.api.buscarNotas(consulta);
            if (idPeticion !== this.contadorPeticion) return; // respuesta antigua
            if (res.ok) {
                this._renderizar(res.resultados, consulta);
            } else {
                this._mostrarMensaje("Error: " + res.error);
            }
        } catch (error) {
            if (idPeticion !== this.contadorPeticion) return;
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

        resultados.forEach((r, i) => {
            const li = document.createElement("li");
            li.className = "search-result";
            li.setAttribute("role", "option");
            li.setAttribute("aria-selected", "false");

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
            li.addEventListener("mouseenter", () => this._seleccionarIndice(i));
            this.resultsList.appendChild(li);
        });

        // Seleccionar el primer resultado por defecto
        this._seleccionarIndice(0);
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

    // Mueve la selección hacia abajo (1) o hacia arriba (-1), con ciclo
    _moverSeleccion(direccion) {
        const resultados = this.resultsList.querySelectorAll("li.search-result");
        if (resultados.length === 0) return;

        let nuevo = this.indiceSeleccionado;
        if (nuevo < 0 || nuevo >= resultados.length) {
            nuevo = direccion > 0 ? 0 : resultados.length - 1;
        } else {
            nuevo = (nuevo + direccion + resultados.length) % resultados.length;
        }
        this._seleccionarIndice(nuevo);
    }

    // Aplica el resaltado al resultado indicado y lo mantiene visible
    _seleccionarIndice(indice) {
        const resultados = this.resultsList.querySelectorAll("li.search-result");
        if (indice < 0 || indice >= resultados.length) return;

        this.indiceSeleccionado = indice;
        resultados.forEach((el, i) => {
            const activo = i === indice;
            el.classList.toggle("activo", activo);
            el.setAttribute("aria-selected", activo ? "true" : "false");
        });
        resultados[indice].scrollIntoView({ block: "nearest" });
    }

    // Abre el resultado resaltado (o el primero si no hay selección)
    _abrirSeleccionado() {
        const resultados = this.resultsList.querySelectorAll("li.search-result");
        if (resultados.length === 0) return;

        const indice =
            this.indiceSeleccionado >= 0 && this.indiceSeleccionado < resultados.length
                ? this.indiceSeleccionado
                : 0;
        resultados[indice].click();
    }

    async _abrirResultado(r) {
        this.cerrar();
        this.folderManager.seleccionarCarpeta(r.carpeta);
        await this.notesManager.abrirNota(r.carpeta, r.nota);
    }
}

export { SearchManager };
