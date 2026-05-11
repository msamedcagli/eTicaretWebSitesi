const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sql, connectDB } = require('../data/db');

exports.register = async (req, res) => {
    const { email, phone, password, kvkk } = req.body;
    console.log(`Kayıt işlemi başlatıldı: ${email}`);

    if (!email || !phone || !password || !kvkk) {
        console.warn(`Kayıt Hatası: Eksik bilgi girildi (${email})`);
        return res.status(400).json({ error: 'Eksik bilgi girdiniz.' });
    }

    try {
        const pool = await connectDB();
        
        // 1. Kullanıcı zaten var mı kontrol et?
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkUser.recordset.length > 0) {
            console.warn(`Kayıt Hatası: E-posta zaten mevcut (${email})`);
            return res.status(400).json({ error: 'Bu e-posta adresi zaten mevcut.' });
        }

        // 2. Güvenlik: Parolayı hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Veritabanına kaydet
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('password', sql.NVarChar, hashedPassword)
            .input('kvkk', sql.Bit, kvkk ? 1 : 0)
            .query('INSERT INTO Users (email, phone, password, kvkk) VALUES (@email, @phone, @password, @kvkk)');

        console.log(`Yeni kullanıcı kaydedildi: ${email}`);
        res.status(201).json({ message: 'Hesap başarıyla oluşturuldu.' });
    } catch (err) {
        console.error('Kayıt Hatası (Detaylı):', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Giriş denemesi: ${email}`);

    if (!email || !password) {
        console.warn(`Giriş Hatası: Eksik bilgi (${email})`);
        return res.status(400).json({ error: 'E-posta ve parola zorunludur.' });
    }

    try {
        const pool = await connectDB();
        
        // 1. Kullanıcıyı bul
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            console.warn(`Giriş Hatası: Kullanıcı bulunamadı (${email})`);
            return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
        }

        // 2. Parola kontrolü
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn(`Giriş Hatası: Yanlış parola (${email})`);
            return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
        }

        console.log(`Giriş başarılı: ${email}`);
        res.status(200).json({ 
            message: 'Başarıyla giriş yapıldı.', 
            user: { 
                id: user.id,
                email: user.email 
            } 
        });
    } catch (err) {
        console.error('Giriş Hatası (Detaylı):', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.getProfile = async (req, res) => {
    const userEmail = req.query.email;
    console.log(`Profil çekme isteği: ${userEmail}`);

    try {
        const pool = await connectDB();

        if (!userEmail) {
            console.warn(`Profil Hatası: E-posta eksik`);
            return res.status(400).json({ message: "E-posta adresi gerekli" });
        }

        const result = await pool.request()
            .input('email', sql.NVarChar, userEmail)
            .query('SELECT email as Email, phone as Phone, createdAt as CreatedAt FROM Users WHERE email = @email');
        
        if (result.recordset.length > 0) {
            console.log(`Profil başarıyla çekildi: ${userEmail}`);
            res.json(result.recordset[0]);
        } else {
            console.warn(`Profil Hatası: Kullanıcı bulunamadı (${userEmail})`);
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
    } catch (err) {
        console.error("Profil Çekme Hatası (Detaylı):", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

exports.changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    
    // Güvenli loglama: Şifreleri SHA-256 ile hash'leyerek karşılaştır (Loglara basma)
    const hashCurrent = crypto.createHash('sha256').update(currentPassword || '').digest('hex');
    const hashNew = crypto.createHash('sha256').update(newPassword || '').digest('hex');
    
    console.log(`Şifre değiştirme işlemi deneniyor: ${email}`);

    // Aynı şifre kontrolü (Hash karşılaştırması ile)
    if (hashCurrent === hashNew) {
        console.warn(`Hata: ${email} mevcut şifresini tekrar girmeye çalıştı.`);
        return res.status(400).json({ message: "Yeni şifre mevcut şifre ile aynı olamaz!" });
    }

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Tüm alanlar zorunludur" });
    }

    try {
        const pool = await connectDB();
        
        // 1. Kullanıcıyı bul
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        // 2. Mevcut şifre kontrolü
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.warn(`Hata: ${email} için yanlış mevcut şifre girildi.`);
            return res.status(401).json({ message: "Mevcut şifreniz hatalı" });
        }

        // 3. Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Şifreyi güncelle
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedNewPassword)
            .query('UPDATE Users SET password = @password WHERE email = @email');

        console.log(`${email} şifre değiştirme başarılı.`);
        res.json({ message: "Şifreniz başarıyla değiştirildi" });

    } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};

exports.logout = async (req, res) => {
    // Frontend'den gelen email veya header'daki ID üzerinden log bas
    const userId = req.headers['x-user-id'];
    console.log(`Oturum kapatıldı: Kullanıcı ID ${userId || 'Bilinmiyor'}`);
    res.status(200).json({ message: 'Oturum kapatıldı.' });
};