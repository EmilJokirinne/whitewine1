/* WhiteWine.fi – käyttöliittymän toiminnot (ei riippuvuuksia) */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: varjo vierittäessä ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobiilivalikko ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('paavalikko');
  var toggleLabel = toggle.querySelector('.visually-hidden');
  var desktopMQ = window.matchMedia('(min-width: 1080px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Sulje valikko' : 'Avaa valikko';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && !desktopMQ.matches) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Pidä fokus valikossa kun se on auki (mobiili)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
    var focusables = Array.prototype.slice.call(nav.querySelectorAll('a')).concat([toggle]);
    var firstEl = focusables[0];
    var lastEl = focusables[focusables.length - 1];
    if (focusables.indexOf(document.activeElement) === -1) {
      e.preventDefault(); firstEl.focus();
    } else if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault(); lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault(); firstEl.focus();
    }
  });

  desktopMQ.addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Aktiivinen navigaatiolinkki ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]:not(.btn)'));
  var sectionMap = {
    etusivu: 'etusivu',
    valkoviinit: 'valkoviinit', tyylit: 'valkoviinit',
    rypaleet: 'rypaleet',
    ruokaparit: 'ruokaparit', tarjoilu: 'ruokaparit',
    alueet: 'alueet',
    maistelu: 'abc', abc: 'abc', ukk: 'abc'
  };
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = sectionMap[entry.target.id];
        navLinks.forEach(function (a) {
          if (target && a.getAttribute('href') === '#' + target) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(sectionMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Paljastus vierittäessä ---------- */
  var revealEls = document.querySelectorAll('.reveal, .thermo');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    // Porrastus saman listan korteille
    document.querySelectorAll('ul, ol, dl, .hero-text').forEach(function (group) {
      var items = group.querySelectorAll(':scope > .reveal, :scope > li.reveal, :scope > div.reveal');
      items.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
      });
    });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- UKK-haitari ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Viinialue-välilehdet ---------- */
  var tablist = document.querySelector('.region-tabs');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    var selectTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      });
      if (focus) tab.focus();
      if (tab.scrollIntoView && window.innerWidth < 900) {
        tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var idx = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') idx = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') idx = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') idx = 0;
        if (e.key === 'End') idx = tabs.length - 1;
        if (idx !== null) { e.preventDefault(); selectTab(tabs[idx], true); }
      });
    });
  }

  /* ---------- "Näytä lisää" -painikkeet ---------- */
  document.querySelectorAll('.more-toggle').forEach(function (btn) {
    var closedHTML = btn.innerHTML;
    var openText = btn.getAttribute('data-open-text');
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      target.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
      btn.innerHTML = open ? closedHTML : openText + ' <span aria-hidden="true">→</span>';
    });
  });

  /* ---------- Uutiskirjelomake ---------- */
  var form = document.getElementById('uutiskirje-lomake');
  if (form) {
    var email = form.querySelector('#email');
    var consent = form.querySelector('#suostumus');
    var emailErr = document.getElementById('email-virhe');
    var consentErr = document.getElementById('suostumus-virhe');
    var success = document.getElementById('lomake-kiitos');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      emailErr.textContent = '';
      consentErr.textContent = '';
      email.removeAttribute('aria-invalid');
      consent.removeAttribute('aria-invalid');

      if (!emailRe.test(email.value.trim())) {
        emailErr.textContent = 'Tarkista sähköpostiosoite.';
        email.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!consent.checked) {
        consentErr.textContent = 'Vahvista täysi-ikäisyytesi ja suostumuksesi tilaukseen.';
        consent.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!ok) {
        (email.hasAttribute('aria-invalid') ? email : consent).focus();
        return;
      }

      /* Kytke tähän uutiskirjepalvelun rajapinta (esim. fetch POST). */
      success.hidden = false;
      success.textContent = 'Kiitos! Saat pian vahvistusviestin osoitteeseen ' + email.value.trim() + '.';
      form.reset();
    });
  }

  /* ---------- Vuosiluku ---------- */
  var year = document.getElementById('vuosi');
  if (year) {
    var y = new Date().getFullYear();
    if (y >= 2026) year.textContent = String(y);
  }
})();
