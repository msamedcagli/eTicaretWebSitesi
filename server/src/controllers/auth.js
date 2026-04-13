const bcrypt = require('bcryptjs');
const { sql } = require('../data/db'); // db.js'den sql objesini alıyoruz

exports.register = async (req, res) => {
    const { email, phone, password, kvkk } = req.body;

    if (!email || !phone || !password || !kvkk) {
        return res.status(400).json({ error: 'Eksik bilgi girdiniz.' });
    }

    try {
        // 1. Kullanıcı zaten var mı kontrol et?
        const checkUser = await new sql.Request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten mevcut.' });
        }

        // 2. Güvenlik: Parolayı hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Veritabanına kaydet (id otomatik artıyor, eklemeye gerek yok)
        await new sql.Request()
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('password', sql.NVarChar, hashedPassword)
            .input('kvkk', sql.Bit, kvkk ? 1 : 0)
            .query('INSERT INTO Users (email, phone, password, kvkk) VALUES (@email, @phone, @password, @kvkk)');

        res.status(201).json({ message: 'Hesap başarıyla oluşturuldu.' });
    } catch (err) {
        console.error('Kayıt Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-posta ve parola zorunludur.' });
    }

    try {
        // 1. Kullanıcıyı bul
        const result = await new sql.Request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0]; // İlk eşleşen kullanıcıyı al

        if (!user) {
            return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
        }

        // 2. Parola kontrolü
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
        }

        res.status(200).json({ message: 'Başarıyla giriş yapıldı.', user: { email: user.email } });
    } catch (err) {
        console.error('Giriş Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};