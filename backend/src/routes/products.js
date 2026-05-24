const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireSeller, requireAdmin } = require('../middleware/auth');

// GET /products?shop_id=xxx — produits d'une boutique (public)
router.get('/', async (req, res) => {
  try {
    const { shop_id } = req.query;
    let query = supabase.from('products').select('*').eq('active', true);
    if (shop_id) query = query.eq('shop_id', shop_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /products — ajouter un produit (vendeuse)
router.post('/', requireSeller, async (req, res) => {
  try {
    const { name, description, emoji, image, colors, sizes } = req.body;
    if (!name || !colors?.length || !sizes?.length) {
      return res.status(400).json({ error: 'Nom, couleurs et tailles requis' });
    }

    // Trouver la boutique de la vendeuse
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (shopError || !shop) return res.status(404).json({ error: 'Boutique introuvable' });

    const { data, error } = await supabase
      .from('products')
      .insert({ shop_id: shop.id, name, description, emoji: emoji || '📦', image: image || '', colors, sizes, active: true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /products/:id — modifier un produit (vendeuse propriétaire)
router.put('/:id', requireSeller, async (req, res) => {
  try {
    const { name, description, emoji, image, colors, sizes, active } = req.body;

    // Vérifier que le produit appartient à la boutique de la vendeuse
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('shop_id, shops(user_id)')
      .eq('id', req.params.id)
      .single();

    if (findError || !product) return res.status(404).json({ error: 'Produit introuvable' });
    if (product.shops.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ name, description, emoji, image, colors, sizes, active, updated_at: new Date() })
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

// DELETE /products/:id — supprimer un produit (vendeuse ou admin)
router.delete('/:id', requireSeller, async (req, res) => {
  try {
    // Soft delete (désactiver) plutôt que supprimer pour garder l'historique ventes
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
