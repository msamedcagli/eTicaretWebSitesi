const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm sepet rotaları yetkilendirme gerektirir
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
