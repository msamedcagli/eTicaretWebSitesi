const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites');

// Favori EKLEME/ÇIKARMA işlemi (Frontend'den gelen POST isteği için)
router.post('/toggle', favoritesController.toggleFavorite);

// Favorileri LİSTELEME işlemi
router.get('/:userId', favoritesController.getFavorites);

module.exports = router;
