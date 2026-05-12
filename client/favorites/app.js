// --- FAVORİLER SAYFASI MANTIĞI ---
document.addEventListener("DOMContentLoaded", () => {
  const sessionCookie = getCookie("userSession");
  const storageData = localStorage.getItem("kullaniciBilgileri");
  const authLink = document.getElementById("header-profile-link");

  // Arama butonunu aktif et (Yeni Eklendi)
  enableSearchForFavorites();

  if (sessionCookie && storageData) {
    try {
      const data = JSON.parse(storageData);
      if (authLink) {
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${data?.user?.name || "Hesabım"}`;
        authLink.href = "../profile/index.html";
      }
    } catch (e) {
      console.error("Favoriler: LocalStorage ayrıştırma hatası:", e);
    }
  } else {
    showToast("Favorilerinizi görmek için giriş yapmalısınız!", "error");
    setTimeout(() => {
      window.location.href = "../login/index.html";
    }, 2000);
    return;
  }

  loadRealFavorites();
});

// --- ARAMA FONKSİYONU (Yeni Eklendi - KODU BOZMAZ) ---
function enableSearchForFavorites() {
  const sBtn = document.querySelector('.search-bar button');
  const sInput = document.querySelector('.search-bar input');

  if (sBtn && sInput) {
    sBtn.onclick = (e) => {
      e.preventDefault();
      const query = sInput.value.trim();
      if (query) {
        // Butona loading ikonu koy
        sBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        // Arama kelimesiyle kategori sayfasına yönlendir
        window.location.href = `../home/category.html?search=${encodeURIComponent(query)}`;
      }
    };

    sInput.onkeypress = (e) => {
      if (e.key === 'Enter') sBtn.onclick(e);
    };
  }
}

async function loadRealFavorites() {
  const grid = document.getElementById("favoritesGrid");
  const countText = document.getElementById("favoritesCount");

  if (!grid || !countText) return;

  // --- LOADING GÖSTERGESİ (Yeni Eklendi) ---
  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: #38bdf8;"></i>
        <p style="margin-top: 15px; color: #64748b; font-weight: 500;">Favorileriniz Yükleniyor...</p>
    </div>`;

  const storageData = localStorage.getItem("kullaniciBilgileri");
  if (!storageData) return;

  let userId;
  try {
    const userData = JSON.parse(storageData);
    userId = userData.user ? userData.user.id : userData.id;
  } catch (e) {
    return;
  }

  if (!userId) return;

  try {
    // Veri gelene kadar loading dönsün diye fetch'i bekliyoruz
    const response = await fetch(`http://localhost:5000/api/favorites/${userId}`);
    
    if (!response.ok) {
        throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const favorites = await response.json();

    if (!Array.isArray(favorites)) {
        throw new Error("Geçersiz veri formatı.");
    }

    countText.textContent = `${favorites.length} Ürün`;

    if (favorites.length === 0) {
      grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-heart-circle-xmark" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px;"></i>
                    <p style="color: #64748b;">Henüz favori ürününüz bulunmuyor.</p>
                    <a href="../home/index.html" style="color: #38bdf8; text-decoration: none; display: inline-block; margin-top: 10px;">Alışverişe Başla</a>
                </div>`;
      return;
    }

    grid.innerHTML = favorites
      .map((product) => {
        let imgSrc = product.ImageUrl || "";
        if (imgSrc.startsWith("/")) {
            imgSrc = ".." + imgSrc;
        } else if (!imgSrc.startsWith("http")) {
            imgSrc = "../" + imgSrc;
        }

        return `
        <div class="product-card" onclick="if(!event.target.closest('button')) window.location.href='../home/product-detail.html?id=${product.Id}'">
            <div class="product-image">
                <img src="${imgSrc}" 
                     alt="${product.Name}" 
                     onerror="this.onerror=null; this.src='../assets/img/no-image.jpg';">
            </div>
            <div class="category">${product.Category || "BİLEŞEN"}</div>
            <h4>${product.Name}</h4>
            <div class="price">${product.Price ? product.Price.toLocaleString("tr-TR") : "0"} ₺</div>
            <div class="button-group">
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.Id}, this)">
                    <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                </button>
                <button class="remove-btn" onclick="event.stopPropagation(); removeFavorite(${product.Id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
      })
      .join("");
      
  } catch (error) {
    console.error("Favoriler Yükleme Hatası:", error);
    grid.innerHTML = `<p class="empty-state" style="color: #ef4444;">Favoriler yüklenirken bir sorun oluştu.</p>`;
  }
}

async function removeFavorite(productId) {
  const storageData = localStorage.getItem("kullaniciBilgileri");
  if (!storageData) return;
  const userData = JSON.parse(storageData);
  const userId = userData.user ? userData.user.id : userData.id;

  try {
    const response = await fetch(`http://localhost:5000/api/favorites/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });

    if (response.ok) {
      loadRealFavorites(); 
    }
  } catch (error) {
    console.error("Favoriler: Çıkarma hatası:", error);
  }
}

async function addToCart(productId, btn) {
  const storageData = localStorage.getItem("kullaniciBilgileri");
  if (!storageData) {
      showToast("Giriş yapmalısınız!", "error");
      return;
  }
  const userData = JSON.parse(storageData);
  const userId = userData.user ? userData.user.id : userData.id;

  // Buton loading animasyonu
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  btn.disabled = true;

  try {
    const response = await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (response.ok) {
      showToast("Ürün sepete eklendi!", "success");
    } else {
      showToast("Sepete eklenemedi.", "error");
    }
  } catch (error) {
    console.error("Favoriler: Sepete ekleme hatası:", error);
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
}

function showToast(message, type = "success") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = "position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; align-items: center; pointer-events: none;";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.style.cssText = `background: ${type === "error" ? "#ef4444" : "#10b981"}; color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInDown 0.4s ease-out; font-family: sans-serif; font-weight: 600; pointer-events: auto; min-width: 250px; text-align: center;`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
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