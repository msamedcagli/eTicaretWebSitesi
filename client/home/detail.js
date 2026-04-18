window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") || "Ürün Detayı";

    document.getElementById("detailTitle").innerText = title;
    document.getElementById("detailPrice").innerText = params.get("price");
    document.getElementById("detailImg").src = params.get("img");
    document.getElementById("detailCategory").innerText = params.get("cat");
    document.getElementById("breadcrumbTitle").innerText = title;

    // --- DİNAMİK UZUN AÇIKLAMA ÜRETİCİ ---
    let longDesc = "";
    if (title.includes("İşlemci") || title.includes("Intel") || title.includes("AMD")) {
        longDesc = `${title}, yeni nesil hibrit mimarisiyle sınırları zorluyor. Çoklu çekirdek performansı sayesinde render işlemlerinde %40 daha hızlı sonuç alırken, oyunlarda düşük gecikme süresi sağlar. Akıllı önbellek teknolojisi ile darboğazı minimize eder.`;
    } else if (title.includes("Ekran Kartı") || title.includes("RTX")) {
        longDesc = `${title}, yapay zeka destekli DLSS teknolojisi ve Ray Tracing (Işın İzleme) özellikleri ile görsel şölen sunar. 4K oyun deneyiminde bile stabil FPS değerlerini korur. Özel soğutma blokları sayesinde uzun süreli kullanımda kartınız her zaman serin kalır.`;
    }
    // detail.js içindeki açıklama kısmına bunu ekleyebilirsin:
    else if (title.includes("AtlasTech") || title.includes("Sistem")) {
        longDesc = `${title}, AtlasTech mühendisleri tarafından kablolama ve soğutma testleri yapılarak tak-çalıştır formunda hazırlanmıştır. Tüm parçalar 24 saat stres testine tabi tutulmuş, en güncel sürücüler yüklenerek kargoya hazır hale getirilmiştir. Oyun ve profesyonel iş yükleriniz için kusursuz stabilite sunar.`;
    }
    else {
        longDesc = `${title}, AtlasTech kalite standartlarında üretilmiş olup, profesyonel kullanıcılar için optimize edilmiştir. Yüksek malzeme kalitesi ve uzun ömürlü kullanım garantisiyle sisteminizin en güvenilir parçası olacak.`;
    }


    // HTML'de bu id'li bir <p> olduğunu varsayıyoruz:
    const descEl = document.querySelector(".product-description-text");
    if (descEl) descEl.innerText = longDesc;
};

document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById('qty');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');

    // PLUS (Artırma) Butonu
    if (plusBtn) {
        plusBtn.onclick = function () {
            let currentValue = parseInt(input.value);
            if (currentValue < 99) { // Maksimum 99 adet sınırı
                input.value = currentValue + 1;
            }
        };
    }

    // MINUS (Azaltma) Butonu
    if (minusBtn) {
        minusBtn.onclick = function () {
            let currentValue = parseInt(input.value);
            if (currentValue > 1) { // 1'in altına düşmesin
                input.value = currentValue - 1;
            }
        };
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    // 1. URL'den Ürün ID'sini Yakala
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 1; 

    try {
        // 2. Backend'den Ürün Bilgilerini Çek
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const product = await response.json();

        if (response.ok) {
            // HTML Sayfasındaki Elemanları Doldur
            document.getElementById("detailTitle").textContent = product.Name;
            document.getElementById("detailPrice").textContent = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.Price);
            document.getElementById("detailImg").src = product.ImageUrl;
            document.getElementById("detailImg").alt = product.Name;
            document.getElementById("detailCategory").textContent = product.Category;
            document.getElementById("breadcrumbTitle").textContent = product.Name;

            const descElement = document.querySelector(".product-description-text");
            if (descElement) descElement.textContent = product.Description;

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

    // --- FAVORİ BUTONU VE EFEKT KISMI ---
    const favBtn = document.querySelector(".fav-big-btn");
    
    if (favBtn) {
        const favIcon = favBtn.querySelector("i");

        favBtn.addEventListener("click", async () => {
            // A) TASARIM EFEKTİ: "active" klasını aç/kapat (Tasarımcıların istediği o efekt burası sayesinde çalışacak)
            favBtn.classList.toggle("active");

            // B) VERİTABANI İŞLEMİ
            try {
                const response = await fetch('http://localhost:3000/api/favorites/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: 1,
                        productId: parseInt(productId)
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // C) İKON DEĞİŞİMİ: API'den gelen sonuca göre kalbi doldur veya boşalt
                    if (data.isFavorite) {
                        favIcon.classList.replace("fa-regular", "fa-solid");
                        favIcon.style.color = "red";
                    } else {
                        favIcon.classList.replace("fa-solid", "fa-regular");
                        favIcon.style.color = "inherit";
                    }
                }
            } catch (error) {
                // Sunucu kapalı olsa bile görsel olarak tepki vermesi için (Fallback)
                if (favBtn.classList.contains("active")) {
                    favIcon.classList.replace("fa-regular", "fa-solid");
                    favIcon.style.color = "red";
                } else {
                    favIcon.classList.replace("fa-solid", "fa-regular");
                    favIcon.style.color = "inherit";
                }
                console.log("Sunucu kapalı ama görsel efekt çalıştırıldı.");
            }
        });
    }
});