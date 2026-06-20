(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileNav() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var reset = panel.querySelector('[data-filter-reset]');
        var result = document.querySelector('[data-filter-result]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var yearValue = normalize(year ? year.value : '');
            var typeValue = normalize(type ? type.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        if (type) {
            type.addEventListener('change', apply);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var start = player.querySelector('[data-player-start]');
            var url = player.getAttribute('data-video-url');
            if (!video || !url) {
                return;
            }

            function attachSource() {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    video.src = url;
                }
            }

            function play() {
                attachSourceOnce();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            function attachSourceOnce() {
                if (video.getAttribute('data-source-attached') === 'true') {
                    return;
                }
                video.setAttribute('data-source-attached', 'true');
                attachSource();
            }

            if (start) {
                start.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('playing');
            });
            video.addEventListener('loadedmetadata', function () {
                player.classList.add('ready');
            });
            attachSourceOnce();
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });
}());
