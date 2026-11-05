/* =========================================================
   SINGGAHSINI - APLIKASI KASIR & KANTIN (PELANGGAN & ADMIN)
   ========================================================= */

// Password default untuk masuk ke Panel Admin
const ADMIN_PASSWORD = "admin123";

const EMO={'MKN-01':'🍛','MKN-02':'🍝','MKN-03':'🍗','MKN-04':'🍖','MKN-06':'🍜','MKN-07':'🍜','MKN-08':'🍚','MKN-09':'🍚','MKN-10':'🥗','MKN-11':'🥘','MKN-12':'🍢','MKN-13':'🥡','MKN-14':'🍝','MKN-15':'🐟','MKN-16':'🥣','MNM-01':'🧋','MNM-02':'🍊','MNM-03':'☕','CML-01':'🥟','CML-02':'🍪','CML-04':'🍌','CML-05':'🍟'};
const BG={Makanan:'linear-gradient(135deg,#f6e8d5,#ebd3b8)',Minuman:'linear-gradient(135deg,#f6e8d5,#ebd3b8)',Camilan:'linear-gradient(135deg,#f6e8d5,#ebd3b8)'};
const bgc=p=>BG[p.c]||BG.Makanan;
const WIKI={"MKN-01": "en/Nasi_goreng", "MKN-02": "en/Mie_goreng", "MKN-03": "en/Ayam_geprek", "MKN-04": "en/Ayam_bakar", "MKN-06": "en/Bakso", "MKN-07": "en/Mie_ayam", "MKN-08": "en/Nasi_uduk", "MKN-09": "en/Nasi_kuning", "MKN-10": "en/Gado-gado", "MKN-11": "en/Rendang", "MKN-12": "en/Satay", "MKN-13": "en/Cap_cai", "MKN-14": "en/Char_kway_teow", "MKN-15": "en/Pecel_lele", "MKN-16": "en/Bubur_ayam", "MNM-01": "en/Iced_tea", "MNM-02": "en/Orange_juice", "MNM-03": "en/Iced_coffee", "CML-01": "en/Dim_sum", "CML-02": "en/Cookie", "CML-04": "en/Pisang_goreng", "CML-05": "en/French_fries"};

let FC={};try{FC=JSON.parse(localStorage.getItem('fotoCache')||'{}')}catch(e){}
const foto=(p,big)=>{const w=FC[p.id];return `<div class="ph-img"><span class="emo ${big?'big':''}">${EMO[p.id]||'🍽️'}</span><img data-id="${p.id}" ${w?'data-t="w"':''} src="${w||'img/'+p.id+'.jpg'}" alt="${p.n}" referrerpolicy="no-referrer" onerror="fotoErr(this)"></div>`};

async function getWiki(id){
  if(id in FC)return FC[id];const w=WIKI[id];if(!w)return null;
  try{const [l,t]=w.split('/'),r=await fetch(`https://${l}.wikipedia.org/api/rest_v1/page/summary/${t}`),j=await r.json();
    const u=j.thumbnail&&j.thumbnail.source;FC[id]=u?u.replace(/\/\d+px-/,'/500px-'):null}catch(e){return null}
  try{localStorage.setItem('fotoCache',JSON.stringify(FC))}catch(e){}return FC[id]}

function fotoErr(img){
  if(img.dataset.t==='w'){img.remove();return}
  img.dataset.t='w';getWiki(img.dataset.id).then(u=>u?img.src=u:img.remove())}

let P=[
  {id:'MKN-01',n:'Nasi Goreng',c:'Makanan',p:15000,s:18,s0:28,sold:0,d:'Nasi goreng khas kantin dengan telur, ayam suwir, dan kerupuk.'},
  {id:'MKN-02',n:'Mie Goreng',c:'Makanan',p:12000,s:15,s0:17,sold:0,d:'Mie goreng bumbu gurih dengan sayur dan telur dadar.'},
  {id:'CML-01',n:'Gorengan',c:'Camilan',p:2000,s:30,s0:30,sold:0,d:'Gorengan hangat renyah serba dua ribu.'},
  {id:'MKN-06',n:'Bakso',c:'Makanan',p:10000,s:20,s0:20,sold:0,d:'Bakso kuah kaldu sapi gurih dengan mie dan bihun.'},
  {id:'MNM-01',n:'Teh Obeng',c:'Minuman',p:5000,s:25,s0:25,sold:0,d:'Teh manis dingin segar pelepas dahaga.'},
  {id:'MNM-02',n:'Es Jeruk',c:'Minuman',p:6000,s:20,s0:20,sold:0,d:'Es jeruk peras asli manis alami.'}
];

