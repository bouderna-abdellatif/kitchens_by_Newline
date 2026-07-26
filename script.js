/* ============================================================
   KITCHENS BY NEWLINE — Interactive Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const VERSION_ENDPOINT = 'version.json';
    const LAST_SEEN_VERSION_KEY = 'kitchensByNewline.siteVersion';
    const LAST_AUTO_REFRESH_KEY = 'kitchensByNewline.lastAutoRefreshVersion';

    const forceRefreshForVersion = (version) => {
        const url = new URL(window.location.href);
        url.searchParams.set('v', version);
        window.location.replace(url.toString());
    };

    const checkForDeploymentUpdate = async () => {
        try {
            const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) return;

            const payload = await response.json();
            const deployedVersion = typeof payload.version === 'string' ? payload.version.trim() : '';
            if (!deployedVersion) return;

            const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
            if (!lastSeenVersion) {
                localStorage.setItem(LAST_SEEN_VERSION_KEY, deployedVersion);
                return;
            }

            if (lastSeenVersion !== deployedVersion) {
                localStorage.setItem(LAST_SEEN_VERSION_KEY, deployedVersion);
                const lastAutoRefreshVersion = localStorage.getItem(LAST_AUTO_REFRESH_KEY);

                if (lastAutoRefreshVersion !== deployedVersion) {
                    localStorage.setItem(LAST_AUTO_REFRESH_KEY, deployedVersion);
                    forceRefreshForVersion(deployedVersion);
                }
            }
        } catch (error) {
            // Keep silent: failed checks should not affect UX.
        }
    };

    checkForDeploymentUpdate();
    setInterval(checkForDeploymentUpdate, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkForDeploymentUpdate();
        }
    });

    // ── Preloader ─────────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 2000);
    });
    // Fallback: hide preloader after 4s regardless
    setTimeout(() => preloader.classList.add('loaded'), 4000);


    // ── Custom Cursor ─────────────────────────────────────────
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();
    }


    // ── Navigation ────────────────────────────────────────────
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu-link');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // ── Smooth Scroll ─────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ── Scroll Reveal Animations ──────────────────────────────
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ── Counter Animation ─────────────────────────────────────
    const counters = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quad
                    const ease = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * ease);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));


    // ── Portfolio Filter ──────────────────────────────────────
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 400);
                }
            });
        });
    });


    // ── Lightbox ──────────────────────────────────────────────
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const portfolioImgs = document.querySelectorAll('.portfolio-img');
    let currentLightboxIndex = 0;
    let lightboxImages = [];

    function openLightbox(index) {
        // Collect visible images
        lightboxImages = [];
        document.querySelectorAll('.portfolio-item:not(.hidden) .portfolio-img img').forEach(img => {
            lightboxImages.push(img.src);
        });
        currentLightboxIndex = index;
        lightboxImg.src = lightboxImages[currentLightboxIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
        lightboxImg.style.opacity = 0;
        setTimeout(() => {
            lightboxImg.src = lightboxImages[currentLightboxIndex];
            lightboxImg.style.opacity = 1;
        }, 200);
    }

    portfolioImgs.forEach((imgContainer, index) => {
        imgContainer.addEventListener('click', () => openLightbox(index));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Lightbox image transition
    lightboxImg.style.transition = 'opacity 0.3s ease';


    // ── Testimonials Slider ───────────────────────────────────
    const track = document.getElementById('testimonialTrack');
    const dots = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let autoplayInterval;

    // Create dots
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('testimonial-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    });

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % cards.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + cards.length) % cards.length);
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    startAutoplay();


    // ── Contact Form ──────────────────────────────────────────
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Message Sent ✓</span>';
        submitBtn.style.background = '#4a7c59';
        submitBtn.style.borderColor = '#4a7c59';

        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            contactForm.reset();
        }, 3000);
    });


    // ── Parallax-like subtle movement on hero ─────────────────
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
            heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
        }
    });

});
