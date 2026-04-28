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

-- =============================================
-- ATLAS TECH DEV ENVANTER GÜNCELLEMESİ (60 ÜRÜN)
-- =============================================

INSERT INTO Products (Name, Description, Price, Stock, Category, ImageUrl)
VALUES 
-- İŞLEMCİLER (10 Adet)
('Intel Core i7-14700K', '20 Çekirdekli performans canavarı.', 16500.00, 20, 'İşlemciler', '/assets/img/products/Islemciler/IntelCorei7-14700K.jpg'),
('AMD Ryzen 9 7950X3D', 'Oyun dünyasının en güçlü işlemcisi.', 24800.00, 8, 'İşlemciler', '/assets/img/products/Islemciler/AMDRyzen9-7950X3D.jpg'),
('Intel Core i5-13600K', 'Fiyat/performans odaklı 14 çekirdek.', 11200.00, 25, 'İşlemciler', '/assets/img/products/Islemciler/IntelCorei5-13600K.jpg'),
('AMD Ryzen 5 7600', 'Giriş seviyesi AM5 performans işlemcisi.', 7600.00, 30, 'İşlemciler', '/assets/img/products/Islemciler/AMDRyzen5-7600.jpg'),
('Intel Core i9-13900KS', '6.0GHz hızına ulaşan özel seri.', 28500.00, 3, 'İşlemciler', '/assets/img/products/Islemciler/IntelCorei9-13900KS.jpg'),
('AMD Ryzen 7 5800X3D', 'Efsanevi AM4 oyun işlemcisi.', 12400.00, 10, 'İşlemciler', '/assets/img/products/Islemciler/AMDRyzen7-5800X3D.jpg'),
('Intel Core i3-13100F', 'Bütçe dostu oyuncu işlemcisi.', 3800.00, 40, 'İşlemciler', '/assets/img/products/Islemciler/IntelCorei3-13100F.jpg'),
('AMD Ryzen 9 5900X', '12 Çekirdekli iş istasyonu performansı.', 15200.00, 12, 'İşlemciler', '/assets/img/products/Islemciler/AMDRyzen9-5900X.jpg'),
('Intel Core i7-12700K', 'Hala çok güçlü 12. nesil performansı.', 10800.00, 15, 'İşlemciler', '/assets/img/products/Islemciler/IntelCorei7-12700K.jpg'),
('AMD Ryzen 5 5600', 'Sistemlerin vazgeçilmez orta segmenti.', 4800.00, 50, 'İşlemciler', '/assets/img/products/Islemciler/AMDRyzen5-5600.jpg'),

-- EKRAN KARTLARI (10 Adet)
('ASUS ROG Strix RTX 4080', 'En sessiz ve en serin RTX 4080.', 54500.00, 6, 'Ekran Kartları', '/assets/img/products/EkranKartlari/ASUSROGStrixRTX4080.jpg'),
('MSI Suprim X RTX 4070 Ti', 'Şıklık ve gücün buluştuğu nokta.', 38900.00, 9, 'Ekran Kartları', '/assets/img/products/EkranKartlari/MSISuprimXRTX4070Ti.jpg'),
('Sapphire Nitro+ RX 7900 XTX', 'AMD dünyasının zirve kartı.', 42000.00, 5, 'Ekran Kartları', '/assets/img/products/EkranKartlari/SapphireNitroPlusRX7900XTX.jpg'),
('Gigabyte Windforce RTX 4060', 'Her eve lazım 1080p kartı.', 13500.00, 25, 'Ekran Kartları', '/assets/img/products/EkranKartlari/GigabyteWindforceRTX4060.jpg'),
('Zotac Gaming RTX 4070 Super', 'Kompakt ve güçlü performans.', 27800.00, 14, 'Ekran Kartları', '/assets/img/products/EkranKartlari/ZotacGamingRTX4070Super.jpg'),
('ASUS TUF RX 7800 XT', 'Dayanıklı bileşenler, yüksek FPS.', 21500.00, 11, 'Ekran Kartları', '/assets/img/products/EkranKartlari/ASUSTUFRX7800XT.jpg'),
('MSI Ventus RTX 3060 12GB', 'Hala popüler, hala yetenekli.', 11200.00, 30, 'Ekran Kartları', '/assets/img/products/EkranKartlari/MSIVentusRTX3060.jpg'),
('Palit Dual RTX 4060 Ti', 'İnce tasarım, serin çalışma.', 16800.00, 18, 'Ekran Kartları', '/assets/img/products/EkranKartlari/PalitDualRTX4060Ti.jpg'),
('Sapphire Pulse RX 6700 XT', 'Fiyat performans kralı.', 12500.00, 7, 'Ekran Kartları', '/assets/img/products/EkranKartlari/SapphirePulseRX6700XT.jpg'),
('ASUS Dual RTX 4070', 'Çift fanlı kompakt canavar.', 24500.00, 12, 'Ekran Kartları', '/assets/img/products/EkranKartlari/ASUSDualRTX4070.jpg'),

