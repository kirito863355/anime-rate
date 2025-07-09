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
      row.ondragover = (e) => {
        e.preventDefault();
        if (row !== currentDraggedRow) row.classList.add('drag-over');
      };
      row.ondragleave = () => row.classList.remove('drag-over');
      row.ondrop = (e) => {
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
          const img = createDraggableImage(e.target.result);
          document.getElementById('upload-pool').appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }

    function createDraggableImage(src) {
      const img = document.createElement('img');
      img.src = src;
      img.draggable = true;
      img.ondragstart = () => currentDragged = img;
      img.ondragend = () => currentDragged = null;
      img.ondblclick = () => img.remove();
      return img;
    }

    function handleDrop(e, container) {
      e.preventDefault();
      if (currentDragged && container !== currentDragged.parentElement) {
        container.appendChild(currentDragged);
      }
    }

    function toggleTheme() {
      document.body.classList.toggle('light');
    }

    function exportTierList() {
      const rows = [];
      tierList.querySelectorAll('.tier-row').forEach(row => {
        const label = row.querySelector('.row-label').innerText.trim();
        const color = row.querySelector('input[type="color"]').value;
        const images = Array.from(row.querySelectorAll('img')).map(img => img.src);
        rows.push({ label, color, images });
      });
      const poolImages = Array.from(document.querySelectorAll('#upload-pool img')).map(img => img.src);
      const data = { rows, poolImages };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tier-list.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importTierList(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const data = JSON.parse(e.target.result);
        tierList.innerHTML = '';
        document.getElementById('upload-pool').innerHTML = '';
        data.poolImages.forEach(src => {
          const img = createDraggableImage(src);
          document.getElementById('upload-pool').appendChild(img);
        });
        data.rows.forEach(row => {
          confirmAddRow(row.label, row.color);
          const container = tierList.lastChild.querySelector('.row-images');
          row.images.forEach(src => {
            const img = createDraggableImage(src);
            container.appendChild(img);
          });
        });
      };
      reader.readAsText(file);
    }

    window.addEventListener('DOMContentLoaded', () => {
      ['S', 'A', 'B', 'C', 'D'].forEach((label, i) => {
        const colors = ['#e6194b', '#f58231', '#ffe119', '#3cb44b', '#4363d8'];
        confirmAddRow(label, colors[i]);
      });
    });