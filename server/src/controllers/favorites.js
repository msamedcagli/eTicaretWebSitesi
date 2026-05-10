const { sql, connectDB } = require('../data/db');

const toggleFavorite = async (req, res) => {
    const { userId, productId } = req.body; 
    console.log(`Favori işlemi isteği: Kullanıcı ${userId}, Ürün ${productId}`);

    // Gelen verileri kontrol edelim, eksik varsa hiç yormayalım sistemi
    if (!userId || !productId) {
        console.warn(`Favori Hatası: Eksik veri (userId: ${userId}, productId: ${productId})`);
        return res.status(400).json({ message: 'Kullanıcı ID ve Ürün ID zorunludur.' });
    }

    try {
        const pool = await connectDB();

        // 1. Durum Kontrolü: Bu ürün bu kullanıcının favorilerinde zaten var mı?
        const checkResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM Favorites WHERE UserId = @userId AND ProductId = @productId');

        if (checkResult.recordset.length > 0) {
            // VARSA: Demek ki 2. kez tıklamış (Favoriden çıkarmak istiyor)
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('DELETE FROM Favorites WHERE UserId = @userId AND ProductId = @productId');

            console.log(`Ürün favorilerden ÇIKARILDI: Kullanıcı ${userId}, Ürün ${productId}`);
            return res.status(200).json({ message: 'Ürün favorilerden çıkarıldı.', isFavorite: false });
        } else {
            // YOKSA: Demek ki ilk kez tıklıyor (Favorilere eklemek istiyor)
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('INSERT INTO Favorites (UserId, ProductId) VALUES (@userId, @productId)');

            console.log(`Ürün favorilere EKLENDİ: Kullanıcı ${userId}, Ürün ${productId}`);
            return res.status(200).json({ message: 'Ürün favorilere eklendi.', isFavorite: true });
        }

    } catch (error) {
        console.error(`Favori İşlemi Hatası (User: ${userId}, Prod: ${productId}):`, error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { toggleFavorite };