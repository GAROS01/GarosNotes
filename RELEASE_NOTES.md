# 🎉 GarosNotes v2.0.0 — Release Notes

## Resumen
Refactor arquitectónico completo. Se eliminaron dependencias globales (`window.*`), se modularizó el CSS sin `!important`, se separaron los IPC handlers por dominio, y se extrajeron el editor Quill y el autoguardado en módulos independientes. No hay cambios funcionales visibles, pero el código es significativamente más mantenible y escalable.

---

## 🚀 Cambios Principales

### 🔌 Sistema de Eventos (EventBus)
- `window.notesManager` y `window.folderManager` eliminados como globales
- FolderManager emite eventos (`folder:renamed`, `folder:deleted`, `folder:selected`)
- NotesManager escucha y reacciona sin acoplamiento directo

### 🧩 Separación de Responsabilidades
- **App.js** — Orquestador: crea instancias, registra eventos DOM
- **Shortcuts.js** — Atajos de teclado (Escape, Ctrl+B, Enter)
- **QuillEditor.js** — Wrapper de Quill.js + highlight.js
- **AutoSave.js** — Autoguardado con debounce (1s contenido, 5s título)
- **renderer.js** reducido a 10 líneas (solo importa y arranca App)

### 🔌 IPC por Dominio
- `ipc/paths.js` — Rutas compartidas (`Documents/GarosNotes`)
- `ipc/folders.js` — CRUD de carpetas
- `ipc/note.js` — CRUD de notas
- **main.js** reducido de 278 → 22 líneas

### 🎨 CSS Modular y Limpio
- `layout.css` / `modals.css` / `sidebar.css` / `quill-theme.css`
- `syntax-highlighting.css` sin `!important` (selectores con especificidad)

### 📄 Formato de Archivo
- Notas ahora usan extensión `.json` (el contenido siempre fue JSON Delta de Quill)

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos nuevos | 10 |
| Archivos eliminados | 1 (`styles.css`) |
| Líneas de código | Similar (~3500 total) |
| `!important` eliminados | 33 |

---

## 📥 Instalación

```bash
git clone https://github.com/GAROS01/GarosNotes.git
cd GarosNotes
pnpm install
pnpm run dev      # Desarrollo
pnpm run build    # Build con instalador
```

---

**Autor:** GAROS01  
**Licencia:** MIT  
**Lanzamiento:** 2026-07-19
