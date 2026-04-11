// --- ALP'İN SLIDER KODLARI ---
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

// --- MUSTAFA'NIN MODAL (DETAY PENCERESİ) KODLARI ---

// Sayfa tamamen yüklendikten sonra çalışması için kontrol
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("productModal");
    const closeBtn = document.querySelector(".close-btn");
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        // Kartın tıklanabilir olduğunu göster
        card.style.cursor = "pointer";
        
        card.addEventListener("click", function(e) {
    if (e.target.closest('.add-to-cart')) return; 

    // Ürünün stokta olup olmadığını kontrol et
    // Kartın içinde "badge" class'ı var mı veya buton "disabled" mı diye bakıyoruz
    const isOutOfStock = card.querySelector('.badge') && card.querySelector('.badge').innerText === 'Tükendi';
    
    const title = card.querySelector("h4").innerText;
    const price = card.querySelector(".price").innerText;
    const img = card.querySelector("img").src;
    const category = card.querySelector(".category").innerText;

    // Modal elemanlarını doldur
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalPrice").innerText = price;
    document.getElementById("modalImg").src = img;
    document.getElementById("modalCategory").innerText = category;
    document.getElementById("modalDesc").innerText = title + " için AtlasTech uzmanları tarafından hazırlanan teknik detaylar...";

    // STOK DURUMUNU GÜNCELLE
    const stokElement = document.querySelector(".stok-durumu");
    const modalAddToCartBtn = document.querySelector(".add-to-cart-btn");

    if (isOutOfStock) {
        stokElement.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i> Stokta Yok';
        stokElement.style.color = "#ef4444";
        modalAddToCartBtn.innerText = "Stokta Yok";
        modalAddToCartBtn.disabled = true;
        modalAddToCartBtn.style.backgroundColor = "#94a3b8"; // Gri yapalım
    } else {
        stokElement.innerHTML = '<i class="fa-solid fa-circle-check"></i> Stokta Var';
        stokElement.style.color = "#16a34a";
        modalAddToCartBtn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Sepete Ekle';
        modalAddToCartBtn.disabled = false;
        modalAddToCartBtn.style.backgroundColor = "#2563eb"; // Mavi yapalım
    }

    modal.style.display = "block";
});
    });

    // X butonuyla kapat
    if(closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }

    // Dışarı tıklayınca kapat
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }
});
// Sayacı çalıştırmak için fonksiyon
document.addEventListener("click", function(e) {
    // Eğer artı butonuna basıldıysa
    if (e.target.innerText === '+') {
        const input = e.target.parentElement.querySelector('input');
        input.value = parseInt(input.value) + 1;
    }
    
    // Eğer eksi butonuna basıldıysa
    if (e.target.innerText === '-') {
        const input = e.target.parentElement.querySelector('input');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }
});
document.addEventListener("click", function(e) {
    // Favori butonuna veya içindeki ikona basıldıysa
    const favBtn = e.target.closest('.wishlist-btn');
    
    if (favBtn) {
        const heartIcon = favBtn.querySelector('i');
        
        // Klasları değiştirerek kalbi doldur/boşalt
        if (heartIcon.classList.contains('fa-regular')) {
            heartIcon.classList.replace('fa-regular', 'fa-solid');
            favBtn.classList.add('active');
            console.log("Favorilere eklendi!");
        } else {
            heartIcon.classList.replace('fa-solid', 'fa-regular');
            favBtn.classList.remove('active');
            console.log("Favorilerden çıkarıldı!");
        }
    }
});