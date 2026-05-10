const express = require('express');
const router = express.Router();
const { getProductById, getProductsByCategory, getAllProducts } = require('../controllers/products');

// GET isteği: /api/products (Tüm ürünleri getirir)
router.get('/', getAllProducts);

// GET isteği: /api/products/category/İşlemciler (Kategoriye göre getirir)
router.get('/category/:category', getProductsByCategory);

// GET isteği: /api/products/1 (1 numaralı ürünü getirir)
router.get('/:id', getProductById);

module.exports = router;