/**
 * Basit Yetkilendirme Middleware'i
 * Gerçek bir uygulamada burada JWT doğrulaması yapılır.
 * Bu demo için istemciden gelen 'x-user-id' başlığını kullanıyoruz.
 */
const authMiddleware = (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' });
    }

    const userIntId = parseInt(userId);
    
    if (isNaN(userIntId)) {
        return res.status(401).json({ error: 'Geçersiz kullanıcı ID\'si. Lütfen tekrar giriş yapın.' });
    }

    // req.user nesnesini ayarla
    req.user = { id: userIntId };
    next();
};

module.exports = authMiddleware;
