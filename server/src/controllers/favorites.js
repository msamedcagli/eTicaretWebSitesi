const { sql, connectDB } = require('../data/db');

const toggleFavorite = async (req, res) => {
    const { userId, productId } = req.body;
    console.log(`--- Favori İşlemi: User ${userId}, Prod ${productId} ---`);

    if (!userId || !productId) {
        return res.status(400).json({ message: 'Eksik veri!' });
    }

    try {
        const pool = await connectDB(); // Bağlantıyı bekle ve al

        // 1. Durum Kontrolü
        const checkResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM Favorites WHERE UserId = @userId AND ProductId = @productId');

        if (checkResult.recordset.length > 0) {
            // VARSA: SİL
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('DELETE FROM Favorites WHERE UserId = @userId AND ProductId = @productId');

            console.log("SİSTEM: Favoriden çıkarıldı.");
            return res.status(200).json({ message: 'Çıkarıldı', isFavorite: false });
        } else {
            // YOKSA: EKLE
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .query('INSERT INTO Favorites (UserId, ProductId) VALUES (@userId, @productId)');

            console.log("SİSTEM: Favoriye eklendi.");
            return res.status(200).json({ message: 'Eklendi', isFavorite: true });
        }

    } catch (error) {
        console.error("Favori SQL Hatası:", error.message);
        res.status(500).json({ message: 'Hata oluştu.' });
    }
};

const getFavorites = async (req, res) => {
    const { userId } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('uID', sql.Int, userId)
            .query(`
                SELECT p.Id, p.Name, p.Price, p.ImageUrl, p.Category 
                FROM Products p
                JOIN Favorites f ON p.Id = f.ProductId
                WHERE f.UserId = @uID`);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Listeleme Hatası:", error.message);
        res.status(500).json({ message: 'Hata.' });
    }
};

module.exports = { toggleFavorite, getFavorites };