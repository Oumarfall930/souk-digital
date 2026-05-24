const jwt = require('jsonwebtoken');

// Vérifie que l'utilisateur est connecté
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Vérifie que l'utilisateur est admin
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé à l\'admin' });
    }
    next();
  });
}

// Vérifie que l'utilisateur est vendeuse ou admin
function requireSeller(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux vendeuses' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireSeller };
