// Sayfa yüklendiğinde verileri çek
(function checkAuth() {
    const user = localStorage.getItem('kullaniciBilgileri');
    if (!user) {
        // Eğer giriş verisi yoksa, içeri girmesine izin verme!
        alert("Bu sayfayı görüntülemek için giriş yapmalısınız.");
        window.location.replace('../login/index.html');
    }
})();

document.addEventListener("DOMContentLoaded", function() {
    const kullaniciVerisi = localStorage.getItem('kullaniciBilgileri');
    const authLink = document.getElementById('header-profile-link'); 

    if (kullaniciVerisi) {
        const data = JSON.parse(kullaniciVerisi);
        // Giriş yapılmışsa Hesabım yazsın
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${data.user.name || 'Hesabım'}`;
        authLink.href = "../profile/index.html";
        
        // İlk yüklemede local storage'dan verileri bas
        if (data.user.email) document.getElementById('profile-email').innerText = data.user.email;
        if (data.user.phone) document.getElementById('profile-phone').innerText = data.user.phone;
    } else {
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> Giriş Yap`;
        authLink.href = "../login/index.html";
    }

    // Backend'den güncel verileri çek
    fetchProfileData();
});

async function fetchProfileData() {
    try {
        const userString = localStorage.getItem('kullaniciBilgileri');
        if (!userString) return;
        
        const userData = JSON.parse(userString);
        const userEmail = userData.user.email;

        // Portu 5000 yapıyoruz ve email parametresini ekliyoruz
        const response = await fetch(`http://localhost:5000/api/auth/profile?email=${encodeURIComponent(userEmail)}`); 
        
        if (!response.ok) {
            throw new Error('Profil bilgileri alınamadı');
        }

        const user = await response.json();

        // HTML alanlarını gerçek verilerle doldur (Backend'den gelen büyük harf uyumu: user.Email)
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

        // Header'daki ismi de güncelle
        const authLink = document.getElementById('header-profile-link');
        if (authLink) {
            authLink.innerHTML = `<i class="fa-regular fa-user"></i> ${user.name || 'Hesabım'}`;
        }

    } catch (error) {
        console.error('Profil verisi çekme hatası:', error);
        // Hata durumunda mesajları güncelle
        document.getElementById('profile-email').innerText = "Bir hata oluştu";
        document.getElementById('profile-phone').innerText = "Bir hata oluştu";
        document.getElementById('profile-date').innerText = "Bir hata oluştu";
    }
}

// Çerez (Cookie) Yardımcıları
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

// Çıkış Yap Butonu Fonksiyonu
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        // 1. Çerezlere çıkış yapıldığı bilgisini kaydet
        setCookie('authStatus', 'loggedOut', 1);
        
        // 2. Mevcut oturum çerezini ve yerel verileri temizle
        eraseCookie('userSession');
        localStorage.clear(); 
        sessionStorage.clear();
        
        // 3. Kullanıcıyı ANA SAYFAYA postala
        window.location.replace('../home/index.html'); 
    }
});

// Şifre Değiştirme Formu
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
        const messageDiv = document.getElementById('password-message');

        if (response.ok) {
            messageDiv.style.color = "#166534";
            messageDiv.innerText = "Şifreniz başarıyla güncellendi!";
            e.target.reset(); 
        } else {
            messageDiv.style.color = "#ef4444";
            messageDiv.innerText = result.message || "Bir hata oluştu.";
        }
    } catch (error) {
        console.error("Şifre değiştirme hatası:", error);
    }
});