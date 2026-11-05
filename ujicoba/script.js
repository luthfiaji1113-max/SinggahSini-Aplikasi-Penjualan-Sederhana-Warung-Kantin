// Initial Data
const products = [
  { id: 1, name: "Nasi Goreng", category: "Makanan", sku: "MKN-01", price: 15000, stock: 18, initialStock: 20, sold: 2 },
  { id: 2, name: "Teh Obeng", category: "Minuman", sku: "MNM-01", price: 7000, stock: 10, initialStock: 10, sold: 8 },
  { id: 3, name: "Dimsum", category: "Camilan", sku: "CML-01", price: 12000, stock: 15, initialStock: 16, sold: 1 }
];

let cart = [
  { productId: 1, qty: 1 },
  { productId: 2, qty: 2 }
];

let selectedCategory = "Semua";
let selectedProductId = 1;
let detailQtyVal = 1;

// Navigation Switcher
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  const navItems = document.querySelectorAll('.nav-item');
  if (tabName === 'menu') navItems[0].classList.add('active');
  if (tabName === 'kasir') navItems[1].classList.add('active');
  if (tabName === 'keranjang') navItems[2].classList.add('active');
  if (tabName === 'stok') navItems[3].classList.add('active');
  if (tabName === 'rekap') navItems[4].classList.add('active');

  renderAll();
}

// Render Menu Cards
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const searchVal = document.getElementById('searchInput').value.toLowerCase();

  products.forEach(p => {
    if ((selectedCategory === "Semua" || p.category === selectedCategory) &&
        p.name.toLowerCase().includes(searchVal)) {
      
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.onclick = (e) => {
        if (!e.target.classList.contains('btn-add-quick')) {
          openDetail(p.id);
        }
      };

      card.innerHTML = `
        <div class="card-img-placeholder">
          <div class="img-icon">
            <div class="img-sun"></div>
            <div class="img-mountain"></div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-info-text">
            <span class="card-category">${p.category}</span>
            <span class="card-title">${p.name}</span>
            <span class="card-price">Rp.${p.price.toLocaleString('id-ID')}</span>
          </div>
          <button class="btn-add-quick" onclick="quickAddToCart(${p.id})">+</button>
        </div>
      `;
      grid.appendChild(card);
    }
  });
}

function filterCategory(cat, btn) {
  selectedCategory = cat;
  document.querySelectorAll('.categories .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderMenu();
}

function filterMenu() {
  renderMenu();
}

// Detail Product Page
function openDetail(id) {
  selectedProductId = id;
  detailQtyVal = 1;
  const p = products.find(prod => prod.id === id);

  document.getElementById('detailBreadcrumb').innerText = p.name;
  document.getElementById('detailCat').innerText = p.category;
  document.getElementById('detailTitle').innerText = p.name;
  document.getElementById('detailSku').innerText = p.sku;
  document.getElementById('detailPrice').innerText = `Rp. ${p.price.toLocaleString('id-ID')}`;
  document.getElementById('detailStockBadge').innerText = `${p.stock} tersisa`;
  document.getElementById('detailQty').innerText = detailQtyVal;
  document.getElementById('maxHint').innerText = `maks. ${p.stock}`;
  document.getElementById('qtyError').style.display = 'none';

  switchTab('detail');
}

function changeDetailQty(delta) {
  const p = products.find(prod => prod.id === selectedProductId);
  const newQty = detailQtyVal + delta;
  const errEl = document.getElementById('qtyError');

  if (newQty < 1) {
    errEl.innerText = "Jumlah harus lebih dari 0";
    errEl.style.display = "block";
    return;
  }

  if (newQty > p.stock) {
    errEl.innerText = `Maaf, stok hanya tersedia ${p.stock}`;
    errEl.style.display = "block";
    return;
  }

  errEl.style.display = "none";
  detailQtyVal = newQty;
  document.getElementById('detailQty').innerText = detailQtyVal;
}

function addToCartFromDetail() {
  const existing = cart.find(item => item.productId === selectedProductId);
  if (existing) {
    existing.qty += detailQtyVal;
  } else {
    cart.push({ productId: selectedProductId, qty: detailQtyVal });
  }
  alert("Menu berhasil ditambahkan ke keranjang!");
  switchTab('kasir');
}

function buyNowFromDetail() {
  addToCartFromDetail();
}

function quickAddToCart(id) {
  const existing = cart.find(item => item.productId === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ productId: id, qty: 1 });
  }
  renderAll();
}

