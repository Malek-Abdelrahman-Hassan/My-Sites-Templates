/* ============================================
   MALEK ABDELRAHMAN — Universal Theme Scripts
   Shared across all theme variants. Effects are
   feature-detected, so light themes that omit the
   canvas / cursor glow simply skip those parts.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // ==========================================
    // 1. PARTICLE CANVAS (only if present & visible)
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas && getComputedStyle(canvas).display !== 'none') {
        const ctx = canvas.getContext('2d');
        const rgb = (document.body.dataset.particle || '255,255,255').trim();
        let particles = [];
        let mouse = { x: null, y: null };
        let animationId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 250);
        });

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (!isTouch && mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        this.x -= dx * force * 0.01;
                        this.y -= dy * force * 0.01;
                    }
                }
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const maxCount = isMobile ? 30 : 100;
            const count = Math.min(Math.floor((canvas.width * canvas.height) / (isMobile ? 25000 : 12000)), maxCount);
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }

        function connectParticles() {
            const maxDist = isMobile ? 80 : 120;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        const opacity = (1 - dist / maxDist) * 0.12;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            connectParticles();
            animationId = requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        if (!isTouch) {
            document.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(animationId);
            else animateParticles();
        });
    }

    // ==========================================
    // 2. CURSOR GLOW (only if present)
    // ==========================================
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        if (!isTouch) {
            document.addEventListener('mousemove', (e) => {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            });
        } else {
            cursorGlow.style.display = 'none';
        }
    }

    // ==========================================
    // 3. NAVBAR SCROLL + SCROLL PROGRESS + ACTIVE NAV
    // ==========================================
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateScrollProgress() {
        if (!scrollProgress) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = pct + '%';
    }

    function updateActiveNav() {
        const scrollY = window.pageYOffset + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                });
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (navbar) navbar.classList.toggle('scrolled', window.pageYOffset > 50);
                updateActiveNav();
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateScrollProgress();
    updateActiveNav();

    // ==========================================
    // 4. MOBILE NAV TOGGLE + OVERLAY
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function closeMobileNav() {
        if (navToggle) navToggle.classList.remove('active');
        if (navLinksContainer) navLinksContainer.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openMobileNav() {
        if (navToggle) navToggle.classList.add('active');
        if (navLinksContainer) navLinksContainer.classList.add('open');
        if (navOverlay) navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('open')) closeMobileNav();
            else openMobileNav();
        });
    }
    if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
    if (navLinksContainer) {
        navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });

    // ==========================================
    // 5. TYPING EFFECT
    // ==========================================
    const typingText = document.getElementById('typingText');
    if (typingText) {
        const titles = [
            'Software Development Engineer',
            'Autonomous Vehicle SW Tester',
            'Embedded Systems Engineer',
            'Web Developer & Freelancer',
            'I Build Client Web Experiences',
            'Engineer & Future Builder',
            'Aspiring Entrepreneur',
            'Lifelong Learner'
        ];
        let titleIndex = 0, charIndex = 0, isDeleting = false, typeSpeed = 80;
        function typeEffect() {
            const current = titles[titleIndex];
            if (isDeleting) {
                typingText.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 40;
            } else {
                typingText.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 80;
            }
            if (!isDeleting && charIndex === current.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
                typeSpeed = 500;
            }
            setTimeout(typeEffect, typeSpeed);
        }
        typeEffect();
    }

    // ==========================================
    // 6. SCROLL REVEAL
    // ==========================================
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('.scroll-reveal');
                let delay = 0;
                siblings.forEach((sib, i) => { if (sib === entry.target) delay = Math.min(i * 80, 400); });
                setTimeout(() => { entry.target.classList.add('revealed'); }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    scrollRevealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 7. ANIMATED SKILL BARS
    // ==========================================
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                entry.target.classList.add('animated');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    skillFills.forEach(fill => skillObserver.observe(fill));

    // ==========================================
    // 8. SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // 9. CONTACT FORM HANDLER
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('.btn-submit');
            const originalContent = btn.innerHTML;
            const formData = new FormData(this);
            btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            fetch(this.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
                .then(response => {
                    if (response.ok) {
                        btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
                        contactForm.reset();
                    } else {
                        btn.innerHTML = '<span>Error — Try Again</span><i class="fas fa-exclamation-triangle"></i>';
                    }
                })
                .catch(() => {
                    btn.innerHTML = '<span>Error — Try Again</span><i class="fas fa-exclamation-triangle"></i>';
                })
                .finally(() => {
                    setTimeout(() => { btn.innerHTML = originalContent; btn.disabled = false; }, 3000);
                });
        });
    }

    // ==========================================
    // 10. MAGNETIC BUTTONS (desktop only)
    // ==========================================
    if (!isTouch) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

});
