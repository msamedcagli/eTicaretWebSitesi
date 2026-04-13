const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tüm kimlik doğrulama işlemleri authRoutes'a yönlendirilir
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API çalışıyor.');
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} portunda çalışıyor.`);
});

const { connectDB } = require('./data/db'); // db.js dosyası src/data içinde olduğu için

// Uygulama ayağa kalkarken veritabanı bağlantısını başlat
connectDB();
