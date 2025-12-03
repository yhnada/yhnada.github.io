// 1. Efficient Particle Generator (Reduced count for performance)
const particlesContainer = document.getElementById('particles');
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 10 : 20; // Reduced from 30

if (particlesContainer) {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 60 + 20; // Slightly smaller
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 20}s;
            animation-duration: ${Math.random() * 10 + 15}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// 2. Optimized Cursor Glow (Disabled on mobile/touch devices)
const glow = document.querySelector('.cursor-glow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let glowAnimationId = null;

// Only enable on non-touch devices
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (glow && !hasTouch && !isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08; // Slightly slower for smoother effect
        glowY += (mouseY - glowY) * 0.08;
        glow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;
        glowAnimationId = requestAnimationFrame(animateGlow);
    }
    animateGlow();
    
    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && glowAnimationId) {
            cancelAnimationFrame(glowAnimationId);
        } else if (!document.hidden) {
            animateGlow();
        }
    });
} else if (glow) {
    // Hide cursor glow on mobile
    glow.style.display = 'none';
}

// 3. Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// 4. Navbar Scroll Effect (Throttled for performance)
const nav = document.getElementById('nav');
let lastScrollY = 0;
let ticking = false;

function updateNav() {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
    }
}, { passive: true });

// 5. Intersection Observer for Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Unobserve after triggering to prevent re-animating
            // observer.unobserve(entry.target); 
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.stats-grid, .section-header, .feature-card, .timeline-item, .comparison-container, .form-container, .faq-item').forEach(el => observer.observe(el));

// 6. Number Counter
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.ceil(current);
                    }
                }, 30);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

// 7. Ripple Effect
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});
// 8. Form Wizard Logic
const form = document.getElementById('startupForm');
if (form) {
    let currentStep = 1;
    const totalSteps = 4;

    // Next Button
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            // Simple validation
            const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.style.borderColor = 'var(--primary-pink)';
                } else {
                    input.style.borderColor = 'rgba(255,255,255,0.1)';
                }
            });

            if (isValid) {
                currentStep++;
                updateFormStep();
            }
        });
    });

    // Prev Button
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateFormStep();
        });
    });

    function updateFormStep() {
        // Update Steps UI
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Update Progress Bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        // Update Indicators
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            if (stepNum < currentStep) step.classList.add('completed');
        });
    }

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('startupForm').style.display = 'none';
        document.querySelector('.form-progress').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';

        // Set success date
        const date = document.getElementById('selectedDate').value || 'Next Monday';
        document.getElementById('successDate').textContent = date;

        // Confetti
        createConfetti();
    });
}

// 9. File Upload Visuals
const fileUpload = document.getElementById('fileUpload');
if (fileUpload) {
    const input = document.getElementById('pitchDeck');
    const fileName = document.getElementById('fileName');

    fileUpload.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            fileName.textContent = '✓ ' + input.files[0].name;
            fileUpload.style.borderColor = 'var(--primary-pink)';
        }
    });

    // Drag & Drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.style.background = 'rgba(255,255,255,0.1)';
    });

    fileUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUpload.style.background = 'rgba(255,255,255,0.05)';
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.style.background = 'rgba(255,255,255,0.05)';
        if (e.dataTransfer.files.length > 0) {
            input.files = e.dataTransfer.files;
            fileName.textContent = '✓ ' + input.files[0].name;
            fileUpload.style.borderColor = 'var(--primary-pink)';
        }
    });
}

