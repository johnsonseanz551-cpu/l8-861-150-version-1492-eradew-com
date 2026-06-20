(function() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        if (slides.length > 1) {
            dots.forEach(function(dot) {
                dot.addEventListener('click', function() {
                    showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
                });
            });
            setInterval(function() {
                showSlide(active + 1);
            }, 5000);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var results = document.querySelector('[data-search-results]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && results) {
        var cards = Array.prototype.slice.call(results.querySelectorAll('[data-movie-card]'));
        var query = new URLSearchParams(window.location.search).get('q') || '';
        searchInput.value = query;

        function filterCards() {
            var value = searchInput.value.trim().toLowerCase();
            var category = categoryFilter ? categoryFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var visibleCount = 0;

            cards.forEach(function(card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-year') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!value || text.indexOf(value) !== -1) &&
                    (!category || cardCategory === category) &&
                    (!year || cardYear === year);

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        searchInput.addEventListener('input', filterCards);
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterCards);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', filterCards);
        }
        filterCards();
    }
}());