const st={
  cart:[],
  mode:'Makan di tempat',
  pay:'Tunai',
  note:'',
  cat:'Semua',
  q:'',
  admin:false,
  dq:1,
  dw:'',
  seq:1,
  cats:[{n:'Makanan',d:'Hidangan utama'},{n:'Minuman',d:'Minuman dingin dan panas'},{n:'Camilan',d:'Makanan ringan'}],
  hist:[
    {no:'TRX-001',ts:Date.now()-18e5,items:[{id:'MKN-01',n:'Nasi Goreng',q:2,h:15000},{id:'MNM-01',n:'Teh Obeng',q:2,h:5000}],mode:'Makan di tempat',pay:'Tunai',note:''}
  ],
  f:{prodQ:'', prodC:'Semua', katQ:'', trxQ:'', rekapPer:'Harian'},
  ed:null
};

const $=s=>document.querySelector(s), prod=id=>P.find(x=>x.id===id);
const rp=n=>'Rp '+(n||0).toLocaleString('id-ID');
const MAXD=p=>Math.min(5,p.s);
const total=()=>st.cart.reduce((a,i)=>a+(prod(i.id)?.p||0)*i.q,0);
const count=()=>st.cart.reduce((a,i)=>a+i.q,0);
const msg=(q,p)=>q<1?'Jumlah harus lebih dari 0':q>p.s?'Maaf, stok hanya tersedia '+p.s:'';

function toast(t){const e=$('#toast');if(!e)return alert(t);e.querySelector('.toast-body').textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2000)}
function go(h){location.hash=h}

function mintaPasswordAdmin() {
  if(st.admin) {
    go('admin_produk');
    return;
  }

  openM(`
    <div class="p-2 text-center">
      <div class="mb-3">
        <i class="bi bi-shield-lock text-danger" style="font-size: 3rem;"></i>
      </div>
      <h3 class="fw-bold mb-2">Akses Admin</h3>
      <p class="text-muted small mb-4">Masukkan kata sandi untuk mengelola produk, kategori &amp; rekap</p>
      
      <div class="mb-4 text-start">
        <label class="form-label fw-bold">Kata Sandi</label>
        <input type="password" id="passInput" class="form-control form-control-lg" placeholder="Masukkan password..." onkeydown="if(event.key==='Enter') verifikasiPassword()">
        <div id="passError" class="text-danger small mt-2 d-none">Password salah! Silakan coba lagi.</div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-secondary w-50 py-2 fw-bold" onclick="closeM()">Batal</button>
        <button class="btn btn-solid w-50 py-2 fw-bold" onclick="verifikasiPassword()">Masuk</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const input = document.getElementById('passInput');
    if(input) input.focus();
  }, 200);
}

function verifikasiPassword() {
  const inputEl = document.getElementById('passInput');
  const errEl = document.getElementById('passError');
  
  if (!inputEl) return;
  
  const inputPass = inputEl.value;
  if (inputPass === ADMIN_PASSWORD) {
    st.admin = true;
    closeM();
    toast('Berhasil masuk sebagai Admin');
    render();
    go('admin_produk');
  } else {
    if (errEl) errEl.classList.remove('d-none');
  }
}

function cari(v){st.q=v;if(!location.hash.startsWith('#menu'))go('menu');else render()}
function setCat(c){st.cat=c;render()}

function tambah(id,e){if(e)e.stopPropagation();const p=prod(id),i=st.cart.find(x=>x.id===id);
  if((i?i.q:0)+1>p.s)return toast('Maaf, stok hanya tersedia '+p.s);
  i?i.q++:st.cart.push({id,q:1,w:''});toast(p.n+' ditambahkan ke pesanan');render()}
function chg(id,d){const i=st.cart.find(x=>x.id===id),p=prod(id),nq=i.q+d;if(nq<0)return;i.w=msg(nq,p);i.q=Math.min(nq,p.s);render()}
function del(id){st.cart=st.cart.filter(x=>x.id!==id);render()}
function dchg(d,id){const p=prod(id),nq=st.dq+d;if(nq<0)return;
  st.dw=nq<1?'Jumlah harus lebih dari 0':nq>p.s?'Maaf, stok hanya tersedia '+p.s:nq>5?'Maksimal pembelian 5 per pesanan':'';
  st.dq=Math.min(nq,MAXD(p));render()}
function dAdd(id,now){const p=prod(id);if(st.dq<1){st.dw='Jumlah harus lebih dari 0';return render()}
  const i=st.cart.find(x=>x.id===id);
  if((i?i.q:0)+st.dq>p.s){st.dw='Maaf, stok hanya tersedia '+p.s;return render()}
  i?i.q+=st.dq:st.cart.push({id,q:st.dq,w:''});
  if(now)go('kasir');else{toast('Ditambahkan ke keranjang');render()}}
function simpan(){if(!st.cart.length)return toast('Keranjang masih kosong');toast('Pesanan disimpan');go('kasir')}

function bukaRiwayat(){ go('rekap'); }

function bayar(){
  if(!st.cart.length)return toast('Belum ada pesanan');
  if(st.cart.some(i=>i.q<1||i.q>prod(i.id).s))return toast('Periksa jumlah pesanan terlebih dahulu');
  
  if(st.pay === 'Qris'){
    const tot = total();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SINGGAHSINI-${tot}`;
    openM(`
      <div class="text-center p-3">
        <h3 class="fw-bold mb-2"><i class="bi bi-qr-code me-2"></i>Pembayaran QRIS</h3>
        <p class="fg-secondary small mb-3">Scan kode QR di bawah ini menggunakan e-Wallet / M-Banking Anda</p>
        <div class="bg-white p-3 d-inline-block rounded-3 shadow-sm border mb-3">
          <img src="${qrUrl}" alt="Kode QRIS SinggahSini" width="200" height="200" class="img-fluid">
        </div>
        <div class="fs-4xl fw-bold text-success mb-3">${rp(tot)}</div>
        <button class="btn btn-solid w-100 py-3 fw-bold" onclick="konfirmasiQris()">Konfirmasi Pembayaran Selesai</button>
      </div>
    `);
    return;
  }
  selesaikanTransaksi();
}

