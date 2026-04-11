// Tab Switching Logic
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');

tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginSection.classList.add('active');
    registerSection.classList.remove('active');
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerSection.classList.add('active');
    loginSection.classList.remove('active');
});

function showMessage(elId, text, type) {
    const el = document.getElementById(elId);
    el.textContent = text;
    el.className = `message ${type}`;
}

// Register Form Submit
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const kvkk = document.getElementById('kvkk').checked;
    const submitBtn = document.getElementById('registerSubmitBtn');

    document.getElementById('registerMessage').className = 'message';

    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Parolalar eşleşmiyor!', 'error');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Kaydediliyor...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone, password, kvkk })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('registerMessage', data.message || 'Kayıt başarılı!', 'success');
            document.getElementById('registerForm').reset();
            // Automatically switch to login after short delay
            setTimeout(() => tabLogin.click(), 2000);
        } else {
            showMessage('registerMessage', data.error || 'Hata oluştu.', 'error');
        }
    } catch (error) {
        showMessage('registerMessage', 'Sunucuya bağlanılamadı.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.getElementById('loginSubmitBtn');

    document.getElementById('loginMessage').className = 'message';

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Giriş Yapılıyor...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            showMessage('loginMessage', 'Giriş Başarılı! Yönlendiriliyorsunuz...', 'success');

            // 1. Arka plandan (backend) gelen bilgileri tarayıcının kasasına (localStorage) şifreleyerek kaydet
            localStorage.setItem('kullaniciBilgileri', JSON.stringify(data));

            // 2. Kullanıcı "Giriş Başarılı" yazısını okuyabilsin diye 1.5 saniye bekleyip ana sayfaya yönlendir
            setTimeout(() => {
                // Klasör yapısına göre bir üst klasöre çıkıp home içindeki index.html'e gidiyoruz
                window.location.href = '../home/index.html';
            }, 1500);
        } else {
            showMessage('loginMessage', data.error || 'Giriş başarısız.', 'error');
        }
    } catch (error) {
        showMessage('loginMessage', 'Sunucuya bağlanılamadı.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
