import { useState, useEffect } from 'react';
import * as api from '../api';
import { uploadImage } from '../supabase';
import { useAuth } from '../context/AuthContext';
import s from './SellerDashboard.module.css';

const TABS = [
  { id: 'overview',  icon: '⊞', label: 'Dashboard' },
  { id: 'products',  icon: '📦', label: 'Mes produits' },
  { id: 'ventes',    icon: '📈', label: 'Déclarer vente' },
];

const PRESET_COLORS = [
  { name: 'Rouge',        hex: '#E53935' },
  { name: 'Rose',         hex: '#E88B9A' },
  { name: 'Orange',       hex: '#FB8C00' },
  { name: 'Jaune',        hex: '#FDD835' },
  { name: 'Vert',         hex: '#43A047' },
  { name: 'Bleu marine',  hex: '#1B3A5E' },
  { name: 'Bleu ciel',    hex: '#5B9BD5' },
  { name: 'Violet',       hex: '#8E24AA' },
  { name: 'Bordeaux',     hex: '#7A1B2E' },
  { name: 'Noir',         hex: '#2C2C2A' },
  { name: 'Blanc',        hex: '#F5F0E8' },
  { name: 'Beige',        hex: '#C4A882' },
  { name: 'Camel',        hex: '#C4813A' },
  { name: 'Or',           hex: '#C9A84C' },
  { name: 'Gris',         hex: '#78909C' },
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('overview');
  const [shop, setShop]       = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);

  // Form produit
  const [showProductForm, setShowProductForm] = useState(false);
  const [pForm, setPForm] = useState({ name:'', emoji:'', description:'', image:'' });
  const [pColors, setPColors] = useState([]);
  const [customColor, setCustomColor] = useState({ hex:'#C9A84C', name:'', image:'' });
  const [pSizes, setPSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState({ size:'', price:'' });

  // Form vente
  const [vForm, setVForm] = useState({ product_id:'', product_name:'', color:'', size:'', price:'' });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [sh, sa] = await Promise.all([api.getMyShop(), api.getMySales()]);
      setShop(sh);
      setProducts(sh.products?.filter(p => p.active) || []);
      setSales(sa);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Produits ──
  function toggleColor(color) {
    setPColors(prev =>
      prev.find(c => c.hex === color.hex)
        ? prev.filter(c => c.hex !== color.hex)
        : [...prev, color]
    );
  }

  function addCustomColor() {
    if (!customColor.name.trim()) { showToast('Entrez un nom pour la couleur', 'error'); return; }
    if (pColors.find(c => c.hex === customColor.hex)) { showToast('Couleur déjà ajoutée', 'error'); return; }
    setPColors(prev => [...prev, { ...customColor }]);
    setCustomColor({ hex: '#C9A84C', name: '', image: '' });
  }

  function addSize() {
    if (!sizeInput.size.trim() || !sizeInput.price) { showToast('Entrez taille et prix', 'error'); return; }
    if (pSizes.find(s => s.size === sizeInput.size)) { showToast('Taille déjà ajoutée', 'error'); return; }
    setPSizes(prev => [...prev, { size: sizeInput.size, price: parseFloat(sizeInput.price) }]);
    setSizeInput({ size: '', price: '' });
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!pForm.name) { showToast('Le nom est requis', 'error'); return; }
    if (!pColors.length) { showToast('Ajoutez au moins une couleur', 'error'); return; }
    if (!pSizes.length)  { showToast('Ajoutez au moins une taille', 'error'); return; }
    try {
      await api.createProduct({ ...pForm, colors: pColors, sizes: pSizes });
      showToast('Produit ajouté !');
      setShowProductForm(false);
      setPForm({ name:'', emoji:'', description:'', image:'' });
      setPColors([]); setPSizes([]);
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Produit supprimé');
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ── Ventes ──
  function handleProductSelect(pid) {
    const prod = products.find(p => p.id === pid);
    setSelectedProduct(prod || null);
    setVForm({ product_id: pid, product_name: prod?.name || '', color:'', size:'', price:'' });
  }

  function handleSizeSelect(size) {
    const sizeObj = selectedProduct?.sizes?.find(s => s.size === size);
    setVForm(f => ({ ...f, size, price: sizeObj?.price || f.price }));
  }

  async function submitVente(e) {
    e.preventDefault();
    if (!vForm.product_name || !vForm.color || !vForm.size || !vForm.price) {
      showToast('Remplissez tous les champs', 'error'); return;
    }
    try {
      await api.createSale(vForm);
      showToast('Vente déclarée avec succès !');
      setVForm({ product_id:'', product_name:'', color:'', size:'', price:'' });
      setSelectedProduct(null);
      await loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  }

  if (loading) return (
    <div className={s.loadingPage}>
      <div className={s.spinner}></div>
      <p>Chargement de votre espace...</p>
    </div>
  );

  const totalRev = sales.reduce((a, s) => a + parseFloat(s.price), 0);

  return (
    <div className={s.layout}>
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarBrand}>{shop?.emoji} {shop?.name}</div>
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
            <h1 className={s.pageTitle}>{shop?.emoji} {shop?.name}</h1>
            <p className={s.pageSub}>Bonjour {user?.name} — votre tableau de bord</p>

            <div className={s.statGrid}>
              <StatCard label="Mes produits"    value={products.length}                     color="blue" />
              <StatCard label="Ventes déclarées" value={sales.length}                        color="green" />
              <StatCard label="Mes revenus"     value={`${totalRev.toLocaleString()} MRU`} color="gold" />
            </div>

            <div className={s.card}>
              <div className={s.cardTitle}>Mes dernières ventes</div>
              <div className={s.tableWrap}><div className={s.tableWrap}><div className={s.tableWrap}><table className={s.table}>
                <thead><tr><th>Produit</th><th>Couleur</th><th>Taille</th><th>Prix</th><th>Date</th></tr></thead>
                <tbody>
                  {sales.slice(0, 10).map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.product_name}</td>
                      <td>{sale.color}</td>
                      <td>{sale.size}</td>
                      <td className={s.gold}>{parseFloat(sale.price).toLocaleString()} MRU</td>
                      <td>{new Date(sale.sold_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={5} className={s.emptyCell}>
                      Aucune vente — déclarez votre première vente dans l'onglet "Déclarer vente"
                    </td></tr>
                  )}
                </tbody>
              </table></div></div></div>
            </div>

            {shop?.payments?.length > 0 && (
              <div className={s.card}>
                <div className={s.cardTitle}>Vos modes de paiement</div>
                <div className={s.payTags}>
                  {shop.payments.map((p, i) => <span key={i} className={s.payTag}>{p}</span>)}
                </div>
                <p className={s.textSub} style={{ marginTop: '.75rem', fontSize: 12 }}>
                  Ces modes s'affichent automatiquement dans la modale de commande WhatsApp de votre boutique.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUITS ── */}
        {tab === 'products' && (
          <div className={s.panel}>
            <div className={s.panelHeader}>
              <div>
                <h1 className={s.pageTitle}>Mes produits</h1>
                <p className={s.pageSub}>Gérez votre catalogue</p>
              </div>
              <button className={s.btnGold} onClick={() => setShowProductForm(!showProductForm)}>
                {showProductForm ? '✕ Annuler' : '+ Ajouter un produit'}
              </button>
            </div>

            {showProductForm && (
              <div className={s.card}>
                <div className={s.cardTitle}>Nouveau produit</div>
                <form onSubmit={saveProduct}>
                  <div className={s.formGrid}>
                    <div className={s.group}>
                      <label className={s.label}>Nom du produit *</label>
                      <input className={s.input} value={pForm.name} onChange={e=>setPForm({...pForm,name:e.target.value})} placeholder="Ex: Robe Florée" required />
                    </div>
                    <div className={s.group}>
                      <label className={s.label}>Emoji *</label>
                      <input className={s.input} value={pForm.emoji} onChange={e=>setPForm({...pForm,emoji:e.target.value})} placeholder="👗" style={{fontSize:'1.4rem',textAlign:'center'}} />
                    </div>
                    <div className={s.group} style={{gridColumn:'1/-1'}}>
                      <label className={s.label}>Description</label>
                      <textarea className={s.textarea} value={pForm.description} onChange={e=>setPForm({...pForm,description:e.target.value})} placeholder="Décrivez votre produit..." rows={2} />
                    </div>
                    <div className={s.group} style={{gridColumn:'1/-1'}}>
                      <label className={s.label}>Photo principale du produit</label>
                      <div onClick={()=>document.getElementById('prodImageInput').click()} style={{border:'2px dashed #C9A84C',borderRadius:12,padding:'1.5rem',textAlign:'center',cursor:'pointer',background:'var(--bg2)'}}>
                        <input type="file" id="prodImageInput" accept="image/*" style={{display:'none'}} onChange={async e=>{
                          const file = e.target.files[0];
                          if (!file) return;
                          setPForm(f=>({...f, imageUploading: true}));
                          try {
                            const url = await uploadImage(file, 'products');
                            setPForm(f=>({...f, image: url, imageUploading: false}));
                          } catch(err) {
                            showToast('Erreur upload photo', 'error');
                            setPForm(f=>({...f, imageUploading: false}));
                          }
                        }} />
                        {pForm.imageUploading
                          ? <div><div style={{fontSize:'2rem'}}>⏳</div><div style={{color:'var(--text3)',fontSize:'.9rem',marginTop:'.5rem'}}>Upload en cours...</div></div>
                          : pForm.image
                            ? <img src={pForm.image} style={{width:'100%',height:160,objectFit:'cover',borderRadius:8}} />
                            : <div><div style={{fontSize:'2rem'}}>📷</div><div style={{color:'var(--text3)',fontSize:'.9rem',marginTop:'.5rem'}}>Cliquez pour ajouter une photo</div></div>
                        }
                      </div>
                    </div>
                  </div>

                  {/* COULEURS */}
                  <div className={s.section}>
                    <label className={s.label}>Couleurs disponibles *</label>
                    <div className={s.presetColors}>
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`${s.presetColor} ${pColors.find(pc=>pc.hex===c.hex) ? s.presetColorActive : ''}`}
                          style={{ background: c.hex }}
                          title={c.name}
                          onClick={() => toggleColor(c)}
                        />
                      ))}
                    </div>
                    <div className={s.customColorRow}>
                      <input type="color" value={customColor.hex} onChange={e=>setCustomColor({...customColor,hex:e.target.value})} className={s.colorPicker} />
                      <input className={s.input} value={customColor.name} onChange={e=>setCustomColor({...customColor,name:e.target.value})} placeholder="Nom de la couleur" style={{flex:1}} />
                      <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:13,whiteSpace:'nowrap'}}>
                        {customColor.imageUploading ? '⏳' : '📷'} Photo
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                          const file = e.target.files[0];
                          if (!file) return;
                          setCustomColor(c=>({...c, imageUploading: true}));
                          try {
                            const url = await uploadImage(file, 'colors');
                            setCustomColor(c=>({...c, image: url, imageUploading: false}));
                          } catch(err) {
                            showToast('Erreur upload photo couleur', 'error');
                            setCustomColor(c=>({...c, imageUploading: false}));
                          }
                        }} />
                      </label>
                      {customColor.image && <img src={customColor.image} style={{width:40,height:40,objectFit:'cover',borderRadius:6,border:'2px solid #C9A84C'}} />}
                      <button type="button" className={s.btnOutline} onClick={addCustomColor}>+ Ajouter</button>
                    </div>
                    {pColors.length > 0 && (
                      <div className={s.selectedColors}>
                        {pColors.map((c,i) => (
                          <div key={i} className={s.colorTag} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',marginBottom:6,background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                            <span className={s.colorDot} style={{background:c.hex,width:20,height:20,borderRadius:'50%',flexShrink:0}} />
                            {c.image
                              ? <img src={c.image} style={{width:36,height:36,objectFit:'cover',borderRadius:6}} />
                              : <span style={{fontSize:11,color:'var(--text3)'}}>Pas de photo</span>
                            }
                            <span style={{flex:1,fontSize:13}}>{c.name}</span>
                            <button type="button" className={s.tagRemove} onClick={()=>setPColors(p=>p.filter((_,j)=>j!==i))}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TAILLES & PRIX */}
                  <div className={s.section}>
                    <label className={s.label}>Tailles & Prix *</label>
                    <div className={s.sizeAddRow}>
                      <input className={s.input} value={sizeInput.size} onChange={e=>setSizeInput({...sizeInput,size:e.target.value})} placeholder="Taille (S, M, L, 38, Petit...)" style={{flex:2}} />
                      <input className={s.input} type="number" value={sizeInput.price} onChange={e=>setSizeInput({...sizeInput,price:e.target.value})} placeholder="Prix (MRU)" style={{flex:1}} />
                      <button type="button" className={s.btnOutline} onClick={addSize}>+ Ajouter</button>
                    </div>
                    {pSizes.length > 0 && (
                      <div className={s.sizesList}>
                        {pSizes.map((sz,i) => (
                          <span key={i} className={s.sizeTag}>
                            {sz.size} — {sz.price} MRU
                            <button type="button" className={s.tagRemove} onClick={()=>setPSizes(p=>p.filter((_,j)=>j!==i))}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={s.formActions}>
                    <button type="submit" className={s.btnGold}>✓ Enregistrer le produit</button>
                    <button type="button" className={s.btnOutline} onClick={()=>setShowProductForm(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {products.length === 0 && !showProductForm ? (
              <div className={s.empty}>
                <div className={s.emptyIcon}>📦</div>
                <p>Aucun produit encore.<br />Cliquez sur "+ Ajouter un produit" pour commencer.</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className={s.card}>
                  <div className={s.productCardHeader}>
                    <div className={s.productCardLeft}>
                      {product.image
                        ? <img src={product.image} style={{width:56,height:56,objectFit:'cover',borderRadius:10,border:'2px solid #C9A84C',flexShrink:0}} />
                        : <span className={s.productEmoji}>{product.emoji}</span>
                      }
                      <div>
                        <div className={s.productName}>{product.name}</div>
                        <div className={s.textSub}>{product.description}</div>
                      </div>
                    </div>
                    <button className={s.btnDangerSm} onClick={() => deleteProduct(product.id)}>Supprimer</button>
                  </div>
                  <div className={s.productMeta}>
                    <div>
                      <div className={s.metaLabel}>Couleurs</div>
                      <div className={s.colorDots}>
                        {(product.colors || []).map((c,i) => (
                          <span key={i} className={s.metaColorDot} style={{background:c.hex}} title={c.name} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className={s.metaLabel}>Tailles & Prix</div>
                      <div className={s.sizesRow}>
                        {(product.sizes || []).map((sz,i) => (
                          <span key={i} className={s.payTag}>{sz.size} → {sz.price} MRU</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── VENTES ── */}
        {tab === 'ventes' && (
          <div className={s.panel}>
            <h1 className={s.pageTitle}>Déclarer une vente</h1>
            <p className={s.pageSub}>Après avoir conclu une vente via WhatsApp, enregistrez-la ici pour qu'elle apparaisse dans votre tableau de bord</p>

            <div className={s.card}>
              <div className={s.cardTitle}>Nouvelle vente</div>
              {products.length === 0 ? (
                <p className={s.textSub}>Vous n'avez pas encore de produits. Ajoutez des produits d'abord.</p>
              ) : (
                <form onSubmit={submitVente}>
                  <div className={s.formGrid}>
                    <div className={s.group}>
                      <label className={s.label}>Produit vendu *</label>
                      <select className={s.select} value={vForm.product_id} onChange={e=>handleProductSelect(e.target.value)} required>
                        <option value="">-- Choisir un produit --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                      </select>
                    </div>

                    <div className={s.group}>
                      <label className={s.label}>Couleur vendue *</label>
                      <select className={s.select} value={vForm.color} onChange={e=>setVForm({...vForm,color:e.target.value})} required disabled={!selectedProduct}>
                        <option value="">-- Choisir une couleur --</option>
                        {(selectedProduct?.colors||[]).map((c,i) => <option key={i} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className={s.group}>
                      <label className={s.label}>Taille vendue *</label>
                      <select className={s.select} value={vForm.size} onChange={e=>handleSizeSelect(e.target.value)} required disabled={!selectedProduct}>
                        <option value="">-- Choisir une taille --</option>
                        {(selectedProduct?.sizes||[]).map((sz,i) => <option key={i} value={sz.size}>{sz.size} — {sz.price} MRU</option>)}
                      </select>
                    </div>

                    <div className={s.group}>
                      <label className={s.label}>Prix vendu (MRU) *</label>
                      <input className={s.input} type="number" value={vForm.price} onChange={e=>setVForm({...vForm,price:e.target.value})} placeholder="0" required min={1} />
                    </div>
                  </div>
                  <button type="submit" className={s.btnGold}>✓ Déclarer la vente</button>
                </form>
              )}
            </div>

            <div className={s.card}>
              <div className={s.cardTitle}>Historique de mes ventes ({sales.length})</div>
              <div className={s.tableWrap}><div className={s.tableWrap}><div className={s.tableWrap}><table className={s.table}>
                <thead><tr><th>Produit</th><th>Couleur</th><th>Taille</th><th>Prix</th><th>Date</th></tr></thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.product_name}</td>
                      <td>{sale.color}</td>
                      <td>{sale.size}</td>
                      <td className={s.gold}>{parseFloat(sale.price).toLocaleString()} MRU</td>
                      <td>{new Date(sale.sold_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={5} className={s.emptyCell}>Aucune vente déclarée</td></tr>
                  )}
                </tbody>
              </table></div></div></div>
            </div>
          </div>
        )}

      </main>

      {toast && (
        <div className={`${s.toast} ${toast.type==='error' ? s.toastError : s.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colorMap = { gold:'#C9A84C', green:'#52B788', blue:'#5B9BD5' };
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem' }}>
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</div>
      <div style={{ fontSize:'1.7rem', fontWeight:600, color: colorMap[color] || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}
