/*!
 * tours-render.js — Bimini Island Tours
 * Fetches _data/tours.json and renders tour cards into #tours-container
 */
(async function () {
    const container = document.getElementById('tours-container');
    if (!container) return;

    let data;
    try {
        const res = await fetch('_data/tours.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        data = await res.json();
    } catch (e) {
        console.error('Could not load tours data:', e);
        // Fallback: Show the static content if dynamic fetch fails (e.g. local file access)
        const staticContainer = document.getElementById('tours-static');
        if (staticContainer) {
            staticContainer.style.display = 'block';
        }
        return;
    }

    let html = '';

    data.categories.forEach(category => {
        const visibleTours = category.tours.filter(t => !t.hide_on_tours_page);
        if (visibleTours.length === 0) return;

        html += `
        <div class="cat-divider">
            <span class="cat-divider-title">${category.label}</span>
        </div>`;

        if (category.id === 'core' || category.id === 'golf_cart') {
            html += renderCoreCategory(visibleTours);
        } else if (category.id === 'specialty') {
            html += `<div class="tcard-grid tcard-grid--3col">`;
            visibleTours.forEach(tour => { html += renderTcard(tour); });
            html += `</div>`;
        } else {
            html += `<div class="tcard-grid tcard-grid--2col">`;
            visibleTours.forEach(tour => { html += renderTcard(tour); });
            html += `</div>`;
        }
    });

    container.innerHTML = html;

    /* ── Core category: 2-col → featured → 2-col ── */
    function renderCoreCategory(tours) {
        const featured  = tours.find(t => t.featured);
        const regular   = tours.filter(t => !t.featured);
        let out = '';

        if (!featured) {
            // Render all together in one grid
            out += `<div class="tcard-grid tcard-grid--2col">`;
            regular.forEach(t => { out += renderTcard(t); });
            out += `</div>`;
        } else {
            const firstPair = regular.slice(0, 2);
            const restPair  = regular.slice(2);
            if (firstPair.length) {
                out += `<div class="tcard-grid tcard-grid--2col">`;
                firstPair.forEach(t => { out += renderTcard(t); });
                out += `</div>`;
            }
            out += renderFeaturedTcard(featured);
            if (restPair.length) {
                out += `<div class="tcard-grid tcard-grid--2col">`;
                restPair.forEach(t => { out += renderTcard(t); });
                out += `</div>`;
            }
        }
        return out;
    }

    /* ── Standard tour card ── */
    function renderTcard(tour) {
        const imgHtml = tour.image ? `
            <div class="tcard-img-wrap">
                <img src="${tour.image}" alt="${escHtml(tour.name)}" class="tcard-img"${tour.image_position ? ` style="object-position:${tour.image_position};"` : ''}>
                ${tour.duration ? `<span class="tcard-badge">${escHtml(tour.duration)}</span>` : ''}
            </div>` : '';

        const pricingHtml = tour.pricing && tour.pricing.length ? `
            <div class="tcard-prices">
                ${tour.pricing.map((p, i) => `
                <div class="price-row${i === tour.pricing.length - 1 ? ' price-row--last' : ''}">
                    <span class="price-label">${escHtml(p.label)}</span>
                    <span class="price-value">${escHtml(p.value)}</span>
                </div>`).join('')}
            </div>` : '';

        const includesHtml = tour.includes && tour.includes.length ? `
            <ul class="svc-includes">
                ${tour.includes.map(item => `<li>${escHtml(item)}</li>`).join('')}
            </ul>` : '';

        const logisticsHtml = tour.logistics ? `
            <div class="tcard-logistics">
                <svg class="tcard-logistics-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escHtml(tour.logistics)}</span>
            </div>` : '';

        const inclExclHtml = tour.whats_included && tour.whats_included.length ? `
            <div class="tcard-incl-excl">
                <ul class="tcard-includes">
                    ${tour.whats_included.map(item => `<li><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${escHtml(item)}</li>`).join('')}
                </ul>
                ${tour.whats_not_included && tour.whats_not_included.length ? `
                <ul class="tcard-excludes">
                    ${tour.whats_not_included.map(item => `<li><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>${escHtml(item)}</li>`).join('')}
                </ul>` : ''}
            </div>` : '';

        const isSmall = !!(tour.includes && tour.includes.length);
        const cta     = tour.cta_label || 'Check Availability';
        const href    = `booking.html?tour=${encodeURIComponent(tour.booking_param)}`;

        return `
        <article class="tcard" id="${escHtml(tour.id)}">
            ${imgHtml}
            <div class="tcard-body">
                <h3 class="tcard-title">${escHtml(tour.name)}</h3>
                <p class="tcard-desc">${(tour.description_html || escHtml(tour.description)).replace(/\n/g, '<br>')}</p>
                ${(tour.description_extended_html || tour.description_extended) ? `<details class="tcard-desc-details"><summary>Read More</summary><p class="tcard-desc" style="margin-top:0.5rem;">${(tour.description_extended_html || escHtml(tour.description_extended)).replace(/\n/g, '<br>')}</p></details>` : ''}
                ${logisticsHtml}
                ${inclExclHtml}
                ${pricingHtml}
                ${includesHtml}
                <a href="${href}" class="btn-pill btn-pill--dark${isSmall ? ' btn-pill--sm' : ''}">${escHtml(cta)} <span class="pill-circle">&#8599;</span></a>
            </div>
        </article>`;
    }

    /* ── Featured (wide) card ── */
    function renderFeaturedTcard(tour) {
        const half = Math.ceil(tour.pricing.length / 2);
        const col1 = tour.pricing.slice(0, half);
        const col2 = tour.pricing.slice(half);

        const colHtml = prices => prices.map((p, i) => `
            <div class="price-row${i === prices.length - 1 ? ' price-row--last' : ''}">
                <span class="price-label">${escHtml(p.label)}</span>
                <span class="price-value">${escHtml(p.value)}</span>
            </div>`).join('');

        const titleHtml = tour.name_html || escHtml(tour.name);
        const eyebrow   = tour.eyebrow  || '';
        const href      = `booking.html?tour=${encodeURIComponent(tour.booking_param)}`;
        const cta       = tour.cta_label || 'Book This Tour';

        const logisticsHtml = tour.logistics ? `
            <div class="tcard-logistics">
                <svg class="tcard-logistics-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escHtml(tour.logistics)}</span>
            </div>` : '';

        const inclExclHtml = tour.whats_included && tour.whats_included.length ? `
            <div class="tcard-incl-excl">
                <ul class="tcard-includes">
                    ${tour.whats_included.map(item => `<li><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${escHtml(item)}</li>`).join('')}
                </ul>
                ${tour.whats_not_included && tour.whats_not_included.length ? `
                <ul class="tcard-excludes">
                    ${tour.whats_not_included.map(item => `<li><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>${escHtml(item)}</li>`).join('')}
                </ul>` : ''}
            </div>` : '';

        return `
        <article class="tcard-featured" id="${escHtml(tour.id)}">
            <div class="tcard-featured-img-wrap">
                <img src="${tour.image}" alt="${escHtml(tour.name)}" class="tcard-featured-img">
                <div class="tcard-featured-img-overlay"></div>
                ${tour.featured_label ? `<span class="tcard-featured-label">${escHtml(tour.featured_label)}</span>` : ''}
            </div>
            <div class="tcard-featured-body">
                <div class="tcard-featured-header">
                    <div>
                        ${eyebrow ? `<span class="section-eyebrow" style="margin-bottom:0.4rem;">${escHtml(eyebrow)}</span>` : ''}
                        <h3 class="tcard-featured-title">${titleHtml}</h3>
                    </div>
                    ${tour.duration ? `<span class="tcard-badge tcard-badge--lg">${escHtml(tour.duration)}</span>` : ''}
                </div>
                <p class="tcard-desc">${(tour.description_html || escHtml(tour.description)).replace(/\n/g, '<br>')}</p>
                ${(tour.description_extended_html || tour.description_extended) ? `<details class="tcard-desc-details"><summary>Read More</summary><p class="tcard-desc" style="margin-top:0.5rem;">${(tour.description_extended_html || escHtml(tour.description_extended)).replace(/\n/g, '<br>')}</p></details>` : ''}
                ${logisticsHtml}
                ${inclExclHtml}
                <div class="tcard-featured-prices">
                    <div class="tcard-featured-price-col">${colHtml(col1)}</div>
                    <div class="tcard-featured-price-col">${colHtml(col2)}</div>
                </div>
                <a href="${href}" class="btn-pill btn-pill--dark">${escHtml(cta)} <span class="pill-circle">&#8599;</span></a>
            </div>
        </article>`;
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
})();
