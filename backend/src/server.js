require('dotenv').config();
const supabase = require('./config/supabase');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Routes ──
app.use('/auth',     require('./routes/auth'));
app.use('/shops',    require('./routes/shops'));
app.use('/products', require('./routes/products'));
app.use('/sales',    require('./routes/sales'));
app.use('/users',    require('./routes/users'));
app.use('/upload',   require('./routes/upload'));

// ── Health check ──
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Créer l'admin au démarrage s'il n'existe pas ──
async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@souk.ma';
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!existing) {
      const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await supabase.from('users').insert({
        name: 'Admin',
        email,
        password_hash,
        role: 'admin',
      });
      console.log(`✓ Admin créé : ${email}`);
    }
  } catch (err) {
    console.error('Erreur seed admin:', err.message);
  }
}

// ── Démarrage ──
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`\n✦ Souk Digital Backend`);
  console.log(`  Port    : ${PORT}`);
  console.log(`  Mode    : ${process.env.NODE_ENV || 'development'}`);
  await seedAdmin();
  console.log(`  Prêt !\n`);
});


