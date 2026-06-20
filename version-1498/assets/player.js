
document.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('moviePlayer');
  var button = document.querySelector('[data-player-toggle]');
  var message = document.querySelector('[data-player-message]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-video-src');

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function hideCover() {
    if (button) {
      button.classList.add('hidden');
    }
  }

  function showCover() {
    if (button) {
      button.classList.remove('hidden');
    }
  }

  function loadVideo() {
    if (!source) {
      setMessage('播放暂时不可用');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage('高清播放已就绪');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('高清播放已就绪');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放加载异常，请稍后重试');
        }
      });
      return;
    }

    video.src = source;
    setMessage('浏览器将尝试直接播放');
  }

  if (button) {
    button.addEventListener('click', function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(hideCover).catch(function () {
          setMessage('点击视频控件即可开始播放');
        });
      } else {
        hideCover();
      }
    });
  }

  video.addEventListener('play', hideCover);
  video.addEventListener('pause', showCover);
  video.addEventListener('ended', showCover);
  video.addEventListener('loadedmetadata', function () {
    setMessage('高清播放已就绪');
  });

  loadVideo();
});