function konfirmasiQris(){ closeM(); selesaikanTransaksi(); }

function selesaikanTransaksi(){
  st.cart.forEach(item => {
    const p = prod(item.id);
    if(p) p.s -= item.q;
  });

  st.hist.unshift({
    no:'TRX-'+String(++st.seq).padStart(3,'0'),
    ts:Date.now(),
    items:st.cart.map(i=>{const p=prod(i.id);return {id:i.id,n:p.n,q:i.q,h:p.p}}),
    mode:st.mode,
    pay:st.pay,
    note:st.note
  });
  st.cart=[];st.note='';
  toast('Pembayaran berhasil & Stok diperbarui!');
  go('transaksi');
}

const row=(i,trash)=>{const p=prod(i.id);return `<div class="mb-5">
  <div class="d-flex justify-content-between fw-bold"><span>${p.n}</span><span>${rp(p.p*i.q)}${trash?` <i class="bi bi-trash ms-3 text-danger" role="button" onclick="del('${i.id}')"></i>`:''}</span></div>
  <div class="d-flex justify-content-between align-items-center"><span>${rp(p.p)}/porsi</span>
   <div class="d-flex align-items-center gap-3"><button class="btn btn-outline btn-sm" onclick="chg('${i.id}',-1)">–</button><span>${i.q}</span><button class="btn btn-outline btn-sm" onclick="chg('${i.id}',1)">+</button></div></div>
  ${i.w?`<div class="text-end small fw-bold text-danger">${i.w}</div>`:''}</div>`};

const noteBox=()=>`<div class="input-group my-5"><span class="input-group-text" style="background:#ebd3b8;border:none"><i class="bi bi-journal-text"></i></span>
  <input class="form-control" placeholder="Tambah Catatan Pesanan" value="${st.note.replace(/"/g,'&quot;')}" oninput="st.note=this.value"></div>`;
const subtotal=()=>`<div class="d-flex justify-content-between fw-bold fs-xl mt-7"><span>Subtotal</span><span>${rp(total())}</span></div>`;
const emptyCart='<p class="text-center fg-secondary py-7">Belum ada pesanan. Pilih menu dulu, lalu tekan +.</p>';

function formKategori(namaOld='') {
  const isEdit = Boolean(namaOld);
  const k = st.cats.find(x => x.n === namaOld) || {n: '', d: ''};
  openM(`
    <h3 class="fw-bold mb-4">${isEdit?'Edit':'Tambah'} Kategori Produk</h3>
    <div class="mb-3">
      <label class="form-label fw-bold">Nama Kategori</label>
      <input id="kat_n" class="form-control" value="${esc(k.n)}" placeholder="Misal: Snack">
    </div>
    <div class="mb-4">
      <label class="form-label fw-bold">Deskripsi</label>
      <input id="kat_d" class="form-control" value="${esc(k.d)}" placeholder="Deskripsi kategori...">
    </div>
    <div class="d-flex justify-content-end gap-3">
      <button class="btn btn-secondary" onclick="closeM()">Batal</button>
      <button class="btn btn-solid" onclick="simpanKategori('${esc(namaOld)}')">Simpan</button>
    </div>
  `);
}

