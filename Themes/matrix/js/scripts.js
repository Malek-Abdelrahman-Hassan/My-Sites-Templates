/* ============================================
   MALEK ABDELRAHMAN — Matrix Theme Scripts
   Universal behaviors + custom falling-glyph "code rain"
   replacing the standard particle canvas.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // 1. MATRIX CODE RAIN (custom canvas)
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        const glyphs = 'アイウエオカキクケコサシスセソタチツテトﾅﾆﾇﾈﾉ0123456789ABCDEF<>/{}[]=+*$#'.split('');
        let columns, drops, fontSize, animationId, lastTime = 0;

        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            fontSize = isMobile ? 12 : 16;
            columns = Math.floor(canvas.width / fontSize);
            drops = new Array(columns).fill(0).map(() => Math.random() * -100);
        };
        setup();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(setup, 250);
        });

        const draw = (time) => {
            animationId = requestAnimationFrame(draw);
            if (time - lastTime < 45) return; // throttle ~22fps for the rain trail
            lastTime = time;

            ctx.fillStyle = 'rgba(0, 6, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + "px 'Share Tech Mono', monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = glyphs[Math.floor(Math.random() * glyphs.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                // bright leading glyph
                ctx.fillStyle = Math.random() > 0.975 ? '#c8ffd4' : '#00ff66';
                ctx.fillText(text, x, y);
                if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        animationId = requestAnimationFrame(draw);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(animationId);
            else animationId = requestAnimationFrame(draw);
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
            if (isDeleting) { typingText.textContent = current.substring(0, charIndex - 1); charIndex--; typeSpeed = 40; }
            else { typingText.textContent = current.substring(0, charIndex + 1); charIndex++; typeSpeed = 80; }
            if (!isDeleting && charIndex === current.length) { typeSpeed = 2000; isDeleting = true; }
            else if (isDeleting && charIndex === 0) { isDeleting = false; titleIndex = (titleIndex + 1) % titles.length; typeSpeed = 500; }
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
                entry.target.style.width = entry.target.getAttribute('data-width') + '%';
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
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
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
                    if (response.ok) { btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>'; contactForm.reset(); }
                    else { btn.innerHTML = '<span>Error — Try Again</span><i class="fas fa-exclamation-triangle"></i>'; }
                })
                .catch(() => { btn.innerHTML = '<span>Error — Try Again</span><i class="fas fa-exclamation-triangle"></i>'; })
                .finally(() => { setTimeout(() => { btn.innerHTML = originalContent; btn.disabled = false; }, 3000); });
        });
    }

    // ==========================================
    // 10. GLITCH ON HOVER (headings)
    // ==========================================
    if (!isTouch) {
        document.querySelectorAll('.hero-name, .section-title').forEach(el => {
            el.dataset.text = el.textContent;
        });
    }

});
