const { sql, connectDB } = require('../data/db');

// Sepete ürün ekle
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
        return res.status(400).json({ error: 'Ürün ID ve miktar zorunludur.' });
    }

    try {
        const pool = await connectDB();

        // 1. Ürün var mı ve stokta yeterli mi kontrol et
        const productResult = await pool.request()
            .input('id', sql.Int, productId)
            .query('SELECT Stock, Name FROM Products WHERE Id = @id');

        const product = productResult.recordset[0];
        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı.' });
        }

        if (product.Stock < quantity) {
            return res.status(400).json({ error: `Yetersiz stok. Mevcut: ${product.Stock}` });
        }

        // 2. Sepette zaten var mı kontrol et
        const cartResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT Id, Quantity FROM CartItems WHERE UserId = @userId AND ProductId = @productId');

        if (cartResult.recordset.length > 0) {
            // Varsa miktarı güncelle
            const newQuantity = cartResult.recordset[0].Quantity + quantity;
            
            // Güncellenen miktar stoku aşıyor mu?
            if (product.Stock < newQuantity) {
                return res.status(400).json({ error: 'Sepetteki toplam miktar stok limitini aşıyor.' });
            }

            await pool.request()
                .input('id', sql.Int, cartResult.recordset[0].Id)
                .input('quantity', sql.Int, newQuantity)
                .query('UPDATE CartItems SET Quantity = @quantity WHERE Id = @id');
        } else {
            // Yoksa yeni ekle
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, quantity)
                .query('INSERT INTO CartItems (UserId, ProductId, Quantity) VALUES (@userId, @productId, @quantity)');
        }

        res.status(200).json({ message: 'Ürün sepete eklendi.' });
    } catch (err) {
        console.error('Sepete Ekleme Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Sepeti getir
exports.getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT c.Id, c.Quantity, p.Id as ProductId, p.Name, p.Price, p.ImageUrl, p.Stock
                FROM CartItems c
                JOIN Products p ON c.ProductId = p.Id
                WHERE c.UserId = @userId
            `);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Sepet Getirme Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Sepetten ürün çıkar
exports.removeFromCart = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const pool = await connectDB();
        
        // Sadece kullanıcıya ait olanı sil
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM CartItems WHERE Id = @id AND UserId = @userId');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Ürün sepette bulunamadı veya yetkiniz yok.' });
        }

        res.status(200).json({ message: 'Ürün sepetten çıkarıldı.' });
    } catch (err) {
        console.error('Sepetten Çıkarma Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Miktarı güncelle (Artır/Azalt)
exports.updateQuantity = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity <= 0) return this.removeFromCart(req, res);

    try {
        const pool = await connectDB();

        // Stok kontrolü yapalım
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query(`
                SELECT c.Quantity, p.Stock 
                FROM CartItems c 
                JOIN Products p ON c.ProductId = p.Id 
                WHERE c.Id = @id AND c.UserId = @userId
            `);

        const item = checkResult.recordset[0];
        if (!item) return res.status(404).json({ error: 'Ürün bulunamadı.' });

        if (item.Stock < quantity) {
            return res.status(400).json({ error: `Yetersiz stok. Maksimum: ${item.Stock}` });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE CartItems SET Quantity = @quantity WHERE Id = @id');

        res.status(200).json({ message: 'Miktar güncellendi.' });
    } catch (err) {
        console.error('Miktar Güncelleme Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};
