# GarosNotes

GarosNotes es una aplicación de escritorio minimalista para tomar y organizar notas, desarrollada con [Electron](https://www.electronjs.org/).

## Características

- Crear, renombrar y eliminar carpetas para organizar tus notas.
- Crear, editar y eliminar notas en cada carpeta.
- Editor de texto enriquecido (Quill.js) para tus notas.
- Almacenamiento local en la carpeta `Documents/GarosNotes` de tu equipo.
- Interfaz limpia y sencilla.
- Funciona completamente offline.

## Instalación y uso

### Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [pnpm](https://pnpm.io/) (o npm/yarn)
- [Git](https://git-scm.com/) (opcional)

### Instalación

1. Clona el repositorio o descarga el código fuente.
2. Instala las dependencias:

   ```sh
   pnpm install
   ```

3. Inicia la aplicación en modo desarrollo:

   ```sh
   pnpm start
   ```

### Empaquetar la aplicación

Para generar el instalador de la app:

```sh
pnpm run build
```

El instalador se generará en la carpeta `release`.

## Estructura del proyecto

```
GarosNotes/
├── main.js
├── package.json
├── src/
│   ├── index.html
│   ├── renderer.js
│   ├── preload.js
│   ├── img/  
│   └── styles/
│       └── index.css
└── README.md
```

## Personalización

- Puedes cambiar el icono de la app reemplazando el archivo `src/img/img_note_bg.ico`.
- El almacenamiento de notas y carpetas se realiza en `Documents/GarosNotes` de tu usuario.

## Créditos

Esta aplicación no es un diseño original. La idea principal y el diseño de la interfaz fueron tomados de [RevNotes-Desktop](https://github.com/RevienMaker/RevNotes-Desktop) por RevienMaker. ¡Gracias por el excelente trabajo!

## Licencia

ISC

---

Desarrollado por Oscar Garzon / GarosDev
