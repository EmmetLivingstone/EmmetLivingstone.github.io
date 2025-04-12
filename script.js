document.addEventListener('DOMContentLoaded', function() {
    // Check if on landing page and add class to body to prevent scrolling
    const isLandingPage = document.getElementById('article-showcase').classList.contains('active');
    if (isLandingPage) {
        document.body.classList.add('landing-page');
    } else {
        document.body.classList.remove('landing-page');
    }
    
    // Center the carousel in the landing page
    if (isLandingPage) {
        const showcase = document.getElementById('article-showcase');
        showcase.style.display = 'flex';
        showcase.style.alignItems = 'center';
        showcase.style.justifyContent = 'center';
        showcase.style.height = '100vh';
        showcase.style.overflow = 'hidden';
    }
    
    // Initialize carousel
    initArticleCarousel();
    
    // Fix pagination dots immediately on page load
    setTimeout(() => {
        document.querySelectorAll('.pagination-dot').forEach(dot => {
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.margin = '0';
        });
    }, 100);
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.sidebar-nav a, .home-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => {
                if (l.classList.contains('home-link')) return; // Skip home link styling
                l.classList.remove('active');
            });
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            if (!this.classList.contains('home-link')) {
                this.classList.add('active');
            }
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Update URL hash
            window.location.hash = this.getAttribute('href');
            
            // Add or remove landing-page class based on section
            if (sectionId === 'article-showcase') {
                document.body.classList.add('landing-page');
                const showcase = document.getElementById('article-showcase');
                showcase.style.display = 'flex';
                showcase.style.alignItems = 'center';
                showcase.style.justifyContent = 'center';
                showcase.style.height = '100vh';
                showcase.style.overflow = 'hidden';
            } else {
                document.body.classList.remove('landing-page');
                document.getElementById('article-showcase').style.height = '';
                document.getElementById('article-showcase').style.overflow = '';
                document.getElementById('article-showcase').style.display = 'none';
            }
            
            // Fix pagination dots after nav change
            setTimeout(() => {
                document.querySelectorAll('.pagination-dot').forEach(dot => {
                    dot.style.width = '6px';
                    dot.style.height = '6px';
                    dot.style.margin = '0';
                });
            }, 100);
        });
    });
    
    // Handle direct URL access with hash
    if(window.location.hash) {
        const hash = window.location.hash;
        const targetLink = document.querySelector(`a[href="${hash}"]`);
        if(targetLink) {
            targetLink.click();
        }
    }
    
    // Handle all types of dropdowns
    const allDropdowns = document.querySelectorAll('.dropdown-button, .publication-dropdown, .dropdown-title');
    
    allDropdowns.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            // Toggle the expanded class
            this.classList.toggle('expanded');
            targetElement.classList.toggle('expanded');
        });
    });

    // Initialize audio players
    initFallbackDurations();
});

