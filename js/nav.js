/* ==========================================================================
   nav.js — Menú responsive (hamburguesa) y botón "volver arriba"
   - En móvil (<860px) el nav se despliega bajo la cabecera con .is-open.
   - Se cierra al pulsar un enlace, con Escape o al clicar fuera.
   - El botón "volver arriba" aparece tras 480px de scroll.
   ========================================================================== */

(function () {
  'use strict';

  var SCROLL_THRESHOLD = 480;

  /* --- Menú móvil --- */
  function initMenu() {
    var btn = document.getElementById('menu-btn');
    var nav = document.getElementById('nav-principal');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    btn.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    /* Cerrar al elegir un enlace */
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    /* Cerrar con Escape */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        btn.focus();
      }
    });

    /* Cerrar al clicar fuera de la cabecera */
    document.addEventListener('click', function (event) {
      if (isOpen() && !event.target.closest('.site-header')) setOpen(false);
    });

    /* Si se agranda la ventana con el menú abierto, se cierra */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 860 && isOpen()) setOpen(false);
    });
  }

  /* --- Volver arriba --- */
  function initToTop() {
    var btn = document.getElementById('to-top');
    if (!btn) return;

    function update() {
      var visible = window.scrollY > SCROLL_THRESHOLD;
      if (visible === !btn.hidden) return; /* sin cambios */
      btn.hidden = !visible;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  function init() {
    initMenu();
    initToTop();
  }

  window.PortfolioNav = { init: init };
})();
