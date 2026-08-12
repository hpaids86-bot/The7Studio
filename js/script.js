/* ==========================================================================
   THE7STUDIO — JAVASCRIPT ENGINE v2.0
   Premium Photography & Cinematography Studio
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initCustomCursor();
  initNavigation();
  initScrollReveal();
  initScrollNav();
  initFloatingActions();
  initTypewriterEffect();
  initAboutStudioVideo();
  initGalleryFilter();
  initLightbox();
  initStatsCounter();
  initTestimonials();
  initHeroParallax();
  initServiceAccordion();
  console.log('THE7STUDIO initialized.');
});

/* ==========================================================================
   PAGE LOADER
   ========================================================================== */
function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const logo = loader.querySelector('.loader-logo');
  const sub  = loader.querySelector('.loader-sub');
  const bar  = loader.querySelector('.loader-bar');

  document.body.classList.add('loader-active');

  // Animate logo in
  setTimeout(() => { if (logo) logo.classList.add('visible'); }, 200);
  setTimeout(() => { if (sub)  sub.classList.add('visible'); }, 500);

  // Progress bar
  if (bar) {
    setTimeout(() => { bar.style.width = '70%'; }, 100);
    setTimeout(() => { bar.style.width = '100%'; }, 900);
  }

  // Hide loader
  const hideDelay = 1600;
  setTimeout(() => {
    loader.classList.add('loader-hidden');
    document.body.classList.remove('loader-active');

    // Trigger hero image zoom
    const hero = document.querySelector('.hero');
    if (hero) {
      setTimeout(() => hero.classList.add('loaded'), 100);
    }

    // Clean up
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 900);
  }, hideDelay);
}

/* ==========================================================================
   CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
  // Only for devices with real mouse (not touch)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const imageTargets = document.querySelectorAll('.gallery-item, .portfolio-item, .recent-work-card, .hero-bg');
  const linkTargets  = document.querySelectorAll('a, button, .service-row, .filter-btn');

  imageTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });

  linkTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-link'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-link'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initNavigation() {
  const toggle  = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  const body    = document.body;

  if (!toggle) return;

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = mobileMenu && mobileMenu.classList.contains('open');

    if (mobileMenu) mobileMenu.classList.toggle('open');
    body.classList.toggle('menu-open');

    // Icon swap
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
      mobileMenu.classList.remove('open');
      body.classList.remove('menu-open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    }
  });

  // Close on nav link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        body.classList.remove('menu-open');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }
}

/* ==========================================================================
   SCROLL-BASED NAV GLASS EFFECT
   ========================================================================== */
function initScrollNav() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   SCROLL REVEAL (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   FLOATING ACTIONS (Back to Top)
   ========================================================================== */
function initFloatingActions() {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   TYPEWRITER EFFECT (Hero)
   ========================================================================== */
function initTypewriterEffect() {
  const el = document.getElementById('typewriter-text') || document.querySelector('.typewriter-text');
  if (!el) return;

  const phrases = [
    'Cinematic Wedding Films',
    'Baby & Maternity Shoots',
    'Traditional Ceremonies',
    'Commercial Photography',
    'Drone Event Highlights',
    'Pre-Wedding Stories'
  ];

  let phraseIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const phrase = phrases[phraseIdx];
    el.textContent = isDeleting
      ? phrase.substring(0, charIdx - 1)
      : phrase.substring(0, charIdx + 1);

    isDeleting ? charIdx-- : charIdx++;

    let delay = isDeleting ? 35 : 90;

    if (!isDeleting && charIdx === phrase.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ==========================================================================
   ABOUT PAGE VIDEO
   ========================================================================== */
function initAboutStudioVideo() {
  const video = document.getElementById('about-studio-video');
  if (!video) return;

  video.play().catch(() => {});

  const btn  = document.getElementById('video-toggle-btn');
  const icon = document.getElementById('video-toggle-icon');

  if (btn && icon) {
    btn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        icon.className = 'fa-solid fa-pause';
      } else {
        video.pause();
        icon.className = 'fa-solid fa-play';
      }
    });
  }
}

/* ==========================================================================
   GALLERY FILTER
   ========================================================================== */
function initGalleryFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item, .portfolio-item');

  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const cat = item.dataset.category || '';
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   LIGHTBOX
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img     = lightbox.querySelector('#lightbox-img');
  const cap     = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let items = [];
  let currentIdx = 0;

  function getItems() {
    const filter = document.querySelector('.filter-btn.active');
    const active = filter ? filter.dataset.filter : 'all';
    const all = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
    return all;
  }

  function openLightbox(idx) {
    items = getItems();
    currentIdx = idx;
    showImage(currentIdx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(idx) {
    if (!items[idx]) return;
    const item = items[idx];
    const image = item.querySelector('img');
    if (img && image) img.src = image.src;
    if (cap) cap.textContent = image ? (image.alt || '') : '';
  }

  // Open on gallery item click
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      items = getItems();
      // Find actual index in visible items
      const visIdx = items.indexOf(item);
      openLightbox(visIdx >= 0 ? visIdx : 0);
    });
  });

  // Close
  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Prev / Next
  prevBtn && prevBtn.addEventListener('click', e => {
    e.stopPropagation();
    currentIdx = (currentIdx - 1 + items.length) % items.length;
    showImage(currentIdx);
  });

  nextBtn && nextBtn.addEventListener('click', e => {
    e.stopPropagation();
    currentIdx = (currentIdx + 1) % items.length;
    showImage(currentIdx);
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      showImage(currentIdx);
    }
    if (e.key === 'ArrowRight') {
      currentIdx = (currentIdx + 1) % items.length;
      showImage(currentIdx);
    }
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIdx = (currentIdx + 1) % items.length;
      } else {
        currentIdx = (currentIdx - 1 + items.length) % items.length;
      }
      showImage(currentIdx);
    }
  });
}

