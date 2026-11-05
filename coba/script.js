// Storage Sementara (Array Objects)
let items = [
  { name: 'Nasi Goreng', qty: 15 },
  { name: 'Es Teh Manis', qty: 30 }
];

// --- NAVIGATION & AUTHENTICATION LOGIC ---
function switchAuth(type) {
  if (type === 'register') {
    document.getElementById('login-form-box').classList.add('hidden');
    document.getElementById('register-form-box').classList.remove('hidden');
  } else {
    document.getElementById('register-form-box').classList.add('hidden');
    document.getElementById('login-form-box').classList.remove('hidden');
  }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  // Simulasi Login
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('hidden');
  renderData();
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Registrasi berhasil! Silakan login.');
  switchAuth('login');
});

function logout() {
  document.getElementById('app-page').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
}

function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(`section-${sectionName}`).classList.remove('hidden');
}

// --- CRUD & TABLE LOGIC ---
function renderData(dataToRender = items) {
  const tbody = document.getElementById('dataTableBody');
  const laporanList = document.getElementById('laporanList');
  tbody.innerHTML = '';
  laporanList.innerHTML = '';

  dataToRender.forEach((item, index) => {
    // Render Baris Tabel
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>
          <button class="btn btn-warning" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-danger" onclick="deleteItem(${index})">Hapus</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;

    // Render Halaman Laporan
    laporanList.innerHTML += `<li><strong>${item.name}</strong> - Stok Tersedia: ${item.qty}</li>`;
  });

  document.getElementById('totalDataCount').innerText = items.length;
}

// Tambah / Update Data
document.getElementById('dataForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('itemName').value;
  const qty = parseInt(document.getElementById('itemQty').value);
  const editIndex = parseInt(document.getElementById('editIndex').value);

  if (editIndex === -1) {
    // Tambah Data Baru
    items.push({ name, qty });
  } else {
    // Update Data Exsiting
    items[editIndex] = { name, qty };
  }

  resetForm();
  renderData();
});

function editItem(index) {
  document.getElementById('itemName').value = items[index].name;
  document.getElementById('itemQty').value = items[index].qty;
  document.getElementById('editIndex').value = index;

  document.getElementById('formTitle').innerText = 'Edit Data Item';
  document.getElementById('btnSubmitForm').innerText = 'Update Data';
  document.getElementById('btnCancelEdit').classList.remove('hidden');
}

function deleteItem(index) {
  if (confirm('Yakin ingin menghapus data ini?')) {
    items.splice(index, 1);
    renderData();
  }
}

function resetForm() {
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('editIndex').value = -1;

  document.getElementById('formTitle').innerText = 'Form Input Data';
  document.getElementById('btnSubmitForm').innerText = 'Tambah Data';
  document.getElementById('btnCancelEdit').classList.add('hidden');
}

// Pencarian Data
function filterTable() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filtered = items.filter(item => item.name.toLowerCase().includes(keyword));
  renderData(filtered);
}