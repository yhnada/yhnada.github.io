// Motion helpers let us skip heavy effects when the user asks for reduced motion.
const particlesContainer = document.getElementById('particles');
const isMobile = window.innerWidth < 768;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = motionQuery.matches;

const updateMotionPreferenceClass = () => {
    if (document.body) {
        document.body.classList.toggle('reduce-motion', reduceMotion);
    }
};

updateMotionPreferenceClass();

const runWhenIdle = (cb) => {
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(cb);
    } else {
        setTimeout(cb, 0);
    }
};

const initParticles = () => {
    if (!particlesContainer) return;
    particlesContainer.innerHTML = '';
    const particleCount = isMobile ? 8 : 16;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 50 + 15;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${Math.random() * 8 + 12}s;
        `;
        fragment.appendChild(particle);
    }

    particlesContainer.appendChild(fragment);
};

const handleMotionPreferenceChange = (event) => {
    reduceMotion = event.matches;
    updateMotionPreferenceClass();

    if (!particlesContainer) return;

    if (reduceMotion) {
        particlesContainer.innerHTML = '';
    } else {
        runWhenIdle(initParticles);
    }
};

if (particlesContainer && !reduceMotion) {
    runWhenIdle(initParticles);
}

if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', handleMotionPreferenceChange);
} else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(handleMotionPreferenceChange);
}

// 2. Optimized Cursor Glow (Disabled on mobile/touch/reduced motion)
const glow = document.querySelector('.cursor-glow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let glowAnimationId = null;

// Only enable on non-touch devices
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (glow && !hasTouch && !isMobile && !reduceMotion) {
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
const supportsIntersectionObserver = 'IntersectionObserver' in window;
const animateObserver = supportsIntersectionObserver ? new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }) : null;

const animatedElements = document.querySelectorAll('.stats-grid, .section-header, .feature-card, .timeline-item, .comparison-container, .form-container, .faq-item');
if (animatedElements.length) {
    const watchAnimatedElements = () => {
        if (animateObserver) {
            animatedElements.forEach(el => animateObserver.observe(el));
        } else {
            animatedElements.forEach(el => el.classList.add('visible'));
        }
    };
    runWhenIdle(watchAnimatedElements);
}

// 6. Number Counter (requestAnimationFrame for smoother updates)
const animateCounters = (section) => {
    const counters = section.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        if (Number.isNaN(target)) return;

        const duration = 1200;
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = target * progress;
            counter.textContent = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    });
};

const statsSection = document.getElementById('stats');
if (statsSection) {
    if (supportsIntersectionObserver) {
        const statsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    } else {
        animateCounters(statsSection);
    }
}

// 7. Ripple Effect (delegated to avoid many listeners)
document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled || button.classList.contains('no-ripple')) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
    }
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});
// 8. Form Wizard Logic
const form = document.getElementById('startupForm');
if (form) {
    let currentStep = 1;
    const formSteps = form.querySelectorAll('.form-step');
    const totalSteps = formSteps.length;
    const formWrapper = form.closest('.form-container') || document;
    const progressFill = formWrapper.querySelector('#progressFill');
    const stepsIndicator = formWrapper.querySelectorAll('.step');
    const formProgress = formWrapper.querySelector('.form-progress');
    const successMessage = formWrapper.querySelector('#formSuccess');

    const updateFormStep = () => {
        formSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step, 10);
            step.classList.toggle('active', stepNum === currentStep);
        });

        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        stepsIndicator.forEach(step => {
            const stepNum = parseInt(step.dataset.step, 10);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            if (stepNum < currentStep) step.classList.add('completed');
        });
    };

    const validateCurrentStep = () => {
        const currentStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (!currentStepEl) return true;
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

        return isValid;
    };

    form.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep >= totalSteps) return;
            if (validateCurrentStep()) {
                currentStep++;
                updateFormStep();
            }
        });
    });

    form.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep <= 1) return;
            currentStep--;
            updateFormStep();
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.style.display = 'none';
        if (formProgress) formProgress.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';

        const selectedDateInput = document.getElementById('selectedDate');
        const successDate = document.getElementById('successDate');
        if (successDate) {
            successDate.textContent = (selectedDateInput && selectedDateInput.value) ? selectedDateInput.value : 'Next Monday';
        }

        createConfetti();
    });

    updateFormStep();
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
    const selectedDateInput = document.getElementById('selectedDate');
    const selectedTimeInput = document.getElementById('selectedTime');
    const timeSlots = document.getElementById('timeSlots');
    const slotTimes = ['09:00', '11:00', '14:00', '16:00'];
    let activeCalendarDay = null;
    let activeTimeSlot = null;

    const headerFragment = document.createDocumentFragment();
    days.forEach(day => {
        const el = document.createElement('div');
        el.style.textAlign = 'center';
        el.style.fontSize = '12px';
        el.style.color = 'var(--text-secondary)';
        el.textContent = day;
        headerFragment.appendChild(el);
    });
    calendar.appendChild(headerFragment);

    const renderTimeSlots = () => {
        if (!timeSlots) return;
        timeSlots.style.display = 'grid';
        timeSlots.innerHTML = '';
        const fragment = document.createDocumentFragment();

        slotTimes.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            slot.addEventListener('click', () => {
                if (activeTimeSlot) activeTimeSlot.classList.remove('selected');
                activeTimeSlot = slot;
                slot.classList.add('selected');
                if (selectedTimeInput) {
                    selectedTimeInput.value = time;
                }
            });
            fragment.appendChild(slot);
        });

        timeSlots.appendChild(fragment);
    };

    const calendarFragment = document.createDocumentFragment();
    for (let i = 0; i < 28; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = date.getDate();
        el.dataset.fullDate = date.toDateString();

        el.addEventListener('click', () => {
            if (activeCalendarDay) activeCalendarDay.classList.remove('selected');
            activeCalendarDay = el;
            el.classList.add('selected');

            if (selectedDateInput) {
                selectedDateInput.value = el.dataset.fullDate;
            }

            if (selectedTimeInput) {
                selectedTimeInput.value = '';
            }

            activeTimeSlot = null;
            renderTimeSlots();
        });

        calendarFragment.appendChild(el);
    }

    calendar.appendChild(calendarFragment);
}

// 11. FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});

// 12. Confetti
function createConfetti() {
    if (reduceMotion || !document.body) return;
    const fragment = document.createDocumentFragment();
    const colors = ['#E11D48', '#07196E', '#ffffff'];

    for (let i = 0; i < 35; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `float ${Math.random() * 3 + 2}s linear`;
        fragment.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4500);
    }

    document.body.appendChild(fragment);
}

// 13. Investor Form Wizard Logic
const investorForm = document.getElementById('investorForm');
if (investorForm) {
    let currentStep = 1;
    const formSteps = investorForm.querySelectorAll('.form-step');
    const totalSteps = formSteps.length;
    const formWrapper = investorForm.closest('.form-container') || document;
    const progressFill = formWrapper.querySelector('#progressFill');
    const stepsIndicator = formWrapper.querySelectorAll('.step');
    const formProgress = formWrapper.querySelector('.form-progress');
    const successMessage = formWrapper.querySelector('#formSuccess');

    const updateInvestorFormStep = () => {
        formSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step, 10);
            step.classList.toggle('active', stepNum === currentStep);
        });

        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        stepsIndicator.forEach(step => {
            const stepNum = parseInt(step.dataset.step, 10);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            if (stepNum < currentStep) step.classList.add('completed');
        });
    };

    const validateInvestorStep = () => {
        const currentStepEl = investorForm.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (!currentStepEl) return true;

        let isValid = true;
        const inputs = currentStepEl.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.style.borderColor = 'var(--primary-pink)';
            } else {
                input.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        });

        const radioGroups = currentStepEl.querySelectorAll('input[type="radio"][required]');
        if (radioGroups.length) {
            const names = [...new Set(Array.from(radioGroups).map(radio => radio.name))];
            names.forEach(name => {
                if (!currentStepEl.querySelector(`input[name="${name}"]:checked`)) {
                    isValid = false;
                }
            });
        }

        return isValid;
    };

    investorForm.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep >= totalSteps) return;
            if (validateInvestorStep()) {
                currentStep++;
                updateInvestorFormStep();
            }
        });
    });

    investorForm.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep <= 1) return;
            currentStep--;
            updateInvestorFormStep();
        });
    });

    investorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        investorForm.style.display = 'none';
        if (formProgress) formProgress.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';

        const dateInput = document.getElementById('selectedDate');
        const successDate = document.getElementById('successDate');
        if (successDate) {
            successDate.textContent = (dateInput && dateInput.value) ? dateInput.value : 'within 24 hours';
        }

        createConfetti();
    });

    updateInvestorFormStep();
}

// 14. Parallax Deal Flow Effect (Throttled)
const dealFlowTrack = document.getElementById('dealFlowTrack');
if (dealFlowTrack) {
    const dealFlowSection = document.querySelector('.deal-flow-section');
    const dealFlowWrapper = dealFlowTrack.parentElement;

    if (dealFlowSection && dealFlowWrapper) {
        const dealFlowCards = Array.from(dealFlowTrack.querySelectorAll('.startup-card'));
        let parallaxTicking = false;
        let maxMove = 0;

        const recalcParallaxMetrics = () => {
            const wrapperWidth = dealFlowWrapper.offsetWidth;
            maxMove = Math.max(0, dealFlowTrack.scrollWidth - wrapperWidth);
        };

        recalcParallaxMetrics();
        window.addEventListener('resize', recalcParallaxMetrics);

        function updateParallax() {
            const rect = dealFlowSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Check if section is in view
            if (rect.top < windowHeight && rect.bottom > 0) {
                const sectionStart = rect.top - windowHeight;
                const sectionEnd = rect.bottom;
                const scrollProgress = Math.abs(sectionStart) / (Math.abs(sectionStart) + sectionEnd);

                const moveX = scrollProgress * maxMove * 0.8;
                dealFlowTrack.style.transform = `translate3d(-${moveX}px, 0, 0)`;

                const wrapperRect = dealFlowWrapper.getBoundingClientRect();
                const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
                const maxDistance = wrapperRect.width / 2 || 1;
                const viewportWidth = window.innerWidth;

                dealFlowCards.forEach(card => {
                    const cardRect = card.getBoundingClientRect();
                    // Only process cards that are potentially visible horizontally
                    if (cardRect.right > 0 && cardRect.left < viewportWidth) {
                        const cardCenter = cardRect.left + cardRect.width / 2;
                        const distanceFromCenter = Math.abs(wrapperCenter - cardCenter);
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

        updateParallax();
    }
}

// 15. Observe Testimonial Cards
const testimonialCards = document.querySelectorAll('.testimonial-card');
if (testimonialCards.length) {
    if (animateObserver) {
        testimonialCards.forEach(el => animateObserver.observe(el));
    } else {
        testimonialCards.forEach(el => el.classList.add('visible'));
    }
}
