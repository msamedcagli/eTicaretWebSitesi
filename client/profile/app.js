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
    const authLink = document.querySelector('a[href*="login"]'); 

    if (kullaniciVerisi) {
        // Giriş yapılmışsa Profil yazsın
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> Profil`;
        authLink.href = "../profile/index.html";
    } else {
        // Giriş yapılmamışsa Giriş Yap yazsın
        authLink.innerHTML = `<i class="fa-regular fa-user"></i> Giriş Yap`;
        authLink.href = "../login/index.html";
    }

    const data = JSON.parse(kullaniciVerisi);
    // data.user nesnesinin içindeki bilgileri HTML'e basalım
    document.getElementById('profile-name').innerText = data.user.name || "Mustafa Selvitop";
    document.getElementById('profile-email').innerText = data.user.email;
    
    // Eğer veritabanında telefon ve tarih varsa onları da ekleyebilirsin
    if (data.user.phone) {
        document.getElementById('profile-phone').innerText = data.user.phone;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProfileData();
});

async function fetchProfileData() {
    try {
        // Backend'deki profil endpoint'ine istek at
        // Not: Gerçek projede buraya giriş yapmış kullanıcının ID'si gönderilir
        const response = await fetch('http://localhost:3000/api/auth/profile'); 
        
        if (!response.ok) {
            throw new Error('Profil bilgileri alınamadı');
        }

        const user = await response.json();

        // HTML'deki "Yükleniyor..." alanlarını gerçek verilerle doldur
        document.getElementById('profile-name').innerText = user.name || 'İsim Belirtilmemiş';
        document.getElementById('sidebar-name').innerText = user.name || 'İsim Belirtilmemiş';
        document.getElementById('profile-email').innerText = user.email;
        
        // Eğer telefon ve tarih veritabanında varsa onları da güncelle
        if(user.phone) document.getElementById('profile-phone').innerText = user.phone;
        if(user.createdAt) {
            const date = new Date(user.createdAt).toLocaleDateString('tr-TR');
            document.getElementById('profile-date').innerText = date;
        }

        // Profil resmini isme göre güncelle (UI Avatars kullanarak)
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=150`;
        document.getElementById('profile-image').src = avatarUrl;

    } catch (error) {
        console.error('Hata:', error);
        document.getElementById('profile-name').innerText = "Hata oluştu!";
    }
}

// Çıkış Yap Butonu Fonksiyonu
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        // 1. Tüm yerel verileri temizle
        localStorage.clear(); 
        sessionStorage.clear(); // Varsa session verilerini de sil
        
        // 2. Kullanıcıyı giriş sayfasına postala
        window.location.replace('../login/index.html'); 
    }
});
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const email = JSON.parse(localStorage.getItem('kullaniciBilgileri')).user.email;

    try {
        const response = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, currentPassword, newPassword })
        });

        const result = await response.json();
        const messageDiv = document.getElementById('password-message');

        if (response.ok) {
            messageDiv.style.color = "green";
            messageDiv.innerText = "Şifreniz başarıyla güncellendi!";
            e.target.reset(); // Formu temizle
        } else {
            messageDiv.style.color = "red";
            messageDiv.innerText = result.message || "Bir hata oluştu.";
        }
    } catch (error) {
        console.error("Şifre değiştirme hatası:", error);
    }
});