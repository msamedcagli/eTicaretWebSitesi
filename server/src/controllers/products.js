const { sql, connectDB } = require('../data/db');

// Tek bir ürünü ID'sine göre getiren fonksiyon
const getProductById = async (req, res) => {
    const { id } = req.params; // URL'den gelen ID'yi alıyoruz (örneğin /api/products/1)

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Products WHERE Id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }

        // Ürünü başarıyla bulduk, React/HTML tarafına gönderiyoruz
        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Ürün getirilirken hata:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { getProductById };