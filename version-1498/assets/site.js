
document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(targetIndex);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var items = Array.prototype.slice.call(filterList.querySelectorAll('[data-title]'));

      items.forEach(function (item) {
        var title = (item.getAttribute('data-title') || '').toLowerCase();
        var tags = (item.getAttribute('data-tags') || '').toLowerCase();
        var text = item.textContent.toLowerCase();
        var matched = !keyword || title.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1 || text.indexOf(keyword) !== -1;
        item.classList.toggle('hidden-by-filter', !matched);
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');

  if (searchInput && searchResults && searchSummary) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    fetch('data/movies-search.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        function render(query) {
          var keyword = query.trim().toLowerCase();
          if (!keyword) {
            searchSummary.textContent = '输入关键词后展示匹配结果。';
            return;
          }

          var matchedMovies = movies.filter(function (movie) {
            var haystack = [
              movie.title,
              movie.year,
              movie.region,
              movie.type,
              movie.genre,
              movie.category,
              movie.description,
              (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
          }).slice(0, 120);

          searchSummary.textContent = matchedMovies.length ? '以下是与“' + query + '”相关的影片。' : '没有找到完全匹配的影片，可尝试更换关键词。';
          searchResults.innerHTML = matchedMovies.map(createCard).join('');
        }

        searchInput.addEventListener('input', function () {
          render(searchInput.value);
        });

        render(initialQuery);
      })
      .catch(function () {
        searchSummary.textContent = '搜索内容暂时无法加载，可通过分类页或影片索引继续浏览。';
      });
  }
});

function createCard(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return [
    '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ')) + '">',
    '  <a href="' + escapeHtml(movie.url) + '" class="card-poster" aria-label="观看 ' + escapeHtml(movie.title) + '">',
    '    <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="duration">' + escapeHtml(movie.duration) + '</span>',
    '    <span class="card-play">▶</span>',
    '  </a>',
    '  <div class="card-body">',
    '    <a href="' + escapeHtml(movie.url) + '"><h3>' + escapeHtml(movie.title) + '</h3></a>',
    '    <p>' + escapeHtml(movie.description) + '</p>',
    '    <div class="tag-line">' + tags + '</div>',
    '    <div class="meta-row">',
    '      <span>★ ' + escapeHtml(String(movie.rating)) + '</span>',
    '      <span>' + escapeHtml(movie.category) + '</span>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
