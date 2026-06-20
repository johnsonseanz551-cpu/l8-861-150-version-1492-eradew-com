(function() {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = qs("[data-mobile-toggle]");
        var nav = qs("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        qsa("[data-hero-slider]").forEach(function(slider) {
            var slides = qsa("[data-hero-slide]", slider);
            var dots = qsa("[data-hero-dot]", slider);
            var prev = qs("[data-hero-prev]", slider);
            var next = qs("[data-hero-next]", slider);
            var index = 0;
            var timer = null;
            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                clearInterval(timer);
                timer = setInterval(function() {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function() {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function(dot, i) {
                dot.addEventListener("click", function() {
                    show(i);
                    start();
                });
            });

            show(0);
            start();
        });
    }

    function initFilters() {
        qsa("[data-filter-scope]").forEach(function(scope) {
            var input = qs("[data-filter-input]", scope);
            var region = qs("[data-filter-region]", scope);
            var type = qs("[data-filter-type]", scope);
            var year = qs("[data-filter-year]", scope);
            var grid = scope.parentElement.querySelector("[data-filter-grid]");
            var empty = qs("[data-filter-empty]", scope);
            var cards = grid ? qsa("[data-filter-card]", grid) : [];

            function apply() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var selectedRegion = region ? region.value : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;

                cards.forEach(function(card) {
                    var hay = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    var okText = !text || hay.indexOf(text) !== -1;
                    var okRegion = !selectedRegion || (card.getAttribute("data-region") || "") === selectedRegion;
                    var okType = !selectedType || (card.getAttribute("data-type") || "") === selectedType;
                    var okYear = !selectedYear || (card.getAttribute("data-year") || "") === selectedYear;
                    var ok = okText && okRegion && okType && okYear;
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, region, type, year].forEach(function(el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            seconds = 0;
        }
        var minutes = Math.floor(seconds / 60);
        var rest = Math.floor(seconds % 60);
        return minutes + ":" + (rest < 10 ? "0" : "") + rest;
    }

    window.initMoviePlayer = function(videoId, url) {
        var video = document.getElementById(videoId);
        if (!video || !url) {
            return;
        }
        var shell = video.closest("[data-player]");
        var overlay = shell ? qs("[data-player-overlay]", shell) : null;
        var toggle = shell ? qs("[data-player-toggle]", shell) : null;
        var mute = shell ? qs("[data-player-mute]", shell) : null;
        var full = shell ? qs("[data-player-fullscreen]", shell) : null;
        var progress = shell ? qs("[data-player-progress]", shell) : null;
        var time = shell ? qs("[data-player-time]", shell) : null;
        var controls = shell ? qs(".player-control-bar", shell) : null;
        var hls = null;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        function refresh() {
            if (toggle) {
                toggle.textContent = video.paused ? "▶" : "❚❚";
            }
            if (mute) {
                mute.textContent = video.muted ? "♪" : "♬";
            }
            if (overlay) {
                overlay.classList.toggle("is-hidden", !video.paused);
            }
            if (progress) {
                progress.max = Number.isFinite(video.duration) ? video.duration : 0;
                progress.value = Number.isFinite(video.currentTime) ? video.currentTime : 0;
            }
            if (time) {
                time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
            }
            if (controls) {
                controls.classList.toggle("is-visible", !video.paused);
            }
        }

        function play() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function() {});
            }
            refresh();
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
                refresh();
            }
        }

        video.addEventListener("click", togglePlay);
        video.addEventListener("play", refresh);
        video.addEventListener("pause", refresh);
        video.addEventListener("loadedmetadata", refresh);
        video.addEventListener("timeupdate", refresh);
        video.addEventListener("ended", refresh);

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (toggle) {
            toggle.addEventListener("click", togglePlay);
        }

        if (mute) {
            mute.addEventListener("click", function() {
                video.muted = !video.muted;
                refresh();
            });
        }

        if (progress) {
            progress.addEventListener("input", function() {
                video.currentTime = Number(progress.value || 0);
                refresh();
            });
        }

        if (full) {
            full.addEventListener("click", function() {
                var target = video.parentElement || video;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }

        window.addEventListener("beforeunload", function() {
            if (hls) {
                hls.destroy();
            }
        });

        refresh();
    };

    document.addEventListener("DOMContentLoaded", function() {
        initMobileNav();
        initHeroSlider();
        initFilters();
    });
})();
