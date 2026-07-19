import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/atom-one-dark.css';

import { App } from "./js/App.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado");
    new App();
});
