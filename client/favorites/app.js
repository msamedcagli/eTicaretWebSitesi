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

function loadRealFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const countText = document.getElementById('favoritesCount');
    
    // API bağlandığında burası fetch ile doldurulacak
    grid.innerHTML = `
        <div style="text-align:center; grid-column: 1/-1; padding: 50px;">
            <i class="fa-solid fa-heart-circle-xmark" style="font-size: 3rem; color: #334155; margin-bottom: 20px;"></i>
            <p style="color: #64748b;">Henüz favori ürününüz bulunmuyor.</p>
            <a href="../home/index.html" style="color: #38bdf8; text-decoration: none; display: inline-block; margin-top: 10px;">Alışverişe Başla</a>
        </div>
    `;
    countText.textContent = "0 Ürün";
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