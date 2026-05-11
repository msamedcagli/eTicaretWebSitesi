const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./data/db'); // DB bağlantısını en üste, ait olduğu yere aldık

// Rota dosyalarımız
const authRoutes = require('./routes/auth.js');
const favoriteRoutes = require('./routes/favorites.js');
const productRoutes = require('./routes/products.js');
const cartRoutes = require('./routes/cart.js');
const orderRoutes = require('./routes/orders.js');


const app = express();
const PORT = process.env.PORT || 3000;

// Veritabanını Başlat
connectDB();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Log Middleware (Hata ayıklama için)
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - [${req.method}] ${req.path}`);
    next();
});

// API Yönlendirmeleri
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Ana Karşılama Rotası
app.get('/', (req, res) => {
    res.send('API çalışıyor.');
});

// Sunucuyu Dinlemeye Başla
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} portunda çalışıyor.`);
});