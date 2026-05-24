const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { requireAdmin } = require('../middleware/auth');

// GET /users — tous les utilisateurs (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, shops(id, name, emoji, active)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /users/:id/password — changer mot de passe (admin)
router.put('/:id/password', requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /users/:id — supprimer un utilisateur (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