-- ANAKARTLAR (10 Adet)
('MSI Tomahawk Z790 WiFi', 'DDR5 destekli stabilite abidesi.', 12400.00, 15, 'Anakartlar', '/assets/img/products/Anakartlar/MSITomahawkZ790WiFi.jpg'),
('ASUS Prime B760-Plus', 'Modern sistemler için ideal giriş.', 6800.00, 22, 'Anakartlar', '/assets/img/products/Anakartlar/ASUSPrimeB760-Plus.jpg'),
('Gigabyte B650 Gaming X AX', 'AM5 soket için en dengeli kart.', 8900.00, 14, 'Anakartlar', '/assets/img/products/Anakartlar/GigabyteB650GamingXAX.jpg'),
('ASRock X670E Taichi', 'Sınırları zorlayan hız aşırtma.', 18500.00, 4, 'Anakartlar', '/assets/img/products/Anakartlar/ASRockX670ETaichi.jpg'),
('MSI B550-A Pro', 'AM4 sistemlerin vazgeçilmezi.', 4200.00, 40, 'Anakartlar', '/assets/img/products/Anakartlar/MSIB550-APro.jpg'),
('ASUS ROG Crosshair X670E', 'En üst segment AM4 anakart.', 22000.00, 3, 'Anakartlar', '/assets/img/products/Anakartlar/ASUSROGCrosshairX670E.jpg'),
('Gigabyte Z790 Aorus Elite', 'Performans ve estetik bir arada.', 11500.00, 10, 'Anakartlar', '/assets/img/products/Anakartlar/GigabyteZ790AorusElite.jpg'),
('MSI MPG B650 Carbon WiFi', 'Şık tasarım, güçlü soğutma.', 13800.00, 8, 'Anakartlar', '/assets/img/products/Anakartlar/MSIMPGB650CarbonWiFi.jpg'),
('ASUS TUF B550-Plus', 'Askeri sınıf dayanıklılık.', 5800.00, 15, 'Anakartlar', '/assets/img/products/Anakartlar/ASUSTUFB550-Plus.jpg'),
('Biostar Racing B760GTQ', 'Farklı tasarım arayanlara.', 5400.00, 6, 'Anakartlar', '/assets/img/products/Anakartlar/BiostarRacingB760GTQ.jpg'),

-- RAM (10 Adet)
('G.Skill Trident Z5 32GB', '6400MHz CL32 DDR5 set.', 6200.00, 20, 'RAM', '/assets/img/products/RAM/GSkillTridentZ532GB.jpg'),
('Kingston Fury Beast 16GB', '5200MHz DDR5 tek modül.', 2400.00, 45, 'RAM', '/assets/img/products/RAM/KingstonFuryBeast16GB.jpg'),
('Corsair Dominator Platinum 32GB', 'Prestijli ve hızlı DDR5.', 8500.00, 10, 'RAM', '/assets/img/products/RAM/CorsairDominatorPlatinum32GB.jpg'),
('XPG Spectrix D41 16GB', '3200MHz DDR4 RGB kiti.', 1800.00, 60, 'RAM', '/assets/img/products/RAM/XPGSpectrixD4116GB.jpg'),
('Team T-Force Delta 32GB', '6000MHz DDR5 RGB siyah.', 5400.00, 15, 'RAM', '/assets/img/products/RAM/TeamT-ForceDelta32GB.jpg'),
('Crucial Pro 32GB Kit', 'DDR5 5600MHz stabil çalışma.', 4800.00, 12, 'RAM', '/assets/img/products/RAM/CrucialPro32GBKit.jpg'),
('Lexar Thor 16GB', 'DDR4 3600MHz düşük gecikme.', 1950.00, 25, 'RAM', '/assets/img/products/RAM/LexarThor16GB.jpg'),
('Patriot Viper Venom 32GB', '7200MHz ultra hız DDR5.', 7800.00, 5, 'RAM', '/assets/img/products/RAM/PatriotViperVenom32GB.jpg'),
('Mushkin Redline 16GB', 'DDR4 oyuncu serisi.', 1700.00, 8, 'RAM', '/assets/img/products/RAM/MushkinRedline16GB.jpg'),
('GeIL Orion RGB 32GB', 'DDR4 performans kiti.', 3200.00, 11, 'RAM', '/assets/img/products/RAM/GeILOrionRGB32GB.jpg'),

