# 🎉 GarosNotes v2.0.1 — Release Notes

## Resumen
Hotfix para el error "Syntax module requires highlight.js" que impedía abrir notas. El módulo `syntax` de Quill 2.0 requiere recibir `hljs` como opción explícita en lugar de depender únicamente de `window.hljs`.

---

## 🐛 Fix

- **QuillEditor.js**: Cambio de `syntax: true` a `syntax: { hljs }` — el módulo syntax ahora recibe `highlight.js` directamente en sus opciones.

---

## 📥 Instalación

```bash
git clone https://github.com/GAROS01/GarosNotes.git
cd GarosNotes
pnpm install
pnpm run dev
```

---

**Lanzamiento:** 2026-07-19
