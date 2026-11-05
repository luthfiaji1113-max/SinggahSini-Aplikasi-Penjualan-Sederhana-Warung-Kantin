const grid = document.getElementById('warehouseGrid');
const overlay = document.getElementById('overlay');
const formPopup = document.getElementById('formPopup');
const dataForm = document.getElementById('dataForm');
const itemInput = document.getElementById('item');
const quantityInput = document.getElementById('quantity');
const deleteButton = document.getElementById('deleteButton');
let currentBox = null;
// Membuat kotak-kotak dalam grid
for (let i = 0; i < 20; i++) {
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.index = i;
    grid.appendChild(box);
    // Event klik pada kotak untuk membuka form
    box.addEventListener('click', function() {
        currentBox = box;
        const data = currentBox.dataset;
        itemInput.value = data.item || '';
        quantityInput.value = data.quantity || '';
        formPopup.style.display = 'block';
        overlay.style.display = 'block';
    });
    // Event hover untuk menampilkan status penuh atau kosong
    box.addEventListener('mouseover', function() {
        const statusText = box.classList.contains('filled') ? 'Penuh' : 'Kosong';
        const statusDiv = box.querySelector('.status');
        statusDiv.textContent = statusText;
    });
}
// Menutup form popup
document.getElementById('closeButton').addEventListener('click', function() {
    formPopup.style.display = 'none';
    overlay.style.display = 'none';
});
// Menangani submit form untuk menyimpan data
dataForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const item = itemInput.value;
    const quantity = quantityInput.value;
    if (item && quantity) {
        currentBox.innerHTML = `<strong>${item}</strong><br>${quantity} pcs<div class="status">Penuh</div>`;
        currentBox.classList.add('filled');
        currentBox.dataset.item = item;
        currentBox.dataset.quantity = quantity;
        formPopup.style.display = 'none';
        overlay.style.display = 'none';
    }
});