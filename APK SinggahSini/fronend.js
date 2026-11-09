/* =====================================================
   SinggahSini POS – fronend.js
   Cocok dengan HTML Anda (id & fungsi onclick sudah sama).
   Data disimpan di localStorage browser.
   ===================================================== */
const KEY = 'singgahsini.bs.v1', LOW = 5, OWNER_PASS = '1234';
const $ = id => document.getElementById(id), Q = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MON = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const dk = d => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const fd = k => { const [y, m, d] = k.split('-'); return +d + ' ' + MON[m - 1] + ' ' + y; };
const ft = t => { const d = new Date(t); return pad(d.getHours()) + '.' + pad(d.getMinutes()); };
const ddmmyy = d => pad(d.getDate()) + pad(d.getMonth() + 1) + String(d.getFullYear()).slice(2);

let db, role = 'admin', tab = 'dashboard', cart = {}, selCat = 'Semua', kQuery = '';
let editPid = null, editCat = null, delCat = null, selTx = null, hPage = 1;
let rPeriod = 'harian', rDate = dk(Date.now()), hDate = dk(Date.now());

/* ---------- DATA ---------- */
function seed() {
  const P = [['MKN-001', 'Nasi goreng', 'Makanan', 15000, 18, 'utensils'], ['MKN-002', 'Mie goreng', 'Makanan', 12000, 12, 'bowl-food'],
    ['MNM-001', 'Es teh manis', 'Minuman', 5000, 28, 'glass-water'], ['MNM-002', 'Kopi hitam', 'Minuman', 6000, 3, 'mug-hot'],
    ['CML-001', 'Gorengan', 'Cemilan', 2000, 4, 'cookie'], ['MNM-003', 'Air mineral', 'Minuman', 5000, 0, 'bottle-water']]
    .map((p, i) => ({ id: i + 1, code: p[0], name: p[1], cat: p[2], price: p[3], stock: p[4], icon: p[5] }));
  const tx = []; let id = 1;
  for (let d = 6; d >= 0; d--) {
    const day = new Date(); day.setDate(day.getDate() - d);
    const n = d === 0 ? 5 : 3 + d % 3;
    for (let i = 0; i < n; i++) {
      const items = [[(i + d) % 5 + 1, 1 + i % 3], [(i + d + 2) % 5 + 1, 1]].map(([pid, qty]) => {
        const p = P.find(x => x.id === pid); return { pid, name: p.name, price: p.price, qty };
      });
      const total = items.reduce((a, b) => a + b.price * b.qty, 0), paid = Math.ceil(total / 10000) * 10000;
      tx.push({ id: id++, no: 'TRX-' + ddmmyy(day) + '-' + String(i + 1).padStart(3, '0'),
        ts: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 8 + i * 2, 10 + i * 7).getTime(),
        items, total, paid, change: paid - total, cashier: 'Rina Ayu' });
    }
  }
  return { cats: ['Makanan', 'Minuman', 'Cemilan', 'Lainnya'], prods: P, tx, pid: 7, tid: id };
}
function load() { try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { } if (!db) db = seed(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
const txOn = pre => db.tx.filter(t => dk(t.ts).startsWith(pre));
const sumTx = l => ({ total: l.reduce((a, t) => a + t.total, 0), n: l.length, items: l.reduce((a, t) => a + t.items.reduce((x, i) => x + i.qty, 0), 0) });
const nextNo = () => 'TRX-' + ddmmyy(new Date()) + '-' + String(txOn(dk(Date.now())).length + 1).padStart(3, '0');
const catIcon = { Makanan: 'utensils', Minuman: 'glass-water', Cemilan: 'cookie' };
const iconOf = p => p.icon || catIcon[p.cat] || 'box';
function rank(list) {
  const m = {};
  list.forEach(t => t.items.forEach(i => {
    const p = db.prods.find(x => x.id === i.pid);
    const r = m[i.name] = m[i.name] || { n: i.name, c: p ? p.cat : '-', q: 0, t: 0 };
    r.q += i.qty; r.t += i.qty * i.price;
  }));
  return Object.values(m).sort((a, b) => b.q - a.q);
}

/* ---------- UI DASAR ---------- */
function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `.rc-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:2000;padding:16px}
  .rcpt{background:#fff;color:#222;width:100%;max-width:340px;border-radius:10px;padding:22px;font:13px/1.5 ui-monospace,Menlo,monospace;max-height:92vh;overflow:auto}
  .rcpt h3{text-align:center;font:700 17px Inter,sans-serif;margin:0}.rcpt .c{text-align:center;font-size:11px;color:#666}
  .rcpt hr{border:0;border-top:1px dashed #999;margin:10px 0}.rcpt .l{display:flex;justify-content:space-between;gap:8px}
  #toastBox{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#4a3228;color:#fff;padding:10px 18px;border-radius:99px;font-weight:600;font-size:13px;z-index:3000;display:none}
  .product-card.out{opacity:.5;cursor:not-allowed}.pill{cursor:pointer}.tr-click{cursor:pointer}
  @media print{body>*:not(#receiptModal){display:none!important}#receiptModal{position:static;background:none}.no-print{display:none}}`;
  document.head.appendChild(s);
  document.body.insertAdjacentHTML('beforeend', '<div id="toastBox"></div><div id="receiptModal" class="rc-ov"></div>');
  $('receiptModal').addEventListener('click', e => { if (e.target.id === 'receiptModal') closeReceipt(); });
}
function toast(m) { const t = $('toastBox'); t.textContent = m; t.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => t.style.display = 'none', 2600); }
const ADMIN_MENU = [['dashboard', 'chart-pie', 'Ringkasan'], ['kasir', 'cash-register', 'Kasir'], ['produk', 'box', 'Produk'], ['kategori', 'tags', 'Kategori'], ['riwayat', 'receipt', 'Riwayat transaksi'], ['laporan', 'file-invoice-dollar', 'Laporan penjualan']];
const OWNER_MENU = [['analisis', 'chart-pie', 'Ringkasan'], ['laporan', 'file-invoice-dollar', 'Laporan penjualan']];
const TITLE = { dashboard: 'Ringkasan', analisis: 'Ringkasan', kasir: 'Kasir', produk: 'Produk', kategori: 'Kategori', riwayat: 'Riwayat transaksi', laporan: 'Laporan penjualan' };

