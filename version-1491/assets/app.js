document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-button');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function setSlide(next) {
    if (!slides.length) {
      return;
    }

    current = next % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('active', index === current);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('active', index === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(current + 1);
    }, 5000);
  }

  var searchInput = document.getElementById('movieSearch');
  var categoryFilter = document.getElementById('categoryFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('.empty-state');

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedCategory = category === 'all' || category === cardCategory;
      var show = matchedText && matchedCategory;

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCards);
  }

  var player = document.querySelector('.player-box');

  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var trigger = player.querySelector('.play-overlay');
    var url = player.getAttribute('data-video');
    var loaded = false;

    function attachStream() {
      if (!video || !url || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = url;
      loaded = true;
    }

    function playVideo() {
      attachStream();
      if (cover) {
        cover.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }
});
