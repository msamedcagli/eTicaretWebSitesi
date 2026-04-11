window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") || "Ürün Detayı";
    
    document.getElementById("detailTitle").innerText = title;
    document.getElementById("detailPrice").innerText = params.get("price");
    document.getElementById("detailImg").src = params.get("img");
    document.getElementById("detailCategory").innerText = params.get("cat");
    document.getElementById("breadcrumbTitle").innerText = title;

    // --- DİNAMİK UZUN AÇIKLAMA ÜRETİCİ ---
    let longDesc = "";
    if(title.includes("İşlemci") || title.includes("Intel") || title.includes("AMD")) {
        longDesc = `${title}, yeni nesil hibrit mimarisiyle sınırları zorluyor. Çoklu çekirdek performansı sayesinde render işlemlerinde %40 daha hızlı sonuç alırken, oyunlarda düşük gecikme süresi sağlar. Akıllı önbellek teknolojisi ile darboğazı minimize eder.`;
    } else if(title.includes("Ekran Kartı") || title.includes("RTX")) {
        longDesc = `${title}, yapay zeka destekli DLSS teknolojisi ve Ray Tracing (Işın İzleme) özellikleri ile görsel şölen sunar. 4K oyun deneyiminde bile stabil FPS değerlerini korur. Özel soğutma blokları sayesinde uzun süreli kullanımda kartınız her zaman serin kalır.`;
    }
    // detail.js içindeki açıklama kısmına bunu ekleyebilirsin:
else if(title.includes("AtlasTech") || title.includes("Sistem")) {
    longDesc = `${title}, AtlasTech mühendisleri tarafından kablolama ve soğutma testleri yapılarak tak-çalıştır formunda hazırlanmıştır. Tüm parçalar 24 saat stres testine tabi tutulmuş, en güncel sürücüler yüklenerek kargoya hazır hale getirilmiştir. Oyun ve profesyonel iş yükleriniz için kusursuz stabilite sunar.`;
}
 else {
        longDesc = `${title}, AtlasTech kalite standartlarında üretilmiş olup, profesyonel kullanıcılar için optimize edilmiştir. Yüksek malzeme kalitesi ve uzun ömürlü kullanım garantisiyle sisteminizin en güvenilir parçası olacak.`;
    }
    
    
    // HTML'de bu id'li bir <p> olduğunu varsayıyoruz:
    const descEl = document.querySelector(".product-description-text");
    if(descEl) descEl.innerText = longDesc;
};
// detail.js dosyasının en altına ekle:

document.addEventListener("DOMContentLoaded", function() {
    const favBtn = document.querySelector(".fav-big-btn");

    if (favBtn) {
        favBtn.addEventListener("click", function() {
            // "active" klasını aç/kapat (toggle)
            this.classList.toggle("active");

            const icon = this.querySelector("i");
            
            // İkonu boş kalp (fa-regular) ve dolu kalp (fa-solid) arasında değiştir
            if (this.classList.contains("active")) {
                icon.classList.replace("fa-regular", "fa-solid");
                console.log("Ürün favorilere eklendi! ❤️");
            } else {
                icon.classList.replace("fa-solid", "fa-regular");
                console.log("Ürün favorilerden çıkarıldı.");
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById('qty');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');

    // PLUS (Artırma) Butonu
    if (plusBtn) {
        plusBtn.onclick = function() {
            let currentValue = parseInt(input.value);
            if (currentValue < 99) { // Maksimum 99 adet sınırı
                input.value = currentValue + 1;
            }
        };
    }

    // MINUS (Azaltma) Butonu
    if (minusBtn) {
        minusBtn.onclick = function() {
            let currentValue = parseInt(input.value);
            if (currentValue > 1) { // 1'in altına düşmesin
                input.value = currentValue - 1;
            }
        };
    }
});