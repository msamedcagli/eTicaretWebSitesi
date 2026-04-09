# E-Ticaret Web Sitesi - Sunucu (Backend)

Bu dokümantasyon, projenin backend tarafını (server) kendi bilgisayarınıza sorunsuz bir şekilde kurup geliştirmeye başlayabilmeniz için hazırlanmıştır.

## 🚀 Kurulum

Projeyi ilk defa kuruyorsanız veya güncel kodları çektiyseniz, projenin bağımlılıklarını (Örn: `express`) yüklemek için öncelikle terminalinizde `server` klasörü (ana klasör) dizininde olduğunuzdan emin olun ve aşağıdaki komutu çalıştırın:

```bash
npm install
```

Bu komut, `package.json` dosyamızda belirtilmiş olan bütün paketleri indirecek ve `node_modules` klasörünü otomatik olarak oluşturacaktır.

## 🟢 Sistemi Çalıştırma

### 1. Backend (Sunucu) Başlatma
Sunucu kodları ve geçici JSON veri tabanımız `server` klasörünün içindedir. Terminaliniz proje ana dizinindeyse öncelikle arka plan sunucusunu başlatmanız gerekir:

```bash
cd server
node src/index.js
```
*Başarılı bir şekilde çalıştığında terminalde "Sunucu http://localhost:3000 portunda çalışıyor." bilgisini göreceksiniz. (Arayüzde çalışırken bu terminalin arkada açık kaldığından emin olun.)*

### 2. Frontend (Kullanıcı Arayüzü) Başlatma
Projenin kullanıcı arayüzü statik web (HTML, CSS, JS) teknolojisinde hazırlandığı için herhangi bir terminal komutuna (npm start vb.) ihtiyaç duymaz. Doğrudan dosyalara çift tıklayarak çalıştırılır:
- Ana klasör içerisindeki `client/login/` dizinine gidin.
- İçindeki `index.html` dosyasını Chrome v.b tarayıcıda açın.
*(Ekranda dolduracağınız bilgiler, doğrudan açık durumdaki backend API sunucunuza iletilip geçici JSON dosyasında yedeklenecektir.)*

## 📂 Klasör ve Mimari Yapısı

Projemizin düzenli olarak ölçeklenebilmesi ve takım içinde karışıklık çıkmaması için temel ve temiz bir klasör yapısı oluşturulmuştur. Node projemizin ana geliştirme klasörü **`src/`** dizinidir.

- **`node_modules/`** : `npm install` sonrasında oluşan kütüphaneler klasörüdür. (Git üzerinde tutulmaz)
- **`uploads/`** : Kullanıcıların ve sistemin dışarıdan yükleyeceği medya (ör: ürün görselleri) ve statik dosyaların tutulacağı klasördür.

### `src/` İçerisindeki Modüller

Tüm ana kodlarımız `src` altında aşağıda belirtilen dizinlerde görev the dağılımına uygun olarak tutulacaktır. (Git'in boş klasörleri de algılayabilmesi için içlerine `.gitkeep` dosyası dahil edilmiştir):

- **`config/`** : Konfigürasyon ayarlarımız. Başta veritabanı (Database) bağlantı ayarları olmak üzere ana yapılandırma dosyaları yer alır.
- **`controllers/`** : Endpoint'lere gelen istekleri yanıtlayacak olan süreç (Business and Response) dosya/fonksiyonlarımız yer alacaktır.
- **`middlewares/`** : İstek geldiğinde controller'dan önce devreye girip işlemleri denetleyen ara katmanlar (örneğin; kimlik/token doğrulama, hata yakalama, dosya yükleme okuma sınırları vb.) yer alacaktır.
- **`models/`** : Veritabanı tablolarımızı ve veri iskeletimizi temsil eden schema'larımız eklenecektir.
- **`routes/`** : Express API yönlendirmelerinin tanımlandığı kısım. Gelen API isteklerinin (Örn. `/api/users/login`) hangi controller'a atılacağı burada yazılır.
- **`services/`** : Controller'da oluşabilecek aşırı kod yığılmasını önlemek amacıyla veritabanı veya 3. parti API isteklerinin (Ağır iş ve lojiklerin) operasyonu bu bölüme devredilir.
- **`utils/`** : Çeşitli yardımcı ve ortak kullanıma sahip destek fonksiyonları (Şifre hash'leme aracı, mail atıcı, özel tarih formatlayıcı vb.) bulunacaktır.

*Bilgilendirme:* İlerleyen süreçlerde projemize yeni özellikler gelirse dokümantasyonu yeni bağımlılık ve eklentilere göre hep beraber güncelleyeceğiz. İyi çalışmalar takım! 🚀