// Article Carousel Functionality
function initArticleCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const paginationContainer = document.querySelector('.carousel-pagination');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let autoplayInterval;
    
    // Create pagination dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        dot.style.width = '6px';
        dot.style.height = '6px';
        dot.style.margin = '0';
        
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            moveToSlide(index);
            resetAutoplay();
        });
        paginationContainer.appendChild(dot);
    });
    
    // Mark the initial slide as active
    slides[0].classList.add('active');
    
    // Update pagination dots and slide active states
    function updateIndicators() {
        // Update pagination dots
        const dots = document.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update slide active state
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }
    
    // Move to specific slide
    function moveToSlide(targetIndex) {
        if (targetIndex < 0) {
            targetIndex = slides.length - 1;
        } else if (targetIndex >= slides.length) {
            targetIndex = 0;
        }
        
        // Get the width dynamically in case of window resizing
        const slideWidth = slides[0].getBoundingClientRect().width;
        
        currentIndex = targetIndex;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        updateIndicators();
    }
    
    // Autoplay functionality
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            moveToSlide(currentIndex + 1);
        }, 5000); // Change slide every 5 seconds
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Minimum swipe distance
        
        if (Math.abs(diff) < threshold) return;
        
        if (diff > 0) {
            // Swiped left - go to next slide
            moveToSlide(currentIndex + 1);
        } else {
            // Swiped right - go to previous slide
            moveToSlide(currentIndex - 1);
        }
        
        resetAutoplay();
    }
    
    // Pause autoplay when hovering over carousel
    track.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });
    
    track.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Start autoplay
    startAutoplay();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newSlideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * newSlideWidth}px)`;
            
            // Reapply fixed styles after resize
            document.querySelectorAll('.pagination-dot').forEach(dot => {
                dot.style.width = '6px';
                dot.style.height = '6px';
                dot.style.margin = '0';
            });
        }, 200);
    });
}

// Audio player functionality
let currentAudio = null;
let currentButton = null;
let currentProgressBar = null;
let currentTimeDisplay = null;
let updateInterval = null;
let fallbackDurations = {};

function initFallbackDurations() {
    // Store fallback durations for each player
    document.querySelectorAll('.inline-player').forEach(player => {
        const timeDisplay = player.querySelector('.time-display');
        if (timeDisplay) {
            const text = timeDisplay.textContent;
            const duration = text.split(' / ')[1];
            const audioSrc = player.getAttribute('data-audio');
            fallbackDurations[audioSrc] = duration;
        }
    });
}

function toggleAudio(button) {
    const player = button.closest('.inline-player');
    const audioSrc = player.getAttribute('data-audio');
    const progressBar = player.querySelector('.progress-bar');
    const timeDisplay = player.querySelector('.time-display');
    const originalDuration = fallbackDurations[audioSrc];
    
    // If we're already playing this audio
    if (currentAudio && currentButton === button) {
        if (currentAudio.paused) {
            // Resume playing
            currentAudio.play().catch(e => {
                console.error("Error playing audio:", e);
                // If there's an error, still show the play icon
                updatePlayIcon(button, false);
            });
            updatePlayIcon(button, true);
        } else {
            // Pause
            currentAudio.pause();
            updatePlayIcon(button, false);
        }
        return;
    }
    
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        updatePlayIcon(currentButton, false);
        currentProgressBar.style.width = '0%';
        const prevPlayer = currentButton.closest('.inline-player');
        const prevAudioSrc = prevPlayer.getAttribute('data-audio');
        const prevOriginalDuration = fallbackDurations[prevAudioSrc];
        currentTimeDisplay.textContent = `0:00 / ${prevOriginalDuration}`;
        clearInterval(updateInterval);
    }
    
    // Create new audio
    const audio = new Audio(audioSrc);
    let durationSet = false;
    
    audio.addEventListener('loadedmetadata', function() {
        if (isFinite(audio.duration)) {
            const duration = formatTime(audio.duration);
            timeDisplay.textContent = `0:00 / ${duration}`;
            durationSet = true;
        }
    });
    
    audio.addEventListener('error', function(e) {
        console.error("Audio error:", e);
        // Use the original time display on error
        timeDisplay.textContent = `0:00 / ${originalDuration}`;
        updatePlayIcon(button, false);
    });
    
    audio.addEventListener('ended', function() {
        updatePlayIcon(button, false);
        progressBar.style.width = '0%';
        timeDisplay.textContent = `0:00 / ${originalDuration}`;
        clearInterval(updateInterval);
    });
    
    // Play the audio
    audio.play().catch(e => {
        console.error("Error playing audio:", e);
        // If there's an error, still update the display
        updatePlayIcon(button, false);
        // Use the original time
        timeDisplay.textContent = `0:00 / ${originalDuration}`;
    });
    
    updatePlayIcon(button, true);
    
    // Set up progress updating
    updateInterval = setInterval(() => {
        if (!audio.paused) {
            if (isFinite(audio.duration)) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
                timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${durationSet ? formatTime(audio.duration) : originalDuration}`;
            } else {
                // If duration is not available, simulate progress
                const fakeDuration = parseTime(originalDuration);
                const percent = Math.min((audio.currentTime / fakeDuration) * 100, 100);
                progressBar.style.width = `${percent}%`;
                timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${originalDuration}`;
            }
        }
    }, 100);
    
    // Store references to current playing elements
    currentAudio = audio;
    currentButton = button;
    currentProgressBar = progressBar;
    currentTimeDisplay = timeDisplay;
}

function seek(event, progressContainer) {
    if (!currentAudio) return;
    
    const bounds = progressContainer.getBoundingClientRect();
    const percent = (event.clientX - bounds.left) / bounds.width;
    
    const player = progressContainer.closest('.inline-player');
    const audioSrc = player.getAttribute('data-audio');
    const originalDuration = fallbackDurations[audioSrc];
    
    if (isFinite(currentAudio.duration)) {
        currentAudio.currentTime = percent * currentAudio.duration;
    } else {
        // If duration is not available, use the original time string
        currentAudio.currentTime = percent * parseTime(originalDuration);
    }
    
    // Update progress bar and time display
    currentProgressBar.style.width = `${percent * 100}%`;
    currentTimeDisplay.textContent = `${formatTime(currentAudio.currentTime)} / ${originalDuration}`;
}

function updatePlayIcon(button, isPlaying) {
    if (isPlaying) {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="#333"></rect><rect x="14" y="4" width="4" height="16" fill="#333"></rect></svg>';
    } else {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="#333"></polygon></svg>';
    }
}

function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function parseTime(timeString) {
    // Parse a time string like "3:45" into seconds
    try {
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const mins = parseInt(parts[0], 10);
            const secs = parseInt(parts[1], 10);
            if (isFinite(mins) && isFinite(secs)) {
                return mins * 60 + secs;
            }
        }
    } catch (e) {
        console.error("Error parsing time:", e);
    }
    return 180; // Fallback to 3 minutes
}
