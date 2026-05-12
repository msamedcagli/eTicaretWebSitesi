const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm sipariş rotaları yetkilendirme gerektirir
router.use(authMiddleware);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);
router.post('/checkout', orderController.placeOrder);

// BİZİM EKLEDİĞİMİZ SİPARİŞ İPTAL ROTASI
router.delete('/:id', orderController.cancelOrder);

module.exports = router;