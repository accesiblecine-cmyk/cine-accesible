const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const videosRoutes = require('./routes/videos');
const proyectosRoutes = require('./routes/proyectos');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ mensaje: 'Cine Accesible API funcionando', version: '0.3.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/proyectos', proyectosRoutes);

app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto ' + PORT);
});
