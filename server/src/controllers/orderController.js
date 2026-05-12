const { sql, connectDB } = require('../data/db');
const crypto = require('crypto');

// Siparişi tamamla (Checkout)
exports.placeOrder = async (req, res) => {
    const userId = req.user.id;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        // 1. İşlemi başlat (Transaction)
        await transaction.begin();

        // 2. Sepet içeriğini al
        const cartItemsResult = await transaction.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT c.ProductId, c.Quantity, p.Price, p.Stock, p.Name
                FROM CartItems c
                JOIN Products p ON c.ProductId = p.Id
                WHERE c.UserId = @userId
            `);

        const cartItems = cartItemsResult.recordset;

        if (cartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Sepetiniz boş.' });
        }

        // 3. Stok Kontrolü (Race Condition Önlemi)
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.Stock < item.Quantity) {
                await transaction.rollback();
                return res.status(400).json({ 
                    error: `Üzgünüz, '${item.Name}' ürünü için yeterli stok kalmadı. Mevcut: ${item.Stock}` 
                });
            }
            totalAmount += item.Price * item.Quantity;
        }

        // 4. Sipariş Numarası Üret (Örn: AT-123456)
        const orderNumber = 'AT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

        // 5. Orders tablosuna ekle
        const orderInsert = await transaction.request()
            .input('orderNumber', sql.NVarChar, orderNumber)
            .input('userId', sql.Int, userId)
            .input('totalAmount', sql.Decimal(18, 2), totalAmount)
            .query('INSERT INTO Orders (OrderNumber, UserId, TotalAmount) OUTPUT INSERTED.Id VALUES (@orderNumber, @userId, @totalAmount)');

        const orderId = orderInsert.recordset[0].Id;

        // 6. Her bir ürün için OrderItems ekle ve Stoktan düş
        for (const item of cartItems) {
            const productId = item.id || item.ProductId || item.Id;
            // OrderItems ekle
            await transaction.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, item.Quantity)
                .input('unitPrice', sql.Decimal(18, 2), item.Price)
                .query('INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUES (@orderId, @productId, @quantity, @unitPrice)');

            // Stoktan düş
            await transaction.request()
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, item.Quantity)
                .query('UPDATE Products SET Stock = Stock - @quantity WHERE Id = @productId');
        }

        // 7. Kullanıcının sepetini temizle
        await transaction.request()
            .input('userId', sql.Int, userId)
            .query('DELETE FROM CartItems WHERE UserId = @userId');

        // 8. Her şey yolundaysa kaydet
        await transaction.commit();

        res.status(201).json({ 
            message: 'Siparişiniz başarıyla oluşturuldu.', 
            orderNumber: orderNumber 
        });

    } catch (err) {
        // Hata durumunda tüm işlemleri geri al
        if (transaction) await transaction.rollback();
        console.error('Sipariş Oluşturma Hatası (Transaction İptal Edildi):', err);
        res.status(500).json({ error: 'Sipariş oluşturulurken bir hata oluştu.' });
    }
};

// Kullanıcının siparişlerini getir
exports.getUserOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const pool = await connectDB();
        
        // Siparişleri ve içindeki ürünleri getir (JSON olarak gruplanmış veya düz liste)
        // Burada basitlik adına siparişleri getiriyoruz, detayları ayrı bir rotada veya joinle alabiliriz.
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    o.Id, o.OrderNumber, o.TotalAmount, o.Status, o.CreatedAt,
                    (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount,
                    (
                        SELECT p.Id as id, p.Name, p.ImageUrl, oi.Quantity, oi.UnitPrice
                        FROM OrderItems oi
                        JOIN Products p ON oi.ProductId = p.Id
                        WHERE oi.OrderId = o.Id
                        FOR JSON PATH
                    ) as Items
                FROM Orders o
                WHERE o.UserId = @userId
                ORDER BY o.CreatedAt DESC
            `);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Sipariş Geçmişi Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Sipariş detayını getir
exports.getOrderDetails = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query(`
                SELECT oi.Quantity, oi.UnitPrice, p.Name, p.ImageUrl
                FROM OrderItems oi
                JOIN Products p ON oi.ProductId = p.Id
                JOIN Orders o ON oi.OrderId = o.Id
                WHERE o.Id = @id AND o.UserId = @userId
            `);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Sipariş Detayı Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Siparişi İptal Et
exports.cancelOrder = async (req, res) => {
    const { id } = req.params; 
    const userId = req.user.id; 
    let pool;
    let transaction;

    // LOG: İptal isteği geldiğini bildir
    console.log(`\n[SİPARİŞ İPTAL] Kullanıcı (ID: ${userId}), Sipariş (ID: ${id}) için iptal isteği gönderdi.`);

    try {
        pool = await connectDB();
        
        // 1. Sipariş kontrolü
        const checkOrderResult = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query('SELECT Id, Status FROM Orders WHERE Id = @id AND UserId = @userId');

        const order = checkOrderResult.recordset[0];

        if (!order) {
            // LOG: Kötü niyetli veya hatalı istek
            console.warn(`[UYARI] Kullanıcı (ID: ${userId}), bulunmayan veya kendine ait olmayan bir siparişi (ID: ${id}) silmeye çalıştı!`);
            return res.status(404).json({ error: 'Sipariş bulunamadı veya bu işlem için yetkiniz yok.' });
        }

        // 2. Transaction Başlat
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 3. Ürünleri bul
        const orderItemsResult = await transaction.request()
            .input('orderId', sql.Int, id)
            .query('SELECT ProductId, Quantity FROM OrderItems WHERE OrderId = @orderId');

        const items = orderItemsResult.recordset;

        // 4. Her ürün için stokları geri yükle
        for (const item of items) {
            await transaction.request()
                .input('productId', sql.Int, item.ProductId)
                .input('quantity', sql.Int, item.Quantity)
                .query('UPDATE Products SET Stock = Stock + @quantity WHERE Id = @productId');
            
            // LOG: Hangi üründen kaç tane iade edildiğini yaz
            console.log(`[STOK İADE] Ürün (ID: ${item.ProductId}) için ${item.Quantity} adet stok başarıyla geri yüklendi.`);
        }

        // 5. Alt detayları (OrderItems) sil
        await transaction.request()
            .input('orderId', sql.Int, id)
            .query('DELETE FROM OrderItems WHERE OrderId = @orderId');

        // 6. Ana siparişi (Orders) sil
        await transaction.request()
            .input('orderId', sql.Int, id)
            .query('DELETE FROM Orders WHERE Id = @orderId');

        // 7. İşlemi kaydet
        await transaction.commit();

        // LOG: Başarı mesajı
        console.log(`[BAŞARILI] Sipariş (ID: ${id}) tamamen silindi ve iptal işlemi tamamlandı.\n`);
        
        res.status(200).json({ message: 'Sipariş başarıyla iptal edildi ve stoklar güncellendi.' });

    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback();
                // LOG: Sistemin kendini korumaya alması
                console.log(`[ROLLBACK] Hata tespit edildi! Sipariş (ID: ${id}) için yapılan tüm işlemler geri alındı.`);
            } catch (rollbackErr) {
                console.error('[HATA] Rollback sırasında kritik hata:', rollbackErr);
            }
        }
        console.error('[HATA] Sipariş İptal Hatası:', err);
        res.status(500).json({ error: 'Sipariş iptal edilirken bir hata oluştu.' });
    }
};