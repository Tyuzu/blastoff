
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-file-upload]").forEach(component => {

    const dropzone = component.querySelector(".upload-dropzone");
    const input = component.querySelector(".upload-input");
    const fileList = component.querySelector(".upload-file-list");
    const clearButton = component.querySelector(".upload-clear");

    const maxSize = 10 * 1024 * 1024;

    const multiple = input.hasAttribute("multiple");

    let files = [];

    function formatSize(bytes) {

      return bytes < 1024 * 1024
        ? (bytes / 1024).toFixed(1) + " KB"
        : (bytes / (1024 * 1024)).toFixed(2) + " MB";

    }

    function addFiles(selectedFiles) {

      Array.from(selectedFiles).forEach(file => {

        if (file.size > maxSize) {
          alert(file.name + " exceeds the 10 MB limit.");
          return;
        }

        if (!multiple && files.length >= 1) {
          alert("Only one file is allowed.");
          return;
        }

        if (files.some(existing =>
          existing.name === file.name &&
          existing.size === file.size
        )) {
          return;
        }

        files.push({
          id: crypto.randomUUID(),
          file
        });

      });

      renderFiles();

    }

    function renderFiles() {

      fileList.replaceChildren();

      files.forEach(item => {

        const row = document.createElement("div");
        row.className = "upload-file-item";

        const info = document.createElement("div");
        info.className = "upload-file-info";

        const name = document.createElement("strong");
        name.textContent = item.file.name;

        const size = document.createElement("small");
        size.textContent = formatSize(item.file.size);

        info.append(name, size);

        if (item.file.type.startsWith("image/")) {

          const image = document.createElement("img");
          image.className = "upload-preview";
          image.alt = "";
          image.src = URL.createObjectURL(item.file);

          row.append(image);

        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "upload-remove";
        remove.textContent = "Remove";

        remove.addEventListener("click", () => {

          files = files.filter(file => file.id !== item.id);
          renderFiles();

        });

        row.append(info, remove);

        fileList.append(row);

      });

      clearButton.hidden = files.length === 0;

    }

    dropzone.addEventListener("click", event => {

      if (event.target === input) return;

      input.click();

    });

    dropzone.addEventListener("keydown", event => {

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }

    });

    input.addEventListener("change", () => {

      addFiles(input.files);
      input.value = "";

    });

    ["dragenter", "dragover"].forEach(eventName => {

      dropzone.addEventListener(eventName, event => {

        event.preventDefault();
        dropzone.classList.add("drag-over");

      });

    });

    ["dragleave", "drop"].forEach(eventName => {

      dropzone.addEventListener(eventName, event => {

        event.preventDefault();
        dropzone.classList.remove("drag-over");

      });

    });

    dropzone.addEventListener("drop", event => {

      addFiles(event.dataTransfer.files);

    });

    clearButton.addEventListener("click", () => {

      files = [];
      renderFiles();

    });

    // Keep the component's selected File objects available
    // to application code without exposing them globally.
    component.getSelectedFiles = () =>
      files.map(item => item.file);

  });

});
