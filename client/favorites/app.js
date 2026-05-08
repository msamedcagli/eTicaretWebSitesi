document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('kullaniciBilgileri');

    if (!user) {
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
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toast Animasyonları için Style ekleme
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);