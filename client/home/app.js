// --- ALP'İN SLIDER KODLARI (Buna dokunmuyoruz) ---
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');

function changeSlide(direction) {
    if (slides.length === 0) return;
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex += direction;
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    slides[currentSlideIndex].classList.add('active');
}

function autoSlide() {
    changeSlide(1);
}
setInterval(autoSlide, 5000);

// --- MUSTAFA'NIN YENİ ÜRÜN YÖNLENDİRME KODLARI ---

document.addEventListener("DOMContentLoaded", function() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        card.style.cursor = "pointer";
        
        card.addEventListener("click", function(e) {
            // Eğer "Sepete Ekle" butonuna basıldıysa başka sayfaya gitme
            if (e.target.closest('.add-to-cart')) return; 

            // Kartın içindeki bilgileri alıyoruz
            const title = card.querySelector("h4").innerText;
            const price = card.querySelector(".price").innerText;
            const img = card.querySelector("img").src;
            const category = card.querySelector(".category").innerText;
            
            // Stok durumunu badge üzerinden kontrol et
            const isOutOfStock = card.querySelector('.badge') ? "yok" : "var";

            // BİLGİLERİ URL'YE KOYUP YENİ SAYFAYA GİDİYORUZ
            // Trendyol mantığı tam olarak budur:
            const url = `product-detail.html?title=${encodeURIComponent(title)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}&cat=${encodeURIComponent(category)}&stock=${isOutOfStock}`;
            
            window.location.href = url;
        });
    });
});

// --- SEMİH'İN KULLANICI KARŞILAMA (SESSION) KODLARI ---
document.addEventListener("DOMContentLoaded", function() {
    // 1. Tarayıcının kasasına (localStorage) bak
    const kullaniciVerisi = localStorage.getItem('kullaniciBilgileri');

    // 2. Eğer kasa doluysa (kullanıcı giriş yapmışsa)
    if (kullaniciVerisi) {
        // Şifrelenmiş JSON verisini normal Javascript objesine çevir
        const data = JSON.parse(kullaniciVerisi);
        const email = data.user.email;

        // E-postanın '@' işaretinden önceki kısmını al (Örn: vsemi@gmail.com -> vsemi)
        const isim = email.split('@')[0];

        // 3. Ekranda "Giriş Yap" yazan yeri bul. 
        // (Not: HTML'de "Giriş Yap" linkinin olduğu yere uygun bir seçici yazıyoruz.
        // Ben href'inde login olan a etiketini seçtim, sizin HTML yapınıza göre değişebilir)
        const girisYapButonu = document.querySelector('a[href*="login"]'); 
        
        if (girisYapButonu) {
            girisYapButonu.innerHTML = `Hoş geldin, <b>${isim}</b> (Çıkış)`;
            girisYapButonu.href = "#"; // Tekrar login sayfasına gitmesini engelle
            
            // 4. Çıkış yapma özelliği (İsteğe bağlı bonus)
            girisYapButonu.addEventListener("click", function(e) {
                e.preventDefault();
                if(confirm("Çıkış yapmak istediğinize emin misiniz?")) {
                    localStorage.removeItem("kullaniciBilgileri"); // Kasayı boşalt
                    window.location.reload(); // Sayfayı yenile (Giriş Yap butonu geri gelir)
                }
            });
        }
    }
});
// Favori ve Sayaç kodlarını buraya koymuyoruz çünkü onlar artık product-detail.html'e özel olacak.
// Ama istersen genel kalsın dersen aşağıya ekleyebilirsin.