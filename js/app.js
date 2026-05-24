/**
 * SOUK DIGITAL — Logique principale de l'application
 */

// ═══════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════

function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════
// NAVIGATION ENTRE PAGES
// ═══════════════════════════════════════════════════

function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  state.currentPage = p;

  // Scroll en haut à chaque changement de page
  window.scrollTo(0, 0);

  if (p === 'home')     renderHome();
  if (p === 'admin')    renderAdmin();
  if (p === 'vendeuse') renderVendeuse();
}

// ═══════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════

function selectRole(role, el) {
  state.loginRole = role;
  document.querySelectorAll('.role-pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');

  const wrap = document.getElementById('shopSelectWrap');
  const emailInput = document.getElementById('loginEmail');
  const passInput  = document.getElementById('loginPass');

  if (role === 'vendeuse') {
    wrap.style.display = 'block';
    emailInput.value   = '';
    passInput.value    = '';
    emailInput.placeholder = 'votre@email.com (optionnel)';
    const sel = document.getElementById('shopSelect');
    sel.innerHTML = state.shops.map(s =>
      `<option value="${s.id}">${s.emoji} ${s.name}</option>`
    ).join('');
  } else {
    wrap.style.display = 'none';
    emailInput.value   = 'admin@souk.ma';
    passInput.value    = 'admin123';
    emailInput.placeholder = 'votre@email.com';
  }
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value.trim();

  if (state.loginRole === 'admin') {
    if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
      state.currentRole = 'admin';
      state.currentUser = 'Admin';
      updateNav('admin');
      showPage('admin');
      toast('Bienvenue Admin ! 👑', 'success');
    } else {
      toast('Email ou mot de passe incorrect', 'error');
    }
  } else {
    const sid  = parseInt(document.getElementById('shopSelect').value);
    const shop = state.shops.find(s => s.id === sid);
    if (!shop) { toast('Boutique introuvable', 'error'); return; }
    if (pass !== shop.password) { toast('Mot de passe incorrect', 'error'); return; }

    state.currentRole   = 'vendeuse';
    state.currentUser   = shop.owner;
    state.currentShopId = sid;
    document.getElementById('vendBrand').textContent = shop.emoji + ' ' + shop.name;
    updateNav('vendeuse', shop);
    showPage('vendeuse');
    toast(`Bienvenue ${shop.owner} ! 🏪`, 'success');
  }
}

function updateNav(role, shop = null) {
  const nav = document.getElementById('navLinks');
  if (role === 'admin') {
    nav.innerHTML = `
      <span style="color:var(--gold);font-size:13px;margin-right:4px">👑 Admin</span>
      <button class="btn btn-outline btn-sm" onclick="logout()">Déconnexion</button>`;
  } else {
    nav.innerHTML = `
      <span style="color:var(--gold);font-size:13px;margin-right:4px">${shop.emoji} ${shop.name}</span>
      <button class="btn btn-outline btn-sm" onclick="logout()">Déconnexion</button>`;
  }
}

function logout() {
  state.currentUser   = null;
  state.currentRole   = null;
  state.currentShopId = null;
  document.getElementById('navLinks').innerHTML =
    `<button class="btn btn-outline btn-sm" onclick="showPage('login')">Connexion</button>`;
  showPage('home');
  toast('Vous avez été déconnecté', 'info');
}

// ═══════════════════════════════════════════════════
// PAGE HOME — VITRINE PUBLIQUE
// ═══════════════════════════════════════════════════

function renderHome() {
  const shops = state.shops.filter(s => s.active);
  document.getElementById('shopCount').textContent = shops.length + ' boutiques actives';
  renderShopsGrid(shops);
}

