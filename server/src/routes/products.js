const express = require('express');
const router = express.Router();
const { getProductById } = require('../controllers/products');

// GET isteği: /api/products/1 (1 numaralı ürünü getirir)
router.get('/:id', getProductById);

module.exports = router;