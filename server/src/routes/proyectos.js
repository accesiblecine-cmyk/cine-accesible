const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { videoId } = req.query;
    const where = { usuarioId: req.usuario.id };
    if (videoId) where.videoId = videoId;
    const proyectos = await prisma.proyecto.findMany({
      where,
      include: { video: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(proyectos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los proyectos' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: req.params.id },
      include: { video: true },
    });
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    if (proyecto.usuarioId !== req.usuario.id) return res.status(403).json({ mensaje: 'No autorizado' });
    res.json(proyecto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el proyecto' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { videoId, configuracion, historial, timestampVideo } = req.body;
    const proyecto = await prisma.proyecto.create({
      data: {
        usuarioId: req.usuario.id,
        videoId,
        configuracion,
        historial,
        timestampVideo,
        estado: 'borrador',
      },
    });
    res.status(201).json(proyecto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el proyecto' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: req.params.id } });
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    if (proyecto.usuarioId !== req.usuario.id) return res.status(403).json({ mensaje: 'No autorizado' });
    const { configuracion, historial, timestampVideo, estado, cierre } = req.body;
    const actualizado = await prisma.proyecto.update({
      where: { id: req.params.id },
      data: {
        configuracion: configuracion || proyecto.configuracion,
        historial: historial || proyecto.historial,
        timestampVideo: timestampVideo !== undefined ? timestampVideo : proyecto.timestampVideo,
        estado: estado || proyecto.estado,
        cierre: cierre || proyecto.cierre,
      },
    });
    res.json(actualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el proyecto' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: req.params.id } });
    if (!proyecto) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    if (proyecto.usuarioId !== req.usuario.id) return res.status(403).json({ mensaje: 'No autorizado' });
    await prisma.proyecto.delete({ where: { id: req.params.id } });
    res.json({ mensaje: 'Proyecto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el proyecto' });
  }
});

module.exports = router;
