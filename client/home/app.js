// --- GENEL ÜRÜN YÜKLEYİCİ VE YÖNLENDİRİCİ ---
document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    // 1. Kategori Belirleme (URL parametresinden veya sayfa başlığından)
    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('cat');
    
    if (category) {
        // Eğer URL'de kategori varsa başlığı güncelle
        const titleEl = document.getElementById('category-title');
        if (titleEl) titleEl.textContent = category;
        document.title = `${category} | AtlasTech`;
    } else {
        const pageTitle = document.title.toLowerCase();
        if (pageTitle.includes("işlemci")) category = "İşlemciler";
        else if (pageTitle.includes("ekran kartı")) category = "Ekran Kartları";
        else if (pageTitle.includes("anakart")) category = "Anakartlar";
        else if (pageTitle.includes("bellek") || pageTitle.includes("ram")) category = "RAM";
        else if (pageTitle.includes("depolama") || pageTitle.includes("ssd")) category = "SSD";
        else if (pageTitle.includes("hazır sistem")) category = "Hazır Sistem";
    }
    
    // 2. API URL'sini Belirle
    const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/") || (!category && !window.location.pathname.includes('category.html'));
    const url = (isHomePage) 
        ? "http://localhost:5000/api/products" 
        : `http://localhost:5000/api/products/category/${encodeURIComponent(category)}`;

    try {
        const response = await fetch(url);
        const products = await response.json();

        if (response.ok) {
            productGrid.innerHTML = ""; // Mevcut statik ürünleri temizle
            
            // Eğer ana sayfadaysak sadece ilk 8 ürünü göster (veya hepsi kalsın)
            const displayProducts = isHomePage ? products.slice(0, 8) : products;

            displayProducts.forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "product-card";
                productCard.style.cursor = "pointer";
                
                const badge = product.Stock <= 0 ? '<span class="badge">Tükendi</span>' : '';
                const finalImgUrl = product.ImageUrl.startsWith('/assets') ? `..${product.ImageUrl}` : product.ImageUrl;
                
                productCard.innerHTML = `
                    ${badge}
                    <img src="${finalImgUrl}" alt="${product.Name}">
                    <h4>${product.Name}</h4>
                    <p class="category">${product.Category}</p>
                    <p class="price">${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.Price)}</p>
                    <button class="add-to-cart ${product.Stock <= 0 ? 'disabled' : ''}" ${product.Stock <= 0 ? 'disabled' : ''} data-id="${product.Id}">
                        ${product.Stock <= 0 ? 'Stokta Yok' : '<i class="fa-solid fa-cart-plus"></i> Sepete Ekle'}
                    </button>
                `;
                
                // Detay sayfasına yönlendirme (ID üzerinden)
                productCard.addEventListener("click", (e) => {
                    if (e.target.closest('.add-to-cart')) return;
                    window.location.href = `product-detail.html?id=${product.Id}`;
                });
                
                productGrid.appendChild(productCard);
            });
        }
    } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
    }
});

// --- ÇEREZ (COOKIE) YARDIMCILARI ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function clearSession() {
    localStorage.removeItem('kullaniciBilgileri');
    document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

// --- PROFİL VE ERİŞİM KONTROLÜ ---
document.addEventListener("DOMContentLoaded", function() {
    // OTURUM KONTROLÜ VE HEADER GÜNCELLEME
    const sessionCookie = getCookie('userSession');
    const storageData = localStorage.getItem('kullaniciBilgileri');
    const userActions = document.querySelector('.user-actions');

    if (sessionCookie && storageData) {
        // OTURUM AÇIKSA
        const user = JSON.parse(storageData);
        if (userActions) {
            userActions.innerHTML = `
                <a href="../profile/index.html"><i class="fa-regular fa-user"></i> Profil</a>
                <a href="../favorites/index.html"><i class="fa-regular fa-heart"></i> Favoriler</a>
                <a href="../cart/index.html"><i class="fa-solid fa-cart-shopping"></i> Sepetim</a>
            `;
        }
    } else {
        // TUTARSIZLIK VARSA VEYA OTURUM KAPALIYSA TEMİZLE
        if (sessionCookie || storageData) clearSession();
        
        if (userActions) {
            userActions.innerHTML = `
                <a href="../login/index.html" class="login-btn-header"><i class="fa-solid fa-right-to-bracket"></i> Giriş Yap</a>
            `;
        }
    }

    // Sepete Ekleme Butonları İçin Global Kontrol
    document.addEventListener('click', async function(e) {
        const cartBtn = e.target.closest('.add-to-cart');
        if (cartBtn) {
            const kullaniciVerisi = getCookie('userSession') || localStorage.getItem('kullaniciBilgileri');
            if (!kullaniciVerisi) {
                e.preventDefault();
                e.stopPropagation();
                showToast("Sepete ürün eklemek için giriş yapmalısınız!", "error");
                return;
            }

            const user = JSON.parse(kullaniciVerisi);
            const productCard = cartBtn.closest('.product-card');
            
            // Eğer ürün ID'si yoksa (statik ürünler için), urun bilgisini card'dan alabiliriz 
            // ama dinamik yüklenenlerde ID'yi bir data attribute olarak saklamalıyız.
            // app.js'de ürün kartı oluşturulurken Id eklemeliyiz.
            const productId = cartBtn.getAttribute('data-id');

            if (!productId) {
                showToast("Ürün bilgisi alınamadı.", "error");
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user?.user?.id
                    },
                    body: JSON.stringify({
                        productId: parseInt(productId),
                        quantity: 1
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    showToast("Ürün başarıyla sepete eklendi!", "success");
                } else {
                    showToast(result.error || "Bir hata oluştu.", "error");
                }
            } catch (error) {
                console.error("Sepete ekleme hatası:", error);
                showToast("Sunucuya bağlanılamadı.", "error");
            }
        }
    });
});

// --- TOAST MESAJ SİSTEMİ ---
function showToast(message, type = "success") {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed; 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInDown 0.4s ease-out;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        pointer-events: auto;
        min-width: 250px;
        text-align: center;
    `;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOutUp 0.4s ease-in forwards";
        setTimeout(() => {
            toast.remove();
            if (toastContainer.childNodes.length === 0) {
                toastContainer.remove();
            }
        }, 400);
    }, 3000);
}

// Animasyonlar
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// --- SLIDER (Sadece Ana Sayfada Varsa Çalışır) ---
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
if (slides.length > 0) {
    function changeSlide(direction) {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }
    setInterval(() => changeSlide(1), 5000);
}