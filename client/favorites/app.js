document.addEventListener('DOMContentLoaded', () => {
    const sessionCookie = getCookie('userSession');
    const storageData = localStorage.getItem('kullaniciBilgileri');
    const authLink = document.getElementById('header-profile-link');

    if (sessionCookie && storageData) {
        const data = JSON.parse(storageData);
        // Header'daki Hesabım linkini güncelle
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${data?.user?.name || 'Hesabım'}`;
        authLink.href = "../profile/index.html";
    } else {
        if (sessionCookie || storageData) {
            localStorage.removeItem('kullaniciBilgileri');
            document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        showToast("Favorilerinizi görmek için giriş yapmalısınız!", "error");
        setTimeout(() => {
            window.location.href = "../login/index.html";
        }, 2000);
        return;
    }

    // Gerçek favorileri yükleme fonksiyonu buraya gelecek (API bağlandığında)
    loadRealFavorites();
});

async function loadRealFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const countText = document.getElementById('favoritesCount');

    // 1. ADIM: LocalStorage'ı kontrol et
    const storageData = localStorage.getItem('kullaniciBilgileri');
    console.log("LocalStorage Verisi:", storageData); // Konsola bak, burada ne yazıyor?

    if (!storageData) {
        console.error("Kullanıcı verisi bulunamadı!");
        return;
    }

    const userData = JSON.parse(storageData);

    // 2. ADIM: ID'yi doğru yerden al (Buradaki hiyerarşiyi kontrol et)
    // Eğer verin { id: 1, name: '...' } şeklindeyse -> userData.id kullan
    // Eğer verin { user: { id: 1 } } şeklindeyse -> userData.user.id kullan
    const userId = userData.user ? userData.user.id : userData.id;

    console.log("Belirlenen UserId:", userId);

    if (!userId) {
        console.error("UserId hala bulunamadı, lütfen localStorage yapını kontrol et!");
        return;
    }

    // 3. ADIM: Fetch isteği
    try {
        const response = await fetch(`http://localhost:5000/api/favorites/${userId}`);
        const favorites = await response.json();

        if (!favorites || favorites.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-heart-circle-xmark" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px;"></i>
                    <p style="color: #64748b;">Henüz favori ürününüz bulunmuyor.</p>
                    <a href="../home/index.html" style="color: #38bdf8; text-decoration: none; display: inline-block; margin-top: 10px;">Alışverişe Başla</a>
                </div>`;
            countText.textContent = "0 Ürün";
            return;
        }

        countText.textContent = `${favorites.length} Ürün`;


        grid.innerHTML = favorites.map(product => {

            let path = product.ImageUrl.startsWith('/') ? product.ImageUrl.substring(1) : product.ImageUrl;
            const imgSrc = `../../client/${path}`;

            return `
        <div class="product-card">
            <div class="product-image">
                <img src="${imgSrc}" 
                     alt="${product.Name}" 
                     onerror="this.onerror=null; this.src='../../client/assets/img/no-image.jpg';">
            </div>
            <div class="category">${product.Category || 'BİLEŞEN'}</div>
            <h4>${product.Name}</h4>
            <div class="price">${product.Price.toLocaleString('tr-TR')} ₺</div>
            <div class="button-group">
                <button class="add-to-cart">
                    <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                </button>
                <button class="remove-btn" onclick="removeFavorite(${product.Id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
        }).join('');

    } catch (error) {
        console.error("Hata:", error);
        grid.innerHTML = `<p class="empty-state" style="color: #ef4444;">Favoriler yüklenirken sunucu hatası oluştu.</p>`;
    }
}

// Favoriden çıkarma işlemi için yardımcı fonksiyon
async function removeFavorite(productId) {
    const userData = JSON.parse(localStorage.getItem('kullaniciBilgileri'));
    const userId = userData.user.id;

    try {
        const response = await fetch(`http://localhost:5000/api/favorites/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId })
        });

        if (response.ok) {
            loadRealFavorites(); // Listeyi yenile
        }
    } catch (error) {
        console.error("Çıkarma hatası:", error);
    }
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

// Yardımcı Fonksiyonlar
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

// Toast Animasyonları için Style ekleme
const style = document.createElement('style');
style.id = 'toast-styles';
style.textContent = `
    @keyframes slideInDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
`;
document.head.appendChild(style);