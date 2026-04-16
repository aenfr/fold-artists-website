/* ══════════════════════════════════════════════════════════════
   FOLD ARTISTS — Marketing Website Interactions
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── NAVBAR SCROLL ──────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavScroll() {
    const y = window.scrollY;
    if (y > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ─── MOBILE NAV TOGGLE ──────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── SCROLL REVEAL (Intersection Observer) ──────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── ATTRIBUTION BAR ANIMATION ──────────────────────────────
  const attrBars = document.querySelectorAll('.attribution-bar');

  if (attrBars.length > 0 && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger the bars
            const bars = entry.target.closest('.demo-results')
              ? entry.target.closest('.demo-results').querySelectorAll('.attribution-bar')
              : [entry.target];

            bars.forEach(function (bar, i) {
              setTimeout(function () {
                bar.classList.add('animated');
              }, i * 150);
            });

            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Only observe the first bar — it triggers all siblings
    barObserver.observe(attrBars[0]);
  }

  // ─── MARKET VALUE COUNTER ANIMATION ─────────────────────────
  const marketCards = document.querySelectorAll('.market-value[data-target]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();
    const decimals = target % 1 !== 0 ? 1 : 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (target * eased).toFixed(decimals);
      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (marketCards.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    marketCards.forEach(function (card) {
      counterObserver.observe(card);
    });
  }

  // ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ─── ACTIVE NAV LINK HIGHLIGHTING ───────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.nav-link');

  function highlightNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinksList.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ─── TYPING EFFECT FOR DEMO CODE ────────────────────────────
  const demoCode = document.querySelector('.demo-code');
  if (demoCode && 'IntersectionObserver' in window) {
    const codeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            demoCode.classList.add('typing');
            codeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    codeObserver.observe(demoCode);
  }
})();
