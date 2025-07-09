  const tierList = document.getElementById('tier-list');
  let currentDragged = null;
  let currentDraggedRow = null;

  function showAddRowForm() {
    document.getElementById('new-row-form').style.display = 'block';
  }

  function cancelAddRow() {
    document.getElementById('new-row-form').style.display = 'none';
    document.getElementById('new-row-name').value = "";
    document.getElementById('new-row-color').value = "#ff0000";
  }

  function confirmAddRow(name = "", color = "#444") {
    name = name || document.getElementById('new-row-name').value || "Новая";
    color = color || document.getElementById('new-row-color').value || "#444";

    const row = document.createElement('div');
    row.className = 'tier-row';
    row.draggable = true;

    row.ondragstart = () => currentDraggedRow = row;
    row.ondragover = e => {
      e.preventDefault();
      if (row !== currentDraggedRow) row.classList.add('drag-over');
    };
    row.ondragleave = () => row.classList.remove('drag-over');
    row.ondrop = e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (row !== currentDraggedRow) {
        tierList.insertBefore(currentDraggedRow, row.nextSibling);
      }
      currentDraggedRow = null;
    };

    const label = document.createElement('div');
    label.className = 'row-label';
    label.contentEditable = true;
    label.innerText = name;
    label.style.background = color;

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = color;
    colorPicker.oninput = e => label.style.background = e.target.value;
    label.appendChild(colorPicker);

    const container = document.createElement('div');
    container.className = 'row-images';
    container.ondragover = e => e.preventDefault();
    container.ondrop = e => handleDrop(e, container);

    row.appendChild(label);
    row.appendChild(container);
    tierList.appendChild(row);
    cancelAddRow();
  }

  function handleFileUpload(event) {
    const files = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = e => {
        const imgWrapper = createDraggableImage(e.target.result);
        document.getElementById('upload-pool').appendChild(imgWrapper);
        saveImagesToLocalStorage();
      };
      reader.readAsDataURL(file);
    }
  }

  function createDraggableImage(src) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const img = document.createElement('img');
    img.src = src;
    img.draggable = true;
    img.ondragstart = () => currentDragged = wrapper;
    img.ondragend = () => currentDragged = null;
    img.ondblclick = () => {
      document.getElementById('upload-pool').appendChild(wrapper);
      saveImagesToLocalStorage();
    };

    const delBtn = document.createElement('div');
    delBtn.innerText = '✖';
    delBtn.title = 'Удалить';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '2px';
    delBtn.style.right = '4px';
    delBtn.style.cursor = 'pointer';
    delBtn.style.background = 'rgba(0,0,0,0.6)';
    delBtn.style.color = 'white';
    delBtn.style.borderRadius = '50%';
    delBtn.style.width = '18px';
    delBtn.style.height = '18px';
    delBtn.style.fontSize = '14px';
    delBtn.style.textAlign = 'center';
    delBtn.style.lineHeight = '18px';
    delBtn.onclick = () => {
      wrapper.remove();
      saveImagesToLocalStorage();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    return wrapper;
  }

  function handleDrop(e, container) {
    e.preventDefault();
    if (currentDragged && container !== currentDragged.parentElement) {
      container.appendChild(currentDragged);
      saveImagesToLocalStorage();
    }
  }

  function saveImagesToLocalStorage() {
    const pool = document.getElementById('upload-pool');
    const imgs = pool.querySelectorAll('img');
    let data = Array.from(imgs).map(img => img.src);

    if (data.length > 500) {
      data = data.slice(-500); // Максимум 500
    }

    try {
      localStorage.setItem('uploadedImages', JSON.stringify(data));
    } catch (e) {
      alert("Слишком много изображений — часть может не сохраниться.");
    }
  }

  function loadImagesFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    for (const src of data) {
      const wrapper = createDraggableImage(src);
      document.getElementById('upload-pool').appendChild(wrapper);
    }
  }

  function toggleTheme() {
    document.body.classList.toggle('light');
  }

  window.addEventListener('DOMContentLoaded', () => {
    loadImagesFromLocalStorage();
    ['S', 'A', 'B', 'C', 'D'].forEach((label, i) => {
      const colors = ['#e6194b', '#f58231', '#ffe119', '#3cb44b', '#4363d8'];
      confirmAddRow(label, colors[i]);
    });
  });