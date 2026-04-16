document.addEventListener('DOMContentLoaded', () => {

    // ===== SCROLL REVEAL =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => revealObserver.observe(el));


    // ===== MOBILE MENU =====
    const hamburger      = document.getElementById('navHamburger');
    const mobileMenu     = document.getElementById('mobileMenu');
    const mobileOverlay  = document.getElementById('mobileOverlay');
    const mobileClose    = document.getElementById('mobileMenuClose');

    function openMenu() {
        mobileMenu?.classList.add('is-open');
        mobileOverlay?.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        mobileMenu?.classList.remove('is-open');
        mobileOverlay?.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    hamburger?.addEventListener('click', openMenu);
    mobileClose?.addEventListener('click', closeMenu);
    mobileOverlay?.addEventListener('click', closeMenu);

    // Close menu on nav link click
    document.querySelectorAll('.mobile-menu-links a')
        .forEach(link => link.addEventListener('click', closeMenu));


    // ===== PAGE HEADER SCROLL EFFECT (inner pages) =====
    const pageHeader = document.getElementById('pageHeader');
    if (pageHeader) {
        window.addEventListener('scroll', () => {
            pageHeader.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }


    // ===== GALLERY SLIDER (homepage) =====
    const galleryTrack  = document.getElementById('galleryTrack');
    const galleryPrev   = document.getElementById('galleryPrev');
    const galleryNext   = document.getElementById('galleryNext');
    const gallerySlider = document.querySelector('.gallery-slider');
    const initialCards  = Array.from(document.querySelectorAll('.gallery-item'));

    if (galleryTrack && galleryPrev && galleryNext && initialCards.length > 0) {
        // Triple cards for seamless infinite loop
        initialCards.forEach(card => galleryTrack.appendChild(card.cloneNode(true)));
        [...initialCards].reverse().forEach(card =>
            galleryTrack.insertBefore(card.cloneNode(true), galleryTrack.firstChild)
        );

        const allCards      = document.querySelectorAll('.gallery-item');
        const cardWidth     = 320;
        const gap           = 32;
        const fullCardWidth = cardWidth + gap;
        let currentIndex    = initialCards.length;

        function updateGallery(animate = true) {
            const containerWidth = gallerySlider.clientWidth;
            const centerOffset   = (containerWidth / 2) - (cardWidth / 2);
            const totalTranslate = centerOffset - (currentIndex * fullCardWidth);

            galleryTrack.style.transition = animate
                ? 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                : 'none';
            galleryTrack.style.transform = `translateX(${totalTranslate}px)`;

            allCards.forEach((card, idx) =>
                card.classList.toggle('active-card', idx === currentIndex)
            );
        }

        galleryNext.addEventListener('click', () => {
            if (currentIndex < allCards.length - 1) { currentIndex++; updateGallery(true); }
        });
        galleryPrev.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateGallery(true); }
        });

        galleryTrack.addEventListener('transitionend', () => {
            if (currentIndex >= allCards.length - initialCards.length) {
                currentIndex = initialCards.length;
                updateGallery(false);
            }
            if (currentIndex < initialCards.length && currentIndex <= 1) {
                currentIndex = initialCards.length + initialCards.length - 1;
                updateGallery(false);
            }
        });

        // Touch swipe
        let touchStartX = 0;
        gallerySlider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        gallerySlider.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < allCards.length - 1) { currentIndex++; updateGallery(true); }
                if (diff < 0 && currentIndex > 0)                   { currentIndex--; updateGallery(true); }
            }
        }, { passive: true });

        window.addEventListener('resize', () => updateGallery(false), { passive: true });
        updateGallery(false);
    }


    // ===== REVIEW SLIDER =====
    const reviewSlides = document.querySelectorAll('.review-slide');
    const reviewDots   = document.querySelectorAll('.review-dots .dot');
    const reviewPrev   = document.getElementById('reviewPrev');
    const reviewNext   = document.getElementById('reviewNext');
    let currentReview  = 0;

    if (reviewSlides.length > 0) {
        function showReview(index) {
            reviewSlides.forEach(s => s.classList.remove('active'));
            reviewDots.forEach(d => d.classList.remove('active'));
            reviewSlides[index].classList.add('active');
            if (reviewDots[index]) reviewDots[index].classList.add('active');
        }

        reviewNext?.addEventListener('click', () => {
            currentReview = (currentReview + 1) % reviewSlides.length;
            showReview(currentReview);
        });
        reviewPrev?.addEventListener('click', () => {
            currentReview = (currentReview - 1 + reviewSlides.length) % reviewSlides.length;
            showReview(currentReview);
        });
        reviewDots.forEach((dot, idx) =>
            dot.addEventListener('click', () => { currentReview = idx; showReview(currentReview); })
        );

        // Touch swipe on review card
        const reviewWrapper = document.querySelector('.review-card-wrapper');
        if (reviewWrapper) {
            let reviewTouchStartX = 0;
            reviewWrapper.addEventListener('touchstart', e => {
                reviewTouchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            reviewWrapper.addEventListener('touchend', e => {
                const diff = reviewTouchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) {
                    currentReview = diff > 0
                        ? (currentReview + 1) % reviewSlides.length
                        : (currentReview - 1 + reviewSlides.length) % reviewSlides.length;
                    showReview(currentReview);
                }
            }, { passive: true });
        }
    }


    // ===== GALLERY PAGE LIGHTBOX =====
    const galleryItems  = document.querySelectorAll('.gallery-page-item');
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev  = document.getElementById('lightboxPrev');
    const lightboxNext  = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');

    if (galleryItems.length > 0 && lightbox) {
        // Build image list from data attributes
        const images = Array.from(galleryItems).map(item => ({
            src:     item.dataset.src,
            alt:     item.dataset.alt || '',
            caption: item.dataset.caption || ''
        }));
        let currentLightboxIndex = 0;

        function openLightbox(index) {
            currentLightboxIndex = index;
            const img = images[index];
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            if (lightboxCaption) lightboxCaption.textContent = img.caption;
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
            // Clear src after transition so it doesn't flash old image
            setTimeout(() => { lightboxImg.src = ''; }, 350);
        }

        function showLightboxImage(index) {
            currentLightboxIndex = (index + images.length) % images.length;
            const img = images[currentLightboxIndex];
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                if (lightboxCaption) lightboxCaption.textContent = img.caption;
                lightboxImg.style.opacity = '1';
            }, 150);
        }

        lightboxImg.style.transition = 'opacity 0.15s ease';

        galleryItems.forEach((item, idx) =>
            item.addEventListener('click', () => openLightbox(idx))
        );

        lightboxClose?.addEventListener('click', closeLightbox);
        lightboxPrev?.addEventListener('click', () => showLightboxImage(currentLightboxIndex - 1));
        lightboxNext?.addEventListener('click', () => showLightboxImage(currentLightboxIndex + 1));

        // Close on backdrop click
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showLightboxImage(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') showLightboxImage(currentLightboxIndex + 1);
        });

        // Touch swipe in lightbox
        let lbTouchStartX = 0;
        lightbox.addEventListener('touchstart', e => {
            lbTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const diff = lbTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) showLightboxImage(currentLightboxIndex + 1);
                else          showLightboxImage(currentLightboxIndex - 1);
            }
        }, { passive: true });
    }


    // ===== STICKY WHATSAPP — hide when footer visible =====
    const stickyBtn = document.querySelector('.sticky-whatsapp');
    const footer    = document.querySelector('.footer-luxury');

    if (stickyBtn && footer) {
        const footerObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                stickyBtn.style.opacity      = entry.isIntersecting ? '0' : '1';
                stickyBtn.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
            });
        }, { threshold: 0.1 });
        footerObserver.observe(footer);
    }

});
