import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShop } from '../api';
import s from './ShopPage.module.css';

export default function ShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [displayImage, setDisplayImage]   = useState(null);

  useEffect(() => {
    getShop(id).then(data => { setShop(data); setLoading(false); })
               .catch(() => { setLoading(false); navigate('/'); });
  }, [id]);

  function openProduct(product) {
    setModal(product);
    const firstColor = product.colors?.[0] || null;
    setSelectedColor(firstColor);
    setSelectedSize(product.sizes?.[0] || null);
    // Afficher photo de la première couleur ou photo principale
    setDisplayImage(firstColor?.image || product.image || null);
  }

  function handleColorSelect(color) {
    setSelectedColor(color);
    // Changer l'image selon la couleur sélectionnée
    setDisplayImage(color.image || modal?.image || null);
  }

  function orderWhatsApp() {
    if (!shop || !modal) return;
    const msg = encodeURIComponent(
      `Bonjour ! 👋\n\nJe souhaite commander depuis *${shop.name}* :\n\n` +
      `✨ *Produit :* ${modal.name}\n` +
      `🎨 *Couleur :* ${selectedColor?.name || '—'}\n` +
      `📏 *Taille :* ${selectedSize?.size || '—'}\n` +
      `💰 *Prix :* ${selectedSize?.price || '—'} MRU\n\n` +
      `Pouvez-vous confirmer la disponibilité et la livraison ?\n\nMerci ! 🙏`
    );
    window.open(`https://wa.me/${shop.whatsapp}?text=${msg}`, '_blank');
    setModal(null);
  }

  if (loading) return (
    <div className={s.loading}>
      <div className={s.spinner}></div>
      <p>Chargement de la boutique...</p>
    </div>
  );

  if (!shop) return null;

  const activeProducts = shop.products?.filter(p => p.active) || [];

  return (
    <div>
      {/* Header boutique */}
      <div className={s.header}>
        <button className={s.backBtn} onClick={() => navigate('/')}>← Retour aux boutiques</button>
        <div className={s.boutiqueInfo}>
          <div className={s.avatar}>
            {shop.logo
              ? <img src={shop.logo} alt={shop.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:16}} />
              : <span style={{fontSize:'2.5rem'}}>{shop.emoji}</span>
            }
          </div>
          <div>
            <h1 className={s.shopName}>{shop.name}</h1>
            <p className={s.shopDesc}>{shop.description}</p>
            <div className={s.payments}>
              <span className={s.payLabel}>💳 Paiements :</span>
              {(shop.payments || []).map((p, i) => <span key={i} className={s.payTag}>{p}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className={s.content}>
        <h2 className={s.sectionTitle}>Nos produits</h2>
        <p className={s.sectionSub}>Cliquez sur un produit pour commander via WhatsApp</p>

        {activeProducts.length === 0 ? (
          <div className={s.empty}><div>📦</div><p>Aucun produit disponible</p></div>
        ) : (
          <div className={s.grid}>
            {activeProducts.map(product => {
              const minPrice = Math.min(...(product.sizes || []).map(s => s.price));
              const firstColorImage = product.colors?.[0]?.image;
              const mainImg = firstColorImage || product.image;
              return (
                <div key={product.id} className={s.productCard} onClick={() => openProduct(product)}>
                  <div className={s.productImg}>
                    {mainImg
                      ? <img src={mainImg} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span>{product.emoji}</span>
                    }
                    <span className={s.priceBadge}>À partir de {minPrice} MRU</span>
                  </div>
                  <div className={s.productBody}>
                    <h3 className={s.productName}>{product.name}</h3>
                    <p className={s.productDesc}>{product.description}</p>
                    <div className={s.colors}>
                      {(product.colors || []).map((c, i) => (
                        c.image
                          ? <img key={i} src={c.image} alt={c.name} title={c.name} style={{width:20,height:20,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--border)'}} />
                          : <div key={i} className={s.colorDot} style={{ background: c.hex }} title={c.name} />
                      ))}
                    </div>
                    <div className={s.sizes}>
                      {(product.sizes || []).map((sz, i) => (
                        <span key={i} className={s.sizeChip}>{sz.size}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal commande */}
      {modal && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className={s.modal}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>{modal.name}</h2>
              <button className={s.closeBtn} onClick={() => setModal(null)}>✕</button>
            </div>

            {/* Photo qui change selon la couleur */}
            <div className={s.modalImg}>
              {displayImage
                ? <img src={displayImage} alt={modal.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12,transition:'opacity .3s'}} />
                : <span style={{fontSize:'4rem'}}>{modal.emoji}</span>
              }
            </div>

            {modal.description && <p className={s.modalDesc}>{modal.description}</p>}

            {/* Couleurs — cliquer change la photo */}
            <div className={s.formGroup}>
              <label className={s.label}>Couleur {selectedColor && <span style={{color:'var(--gold)'}}>— {selectedColor.name}</span>}</label>
              <div className={s.swatches}>
                {(modal.colors || []).map((c, i) => (
                  <div key={i} className={s.colorSwatchWrap} onClick={() => handleColorSelect(c)}>
                    {c.image
                      ? <img
                          src={c.image}
                          alt={c.name}
                          title={c.name}
                          className={`${s.colorPhotoSwatch} ${selectedColor?.hex === c.hex ? s.colorPhotoSwatchActive : ''}`}
                        />
                      : <button
                          className={`${s.swatch} ${selectedColor?.hex === c.hex ? s.swatchActive : ''}`}
                          style={{ background: c.hex }}
                          title={c.name}
                        />
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Tailles */}
            <div className={s.formGroup}>
              <label className={s.label}>Taille & Prix</label>
              <div className={s.sizePriceGrid}>
                {(modal.sizes || []).map((sz, i) => (
                  <button
                    key={i}
                    className={`${s.sizePrice} ${selectedSize?.size === sz.size ? s.sizePriceActive : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    <span className={s.sizeName}>{sz.size}</span>
                    <span className={s.sizeVal}>{sz.price} MRU</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modes de paiement */}
            <div className={s.paymentBox}>
              <p className={s.payLabel}>💳 Modes de paiement acceptés</p>
              <div className={s.payTags}>
                {(shop.payments || []).map((p, i) => <span key={i} className={s.payTag}>{p}</span>)}
              </div>
            </div>

            <button className={s.wpBtn} onClick={orderWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Commander via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
