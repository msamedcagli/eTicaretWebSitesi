document.addEventListener("DOMContentLoaded", async () => {
    // 1. URL Parametrelerini Al
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const titleFromUrl = params.get("title");
    const priceFromUrl = params.get("price");
    const imgFromUrl = params.get("img");
    const catFromUrl = params.get("cat");

    const sessionCookieHeader = getCookie('userSession');
    const storageDataHeader = localStorage.getItem('kullaniciBilgileri');
    const userActions = document.querySelector('.user-actions');
    
    if (userActions) {
        if (sessionCookieHeader && storageDataHeader) {
            userActions.innerHTML = `
                <a href="../profile/index.html"><i class="fa-regular fa-user"></i> Profil</a>
                <a href="../favorites/index.html"><i class="fa-regular fa-heart"></i> Favoriler</a>
                <a href="../cart/index.html"><i class="fa-solid fa-cart-shopping"></i> Sepetim</a>
            `;
        } else {
            if (sessionCookieHeader || storageDataHeader) {
                localStorage.removeItem('kullaniciBilgileri');
                document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
            userActions.innerHTML = `
                <a href="../login/index.html" class="login-btn-header"><i class="fa-solid fa-right-to-bracket"></i> Giriş Yap</a>
            `;
        }
    }

    // 2. İlk aşama: URL'den gelen verileri hemen göster (Kullanıcı bekletilmez)
    if (titleFromUrl) {
        document.getElementById("detailTitle").innerText = titleFromUrl;
        document.title = `AtlasTech - ${titleFromUrl}`;
    }
    if (priceFromUrl) document.getElementById("detailPrice").innerText = priceFromUrl;
    if (catFromUrl) document.getElementById("detailCategory").innerText = catFromUrl;
    if (titleFromUrl) document.getElementById("breadcrumbTitle").innerText = titleFromUrl;
    
    if (imgFromUrl) {
        const detailImg = document.getElementById("detailImg");
        // Görsel yolu yerel bir assets yoluysa başına ../ ekle
        detailImg.src = imgFromUrl.startsWith('/assets') ? `..${imgFromUrl}` : imgFromUrl;
    }

    // 3. İkinci aşama: Eğer ID varsa veritabanından güncel verileri çek
    if (productId) {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`);
            if (response.ok) {
                const product = await response.json();
                
                // Veritabanı verileriyle sayfayı güncelle (Daha güncel bilgidir)
                document.getElementById("detailTitle").textContent = product.Name;
                document.getElementById("detailPrice").textContent = new Intl.NumberFormat('tr-TR', { 
                    style: 'currency', currency: 'TRY' 
                }).format(product.Price);
                
                const finalImgUrl = product.ImageUrl.startsWith('/assets') 
                    ? `..${product.ImageUrl}` 
                    : product.ImageUrl;
                
                document.getElementById("detailImg").src = finalImgUrl;
                document.getElementById("detailImg").alt = product.Name;
                document.getElementById("detailCategory").textContent = product.Category;
                document.getElementById("breadcrumbTitle").textContent = product.Name;

                if (product.Description) {
                    const descEl = document.querySelector(".product-description-text");
                    if (descEl) descEl.textContent = product.Description;
                }

                const stockElement = document.getElementById("detailStock");
                if (stockElement) {
                    stockElement.innerHTML = product.Stock > 0
                        ? `<span style="color: green;"><i class="fa-solid fa-check"></i> Stokta Var (${product.Stock} adet)</span>`
                        : `<span style="color: red;"><i class="fa-solid fa-xmark"></i> Stokta Yok</span>`;
                }
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    } else {
        // ID yoksa dinamik açıklama üreticiyi çalıştır
        const title = titleFromUrl || "Ürün";
        let longDesc = "";
        if (title.includes("İşlemci") || title.includes("Intel") || title.includes("AMD")) {
            longDesc = `${title}, yeni nesil mimarisiyle yüksek performans sunar.`;
        } else if (title.includes("Ekran Kartı") || title.includes("RTX")) {
            longDesc = `${title}, oyun ve render için optimize edilmiş üstün grafik gücü sağlar.`;
        } else {
            longDesc = `${title}, AtlasTech kalite standartlarında üretilmiştir.`;
        }
        const descEl = document.querySelector(".product-description-text");
        if (descEl) descEl.innerText = longDesc;
    }

    // --- MİKTAR KONTROLÜ ---
    const input = document.getElementById('qty');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');

    if (plusBtn) plusBtn.onclick = () => { if (parseInt(input.value) < 99) input.value = parseInt(input.value) + 1; };
    if (minusBtn) minusBtn.onclick = () => { if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1; };

    // --- FAVORİ İŞLEMİ ---
    const favBtn = document.querySelector(".fav-big-btn");
    if (favBtn) {
        const favIcon = favBtn.querySelector("i");
        favBtn.addEventListener("click", async () => {
            const kullaniciVerisi = getCookie('userSession') || localStorage.getItem('kullaniciBilgileri');
            if (!kullaniciVerisi) {
                showToast("Favori eklemek için giriş yapmalısınız!", "error");
                return;
            }
            const user = JSON.parse(kullaniciVerisi);

            favBtn.classList.toggle("active");
            if (productId) {
                try {
                    const response = await fetch('http://localhost:5000/api/favorites/toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.user?.id, productId: parseInt(productId) }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        favIcon.classList.toggle("fa-solid", data.isFavorite);
                        favIcon.classList.toggle("fa-regular", !data.isFavorite);
                        favIcon.style.color = data.isFavorite ? "red" : "inherit";
                    }
                } catch (error) {
                    console.log("Favori işlemi offline çalıştı.");
                }
            }
        });
    }
    // --- SEPETE EKLEME ---
    const addToCartBigBtn = document.querySelector(".add-to-cart-big");
    if (addToCartBigBtn) {
        addToCartBigBtn.addEventListener("click", async () => {
            const kullaniciVerisi = getCookie('userSession') || localStorage.getItem('kullaniciBilgileri');
            if (!kullaniciVerisi) {
                showToast("Sepete ürün eklemek için giriş yapmalısınız!", "error");
                return;
            }

            const user = JSON.parse(kullaniciVerisi);
            const quantity = parseInt(document.getElementById('qty').value);

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
                        quantity: quantity
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
        });
    }
});

// Yardımcı Fonksiyonlar (app.js'den kopyalandı veya oradan erişilebilir olmalı)
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

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

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