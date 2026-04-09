const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../data/users.json');

function getUsers() {
    if (!fs.existsSync(usersFilePath)) return [];
    try {
        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

exports.register = async (req, res) => {
    const { email, phone, password, kvkk } = req.body;
    
    if(!email || !phone || !password || !kvkk) {
        return res.status(400).json({ error: 'Eksik bilgi girdiniz.' });
    }
    
    let users = getUsers();
    if(users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten mevcut.' });
    }
    
    // Güvenlik: Kullanıcının parolası Bcrypt (Hash) ile şifrelenir
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
        id: Date.now().toString(),
        email, 
        phone, 
        password: hashedPassword,
        kvkk,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4));
    
    res.status(201).json({ message: 'Hesap başarıyla oluşturuldu.' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password) {
        return res.status(400).json({ error: 'E-posta ve parola zorunludur.' });
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if(!user) {
        return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
    }
    
    // Güvenlik: Gelen şifresiz parola, veritabanındaki hash ile matematiksel olarak kıyaslanır
    const isMatch = await bcrypt.compare(password, user.password);
    
    if(!isMatch) {
        return res.status(401).json({ error: 'Girdiğiniz E-posta veya Parola hatalı.' });
    }
    
    res.status(200).json({ message: 'Başarıyla giriş yapıldı.', user: { email: user.email }});
};
