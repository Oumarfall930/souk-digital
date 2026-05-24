const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireSeller, requireAdmin } = require('../middleware/auth');

// GET /sales?shop_id=xxx — ventes d'une boutique
router.get('/', requireSeller, async (req, res) => {
  try {
    const { shop_id } = req.query;
    let targetShopId = shop_id;

    // Si vendeuse, forcer sa propre boutique
    if (req.user.role === 'seller') {
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      targetShopId = shop?.id;
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*, shops(name, emoji), products(name, emoji)')
      .eq('shop_id', targetShopId)
      .order('sold_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /sales/all — toutes les ventes (admin)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*, shops(name, emoji), products(name, emoji)')
      .order('sold_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /sales/stats — statistiques globales (admin)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { data: allSales, error } = await supabase
      .from('sales')
      .select('price, shop_id, sold_at, shops(name, emoji)');

    if (error) throw error;

    const totalRevenue = allSales.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const totalSales = allSales.length;

    // Stats par boutique
    const byShop = {};
    allSales.forEach(s => {
      const key = s.shop_id;
      if (!byShop[key]) byShop[key] = { name: s.shops.name, emoji: s.shops.emoji, count: 0, revenue: 0 };
      byShop[key].count++;
      byShop[key].revenue += parseFloat(s.price);
    });

    res.json({ totalRevenue, totalSales, byShop: Object.values(byShop) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /sales — déclarer une vente (vendeuse)
router.post('/', requireSeller, async (req, res) => {
  try {
    const { product_id, product_name, color, size, price } = req.body;

    if (!product_name || !color || !size || !price) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Trouver la boutique de la vendeuse
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!shop) return res.status(404).json({ error: 'Boutique introuvable' });

    const { data, error } = await supabase
      .from('sales')
      .insert({
        shop_id: shop.id,
        product_id: product_id || null,
        product_name,
        color,
        size,
        price: parseFloat(price),
        sold_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /sales/:id — supprimer une vente (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('sales').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Vente supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
