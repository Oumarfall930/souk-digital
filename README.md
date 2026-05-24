# ✦ Souk Digital — Guide d'installation complet

Marketplace WhatsApp : Backend Node.js + Frontend React + Base de données Supabase.

---

## 🚀 ÉTAPE 1 — Créer la base de données Supabase

1. Allez sur https://supabase.com → créez un compte gratuit
2. Cliquez "New Project" → donnez un nom, choisissez une région
3. Allez dans SQL Editor → collez tout le contenu de database/schema.sql → Run
4. Dans Settings → API, copiez :
   - Project URL  (ex: https://xxxxx.supabase.co)
   - service_role key (la clé longue, PAS la anon key)

---

## 🔧 ÉTAPE 2 — Backend

Prérequis : Node.js 18+ → https://nodejs.org

```bash
cd backend
cp .env.example .env
# Remplir .env avec vos clés Supabase et un JWT_SECRET
npm install
npm run dev
```

Vous verrez : "✦ Souk Digital Backend — Prêt !"

---

## 🎨 ÉTAPE 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrir : http://localhost:5173

---

## 🔑 Connexion par défaut

| Rôle  | Email         | Mot de passe |
|-------|---------------|--------------|
| Admin | admin@souk.ma | admin123     |

Les vendeuses se connectent avec l'email/mdp créés par l'admin.

---

## 📁 Structure

```
souk-digital/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js    ← Connexion DB
│   │   ├── middleware/auth.js    ← JWT auth
│   │   ├── routes/
│   │   │   ├── auth.js           ← Login
│   │   │   ├── shops.js          ← Boutiques CRUD
│   │   │   ├── products.js       ← Produits CRUD
│   │   │   ├── sales.js          ← Ventes CRUD
│   │   │   └── users.js          ← Utilisateurs
│   │   └── server.js             ← Point d'entrée
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/index.js          ← Appels API
│   │   ├── context/AuthContext   ← Auth React
│   │   ├── pages/
│   │   │   ├── Home              ← Vitrine publique
│   │   │   ├── ShopPage          ← Boutique + WhatsApp
│   │   │   ├── Login             ← Connexion
│   │   │   ├── AdminDashboard    ← Dashboard admin
│   │   │   └── SellerDashboard   ← Dashboard vendeuse
│   │   └── App.jsx               ← Routage
│   └── package.json
└── database/
    └── schema.sql                ← SQL Supabase
```

---

## 🌐 Déploiement production (gratuit)

- **Backend** → Railway.app : importez le dossier backend, ajoutez les variables .env
- **Frontend** → Vercel.com : importez le dossier frontend, ajoutez VITE_API_URL=votre_url_railway

---

## ❓ Problèmes fréquents

- "Cannot connect to Supabase" → vérifiez les clés dans .env
- "Token invalide" → videz localStorage (F12 → Application → Local Storage → Clear all)
- Port 3001 occupé → changez PORT=3002 dans .env
