class FolderManager {
	constructor(folderListId) {
		this.folderList = document.getElementById(folderListId);
	}

	async crearCarpeta(nombre) {
		console.log("Intentando crear carpeta:", nombre);
		try {
			const res = await window.api.crearCarpeta(nombre);
			if (res.ok) {
				console.log("Carpeta creada exitosamente");
				this.cerrarModal();
				await this.mostrarCarpetas();
			} else {
				alert("Error: " + res.error);
			}
		} catch (error) {
			console.error("Error en crearCarpeta:", error);
			alert("Error al crear carpeta: " + error.message);
		}
	}

	async mostrarCarpetas() {
		try {
			const res = await window.api.listarCarpetas();
			this.folderList.innerHTML = "";
			if (res.ok) {
				if (res.carpetas.length === 0) {
					this.folderList.innerHTML = "<li>No hay carpetas</li>";
				} else {
					res.carpetas.forEach((nombre) => {
						const li = document.createElement("li");
						li.className = "folder-item";
						li.textContent = nombre;
						this.folderList.appendChild(li);
					});
				}
			} else {
				this.folderList.innerHTML = `<li>Error: ${res.error}</li>`;
			}
		} catch (error) {
			console.error("Error en mostrarCarpetas:", error);
			this.folderList.innerHTML = `<li>Error: ${error.message}</li>`;
		}
	}

	abrirModal() {
		document.getElementById("modal").style.display = "block";
		document.getElementById("folder-name").value = "";
		document.getElementById("folder-name").focus();
	}

	cerrarModal() {
		document.getElementById("modal").style.display = "none";
	}

	bindEvents() {
		document.getElementById("create-folder").addEventListener("click", () => {
			console.log("Click en crear carpeta");
			this.abrirModal();
		});

		document.getElementById("close-modal").addEventListener("click", () => {
			this.cerrarModal();
		});

		document.getElementById("save-folder").addEventListener("click", async () => {
			const nombre = document.getElementById("folder-name").value.trim();
			console.log("Click en guardar, nombre:", nombre);
			if (!nombre) {
				alert("El nombre no puede estar vacío");
				return;
			}
			await this.crearCarpeta(nombre);
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") this.cerrarModal();
		});
	}
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM cargado");

	// Verificar que window.api existe
	if (typeof window.api === "undefined") {
		console.error("window.api no está disponible");
		return;
	}

	console.log("window.api disponible:", window.api);

	const folderManager = new FolderManager("folders");
	folderManager.bindEvents();
	folderManager.mostrarCarpetas();
});
