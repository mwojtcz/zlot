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

// ==========================================
// ADD TO CALENDAR - Every Event
// ==========================================

const dayDateMap = {
    wednesday: '2026-06-03',
    thursday:  '2026-06-04',
    friday:    '2026-06-05',
    saturday:  '2026-06-06',
    sunday:    '2026-06-07'
};

const fuzzyTimes = {
    'Rano':        ['08:00', '10:00'],
    'Od rana':     ['09:00', '12:00'],
    'Popołudnie':  ['15:00', '17:00'],
    'Wieczór':     ['20:00', '22:00'],
    'Do południa': ['10:00', '12:00']
};

function parseCalTimes(rawTime, dateStr) {
    const t = rawTime.trim();

    if (fuzzyTimes[t]) {
        const [s, e] = fuzzyTimes[t];
        return [dateStr + 'T' + s + ':00', dateStr + 'T' + e + ':00'];
    }

    // "HH:MM - HH:MM" or "HH:MM–HH:MM"
    const range = t.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
    if (range) {
        return [
            dateStr + 'T' + range[1].padStart(5, '0') + ':00',
            dateStr + 'T' + range[2].padStart(5, '0') + ':00'
        ];
    }

    // Single time (possibly prefixed with "Od " etc.)
    const single = t.match(/(\d{1,2}:\d{2})/);
    if (single) {
        const [h, m] = single[1].split(':').map(Number);
        const endH = String((h + 1) % 24).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        return [
            dateStr + 'T' + String(h).padStart(2, '0') + ':' + mm + ':00',
            dateStr + 'T' + endH + ':' + mm + ':00'
        ];
    }

    return null;
}

function initCalendarButtons() {
    document.querySelectorAll('.day-schedule').forEach(section => {
        const dateStr = dayDateMap[section.id];
        if (!dateStr) return; // skip non-day sections (e.g. cukrownia)

        section.querySelectorAll('.event').forEach(event => {
            const timeEl    = event.querySelector('.event-time .time');
            const titleEl   = event.querySelector('.event-content h3');
            const contentEl = event.querySelector('.event-content');
            if (!timeEl || !titleEl || !contentEl) return;

            const times = parseCalTimes(timeEl.textContent, dateStr);
            if (!times) return;

            const locEl    = event.querySelector('.event-location span:last-child, .event-location a');
            const location = locEl ? locEl.textContent.trim() : 'Cukrownia Żnin';

            const start = times[0].replace(/[-:]/g, '');
            const end   = times[1].replace(/[-:]/g, '');
            const title = 'ZLOT DURANGO 2026 – ' + titleEl.textContent.trim();
            const url   = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
                + '&text='     + encodeURIComponent(title)
                + '&dates='    + start + '/' + end
                + '&location=' + encodeURIComponent(location)
                + '&details='  + encodeURIComponent('Cukrownia Żnin • VII Zlot Durango 2026');

            const btn = document.createElement('button');
            btn.className = 'cal-btn';
            btn.setAttribute('aria-label', 'Dodaj do kalendarza');
            btn.textContent = '📅 Dodaj do kalendarza';
            btn.addEventListener('click', () => window.open(url, '_blank'));
            contentEl.appendChild(btn);
        });
    });
}

initCalendarButtons();

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
