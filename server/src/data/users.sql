-- E-Ticaret Kullanıcı Tablosu
-- Bu tablo kullanıcı bilgilerini güvenli bir şekilde saklar.

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Otomatik artan ID
    email NVARCHAR(255) NOT NULL UNIQUE, -- E-posta (Benzersiz)
    phone NVARCHAR(20), -- Telefon numarası
    password NVARCHAR(255) NOT NULL, -- Şifrelenmiş parola
    kvkk BIT DEFAULT 0, -- 0: Onaylanmadı, 1: Onaylandı
    createdAt DATETIME DEFAULT GETDATE() -- Kayıt tarihi
);