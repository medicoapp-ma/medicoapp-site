(() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const progressBar = $('#progressBar');
  const siteHeader = $('.site-header');
  const navToggle = $('#navToggle');
  const mainNav = $('#mainNav');
  const cursorGlow = $('#cursorGlow');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateChrome = () => {
    const root = document.documentElement;
    const scrollable = root.scrollHeight - root.clientHeight;
    const ratio = scrollable > 0 ? root.scrollTop / scrollable : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    siteHeader?.classList.toggle('is-scrolled', root.scrollTop > 18);
  };
  addEventListener('scroll', updateChrome, { passive: true });
  updateChrome();

  if (cursorGlow && matchMedia('(pointer: fine)').matches && !reducedMotion) {
    cursorGlow.classList.add('is-active');
    addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mainNav.classList.toggle('is-open', !open);
      const label = navToggle.querySelector('.sr-only');
      if (label) label.textContent = !open ? (label.dataset.closeLabel || 'Fermer le menu') : (label.dataset.openLabel || 'Ouvrir le menu');
    });
    const closeNavigation = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
      const label = navToggle.querySelector('.sr-only');
      if (label) label.textContent = label.dataset.openLabel || 'Ouvrir le menu';
    };
    $$('a', mainNav).forEach((link) => link.addEventListener('click', closeNavigation));
    addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNavigation();
    });
    addEventListener('pointerdown', (event) => {
      if (!mainNav.classList.contains('is-open')) return;
      if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNavigation();
    });
  }

  // Deterministic scrollspy for the fixed header. The last section crossing
  // the reading line owns the active navigation item.
  const navLinks = $$('a[href^="#"]', mainNav || document);
  const sectionMap = navLinks
    .map((link) => ({ link, section: $(link.getAttribute('href')) }))
    .filter((item) => item.section);

  let navigationFrame = 0;
  const updateActiveNavigation = () => {
    navigationFrame = 0;
    if (!sectionMap.length) return;

    const headerHeight = siteHeader?.getBoundingClientRect().height || 0;
    const readingLine = headerHeight + Math.min(170, innerHeight * .24);
    let activeItem = sectionMap[0];

    sectionMap.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= readingLine) activeItem = item;
    });

    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 3) {
      activeItem = sectionMap[sectionMap.length - 1];
    }

    sectionMap.forEach(({ link }) => {
      const active = link === activeItem.link;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const scheduleActiveNavigation = () => {
    if (navigationFrame) return;
    navigationFrame = requestAnimationFrame(updateActiveNavigation);
  };

  addEventListener('scroll', scheduleActiveNavigation, { passive: true });
  addEventListener('resize', scheduleActiveNavigation, { passive: true });
  navLinks.forEach((link) => link.addEventListener('click', () => {
    navLinks.forEach((item) => {
      const active = item === link;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  }));
  updateActiveNavigation();

  const revealItems = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Product screenshots: mouse, touch and keyboard share one state transition.
  const tabs = $$('.experience-tab');
  const copies = $$('.experience-text');
  const images = $$('.screen-image');
  const activateScreen = (key, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.screen === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) {
        tab.focus({ preventScroll: true });
        tab.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    copies.forEach((copy) => {
      const active = copy.dataset.copy === key;
      copy.classList.toggle('is-active', active);
      copy.hidden = !active;
      copy.setAttribute('aria-hidden', String(!active));
    });
    images.forEach((image) => {
      const active = image.dataset.image === key;
      image.classList.toggle('is-active', active);
      image.setAttribute('aria-hidden', String(!active));
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateScreen(tab.dataset.screen));
    tab.addEventListener('keydown', (event) => {
      const horizontal = matchMedia('(max-width: 780px)').matches;
      const previousKeys = horizontal ? ['ArrowLeft'] : ['ArrowUp', 'ArrowLeft'];
      const nextKeys = horizontal ? ['ArrowRight'] : ['ArrowDown', 'ArrowRight'];
      let target = null;
      if (previousKeys.includes(event.key)) target = (index - 1 + tabs.length) % tabs.length;
      if (nextKeys.includes(event.key)) target = (index + 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      activateScreen(tabs[target].dataset.screen, true);
    });
  });

  const lightbox = $('#lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const openLightbox = (src, alt = 'Capture MedicoApp') => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.showModal();
  };
  $$('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    openLightbox(button.dataset.lightbox, button.querySelector('img')?.alt);
  }));
  $('.zoom-button')?.addEventListener('click', () => {
    const image = $('.screen-image.is-active');
    if (image) openLightbox(image.src, image.alt);
  });
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  const tilt = $('[data-tilt]');
  if (tilt && matchMedia('(pointer: fine)').matches && !reducedMotion) {
    tilt.addEventListener('pointermove', (event) => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      tilt.style.transform = `perspective(1500px) rotateY(${x * 2.6}deg) rotateX(${-y * 1.8}deg) translateY(-2px)`;
    });
    tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }
})();
