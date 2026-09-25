/* ==========================================================================
   main.js — Inicialización
   Renderiza el contenido estático que sale de data.js (habilidades, paleta,
   espaciado, foto) y arranca los módulos: tema, navegación, proyectos,
   contacto y editor. Se carga el último, con defer.
   ========================================================================== */

(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function data() {
    return window.PORTFOLIO_DATA || {};
  }

  /* --- Habilidades: grupos con chips y barra de nivel --- */
  function renderSkills() {
    var grid = document.getElementById('skills-grid');
    if (!grid) return;

    var levels = data().levels || { 1: 'básico', 2: 'intermedio', 3: 'avanzado' };
    var groups = data().skillGroups || [];

    grid.innerHTML = groups.map(function (group) {
      var skills = group.skills || [];
      var chips = skills.map(function (s) {
        var level = Math.min(3, Math.max(1, Number(s.level) || 1));
        var levelName = levels[level];
        return (
          '<li class="chip" title="' + esc(levelName) + '">' +
            '<span class="chip__icon" aria-hidden="true">' + esc(s.abbr) + '</span>' +
            '<span>' + esc(s.name) + '</span>' +
            '<span class="chip__level" aria-hidden="true"><span class="chip__level-fill chip__level-fill--' + level + '"></span></span>' +
            '<span class="sr-only">nivel ' + esc(levelName) + '</span>' +
          '</li>'
        );
      }).join('');

      return (
        '<li class="skill-group">' +
          '<div class="skill-group__head">' +
            '<h3 class="skill-group__title">' + esc(group.name) + '</h3>' +
            '<span class="skill-group__count">' + skills.length + ' ' + (skills.length === 1 ? 'item' : 'items') + '</span>' +
          '</div>' +
          '<ul class="chips" aria-label="Habilidades de ' + esc(group.name) + '">' + chips + '</ul>' +
        '</li>'
      );
    }).join('');
  }

  /* --- Design System: paleta pintada con las variables reales --- */
  function renderPalette() {
    var list = document.getElementById('ds-palette');
    if (!list) return;

    list.innerHTML = (data().palette || []).map(function (c) {
      /* Solo se permiten nombres de token del tipo --nombre */
      var token = /^--[a-z0-9-]+$/i.test(c.token) ? c.token : '--bg';
      return (
        '<li class="swatch">' +
          '<div class="swatch__color" style="background: var(' + token + ')" aria-hidden="true"></div>' +
          '<div class="swatch__meta">' +
            '<span class="swatch__name">' + esc(c.name) + '</span>' +
            '<span class="swatch__token">' + esc(c.token) + '</span>' +
            '<span class="swatch__values">' + esc(c.values) + '</span>' +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  /* --- Design System: escala de espaciado con barras a tamaño real --- */
  function renderSpacing() {
    var list = document.getElementById('ds-spacing');
    if (!list) return;

    list.innerHTML = (data().spacing || []).map(function (s) {
      var token = /^--[a-z0-9-]+$/i.test(s.token) ? s.token : '--sp-1';
      return (
        '<li class="space-row">' +
          '<span>' + esc(s.token) + '</span>' +
          '<span>' + esc(s.value) + '</span>' +
          '<span class="space-row__bar" style="width: var(' + token + ')" aria-hidden="true"></span>' +
        '</li>'
      );
    }).join('');
  }

  /* --- Foto del hero: la ruta viene de settings.photo (por defecto, la del HTML) --- */
  function renderPhoto() {
    var img = document.getElementById('hero-photo');
    if (!img) return;
    var photo = data().settings && data().settings.photo;
    if (typeof photo === 'string' && photo.trim()) img.src = photo.trim();
  }

  function renderAll() {
    renderSkills();
    renderPalette();
    renderSpacing();
    renderPhoto();
  }

  function init() {
    if (window.PortfolioTheme) window.PortfolioTheme.init();
    if (window.PortfolioNav) window.PortfolioNav.init();
    renderAll();
    if (window.PortfolioProjects) window.PortfolioProjects.init();
    if (window.PortfolioContact) window.PortfolioContact.init();
    if (window.PortfolioEditor) window.PortfolioEditor.init();
  }

  window.PortfolioMain = { renderAll: renderAll, renderSkills: renderSkills, renderPhoto: renderPhoto };

  /* Los scripts van con defer: el DOM ya está listo al ejecutarse */
  init();
})();
