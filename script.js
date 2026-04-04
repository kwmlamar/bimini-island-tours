document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for graceful fade/slide in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay to children if necessary
                entry.target.classList.add('fade-in');
                entry.target.style.opacity = 1;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to cards and text blocks
    const animatedElements = document.querySelectorAll('.feature-card, .review-card, .about-text, .about-image, .section-title, .section-subtitle');
    
    animatedElements.forEach(el => {
        el.style.opacity = 0; // Hide initially
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        observer.observe(el);
    });
    
    // Custom logic to handle the transition classes
    const observerScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        })
    }, observerOptions);

    animatedElements.forEach(el => observerScroll.observe(el));

    // Truly Infinite, Center-Focus Seamless Gallery Slider
    const galleryTrack = document.getElementById('galleryTrack');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const gallerySlider = document.querySelector('.gallery-slider');
    let initialCards = Array.from(document.querySelectorAll('.gallery-item'));
    
    if (galleryTrack && galleryPrev && galleryNext && initialCards.length > 0) {
        // 1. Triple the cards for an unbreakable loop (Clone All)
        initialCards.forEach(card => {
            const clone = card.cloneNode(true);
            galleryTrack.appendChild(clone);
        });
        initialCards.reverse().forEach(card => {
            const clone = card.cloneNode(true);
            galleryTrack.insertBefore(clone, galleryTrack.firstChild);
        });

        // Current state: [C4, C3, C2, C1] [P1, P2, P3, P4] [C1, C2, C3, C4]
        const allCards = document.querySelectorAll('.gallery-item');
        const cardWidth = 320; // Exact card width
        const gap = 32; // 2rem
        const fullCardWidth = cardWidth + gap;
        
        // Start at the first "real" photo (which is at index 4 because we prepended 4)
        let currentIndex = initialCards.length; 
        
        function updateGallery(animate = true) {
            // THE CENTER CALCULATION:
            // Calculate how much we need to shift the track to center the card
            const containerWidth = gallerySlider.clientWidth;
            const centerOffset = (containerWidth / 2) - (cardWidth / 2);
            const totalTranslate = centerOffset - (currentIndex * fullCardWidth);

            if (animate) {
                galleryTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            } else {
                galleryTrack.style.transition = 'none';
            }
            
            galleryTrack.style.transform = `translateX(${totalTranslate}px)`;

            // Highlighting (Center Card)
            allCards.forEach((card, idx) => {
                if (idx === currentIndex) {
                    card.classList.add('active-card');
                } else {
                    card.classList.remove('active-card');
                }
            });
        }

        galleryNext.addEventListener('click', () => {
            if (currentIndex >= allCards.length - 1) return;
            currentIndex++;
            updateGallery(true);
        });
        
        galleryPrev.addEventListener('click', () => {
            if (currentIndex <= 0) return;
            currentIndex--;
            updateGallery(true);
        });

        // The "Snap" logic for seamlessness at the boundaries
        galleryTrack.addEventListener('transitionend', () => {
            // If we've reached the end clones, jump back to real start
            if (currentIndex >= allCards.length - initialCards.length) {
                currentIndex = initialCards.length;
                updateGallery(false);
            }
            // If we've reached the start clones, jump back to real end
            if (currentIndex < initialCards.length) {
                if (currentIndex <= 1) { // Safety margin
                    currentIndex = initialCards.length + initialCards.length - 1;
                    updateGallery(false);
                }
            }
        });

        /* Scroll Reveal Animation Trigger Logic */
        const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

        const revealObserverOptions = {
            root: null,
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Stop trigger too late
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // observer.unobserve(entry.target); // Optional: Stop watching after first reveal
                }
            });
        }, revealObserverOptions);

        revealElements.forEach(el => revealObserver.observe(el));

        // Initialize
        window.addEventListener('resize', () => updateGallery(false));
        updateGallery(false);
    }

    // Interactive Review Slider Logic
    const reviewSlides = document.querySelectorAll('.review-slide');
    const reviewDots = document.querySelectorAll('.review-dots .dot');
    const reviewPrev = document.getElementById('reviewPrev');
    const reviewNext = document.getElementById('reviewNext');
    let currentReview = 0;

    if (reviewSlides.length > 0) {
        function showReview(index) {
            reviewSlides.forEach(slide => slide.classList.remove('active'));
            reviewDots.forEach(dot => dot.classList.remove('active'));

            reviewSlides[index].classList.add('active');
            reviewDots[index].classList.add('active');
        }

        if (reviewNext) {
            reviewNext.addEventListener('click', () => {
                currentReview = (currentReview + 1) % reviewSlides.length;
                showReview(currentReview);
            });
        }

        if (reviewPrev) {
            reviewPrev.addEventListener('click', () => {
                currentReview = (currentReview - 1 + reviewSlides.length) % reviewSlides.length;
                showReview(currentReview);
            });
        }

        reviewDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                currentReview = idx;
                showReview(currentReview);
            });
        });
    }
});
