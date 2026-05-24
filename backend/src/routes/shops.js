const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { requireAdmin, requireSeller } = require('../middleware/auth');

// GET /shops — toutes les boutiques actives (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        id, name, description, emoji, logo, category, whatsapp, payments, active,
        products(id, name, emoji, image, colors, sizes, active)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /shops/all — toutes les boutiques (admin)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *, 
        users(id, name, email),
        products(id, name, emoji, active),
        sales(id, price, sold_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /shops/:id — une boutique avec ses produits (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        id, name, description, emoji, logo, category, whatsapp, payments, active,
        products(id, name, description, emoji, image, colors, sizes, active)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Boutique introuvable' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /shops — créer une boutique (admin seulement)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, emoji, whatsapp, category, payments, seller_name, seller_email, seller_password } = req.body;

    if (!name || !whatsapp || !seller_email || !seller_password) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // Créer l'utilisateur vendeuse
    const password_hash = await bcrypt.hash(seller_password, 10);
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ name: seller_name, email: seller_email.toLowerCase(), password_hash, role: 'seller' })
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') return res.status(400).json({ error: 'Cet email existe déjà' });
      throw userError;
    }

    // Créer la boutique
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({ user_id: newUser.id, name, description, emoji: emoji || '🏪', logo: req.body.logo || '', whatsapp, category, payments: payments || [], active: true })
      .select()
      .single();

    if (shopError) throw shopError;

    res.status(201).json({ shop, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /shops/:id — modifier une boutique (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, emoji, logo, whatsapp, category, payments, active } = req.body;
    const { data, error } = await supabase
      .from('shops')
      .update({ name, description, emoji, logo, whatsapp, category, payments, active, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /shops/:id/payments — modifier les modes de paiement (admin)
router.put('/:id/payments', requireAdmin, async (req, res) => {
  try {
    const { payments } = req.body;
    const { data, error } = await supabase
      .from('shops')
      .update({ payments })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /shops/:id — supprimer une boutique (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('shops').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Boutique supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /shops/mine/info — infos de la boutique de la vendeuse connectée
router.get('/mine/info', requireSeller, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`*, products(*), sales(*)`)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