function simpanKategori(namaOld) {
  const n = $('#kat_n').value.trim();
  const d = $('#kat_d').value.trim();
  if(!n) return toast('Nama kategori wajib diisi!');

  if(namaOld) {
    const item = st.cats.find(x => x.n === namaOld);
    if(item) { item.n = n; item.d = d; }
    P.forEach(p => { if(p.c === namaOld) p.c = n; });
  } else {
    if(st.cats.some(x => x.n.toLowerCase() === n.toLowerCase())) return toast('Kategori sudah ada!');
    st.cats.push({n, d});
  }
  closeM();
  toast('Kategori berhasil disimpan!');
  render();
}

function hapusKategori(nama) {
  if(confirm(`Hapus kategori "${nama}"?`)) {
    st.cats = st.cats.filter(c => c.n !== nama);
    toast('Kategori dihapus');
    render();
  }
}

function formProduk(id=''){
  const isEdit = Boolean(id);
  const p = prod(id) || {id:'', n:'', c:st.cats[0]?.n||'Makanan', p:10000, s:10, d:''};
  openM(`
    <h3 class="fw-bold mb-4">${isEdit?'Edit Produk':'Tambah Produk Baru'}</h3>
    <div class="row g-3">
      <div class="col-md-4"><label class="form-label fw-bold">Kode Produk</label><input id="p_id" class="form-control" value="${esc(p.id)}" ${isEdit?'readonly':''} placeholder="MKN-01"></div>
      <div class="col-md-8"><label class="form-label fw-bold">Nama Menu</label><input id="p_n" class="form-control" value="${esc(p.n)}" placeholder="Nama makanan/minuman"></div>
      <div class="col-md-4"><label class="form-label fw-bold">Kategori</label><select id="p_c" class="form-select">${st.cats.map(c=>`<option value="${c.n}" ${c.n===p.c?'selected':''}>${c.n}</option>`).join('')}</select></div>
      <div class="col-md-4"><label class="form-label fw-bold">Harga (Rp)</label><input id="p_p" type="number" class="form-control" value="${p.p}" min="0"></div>
      <div class="col-md-4"><label class="form-label fw-bold">Stok</label><input id="p_s" type="number" class="form-control" value="${p.s}" min="0"></div>
      <div class="col-12"><label class="form-label fw-bold">Deskripsi</label><textarea id="p_d" class="form-control" rows="2">${esc(p.d)}</textarea></div>
    </div>
    <div class="d-flex justify-content-end gap-3 mt-4">
      <button class="btn btn-secondary" onclick="closeM()">Batal</button>
      <button class="btn btn-solid" onclick="simpanProdAdmin('${esc(id)}')">Simpan Produk</button>
    </div>
  `);
}

function simpanProdAdmin(idOld){
  const id=$('#p_id').value.trim().toUpperCase(), n=$('#p_n').value.trim(), c=$('#p_c').value, p=parseInt($('#p_p').value)||0, s=parseInt($('#p_s').value)||0, d=$('#p_d').value.trim();
  if(!id||!n)return toast('Kode & Nama wajib diisi!');
  if(p < 0 || s < 0) return toast('Harga & Stok tidak boleh negatif!');

  if(idOld){ const item=prod(idOld); if(item){item.n=n;item.c=c;item.p=p;item.s=s;item.d=d;} }
  else{ if(prod(id))return toast('Kode produk sudah ada!'); P.push({id,n,c,p,s,d}); }
  closeM(); toast('Data produk berhasil disimpan!'); render();
}

function hapusProdAdmin(id){ if(confirm('Hapus produk ini?')){ P=P.filter(x=>x.id!==id); toast('Produk dihapus!'); render(); } }