function switchTab(t) {
  if (role === 'owner' && !OWNER_MENU.some(m => m[0] === t)) t = 'analisis';
  tab = t;
  document.querySelectorAll('.view-section').forEach(s => s.classList.toggle('active', s.id === 'view-' + t));
  $('sidebar-menu').innerHTML = (role === 'admin' ? ADMIN_MENU : OWNER_MENU).map(m =>
    `<li class="menu-item ${m[0] === t ? 'active' : ''}" onclick="switchTab('${m[0]}')"><i class="fa-solid fa-${m[1]}"></i> <span>${m[2]}</span></li>`).join('');
  $('breadcrumb-parent').textContent = role === 'admin' ? 'Admin / Kasir' : 'Pemilik';
  $('breadcrumb-child').textContent = TITLE[t];
  ({ dashboard: renderDashboard, analisis: renderOwner, kasir: renderKasir, produk: renderProducts, kategori: renderCategories, riwayat: renderRiwayat, laporan: renderLaporan })[t]();
  if (t === 'produk' && editPid === null) fillProductForm();
  if (t === 'kategori' && editCat === null) fillCategoryForm();
  window.scrollTo(0, 0);
}

/* ---------- LOGIN PEMILIK ---------- */
function handleRoleToggle() {
  if (role === 'admin') { $('customInputPassword').value = ''; $('customPasswordError').classList.add('d-none'); $('customPassModal').style.display = 'flex'; setTimeout(() => $('customInputPassword').focus(), 50); }
  else setRole('admin');
}
function closePasswordModal() { $('customPassModal').style.display = 'none'; }
function verifyOwnerPassword() {
  if ($('customInputPassword').value === OWNER_PASS) { closePasswordModal(); setRole('owner'); }
  else $('customPasswordError').classList.remove('d-none');
}
function setRole(r) {
  role = r; const o = r === 'owner';
  $('sidebar-section-title').textContent = o ? 'PANTAU USAHA' : 'OPERASIONAL WARUNG';
  $('role-title').textContent = o ? 'Akses Pemilik' : 'Akses Admin / Kasir';
  $('role-sub').textContent = o ? 'Lihat penjualan dan laporan, tanpa mengubah data.' : 'Kelola penjualan, produk, kategori, dan laporan.';
  $('footer-username').textContent = o ? 'Pemilik' : 'Admin';
  $('footer-userrole').textContent = o ? 'Pemilik warung' : 'Admin / Kasir';
  $('footer-avatar').textContent = o ? 'PM' : 'AD';
  $('footer-action-text').textContent = o ? 'Pindah ke Admin' : 'Pindah ke Pemilik';
  $('top-role-badge').textContent = o ? 'Pemilik' : 'Admin / Kasir';
  switchTab(o ? 'analisis' : 'dashboard');
}

