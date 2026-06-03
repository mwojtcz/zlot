// Day Navigation
const dayButtons = document.querySelectorAll('.day-btn');
const daySchedules = document.querySelectorAll('.day-schedule');

dayButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and schedules
        dayButtons.forEach(btn => btn.classList.remove('active'));
        daySchedules.forEach(schedule => schedule.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding schedule
        const day = button.dataset.day;
        document.getElementById(day).classList.add('active');
        
        // Smooth scroll to schedule
        document.querySelector('.schedule-container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Auto-select current day if within event dates
function selectCurrentDay() {
    const today = new Date();
    const eventStart = new Date('2026-06-03');
    const eventEnd = new Date('2026-06-07');
    
    if (today >= eventStart && today <= eventEnd) {
        const dayOfWeek = today.getDay();
        const dayMap = {
            3: 'wednesday', // środa
            4: 'thursday',  // czwartek
            5: 'friday',    // piątek
            6: 'saturday',  // sobota
            0: 'sunday'     // niedziela
        };
        
        const dayId = dayMap[dayOfWeek];
        if (dayId) {
            // Remove active from all
            dayButtons.forEach(btn => btn.classList.remove('active'));
            daySchedules.forEach(schedule => schedule.classList.remove('active'));
            
            // Activate current day
            document.querySelector(`[data-day="${dayId}"]`).classList.add('active');
            document.getElementById(dayId).classList.add('active');
        }
    }
}

selectCurrentDay();

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, observerOptions);

// Observe all events
document.querySelectorAll('.event').forEach(event => {
    event.style.opacity = '0';
    event.style.transform = 'translateX(-20px)';
    event.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(event);
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// Add to Calendar functionality
function addToCalendar(event) {
    const events = {
        train: {
            title: 'Kolejka Wąskotorowa - ZLOT DURANGO',
            start: '2026-06-05T12:05:00',
            end: '2026-06-05T16:50:00',
            location: 'Żnin, ul. Potockiego',
            description: 'Rezerwacja na hasło "Durango"'
        },
        silverado: {
            title: 'Silverado City - ZLOT DURANGO',
            start: '2026-06-06T11:00:00',
            end: '2026-06-06T15:00:00',
            location: 'Silverado City',
            description: 'Konkursy i pokazy kowbojskie'
        },
        concert: {
            title: 'Koncert O.S.T.R. & Eldo - ZLOT DURANGO',
            start: '2026-06-04T20:00:00',
            end: '2026-06-04T23:00:00',
            location: 'Cukrownia Żnin - Plaża',
            description: 'Bilet: 119 PLN'
        },
        gala: {
            title: 'Gala nad jeziorem - ZLOT DURANGO',
            start: '2026-06-06T20:00:00',
            end: '2026-06-06T23:59:00',
            location: 'Cukrownia Żnin - Bar na plaży',
            description: 'Rozdanie nagród + 2 kegi piwa'
        }
    };
    
    const eventData = events[event];
    if (!eventData) return;
    
    // Create Google Calendar URL
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.start.replace(/[-:]/g, '')}/${eventData.end.replace(/[-:]/g, '')}&location=${encodeURIComponent(eventData.location)}&details=${encodeURIComponent(eventData.description)}`;
    
    window.open(googleCalUrl, '_blank');
}

// Console Easter Egg
console.log(`
🚗 ZLOT DURANGO 2026 🤠
━━━━━━━━━━━━━━━━━━━━━━
Cukrownia Żnin
4-7 czerwca 2026

Do zobaczenia na zlocie!
`);

// ==========================================
// LIGHTBOX GALLERY
// ==========================================

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.getElementById('lightbox-counter');
const galleryItems = document.querySelectorAll('.gallery-item');

let currentIndex = 0;
const images = Array.from(galleryItems).map(item => item.dataset.src);

// Open lightbox
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    lightboxImg.src = images[currentIndex];
    lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = images[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
        lightboxImg.style.opacity = '1';
    }, 150);
}

// Lightbox controls
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-next').addEventListener('click', nextImage);
document.getElementById('lightbox-prev').addEventListener('click', prevImage);

// Close on background click
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowRight':
            nextImage();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
    }
});

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left -> next
            nextImage();
        } else {
            // Swipe right -> prev
            prevImage();
        }
    }
}

// Add smooth transition to lightbox image
lightboxImg.style.transition = 'opacity 0.15s ease';

// ==========================================
// THEME TOGGLE
// ==========================================

const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Check for saved theme preference or system preference
function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme
function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateToggleIcon(theme);
}

// Update toggle button icon
function updateToggleIcon(theme) {
    const sunIcon = themeToggle.querySelector('.icon-sun');
    const moonIcon = themeToggle.querySelector('.icon-moon');
    
    if (theme === 'dark') {
        sunIcon.style.opacity = '1';
        moonIcon.style.opacity = '0';
    } else {
        sunIcon.style.opacity = '0';
        moonIcon.style.opacity = '1';
    }
}

// Initialize theme
const initialTheme = getPreferredTheme();
setTheme(initialTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});
