const express = require('express');
const router = express.Router();
const { toggleFavorite } = require('../controllers/favorites');

// POST: /api/favorites/toggle
router.post('/toggle', toggleFavorite);

module.exports = router;