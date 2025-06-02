
# GarosNotes

GarosNotes es una aplicación de escritorio minimalista para tomar y organizar notas, desarrollada con [Electron](https://www.electronjs.org/).

## Características

- **Gestión de carpetas**: Crear, renombrar y eliminar carpetas para organizar tus notas.
- **Gestión de notas**: Crear, editar, renombrar y eliminar notas en cada carpeta.
- **Editor de texto enriquecido**: Utiliza Quill.js con resaltado de sintaxis para código.
- **Autoguardado**: Las notas se guardan automáticamente mientras escribes.
- **Almacenamiento local**: Todas tus notas se guardan en `Documents/GarosNotes` de tu equipo.
- **Interfaz responsive**: Sidebar ocultable con atajos de teclado (Ctrl + B).
- **Atajos de teclado**: Navegación rápida y cierre de modales con Escape.
- **Funciona completamente offline**: No requiere conexión a internet.

## Instalación y uso

### Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- [Git](https://git-scm.com/) (opcional)

### Instalación

1. Clona el repositorio o descarga el código fuente:

   ```sh
   git clone https://github.com/tuusuario/GarosNotes.git
   cd GarosNotes
   ```

2. Instala las dependencias:

   ```sh
   pnpm install
   ```

3. Inicia la aplicación en modo desarrollo:

   ```sh
   pnpm start
   ```

### Empaquetar la aplicación

Para generar el instalador de la aplicación:

```sh
pnpm run build
```

El instalador se generará en la carpeta `release`.

## Estructura del proyecto

```
GarosNotes/
├── main.js                    # Proceso principal de Electron
├── package.json               # Configuración del proyecto y dependencias
├── LICENSE                    # Licencia MIT del proyecto
├── preload.js                 # Script de preload (deprecado, movido a src/)
├── src/                       # Código fuente de la aplicación
│   ├── index.html            # Página principal de la aplicación
│   ├── renderer.js           # Lógica del proceso renderer y eventos
│   ├── preload.js            # Script de preload actualizado
│   ├── js/                   # Módulos JavaScript
│   │   ├── FolderManager.js  # Gestión de carpetas
│   │   └── NotesManager.js   # Gestión de notas y editor
│   ├── styles/               # Estilos CSS
│   │   ├── styles.css        # Estilos principales de la aplicación
│   │   └── syntax-highlighting.css  # Estilos para resaltado de sintaxis
│   └── img/                  # Recursos de imagen
│       └── img_note_bg.ico   # Icono de la aplicación
├── release/                  # Carpeta generada con los instaladores
└── README.md                 # Documentación del proyecto
```

## Funcionalidades principales

### Gestión de carpetas

- **Crear**: Botón "+" en la sección de carpetas
- **Renombrar**: Botón ✏️ junto a cada carpeta
- **Eliminar**: Botón 🗑️ junto a cada carpeta

### Gestión de notas

- **Crear**: Botón "+" en la sección de notas (requiere seleccionar una carpeta)
- **Editar**: Click en cualquier nota para abrirla en el editor
- **Renombrar**: Click en el título de la nota cuando está abierta
- **Eliminar**: Botón de eliminar en la lista de notas
- **Autoguardado**: Las notas se guardan automáticamente cada 3 segundos

### Atajos de teclado

- **Ctrl + B**: Mostrar/ocultar sidebar
- **Escape**: Cerrar modales abiertos
- **Enter**: Confirmar en modales de texto

## Tecnologías utilizadas

- **[Electron](https://www.electronjs.org/)**: Framework para aplicaciones de escritorio
- **[Quill.js](https://quilljs.com/)**: Editor de texto enriquecido
- **[Highlight.js](https://highlightjs.org/)**: Resaltado de sintaxis para código
- **HTML5, CSS3, JavaScript ES6+**: Tecnologías web estándar

## Personalización

- **Icono de la aplicación**: Reemplaza el archivo `src/img/img_note_bg.ico`
- **Estilos**: Modifica los archivos CSS en `src/styles/`
- **Almacenamiento**: Las notas se guardan en `Documents/GarosNotes` de tu usuario

## Desarrollo

### Scripts disponibles

```sh
pnpm start          # Inicia la aplicación en modo desarrollo
pnpm run build      # Genera el instalador para distribución
pnpm run dist       # Genera el instalador sin publicar
```

### Arquitectura

La aplicación sigue una arquitectura modular:

- **main.js**: Proceso principal, maneja la ventana y los IPC handlers
- **renderer.js**: Coordinador de eventos y inicialización
- **FolderManager.js**: Lógica específica para carpetas
- **NotesManager.js**: Lógica específica para notas y editor
- **preload.js**: Bridge seguro entre main y renderer processes

## Contribuir

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una idea para mejorar GarosNotes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Créditos

Esta aplicación no es un diseño original. La idea principal y el diseño de la interfaz fueron tomados de [RevNotes-Desktop](https://github.com/RevienMaker/RevNotes-Desktop) por RevienMaker. ¡Gracias por el excelente trabajo!

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - consulta el archivo LICENSE para más detalles.

---

Desarrollado por Oscar Garzon / GarosDev
