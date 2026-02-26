/* ===========================
   LUOVA KAMPAAMO – main.js
   =========================== */

(function () {
  'use strict';

  /* ---- VUOSI FOOTERISSA ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- NAVIGAATIO: SCROLL-LUOKKA ---- */
  const header = document.querySelector('.site-header');

  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ---- HAMPURILAISVALIKKO ---- */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  function closeMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger && navMenu) {

    hamburger.addEventListener('click', function () {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Sulje valikko navigointilinkkiä klikatessa
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Sulje Esc-näppäimellä
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Sulje klikatessa valikon ulkopuolelle
    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---- SCROLL REVEAL ---- */
  const revealSelectors = [
    '.service-card',
    '.pricing-table',
    '.trust-item',
    '.about-content',
    '.about-image-wrap',
    '.contact-list',
    '.map-placeholder',
    '.form-intro',
    '#contact-form'
  ].join(', ');

  const revealEls = document.querySelectorAll(revealSelectors);

  if ('IntersectionObserver' in window && revealEls.length > 0) {

    revealEls.forEach(function (el) {
      el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold:  0.10,
        rootMargin: '0px 0px -36px 0px'
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });

  } else {
    // Fallback vanhoille selaimille
    revealEls.forEach(function (el) {
      el.classList.add('reveal', 'visible');
    });
  }

  /* ---- YHTEYDENOTTOLOMAKE ---- */
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const feedback   = document.getElementById('form-feedback');

  if (form && submitBtn && feedback) {

    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Kentät
      const nameField    = form.querySelector('#name');
      const phoneField   = form.querySelector('#phone');
      const messageField = form.querySelector('#message');

      // Validointi
      if (
        !nameField.value.trim() ||
        !phoneField.value.trim() ||
        !messageField.value.trim()
      ) {
        showFeedback('error', 'Täytä pakolliset kentät: nimi, puhelinnumero ja viesti.');
        nameField.focus();
        return;
      }

      setLoading(true);
      hideFeedback();

      try {
        const response = await fetch(form.action, {
          method:  'POST',
          headers: { 'Accept': 'application/json' },
          body:    new FormData(form),
        });

        if (response.ok) {
          showFeedback(
            'success',
            '✓ Viesti lähetetty! Olemme sinuun yhteydessä pian. Voit myös soittaa suoraan numeroon 040 0450902.'
          );
          form.reset();
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } else {
          let errorMsg = 'Lähetys epäonnistui. Yritä uudelleen tai soita suoraan: 040 0450902.';
          try {
            const data = await response.json();
            if (data && data.errors && data.errors.length > 0) {
              errorMsg = data.errors.map(function (err) {
                return err.message;
              }).join(' ');
            }
          } catch (_) {
            // Käytetään oletusvirheviestiä
          }
          showFeedback('error', errorMsg);
        }

      } catch (networkErr) {
        showFeedback(
          'error',
          'Verkkovirhe – tarkista internetyhteys ja yritä uudelleen.'
        );
      } finally {
        setLoading(false);
      }
    });

    function setLoading(isLoading) {
      submitBtn.disabled = isLoading;
      if (btnText)    btnText.hidden    =  isLoading;
      if (btnLoading) btnLoading.hidden = !isLoading;
    }

    function showFeedback(type, message) {
      feedback.className   = 'form-feedback ' + type;
      feedback.textContent = message;
      feedback.hidden      = false;
    }

    function hideFeedback() {
      feedback.hidden    = true;
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }
  }

  /* ---- SMOOTH SCROLL ANKKURILINKEILLE ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Lue nav-korkeus CSS-muuttujasta tai käytä oletusta
      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || '72',
        10
      );

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ---- AKTIIVINEN NAVIGOINTILINKKI SKROLLATESSA ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0) {

    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold:  0
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

})();