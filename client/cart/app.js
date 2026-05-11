document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsList = document.getElementById("cart-items-list");
    const subtotalEl = document.getElementById("subtotal");
    const totalAmountEl = document.getElementById("total-amount");
    const checkoutBtn = document.getElementById("checkout-btn");

    const kullaniciVerisi = getCookie('userSession') || localStorage.getItem('kullaniciBilgileri');
    if (!kullaniciVerisi) {
        window.location.href = "../login/index.html";
        return;
    }

    const user = JSON.parse(kullaniciVerisi);

    async function loadCart() {
        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                headers: { 'x-user-id': user.id }
            });
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
        subtotalEl.textContent = formatted;
        totalAmountEl.textContent = formatted;
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
                    headers: { 'x-user-id': user.id }
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
                        'x-user-id': user.id 
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
        checkoutBtn.textContent = "İŞLENİYOR...";

        try {
            const response = await fetch('http://localhost:5000/api/orders/checkout', {
                method: 'POST',
                headers: { 'x-user-id': user.id }
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Siparişiniz başarıyla alındı! \nSipariş No: ${result.orderNumber}`);
                window.location.href = "../profile/index.html";
            } else {
                alert(result.error || "Sipariş oluşturulamadı.");
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = "ÖDEME YAP";
                loadCart(); // Stok değişmiş olabilir, sepeti yenile
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
