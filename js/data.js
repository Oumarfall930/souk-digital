/**
 * SOUK DIGITAL — Données initiales
 * 
 * En production : remplacez ce fichier par des appels API (Supabase, Firebase, etc.)
 * Pour l'instant : toutes les données sont stockées en mémoire (localStorage pour persister)
 */

// ═══════════════════════════════════════════════════
// DONNÉES PAR DÉFAUT
// ═══════════════════════════════════════════════════

const DEFAULT_DATA = {
  shops: [
    {
      id: 1,
      name: "Boutique Yasmine",
      owner: "Yasmine Amrani",
      emoji: "👗",
      desc: "Mode féminine et prêt-à-porter chic — robes, caftans, accessoires",
      whatsapp: "212661234567",
      password: "pass123",
      email: "yasmine@souk.ma",
      category: "mode",
      active: true,
      payments: ["Virement bancaire CIH", "Carte bancaire", "PayPal"],
      products: [
        {
          id: 101,
          name: "Robe Florée",
          emoji: "🌸",
          desc: "Robe légère à motifs floraux, parfaite pour l'été. Tissu 100% coton.",
          colors: [
            { name: "Rose poudré",  hex: "#E88B9A" },
            { name: "Blanc ivoire", hex: "#F5F0E8" },
            { name: "Beige camel",  hex: "#C4A882" }
          ],
          sizes: [
            { size: "S",  price: 299 },
            { size: "M",  price: 299 },
            { size: "L",  price: 319 },
            { size: "XL", price: 329 }
          ]
        },
        {
          id: 102,
          name: "Caftan Élégant",
          emoji: "✨",
          desc: "Caftan traditionnel brodé à la main, pour les grandes occasions.",
          colors: [
            { name: "Or royal",      hex: "#C9A84C" },
            { name: "Rouge bordeaux",hex: "#7A1B2E" },
            { name: "Bleu marine",   hex: "#1B3A5E" }
          ],
          sizes: [
            { size: "S",  price: 599 },
            { size: "M",  price: 599 },
            { size: "L",  price: 649 },
            { size: "XL", price: 679 }
          ]
        },
        {
          id: 103,
          name: "Veste Bohème",
          emoji: "🧥",
          desc: "Veste légère style bohème, idéale pour les soirées fraîches.",
          colors: [
            { name: "Noir",       hex: "#2C2C2A" },
            { name: "Caramel",    hex: "#C4813A" }
          ],
          sizes: [
            { size: "S/M", price: 449 },
            { size: "L/XL",price: 469 }
          ]
        }
      ],
      sales: [
        { product: "Robe Florée",    color: "Rose poudré",  size: "M",  price: 299, date: "2025-01-10" },
        { product: "Caftan Élégant", color: "Or royal",     size: "L",  price: 649, date: "2025-01-09" },
        { product: "Robe Florée",    color: "Blanc ivoire", size: "S",  price: 299, date: "2025-01-07" }
      ]
    },
    {
      id: 2,
      name: "Maison Khadija",
      owner: "Khadija Benali",
      emoji: "🏡",
      desc: "Articles de maison et décoration artisanale marocaine authentique",
      whatsapp: "212698765432",
      password: "khadija123",
      email: "khadija@souk.ma",
      category: "maison",
      active: true,
      payments: ["Espèces à la livraison", "Wave", "Virement Attijariwafa"],
      products: [
        {
          id: 201,
          name: "Plateau Tadelakt",
          emoji: "🫙",
          desc: "Plateau artisanal en tadelakt, enduit traditionnel marocain. Fait à la main à Marrakech.",
          colors: [
            { name: "Ocre terracotta", hex: "#D4913A" },
            { name: "Blanc cassé",     hex: "#F0E8D8" }
          ],
          sizes: [
            { size: "Petit (20cm)",  price: 189 },
            { size: "Moyen (30cm)", price: 249 },
            { size: "Grand (40cm)", price: 349 }
          ]
        },
        {
          id: 202,
          name: "Coussin Berbère",
          emoji: "🪑",
          desc: "Coussin tissé à la main avec motifs berbères traditionnels.",
          colors: [
            { name: "Rouge & Noir", hex: "#8B1A1A" },
            { name: "Bleu & Blanc", hex: "#1B4E8A" },
            { name: "Naturel",      hex: "#C4B89A" }
          ],
          sizes: [
            { size: "40x40 cm", price: 149 },
            { size: "50x50 cm", price: 189 },
            { size: "60x60 cm", price: 229 }
          ]
        }
      ],
      sales: [
        { product: "Plateau Tadelakt", color: "Ocre terracotta", size: "Moyen (30cm)", price: 249, date: "2025-01-08" }
      ]
    },
    {
      id: 3,
      name: "Beauté Nadia",
      owner: "Nadia El Fassi",
      emoji: "💄",
      desc: "Cosmétiques naturels et produits de beauté 100% marocains — argan, rhassoul, savon beldi",
      whatsapp: "212677889900",
      password: "nadia123",
      email: "nadia@souk.ma",
      category: "beaute",
      active: true,
      payments: ["Virement CIH", "Espèces"],
      products: [
        {
          id: 301,
          name: "Huile d'Argan Pure",
          emoji: "🌰",
          desc: "Huile d'argan 100% pure, pressée à froid. Idéale pour les cheveux et la peau.",
          colors: [
            { name: "Naturelle dorée", hex: "#C9A84C" }
          ],
          sizes: [
            { size: "30 ml",  price: 89  },
            { size: "60 ml",  price: 149 },
            { size: "100 ml", price: 229 }
          ]
        },
        {
          id: 302,
          name: "Kit Hammam Complet",
          emoji: "🧼",
          desc: "Kit complet : savon beldi, rhassoul, kessa, eau de rose. Soin complet du corps.",
          colors: [
            { name: "Rose & Rose",     hex: "#E88B9A" },
            { name: "Vert & Menthe",   hex: "#3B6D11" }
          ],
          sizes: [
            { size: "Kit standard", price: 199 },
            { size: "Kit luxe",     price: 299 }
          ]
        }
      ],
      sales: []
    }
  ],

  globalSales: [
    { shopId: 1, shopName: "Boutique Yasmine", product: "Robe Florée",    color: "Rose poudré",       size: "M",          price: 299, date: "2025-01-10" },
    { shopId: 1, shopName: "Boutique Yasmine", product: "Caftan Élégant", color: "Or royal",          size: "L",          price: 649, date: "2025-01-09" },
    { shopId: 2, shopName: "Maison Khadija",   product: "Plateau Tadelakt",color: "Ocre terracotta",  size: "Moyen (30cm)",price: 249, date: "2025-01-08" },
    { shopId: 1, shopName: "Boutique Yasmine", product: "Robe Florée",    color: "Blanc ivoire",      size: "S",          price: 299, date: "2025-01-07" }
  ]
};

// ═══════════════════════════════════════════════════
// GESTION DU STOCKAGE (localStorage)
// ═══════════════════════════════════════════════════

function loadData() {
  try {
    const saved = localStorage.getItem('soukdigital_data');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch(e) {
    console.warn('Erreur chargement données :', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep clone
}

function saveData() {
  try {
    localStorage.setItem('soukdigital_data', JSON.stringify(state));
  } catch(e) {
    console.warn('Erreur sauvegarde données :', e);
  }
}

function resetData() {
  localStorage.removeItem('soukdigital_data');
  location.reload();
}

// ═══════════════════════════════════════════════════
// ÉTAT GLOBAL DE L'APPLICATION
// ═══════════════════════════════════════════════════

const loaded = loadData();

const state = {
  // Données persistantes
  shops:       loaded.shops,
  globalSales: loaded.globalSales,

  // État de session (non persisté)
  currentPage:    'login',
  currentUser:    null,
  currentRole:    null,
  currentShopId:  null,
  currentProduct: null,
  loginRole:      'admin',

  // Données temporaires formulaire produit
  selectedColors: [],
  sizePrices:     [],
};

// Crédentials admin
const ADMIN_CREDENTIALS = {
  email:    'admin@souk.ma',
  password: 'admin123'
};
