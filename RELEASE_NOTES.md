# 🎉 GarosNotes v2.2.1 — Release Notes

## Resumen
La búsqueda ahora es totalmente navegable por teclado: recorre los resultados con las flechas `↑` / `↓`, un resaltado marca el resultado activo y `Enter` lo abre directamente.

---

## ✨ Nuevo: Navegación en los resultados de búsqueda

- **Flechas `↑` / `↓`**: recorren los resultados con ciclo (al llegar al final vuelve al inicio y viceversa).
- **Resaltado del resultado activo**: el primer resultado se selecciona automáticamente y se distingue con un fondo morado; la lista se desplaza sola para mantenerlo siempre visible.
- **`Enter`**: abre el resultado resaltado (o el primero si todavía no hay selección).
- **Mouse sincronizado**: pasar el cursor por un resultado también actualiza la selección, así el teclado y el ratón siempre van en sintonía.

### Atajos
- `Ctrl + F`: abrir búsqueda
- `↑` / `↓`: recorrer resultados
- `Enter`: abrir el resultado resaltado
- `Escape`: cerrar búsqueda

---

## 🛠️ Técnico

- **Cambios:** `src/js/SearchManager.js` — nuevos métodos `_moverSeleccion()`, `_seleccionarIndice()` y `_abrirSeleccionado()`; el primer resultado se selecciona al renderizar y se usa `aria-selected` para accesibilidad.
- **Cambios:** `src/styles/search.css` — nuevo estilo `.search-result.activo` con resaltado en morado.

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

---
