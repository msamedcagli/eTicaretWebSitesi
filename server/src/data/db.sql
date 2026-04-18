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

-- =====================================
-- FAVORILER TABLOSU
-- =====================================
CREATE TABLE Favorites (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(id)
);

-- =====================================
-- ÜRÜNLER (PRODUCTS) TABLOSU
-- =====================================
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    Category NVARCHAR(100),
    ImageUrl NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Ürün Eklendi
INSERT INTO Products (Name, Description, Price, Stock, Category, ImageUrl)
VALUES 
('Intel Core i9-14900K İşlemci', 'AtlasTech güvencesiyle en yüksek performans testlerinden geçmiş 24 çekirdekli işlemci.', 22500.00, 15, 'İşlemciler', 'https://via.placeholder.com/500?text=Intel+i9'),
('NVIDIA GeForce RTX 4090', 'Oyun ve render için rakipsiz ekran kartı. 24GB GDDR6X.', 75999.00, 5, 'Ekran Kartları', 'https://via.placeholder.com/500?text=RTX+4090'),
('AMD Ryzen 7 7800X3D', 'Oyun performansında zirve. 8 Çekirdek, 3D V-Cache.', 14200.00, 20, 'İşlemciler', 'https://via.placeholder.com/500?text=Ryzen+7'),
('ASUS ROG Strix Z790-E Anakart', 'DDR5 destekli, üst düzey oyuncu anakartı.', 18500.00, 10, 'Anakartlar', 'https://via.placeholder.com/500?text=ASUS+ROG');

--Favoriler ve Ürünler Tablosu Bağlantısı
ALTER TABLE Favorites
ADD FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE;