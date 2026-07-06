/* ============================================
   PORTFOLIO TEMPLATE ARCHIVE — Home Gallery logic
   Renders theme cards, live scaled iframe previews
   (lazy-loaded), search + mood filtering, copy-path.
   ============================================ */

const THEMES = [
    { folder: 'studio',    name: 'Code Studio',   accent: '#2563eb', desc: "Light code-studio IDE with syntax tokens & gutter line numbers. This site's own theme.", font: 'JetBrains Mono', tags: ['Light', 'Mono', 'Technical'] },
    { folder: 'aurora',    name: 'Aurora',        accent: '#ff4d9d', desc: 'Vivid aurora gradients drifting over deep space black — the flagship look.', font: 'Space Grotesk', tags: ['Dark', 'Neon', 'Gradient'] },
    { folder: 'classic',   name: 'Classic',       accent: '#00d4ff', desc: 'The original dark portfolio: neon-cyan accents and a connected particle field.', font: 'Inter', tags: ['Dark', 'Neon', 'Cool'] },
    { folder: 'ide',       name: 'Code Editor',   accent: '#007acc', desc: 'A pixel-faithful VS Code window: editor chrome, tabs and syntax highlighting.', font: 'JetBrains Mono', tags: ['Light', 'Mono', 'Technical'] },
    { folder: 'terminal',  name: 'Terminal',      accent: '#39ff14', desc: 'Green-on-black CRT terminal with command prompts and a phosphor glow.', font: 'Share Tech Mono', tags: ['Dark', 'Mono', 'Neon'] },
    { folder: 'matrix',    name: 'Matrix',        accent: '#39ff14', desc: 'Falling green code rain and monospace glyphs on absolute black.', font: 'Share Tech Mono', tags: ['Dark', 'Mono', 'Neon'] },
    { folder: 'cipher',    name: 'Cipher',        accent: '#4f46e5', desc: 'Encrypted hacker glyphs and scramble effects on a light slate surface.', font: 'Share Tech Mono', tags: ['Light', 'Mono', 'Technical'] },
    { folder: 'synthwave', name: 'Synthwave',     accent: '#ff2abd', desc: "80s retro-futurism: neon magenta grid, chrome sun and Orbitron type.", font: 'Orbitron', tags: ['Dark', 'Neon', 'Retro'] },
    { folder: 'prism',     name: 'Prism',         accent: '#7c8cff', desc: 'Prismatic light spectrum splitting across a midnight canvas.', font: 'Orbitron', tags: ['Dark', 'Neon', 'Gradient'] },
    { folder: 'holo',      name: 'Holographic',   accent: '#b48cff', desc: 'Iridescent holographic foil that shimmers purple-to-cyan as you move.', font: 'Space Grotesk', tags: ['Dark', 'Neon', 'Gradient'] },
    { folder: 'sunset',    name: 'Sunset',        accent: '#ff7a59', desc: 'Warm dusk gradients — amber, coral and violet over a deep brown night.', font: 'Space Grotesk', tags: ['Dark', 'Warm', 'Gradient'] },
    { folder: 'luxe',      name: 'Luxe',          accent: '#d4af37', desc: 'Black-and-gold luxury with elegant Cormorant serif headlines.', font: 'Cormorant Garamond', tags: ['Dark', 'Serif', 'Luxury'] },
    { folder: 'liquid',    name: 'Liquid',        accent: '#7c5cff', desc: 'Fluid violet-pink blobs and liquid gradients that morph on scroll.', font: 'Sora', tags: ['Light', 'Cool', 'Gradient'] },
    { folder: 'aqua',      name: 'Aqua',          accent: '#1aa3c4', desc: 'Watery blue glass with soft aqua-teal gradients and bubble highlights.', font: 'Sora', tags: ['Light', 'Cool', 'Glass'] },
    { folder: 'frost',     name: 'Frost',         accent: '#2b8fd6', desc: 'Frosted glassmorphism panels floating in cool morning blues.', font: 'Sora', tags: ['Light', 'Cool', 'Glass'] },
    { folder: 'glacier',   name: 'Glacier',       accent: '#2b8fd6', desc: 'Icy translucent panels and glacial blues with crisp edges.', font: 'Sora', tags: ['Light', 'Cool', 'Glass'] },
    { folder: 'clay',      name: 'Clay',          accent: '#8b7cf6', desc: 'Soft claymorphism: pillowy pastel shapes with gentle depth.', font: 'Poppins', tags: ['Light', 'Playful', 'Soft'] },
    { folder: 'blueprint', name: 'Blueprint',     accent: '#1f4e8c', desc: 'Technical drafting blueprint — grid paper, dimension lines and mono labels.', font: 'JetBrains Mono', tags: ['Light', 'Cool', 'Technical'] },
    { folder: 'schematic', name: 'Schematic',     accent: '#1f4e8c', desc: 'Engineering schematic sheet with component outlines and annotations.', font: 'Space Grotesk', tags: ['Light', 'Mono', 'Technical'] },
    { folder: 'swiss',     name: 'Swiss',         accent: '#0047ff', desc: 'International Typographic Style: strict grid, huge type, cobalt accents.', font: 'Archivo', tags: ['Light', 'Minimal', 'Bold'] },
    { folder: 'noir',      name: 'Noir',          accent: '#0a0a0a', desc: 'High-contrast black-and-white noir with heavy Archivo display type.', font: 'Archivo', tags: ['Light', 'Minimal', 'Bold'] },
    { folder: 'bauhaus',   name: 'Bauhaus',       accent: '#e63946', desc: 'Primary-colour Bauhaus geometry — circles, squares and bold blocks.', font: 'Archivo', tags: ['Light', 'Retro', 'Bold'] },
    { folder: 'brutalist', name: 'Brutalist',     accent: '#c5ff00', desc: 'Raw web-brutalism: hard black borders, lime accents and offset shadows.', font: 'Space Grotesk', tags: ['Light', 'Bold', 'Mono'] },
    { folder: 'editorial', name: 'Editorial',     accent: '#b8860b', desc: 'Magazine editorial layout with Playfair Display serif and fine rules.', font: 'Playfair Display', tags: ['Light', 'Serif', 'Editorial'] },
    { folder: 'botanical', name: 'Botanical',     accent: '#3f6b4c', desc: 'Organic warmth: forest greens, terracotta and Fraunces serifs.', font: 'Fraunces', tags: ['Light', 'Serif', 'Warm'] },
];

