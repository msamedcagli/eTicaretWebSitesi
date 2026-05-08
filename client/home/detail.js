document.addEventListener("DOMContentLoaded", async () => {
    // 1. URL Parametrelerini Al
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const titleFromUrl = params.get("title");
    const priceFromUrl = params.get("price");
    const imgFromUrl = params.get("img");
    const catFromUrl = params.get("cat");

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
            favBtn.classList.toggle("active");
            if (productId) {
                try {
                    const response = await fetch('http://localhost:5000/api/favorites/toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: 1, productId: parseInt(productId) }),
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
});