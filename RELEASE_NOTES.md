# 🎉 GarosNotes v2.4.0 — Release Notes

## Resumen
Esta versión añade **favoritos**: fija tus notas importantes con un clic y aparecerán **al principio de la lista**, siempre visibles y destacadas. El estado se guarda de forma local y se conserva al renombrar notas o carpetas.

---

## 📌 Favoritos / notas fijadas

### Fijar y desfijar
- Cada nota de la lista incorpora un botón **📌** para fijarla o quitarla de favoritos.
- Las notas fijadas se muestran **antes que el resto**, con fondo y borde de acento (`#9e03d6`).
- Dentro de cada grupo (fijadas y no fijadas) se mantiene el orden habitual de la lista.

### Persistencia local
- El estado se guarda en `Documents/GarosNotes/.favoritos.json`, un archivo oculto que no aparece en la lista de notas ni en los resultados de búsqueda.
- Renombrar una nota o una carpeta **no pierde** los favoritos.
- El estado sobrevive al cierre y reapertura de la app.

---

## 🛠️ Técnico

- **Nuevo:** `ipc/favorites.js` — `listarFavoritosDeCarpeta`, `alternarFavorito`, `renombrarFavorito`, `renombrarCarpetaFavoritos` y los handlers `listar-favoritos` / `alternar-favorito`.
- **Cambio:** `ipc/paths.js` — nueva constante `FAVORITOS`.
- **Cambio:** `ipc/note.js` e `ipc/folders.js` — sincronizan el estado de favoritos al renombrar.
- **Cambio:** `main.js` — registra `registerFavoriteHandlers`.
- **Cambio:** `src/preload.js` — expone `listarFavoritos(carpeta)` y `alternarFavorito(carpeta, nota)`.
- **Cambio:** `src/js/NotesManager.js` — ordena las fijadas primero y renderiza el botón 📌.
- **Cambio:** `src/styles/sidebar.css` — estilos de nota fijada y del botón.

---

## 📥 Instalación

```bash
git clone https://github.com/GAROS01/GarosNotes.git
cd GarosNotes
pnpm install
pnpm run dev
```

---

**Lanzamiento:** 2026-11-22

---
