const { sql, connectDB } = require('../data/db');

// Tek bir ürünü ID'sine göre getiren fonksiyon
const getProductById = async (req, res) => {
    const { id } = req.params;
    console.log(`Ürün detayı isteği: ID ${id}`);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Products WHERE Id = @id');

        if (result.recordset.length === 0) {
            console.warn(`Ürün bulunamadı: ID ${id}`);
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        console.log(`Ürün başarıyla getirildi: ${result.recordset[0].Name}`);
        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error(`Ürün getirme hatası (ID ${id}):`, error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kategorideki tüm ürünleri getiren fonksiyon
const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    console.log(`Kategori ürünleri isteği: ${category}`);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('category', sql.NVarChar, category)
            .query('SELECT * FROM Products WHERE Category = @category');
        
        console.log(`Kategoride ${result.recordset.length} ürün listelendi: ${category}`);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error(`Kategori ürün getirme hatası (${category}):`, error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Tüm ürünleri getiren fonksiyon (Ana sayfa için)
const getAllProducts = async (req, res) => {
    console.log("Tüm ürünler listeleniyor...");
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Products');
        console.log(`Toplam ${result.recordset.length} ürün başarıyla getirildi.`);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Tüm ürünleri getirme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { getProductById, getProductsByCategory, getAllProducts };