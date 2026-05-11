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

async function forceLogout() {
    const userString = localStorage.getItem('kullaniciBilgileri');
    const userData = userString ? JSON.parse(userString) : null;
    
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'x-user-id': userData?.user?.id }
        });
    } catch (err) {}

    localStorage.removeItem('kullaniciBilgileri');
    document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace('../login/index.html');
}

// Sayfa yüklendiğinde verileri çek
(function checkAuth() {
    const sessionCookie = getCookie('userSession');
    const storageData = localStorage.getItem('kullaniciBilgileri');
    
    if (!sessionCookie || !storageData) {
        if (sessionCookie || storageData) {
            // Tutarsızlık durumunda temizle
            localStorage.removeItem('kullaniciBilgileri');
            document.cookie = "userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        window.location.replace('../login/index.html');
    }
})();

document.addEventListener("DOMContentLoaded", function() {
    const kullaniciVerisi = localStorage.getItem('kullaniciBilgileri');
    const authLink = document.getElementById('header-profile-link'); 

    if (kullaniciVerisi) {
        const data = JSON.parse(kullaniciVerisi);
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${data?.user?.name || 'Hesabım'}`;
        authLink.href = "../profile/index.html";
        
        if (data?.user?.email) document.getElementById('profile-email').innerText = data?.user?.email;
        if (data?.user?.phone) document.getElementById('profile-phone').innerText = data?.user?.phone;
    } else {
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> Giriş Yap`;
        authLink.href = "../login/index.html";
    }

    fetchProfileData();
    fetchOrders();
});

async function fetchOrders() {
    try {
        const userString = localStorage.getItem('kullaniciBilgileri');
        if (!userString) return;
        const userData = JSON.parse(userString);
        
        const response = await fetch('http://localhost:5000/api/orders', {
            headers: { 'x-user-id': userData?.user?.id }
        });

        if (response.status === 401) {
            forceLogout();
            return;
        }

        if (!response.ok) throw new Error('Siparişler alınamadı');
        const orders = await response.json();
        const orderList = document.getElementById('order-list');

        if (orders.length === 0) {
            orderList.innerHTML = '<p class="no-orders">Henüz bir siparişiniz bulunmuyor.</p>';
            return;
        }

        orderList.innerHTML = "";
        orders.forEach(order => {
            const date = new Date(order.CreatedAt).toLocaleDateString('tr-TR');
            const items = order.Items ? JSON.parse(order.Items) : [];
            
            const card = document.createElement('div');
            card.className = 'order-card';
            
            let itemsHtml = '<div class="order-items-preview">';
            items.forEach(item => {
                const finalImgUrl = item.ImageUrl.startsWith('/assets') ? `..${item.ImageUrl}` : item.ImageUrl;
                const productId = item.id || item.ProductId || item.Id;
                itemsHtml += `
                    <div class="order-item-img-wrapper">
                        <img src="${finalImgUrl}" alt="${item.Name}" class="order-item-thumb" 
                             onclick="if(${productId}) window.location.href='../home/product-detail.html?id=${productId}'">
                        <span class="item-qty-badge">x${item.Quantity}</span>
                    </div>
                `;
            });
            itemsHtml += '</div>';

            card.innerHTML = `
                <div class="order-header">
                    <span class="order-no">Sipariş No: #${order.OrderNumber}</span>
                    <span class="order-status ${order.Status === 'Teslim Edildi' ? 'success' : 'pending'}">${order.Status}</span>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <p><strong>Tarih:</strong> ${date}</p>
                        <p><strong>Tutar:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.TotalAmount)}</p>
                        <p><strong>Ürün Sayısı:</strong> ${order.ItemCount}</p>
                    </div>
                    ${itemsHtml}
                </div>
            `;
            orderList.appendChild(card);
        });

        // Modal'ı oluştur (Eğer yoksa)
        if (!document.getElementById('imageModal')) {
            const modal = document.createElement('div');
            modal.id = 'imageModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <span class="close-modal">&times;</span>
                <img class="modal-content" id="imgFull">
                <div id="caption"></div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.close-modal').onclick = () => modal.style.display = "none";
            modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
        }

    } catch (error) {
        console.error('Sipariş çekme hatası:', error);
        document.getElementById('order-list').innerHTML = '<p class="error-msg">Siparişler yüklenirken bir hata oluştu.</p>';
    }
}

async function fetchProfileData() {
    try {
        const userString = localStorage.getItem('kullaniciBilgileri');
        if (!userString) return;
        
        const userData = JSON.parse(userString);
        const userEmail = userData?.user?.email;

        const response = await fetch(`http://localhost:5000/api/auth/profile?email=${encodeURIComponent(userEmail)}`); 
        
        if (response.status === 401) {
            forceLogout();
            return;
        }

        if (!response.ok) throw new Error('Profil bilgileri alınamadı');

        const user = await response.json();

        if (user.Email) document.getElementById('profile-email').innerText = user.Email;
        if (user.Phone) document.getElementById('profile-phone').innerText = user.Phone;
        
        if (user.CreatedAt) {
            const date = new Date(user.CreatedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('profile-date').innerText = date;
        }

        const authLink = document.getElementById('header-profile-link');
        if (authLink) {
            authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${user.name || 'Hesabım'}`;
        }

    } catch (error) {
        console.error('Profil verisi çekme hatası:', error);
        document.getElementById('profile-email').innerText = "Bir hata oluştu";
        document.getElementById('profile-phone').innerText = "Bir hata oluştu";
        document.getElementById('profile-date').innerText = "Bir hata oluştu";
    }
}

// Çerez Yardımcıları
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

// TOAST SİSTEMİ
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

if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// Çıkış Yap
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        const userString = localStorage.getItem('kullaniciBilgileri');
        const userData = userString ? JSON.parse(userString) : null;
        
        try {
            // Sunucuya log basması için istek gönder
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: { 'x-user-id': userData?.user?.id }
            });
        } catch (err) {
            console.warn("Çıkış logu sunucuya gönderilemedi.");
        }

        setCookie('authStatus', 'loggedOut', 1);
        eraseCookie('userSession');
        localStorage.clear(); 
        sessionStorage.clear();
        window.location.replace('../home/index.html'); 
    }
});

// Şifre Değiştirme
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const userString = localStorage.getItem('kullaniciBilgileri');
    if (!userString) return;
    const userData = JSON.parse(userString);

    try {
        const response = await fetch('http://localhost:5000/api/auth/change-password', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-user-id': userData?.user?.id
            },
            body: JSON.stringify({ email: userData.user.email, currentPassword, newPassword })
        });

        if (response.status === 401) {
            forceLogout();
            return;
        }

        const data = await response.json();
        if (response.ok) {
            showToast("Şifreniz başarıyla güncellendi!", "success");
            e.target.reset(); 
        } else {
            showToast(data.message || "Bir hata oluştu.", "error");
        }
    } catch (error) {
        console.error("Şifre değiştirme fetch hatası:", error);
        showToast("Sunucuya bağlanılamadı.", "error");
    }
});

window.openImageModal = function(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById("imgFull");
    modal.style.display = "block";
    modalImg.src = src;
};