// Cart Render (Shared by Kasir & Keranjang Tab)
function renderCartContainers() {
  const kasirList = document.getElementById('kasirCartList');
  const keranjangList = document.getElementById('keranjangCartList');

  let html = '';
  let subtotal = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    const itemTotal = p.price * item.qty;
    subtotal += itemTotal;
    totalItems += item.qty;

    html += `
      <div class="cart-item">
        <div>
          <div class="cart-item-title">${p.name}</div>
          <div class="cart-item-sub">Rp.${p.price.toLocaleString('id-ID')}/porsi</div>
          <div style="font-weight: 700; font-size: 13px; margin-top: 4px;">Rp.${itemTotal.toLocaleString('id-ID')}</div>
        </div>
        <div class="qty-control">
          <button class="btn-qty" onclick="updateCartQty(${p.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="btn-qty" onclick="updateCartQty(${p.id}, 1)">+</button>
        </div>
      </div>
    `;
  });

  if (cart.length === 0) {
    html = '<div style="text-align: center; color: #9ca3af; padding: 20px;">Belum ada item di keranjang</div>';
  }

  if (kasirList) kasirList.innerHTML = html;
  if (keranjangList) keranjangList.innerHTML = html;

  document.getElementById('kasirSubtotal').innerText = `Rp.${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('keranjangSubtotal').innerText = `Rp.${subtotal.toLocaleString('id-ID')}`;

  document.getElementById('kasirItemCount').innerText = `${totalItems} item`;
  document.getElementById('cartTabItemCount').innerText = `${totalItems} item`;
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.productId === id);
  const p = products.find(prod => prod.id === id);

  if (item) {
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      cart = cart.filter(i => i.productId !== id);
    } else if (newQty > p.stock) {
      alert(`Maaf, stok hanya tersedia ${p.stock}`);
    } else {
      item.qty = newQty;
    }
  }
  renderAll();
}

function setOrderType(type, btn) {
  document.querySelectorAll('.order-type-toggle .btn-toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setPayMethod(method, btn) {
  document.querySelectorAll('.payment-methods .pay-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function checkout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  // Deduct Stock
  cart.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    p.stock -= item.qty;
    p.sold += item.qty;
  });

  cart = [];
  alert("Transaksi Berhasil!");
  renderAll();
  switchTab('rekap');
}

// Render Tables
function renderTables() {
  // Stock Table
  const stokBody = document.getElementById('stokTableBody');
  if (stokBody) {
    stokBody.innerHTML = '';
    products.forEach(p => {
      stokBody.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.initialStock}</td>
          <td>${p.sold}</td>
          <td><strong>${p.stock}</strong></td>
        </tr>
      `;
    });
  }

  // Rekap Table
  const rekapBody = document.getElementById('rekapTableBody');
  if (rekapBody) {
    rekapBody.innerHTML = '';
    let grandTotal = 0;

    products.forEach(p => {
      const total = p.sold * p.price;
      grandTotal += total;
      rekapBody.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong><br><small style="color: #6b7280">${p.category}</small></td>
          <td>${p.sold} Porsi</td>
          <td>Rp.${p.price.toLocaleString('id-ID')}</td>
          <td>Rp.${total.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    document.getElementById('totalOmzet').innerText = `Rp.${grandTotal.toLocaleString('id-ID')}`;
  }
}

function renderAll() {
  renderMenu();
  renderCartContainers();
  renderTables();
}

// Init when loaded
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
});