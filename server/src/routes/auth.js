const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.js');

// Kayıt ve giriş istekleri
router.post('/register', authController.register);
router.post('/login', authController.login);

// YENİ: Profil bilgilerini getirme rotası
router.get('/profile', authController.getProfile); 

// Şifre değiştirme rotası
router.post('/change-password', authController.changePassword);

module.exports = router;