# Changelog - GarosNotes

## [2.2.1] - 2026-08-01

### ⌨️ Navegación en la búsqueda
- **Nuevo:** Navegación con flechas `↑` / `↓` para recorrer los resultados de búsqueda, con ciclo (al llegar al final vuelve al inicio y viceversa).
- **Nuevo:** Resaltado visual del resultado activo (`.search-result.activo`) — el primer resultado se selecciona automáticamente al renderizar.
- **Nuevo:** El resultado activo se mantiene visible en la lista mediante `scrollIntoView`.
- **Cambio:** `Enter` ahora abre el resultado resaltado (o el primero si no hay selección), en lugar de solo el primer resultado.
- **Cambio:** Al pasar el mouse por un resultado también se actualiza la selección (teclado y ratón sincronizados).
- **Cambio:** Accesibilidad: atributo `aria-selected` en los resultados (`role="listbox"` / `option`).

---

## [2.2.0] - 2026-08-01

### ✨ Búsqueda Full-text
- **Nuevo:** Búsqueda en todas las notas con `Ctrl + F` (modal `#modal-search`).
- **Nuevo:** `ipc/search.js` — handler `buscar-notas` que recorre carpetas y archivos `.json` bajo `NOTES_BASE`, extrae texto plano del Delta de Quill (`deltaToTexto`) y busca en contenido y título con coincidencia insensible a mayúsculas y acentos (normalización NFD). Devuelve hasta 50 resultados `{ carpeta, nota, snippet, matchIndex }`.
- **Nuevo:** `src/js/SearchManager.js` — abre/cierra el modal, debounce de 250 ms, renderizado seguro con `textContent` + `<mark>` (sin HTML inseguro), Enter/click abre el resultado.
- **Nuevo:** `src/styles/search.css` — estilos del modal, input, resultados y `<mark>` con acento `#9e03d6`.
- **Cambio:** `FolderManager` — nuevo método `seleccionarCarpeta(nombre)` (refactor del `li.onclick`) para abrir resultados de búsqueda desde cualquier estado.
- **Cambio:** `Shortcuts` — `Ctrl + F` abre la búsqueda; `Escape` también la cierra.
- **Cambio:** `preload.js` expone `buscarNotas(consulta)`; `main.js` registra `registerSearchHandlers`.

---

## [2.1.0] - 2026-08-01

### ⬆️ Dependencias
- **Electron**: 36.2.1 → 43.2.0. Actualización del framework de escritorio a la rama 43.x para mantenerse al día con el ecosistema y aprovechar las mejoras de rendimiento, seguridad y compatibilidad.

---

## [2.0.1] - 2026-07-19

### 🐛 Fix
- **QuillEditor.js**: `syntax: true` → `syntax: { hljs }`. El módulo syntax de Quill 2.0 requiere `hljs` como opción explícita; sin esto fallaba al abrir cualquier nota.

## [2.0.0] - 2026-07-19

### 🏗️ Refactor Arquitectónico Completo

#### 🔌 Sistema de Eventos
- **Nuevo:** `EventBus.js` — EventEmitter singleton para comunicación desacoplada
- **Eliminado:** `window.notesManager` y `window.folderManager` como globales
- **FolderManager** ahora emite eventos (`folder:renamed`, `folder:deleted`, `folder:selected`)
- **NotesManager** escucha eventos del bus en lugar de ser manipulado directamente

#### 🧩 Separación de Responsabilidades
- **Nuevo:** `App.js` — Orquestador principal (crea instancias, registra eventos DOM)
- **Nuevo:** `Shortcuts.js` — Atajos de teclado (Escape, Ctrl+B, Enter)
- **renderer.js** reducido a entry point mínimo (~10 líneas)

#### ✂️ Editor y Autoguardado
- **Nuevo:** `QuillEditor.js` — Inicialización de Quill + hljs, carga/obtención de contenido
- **Nuevo:** `AutoSave.js` — Scheduling con debounce (1s contenido, 5s título), sin fugas de listeners
- **NotesManager.js** reducido en ~100 líneas, ahora orquesta los submódulos