function renderShopsGrid(shops) {
  const grid = document.getElementById('shopsGrid');
  if (!shops.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div>
      <p>Aucune boutique trouvée.<br>Essayez un autre terme de recherche.</p>
    </div>`;
    return;
  }

  grid.innerHTML = shops.map(s => `
    <div class="shop-card" onclick="openShop(${s.id})">
      <div class="shop-card-banner">
        ${s.emoji}
        <span class="shop-badge">${s.active ? 'ACTIF' : 'INACTIF'}</span>
      </div>
      <div class="shop-card-body">
        <div class="shop-name">${s.name}</div>
        <div class="shop-desc">${s.desc}</div>
        <div class="shop-meta">
          <span>📦 ${s.products.length} produit${s.products.length > 1 ? 's' : ''}</span>
          <span>💬 WhatsApp direct</span>
        </div>
        <div class="payment-tags">
          ${s.payments.slice(0, 3).map(p => `<span class="payment-tag">${p}</span>`).join('')}
        </div>
      </div>
    </div>`).join('');
}

function filterShops() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = state.shops.filter(s =>
    s.active && (
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.owner.toLowerCase().includes(q)
    )
  );
  document.getElementById('shopCount').textContent = filtered.length + ' boutique' + (filtered.length > 1 ? 's' : '') + ' trouvée' + (filtered.length > 1 ? 's' : '');
  renderShopsGrid(filtered);
}

function filterCategory(cat, el) {
  document.querySelectorAll('.filter-pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  let shops;
  if (cat === 'all') {
    shops = state.shops.filter(s => s.active);
  } else {
    shops = state.shops.filter(s => s.active && s.category === cat);
  }
  document.getElementById('shopCount').textContent = shops.length + ' boutique' + (shops.length > 1 ? 's' : '') + ' trouvée' + (shops.length > 1 ? 's' : '');
  renderShopsGrid(shops);
}

// ═══════════════════════════════════════════════════
// PAGE BOUTIQUE INDIVIDUELLE
// ═══════════════════════════════════════════════════

function openShop(id) {
  state.currentShopId = id;
  const shop = state.shops.find(s => s.id === id);

  document.getElementById('boutiqueHeader').innerHTML = `
    <button class="back-btn" onclick="showPage('home')">← Retour aux boutiques</button>
    <div class="boutique-info">
      <div class="boutique-avatar">${shop.emoji}</div>
      <div class="boutique-details">
        <h1>${shop.name}</h1>
        <p>${shop.desc}</p>
        <p style="margin-top:8px;font-size:13px;color:var(--text3)">Propriétaire : ${shop.owner}</p>
        <div class="payment-tags" style="margin-top:10px">
          <span style="font-size:11px;color:var(--text3);margin-right:4px">💳 Paiements :</span>
          ${shop.payments.map(p => `<span class="payment-tag">${p}</span>`).join('')}
        </div>
      </div>
    </div>`;

  const grid = document.getElementById('productsGrid');

  if (!shop.products.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">📦</div>
      <p>Cette boutique n'a pas encore de produits.</p>
    </div>`;
  } else {
    grid.innerHTML = shop.products.map(p => `
      <div class="product-card" onclick="openProduct(${p.id}, ${shop.id})">
        <div class="product-img">
          ${p.emoji}
          <span class="product-price-badge">À partir de ${Math.min(...p.sizes.map(s => s.price))} MRU</span>
        </div>
        <div class="product-card-body">
          <div class="product-name">${p.name}</div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px;line-height:1.4">${p.desc}</div>
          <div class="product-colors">
            ${p.colors.map(c => `<div class="color-dot" style="background:${c.hex}" title="${c.name}"></div>`).join('')}
          </div>
          <div class="sizes-row">
            ${p.sizes.map(s => `<span class="size-chip">${s.size}</span>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }

  showPage('boutique');
}

// ═══════════════════════════════════════════════════
// MODAL COMMANDE PRODUIT
// ═══════════════════════════════════════════════════

function openProduct(pid, shopId) {
  const shop = state.shops.find(s => s.id === shopId);
  const prod = shop.products.find(p => p.id === pid);
  state.currentProduct  = prod;
  state.currentShopId   = shopId;

  document.getElementById('modalProductName').textContent = prod.name;
  document.getElementById('modalProductImg').textContent  = prod.emoji;
  document.getElementById('modalProductDesc').textContent = prod.desc;

  // Couleurs
  document.getElementById('modalColors').innerHTML = prod.colors.map((c, i) => `
    <div class="color-swatch ${i === 0 ? 'selected' : ''}"
         style="background:${c.hex}"
         title="${c.name}"
         onclick="selectColor(this, '${c.name}')">
    </div>`).join('');
  document.getElementById('selectedColorName').textContent = prod.colors[0]?.name || '';

  // Tailles
  document.getElementById('modalSizes').innerHTML = prod.sizes.map((s, i) => `
    <span class="size-chip ${i === 0 ? 'active' : ''}"
          onclick="selectSize(this, '${s.size}', ${s.price})">
      ${s.size}
    </span>`).join('');

  // Prix par taille
  document.getElementById('modalPrices').innerHTML = prod.sizes.map((s, i) => `
    <div class="price-option ${i === 0 ? 'selected' : ''}">
      <div class="size-label">${s.size}</div>
      <div class="price-val">${s.price} MRU</div>
    </div>`).join('');

  // Modes de paiement
  document.getElementById('modalPaymentInfo').innerHTML = `
    <p>💳 Modes de paiement acceptés</p>
    <ul>${shop.payments.map(p => `<li>${p}</li>`).join('')}</ul>`;

  document.getElementById('orderModal').classList.add('open');
}

function selectColor(el, name) {
  document.querySelectorAll('#modalColors .color-swatch').forEach(x => x.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selectedColorName').textContent = name;
}

function selectSize(el, size, price) {
  document.querySelectorAll('#modalSizes .size-chip').forEach(x => x.classList.remove('active'));
  el.classList.add('active');

  // Met en valeur le prix correspondant
  const sizeChips = [...document.querySelectorAll('#modalSizes .size-chip')];
  const idx = sizeChips.indexOf(el);
  document.querySelectorAll('#modalPrices .price-option').forEach((x, i) => {
    x.classList.toggle('selected', i === idx);
  });
}

function orderWhatsApp() {
  const shop    = state.shops.find(s => s.id === state.currentShopId);
  const prod    = state.currentProduct;
  const colorEl = document.querySelector('#modalColors .color-swatch.selected');
  const sizeEl  = document.querySelector('#modalSizes .size-chip.active');
  const color   = colorEl ? colorEl.title : 'Non spécifiée';
  const size    = sizeEl  ? sizeEl.textContent.trim() : 'Non spécifié';
  const sizeObj = prod.sizes.find(s => s.size === size);
  const price   = sizeObj ? sizeObj.price : '?';

  const message = encodeURIComponent(
    `Bonjour ! 👋\n\n` +
    `Je souhaite commander depuis *${shop.name}* :\n\n` +
    `✨ *Produit :* ${prod.name}\n` +
    `🎨 *Couleur :* ${color}\n` +
    `📏 *Taille :* ${size}\n` +
    `💰 *Prix :* ${price} MRU\n\n` +
    `Pouvez-vous confirmer la disponibilité et les modalités de livraison ?\n\n` +
    `Merci ! 🙏`
  );

  const url = `https://wa.me/${shop.whatsapp}?text=${message}`;
  window.open(url, '_blank');
  closeModal('orderModal');
  toast('Redirection vers WhatsApp... 💬', 'success');
}

// Fermer modal en cliquant l'overlay
document.getElementById('orderModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal('orderModal');
});

// ═══════════════════════════════════════════════════
// ADMIN — NAVIGATION INTERNE
// ═══════════════════════════════════════════════════

function adminTab(tab, el) {
  document.querySelectorAll('#adminSidebar .dash-nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#page-admin .panel').forEach(x => x.classList.remove('active'));
  document.getElementById('admin-' + tab).classList.add('active');

  if (tab === 'boutiques') renderAdminBoutiques();
  if (tab === 'vendeuses') renderVendeuses();
  if (tab === 'paiements') renderPaiements();
  if (tab === 'ventes')    renderVentesGlobales();
}

// ═══════════════════════════════════════════════════
// ADMIN — OVERVIEW
// ═══════════════════════════════════════════════════

function renderAdmin() {
  const now = new Date();
  document.getElementById('adminDate').textContent =
    now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const allSales    = buildAllSales();
  const totalRev    = allSales.reduce((a, s) => a + s.price, 0);
  const totalShops  = state.shops.filter(s => s.active).length;
  const totalProds  = state.shops.reduce((a, s) => a + s.products.length, 0);

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Boutiques actives</div>
      <div class="stat-value">${totalShops}</div>
      <div class="stat-change up">↑ sur ${state.shops.length} total</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ventes totales</div>
      <div class="stat-value">${allSales.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Chiffre d'affaires</div>
      <div class="stat-value">${totalRev.toLocaleString()} <span style="font-size:1rem;color:var(--text3)">MRU</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Produits actifs</div>
      <div class="stat-value">${totalProds}</div>
    </div>`;

  // Dernières ventes
  const recent = allSales.slice().reverse().slice(0, 8);
  document.getElementById('adminSalesTable').innerHTML = recent.length
    ? recent.map(s => `
        <tr>
          <td>${s.product}</td>
          <td>${s.shopName}</td>
          <td style="color:var(--gold);font-weight:600">${s.price} MRU</td>
          <td>${formatDate(s.date)}</td>
          <td><span class="badge badge-success">✓ Vendu</span></td>
        </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text3)">Aucune vente pour l'instant</td></tr>`;

  // Boutiques rapides
  document.getElementById('adminShopsQuick').innerHTML = state.shops.map(s => `
    <div class="shop-quick-item">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.5rem">${s.emoji}</span>
        <div>
          <div style="font-size:14px;font-weight:500">${s.name}</div>
          <div style="font-size:12px;color:var(--text3)">${s.owner}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--gold);font-size:13px;font-weight:600">${(s.sales||[]).reduce((a,v)=>a+v.price,0).toLocaleString()} MRU</div>
        <div style="font-size:11px;color:var(--text3)">${(s.sales||[]).length} vente${(s.sales||[]).length > 1 ? 's' : ''}</div>
      </div>
    </div>`).join('');
}

function buildAllSales() {
  const all = [...state.globalSales];
  // Ajoute les ventes des boutiques qui ne sont pas encore dans globalSales
  state.shops.forEach(shop => {
    (shop.sales || []).forEach(sale => {
      const exists = all.find(s =>
        s.product === sale.product &&
        s.date === sale.date &&
        s.shopId === shop.id
      );
      if (!exists) {
        all.push({ ...sale, shopId: shop.id, shopName: shop.name });
      }
    });
  });
  return all.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ═══════════════════════════════════════════════════
// ADMIN — BOUTIQUES
// ═══════════════════════════════════════════════════

function showNewBoutiqueForm() {
  document.getElementById('newBoutiqueForm').style.display = 'block';
  document.getElementById('newBoutiqueForm').scrollIntoView({ behavior: 'smooth' });
}

function createBoutique() {
  const name     = document.getElementById('nb_name').value.trim();
  const owner    = document.getElementById('nb_owner').value.trim();
  const emoji    = document.getElementById('nb_emoji').value.trim() || '🏪';
  const whatsapp = document.getElementById('nb_whatsapp').value.trim();
  const desc     = document.getElementById('nb_desc').value.trim();
  const pass     = document.getElementById('nb_pass').value.trim();
  const cat      = document.getElementById('nb_cat').value;

  if (!name || !owner || !whatsapp || !pass) {
    toast('Veuillez remplir tous les champs obligatoires (*)', 'error');
    return;
  }

  const id = Math.max(...state.shops.map(s => s.id), 0) + 1;
  const newShop = { id, name, owner, emoji, whatsapp, desc, password: pass, category: cat, active: true, payments: ['À définir'], products: [], sales: [] };
  state.shops.push(newShop);
  saveData();

  // Reset formulaire
  ['nb_name', 'nb_owner', 'nb_emoji', 'nb_whatsapp', 'nb_desc', 'nb_pass'].forEach(x =>
    document.getElementById(x).value = ''
  );
  document.getElementById('newBoutiqueForm').style.display = 'none';

  // Mettre à jour le select vendeuse sur la page login
  const sel = document.getElementById('shopSelect');
  sel.innerHTML = state.shops.map(s => `<option value="${s.id}">${s.emoji} ${s.name}</option>`).join('');

  toast(`✓ Boutique "${name}" créée avec succès !`, 'success');
  renderAdminBoutiques();
  renderAdmin();
}

function renderAdminBoutiques() {
  document.getElementById('adminBoutiquesList').innerHTML = state.shops.map(s => `
    <div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;gap:1rem;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:2.5rem">${s.emoji}</span>
          <div>
            <div style="font-weight:600;font-size:16px">${s.name}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:2px">
              👤 ${s.owner} &nbsp;|&nbsp; 📱 +${s.whatsapp}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge ${s.active ? 'badge-success' : 'badge-danger'}">${s.active ? '● Actif' : '● Inactif'}</span>
          <button class="btn btn-outline btn-sm" onclick="toggleShop(${s.id})">${s.active ? 'Désactiver' : 'Activer'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteShop(${s.id})">Supprimer</button>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:1rem;line-height:1.5">${s.desc || 'Aucune description'}</div>
      <div style="display:flex;gap:2rem;font-size:13px;color:var(--text2);margin-bottom:1rem;flex-wrap:wrap">
        <span>📦 <strong>${s.products.length}</strong> produits</span>
        <span>🛒 <strong>${(s.sales||[]).length}</strong> ventes déclarées</span>
        <span>💰 <strong>${(s.sales||[]).reduce((a,v)=>a+v.price,0).toLocaleString()}</strong> MRU de ventes</span>
        <span>🏷️ Catégorie : <strong>${s.category || '—'}</strong></span>
      </div>
      <div class="payment-tags">
        <span style="font-size:11px;color:var(--text3)">Paiements :</span>
        ${s.payments.map(p => `<span class="payment-tag">${p}</span>`).join('')}
      </div>
    </div>`).join('');
}

function toggleShop(id) {
  const shop = state.shops.find(s => s.id === id);
  shop.active = !shop.active;
  saveData();
  renderAdminBoutiques();
  renderAdmin();
  toast(`Boutique ${shop.active ? 'activée' : 'désactivée'}`, 'info');
}

function deleteShop(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.')) return;
  state.shops = state.shops.filter(s => s.id !== id);
  saveData();
  renderAdminBoutiques();
  renderAdmin();
  toast('Boutique supprimée', 'info');
}

// ═══════════════════════════════════════════════════
// ADMIN — VENDEUSES
// ═══════════════════════════════════════════════════

function renderVendeuses() {
  document.getElementById('vendeusesTable').innerHTML = `
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Boutique</th>
            <th>Vendeuse</th>
            <th>WhatsApp</th>
            <th>Catégorie</th>
            <th>Produits</th>
            <th>Ventes</th>
            <th>CA (MRU)</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${state.shops.map(s => `
            <tr>
              <td>${s.emoji} <strong>${s.name}</strong></td>
              <td>${s.owner}</td>
              <td style="color:var(--success-light)">+${s.whatsapp}</td>
              <td><span class="badge badge-pending">${s.category || '—'}</span></td>
              <td>${s.products.length}</td>
              <td style="color:var(--gold)">${(s.sales||[]).length}</td>
              <td style="color:var(--gold);font-weight:600">${(s.sales||[]).reduce((a,v)=>a+v.price,0).toLocaleString()}</td>
              <td><span class="dot ${s.active ? '' : 'offline'}"></span> ${s.active ? 'Active' : 'Inactive'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ═══════════════════════════════════════════════════
// ADMIN — PAIEMENTS
// ═══════════════════════════════════════════════════

function renderPaiements() {
  document.getElementById('paiementsContent').innerHTML = state.shops.map(s => `
    <div class="card">
      <div class="card-title">${s.emoji} ${s.name} — ${s.owner}</div>
      <div class="tag-row" id="payments_${s.id}">
        ${s.payments.map((p, i) => `
          <span class="tag">
            ${p}
            <button onclick="removePayment(${s.id}, ${i})">×</button>
          </span>`).join('')}
      </div>
      ${s.payments.length === 0 ? '<p style="font-size:13px;color:var(--text3);margin:8px 0">Aucun mode de paiement défini.</p>' : ''}
      <div style="display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap">
        <input type="text" id="np_${s.id}" placeholder="Ex: Virement CIH, Wave, Espèces..." style="flex:1;min-width:200px">
        <button class="btn btn-gold btn-sm" onclick="addPayment(${s.id})">+ Ajouter</button>
      </div>
    </div>`).join('');
}

function addPayment(shopId) {
  const input = document.getElementById('np_' + shopId);
  const val   = input.value.trim();
  if (!val) return;
  state.shops.find(s => s.id === shopId).payments.push(val);
  input.value = '';
  saveData();
  renderPaiements();
  toast('Mode de paiement ajouté ✓', 'success');
}

function removePayment(shopId, idx) {
  state.shops.find(s => s.id === shopId).payments.splice(idx, 1);
  saveData();
  renderPaiements();
  toast('Mode de paiement supprimé', 'info');
}

// ═══════════════════════════════════════════════════
// ADMIN — VENTES GLOBALES
// ═══════════════════════════════════════════════════

function renderVentesGlobales() {
  const allSales = buildAllSales().slice().reverse();
  const total    = allSales.reduce((a, s) => a + s.price, 0);

  // Stats par boutique
  const byShop = {};
  allSales.forEach(s => {
    const name = s.shopName || '—';
    if (!byShop[name]) byShop[name] = { count: 0, total: 0 };
    byShop[name].count++;
    byShop[name].total += s.price;
  });

  document.getElementById('ventesContent').innerHTML = `
    <div class="stat-cards" style="margin-bottom:1.5rem">
      <div class="stat-card">
        <div class="stat-label">Total ventes</div>
        <div class="stat-value">${allSales.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Chiffre d'affaires global</div>
        <div class="stat-value">${total.toLocaleString()} MRU</div>
      </div>
      ${Object.entries(byShop).map(([name, data]) => `
        <div class="stat-card">
          <div class="stat-label">${name}</div>
          <div class="stat-value">${data.total.toLocaleString()} MRU</div>
          <div class="stat-change up">${data.count} vente${data.count > 1 ? 's' : ''}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-title">Détail de toutes les ventes</div>
      <table>
        <thead>
          <tr><th>Produit</th><th>Boutique</th><th>Couleur</th><th>Taille</th><th>Prix</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${allSales.length
            ? allSales.map(s => `
                <tr>
                  <td>${s.product}</td>
                  <td>${s.shopName || '—'}</td>
                  <td>${s.color  || '—'}</td>
                  <td>${s.size   || '—'}</td>
                  <td style="color:var(--gold);font-weight:600">${s.price} MRU</td>
                  <td>${formatDate(s.date)}</td>
                </tr>`).join('')
            : `<tr><td colspan="6" style="text-align:center;color:var(--text3)">Aucune vente pour l'instant</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

// ═══════════════════════════════════════════════════
// VENDEUSE — NAVIGATION INTERNE
// ═══════════════════════════════════════════════════

function vendTab(tab, el) {
  document.querySelectorAll('#page-vendeuse .dash-nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#page-vendeuse .panel').forEach(x => x.classList.remove('active'));
  document.getElementById('vend-' + tab).classList.add('active');

  if (tab === 'products') renderVendProducts();
  if (tab === 'ventes')   renderVendVentes();
}

// ═══════════════════════════════════════════════════
// VENDEUSE — OVERVIEW
// ═══════════════════════════════════════════════════

function renderVendeuse() {
  const shop   = state.shops.find(s => s.id === state.currentShopId);
  const sales  = shop.sales || [];
  const totalRev = sales.reduce((a, s) => a + s.price, 0);

  document.getElementById('vendName').textContent = shop.emoji + ' ' + shop.name;

  document.getElementById('vendStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Mes produits</div>
      <div class="stat-value">${shop.products.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ventes déclarées</div>
      <div class="stat-value">${sales.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Mes revenus</div>
      <div class="stat-value">${totalRev.toLocaleString()} <span style="font-size:1rem;color:var(--text3)">MRU</span></div>
    </div>`;

  renderVendSalesTable();
}

function renderVendSalesTable() {
  const shop  = state.shops.find(s => s.id === state.currentShopId);
  const sales = (shop.sales || []).slice().reverse().slice(0, 10);
  document.getElementById('vendSalesTable').innerHTML = sales.length
    ? sales.map(s => `
        <tr>
          <td>${s.product}</td>
          <td>${s.color}</td>
          <td>${s.size}</td>
          <td style="color:var(--gold);font-weight:600">${s.price} MRU</td>
          <td>${formatDate(s.date)}</td>
        </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text3)">
         Aucune vente déclarée. Utilisez l'onglet "Déclarer vente" pour commencer.
       </td></tr>`;
}

// ═══════════════════════════════════════════════════
// VENDEUSE — PRODUITS
// ═══════════════════════════════════════════════════

function showAddProduct() {
  state.selectedColors = [];
  state.sizePrices     = [];
  document.getElementById('selectedColors').innerHTML  = '';
  document.getElementById('sizePriceRows').innerHTML   = '';
  ['p_name', 'p_emoji', 'p_desc'].forEach(x => document.getElementById(x).value = '');
  document.getElementById('addProductForm').style.display = 'block';
  document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
}

function addProductColor() {
  const hex  = document.getElementById('p_color_picker').value;
  const name = document.getElementById('p_color_name').value.trim() || hex;
  if (state.selectedColors.find(c => c.hex === hex)) {
    toast('Cette couleur est déjà ajoutée', 'error');
    return;
  }
  state.selectedColors.push({ hex, name });
  document.getElementById('p_color_name').value = '';
  refreshSelectedColors();
}

function removeColor(i) {
  state.selectedColors.splice(i, 1);
  refreshSelectedColors();
}

function refreshSelectedColors() {
  document.getElementById('selectedColors').innerHTML = state.selectedColors.map((c, i) => `
    <div class="color-tag">
      <div class="c-dot" style="background:${c.hex}"></div>
      ${c.name}
      <button onclick="removeColor(${i})">×</button>
    </div>`).join('');
}

function addSizePrice() {
  const size  = document.getElementById('p_size').value.trim();
  const price = parseFloat(document.getElementById('p_price').value);
  if (!size || isNaN(price) || price <= 0) {
    toast('Veuillez entrer une taille et un prix valide', 'error');
    return;
  }
  if (state.sizePrices.find(s => s.size === size)) {
    toast('Cette taille est déjà ajoutée', 'error');
    return;
  }
  state.sizePrices.push({ size, price });
  document.getElementById('p_size').value  = '';
  document.getElementById('p_price').value = '';
  refreshSizePrices();
}

function removeSP(i) {
  state.sizePrices.splice(i, 1);
  refreshSizePrices();
}

function refreshSizePrices() {
  document.getElementById('sizePriceRows').innerHTML = state.sizePrices.map((s, i) => `
    <div class="size-price-row">
      <span class="payment-tag">${s.size} — ${s.price} MRU</span>
      <button class="btn-ghost btn-sm" onclick="removeSP(${i})" style="padding:2px 8px;font-size:18px;color:var(--danger-light)">×</button>
    </div>`).join('');
}

function saveProduct() {
  const name  = document.getElementById('p_name').value.trim();
  const emoji = document.getElementById('p_emoji').value.trim() || '📦';
  const desc  = document.getElementById('p_desc').value.trim();

  if (!name) { toast('Le nom du produit est requis', 'error'); return; }
  if (!state.selectedColors.length) { toast('Ajoutez au moins une couleur', 'error'); return; }
  if (!state.sizePrices.length)     { toast('Ajoutez au moins une taille avec son prix', 'error'); return; }

  const shop = state.shops.find(s => s.id === state.currentShopId);
  const id   = Math.floor(Math.random() * 90000) + 10000;
  shop.products.push({ id, name, emoji, desc, colors: [...state.selectedColors], sizes: [...state.sizePrices] });
  saveData();

  document.getElementById('addProductForm').style.display = 'none';
  state.selectedColors = [];
  state.sizePrices     = [];

  toast(`✓ Produit "${name}" ajouté !`, 'success');
  renderVendProducts();
  renderVendeuse();
}

function renderVendProducts() {
  const shop = state.shops.find(s => s.id === state.currentShopId);
  const list = document.getElementById('vendProductsList');

  if (!shop.products.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📦</div>
      <p>Vous n'avez pas encore de produits.<br>Cliquez sur "+ Ajouter un produit" pour commencer.</p>
    </div>`;
    return;
  }

  list.innerHTML = shop.products.map(p => `
    <div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div style="display:flex;gap:14px;align-items:flex-start">
          <span style="font-size:3rem;line-height:1">${p.emoji}</span>
          <div>
            <div style="font-weight:600;font-size:16px">${p.name}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px;line-height:1.4">${p.desc || 'Pas de description'}</div>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Supprimer</button>
      </div>
      <div style="margin-top:1.25rem;display:flex;gap:2rem;flex-wrap:wrap;font-size:13px">
        <div>
          <div style="color:var(--text3);margin-bottom:6px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Couleurs (${p.colors.length})</div>
          <div style="display:flex;gap:8px;align-items:center">
            ${p.colors.map(c => `
              <div title="${c.name}" style="display:flex;align-items:center;gap:4px">
                <div style="width:18px;height:18px;border-radius:50%;background:${c.hex};border:1px solid var(--border)"></div>
                <span style="font-size:11px;color:var(--text3)">${c.name}</span>
              </div>`).join('')}
          </div>
        </div>
        <div>
          <div style="color:var(--text3);margin-bottom:6px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Tailles & prix</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${p.sizes.map(s => `<span class="payment-tag">${s.size} → ${s.price} MRU</span>`).join('')}
          </div>
        </div>
      </div>
    </div>`).join('');
}

function deleteProduct(pid) {
  if (!confirm('Supprimer ce produit ?')) return;
  const shop = state.shops.find(s => s.id === state.currentShopId);
  shop.products = shop.products.filter(p => p.id !== pid);
  saveData();
  renderVendProducts();
  renderVendeuse();
  toast('Produit supprimé', 'info');
}

// ═══════════════════════════════════════════════════
// VENDEUSE — DÉCLARER UNE VENTE
// ═══════════════════════════════════════════════════

function renderVendVentes() {
  const shop = state.shops.find(s => s.id === state.currentShopId);

  // Remplir le select produit
  const sel = document.getElementById('v_product');
  sel.innerHTML = '<option value="">-- Choisir un produit --</option>' +
    shop.products.map(p => `<option value="${p.id}">${p.emoji} ${p.name}</option>`).join('');

  // Reset autres selects
  document.getElementById('v_size').innerHTML  = '<option value="">-- Choisir une taille --</option>';
  document.getElementById('v_color').innerHTML = '<option value="">-- Choisir une couleur --</option>';
  document.getElementById('v_price').value     = '';

  // Historique
  renderVentesTable(shop);
}

function updateVenteSizes() {
  const shop  = state.shops.find(s => s.id === state.currentShopId);
  const pid   = parseInt(document.getElementById('v_product').value);
  const prod  = shop.products.find(p => p.id === pid);
  const ssSel = document.getElementById('v_size');
  const scSel = document.getElementById('v_color');

  if (prod) {
    ssSel.innerHTML = '<option value="">-- Choisir une taille --</option>' +
      prod.sizes.map(s => `<option value="${s.size}" data-price="${s.price}">${s.size} — ${s.price} MRU</option>`).join('');
    scSel.innerHTML = '<option value="">-- Choisir une couleur --</option>' +
      prod.colors.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    document.getElementById('v_price').value = '';
  } else {
    ssSel.innerHTML = '<option value="">--</option>';
    scSel.innerHTML = '<option value="">--</option>';
  }
}

function autoFillPrice() {
  const sel = document.getElementById('v_size');
  const opt = sel.options[sel.selectedIndex];
  if (opt && opt.dataset.price) {
    document.getElementById('v_price').value = opt.dataset.price;
  }
}

function declarerVente() {
  const shop  = state.shops.find(s => s.id === state.currentShopId);
  const pid   = parseInt(document.getElementById('v_product').value);
  const prod  = shop.products.find(p => p.id === pid);
  const size  = document.getElementById('v_size').value;
  const color = document.getElementById('v_color').value;
  const price = parseFloat(document.getElementById('v_price').value);

  if (!prod)            { toast('Veuillez choisir un produit', 'error'); return; }
  if (!size)            { toast('Veuillez choisir une taille', 'error'); return; }
  if (!color)           { toast('Veuillez choisir une couleur', 'error'); return; }
  if (!price || price <= 0) { toast('Veuillez entrer un prix valide', 'error'); return; }

  const sale = {
    shopId:   shop.id,
    shopName: shop.name,
    product:  prod.name,
    color,
    size,
    price,
    date: todayStr()
  };

  if (!shop.sales) shop.sales = [];
  shop.sales.push(sale);
  state.globalSales.push(sale);
  saveData();

  // Reset
  document.getElementById('v_product').value = '';
  document.getElementById('v_size').innerHTML  = '<option value="">-- Choisir une taille --</option>';
  document.getElementById('v_color').innerHTML = '<option value="">-- Choisir une couleur --</option>';
  document.getElementById('v_price').value = '';

  toast(`✓ Vente de "${prod.name}" déclarée — ${price} MRU`, 'success');
  renderVentesTable(shop);
  renderVendeuse();
}

function renderVentesTable(shop) {
  const sales = (shop.sales || []).slice().reverse();
  document.getElementById('ventesTable').innerHTML = sales.length
    ? sales.map(s => `
        <tr>
          <td>${s.product}</td>
          <td>${s.color}</td>
          <td>${s.size}</td>
          <td style="color:var(--gold);font-weight:600">${s.price} MRU</td>
          <td>${formatDate(s.date)}</td>
        </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text3)">Aucune vente déclarée</td></tr>`;
}

// ═══════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════

// Pré-remplir le select boutiques sur la page login
document.getElementById('shopSelect').innerHTML =
  state.shops.map(s => `<option value="${s.id}">${s.emoji} ${s.name}</option>`).join('');

// Rendre la page home par défaut et afficher login
renderHome();
showPage('login');

console.log('%c✦ Souk Digital', 'color:#C9A84C;font-size:20px;font-family:serif');
console.log('%cPlatforme chargée avec ' + state.shops.length + ' boutiques', 'color:#8A7D6B;font-size:12px');
