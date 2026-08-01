# GarosNotes v2.2.1

GarosNotes es una aplicación de escritorio minimalista para tomar, organizar y buscar notas, desarrollada con Electron, Vite y Quill. Está pensada para funcionar de forma local y offline, sin depender de servicios externos.

## Características principales

- Gestión de carpetas: crear, renombrar y eliminar carpetas desde la barra lateral.
- Gestión de notas: crear, editar, renombrar y eliminar notas dentro de cada carpeta.
- Editor enriquecido con Quill.js, incluyendo listas, tablas básicas, estilos de texto, bloques de código y resaltado de sintaxis.
- Resaltado de sintaxis para más de 12 lenguajes de programación con Highlight.js.
- Autoguardado automático: el contenido se guarda 1 segundo después de dejar de escribir y el título tras 5 segundos de inactividad.
- Búsqueda global en todas las notas con Ctrl + F, con coincidencias insensibles a mayúsculas y acentos y resultados con snippets.
- Almacenamiento local en archivos JSON en Documents/GarosNotes.
- Sidebar ocultable con accesos rápidos por teclado.
- Funciona completamente offline.

## Requisitos

- Node.js 18 o superior
- pnpm
- Git (opcional)

## Instalación

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

## Scripts disponibles

```sh
pnpm run dev      # Compila con Vite y abre Electron en desarrollo
pnpm start        # Inicia Electron sin recompilar
pnpm run build    # Genera el instalador para Windows
pnpm run dist     # Genera el instalador sin publicar
```

## Estructura del proyecto

```text
GarosNotes/
├── main.js                      # Proceso principal de Electron
├── package.json                 # Dependencias, scripts y configuración de build
├── vite.config.js               # Configuración de Vite
├── pnpm-workspace.yaml          # Configuración del workspace de pnpm
├── pnpm-lock.yaml               # Lockfile de pnpm
├── ipc/                         # Handlers IPC del proceso principal
│   ├── folders.js               # CRUD de carpetas
│   ├── note.js                  # CRUD de notas
│   ├── paths.js                 # Rutas base para el almacenamiento local
│   └── search.js                # Búsqueda full-text entre notas
├── src/                         # Código fuente de la interfaz
│   ├── index.html               # Estructura principal de la UI
│   ├── preload.js               # Bridge seguro entre renderer y main
│   ├── renderer.js              # Inicio de la app en el renderer
│   ├── js/                      # Módulos de la interfaz
│   │   ├── App.js               # Orquestador principal
│   │   ├── AutoSave.js          # Lógica de autoguardado
│   │   ├── EventBus.js          # Sistema de eventos desacoplado
│   │   ├── FolderManager.js     # Gestión de carpetas y modales
│   │   ├── NotesManager.js      # Gestión de notas y editor
│   │   ├── QuillEditor.js       # Wrapper de Quill + Highlight.js
│   │   ├── SearchManager.js     # Modal de búsqueda y navegación de resultados
│   │   └── Shortcuts.js         # Atajos de teclado
│   └── styles/                  # Estilos CSS de la aplicación
└── release/                     # Instaladores generados
```

## Funcionalidades clave

### Gestión de carpetas y notas

- Crear carpeta desde el botón de la sección superior.
- Renombrar o eliminar carpetas desde los botones de cada elemento.
- Crear una nota solo después de seleccionar una carpeta.
- Eliminar notas desde el botón de la lista y renombrarlas desde el título de la nota abierta.

### Búsqueda global

- Activar con Ctrl + F.
- Navegar por resultados con las flechas ↑ / ↓.
- Abrir el resultado seleccionado con Enter.
- Cerrar el modal con Escape.

### Atajos de teclado

- Ctrl + B: mostrar u ocultar la barra lateral.
- Ctrl + F: abrir la búsqueda global.
- Escape: cerrar modales y la búsqueda.
- Enter: confirmar acciones de los modales o abrir el resultado activo.

## Tecnologías utilizadas

- Electron 43.2.0
- Vite 8.1.5
- Quill.js 2.0
- Highlight.js 11
- Node.js APIs para acceso al sistema de archivos
- electron-builder para generar instaladores

## Almacenamiento

Las notas se guardan como archivos JSON en la ruta:

```text
Documents/GarosNotes
```

Cada nota se guarda con el contenido en formato Delta de Quill, lo que permite restaurar el editor con el mismo estado visual y estructural.

## Personalización

### Cambiar el icono

Reemplaza el archivo:

```text
src/img/img_note_bg.ico
```

### Modificar estilos

Los estilos principales están en:

- src/styles/layout.css
- src/styles/modals.css
- src/styles/sidebar.css
- src/styles/quill-theme.css
- src/styles/syntax-highlighting.css

### Cambiar el nombre de la app

Edita package.json y ajusta los campos name y productName.

## Desarrollo

La arquitectura sigue un patrón modular con separación entre proceso principal, preload y renderer:

- Main process: crea la ventana y registra los handlers IPC.
- Preload: expone window.api al renderer mediante contextBridge.
- Renderer: gestiona la interfaz, los eventos de UI y el editor.

El flujo de datos es:

```text
Renderer → window.api → ipcRenderer.invoke() → handlers IPC → fs → respuesta
```

## Versiones recientes

### v2.2.1 (1 de agosto de 2026)
- Búsqueda global mejorada con navegación por flechas, resaltado del resultado activo y apertura con Enter.

### v2.2.0 (1 de agosto de 2026)
- Añadida búsqueda full-text en todas las notas con coincidencias insensibles a mayúsculas y acentos.

### v2.1.0 (1 de agosto de 2026)
- Actualización de Electron de 36.2.1 a 43.2.0.

### v2.0.1 (19 de julio de 2026)
- Corregido el problema del módulo de sintaxis de Quill al pasar hljs correctamente.

## Contribuir

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una idea para mejorar GarosNotes:

1. Haz un fork del proyecto.
2. Crea una rama para tu cambio.
3. Haz commit de tus modificaciones.
4. Abre un pull request.

## Créditos

La idea principal y parte del diseño visual se inspiraron en RevNotes-Desktop de RevienMaker.

## Licencia

Este proyecto está licenciado bajo la licencia MIT.

---

Desarrollado por Oscar Garzon / GarosDev
