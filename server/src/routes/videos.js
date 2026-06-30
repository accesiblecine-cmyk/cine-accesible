const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los videos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
    });
    if (!video) {
      return res.status(404).json({ mensaje: 'Video no encontrado' });
    }
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el video' });
  }
});

module.exports = router;
