(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.defer = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    function initPlayer() {
        var shell = document.querySelector(".player-shell");
        var video = shell ? shell.querySelector("video") : null;
        var overlay = shell ? shell.querySelector(".player-overlay") : null;
        var url = typeof CURRENT_VIDEO_URL !== "undefined" ? CURRENT_VIDEO_URL : "";
        if (!shell || !video || !overlay || !url) {
            return;
        }

        function playVideo() {
            shell.classList.add("is-playing");
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.src) {
                    video.src = url;
                }
                video.play().catch(function () {});
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    if (!video.__hlsBound) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video.__hlsBound = true;
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                } else {
                    if (!video.src) {
                        video.src = url;
                    }
                    video.play().catch(function () {});
                }
            });
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
    }

    function initSearch() {
        var root = document.getElementById("searchApp");
        if (!root || typeof SITE_MOVIES === "undefined") {
            return;
        }
        var keyword = document.getElementById("searchKeyword");
        var category = document.getElementById("searchCategory");
        var year = document.getElementById("searchYear");
        var region = document.getElementById("searchRegion");
        var reset = document.getElementById("resetSearch");
        var results = document.getElementById("searchResults");

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "" +
                "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<div class=\"movie-card__poster\">" +
                        "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
                        "<span class=\"movie-card__year\">" + escapeHtml(movie.year) + "</span>" +
                        "<span class=\"movie-card__play\">▶</span>" +
                    "</div>" +
                    "<div class=\"movie-card__body\">" +
                        "<h3>" + escapeHtml(movie.title) + "</h3>" +
                        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                        "<div class=\"movie-card__tags\">" + tags + "</div>" +
                        "<div class=\"movie-card__meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                    "</div>" +
                "</a>";
        }

        function render() {
            var q = (keyword.value || "").trim().toLowerCase();
            var cat = category.value;
            var y = year.value;
            var r = region.value;
            var matched = SITE_MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.oneLine, movie.summary, movie.genre, movie.region, movie.type, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                return (!q || haystack.indexOf(q) >= 0) &&
                    (!cat || movie.category === cat) &&
                    (!y || movie.year === y) &&
                    (!r || movie.region === r);
            }).slice(0, 120);
            if (!matched.length) {
                results.innerHTML = "<article class=\"content-card\"><h2>没有找到匹配内容</h2><p>可以调整关键词、年份、地区或分类继续搜索。</p></article>";
                return;
            }
            results.innerHTML = matched.map(card).join("");
        }

        [keyword, category, year, region].forEach(function (input) {
            input.addEventListener("input", render);
            input.addEventListener("change", render);
        });
        reset.addEventListener("click", function () {
            keyword.value = "";
            category.value = "";
            year.value = "";
            region.value = "";
            render();
        });
        render();
    }

    ready(function () {
        initMenu();
        initHero();
        initPlayer();
        initSearch();
    });
})();
