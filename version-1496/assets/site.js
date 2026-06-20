(function() {
    var panel = document.querySelector(".mobile-panel");
    var toggle = document.querySelector(".menu-toggle");

    if (panel && toggle) {
        toggle.addEventListener("click", function() {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var sliders = document.querySelectorAll(".hero-slider");

    sliders.forEach(function(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });

            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
                dot.setAttribute("aria-current", i === current ? "true" : "false");
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function() {
                show(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                restart();
            });
        });

        show(0);
        restart();
    });

    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function(resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.onload = function() {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function setPlayerState(shell, video, playing) {
        shell.classList.toggle("is-playing", playing);
        shell.classList.toggle("is-paused", !playing);

        var playButtons = shell.querySelectorAll(".js-toggle-play");
        playButtons.forEach(function(button) {
            button.setAttribute("aria-label", playing ? "暂停" : "播放");
            var label = button.querySelector("[data-label]");
            if (label) {
                label.textContent = playing ? "暂停" : "播放";
            }
        });
    }

    function bindVideo(shell) {
        var video = shell.querySelector("video");
        if (!video) {
            return;
        }

        var url = video.getAttribute("data-video-url") || "";
        var playButtons = shell.querySelectorAll(".js-toggle-play");
        var muteButtons = shell.querySelectorAll(".js-toggle-mute");
        var fullButtons = shell.querySelectorAll(".js-toggle-fullscreen");

        function attachNative() {
            if (url && !video.getAttribute("src")) {
                video.src = url;
            }
        }

        if (url) {
            loadHls().then(function(Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    shell.hlsInstance = hls;
                } else {
                    attachNative();
                }
            }).catch(function() {
                attachNative();
            });
        }

        function togglePlay() {
            if (video.paused) {
                var request = video.play();
                if (request && request.catch) {
                    request.catch(function() {});
                }
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function(button) {
            button.addEventListener("click", function(event) {
                event.preventDefault();
                togglePlay();
            });
        });

        video.addEventListener("click", togglePlay);

        video.addEventListener("play", function() {
            setPlayerState(shell, video, true);
        });

        video.addEventListener("pause", function() {
            setPlayerState(shell, video, false);
        });

        video.addEventListener("ended", function() {
            setPlayerState(shell, video, false);
        });

        muteButtons.forEach(function(button) {
            button.addEventListener("click", function(event) {
                event.preventDefault();
                video.muted = !video.muted;
                var label = button.querySelector("[data-label]");
                if (label) {
                    label.textContent = video.muted ? "取消静音" : "静音";
                }
            });
        });

        fullButtons.forEach(function(button) {
            button.addEventListener("click", function(event) {
                event.preventDefault();

                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        });

        setPlayerState(shell, video, video.paused);
    }

    document.querySelectorAll(".js-player").forEach(bindVideo);

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindFilters(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var input = scope.querySelector(".js-search-input");
        var year = scope.querySelector(".js-year-filter");
        var region = scope.querySelector(".js-region-filter");
        var empty = scope.querySelector(".empty-state");

        if (!cards.length || !input && !year && !region) {
            return;
        }

        function apply() {
            var q = normalize(input ? input.value : "");
            var y = normalize(year ? year.value : "");
            var r = normalize(region ? region.value : "");
            var visible = 0;

            cards.forEach(function(card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var matched = true;

                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }

                if (y && cardYear !== y) {
                    matched = false;
                }

                if (r && cardRegion !== r) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, year, region].forEach(function(control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        scope.querySelectorAll(".filter-button").forEach(function(button) {
            button.addEventListener("click", apply);
        });

        var params = new URLSearchParams(window.location.search);
        var qParam = params.get("q");
        if (input && qParam) {
            input.value = qParam;
        }

        apply();
    }

    bindFilters(document);
})();
