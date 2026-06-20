const menuButton = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const hero = document.querySelector('[data-hero]');
if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, position) => {
            slide.classList.toggle('active', position === current);
        });
        dots.forEach((dot, position) => {
            dot.classList.toggle('active', position === current);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(current + 1), 5200);
    }
}

const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

const normalize = (value) => String(value || '').trim().toLowerCase();

const applySearch = () => {
    const term = normalize(searchInputs.map((input) => input.value).find(Boolean) || '');
    const activeFilterButton = filterButtons.find((button) => button.classList.contains('active'));
    const filter = activeFilterButton ? normalize(activeFilterButton.dataset.filter) : '全部';

    document.querySelectorAll('[data-card]').forEach((card) => {
        const searchText = normalize(card.dataset.search);
        const categoryText = normalize(card.dataset.category);
        const matchTerm = !term || searchText.includes(term) || categoryText.includes(term);
        const matchFilter = filter === '全部' || searchText.includes(filter) || categoryText.includes(filter);
        card.classList.toggle('hidden', !(matchTerm && matchFilter));
    });
};

searchInputs.forEach((input) => {
    input.addEventListener('input', applySearch);
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        applySearch();
    });
});
