document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Update URL hash
            window.location.hash = this.getAttribute('href');
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
    
    // Publication nav functionality for the two-column layout
    const pubNavLinks = document.querySelectorAll('.publication-nav-link');
    
    if (pubNavLinks.length > 0) {
        // Function to update active publication
        function updateActivePublication() {
            // Get current scroll position
            const scrollPosition = window.scrollY + 100; // Add offset for better UX
            
            // Find which section is currently in view
            const articleSections = document.querySelectorAll('.article-section');
            let currentSection = null;
            
            articleSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = section;
                }
            });
            
            // If we found a section in view, update the active link
            if (currentSection) {
                const sectionId = currentSection.id;
                
                // Remove active class from all links
                pubNavLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to the corresponding link
                const activeLink = document.querySelector(`.publication-nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        }
        
        // Initial update
        updateActivePublication();
        
        // Update on scroll
        window.addEventListener('scroll', updateActivePublication);
        
        // Handle click on publication links
        pubNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 40,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});

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