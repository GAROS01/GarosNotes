# 🎉 GarosNotes v2.3.1 — Release Notes

## Resumen
Esta versión acelera la búsqueda global con un **índice en memoria** en el proceso principal: el índice se construye una sola vez al arrancar y las búsquedas siguientes responden **sin releer ni re-normalizar todos los archivos** en cada pulsación. Además se eliminan las carreras de peticiones en el modal de búsqueda.

---

## ⚡ Rendimiento de búsqueda

### 📇 Índice en memoria
- El proceso principal mantiene un índice de todas las notas (`{ carpeta, nota, texto, textoNormalizado, tituloNormalizado, timestampModificacion }`).
- Se construye al arrancar la app recorriendo `Documents/GarosNotes` **una sola vez**.
- `buscar-notas` consulta el índice y **solo relee del disco las notas cuyo archivo cambió** (comprobación por fecha de modificación).
- Los snippets y la posición de la coincidencia (`matchIndex`) se siguen calculando desde el texto original.

### 🔄 Reindexación incremental
- Crear, guardar, renombrar o eliminar una nota actualiza el índice **al instante**.
- Renombrar o eliminar carpetas, y **restaurar desde la papelera**, también mantienen el índice sincronizado.

### 🔄 Debounce y cancelación de peticiones
- La búsqueda ya no sufre carreras: si una búsqueda antigua responde después de una más reciente, su resultado se **descarta** automáticamente.

---

## 🛠️ Técnico

- **Nuevo:** `ipc/searchIndex.js` — índice en memoria (`construirIndice`, `buscar`, `actualizarEntrada`, `eliminarEntrada`, `renombrarEntrada`, `reindexarCarpeta`, `eliminarCarpetaEntradas`, `renombrarCarpetaEntradas`) y utilidades de texto compartidas (`deltaToTexto`, `normalizar`, `indiceEnOriginal`, `crearSnippet`).
- **Cambio:** `ipc/search.js` — el handler `buscar-notas` delega en el índice.
- **Cambio:** `ipc/note.js`, `ipc/folders.js` e `ipc/trash.js` — actualizan el índice de forma incremental tras cada operación.
- **Cambio:** `main.js` — construye el índice tras `app.whenReady` sin bloquear la apertura de la ventana.
- **Cambio:** `src/js/SearchManager.js` — contador de peticiones para descartar respuestas antiguas.

---

## 📥 Instalación

```bash
git clone https://github.com/GAROS01/GarosNotes.git
cd GarosNotes
pnpm install
pnpm run dev
```

---

**Lanzamiento:** 2026-08-07

---
