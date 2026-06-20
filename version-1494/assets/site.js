(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        var keywordInput = filterScope.querySelector('[data-filter-keyword]');
        var yearSelect = filterScope.querySelector('[data-filter-year]');
        var typeSelect = filterScope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));

        function filterCards() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region')
                ].join(' ').toLowerCase();

                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matchedType = !type || card.getAttribute('data-type') === type;

                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });
    }

    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';
        searchInput.value = initialKeyword;

        function renderSearch(keyword) {
            var value = keyword.trim().toLowerCase();
            var items = window.MOVIE_SEARCH_INDEX;

            if (value) {
                items = items.filter(function (movie) {
                    return [
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        movie.category,
                        (movie.tags || []).join(' '),
                        movie.oneLine
                    ].join(' ').toLowerCase().indexOf(value) !== -1;
                });
            } else {
                items = items.slice(0, 24);
            }

            if (!items.length) {
                searchResults.innerHTML = '<div class="search-empty">没有找到匹配内容，请尝试更换片名、年份、地区或类型关键词。</div>';
                return;
            }

            searchResults.innerHTML = items.slice(0, 120).map(function (movie) {
                return [
                    '<article class="search-result-card">',
                    '<a href="' + movie.url + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"></a>',
                    '<div>',
                    '<a href="' + movie.url + '"><h2>' + escapeHtml(movie.title) + '</h2></a>',
                    '<div class="inline-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year + ' · ' + movie.genre) + '</div>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<a class="section-link" href="' + movie.url + '">查看详情</a>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[character];
            });
        }

        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });

        renderSearch(initialKeyword);
    }
})();

function initMoviePlayer(playerId, url) {
    var player = document.getElementById(playerId);

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var hlsInstance = null;
    var initialized = false;

    if (!video) {
        return;
    }

    function attachVideo() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
        }
    }

    function playVideo() {
        attachVideo();
        video.setAttribute('controls', 'controls');

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
}
