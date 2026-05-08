const { sql, connectDB } = require('../data/db');

// Tek bir ürünü ID'sine göre getiren fonksiyon
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Products WHERE Id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Ürün getirilirken hata:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kategorideki tüm ürünleri getiren fonksiyon
const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('category', sql.NVarChar, category)
            .query('SELECT * FROM Products WHERE Category = @category');
        
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Kategori ürünleri getirilirken hata:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Tüm ürünleri getiren fonksiyon (Ana sayfa için)
const getAllProducts = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Products');
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Tüm ürünler getirilirken hata:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { getProductById, getProductsByCategory, getAllProducts };