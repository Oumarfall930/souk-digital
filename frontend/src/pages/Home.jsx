import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShops } from '../api';
import s from './Home.module.css';

export default function Home() {
  const [shops, setShops]     = useState([]);
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getShops().then(data => { setShops(data); setLoading(false); })
              .catch(() => setLoading(false));
  }, []);

  const cats = ['all', 'mode', 'maison', 'beaute', 'autre'];

  const filtered = shops.filter(sh => {
    const matchSearch = sh.name.toLowerCase().includes(search.toLowerCase()) ||
                        sh.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'all' || sh.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className={s.hero}>
        <div className={s.heroBadge}>🛍️ Marketplace WhatsApp</div>
        <h1 className={s.heroTitle}>
          Découvrez les <span className={s.gold}>meilleures boutiques</span>
        </h1>
        <p className={s.heroSub}>
          Commandez directement auprès des vendeurs via WhatsApp — simple, rapide, personnel
        </p>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input
            className={s.searchInput}
            type="text"
            placeholder="Rechercher une boutique..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={s.content}>
        <div className={s.topRow}>
          <div>
            <h2 className={s.sectionTitle}>Boutiques disponibles</h2>
            <p className={s.sectionSub}>{filtered.length} boutique{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className={s.filters}>
            {cats.map(c => (
              <button key={c} className={`${s.filterPill} ${cat === c ? s.active : ''}`} onClick={() => setCat(c)}>
                {c === 'all' ? 'Toutes' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={s.loading}>
            <div className={s.spinner}></div>
            <p>Chargement des boutiques...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🔍</div>
            <p>Aucune boutique trouvée</p>
          </div>
        ) : (
          <div className={s.grid}>
            {filtered.map(shop => (
              <div key={shop.id} className={s.shopCard} onClick={() => navigate(`/boutique/${shop.id}`)}>
                <div className={s.cardBanner}>
                  {shop.logo
                    ? <img src={shop.logo} alt={shop.name} className={s.bannerImg} />
                    : <span className={s.bannerEmoji}>{shop.emoji}</span>
                  }
                  <span className={s.badge}>ACTIF</span>
                </div>
                <div className={s.cardBody}>
                  <div className={s.shopHeader}>
                    {shop.logo && <img src={shop.logo} alt={shop.name} className={s.shopAvatar} />}
                    <h3 className={s.shopName}>{shop.name}</h3>
                  </div>
                  <p className={s.shopDesc}>{shop.description || 'Boutique en ligne'}</p>
                  <div className={s.shopMeta}>
                    <span>📦 {shop.products?.length || 0} produits</span>
                    <span>💬 WhatsApp</span>
                  </div>
                  <div className={s.paymentTags}>
                    {(shop.payments || []).slice(0, 3).map((p, i) => (
                      <span key={i} className={s.payTag}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