const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const filtersEl = document.getElementById('filters');
const resultCount = document.getElementById('resultCount');
const emptyEl = document.getElementById('empty');
const toast = document.getElementById('toast');

let activeFilter = 'All';
let query = '';

/* ---- build filter chips from the union of tags ---- */
const allTags = ['All', ...Array.from(new Set(THEMES.flatMap(t => t.tags))).sort()];
allTags.forEach(tag => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (tag === 'All' ? ' active' : '');
    chip.textContent = tag;
    chip.dataset.tag = tag;
    chip.setAttribute('role', 'tab');
    chip.addEventListener('click', () => {
        activeFilter = tag;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.tag === tag));
        applyFilters();
    });
    filtersEl.appendChild(chip);
});

/* ---- render cards ---- */
THEMES.forEach((theme, i) => {
    const path = `Themes/${theme.folder}/index.html`;
    const num = String(i + 1).padStart(2, '0');
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.folder = theme.folder;
    card.dataset.search = `${theme.name} ${theme.folder} ${theme.font} ${theme.desc} ${theme.tags.join(' ')}`.toLowerCase();
    card.dataset.tags = theme.tags.join(',');

    const moodTags = theme.tags.map(t => `<span class="card-tag mood-tag">${t}</span>`).join('');

    card.innerHTML = `
        <div class="card-preview">
            <div class="card-chrome">
                <span class="card-dots"><span class="r"></span><span class="y"></span><span class="g"></span></span>
                <span class="card-file">${path}</span>
            </div>
            <div class="preview" data-src="${path}">
                <div class="preview-loader"><i class="fas fa-spinner fa-spin"></i></div>
                <a class="preview-open" href="${path}" target="_blank" rel="noopener" aria-label="Open ${theme.name} in a new tab">
                    <span>Open live <i class="fas fa-arrow-up-right-from-square"></i></span>
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="card-head">
                <span class="swatch" style="--sw:${theme.accent}"></span>
                <h3 class="card-name">${theme.name}</h3>
                <span class="card-index">${num}/${THEMES.length}</span>
            </div>
            <p class="card-desc">${theme.desc}</p>
            <div class="card-tags">
                <span class="card-tag font-tag">Aa ${theme.font}</span>
                ${moodTags}
            </div>
            <div class="card-actions">
                <a class="btn btn-primary" href="${path}" target="_blank" rel="noopener">Open <i class="fas fa-arrow-right"></i></a>
                <button class="btn btn-ghost" data-copy="${path}"><i class="fas fa-link"></i> Copy path</button>
            </div>
        </div>
    `;
    grid.appendChild(card);
});