-- SSD (10 Adet)
('Crucial T700 1TB', 'PCIe 5.0 ile 12.000MB/s hız.', 8900.00, 4, 'SSD', '/assets/img/products/SSD/CrucialT7001TB.jpg'),
('Samsung 980 Pro 1TB', 'Güvenilir yüksek hız Gen4.', 4200.00, 35, 'SSD', '/assets/img/products/SSD/Samsung980Pro1TB.jpg'),
('WD Black SN850X 2TB', 'Gamerlar için en iyi depolama.', 7800.00, 12, 'SSD', '/assets/img/products/SSD/WDBlackSN850X2TB.jpg'),
('Kingston NV2 1TB', 'Ekonomik NVMe çözümü.', 2100.00, 100, 'SSD', '/assets/img/products/SSD/KingstonNV21TB.jpg'),
('Seagate FireCuda 530 1TB', 'PS5 uyumlu soğutuculu SSD.', 5100.00, 8, 'SSD', '/assets/img/products/SSD/SeagateFireCuda5301TB.jpg'),
('Kioxia Exceria G2 1TB', 'Bütçe dostu performans.', 1900.00, 55, 'SSD', '/assets/img/products/SSD/KioxiaExceriaG21TB.jpg'),
('ADATA Legend 800 2TB', 'Geniş kapasite, uygun fiyat.', 4500.00, 20, 'SSD', '/assets/img/products/SSD/ADATALegend8002TB.jpg'),
('MSI Spatium M480 1TB', 'Yüksek dayanıklılık, Gen4 hız.', 4800.00, 10, 'SSD', '/assets/img/products/SSD/MSISpatiumM4801TB.jpg'),
('Sandisk Extreme M.2 1TB', 'Hızlı ve serin çalışma.', 3400.00, 15, 'SSD', '/assets/img/products/SSD/SandiskExtremeM.21TB.jpg'),
('TeamGroup MP44 2TB', 'PCIe 4.0 performans SSD.', 5900.00, 14, 'SSD', '/assets/img/products/SSD/TeamGroupMP442TB.jpg'),

-- HAZIR SİSTEMLER (10 Adet)
('Atlas Gamer v1', 'i5-13400F + RTX 4060 sistem.', 24500.00, 10, 'Hazır Sistem', '/assets/img/products/HazirSistemler/AtlasGamerV1.jpg'),
('Atlas Extreme v5', 'i9-14900K + RTX 4090 sıvı soğutmalı.', 145000.00, 2, 'Hazır Sistem', '/assets/img/products/HazirSistemler/AtlasExtremeV5.jpg'),
('Atlas Streamer PC', 'Ryzen 7 7700 + RTX 4070 yayıncı sistemi.', 42000.00, 5, 'Hazır Sistem', '/assets/img/products/HazirSistemler/AtlasStreamerPC.jpg'),
('Atlas Office Pro', 'i3-12100 + 16GB RAM iş bilgisayarı.', 12500.00, 20, 'Hazır Sistem', '/assets/img/products/HazirSistemler/AtlasOfficePro.jpg'),
('Atlas Master AM5', 'Ryzen 5 7600 + RTX 4060 Ti canavarı.', 31500.00, 8, 'Hazır Sistem', '/assets/img/products/HazirSistemler/AtlasMasterAM5.jpg');