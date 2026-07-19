import Quill from 'quill';
import hljs from 'highlight.js';

window.hljs = hljs;

class QuillEditor {
    constructor() {
        this.editor = null;
    }

    init() {
        hljs.configure({
            languages: [
                "javascript", "python", "java", "cpp",
                "html", "css", "json", "sql",
                "bash", "typescript", "php", "csharp",
            ],
        });

        this.editor = new Quill("#editor-container", {
            theme: "snow",
            modules: {
                syntax: true,
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
                    ["blockquote", "code-block"],
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

        window.quill = this.editor;
    }

    getContent() {
        if (!this.editor) return "";
        return JSON.stringify(this.editor.getContents());
    }

    loadContent(contenido) {
        if (!this.editor) return;
        if (contenido.trim() === "") {
            this.editor.setText("");
        } else {
            try {
                const delta = JSON.parse(contenido);
                this.editor.setContents(delta);
            } catch (e) {
                this.editor.setText(contenido);
            }
        }
    }

    focus() {
        setTimeout(() => {
            if (this.editor) {
                this.editor.getModule("toolbar").container.style.display = "block";
                this.editor.focus();
            }
        }, 100);
    }
}

export { QuillEditor };