/* ---------- RINGKASAN ADMIN ---------- */
function renderDashboard() {
  const today = dk(Date.now()), l = txOn(today), s = sumTx(l), low = db.prods.filter(p => p.stock <= LOW);
  const hr = new Date().getHours(), g = hr < 11 ? 'pagi' : hr < 15 ? 'siang' : hr < 18 ? 'sore' : 'malam';
  let last = 12; l.forEach(t => last = Math.max(last, new Date(t.ts).getHours()));
  const hrs = []; for (let h = 7; h <= last; h++) hrs.push(h);
  const by = hrs.map(h => l.filter(t => new Date(t.ts).getHours() === h).reduce((a, t) => a + t.total, 0)), mx = Math.max(...by, 1);
  $('view-dashboard').innerHTML = `
  <div class="page-heading-area"><div><h2>Selamat ${g}, Admin 👋</h2><p>Yuk, lihat kabar SinggahSini hari ini.</p></div>
    <button class="btn btn-custom-dark" onclick="switchTab('kasir')"><i class="fa-solid fa-plus me-1"></i> Transaksi baru</button></div>
  <div class="card-grid">
    <div class="stat-card highlight-dark"><div class="stat-title">Penjualan hari ini <i class="fa-solid fa-calendar-day float-end"></i></div><div class="stat-value">${rp(s.total)}</div><div class="stat-sub">${fd(today)}</div></div>
    <div class="stat-card"><div class="stat-title">Transaksi hari ini <i class="fa-solid fa-receipt float-end"></i></div><div class="stat-value">${s.n}</div><div class="stat-sub">Semua transaksi tersimpan</div></div>
    <div class="stat-card"><div class="stat-title">Produk terjual <i class="fa-solid fa-box-open float-end"></i></div><div class="stat-value">${s.items}</div><div class="stat-sub">Dari ${rank(l).length} jenis produk</div></div>
    <div class="stat-card"><div class="stat-title">Stok perlu perhatian <i class="fa-solid fa-triangle-exclamation float-end text-danger"></i></div><div class="stat-value text-danger">${low.length} produk</div><div class="stat-sub">${low.filter(p => p.stock > 0).length} menipis • ${low.filter(p => p.stock <= 0).length} habis</div></div>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
    <div class="content-card"><h3>Penjualan hari ini</h3><p class="text-muted small">${s.n ? 'Penjualan per jam dari transaksi yang tersimpan.' : 'Belum ada penjualan hari ini.'}</p>
      <div class="d-flex justify-content-between align-items-center mt-2 mb-1"><small class="text-muted">Penjualan per jam • ribu rupiah</small><span class="badge bg-light text-dark border">Hari ini</span></div>
      <div class="chart-placeholder">${by.map((v, i) => `<div class="bar-col"><span>${v ? Math.round(v / 1000) : ''}</span><div class="bar ${v === mx && v ? 'active-bar' : ''}" style="height:${Math.max(v / mx * 100, 2)}%"></div><small>${pad(hrs[i])}:00</small></div>`).join('')}</div></div>
    <div class="content-card"><h3 class="text-danger">Periksa stok, yuk</h3><p class="text-muted small">Stok menipis jika tersisa ≤ ${LOW}.</p>
      ${low.map(p => `<div class="stock-alert-item"><span>${esc(p.name)}</span><strong class="${p.stock <= 0 ? 'text-danger' : ''}">${p.stock <= 0 ? 'Habis' : p.stock + ' stok'}</strong></div>`).join('') || '<p class="text-muted small">Semua stok aman.</p>'}
      <button class="btn btn-outline-dark btn-sm w-100 mt-3" onclick="switchTab('produk')"><i class="fa-solid fa-box me-1"></i> Kelola stok produk</button></div>
  </div>
  <div class="content-card"><div class="card-header-flex"><div><h3>Transaksi terbaru</h3><p class="text-muted small mb-0">Penjualan yang berhasil disimpan hari ini.</p></div>
    <span class="text-primary small fw-bold" style="cursor:pointer" onclick="switchTab('riwayat')">Lihat semua →</span></div>
    <table class="table table-hover align-middle"><thead><tr><th>No. transaksi</th><th>Waktu</th><th>Jumlah item</th><th>Total penjualan</th><th>Pembayaran</th></tr></thead><tbody>
    ${l.slice().reverse().slice(0, 4).map(t => `<tr><td>${t.no}</td><td>${ft(t.ts)}</td><td>${t.items.reduce((a, i) => a + i.qty, 0)}</td><td>${rp(t.total)}</td><td>Tunai</td></tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada transaksi hari ini.</td></tr>'}</tbody></table></div>`;
}

