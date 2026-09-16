/* ==========================================================================
   projects.js — Proyectos: tarjetas, filtro por tecnología y modal
   - Las tarjetas <article> se generan desde PORTFOLIO_DATA.projects.
   - Los filtros se derivan de las tags: ['Todos', ...new Set(tags)].
   - El modal se cierra con el botón ×, clic en el overlay o Escape,
     y devuelve el foco al elemento que lo abrió.
   ========================================================================== */

(function () {
  'use strict';

  var state = { filter: 'Todos', openerEl: null };

  /* --- Utilidades --- */

  /* Escapa texto antes de insertarlo con innerHTML */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Un enlace es "real" si no está vacío ni es un placeholder tipo [TEXTO] o '#' */
  function isRealUrl(value) {
    if (!value) return false;
    var v = String(value).trim();
    return v !== '#' && !/^\[.*\]$/.test(v);
  }

  /* Normaliza una URL escrita sin protocolo (booking.nexcodeec.com) */
  function normalizeUrl(value) {
    var v = String(value).trim();
    return /^(https?:)?\/\//i.test(v) ? v : 'https://' + v;
  }

  function projects() {
    return (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.projects) || [];
  }

  function tagsHtml(tags) {
    return (tags || []).map(function (t) {
      return '<li class="tag">' + esc(t) + '</li>';
    }).join('');
  }

  /* --- Tarjetas --- */

  function mediaHtml(project) {
    var alt = 'Captura de pantalla del proyecto ' + project.title;
    if (isRealUrl(project.image)) {
      return '<img src="' + esc(project.image) + '" alt="' + esc(alt) + '" loading="lazy">';
    }
    return '<span class="placeholder-label">' + esc(project.imageLabel || (project.title + ' · captura 16:10')) + '</span>';
  }

  function linkHtml(url, glyph, label, extraClass) {
    if (isRealUrl(url)) {
      return '<a class="card__link ' + extraClass + '" href="' + esc(normalizeUrl(url)) + '" target="_blank" rel="noreferrer">' +
        '<span class="mono" aria-hidden="true">' + glyph + '</span> ' + esc(label) + '</a>';
    }
    /* Sin URL todavía: no se renderiza un enlace roto */
    return '<span class="card__link card__link--pending" title="Enlace pendiente">' +
      '<span class="mono" aria-hidden="true">' + glyph + '</span> ' + esc(label) + ' (pendiente)</span>';
  }

  function cardHtml(project) {
    return (
      '<article class="card" data-id="' + esc(project.id) + '">' +
        '<figure class="card__media">' +
          mediaHtml(project) +
          '<span class="card__index" aria-hidden="true">' + esc(project.index) + '</span>' +
          '<figcaption class="sr-only">Vista previa de ' + esc(project.title) + '</figcaption>' +
        '</figure>' +
        '<div class="card__body">' +
          '<div class="card__heading">' +
            '<h3 class="card__title">' + esc(project.title) + '</h3>' +
            '<p class="card__summary">' + esc(project.summary) + '</p>' +
          '</div>' +
          '<ul class="tags" aria-label="Tecnologías">' + tagsHtml(project.tags) + '</ul>' +
          '<div class="card__footer">' +
            '<button class="btn btn--primary btn--sm" type="button" data-open-project="' + esc(project.id) + '" aria-haspopup="dialog">Detalles</button>' +
            linkHtml(project.repo, '&lt;/&gt;', 'Repo', 'card__link--repo') +
            linkHtml(project.demo, '↗', 'Demo', 'card__link--demo') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects() {
    var grid = document.getElementById('projects-grid');
    var empty = document.getElementById('projects-empty');
    if (!grid) return;

    var list = projects().filter(function (p) {
      return state.filter === 'Todos' || (p.tags || []).indexOf(state.filter) !== -1;
    });

    grid.innerHTML = list.map(cardHtml).join('');
    if (empty) empty.hidden = list.length > 0;
  }

  /* --- Filtros --- */

  function allTags() {
    var seen = [];
    projects().forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        if (seen.indexOf(t) === -1) seen.push(t);
      });
    });
    return ['Todos'].concat(seen);
  }

  function renderFilters() {
    var box = document.getElementById('project-filters');
    if (!box) return;

    /* Si la tag activa ya no existe (p. ej. tras editar), vuelve a "Todos" */
    var tags = allTags();
    if (tags.indexOf(state.filter) === -1) state.filter = 'Todos';

    box.innerHTML = tags.map(function (tag) {
      var active = tag === state.filter;
      return '<button class="filter' + (active ? ' is-active' : '') + '" type="button" data-filter="' + esc(tag) + '" aria-pressed="' + active + '">' + esc(tag) + '</button>';
    }).join('');
  }

  function setFilter(tag) {
    state.filter = tag;
    renderFilters();
    renderProjects();
  }

  /* --- Modal --- */

  var modal, panel;

  function focusables() {
    return Array.prototype.slice.call(
      panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  function setModalLink(id, url) {
    var link = document.getElementById(id);
    if (!link) return;
    if (isRealUrl(url)) {
      link.href = normalizeUrl(url);
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('title', 'Enlace pendiente');
    }
  }

  function openModal(project, opener) {
    if (!modal || !project) return;
    state.openerEl = opener || document.activeElement;

    document.getElementById('modal-meta').textContent =
      [project.index, project.year, project.role].filter(Boolean).join(' · ');
    document.getElementById('modal-title').textContent = project.title || '';
    document.getElementById('modal-summary').textContent = project.summary || '';
    document.getElementById('modal-detail').textContent = project.detail || '';
    document.getElementById('modal-tags').innerHTML = tagsHtml(project.tags);

    var media = document.getElementById('modal-media');
    var caption = document.getElementById('modal-figcaption');
    media.innerHTML = mediaHtml(project);
    if (caption) media.appendChild(caption);
    caption.textContent = 'Imagen del proyecto ' + (project.title || '');

    setModalLink('modal-repo', project.repo);
    setModalLink('modal-demo', project.demo);

    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('modal-close').focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (state.openerEl && typeof state.openerEl.focus === 'function') state.openerEl.focus();
    state.openerEl = null;
  }

  function findProject(id) {
    return projects().filter(function (p) { return p.id === id; })[0] || null;
  }

  function initModal() {
    modal = document.getElementById('project-modal');
    if (!modal) return;
    panel = modal.querySelector('.modal__panel');

    /* Clic en el overlay cierra; clic dentro del panel no */
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeModal);

    /* Escape cierra; Tab queda atrapado dentro del panel */
    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key === 'Tab') {
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    /* Botón de ejemplo del Design System: abre el primer proyecto */
    var sample = document.getElementById('ds-open-modal');
    if (sample) {
      sample.addEventListener('click', function () {
        openModal(projects()[0], sample);
      });
    }
  }

  /* --- Inicialización --- */

  function init() {
    renderFilters();
    renderProjects();
    initModal();

    /* Delegación de eventos: filtros y botones "Detalles" */
    var filters = document.getElementById('project-filters');
    if (filters) {
      filters.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-filter]');
        if (btn) setFilter(btn.getAttribute('data-filter'));
      });
    }

    var grid = document.getElementById('projects-grid');
    if (grid) {
      grid.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-open-project]');
        if (btn) openModal(findProject(btn.getAttribute('data-open-project')), btn);
      });
    }
  }

  /* Vuelve a pintar todo (lo usa el panel editor tras cambios) */
  function refresh() {
    renderFilters();
    renderProjects();
  }

  window.PortfolioProjects = { init: init, refresh: refresh, open: openModal, close: closeModal };
})();
