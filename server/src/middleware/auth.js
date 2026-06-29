const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ mensaje: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

module.exports = auth;