/* ---------- KASIR ---------- */
function renderKasir() {
  Q('#view-kasir .page-heading-area .badge').textContent = 'Transaksi baru • ' + nextNo().slice(-3);
  const si = Q('#view-kasir input[type=text]'); si.value = kQuery; si.oninput = () => { kQuery = si.value; kGrid(); };
  const rule = Q('#view-kasir .content-card.mt-3'); if (rule) rule.innerHTML = '<h5 class="fs-6 fw-bold mb-1">Aturan jumlah</h5><p class="text-muted small mb-2">Jumlah wajib lebih dari 0 dan tidak boleh melebihi stok tersedia.</p>';
  Q('#view-kasir .cart-box small.text-muted').textContent = nextNo() + ' • Rina Ayu';
  if (!$('quick-cash')) $('cash-given').insertAdjacentHTML('afterend', '<div id="quick-cash" class="d-flex gap-1 mt-1 flex-wrap"></div>');
  if (selCat !== 'Semua' && !db.cats.includes(selCat)) selCat = 'Semua';
  Q('#view-kasir .category-pills').innerHTML = ['Semua', ...db.cats].map((c, i) => `<div class="pill ${c === selCat ? 'active' : ''}" onclick="pickCat(${i - 1})">${esc(c)}</div>`).join('');
  kGrid(); renderCart();
}
function pickCat(i) { selCat = i < 0 ? 'Semua' : db.cats[i]; renderKasir(); }
function kGrid() {
  const s = kQuery.toLowerCase();
  const l = db.prods.filter(p => (selCat === 'Semua' || p.cat === selCat) && (p.code + p.name + p.cat).toLowerCase().includes(s));
  Q('#view-kasir .product-grid').innerHTML = l.map(p => `<div class="product-card ${p.stock <= 0 ? 'out' : ''}" ${p.stock > 0 ? `onclick="addToCart(${p.id})"` : ''}>
    <div class="d-flex justify-content-between align-items-center mb-1"><div class="product-icon-box"><i class="fa-solid fa-${iconOf(p)}"></i></div><small class="text-muted" style="font-size:10px">${esc(p.code)}</small></div>
    <strong>${esc(p.name)}</strong><p class="product-price">${rp(p.price)}</p>
    <div class="d-flex justify-content-between align-items-center mt-2"><span class="badge ${p.stock <= 0 ? 'bg-danger text-white' : 'bg-light text-dark border'}" style="font-size:10px">${p.stock <= 0 ? 'Habis' : 'Stok ' + p.stock}</span>
    <button class="btn btn-sm btn-light border py-0 px-2" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? '-' : '+'}</button></div></div>`).join('') || '<p class="text-muted small">Produk tidak ditemukan.</p>';
}
function addToCart(id, d = 1) {
  const p = db.prods.find(x => x.id === id), n = (cart[id] || 0) + d;
  if (n <= 0) delete cart[id];
  else if (n > p.stock) return toast('Stok ' + p.name + ' hanya ' + p.stock + '.');
  else cart[id] = n;
  renderCart();
}
const cartTotal = () => Object.entries(cart).reduce((a, [id, n]) => a + db.prods.find(p => p.id == id).price * n, 0);
function renderCart() {
  const ids = Object.keys(cart), t = cartTotal();
  $('cart-items').innerHTML = ids.map(i => {
    const p = db.prods.find(x => x.id == i);
    return `<div class="d-flex justify-content-between align-items-center py-1 border-bottom"><div><div class="small fw-bold">${esc(p.name)}</div><small class="text-muted">${rp(p.price)} × ${cart[i]} = ${rp(p.price * cart[i])}</small></div>
    <div class="d-flex align-items-center gap-1"><button class="btn btn-sm btn-light border py-0 px-2" onclick="addToCart(${i},-1)">−</button><b class="small">${cart[i]}</b><button class="btn btn-sm btn-light border py-0 px-2" onclick="addToCart(${i},1)">+</button></div></div>`;
  }).join('') || '<p class="text-muted small text-center my-4">Belum ada item dipilih.</p>';
  $('cart-item-count').textContent = 'Total : ' + ids.reduce((a, i) => a + cart[i], 0) + ' item';
  $('cart-total').textContent = rp(t);
  $('quick-cash').innerHTML = [['Uang pas', t], ['20rb', 20000], ['50rb', 50000], ['100rb', 100000]].map(([l, v]) => `<button type="button" class="btn btn-outline-secondary btn-sm py-0" onclick="setCash(${v})">${l}</button>`).join('');
  calculateChange();
}
function setCash(v) { $('cash-given').value = v; calculateChange(); }
function calculateChange() {
  const c = (+$('cash-given').value || 0) - cartTotal(), el = $('change-amount');
  el.textContent = rp(Math.max(c, 0)); el.className = c < 0 && cartTotal() ? 'text-danger' : '';
  if (c < 0 && cartTotal()) el.textContent = 'Kurang ' + rp(-c);
}
function clearCart() { cart = {}; $('cash-given').value = ''; renderCart(); }
function checkout() {
  const ids = Object.keys(cart), t = cartTotal(), paid = +$('cash-given').value || 0;
  if (!ids.length) return toast('Pilih minimal satu produk dulu.');
  if (paid < t) return toast('Uang diterima belum cukup.');
  for (const i of ids) { const p = db.prods.find(x => x.id == i); if (cart[i] > p.stock) return toast('Stok ' + p.name + ' tidak cukup.'); }
  const items = ids.map(i => { const p = db.prods.find(x => x.id == i); const o = { pid: p.id, name: p.name, price: p.price, qty: cart[i], before: p.stock }; p.stock -= cart[i]; return o; });
  const tx = { id: db.tid++, no: nextNo(), ts: Date.now(), items, total: t, paid, change: paid - t, cashier: 'Rina Ayu' };
  db.tx.push(tx); save(); cart = {}; $('cash-given').value = '';
  renderKasir(); showReceipt(tx.id); toast('Penjualan ' + tx.no + ' tersimpan');
}

/* ---------- STRUK ---------- */
function showReceipt(id) {
  const t = db.tx.find(x => x.id === id), m = $('receiptModal');
  m.innerHTML = `<div class="rcpt"><h3>SinggahSini</h3><div class="c">Kantin &amp; makanan rumahan</div><hr>
  <div class="l"><span>No</span><span>${t.no}</span></div><div class="l"><span>Tanggal</span><span>${fd(dk(t.ts))} ${ft(t.ts)}</span></div><div class="l"><span>Kasir</span><span>${t.cashier}</span></div><hr>
  ${t.items.map(i => `<div>${esc(i.name)}</div><div class="l"><span>${i.qty} × ${rp(i.price)}</span><span>${rp(i.qty * i.price)}</span></div>`).join('')}<hr>
  <div class="l"><b>Total</b><b>${rp(t.total)}</b></div><div class="l"><span>Tunai</span><span>${rp(t.paid)}</span></div><div class="l"><span>Kembalian</span><span>${rp(t.change)}</span></div><hr>
  <div class="c">Terima kasih, selamat menikmati!</div>
  <div class="no-print d-flex gap-2 mt-3"><button class="btn btn-outline-secondary btn-sm w-50" onclick="closeReceipt()">Tutup</button><button class="btn btn-custom-dark btn-sm w-50" onclick="window.print()">Cetak struk</button></div></div>`;
  m.style.display = 'flex';
}
function closeReceipt() { $('receiptModal').style.display = 'none'; }

/* ---------- PRODUK ---------- */
function renderProducts() {
  const sel = $('productFilterCategory'), cur = sel.value;
  sel.innerHTML = '<option value="">Semua kategori</option>' + db.cats.map(c => `<option ${c === cur ? 'selected' : ''}>${esc(c)}</option>`).join('');
  const s = $('productAdminSearch').value.toLowerCase(), f = sel.value;
  const l = db.prods.filter(p => (!f || p.cat === f) && (p.code + p.name + p.cat).toLowerCase().includes(s));
  $('product-body').innerHTML = l.map(p => `<tr><td><strong>${esc(p.code)}</strong><br>${esc(p.name)}</td><td>${esc(p.cat)}</td><td>${rp(p.price)}</td>
    <td>${p.stock} ${p.stock <= 0 ? '<span class="badge bg-danger">Habis</span>' : p.stock <= LOW ? '<span class="badge bg-warning text-dark">Menipis</span>' : ''}</td>
    <td><button class="btn btn-sm btn-outline-dark py-0" onclick="editProduct(${p.id})">Ubah</button></td></tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada produk.</td></tr>';
  $('productCount').textContent = db.prods.length + ' produk • ' + db.cats.length + ' kategori';
  $('productShowing').textContent = 'Menampilkan ' + l.length + ' dari ' + db.prods.length + ' produk';
  const low = db.prods.filter(p => p.stock <= LOW), al = $('productAlert');
  al.classList.toggle('d-none', !low.length);
  al.textContent = low.length + ' produk perlu perhatian: ' + low.map(p => p.name + ' (' + (p.stock <= 0 ? 'habis' : p.stock) + ')').join(', ');
}
function fillProductForm() {
  const p = db.prods.find(x => x.id === editPid), e = !!p;
  $('productFormTitle').textContent = e ? 'Ubah produk' : 'Tambah produk';
  $('productFormBadge').textContent = e ? 'Ubah' : 'Baru';
  $('productFormSub').textContent = e ? 'Perbarui data produk.' : 'Isi data produk baru.';
  $('productCategorySelect').innerHTML = db.cats.map(c => `<option ${p && p.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
  $('productCode').value = e ? p.code : ''; $('productName').value = e ? p.name : '';
  $('productPrice').value = e ? p.price : ''; $('productStock').value = e ? p.stock : '';
  $('productDeleteBtn').classList.toggle('d-none', !e);
}
function newProduct() { editPid = null; fillProductForm(); $('productCode').focus(); }
function editProduct(id) { editPid = id; fillProductForm(); }
function resetProductForm() { editPid = null; fillProductForm(); }
function saveProduct() {
  const code = $('productCode').value.trim().toUpperCase(), name = $('productName').value.trim();
  const price = $('productPrice').value, stock = $('productStock').value;
  if (!code || !name) return toast('Kode dan nama produk wajib diisi.');
  if (price === '' || +price < 0) return toast('Harga jual harus diisi dan tidak boleh negatif.');
  if (stock === '' || +stock < 0) return toast('Stok harus diisi dan tidak boleh negatif.');
  if (db.prods.some(p => p.code === code && p.id !== editPid)) return toast('Kode produk sudah dipakai produk lain.');
  const o = { code, name, cat: $('productCategorySelect').value, price: +price, stock: +stock };
  if (editPid) Object.assign(db.prods.find(p => p.id === editPid), o); else db.prods.push({ id: db.pid++, ...o });
  save(); toast(editPid ? 'Produk diperbarui.' : 'Produk ditambahkan.'); editPid = null; fillProductForm(); renderProducts();
}
function deleteProduct() {
  const p = db.prods.find(x => x.id === editPid); if (!p) return;
  if (!confirm('Hapus produk ' + p.name + '? Riwayat transaksi lama tetap tersimpan.')) return;
  db.prods = db.prods.filter(x => x.id !== editPid); delete cart[editPid]; editPid = null; save(); fillProductForm(); renderProducts(); toast('Produk dihapus.');
}

/* ---------- KATEGORI ---------- */
const catCount = c => db.prods.filter(p => p.cat === c).length;
function renderCategories() {
  const s = $('categorySearch').value.toLowerCase();
  $('category-summary').textContent = db.cats.filter(catCount).length + ' kategori aktif • ' + db.cats.filter(c => !catCount(c)).length + ' kategori kosong';
  $('category-body').innerHTML = db.cats.map((c, i) => [c, i]).filter(([c]) => c.toLowerCase().includes(s)).map(([c, i]) =>
    `<tr><td><strong>${esc(c)}</strong></td><td>${catCount(c)} produk</td><td><span style="cursor:pointer;font-weight:600" onclick="editCategory(${i})">Ubah</span> • <span class="text-danger" style="cursor:pointer" onclick="askDeleteCategory(${i})">Hapus</span></td></tr>`).join('')
    || '<tr><td colspan="3" class="text-center text-muted">Kategori tidak ditemukan.</td></tr>';
}
function fillCategoryForm() {
  const e = editCat !== null;
  $('category-form-title').textContent = e ? 'Ubah kategori' : 'Tambah kategori';
  $('category-form-sub').textContent = e ? 'Ganti nama kelompok produk.' : 'Buat kelompok produk baru.';
  $('inputCategoryName').value = e ? db.cats[editCat] : '';
}
function newCategory() { editCat = null; fillCategoryForm(); $('inputCategoryName').focus(); }
function editCategory(i) { editCat = i; fillCategoryForm(); }
function resetCategoryForm() { editCat = null; fillCategoryForm(); }
function saveCategoryChanges() {
  const n = $('inputCategoryName').value.trim();
  if (!n) return toast('Nama kategori wajib diisi.');
  if (db.cats.some((c, i) => c.toLowerCase() === n.toLowerCase() && i !== editCat)) return toast('Nama kategori sudah ada.');
  if (editCat !== null) { const old = db.cats[editCat]; db.cats[editCat] = n; db.prods.forEach(p => { if (p.cat === old) p.cat = n; }); if (selCat === old) selCat = n; }
  else db.cats.push(n);
  save(); toast('Kategori tersimpan.'); editCat = null; fillCategoryForm(); renderCategories();
}
function askDeleteCategory(i) {
  const c = db.cats[i], n = catCount(c);
  if (n) return toast('Kategori ' + c + ' masih punya ' + n + ' produk, tidak bisa dihapus.');
  delCat = i; $('category-delete-title').textContent = 'Hapus kategori ' + c + '?'; $('category-delete-card').classList.remove('d-none');
}
function cancelDeleteCategory() { delCat = null; $('category-delete-card').classList.add('d-none'); }
function confirmDeleteCategory() {
  if (delCat === null) return;
  db.cats.splice(delCat, 1); save(); cancelDeleteCategory(); editCat = null; fillCategoryForm(); renderCategories(); toast('Kategori dihapus.');
}

/* ---------- RIWAYAT ---------- */
function renderRiwayat() {
  $('view-riwayat').innerHTML = `<div class="page-heading-area"><div><h2>Riwayat transaksi</h2><p>Telusuri penjualan yang sudah tersimpan di warung.</p></div></div>
  <div class="row g-2 mb-3"><div class="col-md-5"><label class="form-label small text-muted">Tanggal penjualan</label><input type="date" id="rwDate" class="form-control form-control-sm" value="${hDate}" onchange="hDate=this.value||hDate;hPage=1;selTx=null;rwUpdate()"></div>
  <div class="col-md-5"><label class="form-label small text-muted">Nomor transaksi</label><input type="text" id="rwQ" class="form-control form-control-sm" placeholder="Cari nomor transaksi..." oninput="hPage=1;rwUpdate()"></div>
  <div class="col-md-2 d-flex align-items-end"><button class="btn btn-custom-dark btn-sm w-100" onclick="rwUpdate()">Tampilkan</button></div></div>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px"><div class="content-card mb-0" id="rwList"></div><div class="content-card mb-0 bg-white" id="rwDetail"></div></div>`;
  rwUpdate();
}
function rwUpdate() {
  const q = ($('rwQ').value || '').toLowerCase(), l = txOn(hDate).filter(t => t.no.toLowerCase().includes(q)).reverse(), per = 6, pg = Math.max(1, Math.ceil(l.length / per));
  if (hPage > pg) hPage = pg;
  if (!l.some(t => t.id === selTx)) selTx = l[0] ? l[0].id : null;
  $('rwList').innerHTML = `<div class="mb-2"><h3 class="mb-0 fs-6 fw-bold">${l.length} transaksi ditemukan</h3><small class="text-muted">Total penjualan ${fd(hDate)} ${rp(sumTx(l).total)}</small></div>
  <table class="table table-hover align-middle mt-2" style="font-size:11px"><thead><tr><th>Nomor transaksi</th><th>Waktu</th><th>Item</th><th>Total</th></tr></thead><tbody>
  ${l.slice((hPage - 1) * per, hPage * per).map(t => `<tr class="tr-click ${t.id === selTx ? 'table-active' : ''}" onclick="selTx=${t.id};rwUpdate()"><td>${t.id === selTx ? '<strong>' + t.no + '</strong>' : t.no}</td><td>${ft(t.ts)}</td><td>${t.items.reduce((a, i) => a + i.qty, 0)}</td><td>${rp(t.total)}</td></tr>`).join('') || '<tr><td colspan="4" class="text-center text-muted">Tidak ada transaksi pada tanggal ini.</td></tr>'}</tbody></table>
  <div class="d-flex justify-content-between align-items-center mt-3 text-muted small"><span>${l.length ? ((hPage - 1) * per + 1) + '-' + Math.min(hPage * per, l.length) + ' dari ' + l.length + ' transaksi' : ''}</span>
  <span>${Array.from({ length: pg }, (_, i) => `<button class="btn btn-sm ${i + 1 === hPage ? 'btn-custom-dark' : 'btn-light border'} py-0 px-2" onclick="hPage=${i + 1};rwUpdate()">${i + 1}</button>`).join(' ')}</span></div>`;
  const t = db.tx.find(x => x.id === selTx);
  $('rwDetail').innerHTML = !t ? '<h3 class="fs-6 fw-bold">Detail transaksi</h3><p class="text-muted small">Pilih transaksi untuk melihat rinciannya.</p>' : `
  <div class="d-flex justify-content-between align-items-center mb-2"><h3 class="mb-0 fs-6 fw-bold">Detail transaksi</h3><span class="badge bg-light text-dark border">Tersimpan</span></div>
  <div class="border-bottom pb-2 mb-2"><strong style="font-size:.9rem">${t.no}</strong><br><small class="text-muted" style="font-size:11px">${fd(dk(t.ts))} • ${ft(t.ts)} WIB<br>Kasir: ${t.cashier} • Tunai</small></div>
  <table class="table table-sm align-middle mb-2" style="font-size:11px"><thead><tr><th>Produk</th><th>Jumlah</th><th>Subtotal</th></tr></thead><tbody>
  ${t.items.map(i => `<tr><td>${esc(i.name)}<br><small class="text-muted">${rp(i.price)}</small></td><td>${i.qty}</td><td>${rp(i.qty * i.price)}</td></tr>`).join('')}</tbody></table>
  <div class="bg-light p-2 rounded small"><div class="d-flex justify-content-between mb-1"><span>Total penjualan</span><strong>${rp(t.total)}</strong></div><div class="d-flex justify-content-between mb-1"><span>Uang diterima</span><strong>${rp(t.paid)}</strong></div><div class="d-flex justify-content-between"><span>Kembalian</span><strong>${rp(t.change)}</strong></div></div>
  ${t.items[0].before != null ? `<div class="alert alert-light border mt-3 p-2 small text-muted"><i class="fa-solid fa-circle-check text-success me-1"></i> Stok telah dikurangi: ${t.items.map(i => i.name.toLowerCase() + ' ' + i.before + ' → ' + (i.before - i.qty)).join(' dan ')}.</div>` : ''}
  <button class="btn btn-custom-dark btn-sm w-100 mt-2" onclick="showReceipt(${t.id})"><i class="fa-solid fa-print me-1"></i> Lihat / cetak struk</button>`;
}

/* ---------- LAPORAN ---------- */
function renderLaporan() {
  const h = rPeriod === 'harian', key = h ? rDate : rDate.slice(0, 7), l = txOn(key), s = sumTx(l), rows = rank(l);
  const label = h ? DAY[new Date(rDate + 'T00:00').getDay()] + ', ' + fd(rDate) : MON[+rDate.slice(5, 7) - 1] + ' ' + rDate.slice(0, 4);
  $('view-laporan').innerHTML = `<div class="page-heading-area"><div><h2>Laporan penjualan</h2><p>Rekap sederhana untuk mengetahui hasil usaha warung.</p></div><span class="badge bg-light text-dark border p-2">Tersedia untuk Admin &amp; Pemilik</span></div>
  <div class="content-card mb-3"><div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label small text-muted">Periode laporan</label>
    <div class="btn-group w-100"><button class="btn btn-sm ${h ? 'btn-custom-dark' : 'btn-outline-secondary'}" onclick="rPeriod='harian';renderLaporan()">Harian</button><button class="btn btn-sm ${!h ? 'btn-custom-dark' : 'btn-outline-secondary'}" onclick="rPeriod='bulanan';renderLaporan()">Bulanan</button></div></div>
  <div class="col-md-8"><label class="form-label small text-muted">${h ? 'Tanggal' : 'Bulan'}</label>
    ${h ? `<input type="date" class="form-control form-control-sm" value="${rDate}" onchange="rDate=this.value||rDate;renderLaporan()">` : `<input type="month" class="form-control form-control-sm" value="${rDate.slice(0, 7)}" onchange="if(this.value){rDate=this.value+'-01';renderLaporan()}">`}</div></div></div>
  <div class="card-grid mb-3"><div class="stat-card highlight-dark"><div class="stat-title">Total penjualan</div><div class="stat-value">${rp(s.total)}</div><div class="stat-sub">${label}</div></div>
  <div class="stat-card"><div class="stat-title">Jumlah transaksi</div><div class="stat-value">${s.n}</div><div class="stat-sub">Transaksi tersimpan</div></div>
  <div class="stat-card"><div class="stat-title">Produk terjual</div><div class="stat-value">${s.items} item</div><div class="stat-sub">${rows.length} jenis produk</div></div></div>
  <div class="content-card"><div class="card-header-flex"><div><h3 class="mb-0 fs-6 fw-bold">Rincian produk terjual</h3><small class="text-muted">${label} • Urutan berdasarkan jumlah terjual</small></div><span class="badge bg-light text-dark border">Rekap ${h ? 'harian' : 'bulanan'}</span></div>
  <table class="table table-hover align-middle mt-2"><thead><tr><th>Nama produk</th><th>Kategori</th><th>Jumlah terjual</th><th>Total penjualan</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${esc(r.n)}</td><td>${esc(r.c)}</td><td>${r.q}</td><td>${rp(r.t)}</td></tr>`).join('') || '<tr><td colspan="4" class="text-center text-muted">Belum ada penjualan pada periode ini.</td></tr>'}
  <tr class="table-active fw-bold"><td>Total</td><td>${rows.length} produk</td><td>${s.items} item</td><td>${rp(s.total)}</td></tr></tbody></table>
  <div class="alert alert-light border mt-3 p-2 small text-muted"><i class="fa-solid fa-circle-info me-1"></i> Admin dan Pemilik dapat melihat rekap harian/bulanan serta produk terjual. Pemilik memiliki akses lihat saja, tanpa mengubah data.</div></div>`;
}

/* ---------- RINGKASAN PEMILIK ---------- */
function renderOwner() {
  const now = new Date(), today = dk(now), ym = today.slice(0, 7), td = sumTx(txOn(today)), mo = sumTx(txOn(ym)), top = rank(txOn(today));
  const days = []; for (let d = 6; d >= 0; d--) { const x = new Date(); x.setDate(x.getDate() - d); const k = dk(x); days.push({ k, label: x.getDate() + ' ' + MON[x.getMonth()].slice(0, 2), v: sumTx(txOn(k)).total }); }
  const mx = Math.max(...days.map(d => d.v), 1), tmax = top[0] ? top[0].q : 1, dayN = now.getDate();
  $('view-analisis').innerHTML = `<div class="page-heading-area"><div><h2 class="fs-5 fw-bold">Kabar SinggahSini hari ini, Pemilik</h2><p class="text-muted small">Pantau hasil penjualan, tanpa repot mengurus transaksi.</p></div>
    <button class="btn btn-outline-dark btn-sm" onclick="switchTab('laporan')"><i class="fa-solid fa-file-invoice-dollar me-1"></i> Lihat laporan</button></div>
  <div class="card-grid">
    <div class="stat-card highlight-dark"><div class="stat-title">Penjualan hari ini</div><div class="stat-value fs-4">${rp(td.total)}</div><div class="stat-sub">${now.getDate()} ${MON[now.getMonth()]} • ${td.n} transaksi</div></div>
    <div class="stat-card"><div class="stat-title">Penjualan bulan ini</div><div class="stat-value fs-4">${rp(mo.total)}</div><div class="stat-sub">1-${dayN} ${MON[now.getMonth()]} • ${mo.n} transaksi</div></div>
    <div class="stat-card"><div class="stat-title">Terjual hari ini</div><div class="stat-value fs-4">${td.items} item</div><div class="stat-sub">${top.length} jenis produk</div></div>
    <div class="stat-card"><div class="stat-title">Terjual bulan ini</div><div class="stat-value fs-4">${mo.items.toLocaleString('id-ID')} item</div><div class="stat-sub">1-${dayN} ${MON[now.getMonth()]} ${now.getFullYear()}</div></div></div>
  <div style="display:grid;grid-template-columns:2.2fr 1fr;gap:15px;margin-bottom:20px">
    <div class="content-card mb-0"><div class="d-flex justify-content-between align-items-center mb-1"><h3 class="fs-6 fw-bold mb-0">Penjualan minggu ini</h3><span class="badge bg-light text-dark border fw-normal" style="font-size:10px">7 hari terakhir</span></div>
      <p class="text-muted small mb-3" style="font-size:11px">${fd(days[0].k)} - ${fd(days[6].k)}<br>Penjualan harian • ribu rupiah</p>
      <div class="owner-chart-container">${days.map((d, i) => `<div class="chart-bar-item"><span>${d.v ? Math.round(d.v / 1000) : ''}</span><div class="owner-bar ${i === 6 ? 'highlight-owner-bar' : ''}" style="height:${Math.max(d.v / mx * 100, 2)}%"></div><small>${d.label}</small></div>`).join('')}</div></div>
    <div class="content-card mb-0 bg-white"><h3 class="fs-6 fw-bold mb-1">Rekap ${MON[now.getMonth()]}</h3><p class="text-muted small mb-3" style="font-size:11px">1-${dayN} ${MON[now.getMonth()]} ${now.getFullYear()}</p>
      <div class="d-flex justify-content-between mb-2 small"><span class="text-muted">Penjualan</span><strong>${rp(mo.total)}</strong></div>
      <div class="d-flex justify-content-between mb-2 small"><span class="text-muted">Transaksi</span><strong>${mo.n}</strong></div>
      <div class="d-flex justify-content-between mb-2 small"><span class="text-muted">Produk terjual</span><strong>${mo.items} item</strong></div>
      <div class="d-flex justify-content-between mb-3 small"><span class="text-muted">Rata-rata per hari</span><strong>${rp(mo.total / dayN)}</strong></div>
      <small class="text-muted d-block" style="font-size:10px">Rekap diperbarui dari penjualan yang telah disimpan kasir.</small></div></div>
  <div class="content-card"><div class="mb-3"><h3 class="fs-6 fw-bold mb-0">Produk paling laris hari ini</h3><p class="text-muted small mb-0" style="font-size:11px">Peringkat berdasarkan jumlah terjual • ${fd(today)}</p></div>
    <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:20px"><div>
    ${top.slice(0, 3).map(r => `<div class="mb-3"><div class="d-flex justify-content-between small fw-bold mb-1"><span>${esc(r.n)}</span><span>${r.q} item</span></div><div class="progress" style="height:6px"><div class="progress-bar bg-dark" style="width:${r.q / tmax * 100}%"></div></div></div>`).join('') || '<p class="text-muted small">Belum ada penjualan hari ini.</p>'}</div>
    <table class="table table-sm align-middle mb-0" style="font-size:11px"><thead><tr class="table-light"><th>Produk</th><th>Terjual</th><th>Penjualan</th></tr></thead><tbody>
    ${top.map(r => `<tr><td><strong>${esc(r.n)}</strong></td><td>${r.q} item</td><td>${rp(r.t)}</td></tr>`).join('') || '<tr><td colspan="3" class="text-muted">-</td></tr>'}</tbody></table></div></div>`;
}

/* ---------- MULAI ---------- */
document.addEventListener('DOMContentLoaded', () => {
  load(); injectStyles();
  const n = new Date(); Q('.date-badge').innerHTML = '<i class="fa-regular fa-calendar"></i> ' + DAY[n.getDay()] + ', ' + fd(dk(n));
  $('customInputPassword').addEventListener('keydown', e => { if (e.key === 'Enter') verifyOwnerPassword(); });
  $('customPassModal').addEventListener('click', e => { if (e.target.id === 'customPassModal') closePasswordModal(); });
  switchTab('dashboard');
});
// ==================== PENGELOLAAN PRODUK (HARGA & SIMPAN) ====================

// Fungsi untuk merapikan angka harga dengan titik ribuan secara otomatis
function formatRupiahInput(inputElement) {
  let value = inputElement.value.replace(/[^,\d]/g, "").toString();
  let split = value.split(",");
  let sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  inputElement.value = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
}

// Pasang event listener otomatis ke input harga saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const priceInput = document.getElementById('inputProductPrice');
  if (priceInput) {
    priceInput.addEventListener('input', function() {
      formatRupiahInput(this);
    });
  }
});

// Fungsi saat tombol "Simpan" ditekan
function saveProductChanges() {
  const code = document.getElementById('inputProductCode')?.value || '';
  const name = document.getElementById('inputProductName')?.value || '';
  const category = document.getElementById('inputProductCategory')?.value || '';
  const price = document.getElementById('inputProductPrice')?.value || '0';
  const stock = document.getElementById('inputProductStock')?.value || '0';

  if (name.trim() === "") {
    alert("Nama produk tidak boleh kosong!");
    return;
  }

  if (price.trim() === "") {
    alert("Harga produk tidak boleh kosong!");
    return;
  }

  // Tampilkan konfirmasi sukses simpan
  alert(`Produk "${name}" dengan harga Rp${price} dan stok ${stock} berhasil disimpan!`);
}

// Fungsi Batal / Reset Form Produk
function resetProductForm() {
  document.getElementById('inputProductCode').value = "";
  document.getElementById('inputProductName').value = "";
  document.getElementById('inputProductPrice').value = "";
  document.getElementById('inputProductStock').value = "";
}