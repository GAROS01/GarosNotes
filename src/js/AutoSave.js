class AutoSave {
    constructor({ quillEditor, onSave, onRename }) {
        this.quillEditor = quillEditor;
        this.onSave = onSave;
        this.onRename = onRename;
        this.timer = null;
        this.tituloListenersAttached = false;
        this._quillCallback = null;
    }

    setup() {
        if (!this.quillEditor.editor) return;

        this._clearTimer();

        if (this._quillCallback) {
            this.quillEditor.editor.off("text-change", this._quillCallback);
        }

        this._quillCallback = () => {
            this._schedule(() => this.onSave(), 1000);
        };
        this.quillEditor.editor.on("text-change", this._quillCallback);

        if (!this.tituloListenersAttached) {
            const tituloInput = document.getElementById("titulo-nota");
            tituloInput.addEventListener("input", () => {
                this._schedule(() => this.onRename(), 5000);
            });
            this.tituloListenersAttached = true;
        }
    }

    teardown() {
        this._clearTimer();
    }

    _schedule(fn, delay) {
        this._clearTimer();
        this.timer = setTimeout(fn, delay);
    }

    _clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export { AutoSave };
