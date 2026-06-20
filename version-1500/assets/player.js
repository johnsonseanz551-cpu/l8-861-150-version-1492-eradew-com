import { H } from './hls-vendor-dru42stk.js';

document.querySelectorAll('.video-stage').forEach((stage) => {
    const video = stage.querySelector('video');
    const overlay = stage.querySelector('.video-overlay');
    const url = stage.dataset.url;
    let ready = false;
    let hls = null;

    const attach = () => {
        if (ready || !video || !url) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (H.isSupported()) {
            hls = new H({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        ready = true;
    };

    const start = async () => {
        attach();
        stage.classList.add('is-playing');
        try {
            await video.play();
        } catch (error) {
            stage.classList.remove('is-playing');
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', () => {
            if (!ready || video.paused) {
                start();
            }
        });
        video.addEventListener('play', () => stage.classList.add('is-playing'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                stage.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', () => stage.classList.remove('is-playing'));
    }

    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
        }
    });
});
