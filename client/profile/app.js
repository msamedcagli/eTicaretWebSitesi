// Sayfa yüklendiğinde verileri çek
(function checkAuth() {
    const user = localStorage.getItem('kullaniciBilgileri');
    if (!user) {
        alert("Bu sayfayı görüntülemek için giriş yapmalısınız.");
        window.location.replace('../login/index.html');
    }
})();

document.addEventListener("DOMContentLoaded", function() {
    const kullaniciVerisi = localStorage.getItem('kullaniciBilgileri');
    const authLink = document.getElementById('header-profile-link'); 

    if (kullaniciVerisi) {
        const data = JSON.parse(kullaniciVerisi);
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${data.user.name || 'Hesabım'}`;
        authLink.href = "../profile/index.html";
        
        if (data.user.email) document.getElementById('profile-email').innerText = data.user.email;
        if (data.user.phone) document.getElementById('profile-phone').innerText = data.user.phone;
    } else {
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> Giriş Yap`;
        authLink.href = "../login/index.html";
    }

    fetchProfileData();
});

async function fetchProfileData() {
    try {
        const userString = localStorage.getItem('kullaniciBilgileri');
        if (!userString) return;
        
        const userData = JSON.parse(userString);
        const userEmail = userData.user.email;

        const response = await fetch(`http://localhost:5000/api/auth/profile?email=${encodeURIComponent(userEmail)}`); 
        
        if (!response.ok) {
            throw new Error('Profil bilgileri alınamadı');
        }

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
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
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
        animation: slideIn 0.3s ease-out;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
    `;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// Çıkış Yap
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
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
    const email = JSON.parse(userString).user.email;

    try {
        const response = await fetch('http://localhost:5000/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, currentPassword, newPassword })
        });
        const result = await response.json();
        if (response.ok) {
            showToast("Şifreniz başarıyla güncellendi!", "success");
            e.target.reset(); 
        } else {
            showToast(result.message || "Bir hata oluştu.", "error");
        }
    } catch (error) {
        console.error("Şifre değiştirme fetch hatası:", error);
        showToast("Sunucuya bağlanılamadı.", "error");
    }
});