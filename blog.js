const tagFilter = document.getElementById('tagFilter');
const postList = document.getElementById('postList');

if (tagFilter && postList) {
    const buttons = [...tagFilter.querySelectorAll('.tag-chip')];
    const cards = [...postList.querySelectorAll('.post-card')];

    tagFilter.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-chip');
        if (!btn) return;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.tag;
        cards.forEach(card => {
            const tags = card.dataset.tags.split(',');
            card.hidden = tag !== 'all' && !tags.includes(tag);
        });
    });
}