// 10. Calendar Logic
const calendar = document.getElementById('calendar');
if (calendar) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Generate Header
    days.forEach(day => {
        const el = document.createElement('div');
        el.style.textAlign = 'center';
        el.style.fontSize = '12px';
        el.style.color = 'var(--text-secondary)';
        el.textContent = day;
        calendar.appendChild(el);
    });

    // Generate Days (Simple 30 days from today)
    for (let i = 0; i < 28; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = date.getDate();

        el.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            el.classList.add('selected');
            document.getElementById('selectedDate').value = date.toDateString();

            // Show Time Slots
            const timeSlots = document.getElementById('timeSlots');
            timeSlots.style.display = 'grid';
            timeSlots.innerHTML = '';
            ['09:00', '11:00', '14:00', '16:00'].forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = time;
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                    slot.classList.add('selected');
                    document.getElementById('selectedTime').value = time;
                });
                timeSlots.appendChild(slot);
            });
        });

        calendar.appendChild(el);
    }
}

// 11. FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});

// 12. Confetti
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = ['#E11D48', '#07196E', '#ffffff'][Math.floor(Math.random() * 3)];
        confetti.style.animation = `float ${Math.random() * 3 + 2}s linear`;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// 13. Investor Form Wizard Logic
const investorForm = document.getElementById('investorForm');
if (investorForm) {
    let currentStep = 1;
    const totalSteps = 4;

    // Next Button
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value && input.type !== 'radio') {
                    isValid = false;
                    input.style.borderColor = 'var(--primary-pink)';
                } else {
                    input.style.borderColor = 'rgba(255,255,255,0.1)';
                }
            });

            // Check radio buttons separately
            const radioGroups = currentStepEl.querySelectorAll('input[type="radio"][required]');
            if (radioGroups.length > 0) {
                const radioName = radioGroups[0].name;
                const checked = currentStepEl.querySelector(`input[name="${radioName}"]:checked`);
                if (!checked) {
                    isValid = false;
                }
            }

            if (isValid) {
                currentStep++;
                updateInvestorFormStep();
            }
        });
    });

    // Prev Button
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateInvestorFormStep();
        });
    });

    function updateInvestorFormStep() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            if (stepNum < currentStep) step.classList.add('completed');
        });
    }

    // Form Submit
    investorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('investorForm').style.display = 'none';
        document.querySelector('.form-progress').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';

        const date = document.getElementById('selectedDate').value || 'within 24 hours';
        document.getElementById('successDate').textContent = date;

        createConfetti();
    });
}

// 14. Parallax Deal Flow Effect (Throttled)
const dealFlowTrack = document.getElementById('dealFlowTrack');
if (dealFlowTrack) {
    const dealFlowSection = document.querySelector('.deal-flow-section');
    let parallaxTicking = false;
    
    function updateParallax() {
        const rect = dealFlowSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Check if section is in view
        if (rect.top < windowHeight && rect.bottom > 0) {
            const sectionStart = rect.top - windowHeight;
            const sectionEnd = rect.bottom;
            const scrollProgress = Math.abs(sectionStart) / (Math.abs(sectionStart) + sectionEnd);
            
            const maxMove = dealFlowTrack.scrollWidth - dealFlowTrack.parentElement.offsetWidth;
            const moveX = scrollProgress * maxMove * 0.8;
            
            dealFlowTrack.style.transform = `translateX(-${moveX}px)`;
            
            // Update card visuals (optimized - only update visible cards)
            const cards = dealFlowTrack.querySelectorAll('.startup-card');
            const containerCenter = dealFlowTrack.parentElement.offsetWidth / 2;
            
            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                // Only process cards that are potentially visible
                if (cardRect.right > 0 && cardRect.left < windowHeight) {
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    const distanceFromCenter = Math.abs(containerCenter - cardCenter);
                    const maxDistance = containerCenter;
                    const opacity = 1 - (distanceFromCenter / maxDistance) * 0.5;
                    const scale = 1 - (distanceFromCenter / maxDistance) * 0.15;
                    
                    card.style.opacity = Math.max(0.5, opacity);
                    card.style.transform = `scale(${Math.max(0.85, scale)})`;
                }
            });
        }
        parallaxTicking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    }, { passive: true });
}// 15. Observe Testimonial Cards
document.querySelectorAll('.testimonial-card').forEach(el => observer.observe(el));