/* ==========================================================================
   STATS COUNTER ANIMATION
   ========================================================================== */
function initStatsCounter() {
  const statNums = document.querySelectorAll('.stat-number[data-target]');
  if (!statNums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isFloat = target % 1 !== 0;
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = eased * target;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = prefix + target + suffix;
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

/* ==========================================================================
   TESTIMONIALS SLIDER
   ========================================================================== */
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.testimonial-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function show(idx) {
    slides.forEach((s, i) => {
      s.style.opacity = i === idx ? '1' : '0';
      s.style.position = i === idx ? 'relative' : 'absolute';
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
  }

  function next() {
    show((current + 1) % slides.length);
  }

  function startTimer() {
    timer = setInterval(next, 5000);
  }

  show(0);
  startTimer();

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      show(i);
      startTimer();
    });
  });
}

/* ==========================================================================
   HERO PARALLAX (subtle)
   ========================================================================== */
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroH = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    if (scrolled > heroH) return;
    const offset = scrolled * 0.25;
    heroBg.style.transform = `scale(1.0) translateY(${offset}px)`;
  }, { passive: true });
}

/* ==========================================================================
   SERVICE ACCORDION (Services Page)
   ========================================================================== */
function initServiceAccordion() {
  const rows = document.querySelectorAll('.service-row-detail');
  if (!rows.length) return;

  rows.forEach(row => {
    row.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      // Close all
      rows.forEach(r => r.classList.remove('open'));
      // Open clicked if it was closed
      if (!isOpen) row.classList.add('open');
    });
  });
}

/* ==========================================================================
   WHATSAPP FORM SUBMISSION (Preserved)
   ========================================================================== */
function handleWhatsAppFormSubmission(event, formType) {
  event.preventDefault();
  const form = event.target;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
  }

  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }

  let message = `*New ${formType.charAt(0).toUpperCase() + formType.slice(1)} Request — The7Studio*\n\n`;
  for (let [key, value] of Object.entries(data)) {
    const formattedValue = Array.isArray(value) ? value.join(', ') : value;
    let label = key.charAt(0).toUpperCase() + key.slice(1);
    if (key === 'service') label = 'Event Type';
    if (key === 'services') label = 'Services Required';
    message += `*${label}*: ${formattedValue}\n`;
  }

  const phoneNumber = '919790301168';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');

  form.reset();
  if (submitBtn) {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }

  // Success toast
  showSuccessToast();
}

function showSuccessToast() {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: #151515; border: 1px solid rgba(200,169,107,0.4);
    color: #F5F1E8; padding: 1rem 2rem; font-size: 0.85rem; font-weight: 500;
    letter-spacing: 0.05em; z-index: 99999; font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    animation: fadeSlideUp 0.4s ease-out;
  `;
  toast.innerHTML = '<i class="fa-brands fa-whatsapp" style="color:#25D366;margin-right:0.5rem"></i> Opening WhatsApp...';

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ==========================================================================
   LEGACY CANVAS HERO BG (for index.html fallback)
   ========================================================================== */
function initHeroBgCanvas() {
  const canvas = document.getElementById('hero-video-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 35 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 5 + 1.5,
    colorPrefix: ['rgba(200,169,107,','rgba(227,201,138,','rgba(255,255,255,'][Math.floor(Math.random()*3)],
    alpha: Math.random() * 0.4 + 0.08,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.5 - 0.1,
    ps: Math.random() * 0.015 + 0.004
  }));

  let angle = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);
    angle += 0.006;

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += Math.sin(angle * 2) * p.ps;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const a = Math.max(0.04, Math.min(0.55, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.colorPrefix + a + ')';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
}
