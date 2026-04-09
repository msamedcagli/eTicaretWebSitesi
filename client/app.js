let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');

// Manuel geçiş fonksiyonu (butonlar için)
function changeSlide(direction) {
    slides[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex += direction;
    
    // Sona gelirse başa dön, baştaysa sona git
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    slides[currentSlideIndex].classList.add('active');
}

// Otomatik kayma fonksiyonu (5 saniyede bir tetiklenir)
function autoSlide() {
    changeSlide(1);
}

// Slider'ı otomatik başlat (5000 milisaniye = 5 saniye)
setInterval(autoSlide, 5000);