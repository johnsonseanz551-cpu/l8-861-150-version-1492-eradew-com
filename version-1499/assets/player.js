(() => {
  const player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const cover = player.querySelector('[data-play-cover]');
  if (!video) {
    return;
  }

  const source = video.querySelector('source');
  const url = source ? source.getAttribute('src') : video.getAttribute('src');
  let hls = null;
  let ready = false;

  if (source) {
    source.remove();
  }

  const attach = () => {
    if (ready || !url) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  };

  const start = () => {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', () => {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
})();
