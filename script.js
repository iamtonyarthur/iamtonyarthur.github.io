const nav = document.getElementById('nav');
const scrollIndicator = document.getElementById('scrollIndicator');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (scrollIndicator) scrollIndicator.classList.toggle('hidden', y > 100);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), idx * 120);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
