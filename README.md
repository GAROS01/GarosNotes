# GarosNotes v2.1.0

GarosNotes es una aplicación de escritorio minimalista para tomar y organizar notas, desarrollada con [Electron](https://www.electronjs.org/) y [Vite](https://vitejs.dev/).

## Características

- **Gestión de carpetas**: Crear, renombrar y eliminar carpetas para organizar tus notas.
- **Gestión de notas**: Crear, editar, renombrar y eliminar notas en cada carpeta.
- **Editor de texto enriquecido**: Utiliza [Quill.js 2.0](https://quilljs.com/) con resaltado de sintaxis avanzado para código.
- **Resaltado de sintaxis**: Soporte para 13+ lenguajes de programación con [Highlight.js](https://highlightjs.org/).
- **Autoguardado**: Las notas se guardan automáticamente 1 segundo después de dejar de escribir.
- **Almacenamiento local**: Tus notas se guardan como archivos `.json` (formato Delta de Quill) en `Documents/GarosNotes`.
- **Interfaz responsive**: Sidebar ocultable con atajos de teclado (Ctrl + B).
- **Funciona completamente offline**: No requiere conexión a internet.
- **Build system moderno**: Utiliza Vite para compilación ultrarrápida y desarrollo optimizado.

## Instalación y uso

### Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [pnpm](https://pnpm.io/) (gestor de paquetes moderno, recomendado)
- [Git](https://git-scm.com/) (opcional)

### Instalación

1. Clona el repositorio o descarga el código fuente:

   ```sh
   git clone https://github.com/GAROS01/GarosNotes.git
   cd GarosNotes
   ```

2. Instala las dependencias:

   ```sh
   pnpm install
   ```

3. Inicia la aplicación en modo desarrollo:

   ```sh
   pnpm run dev
   ```

### Comandos Disponibles

```sh
pnpm run dev       # Desarrollo: compila con Vite y abre Electron
pnpm start         # Inicia solo Electron (sin recompilar)
pnpm run build     # Crea el instalador para distribución (Windows)
pnpm run dist      # Crea el instalador sin publicación
```

### Empaquetar la aplicación

Para generar el instalador (.exe) de la aplicación:

```sh
pnpm run build
```

El instalador se generará en la carpeta `release/`.

## Estructura del proyecto

```
GarosNotes/
├── main.js                          # Proceso principal de Electron
├── package.json                     # Configuración del proyecto y dependencias
├── vite.config.js                   # Configuración de Vite (build tool)
├── pnpm-workspace.yaml              # Configuración de workspace pnpm
├── pnpm-lock.yaml                   # Lockfile de pnpm
├── LICENSE                          # Licencia MIT del proyecto
├── README.md                        # Documentación del proyecto
├── CHANGELOG.md                     # Historial de cambios por versión
├── RELEASE_NOTES.md                 # Notas de lanzamiento
├── ipc/                            # Manejadores IPC del proceso main
│   ├── paths.js                    # Utilidades de rutas (Documents/GarosNotes)
│   ├── folders.js                  # Handlers de carpetas (CRUD)
│   └── note.js                     # Handlers de notas (CRUD)
├── src/                             # Código fuente de la aplicación
│   ├── index.html                  # Página principal de la aplicación
│   ├── renderer.js                 # Entry point (bootstraps App)
│   ├── preload.js                  # Bridge seguro entre main y renderer
│   ├── js/                         # Módulos JavaScript del renderer
│   │   ├── App.js                  # Orquestador principal
│   │   ├── EventBus.js             # Sistema de eventos desacoplados
│   │   ├── FolderManager.js        # Gestión de carpetas
│   │   ├── NotesManager.js         # Gestión de notas
│   │   ├── QuillEditor.js          # Wrapper del editor Quill
│   │   ├── AutoSave.js             # Autoguardado con debounce
│   │   └── Shortcuts.js            # Atajos de teclado
│   ├── styles/                     # Estilos CSS
│   │   ├── layout.css              # Layout principal, reset, placeholder
│   │   ├── modals.css              # Estilos de modales
│   │   ├── sidebar.css             # Sidebar, carpetas, notas, settings
│   │   ├── quill-theme.css         # Tema oscuro de Quill
│   │   └── syntax-highlighting.css # Resaltado de sintaxis (sin !important)
│   └── img/                        # Recursos de imagen
│       └── img_note_bg.ico         # Icono de la aplicación
├── dist/                           # Carpeta generada por Vite (build output)
├── release/                        # Carpeta generada con los instaladores
└── node_modules/                   # Dependencias (generado por pnpm)
```

## Funcionalidades principales

### Gestión de carpetas

- **Crear**: Botón "+" en la sección de carpetas
- **Renombrar**: Botón ✏️ junto a cada carpeta
- **Eliminar**: Botón 🗑️ junto a cada carpeta

### Gestión de notas

- **Crear**: Botón "+" en la sección de notas (requiere seleccionar una carpeta)
- **Editar**: Click en cualquier nota para abrirla en el editor
- **Renombrar**: Click en el título de la nota cuando está abierta
- **Eliminar**: Botón de eliminar en la lista de notas
- **Autoguardado**: Las notas se guardan automáticamente cada 3 segundos

### Atajos de teclado

- **Ctrl + B**: Mostrar/ocultar sidebar
- **Escape**: Cerrar modales abiertos
- **Enter**: Confirmar en modales de texto

## Tecnologías utilizadas

### Frontend
- **[Quill.js 2.0](https://quilljs.com/)**: Editor de texto enriquecido y moderno
- **[Highlight.js](https://highlightjs.org/)**: Resaltado de sintaxis para 13+ lenguajes
- **HTML5, CSS3, JavaScript ES6+**: Tecnologías web estándar

### Backend & Desktop
- **[Electron 43.2.0](https://www.electronjs.org/)**: Framework para aplicaciones de escritorio multiplataforma
- **Node.js APIs**: Acceso al sistema de archivos y operaciones del SO

### Build & Development
- **[Vite 8.1.5](https://vitejs.dev/)**: Build tool ultrarrápido y moderno
- **[pnpm](https://pnpm.io/)**: Gestor de paquetes eficiente
- **[electron-builder](https://www.electron.build/)**: Generador de instaladores

## Personalización

### Cambiar icono de la aplicación

Reemplaza el archivo: `src/img/img_note_bg.ico`

### Modificar estilos

Edita los archivos en: `src/styles/`
- `layout.css` - Layout principal y reset
- `modals.css` - Estilos de modales
- `sidebar.css` - Sidebar, carpetas, notas, settings
- `quill-theme.css` - Tema oscuro de Quill
- `syntax-highlighting.css` - Estilos del resaltado de sintaxis

### Cambiar nombre de la aplicación

Edita en `package.json`:
```json
{
  "name": "tu-nombre",
  "productName": "Tu Nombre"
}
```

### Configurar almacenamiento

Las notas se guardan como `.json` en: `Documents/GarosNotes`  
Para cambiar la ruta base, edita `ipc/paths.js`

### Agregar más lenguajes de resaltado

Edita `src/js/QuillEditor.js` en la sección `hljs.configure()`:
```javascript
hljs.configure({
  languages: [
    'javascript', 'python', 'java', // agregar más aquí
  ],
});
```

## Desarrollo

### Scripts disponibles

```sh
pnpm run dev       # Compila con Vite y abre Electron en desarrollo
pnpm start         # Inicia Electron sin recompilar
pnpm run build     # Genera instalador (.exe) para Windows
pnpm run dist      # Genera instalador sin publicación
```

### Arquitectura

La aplicación sigue una arquitectura modular basada en Electron con comunicación desacoplada vía EventBus:

### Main Process
- **main.js**: Crea la ventana de Electron e importa los handlers IPC
- **ipc/paths.js**: Utilidades de rutas compartidas (`Documents/GarosNotes`)
- **ipc/folders.js**: `registerFolderHandlers()` — CRUD de carpetas
- **ipc/note.js**: `registerNoteHandlers()` — CRUD de notas (formato `.json`)

### Preload Bridge
- **src/preload.js**: Expone `window.api` con `contextBridge` (contextIsolation)

### Renderer Process
- **src/renderer.js**: Entry point mínimo. Importa `App` y lo arranca en `DOMContentLoaded`
- **src/js/App.js**: Orquestador. Crea FolderManager, NotesManager, Shortcuts. Registra eventos DOM.
- **src/js/EventBus.js**: EventEmitter singleton. Desacopla FolderManager ↔ NotesManager.
- **src/js/FolderManager.js**: CRUD de carpetas + UI. Emite eventos (`folder:renamed`, `folder:deleted`, `folder:selected`).
- **src/js/NotesManager.js**: CRUD de notas, modales, estado. Escucha eventos del bus y orquesta QuillEditor + AutoSave.
- **src/js/QuillEditor.js**: Wrapper de Quill.js + highlight.js. Inicializa editor, carga/obtiene contenido.
- **src/js/AutoSave.js**: Scheduling con debounce (1s contenido, 5s título). Evita fugas de listeners.
- **src/js/Shortcuts.js**: Atajos de teclado (Escape, Ctrl+B, Enter en modales).

### Flujo de Datos
```
Renderer (UI) → window.api (preload) → ipcRenderer.invoke()
  → ipc/note.js o ipc/folders.js (handler) → fs operations → response
```

### Build System con Vite

**vite.config.js** configura:
- Root: `src/` (punto de entrada)
- Output: `dist/` (compilado)
- Base: `./` (rutas relativas)

**Flujo de compilación:**
```
src/ (fuente) → Vite → dist/ (compilado) → Electron carga dist/index.html
```

### Flow de Datos

```
Renderer (UI) → window.api (preload) → ipcRenderer.invoke() 
  → main.js (IPC handler) → fs operations → response
```

## Versiones Recientes

### v2.1.0 (1 de Agosto de 2026) ✨ Actual
- ⬆️ **Actualización**: Electron 36.2.1 → 43.2.0

### v2.0.1 (19 de Julio de 2026)
- 🐛 **Fix**: Quill syntax module ahora recibe `hljs` como opción explícita — corrige error al abrir notas

Para ver más detalles, consulta [CHANGELOG.md](CHANGELOG.md) y [RELEASE_NOTES.md](RELEASE_NOTES.md)

## Contribuir

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una idea para mejorar GarosNotes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Créditos

Esta aplicación no es un diseño original. La idea principal y el diseño de la interfaz fueron tomados de [RevNotes-Desktop](https://github.com/RevienMaker/RevNotes-Desktop) por RevienMaker. ¡Gracias por el excelente trabajo!

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - consulta el archivo LICENSE para más detalles.

---

Desarrollado por Oscar Garzon / GarosDev
