// Semih API'yi bitirene kadar kullanacağımız geçici mock (sahte) veri
let mockFavorites = [
    { id: 1, ad: "ASUS ROG Strix RTX 4090 24GB", kategori: "Ekran Kartı", fiyat: "84.999,00 TL", resim: "https://images.unsplash.com/photo-1590740636267-2856554b5df7?w=300" },
    { id: 4, ad: "AMD Ryzen 5 7600X 4.7GHz", kategori: "İşlemci", fiyat: "7.499,00 TL", resim: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
});

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const countText = document.getElementById('favoritesCount');
    
    grid.innerHTML = ''; // Önce içini temizle
    countText.textContent = `${mockFavorites.length} Ürün`;

    // Eğer favori yoksa boş durumu göster
    if (mockFavorites.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-heart"></i>
                <h3>Favori Listeniz Boş</h3>
                <p>Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.</p>
            </div>
        `;
        return;
    }

    // Favorileri ekrana bas
    mockFavorites.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.resim}" alt="${product.ad}">
            <p class="category">${product.kategori}</p>
            <h4>${product.ad}</h4>
            <p class="price">${product.fiyat}</p>
            
            <div class="button-group">
                <button class="add-to-cart"><i class="fa-solid fa-cart-plus"></i> Sepete Ekle</button>
                <button class="remove-btn" onclick="removeFavorite(${product.id})" title="Favorilerden Kaldır">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Favoriden çıkarma fonksiyonu
function removeFavorite(productId) {
    // Semih API'yi yazdığında buraya bir fetch() DELETE isteği gelecek.
    // Şimdilik sadece geçici listemizden siliyoruz:
    mockFavorites = mockFavorites.filter(p => p.id !== productId);
    
    // Ekranı yeniden çiz
    renderFavorites();
    
    // Küçük bir bildirim (Opsiyonel)
    alert("Ürün favorilerden kaldırıldı.");
}