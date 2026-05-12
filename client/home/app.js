// ==========================================
// ATLAS TECH - TAM ENTEGRE APP.JS
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. ÜRÜN YÜKLEME MANTIĞI ---
    const productGrid = document.querySelector(".product-grid");
    
    if (productGrid) {
        // Sayfa açılır açılmaz Loading Spinner'ı göster
        productGrid.innerHTML = `
            <div class="loading-wrapper">
                <div class="loader-circle"></div>
                <p class="loading-text">Ürünler Yükleniyor...</p>
            </div>`;

        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get("cat");
        const searchTerm = urlParams.get("search");

        let url = "http://localhost:5000/api/products";
        
        if (category && !searchTerm) {
            url = `http://localhost:5000/api/products/category/${encodeURIComponent(category)}`;
        }

       try {
            // --- YAPAY GECİKME EKLEME ---
            // '1500' değeri milisaniyedir (1.5 Saniye). Burayı dilediğin gibi değiştirebilirsin.
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            
            // API isteği ve bekleme süresini aynı anda başlatıyoruz
            const [response] = await Promise.all([
                fetch(url),
                delay(800) // Ürünler gelse bile en az 1.5 saniye bekle
            ]);

            let products = await response.json();

            if (response.ok) {
                productGrid.innerHTML = ""; // 1.5 saniye dolunca temizle
                
                // ... (Ürün listeleme kodlarının geri kalanı aynı)
                // --- Akıllı Filtreleme ---
                if (searchTerm) {
                    const titleEl = document.getElementById("category-title");
                    if (titleEl) titleEl.textContent = `Arama Sonuçları: "${searchTerm}"`;

                    products = products.filter(p => 
                        p.Name.toLowerCase().includes(searchTerm.toLowerCase().replace(/\s/g, '')) || 
                        p.Name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                } else if (category) {
                    const titleEl = document.getElementById("category-title");
                    if (titleEl) titleEl.textContent = category;
                }

                if (products.length === 0) {
                    productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; font-weight: bold;">Aradığınız ürün stoklarımızda bulunamadı.</div>';
                } else {
                    // Ürünleri Listele
                    products.forEach((product) => {
                        const productCard = document.createElement("div");
                        productCard.className = "product-card";
                        productCard.style.cursor = "pointer";

                        const badge = product.Stock <= 0 ? '<span class="badge">Tükendi</span>' : "";
                        const finalImgUrl = product.ImageUrl.startsWith("/assets") ? `..${product.ImageUrl}` : product.ImageUrl;

                        productCard.innerHTML = `
                            ${badge}
                            <img src="${finalImgUrl}" alt="${product.Name}">
                            <h4>${product.Name}</h4>
                            <p class="category">${product.Category}</p>
                            <p class="price">${new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.Price)}</p>
                            <button class="add-to-cart ${product.Stock <= 0 ? "disabled" : ""}" ${product.Stock <= 0 ? "disabled" : ""} data-id="${product.Id}">
                                ${product.Stock <= 0 ? "Stokta Yok" : '<i class="fa-solid fa-cart-plus"></i> Sepete Ekle'}
                            </button>
                        `;

                        productCard.addEventListener("click", (e) => {
                            if (e.target.closest(".add-to-cart")) return;
                            window.location.href = `product-detail.html?id=${product.Id}`;
                        });

                        productGrid.appendChild(productCard);
                    });
                }
            }
        } catch (error) {
            console.error("Hata:", error);
            productGrid.innerHTML = '<div class="error">Sunucu bağlantısı kurulamadı! Lütfen backendin açık olduğundan emin olun.</div>';
        }
    }

    // --- 2. OTURUM KONTROLÜ VE HEADER GÜNCELLEME ---
    const sessionCookie = getCookie("userSession");
    const storageData = localStorage.getItem("kullaniciBilgileri");
    const userActions = document.querySelector(".user-actions");

    if (sessionCookie && storageData) {
        if (userActions) {
            userActions.innerHTML = `
                <a href="../profile/index.html"><i class="fa-regular fa-user"></i> Profil</a>
                <a href="../favorites/index.html"><i class="fa-regular fa-heart"></i> Favoriler</a>
                <a href="../cart/index.html"><i class="fa-solid fa-cart-shopping"></i> Sepetim</a>
            `;
        }
    } else {
        if (sessionCookie || storageData) clearSession();
        if (userActions) {
            userActions.innerHTML = `<a href="../login/index.html" class="login-btn-header"><i class="fa-solid fa-right-to-bracket"></i> Giriş Yap</a>`;
        }
    }
});

// --- 3. AKILLI ARAMA FONKSİYONU (LOADINGLİ) ---
function enableSearch() {
    const sBtn = document.getElementById('searchBtn');
    const sInput = document.getElementById('searchInput');

    if (sBtn && sInput) {
        sBtn.onclick = (e) => {
            e.preventDefault();
            const query = sInput.value.trim();
            if (query) {
                // Butona basıldığında spinner koy ve tıklamayı kapat
                sBtn.innerHTML = '<i class="fa-solid fa-spinner"></i>';
                sBtn.style.pointerEvents = "none";
                window.location.href = `category.html?search=${encodeURIComponent(query)}`;
            }
        };

        sInput.onkeypress = (e) => {
            if (e.key === 'Enter') sBtn.onclick(e);
        };
    }
}
enableSearch();

// --- 4. SEPETE EKLEME GLOBAL EVENT ---
document.addEventListener("click", async function (e) {
    const cartBtn = e.target.closest(".add-to-cart");
    if (cartBtn) {
        const kullaniciVerisi = getCookie("userSession") || localStorage.getItem("kullaniciBilgileri");
        if (!kullaniciVerisi) {
            showToast("Sepete ürün eklemek için giriş yapmalısınız!", "error");
            return;
        }

        const user = JSON.parse(kullaniciVerisi);
        const productId = cartBtn.getAttribute("data-id");

        // Sepete eklerken butonda ufak bir animasyon
        const originalContent = cartBtn.innerHTML;
        cartBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
        cartBtn.disabled = true;

        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.user?.id || user?.id,
                },
                body: JSON.stringify({
                    productId: parseInt(productId),
                    quantity: 1,
                }),
            });

            if (response.ok) {
                showToast("Ürün başarıyla sepete eklendi!", "success");
            } else {
                showToast("Bir hata oluştu.", "error");
            }
        } catch (error) {
            showToast("Sunucuya bağlanılamadı.", "error");
        } finally {
            cartBtn.innerHTML = originalContent;
            cartBtn.disabled = false;
        }
    }
});

// --- 5. ÇEREZ (COOKIE) YARDIMCILARI ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function clearSession() {
    localStorage.removeItem("kullaniciBilgileri");
    document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// --- 6. TOAST MESAJ SİSTEMİ ---
function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; align-items: center; pointer-events: none;`;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `background: ${type === "error" ? "#ef4444" : "#10b981"}; color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInDown 0.4s ease-out; font-family: 'Outfit', sans-serif; font-weight: 600; pointer-events: auto; min-width: 250px; text-align: center;`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOutUp 0.4s ease-in forwards";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- 7. SLIDER ---
let currentSlideIndex = 0;
const slides = document.querySelectorAll(".slide");
if (slides.length > 0) {
    function changeSlide(direction) {
        slides[currentSlideIndex].classList.remove("active");
        currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add("active");
    }
    setInterval(() => changeSlide(1), 5000);
}