document.addEventListener('DOMContentLoaded', () => {
    // Arayüzü test etmek için mock (örnek) verileri yüklüyoruz.
    loadMockFavorites();
});

// Backend bağlanana kadar arayüzü besleyecek örnek veriler
const mockFavorites = [
    {
        id: 1,
        ad: "Intel Core i9-13900K İşlemci",
        kategori: "İşlemciler",
        fiyat: "18.500",
        resim_url: "https://m.media-amazon.com/images/I/61yKqO-XlCL._AC_SL1500_.jpg"
    },
    {
        id: 2,
        ad: "ASUS ROG Strix GeForce RTX 4090",
        kategori: "Ekran Kartları",
        fiyat: "75.000",
        resim_url: "https://m.media-amazon.com/images/I/81B-74E2f7L._AC_SL1500_.jpg"
    },
    {
        id: 3,
        ad: "Samsung 990 PRO 2TB NVMe SSD",
        kategori: "Depolama",
        fiyat: "6.200",
        resim_url: "https://m.media-amazon.com/images/I/71h3A2I8G8L._AC_SL1500_.jpg"
    }
];

function loadMockFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const countText = document.getElementById('favoritesCount');

    grid.innerHTML = '';
    countText.textContent = `${mockFavorites.length} Ürün`;

    mockFavorites.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // KARTA TIKLAYINCA: Ürün detay sayfasına ID ile yönlendirme yapar
        card.onclick = () => {
            window.location.href = `../home/product-detail.html?id=${product.id}`;
        };

        card.innerHTML = `
            <img src="${product.resim_url}" alt="${product.ad}">
            <p class="category">${product.kategori}</p>
            <h4>${product.ad}</h4>
            <p class="price">${product.fiyat} TL</p>
            
            <div class="button-group">
                <button class="add-to-cart" onclick="event.stopPropagation(); alert('Sepete eklendi!')">
                    <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                </button>
                <button class="remove-btn" onclick="event.stopPropagation(); alert('Silme işlemi Samet API leri bağladığında çalışacaktır.')" title="Favorilerden Kaldır">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}