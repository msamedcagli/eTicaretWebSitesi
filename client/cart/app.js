document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsList = document.getElementById("cart-items-list");
    const subtotalEl = document.getElementById("subtotal");
    const totalAmountEl = document.getElementById("total-amount");
    const checkoutBtn = document.getElementById("checkout-btn");

    // --- AKILLI ARAMA AKTİFLEŞTİRME ---
    enableSearchInCart();

    const sessionCookie = getCookie('userSession');
    const storageData = localStorage.getItem('kullaniciBilgileri');
    
    if (!sessionCookie || !storageData) {
        if (sessionCookie || storageData) {
            localStorage.removeItem('kullaniciBilgileri');
            document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        window.location.href = "../login/index.html";
        return;
    }

    const user = JSON.parse(storageData);

    function forceLogout() {
        localStorage.removeItem('kullaniciBilgileri');
        document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "../login/index.html";
    }

    async function loadCart() {
        if (cartItemsList) {
            // --- LOADING SPINNER ---
            cartItemsList.innerHTML = `
                <div style="text-align:center; padding:50px; grid-column: 1/-1;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size:2.5rem; color:#2563eb;"></i>
                    <p style="margin-top:15px; color:#64748b; font-weight:500;">Sepetiniz yükleniyor...</p>
                </div>`;
        }

        try {
            // Yapay gecikme (Yükleme animasyonunu görmek için)
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            
            const [response] = await Promise.all([
                fetch('http://localhost:5000/api/cart', {
                    headers: { 'x-user-id': user?.user?.id }
                }),
                delay(800) 
            ]);
            
            if (response.status === 401) {
                forceLogout();
                return;
            }
            
            const cartItems = await response.json();

            if (cartItems.length === 0) {
                cartItemsList.innerHTML = `
                    <div class="empty-cart">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <p>Sepetiniz şu an boş.</p>
                        <a href="../home/index.html" style="color: #2563eb; text-decoration: underline;">Alışverişe Başla</a>
                    </div>
                `;
                checkoutBtn.disabled = true;
                updateTotals(0);
                return;
            }

            cartItemsList.innerHTML = "";
            let total = 0;

            cartItems.forEach(item => {
                const finalImgUrl = item.ImageUrl.startsWith('/assets') ? `..${item.ImageUrl}` : item.ImageUrl;
                total += item.Price * item.Quantity;

                const itemRow = document.createElement("div");
                itemRow.className = "cart-item";
                itemRow.innerHTML = `
                    <img src="${finalImgUrl}" alt="${item.Name}">
                    <div class="item-details">
                        <h4>${item.Name}</h4>
                        <p class="price">${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.Price)}</p>
                        <p class="stock-info" style="font-size: 0.8rem; color: ${item.Stock < 5 ? '#ef4444' : '#64748b'}">
                            ${item.Stock < 5 ? `Son ${item.Stock} ürün!` : 'Stokta var'}
                        </p>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" data-id="${item.Id}" data-qty="${item.Quantity}">-</button>
                        <span>${item.Quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.Id}" data-qty="${item.Quantity}">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.Id}"><i class="fa-solid fa-trash-can"></i></button>
                `;
                cartItemsList.appendChild(itemRow);
            });

            updateTotals(total);
            checkoutBtn.disabled = false;

        } catch (error) {
            console.error("Sepet yükleme hatası:", error);
            cartItemsList.innerHTML = "<p>Sepet yüklenirken bir hata oluştu.</p>";
        }
    }

    function updateTotals(total) {
        const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total);
        if (subtotalEl) subtotalEl.textContent = formatted;
        if (totalAmountEl) totalAmountEl.textContent = formatted;
    }

    // --- AKILLI ARAMA FONKSİYONU ---
    function enableSearchInCart() {
        const sBtn = document.querySelector('.search-bar button');
        const sInput = document.querySelector('.search-bar input');

        if (sBtn && sInput) {
            sBtn.onclick = (e) => {
                e.preventDefault();
                const query = sInput.value.trim();
                if (query) {
                    sBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    window.location.href = `../home/category.html?search=${encodeURIComponent(query)}`;
                }
            };
            sInput.onkeypress = (e) => { if (e.key === 'Enter') sBtn.onclick(e); };
        }
    }

    // Olay Dinleyicileri (Miktar güncelleme ve silme)
    cartItemsList.addEventListener("click", async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        
        if (btn.classList.contains('remove-btn')) {
            if (confirm("Ürünü sepetten çıkarmak istediğinize emin misiniz?")) {
                await fetch(`http://localhost:5000/api/cart/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-id': user?.user?.id }
                });
                loadCart();
            }
        } else if (btn.classList.contains('quantity-btn')) {
            const currentQty = parseInt(btn.getAttribute('data-qty'));
            const newQty = btn.classList.contains('plus') ? currentQty + 1 : currentQty - 1;

            if (newQty > 0) {
                const response = await fetch(`http://localhost:5000/api/cart/update/${id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-user-id': user?.user?.id 
                    },
                    body: JSON.stringify({ quantity: newQty })
                });

                if (!response.ok) {
                    const data = await response.json();
                    alert(data.error || "Miktar güncellenemedi.");
                }
                loadCart();
            }
        }
    });

    // Ödeme Yap (Checkout)
    checkoutBtn.addEventListener("click", async () => {
        if (!confirm("Siparişi onaylıyor musunuz? Ödeme simüle edilecektir.")) return;

        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...';

        try {
            const response = await fetch('http://localhost:5000/api/orders/checkout', {
                method: 'POST',
                headers: { 'x-user-id': user?.user?.id }
            });

            if (response.status === 401) {
                forceLogout();
                return;
            }

            const result = await response.json();

            if (response.ok) {
                alert(`Siparişiniz başarıyla alındı! \nSipariş No: ${result.orderNumber}`);
                window.location.href = "../profile/index.html";
            } else {
                alert(result.error || "Sipariş oluşturulamadı.");
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = "ÖDEME YAP";
                loadCart();
            }
        } catch (error) {
            console.error("Checkout hatası:", error);
            alert("Bir hata oluştu.");
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "ÖDEME YAP";
        }
    });

    loadCart();
});

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