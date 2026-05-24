const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, async (req, res) => {
  try {
    const { base64, filename, folder } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: 'Image requise' });
    }

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${folder || 'general'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('souk-image')
      .upload(path, buffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('souk-image')
      .getPublicUrl(path);

    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message || 'Erreur upload' });
  }
});

module.exports = router;
