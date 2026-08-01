# 🎉 GarosNotes v2.2.0 — Release Notes

## Resumen
Nueva funcionalidad de **búsqueda full-text** en todas tus notas: presiona `Ctrl + F` para buscar cualquier texto, sin preocuparte por mayúsculas o acentos.

---

## ✨ Nuevo: Búsqueda full-text (Ctrl + F)

- **Busca en todas tus notas** a la vez, recorriendo todas las carpetas y archivos `.json`.
- **Coincidencia inteligente**: insensible a mayúsculas y acentos (normalización NFD) — buscar "electron" encuentra "Electrón".
- **Resultados con snippet**: muestra un fragmento del contexto con la coincidencia resaltada en `<mark>`.
- **Apertura directa**: haz clic (o Enter) en un resultado y la app selecciona la carpeta y abre la nota automáticamente.
- **Debounce de 250 ms** para una búsqueda fluida mientras escribes.

### Atajos
- `Ctrl + F`: abrir búsqueda
- `Escape`: cerrar búsqueda
- `Enter`: abrir el primer resultado

---

## 🛠️ Técnico

- **Nuevo:** `ipc/search.js` — handler `buscar-notas` + helper `deltaToTexto()` (extrae texto plano del Delta de Quill).
- **Nuevo:** `src/js/SearchManager.js` — lógica del modal, debounce y renderizado seguro (`textContent` + `<mark>`, sin HTML inseguro).
- **Nuevo:** `src/styles/search.css` — estilos del modal, input, resultados y resaltado `#9e03d6`.
- **Cambios:** `preload.js` (expone `buscarNotas`), `main.js` (registra handler), `FolderManager.js` (`seleccionarCarpeta`), `Shortcuts.js` (Ctrl+F / Escape).

---

## 📥 Instalación

```bash
git clone https://github.com/GAROS01/GarosNotes.git
cd GarosNotes
pnpm install
pnpm run dev
```

---

**Lanzamiento:** 2026-08-01
