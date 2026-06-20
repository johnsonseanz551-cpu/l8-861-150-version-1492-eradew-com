(() => {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const previous = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let activeSlide = 0;
  let heroTimer = null;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === activeSlide);
    });
    dots.forEach((dot, position) => {
      dot.classList.toggle('is-active', position === activeSlide);
    });
  };

  const startHero = () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = window.setInterval(() => showSlide(activeSlide + 1), 5600);
    }
  };

  if (slides.length) {
    showSlide(0);
    startHero();
    if (previous) {
      previous.addEventListener('click', () => {
        showSlide(activeSlide - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        showSlide(activeSlide + 1);
        startHero();
      });
    }
    dots.forEach((dot, position) => {
      dot.addEventListener('click', () => {
        showSlide(position);
        startHero();
      });
    });
  }

  const textInputs = Array.from(document.querySelectorAll('[data-filter-text]'));
  const regionSelect = document.querySelector('[data-filter-region]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const empty = document.querySelector('[data-result-empty]');

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = () => {
    if (!cards.length) {
      return;
    }
    const query = normalize(textInputs.map((input) => input.value).find(Boolean) || '');
    const region = normalize(regionSelect ? regionSelect.value : '');
    const year = normalize(yearSelect ? yearSelect.value : '');
    const category = normalize(categorySelect ? categorySelect.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year,
        card.dataset.category
      ].join(' '));
      const okQuery = !query || haystack.includes(query);
      const okRegion = !region || normalize(card.dataset.region).includes(region);
      const okYear = !year || normalize(card.dataset.year) === year;
      const okCategory = !category || normalize(card.dataset.category) === category;
      const ok = okQuery && okRegion && okYear && okCategory;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  textInputs.forEach((input) => input.addEventListener('input', applyFilter));
  [regionSelect, yearSelect, categorySelect].forEach((control) => {
    if (control) {
      control.addEventListener('change', applyFilter);
    }
  });

  const topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', () => {
      topButton.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