#### 🔌 IPC por Dominio
- **Nuevo:** `ipc/paths.js` — Utilidades de rutas compartidas
- **Nuevo:** `ipc/folders.js` — Handlers de carpetas (crear, listar, eliminar, renombrar)
- **Nuevo:** `ipc/note.js` — Handlers de notas (crear, listar, leer, guardar, eliminar, renombrar)
- **main.js** reducido de 278 a ~22 líneas (solo creación de ventana + registro)

#### 🎨 CSS Modular
- **Nuevo:** `layout.css` — Reset, layout, placeholder, responsive
- **Nuevo:** `modals.css` — Estilos de modales
- **Nuevo:** `sidebar.css` — Sidebar, carpetas, notas, toggle, settings
- **Nuevo:** `quill-theme.css` — Overrides de Quill (tema oscuro)
- **Eliminado:** `styles.css` (reemplazado por los 4 archivos modulares)
- **Refactor:** `syntax-highlighting.css` — Todos los `!important` eliminados usando selectores anidados

#### 📄 Formato de Archivo
- **Cambio:** Extensión `.txt` → `.json` (el contenido es JSON Delta de Quill)

---

## [1.4.0] - 2026-07-19

### ✨ Cambios Principales

#### 🛠️ Build System
- **Agregado:** Vite como herramienta de build para optimización y bundling
- **Actualizado:** Scripts `build` y `dist` ahora incluyen paso de compilación con Vite
- **Nuevo:** Script `dev` para desarrollo rápido (`vite build && electron .`)
- **Beneficio:** Mejor rendimiento, build más rápido, mejor manejo de módulos

#### 📚 Nuevas Dependencias Frontend
- **Quill 2.0.3:** Editor de texto rico mejorado con mejores funcionalidades
- **highlight.js 11.11.1:** Resaltado de sintaxis avanzado para múltiples lenguajes
- **Vite 8.1.5:** Build tool moderno y eficiente

#### 🔧 Cambios Técnicos
- **main.js:** Ruta de carga actualizada de `src/` a `dist/` para usar archivos compilados
- **Configuración:** Agregado `vite.config.js` con configuración optimizada
- **Workspace:** Agregado `pnpm-workspace.yaml` para mejor gestión de dependencias
- **gitignore:** Agregado `dist/` a archivos ignorados

#### 🚀 Mejoras en la Aplicación
- **NotesManager.js:** Lógica mejorada para mejor manejo de notas
- **renderer.js:** Refactorización de eventos para mejor rendimiento (-45 líneas de código innecesario)
- **index.html:** Actualizaciones menores para mejor compatibilidad

---

## [1.3.0] - 2026-07-10

### ✨ Características
- Gestión completa de carpetas (crear, renombrar, eliminar)
- Gestión de notas con autoguardado automático
- Editor de texto con Quill.js
- Resaltado de sintaxis para código
- Interfaz responsive con sidebar ocultable
- Atajos de teclado: Ctrl+B (toggle sidebar), Escape (cerrar modales)
- Funciona completamente offline
- Almacenamiento en Documents/GarosNotes

---

## Notas Técnicas

### Compatibilidad
- ✅ Node.js v18+
- ✅ pnpm 8.0+
- ✅ Electron 43.2.0
- ✅ Windows 10+

### Instalación para Desarrolladores
```bash
pnpm install
pnpm run dev      # Desarrollo
pnpm run build    # Build con instalador
pnpm run dist     # Build sin publicación
```

### Cambios en Estructura de Build
**Antes (v1.3.0):**
```
main.js → src/index.html (directo)
```

**Después (v1.4.0):**
```
Vite (pnpm run build) → dist/index.html → main.js carga de dist/
```

---

## 📦 Estadísticas del Release

- **Files Changed:** 9
- **Insertions:** 704
- **Deletions:** 159
- **Commit:** feat: Add Vite build system and frontend dependencies
- **Tag:** v1.4.0
