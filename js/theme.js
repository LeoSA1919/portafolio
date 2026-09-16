/* ==========================================================================
   theme.js — Cambio de tema claro/oscuro con persistencia
   - Aplica data-theme en <html> (el CSS solo redefine variables).
   - Guarda la preferencia en localStorage bajo la clave 'portafolio-theme'.
   - Por defecto: oscuro.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'portafolio-theme';
  var root = document.documentElement;

  /* Lee el tema guardado; si no hay nada (o localStorage falla), usa 'dark' */
  function getSavedTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  /* Aplica el tema al documento y actualiza el toggle */
  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    var label = document.getElementById('theme-label');
    var toggle = document.getElementById('theme-toggle');
    if (label) label.textContent = theme;
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
      toggle.setAttribute('title', toggle.getAttribute('aria-label'));
    }
  }

  /* Guarda el tema (ignora errores de localStorage, p. ej. modo privado) */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* sin persistencia */ }
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function toggleTheme() {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    saveTheme(next);
  }

  /* Inicialización: se llama desde main.js */
  function init() {
    applyTheme(getSavedTheme());
    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.addEventListener('click', toggleTheme);
  }

  /* API pública mínima */
  window.PortfolioTheme = { init: init, toggle: toggleTheme, current: currentTheme };
})();
