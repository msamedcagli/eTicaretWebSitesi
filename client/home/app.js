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

// --- MUSTAFA'NIN PROFİL ENTEGRASYONU ---
document.addEventListener("DOMContentLoaded", function() {
    const kullaniciVerisi = localStorage.getItem('kullaniciBilgileri');

    if (kullaniciVerisi) {
        // "Giriş Yap" yazan o linki buluyoruz
        const authLink = document.querySelector('a[href*="login"]'); 
        
        if (authLink) {
            // 1. Yazıyı sadece "Profil" yap ve simgesini koy
            authLink.innerHTML = `<i class="fa-regular fa-user"></i> Profil`;
            
            // 2. Tıklayınca senin hazırladığın profil sayfasına gitsin
            authLink.href = "../profile/index.html";

            // 3. Arkadaşının yazdığı eski tıklama olaylarını (click event) pasif yapalım
            // Bu satır sayesinde üzerine tıklandığında eski "Çıkış Yap" kodları çalışmaz.
            authLink.addEventListener("click", function(e) {
                e.stopPropagation(); 
            }, true);
        }
    }
});
// Favori ve Sayaç kodlarını buraya koymuyoruz çünkü onlar artık product-detail.html'e özel olacak.
// Ama istersen genel kalsın dersen aşağıya ekleyebilirsin.