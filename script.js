// Nav background on scroll + hide scroll indicator + dark-chapter sync
const nav = document.getElementById('nav');
const scrollIndicator = document.getElementById('scrollIndicator');
const darkChapter = document.querySelector('.dark-chapter');

function updateNav() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (scrollIndicator) scrollIndicator.classList.toggle('hidden', y > 120);
    if (darkChapter) {
        const rect = darkChapter.getBoundingClientRect();
        const navBottom = nav.offsetHeight;
        nav.classList.toggle('on-dark', rect.top < navBottom && rect.bottom > 0);
    }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Scroll reveal with sibling stagger
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), idx * 100);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Hero dot grid — dots brighten and drift toward the cursor
(() => {
    const canvas = document.getElementById('grid');
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    const GAP = 36;
    const RADIUS = 170;
    let dots = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = null;

    function build() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dots = [];
        for (let x = GAP / 2; x < w; x += GAP) {
            for (let y = GAP / 2; y < h; y += GAP) {
                dots.push({ x, y });
            }
        }
    }

    function draw() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);
        for (const d of dots) {
            const dx = d.x - mouse.x;
            const dy = d.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            const t = Math.max(0, 1 - dist / RADIUS);
            // Base dots are barely-there; near the cursor they grow and glow accent
            if (t > 0.02) {
                ctx.fillStyle = `rgba(15, 118, 110, ${0.06 + t * 0.4})`;
            } else {
                ctx.fillStyle = 'rgba(29, 29, 31, 0.05)';
            }
            ctx.beginPath();
            ctx.arc(d.x - dx * t * 0.08, d.y - dy * t * 0.08, 1 + t * 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
        raf = null;
    }

    function schedule() {
        if (!raf) raf = requestAnimationFrame(draw);
    }

    build();
    draw();

    window.addEventListener('resize', () => { build(); schedule(); });

    if (!reduceMotion) {
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Skip redraws while the hero is off-screen
            if (rect.bottom < 0 || rect.top > innerHeight) return;
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            schedule();
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
            schedule();
        });
    }
})();

// Dot separator canvases — radial fade from the centre, and the same
// cursor-proximity glow as the hero grid
function buildDotSep(canvas) {
    if (!canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GAP = 20;
    const RADIUS = 130;
    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    let raf = null;

    function draw() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        // Max distance from centre to corner — used to normalise radial falloff
        const maxDist = Math.hypot(cx, cy);

        for (let x = GAP / 2; x < w; x += GAP) {
            for (let y = GAP / 2; y < h; y += GAP) {
                const dist = Math.hypot(x - cx, y - cy);
                // t = 1 at centre, 0 at corners; smooth power curve so the
                // bright core is wide and the fade is sharp at the edges
                const base = Math.pow(Math.max(0, 1 - dist / (maxDist * 0.72)), 1.6);
                // Cursor proximity boost, same feel as the hero grid
                const dxm = x - mouse.x;
                const dym = y - mouse.y;
                const m = Math.max(0, 1 - Math.hypot(dxm, dym) / RADIUS);
                const alpha = Math.min(0.6, base * 0.35 + m * 0.45);
                if (alpha < 0.01) continue;
                const radius = 1 + base * 1.4 + m * 1.2;
                ctx.fillStyle = `rgba(15, 118, 110, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x - dxm * m * 0.08, y - dym * m * 0.08, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        raf = null;
    }

    function schedule() {
        if (!raf) raf = requestAnimationFrame(draw);
    }

    draw();
    window.addEventListener('resize', schedule, { passive: true });

    if (!reduceMotion) {
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Skip redraws while the strip is off-screen
            if (rect.bottom < 0 || rect.top > innerHeight) return;
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            schedule();
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
            schedule();
        });
    }
}

buildDotSep(document.getElementById('dotSepTop'));
buildDotSep(document.getElementById('dotSepBottom'));