/* ---- scale iframes to fit their preview box ---- */
function scalePreview(previewEl) {
    const scale = previewEl.clientWidth / 1280;
    previewEl.style.setProperty('--scale', scale.toFixed(4));
}
const scaleObserver = new ResizeObserver(entries => {
    entries.forEach(e => scalePreview(e.target));
});
document.querySelectorAll('.preview').forEach(p => { scalePreview(p); scaleObserver.observe(p); });

/* ---- lazy-load iframes only when near the viewport ---- */
const iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const preview = entry.target;
        iframeObserver.unobserve(preview);
        const iframe = document.createElement('iframe');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('title', 'Theme preview');
        iframe.addEventListener('load', () => {
            iframe.classList.add('loaded');
            preview.classList.add('loaded');
        });
        scalePreview(preview);
        iframe.src = preview.dataset.src;
        preview.insertBefore(iframe, preview.querySelector('.preview-open'));
    });
}, { rootMargin: '400px 0px' });
document.querySelectorAll('.preview').forEach(p => iframeObserver.observe(p));

/* ---- staggered reveal on first paint ---- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });
document.querySelectorAll('.card').forEach(c => revealObserver.observe(c));

/* ---- search + filter ---- */
function applyFilters() {
    let visible = 0;
    document.querySelectorAll('.card').forEach(card => {
        const matchesQuery = !query || card.dataset.search.includes(query);
        const matchesFilter = activeFilter === 'All' || card.dataset.tags.split(',').includes(activeFilter);
        const show = matchesQuery && matchesFilter;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
    });
    resultCount.innerHTML = `<b>${visible}</b> of ${THEMES.length} templates`;
    emptyEl.hidden = visible !== 0;
}
searchInput.addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); applyFilters(); });
document.getElementById('clearFilters').addEventListener('click', () => {
    query = ''; searchInput.value = ''; activeFilter = 'All';
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.tag === 'All'));
    applyFilters();
});
applyFilters();

/* ---- copy path ---- */
grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    const done = () => {
        btn.classList.add('copied');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showToast(`Copied ${text}`);
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else { fallbackCopy(text, done); }
});
function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta); cb();
}
let toastTimer;
function showToast(msg) {
    toast.innerHTML = `<i class="fas fa-check"></i>${msg}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ---- navbar scroll state + progress bar ---- */
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');
let ticking = false;
window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 40);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (docH > 0 ? (window.pageYOffset / docH) * 100 : 0) + '%';
        ticking = false;
    });
});

/* ---- "/" focuses search ---- */
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    if (e.key === 'Escape' && document.activeElement === searchInput) { searchInput.blur(); }
});
