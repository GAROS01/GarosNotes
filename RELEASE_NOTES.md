# 🎉 GarosNotes v2.3.0 — Release Notes

## Resumen
Esta versión endurece la seguridad y la robustez del sistema de archivos: nombres validados según las reglas de Windows, operaciones 100 % asíncronas, autoguardado garantizado al cerrar la ventana, protección de instancia única y una papelera de reciclaje con interfaz para restaurar o borrar definitivamente.

---

## 🛡️ Seguridad y robustez

### ✅ Validación de nombres
- Los nombres de carpetas y notas se validan **antes** de tocar el disco: longitud 1-100, sin caracteres inválidos (`/ \ : * ? " < > |` ni de control), sin espacios o puntos al inicio/final, sin nombres reservados de Windows (CON, PRN, AUX, NUL, COM1-9, LPT1-9) y sin path traversal (`.` / `..`).
- Si el nombre es inválido, la app lo rechaza con un mensaje claro en lugar de fallar silenciosamente.

### ⚡ Operaciones 100 % asíncronas
- Todos los handlers IPC migran a `fs/promises`: el proceso principal nunca se bloquea con llamadas síncronas, aunque las notas sean grandes o el disco esté lento.

### 💾 Flush al cerrar la ventana
- Al cerrar, la app guarda de inmediato cualquier cambio pendiente del autoguardado antes de destruir la ventana (con timeout de seguridad de 2 s).

### 🪟 Instancia única
- Si intentas abrir una segunda ventana, se descarta automáticamente y se enfoca la que ya está abierta.

---

## 🗑️ Papelera de reciclaje

- Eliminar ya no borra para siempre: las carpetas y notas se mueven a una papelera interna (`.papelera/`).
- Botón 🗑️ en la barra lateral: abre el modal con los elementos eliminados.
- **Restaurar** cada elemento con un clic — vuelve a su ubicación original.
- **Vaciar papelera** con confirmación para borrar definitivamente.
- La papelera queda oculta de las listas y de la búsqueda.
- El modal de eliminación avisa que el elemento se moverá a la papelera.

---

## 🛠️ Técnico

- **Nuevo:** `ipc/validate.js` — `validarNombre(nombre, tipo)`.
- **Nuevo:** `ipc/fs-utils.js` — `existeRuta()` y `moverAPapelera()`.
- **Nuevo:** `ipc/trash.js` — handlers `listar-papelera`, `restaurar-elemento`, `vaciar-papelera`.
- **Nuevo:** `src/js/TrashManager.js` — UI del modal de la papelera.
- **Cambio:** `ipc/folders.js`, `ipc/note.js`, `ipc/search.js` — migración a `fs/promises` y filtrado de la papelera en listas y búsqueda.
- **Cambio:** `main.js` — flush de cierre con confirmación y timeout, e instancia única.
- **Cambio:** `src/preload.js` — nueva API de papelera (`listarPapelera`, `restaurarElemento`, `vaciarPapelera`).

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
