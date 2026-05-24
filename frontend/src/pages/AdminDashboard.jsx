import { useState, useEffect } from 'react';
import * as api from '../api';
import s from './AdminDashboard.module.css';

const TABS = [
  { id: 'overview',  icon: '⊞', label: "Vue d'ensemble" },
  { id: 'boutiques', icon: '🏪', label: 'Boutiques' },
  { id: 'vendeuses', icon: '👤', label: 'Vendeuses' },
  { id: 'paiements', icon: '💳', label: 'Paiements' },
  { id: 'ventes',    icon: '📈', label: 'Ventes globales' },
];

export default function AdminDashboard() {
  const [tab, setTab]     = useState('overview');
  const [shops, setShops] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);

  // Form : nouvelle boutique
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', emoji: '', whatsapp: '', description: '',
    category: 'mode', seller_name: '', seller_email: '', seller_password: ''
  });

  // Form : paiement
  const [newPayments, setNewPayments] = useState({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [sh, sa, st, us] = await Promise.all([
        api.getAllShops(),
        api.getAllSales(),
        api.getSalesStats(),
        api.getUsers(),
      ]);
      setShops(sh); setSales(sa); setStats(st); setUsers(us);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleCreateShop(e) {
    e.preventDefault();
    try {
      await api.createShop(form);
      showToast('Boutique créée avec succès !');
      setShowForm(false);
      setForm({ name:'',emoji:'',whatsapp:'',description:'',category:'mode',seller_name:'',seller_email:'',seller_password:'',logo:'' });
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function toggleShop(shop) {
    try {
      await api.updateShop(shop.id, { ...shop, active: !shop.active });
      showToast(shop.active ? 'Boutique désactivée' : 'Boutique activée');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function handleDeleteShop(id) {
    if (!confirm('Supprimer cette boutique ? Action irréversible.')) return;
    try {
      await api.deleteShop(id);
      showToast('Boutique supprimée');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function addPayment(shopId) {
    const val = (newPayments[shopId] || '').trim();
    if (!val) return;
    const shop = shops.find(s => s.id === shopId);
    const updated = [...(shop.payments || []), val];
    try {
      await api.updatePayments(shopId, updated);
      setNewPayments(p => ({ ...p, [shopId]: '' }));
      showToast('Mode de paiement ajouté');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function removePayment(shopId, idx) {
    const shop = shops.find(s => s.id === shopId);
    const updated = shop.payments.filter((_, i) => i !== idx);
    try {
      await api.updatePayments(shopId, updated);
      showToast('Mode de paiement supprimé');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function handleDeleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.deleteUser(id);
      showToast('Utilisateur supprimé');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  if (loading) return (
    <div className={s.loadingPage}>
      <div className={s.spinner}></div>
      <p>Chargement du dashboard...</p>
    </div>
  );

  const totalRev = sales.reduce((a, s) => a + parseFloat(s.price), 0);

  return (
    <div className={s.layout}>
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarBrand}>✦ Admin</div>
        {TABS.map(t => (
          <button key={t.id} className={`${s.navItem} ${tab === t.id ? s.navActive : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
        <div className={s.navSep} />
        <a href="/" className={s.navItem}><span>🌐</span> Voir la vitrine</a>
      </aside>

      {/* MAIN */}
      <main className={s.main}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className={s.panel}>
            <h1 className={s.pageTitle}>Vue d'ensemble</h1>
            <p className={s.pageSub}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>

            <div className={s.statGrid}>
              <StatCard label="Boutiques actives"  value={shops.filter(s=>s.active).length} sub={`sur ${shops.length} total`} color="gold" />
              <StatCard label="Ventes totales"     value={sales.length}                      color="green" />
              <StatCard label="Chiffre d'affaires" value={`${totalRev.toLocaleString()} MRU`} color="gold" />
              <StatCard label="Produits actifs"    value={shops.reduce((a,s)=>a+(s.products?.length||0),0)} color="blue" />
            </div>

            <div className={s.gridTwo}>
              <div className={s.card}>
                <div className={s.cardTitle}>Dernières ventes</div>
                <div className={s.tableWrap}><div className={s.tableWrap}><div className={s.tableWrap}><table className={s.table}>
                  <thead><tr><th>Produit</th><th>Boutique</th><th>Prix</th><th>Date</th></tr></thead>
                  <tbody>
                    {sales.slice(0, 10).map(sale => (
                      <tr key={sale.id}>
                        <td>{sale.product_name}</td>
                        <td>{sale.shops?.emoji} {sale.shops?.name}</td>
                        <td className={s.gold}>{parseFloat(sale.price).toLocaleString()} MRU</td>
                        <td>{new Date(sale.sold_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                    {sales.length === 0 && <tr><td colSpan={4} className={s.emptyCell}>Aucune vente</td></tr>}
                  </tbody>
                </table></div></div></div>
              </div>

              <div className={s.card}>
                <div className={s.cardTitle}>Boutiques</div>
                {shops.map(shop => (
                  <div key={shop.id} className={s.shopQuick}>
                    <div className={s.shopQuickLeft}>
                      <span className={s.shopEmoji}>{shop.emoji}</span>
                      <div>
                        <div className={s.shopQuickName}>{shop.name}</div>
                        <div className={s.shopQuickSub}>{shop.users?.name}</div>
                      </div>
                    </div>
                    <div className={s.shopQuickRight}>
                      <div className={s.gold}>{(shop.sales||[]).reduce((a,v)=>a+parseFloat(v.price),0).toLocaleString()} MRU</div>
                      <div className={s.textSub}>{(shop.sales||[]).length} ventes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOUTIQUES ── */}
        {tab === 'boutiques' && (
          <div className={s.panel}>
            <div className={s.panelHeader}>
              <div>
                <h1 className={s.pageTitle}>Gérer les boutiques</h1>
                <p className={s.pageSub}>Créez et gérez les boutiques des vendeuses</p>
              </div>
              <button className={s.btnGold} onClick={() => setShowForm(!showForm)}>
                {showForm ? '✕ Annuler' : '+ Nouvelle boutique'}
              </button>
            </div>

            {showForm && (
              <div className={s.card}>
                <div className={s.cardTitle}>Créer une boutique</div>
                <form onSubmit={handleCreateShop}>
                  <div className={s.formGrid}>
                    <Input label="Nom de la boutique *" value={form.name}            onChange={v=>setForm({...form,name:v})}            placeholder="Boutique Fatima" />
                    <Input label="Emoji *"              value={form.emoji}           onChange={v=>setForm({...form,emoji:v})}           placeholder="👗" style={{fontSize:'1.5rem',textAlign:'center'}} />
                    <div className={s.group} style={{gridColumn:'1/-1'}}>
                      <label className={s.label}>Logo de la boutique</label>
                      <div
                        onClick={() => document.getElementById('logoInput').click()}
                        style={{border:'2px dashed #C9A84C',borderRadius:12,padding:'1.5rem',textAlign:'center',cursor:'pointer',background:'var(--bg2)'}}>
                        <input
                          type="file"
                          id="logoInput"
                          accept="image/*"
                          style={{display:'none'}}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => setForm({...form, logo: ev.target.result});
                            reader.readAsDataURL(file);
                          }}
                        />
                        {form.logo
                          ? <img src={form.logo} style={{width:80,height:80,objectFit:'cover',borderRadius:'50%',border:'3px solid #C9A84C'}} />
                          : <div><div style={{fontSize:'2rem'}}>🏪</div><div style={{color:'var(--text3)',fontSize:'.9rem',marginTop:'.5rem'}}>Cliquez pour ajouter un logo</div></div>
                        }
                      </div>
                    </div>
                    <Input label="WhatsApp (avec indicatif) *" value={form.whatsapp} onChange={v=>setForm({...form,whatsapp:v})}        placeholder="212612345678" />
                    <div className={s.group}>
                      <label className={s.label}>Catégorie</label>
                      <select className={s.select} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                        <option value="mode">Mode</option>
                        <option value="maison">Maison</option>
                        <option value="beaute">Beauté</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className={s.group} style={{gridColumn:'1/-1'}}>
                      <label className={s.label}>Description</label>
                      <textarea className={s.textarea} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description de la boutique..." rows={2} />
                    </div>
                    <div className={s.divider} style={{gridColumn:'1/-1'}} />
                    <Input label="Nom de la vendeuse *"   value={form.seller_name}     onChange={v=>setForm({...form,seller_name:v})}     placeholder="Prénom Nom" />
                    <Input label="Email vendeuse *"        value={form.seller_email}    onChange={v=>setForm({...form,seller_email:v})}    placeholder="vendeuse@email.com" type="email" />
                    <Input label="Mot de passe vendeuse *" value={form.seller_password} onChange={v=>setForm({...form,seller_password:v})} placeholder="Min 6 caractères" type="password" />
                  </div>
                  <div className={s.formActions}>
                    <button type="submit" className={s.btnGold}>Créer la boutique</button>
                    <button type="button" className={s.btnOutline} onClick={()=>setShowForm(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {shops.map(shop => (
              <div key={shop.id} className={s.card}>
                <div className={s.shopCardHeader}>
                  <div className={s.shopInfo}>
                    {shop.logo
                      ? <img src={shop.logo} style={{width:56,height:56,objectFit:'cover',borderRadius:'50%',border:'2px solid #C9A84C'}} />
                      : <span className={s.shopEmojiLg}>{shop.emoji}</span>
                    }
                    <div>
                      <div className={s.shopCardName}>{shop.name}</div>
                      <div className={s.shopCardSub}>
                        👤 {shop.users?.name} &nbsp;|&nbsp; 📱 +{shop.whatsapp}
                      </div>
                    </div>
                  </div>
                  <div className={s.shopActions}>
                    <span className={`${s.badge} ${shop.active ? s.badgeGreen : s.badgeRed}`}>
                      {shop.active ? '● Actif' : '● Inactif'}
                    </span>
                    <button className={s.btnOutline} onClick={() => toggleShop(shop)}>
                      {shop.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button className={s.btnDanger} onClick={() => handleDeleteShop(shop.id)}>Supprimer</button>
                  </div>
                </div>
                <p className={s.shopCardDesc}>{shop.description || 'Aucune description'}</p>
                <div className={s.shopCardMeta}>
                  <span>📦 {shop.products?.length || 0} produits</span>
                  <span>🛒 {shop.sales?.length || 0} ventes</span>
                  <span className={s.gold}>💰 {(shop.sales||[]).reduce((a,v)=>a+parseFloat(v.price),0).toLocaleString()} MRU</span>
                  <span>🏷️ {shop.category}</span>
                </div>
                <div className={s.payTags}>
                  {(shop.payments||[]).map((p,i) => <span key={i} className={s.payTag}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VENDEUSES ── */}
        {tab === 'vendeuses' && (
          <div className={s.panel}>
            <h1 className={s.pageTitle}>Vendeuses</h1>
            <p className={s.pageSub}>Toutes les vendeuses actives sur la plateforme</p>
            <div className={s.card}>
              <div className={s.tableWrap}><div className={s.tableWrap}><div className={s.tableWrap}><table className={s.table}>
                <thead>
                  <tr>
                    <th>Boutique</th><th>Vendeuse</th><th>Email</th>
                    <th>WhatsApp</th><th>Produits</th><th>Ventes</th><th>CA</th><th>Statut</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(shop => (
                    <tr key={shop.id}>
                      <td>{shop.emoji} <strong>{shop.name}</strong></td>
                      <td>{shop.users?.name}</td>
                      <td className={s.textSub}>{shop.users?.email}</td>
                      <td className={s.green}>+{shop.whatsapp}</td>
                      <td>{shop.products?.length || 0}</td>
                      <td>{shop.sales?.length || 0}</td>
                      <td className={s.gold}>{(shop.sales||[]).reduce((a,v)=>a+parseFloat(v.price),0).toLocaleString()} MRU</td>
                      <td>
                        <span className={`${s.dot} ${shop.active ? s.dotGreen : s.dotGray}`}></span>
                        {shop.active ? ' Active' : ' Inactive'}
                      </td>
                      <td>
                        {shop.users?.id && (
                          <button className={s.btnDangerSm} onClick={() => handleDeleteUser(shop.users.id)}>
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div></div></div>
            </div>
          </div>
        )}

        {/* ── PAIEMENTS ── */}
        {tab === 'paiements' && (
          <div className={s.panel}>
            <h1 className={s.pageTitle}>Modes de paiement</h1>
            <p className={s.pageSub}>Définissez les modes de paiement acceptés pour chaque boutique</p>
            {shops.map(shop => (
              <div key={shop.id} className={s.card}>
                <div className={s.cardTitle}>{shop.emoji} {shop.name}</div>
                <div className={s.tagRow}>
                  {(shop.payments || []).map((p, i) => (
                    <span key={i} className={s.tag}>
                      {p}
                      <button className={s.tagRemove} onClick={() => removePayment(shop.id, i)}>×</button>
                    </span>
                  ))}
                  {(shop.payments || []).length === 0 && (
                    <span className={s.textSub}>Aucun mode défini</span>
                  )}
                </div>
                <div className={s.paymentAddRow}>
                  <input
                    className={s.input}
                    value={newPayments[shop.id] || ''}
                    onChange={e => setNewPayments(p => ({ ...p, [shop.id]: e.target.value }))}
                    placeholder="Ex: Virement CIH, Wave, Espèces..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPayment(shop.id))}
                  />
                  <button className={s.btnGold} onClick={() => addPayment(shop.id)}>+ Ajouter</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VENTES GLOBALES ── */}
        {tab === 'ventes' && (
          <div className={s.panel}>
            <h1 className={s.pageTitle}>Ventes globales</h1>
            <p className={s.pageSub}>Toutes les ventes déclarées sur la plateforme</p>
            <div className={s.statGrid}>
              <StatCard label="Total ventes"        value={sales.length}                         color="green" />
              <StatCard label="Chiffre d'affaires"  value={`${totalRev.toLocaleString()} MRU`}   color="gold" />
              {stats?.byShop?.map(sh => (
                <StatCard key={sh.name} label={sh.name} value={`${sh.revenue.toLocaleString()} MRU`} sub={`${sh.count} ventes`} color="blue" />
              ))}
            </div>
            <div className={s.card}>
              <div className={s.cardTitle}>Détail de toutes les ventes</div>
              <div className={s.tableWrap}><div className={s.tableWrap}><div className={s.tableWrap}><table className={s.table}>
                <thead>
                  <tr><th>Produit</th><th>Boutique</th><th>Couleur</th><th>Taille</th><th>Prix</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.product_name}</td>
                      <td>{sale.shops?.emoji} {sale.shops?.name}</td>
                      <td>{sale.color || '—'}</td>
                      <td>{sale.size || '—'}</td>
                      <td className={s.gold}>{parseFloat(sale.price).toLocaleString()} MRU</td>
                      <td>{new Date(sale.sold_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button className={s.btnDangerSm} onClick={async ()=>{
                          if(!confirm('Supprimer cette vente ?')) return;
                          try { await api.deleteSale(sale.id); showToast('Vente supprimée'); await loadAll(); }
                          catch(e) { showToast(e.message,'error'); }
                        }}>✕</button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={7} className={s.emptyCell}>Aucune vente pour l'instant</td></tr>}
                </tbody>
              </table></div></div></div>
            </div>
          </div>
        )}

      </main>

      {/* TOAST */}
      {toast && (
        <div className={`${s.toast} ${toast.type === 'error' ? s.toastError : s.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Composants utilitaires ──

function StatCard({ label, value, sub, color }) {
  const colorMap = { gold: '#C9A84C', green: '#52B788', blue: '#5B9BD5' };
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem' }}>
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</div>
      <div style={{ fontSize:'1.7rem', fontWeight:600, color: colorMap[color] || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type='text', style }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ display:'block', fontSize:13, color:'var(--text3)', marginBottom:6, fontWeight:500 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', background:'var(--bg3)', border:'1px solid var(--border)',
          color:'var(--text)', padding:'10px 14px', borderRadius:8, fontSize:14,
          outline:'none', fontFamily:'inherit', ...style
        }}
      />
    </div>
  );
}
