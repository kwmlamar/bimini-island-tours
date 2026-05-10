/* ============================================================
   BIMINI ISLAND TOURS — Premium Script
   GSAP + ScrollTrigger · Light Theme Edition
   UI/UX Pro Max: touch targets, reduced motion, accessibility
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── MOBILE MENU ─────────────────────────────────────────
    const hamburger  = document.getElementById('hamburger');
    const mobMenu    = document.getElementById('mobMenu');
    const mobOverlay = document.getElementById('mobOverlay');
    const mobClose   = document.getElementById('mobClose');

    function openMenu() {
        mobMenu?.classList.add('is-open');
        mobOverlay?.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        hamburger?.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
        mobMenu?.classList.remove('is-open');
        mobOverlay?.classList.remove('is-open');
        document.body.style.overflow = '';
        hamburger?.setAttribute('aria-expanded', 'false');
    }

    hamburger?.addEventListener('click', openMenu);
    mobClose?.addEventListener('click', closeMenu);
    mobOverlay?.addEventListener('click', closeMenu);
    document.querySelectorAll('.mob-links a').forEach(a => a.addEventListener('click', closeMenu));


    // ── BOOKING FORM — URL pre-selection ────────────────────
    // (index.html CTA buttons use ?tour= to pre-select on booking.html)
    const tourParam  = new URLSearchParams(window.location.search).get('tour');
    const tourSelect = document.getElementById('tourSelect');
    if (tourParam && tourSelect) {
        for (let opt of tourSelect.options) {
            if (opt.value === tourParam) { tourSelect.value = tourParam; break; }
        }
    }


    // ── GALLERY — Lightbox ───────────────────────────────────
    if (document.getElementById('galleryGrid')) {
        const lightbox        = document.getElementById('lightbox');
        const lightboxImg     = document.getElementById('lightboxImg');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose   = document.getElementById('lightboxClose');
        const lightboxPrev    = document.getElementById('lightboxPrev');
        const lightboxNext    = document.getElementById('lightboxNext');

        const items = Array.from(document.querySelectorAll('.gitem[data-src]'));
        let currentIndex = 0;

        function openLightbox(idx) {
            currentIndex = idx;
            lightboxImg.src = items[idx].dataset.src;
            lightboxImg.alt = items[idx].querySelector('img').alt;
            lightboxCaption.textContent = items[idx].dataset.caption || '';
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            openLightbox(currentIndex);
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % items.length;
            openLightbox(currentIndex);
        }

        items.forEach((item, idx) => {
            item.addEventListener('click', () => openLightbox(idx));
        });

        lightboxClose?.addEventListener('click', closeLightbox);
        lightboxPrev?.addEventListener('click', showPrev);
        lightboxNext?.addEventListener('click', showNext);

        lightbox?.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox?.classList.contains('is-open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }


    // ── GSAP SETUP ──────────────────────────────────────────
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Reduced-motion: skip all GSAP if user prefers it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Still run nav scroll listener
        window.addEventListener('scroll', navScroll, { passive: true });
        return;
    }


    // ── PROGRESS BAR ────────────────────────────────────────
    gsap.to('#progress-bar', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0
        }
    });


    // ── NAV — scrolled class on scroll ──────────────────────
    const navbar = document.getElementById('navbar');

    function navScroll() {
        navbar?.classList.toggle('scrolled', window.scrollY > 80);
    }
    window.addEventListener('scroll', navScroll, { passive: true });


    // ── SECTION LABEL — vertical indicator ──────────────────
    const sectionLabel = document.getElementById('section-label');
    if (sectionLabel) {
        const sections = [
            { sel: '#home',        label: '01 · Bimini'   },
            { sel: '#about',       label: '02 · The Story' },
            { sel: '#tours-preview', label: '03 · Tours'  },
            { sel: '.vtour-section', label: '04 · Experience' },
            { sel: '#max-section', label: '05 · Meet Max'  },
            { sel: '#reviews',     label: '06 · Reviews'   },
            { sel: '.cta-section', label: '07 · Book'      },
        ];
        sections.forEach(({ sel, label }) => {
            const el = document.querySelector(sel);
            if (!el) return;
            ScrollTrigger.create({
                trigger: el,
                start: 'top 55%',
                end: 'bottom 55%',
                onEnter:     () => { sectionLabel.textContent = label; },
                onEnterBack: () => { sectionLabel.textContent = label; },
            });
        });
    }


    // ── HERO — scrub zoom-out on scroll ─────────────────────
    // Scale 1.15 → 1 tied to scroll position (scrub pattern)
    gsap.to('.hero-bg-img', {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.8
        }
    });

    // Hero content fades on scroll — OPACITY ONLY (no y/transform — prevents jump)
    gsap.to('.hero-content', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: '60% top',
            end: 'bottom top',
            scrub: 1
        }
    });

    // Scroll hint fades quickly
    gsap.to('.hero-scroll-hint', {
        opacity: 0, ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '22% top',
            scrub: 1
        }
    });

    // Hero entrance timeline on page load
    const heroTl = gsap.timeline({ delay: 0.25 });
    heroTl
        .from('.hero-eyebrow',     { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' })
        .from('.hero-title',       { y: 32, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.3')
        .from('.hero-sub',         { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
        .from('.hero-actions',     { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .from('.hero-scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.2');


    // Press strip + cred strip — no GSAP (near top of page, always visible)
    // CSS opacity: 1 !important guarantees cred items are always shown


    // ── STORY SECTION — slide from sides ────────────────────
    gsap.from('.story-left', {
        x: -60, opacity: 0, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.story-container', start: 'top 78%', once: true }
    });
    gsap.from('.story-right', {
        x: 60, opacity: 0, duration: 1.1, ease: 'power2.out', delay: 0.15,
        scrollTrigger: { trigger: '.story-container', start: 'top 78%', once: true }
    });

    // Highlight items — stagger up
    ScrollTrigger.batch('.highlight-item', {
        onEnter: (els) => gsap.from(els, {
            y: 36, opacity: 0,
            stagger: 0.1, duration: 0.8, ease: 'power2.out'
        }),
        start: 'top 86%',
        once: true
    });


    // ── TOUR CARDS — simultaneous entrance ──────────────────
    // CRITICAL: No stagger on grid cards — breaks row alignment during animation
    gsap.from('.tours-grid .tour-card', {
        y: 48, opacity: 0,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.tours-grid', start: 'top 85%', once: true }
    });


    // ── VIRTUAL TOUR ─────────────────────────────────────────
    gsap.from('.vtour-header', {
        y: 28, opacity: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.vtour-header', start: 'top 82%', once: true }
    });
    ScrollTrigger.batch('.vtour-item', {
        onEnter: (els) => gsap.from(els, {
            y: 40, opacity: 0,
            stagger: 0.18, duration: 1, ease: 'power2.out'
        }),
        start: 'top 85%',
        once: true
    });


    // ── MAX SECTION — cinematic from sides ──────────────────
    gsap.from('.max-photo-col', {
        x: -50, opacity: 0, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.max-container', start: 'top 75%', once: true }
    });
    gsap.from('.max-content-col', {
        x: 50, opacity: 0, duration: 1.1, ease: 'power2.out', delay: 0.18,
        scrollTrigger: { trigger: '.max-container', start: 'top 75%', once: true }
    });


    // ── REVIEWS HEADER ───────────────────────────────────────
    gsap.from('.reviews-header-wrap', {
        y: 28, opacity: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.reviews-section', start: 'top 82%', once: true }
    });


    // ── FINAL CTA — staggered timeline ──────────────────────
    const ctaTl = gsap.timeline({
        scrollTrigger: { trigger: '.cta-section', start: 'top 75%', once: true }
    });
    ctaTl
        .from('.cta-eyebrow',  { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' })
        .from('.cta-heading',  { y: 40, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.4')
        .from('.cta-sub',      { y: 28, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
        .from('.cta-actions',  { y: 22, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');


    // ── FOOTER — slide from sides ────────────────────────────
    gsap.from('.footer-left', {
        x: -40, opacity: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '.footer-grid', start: 'top 85%', once: true }
    });
    gsap.from('.footer-right', {
        x: 40, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.15,
        scrollTrigger: { trigger: '.footer-grid', start: 'top 85%', once: true }
    });


    // ── INNER PAGE BANNER entrance ──────────────────────────
    if (document.querySelector('.page-banner-content')) {
        const bannerTl = gsap.timeline({ delay: 0.2 });
        bannerTl
            .from('.page-banner-eyebrow', { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' })
            .from('.page-banner-title',   { y: 32, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.35')
            .from('.page-banner-sub',     { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');
    }

    // ── TOURS PAGE — section headers ─────────────────────────
    gsap.utils.toArray('.tours-pg-header').forEach(el => {
        gsap.from(el, {
            y: 28, opacity: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    });

    // ── TOURS PAGE — category dividers ───────────────────────
    gsap.utils.toArray('.cat-divider').forEach(el => {
        gsap.from(el, {
            x: -30, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // ── TOURS PAGE — service cards (no stagger in grid) ──────
    gsap.utils.toArray('.svc-grid').forEach(grid => {
        gsap.from(grid.querySelectorAll('.svc-card'), {
            y: 40, opacity: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: grid, start: 'top 85%', once: true }
        });
    });

    // ── TOURS PAGE — tour card grids (no stagger) ────────────
    gsap.utils.toArray('.tcard-grid').forEach(grid => {
        gsap.from(grid.querySelectorAll('.tcard'), {
            y: 40, opacity: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: grid, start: 'top 85%', once: true }
        });
    });

    // ── TOURS PAGE — featured card ───────────────────────────
    if (document.querySelector('.tcard-featured')) {
        gsap.from('.tcard-featured', {
            y: 40, opacity: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: '.tcard-featured', start: 'top 82%', once: true }
        });
    }

    // ── TOURS PAGE — extras callout ──────────────────────────
    if (document.querySelector('.extras-callout')) {
        gsap.from('.extras-callout', {
            y: 30, opacity: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: '.extras-callout', start: 'top 85%', once: true }
        });
    }


    // ── GALLERY PAGE — staggered grid entrance ───────────────
    if (document.getElementById('galleryGrid')) {
        ScrollTrigger.batch('.gallery-pg-grid .gitem', {
            onEnter: (els) => gsap.from(els, {
                y: 32, opacity: 0,
                stagger: 0.06, duration: 0.85, ease: 'power2.out'
            }),
            start: 'top 88%',
            once: true
        });
    }


    // ── BOOKING PAGE — form + sidebar slide in ───────────────
    if (document.querySelector('.booking-layout')) {
        gsap.from('.booking-form-col', {
            x: -40, opacity: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: '.booking-layout', start: 'top 80%', once: true }
        });
        gsap.from('.booking-sidebar', {
            x: 40, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.15,
            scrollTrigger: { trigger: '.booking-layout', start: 'top 80%', once: true }
        });
    }


    // ── BOOKING SPLIT PAGE — cinematic footer reveal ─────────────
    // Footer is fixed at z-index 0, bsplit sits on top at z-index 2.
    // Bsplit is 80px taller than the viewport so its curved bottom is
    // hidden below the fold on load. Scrolling lifts the bsplit, first
    // revealing the curve, then the footer beneath — as if it was always there.
    if (document.querySelector('.booking-split-page')) {
        const footer = document.querySelector('.bfooter');
        const OVERHANG = 80; 

        let scrollRoom = 0;

        const setScrollRoom = () => {
            scrollRoom = window.innerHeight * 0.62 + OVERHANG;
            document.body.style.paddingBottom = scrollRoom + 'px';
        };

        setScrollRoom();
        window.addEventListener('resize', setScrollRoom, { passive: true });
    }


});