const V={
  menu(){
    const q=st.q.toLowerCase(),L=P.filter(p=>(st.cat==='Semua'||p.c===st.cat)&&(p.n.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)));
    return `
    <section class="hero-banner">
     <div class="hero-overlay"></div>
     <div class="hero-content">
      <span class="hero-badge">Selamat Datang di SinggahSini</span>
      <h1 class="hero-title">Lapar? Yuk, Singgah Sini!</h1>
      <p class="hero-subtitle">Temukan makanan dan minuman favoritmu tanpa perlu bingung ke mana harus pergi.</p>
      <button class="btn btn-hero shadow" onclick="document.getElementById('daftar-menu').scrollIntoView({behavior: 'smooth'})">
       Lihat Daftar Menu <i class="bi bi-arrow-right ms-2"></i>
      </button>
     </div>
    </section>

    <div id="daftar-menu" class="pt-2">
     <h1 class="fs-4xl fw-bold mb-4">Daftar Menu</h1>
     <div class="d-flex flex-wrap gap-3 mb-5">${['Semua',...cats()].map(c=>`<button class="btn-sm rounded-pill px-4 py-2 ${c===st.cat?'btn-solid':'btn-subtle'}" onclick="setCat('${c}')">${c}</button>`).join('')}</div>
    </div>

    <div class="row row-cols-1 md:row-cols-2 lg:row-cols-3 g-7">${L.map(p=>`<div class="col"><article class="card card-menu border-0 rounded-9 overflow-hidden h-100" onclick="go('detail/${p.id}')">
     <div class="ph" style="background:${bgc(p)}">${foto(p)}</div>
     <div class="card-body position-relative p-7"><small class="text-muted">${p.c}</small><h5 class="fw-bold mb-1">${p.n}</h5><span class="price-tag fw-bold" style="color:var(--terracotta)">${rp(p.p)}</span>
     <button class="btn btn-solid fs-xl fw-bold position-absolute bottom-0 end-0 m-4 px-4 py-1" aria-label="Tambah ${p.n}" onclick="tambah('${p.id}',event)">+</button></div></article></div>`).join('')||'<p class="fg-secondary">Menu tidak ditemukan.</p>'}</div>`},

  detail(id){const p=prod(id);if(!p)return '<p>Menu tidak ditemukan.</p>';
    return `<a class="small d-inline-block mb-3 text-decoration-none" role="button" onclick="go('menu')">← Menu / ${p.n}</a>
    <div class="row g-7 lg:g-12"><div class="col lg:col-7"><span class="badge rounded-pill px-5 py-3 mb-5" style="background:#ebd3b8;color:var(--dark-brown)">${p.c}</span>
     <div class="pic rounded-9 overflow-hidden" style="background:${bgc(p)}">${foto(p,1)}</div></div>
    <div class="col lg:col-5"><div class="card rounded-9 p-7 lg:p-12">
     <div class="fs-lg">Detail Produk</div><h2 class="fs-3xl fw-bold mb-0">${p.n}</h2><em class="d-block mb-5">${p.id}</em>
     <div class="fs-4xl fw-bold mb-5" style="color:var(--terracotta)">${rp(p.p)}</div>
     <div class="fs-lg">Stok:</div><span class="badge rounded-pill px-5 py-3 fs-md mb-4" style="background:#ebd3b8;color:var(--dark-brown)"><i class="bi bi-box-seam"></i> ${p.s} tersisa</span>
     <h5 class="fw-bold text-muted mt-4">DESKRIPSI</h5><p class="small">${p.d}</p>
     <div class="d-flex align-items-center gap-5 my-7"><span class="fw-bold text-muted">JUMLAH</span>
      <div class="d-flex align-items-center justify-content-between rounded-pill px-5 py-1" style="background:#ebd3b8;width:125px"><button class="btn btn-text btn-sm p-0" onclick="dchg(-1,'${id}')">—</button><span>${st.dq}</span><button class="btn btn-text btn-sm p-0" onclick="dchg(1,'${id}')">+</button></div>
      <small class="text-muted">maks. ${MAXD(p)}</small></div>
     ${st.dw?`<div class="small fw-bold text-danger mb-5">${st.dw}</div>`:''}
     <div class="d-flex flex-wrap gap-5"><button class="btn btn-solid rounded-pill px-7 py-3" ${p.s<1?'disabled':''} onclick="dAdd('${id}')"><i class="bi bi-cart"></i> Tambah Keranjang</button>
      <button class="btn btn-subtle rounded-pill px-7 py-3" ${p.s<1?'disabled':''} onclick="dAdd('${id}',1)">Pesan Sekarang</button></div>
    </div></div></div>`},

  kasir(){return `<div class="row justify-content-center"><div class="col md:col-9 lg:col-6 xl:col-5"><div class="card border-0 rounded-9 p-7">
    <h2 class="fw-bold fs-2xl mb-0">Kasir / Pesanan Saat Ini</h2><div class="fs-lg mb-5">${count()} item</div>
    <div class="btn-group w-100 mb-5">${['Makan di tempat','Bungkus'].map(m=>`<button class="fw-bold ${m===st.mode?'btn-solid':'btn-subtle'}" onclick="st.mode='${m}';render()">${m}</button>`).join('')}</div>
    ${st.cart.map(i=>row(i)).join('')||emptyCart}${subtotal()}${noteBox()}<hr>
    <h6 class="fw-bold">Metode Pembayaran</h6>
    <div class="row row-cols-3 g-3 mb-5">${[['Tunai','cash-coin'],['Qris','qr-code'],['Transfer','bank']].map(([m,ic])=>`<div class="col"><button class="w-100 d-flex flex-column align-items-center py-3 fw-bold ${m===st.pay?'btn-solid':'btn-outline'}" onclick="st.pay='${m}';render()"><i class="bi bi-${ic} fs-2xl"></i>${m}</button></div>`).join('')}</div>
    <button class="btn btn-solid w-100 py-4 fs-xl fw-bold" onclick="bayar()">Bayar Sekarang</button></div></div></div>`},

  keranjang(){return `<div class="row justify-content-center"><div class="col md:col-9 lg:col-6 xl:col-5"><div class="card border-0 rounded-9 p-7" style="min-height:560px">
    <h2 class="fs-2xl fw-bold"><i class="bi bi-cart"></i> Keranjang Saya</h2><div class="fs-lg border-bottom pb-3 mb-5">${count()} item</div>
    ${st.cart.map(i=>row(i,1)).join('')||emptyCart}
    <div class="mt-auto">${subtotal()}${noteBox()}<hr><button class="btn btn-solid w-100 py-4 fs-xl fw-bold" onclick="simpan()">Simpan Pesanan Saya</button></div></div></div></div>`},

  transaksi(){
    const q = (st.f.trxQ || st.f.trx.q || '').toLowerCase();
    const filteredHist = st.hist.filter(h => {
      const tglStr = new Date(h.ts).toLocaleDateString('id-ID');
      return h.no.toLowerCase().includes(q) || 
             tglStr.includes(q) ||
             (h.note && h.note.toLowerCase().includes(q)) || 
             h.items.some(i => i.n.toLowerCase().includes(q));
    });

    return `
      <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        <h1 class="fs-4xl fw-bold mb-0">Riwayat Transaksi (Nota)</h1>
        <div class="input-group" style="max-width:320px">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input class="form-control border-start-0 ps-0" placeholder="Cari no nota / tanggal..." value="${esc(st.f.trxQ)}" oninput="st.f.trxQ=this.value;render()">
        </div>
      </div>
      <div class="row row-cols-1 md:row-cols-2 lg:row-cols-3 g-5">
        ${filteredHist.map(h => {
          const totalTrx = h.items.reduce((sum, item) => sum + (item.q * item.h), 0);
          return `
            <div class="col">
              <div class="card border rounded-9 p-5 shadow-sm h-100 d-flex flex-column" style="background: #FFF4E5; border-color: #ebd3b8 !important;">
                <div class="text-center border-bottom pb-3 mb-3">
                  <h5 class="fw-bold mb-1" style="color: var(--dark-brown);">SinggahSini</h5>
                  <small class="text-muted d-block">Nota Pembayaran Kantin</small>
                  <div class="d-flex justify-content-between mt-3 small fw-bold text-secondary">
                    <span>${h.no}</span>
                    <span>${new Date(h.ts).toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'})}</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between small text-muted mb-3 pb-2 border-bottom">
                  <span><i class="bi bi-tag me-1"></i>${h.mode}</span>
                  <span><i class="bi bi-wallet2 me-1"></i>${h.pay}</span>
                </div>
                <div class="flex-grow-1 mb-3">
                  <div class="small fw-bold text-muted mb-2">Rincian Pesanan:</div>
                  ${h.items.map(item => `
                    <div class="d-flex justify-content-between small mb-2">
                      <div><span class="fw-bold">${esc(item.n)}</span><div class="text-muted" style="font-size: 0.8rem;">${item.q}x @${rp(item.h)}</div></div>
                      <span class="fw-semibold">${rp(item.q * item.h)}</span>
                    </div>
                  `).join('')}
                  ${h.note ? `<div class="mt-2 p-2 rounded small bg-white text-muted fst-italic">Catatan: ${esc(h.note)}</div>` : ''}
                </div>
                <div class="border-top pt-3 mt-auto">
                  <div class="d-flex justify-content-between fw-bold fs-lg"><span>TOTAL</span><span style="color: var(--terracotta);">${rp(totalTrx)}</span></div>
                  <div class="text-center mt-4"><span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill small"><i class="bi bi-check-circle-fill me-1"></i> Transaksi Berhasil</span></div>
                </div>
              </div>
            </div>`;
        }).join('') || '<div class="col-12 text-center text-muted py-7">Belum ada riwayat transaksi yang tercatat.</div>'}
      </div>`;
  },

  rekap(){
    const f = st.f.rekapPer || 'Harian', q = (st.f.trxQ || '').toLowerCase(), M = {};
    let nt = 0;
    st.hist.forEach(h => {
      let hit = 0;
      h.items.forEach(i => {
        const p = prod(i.id), c = p ? p.c : '-';
        if(!i.n.toLowerCase().includes(q)) return;
        hit = 1;
        const m = M[i.id] || (M[i.id] = {n: i.n, c, q: 0, t: 0});
        m.q += i.q; m.t += i.q * i.h;
      });
      if(hit) nt++;
    });
    const R = Object.values(M), por = R.reduce((a,x) => a + x.q, 0), om = R.reduce((a,x) => a + x.t, 0);
    const tglStr = 'Penjualan ' + (f === 'Bulanan' ? 'Bulan Ini' : new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}));

    return `
      <h1 class="fs-4xl fw-bold mb-5">Rekap Penjualan</h1>
      <div class="card border-0 rounded-9 p-4 mb-5"><div class="btn-group" style="width: fit-content;">${['Harian','Bulanan'].map(t=>`<button class="fw-bold px-7 py-2 rounded-pill ${t===f?'btn-solid':'btn-subtle'}" onclick="st.f.rekapPer='${t}';render()">${t}</button>`).join('')}</div></div>
      <div class="row row-cols-1 md:row-cols-3 g-5 mb-7">
        <div class="col"><div class="card rounded-9 h-100 p-5"><div class="d-flex gap-4 align-items-center"><i class="bi bi-wallet2 fs-3xl" style="color:var(--terracotta)"></i><div><small class="text-muted">Total omzet</small><div class="fs-2xl fw-bold">${rp(om)}</div><small class="text-muted">${tglStr}</small></div></div></div></div>
        <div class="col"><div class="card rounded-9 h-100 p-5"><div class="d-flex gap-4 align-items-center"><i class="bi bi-file-text fs-3xl" style="color:var(--terracotta)"></i><div><small class="text-muted">Jumlah transaksi</small><div class="fs-2xl fw-bold">${nt} Transaksi</div><small class="text-muted">${tglStr}</small></div></div></div></div>
        <div class="col"><div class="card rounded-9 h-100 p-5"><div class="d-flex gap-4 align-items-center"><i class="bi bi-bag fs-3xl" style="color:var(--terracotta)"></i><div><small class="text-muted">Porsi terjual</small><div class="fs-2xl fw-bold">${por} Porsi</div><small class="text-muted">${tglStr}</small></div></div></div></div>
      </div>
      
      <div class="card border-0 rounded-9 p-5">
        <h3 class="fw-bold mb-4">Rincian Produk Terjual</h3>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr style="border-bottom:2px solid #ebd3b8">
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th class="text-center">Jumlah Terjual</th>
                <th class="text-end">Total Penjualan</th>
              </tr>
            </thead>
            <tbody>
              ${R.map(r=>`
                <tr style="border-bottom:1px solid #ebd3b8">
                  <td class="fw-bold">${esc(r.n)}</td>
                  <td>${esc(r.c)}</td>
                  <td class="text-center">${r.q} Porsi</td>
                  <td class="text-end fw-bold">${rp(r.t)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="text-center py-4 text-muted">Belum ada data penjualan.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  admin_produk(){
    if(!st.admin) {
      setTimeout(() => mintaPasswordAdmin(), 100);
      return `<p class="text-center py-5">Memuat verifikasi admin...</p>`;
    }

    const q = (st.f.prodQ || '').toLowerCase();
    const c = st.f.prodC || 'Semua';
    const list = P.filter(x => 
      (c === 'Semua' || x.c === c) && 
      (x.id.toLowerCase().includes(q) || x.n.toLowerCase().includes(q) || x.c.toLowerCase().includes(q))
    );

    return `
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="fs-4xl fw-bold mb-1">Panel Admin - Kelola Produk</h1>
          <p class="text-muted mb-0">Kelola kode, nama, kategori, harga, dan stok produk</p>
        </div>
        <button class="btn btn-solid px-4 py-2 fw-bold" onclick="formProduk()"><i class="bi bi-plus-lg me-2"></i>Tambah Produk</button>
      </div>

      <div class="card border-0 rounded-9 p-4 mb-4">
        <div class="row g-3">
          <div class="col-md-8">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input class="form-control border-start-0 ps-0" placeholder="Cari berdasarkan kode, nama, atau kategori..." value="${esc(st.f.prodQ)}" oninput="st.f.prodQ=this.value;render()">
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" onchange="st.f.prodC=this.value;render()">
              <option value="Semua">Semua Kategori</option>
              ${st.cats.map(cat=>`<option value="${esc(cat.n)}" ${cat.n===c?'selected':''}>${esc(cat.n)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="card border-0 rounded-9 p-5">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead><tr style="border-bottom:2px solid #ebd3b8"><th>Kode</th><th>Nama Produk</th><th>Kategori</th><th class="text-end">Harga</th><th class="text-center">Stok</th><th class="text-center">Aksi</th></tr></thead>
            <tbody>
              ${list.map(p=>`
                <tr style="border-bottom:1px solid #ebd3b8">
                  <td class="fw-bold">${p.id}</td>
                  <td>${esc(p.n)}</td>
                  <td><span class="badge bg-secondary bg-opacity-10 text-dark px-3 py-2">${esc(p.c)}</span></td>
                  <td class="text-end fw-bold">${rp(p.p)}</td>
                  <td class="text-center"><span class="badge ${p.s<5?'bg-danger':'bg-success'} px-3 py-2">${p.s}</span></td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="formProduk('${p.id}')"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusProdAdmin('${p.id}')"><i class="bi bi-trash"></i> Hapus</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6" class="text-center py-4 text-muted">Produk tidak ditemukan.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  admin_kategori(){
    if(!st.admin) {
      setTimeout(() => mintaPasswordAdmin(), 100);
      return `<p class="text-center py-5">Memuat verifikasi admin...</p>`;
    }

    const q = (st.f.katQ || '').toLowerCase();
    const list = st.cats.filter(c => c.n.toLowerCase().includes(q) || c.d.toLowerCase().includes(q));

    return `
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="fs-4xl fw-bold mb-1">Panel Admin - Kategori Produk</h1>
          <p class="text-muted mb-0">Tambah, ubah, dan hapus kategori menu</p>
        </div>
        <button class="btn btn-solid px-4 py-2 fw-bold" onclick="formKategori()"><i class="bi bi-plus-lg me-2"></i>Tambah Kategori</button>
      </div>

      <div class="card border-0 rounded-9 p-5">
        <div class="input-group mb-4" style="max-width: 350px;">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input class="form-control border-start-0 ps-0" placeholder="Cari kategori..." value="${esc(st.f.katQ)}" oninput="st.f.katQ=this.value;render()">
        </div>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr style="border-bottom:2px solid #ebd3b8">
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th class="text-center">Jumlah Produk</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(k => {
                const countProd = P.filter(p => p.c === k.n).length;
                return `
                  <tr style="border-bottom:1px solid #ebd3b8">
                    <td class="fw-bold fs-lg">${esc(k.n)}</td>
                    <td class="text-muted">${esc(k.d)}</td>
                    <td class="text-center"><span class="badge bg-secondary rounded-pill px-3 py-2">${countProd} Produk</span></td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-primary me-1" onclick="formKategori('${esc(k.n)}')"><i class="bi bi-pencil"></i> Edit</button>
                      <button class="btn btn-sm btn-outline-danger" onclick="hapusKategori('${esc(k.n)}')"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="4" class="text-center py-4 text-muted">Kategori tidak ditemukan.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  }
};

const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cats=()=>st.cats.map(c=>c.n);
const sold=id=>st.hist.reduce((a,h)=>a+h.items.filter(i=>i.id===id).reduce((b,i)=>b+i.q,0),0);
const sync=()=>P.forEach(p=>{p.sold=sold(p.id);});
const openM=h=>$('#modal').innerHTML=h?`<div class="ov" onclick="if(event.target===this)closeM()"><div class="card rounded-9 p-7 mbox">${h}</div></div>`:'';
const closeM=()=>openM('');

function render(){
  sync();
  $('#badge').textContent = count() || '';
  
  const nav = $('#nav');
  const h = location.hash.slice(1) || 'menu';

  if (st.admin) {
    nav.innerHTML = `
      <li><a class="nav-link ${h==='admin_produk'?'on':''}" role="button" onclick="go('admin_produk')">Kelola Produk</a></li>
      <li><a class="nav-link ${h==='admin_kategori'?'on':''}" role="button" onclick="go('admin_kategori')">Kelola Kategori</a></li>
      <li><a class="nav-link ${h==='rekap'?'on':''}" role="button" onclick="go('rekap')">Rekap Penjualan</a></li>
      <li><a class="nav-link text-warning fw-bold" role="button" onclick="st.admin=false;toast('Keluar dari Admin');render();go('menu');">Keluar Admin ✕</a></li>
    `;
  } else {
    nav.innerHTML = `
      <li><a class="nav-link ${h==='menu'||!location.hash?'on':''}" role="button" onclick="go('menu')">Menu</a></li>
      <li><a class="nav-link ${h==='kasir'?'on':''}" role="button" onclick="go('kasir')">Kasir</a></li>
      <li><a class="nav-link ${h==='transaksi'?'on':''}" role="button" onclick="go('transaksi')">Riwayat Transaksi</a></li>
    `;
  }
  
  const [v, id] = h.split('/');
  const viewFunc = V[v] || (st.admin ? V.admin_produk : V.menu);
  $('#view').innerHTML = typeof viewFunc === 'function' ? viewFunc(id) : viewFunc;

  let fab = $('#admin-fab');
  if(!fab) {
    fab = document.createElement('div');
    fab.id = 'admin-fab';
    fab.innerHTML = `
      <button onclick="mintaPasswordAdmin()" title="Masuk ke Admin" style="position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: var(--dark-brown); color: white; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 1095; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
        <i class="bi bi-shield-lock-fill fs-lg"></i>
      </button>
    `;
    document.body.appendChild(fab);
  }
  fab.style.display = st.admin ? 'none' : 'block';
}

window.addEventListener('hashchange', render);
render();