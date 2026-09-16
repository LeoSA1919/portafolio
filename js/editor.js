/* ==========================================================================
   editor.js — Panel editor opcional (aislado)
   Permite cambiar la foto, agregar/editar/eliminar proyectos y habilidades
   sin tocar código. Los cambios se guardan en localStorage bajo la clave
   'portafolio-editor'.

   IMPORTANTE: localStorage es por navegador y por dispositivo. Lo que ve un
   visitante es lo que hay en js/data.js. Para hacer un cambio público y
   permanente: "Exportar JSON" → pegar en js/data.js → commit → push.

   Se desactiva poniendo settings.editorEnabled = false en js/data.js.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'portafolio-editor';
  var DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  /* --- Persistencia --- */

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* nada */ }
  }

  /* Parte de los datos que el editor gestiona (y que se exporta) */
  function snapshot() {
    return {
      settings: { photo: DATA.settings.photo, editorEnabled: DATA.settings.editorEnabled },
      projects: DATA.projects,
      skillGroups: DATA.skillGroups
    };
  }

  /* Aplica lo guardado ANTES de que main.js renderice (este script va antes) */
  function applyOverrides() {
    var saved = load();
    if (!saved) return;
    if (saved.settings && typeof saved.settings.photo === 'string') DATA.settings.photo = saved.settings.photo;
    if (Array.isArray(saved.projects)) DATA.projects = saved.projects;
    if (Array.isArray(saved.skillGroups)) DATA.skillGroups = saved.skillGroups;
  }

  applyOverrides();

  /* --- Utilidades --- */

  function $(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slug(text) {
    return String(text).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'proyecto';
  }

  function uniqueId(base) {
    var id = base;
    var n = 2;
    while (DATA.projects.some(function (p) { return p.id === id; })) id = base + '-' + n++;
    return id;
  }

  function setStatus(text) {
    var el = $('editor-status');
    if (el) el.textContent = text;
  }

  /* Re-pinta las partes del sitio afectadas */
  function refreshSite() {
    if (window.PortfolioMain) {
      window.PortfolioMain.renderSkills();
      window.PortfolioMain.renderPhoto();
    }
    if (window.PortfolioProjects) window.PortfolioProjects.refresh();
  }

  function reindexProjects() {
    DATA.projects.forEach(function (p, i) {
      p.index = String(i + 1).padStart(2, '0');
    });
  }

  /* --- Apertura / cierre --- */

  function setOpen(open) {
    var panel = $('editor');
    var toggle = $('editor-toggle');
    if (!panel) return;
    panel.hidden = !open;
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      renderLists();
      var first = panel.querySelector('input, button');
      if (first) first.focus();
    } else if (toggle) {
      toggle.focus();
    }
  }

  /* --- Foto --- */

  function initPhoto() {
    var form = $('editor-photo-form');
    if (!form) return;
    form.elements.photo.value = DATA.settings.photo || '';
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = form.elements.photo.value.trim();
      DATA.settings.photo = url || 'assets/img/hero-placeholder.svg';
      save();
      refreshSite();
      setStatus('Foto actualizada en este navegador.');
    });
  }

  /* --- Proyectos --- */

  function renderProjectList() {
    var list = $('editor-project-list');
    if (!list) return;
    list.innerHTML = DATA.projects.map(function (p) {
      return (
        '<li class="editor__item">' +
          '<span class="editor__item-name">' + esc(p.index) + ' · ' + esc(p.title) + '</span>' +
          '<span class="editor__item-actions">' +
            '<button class="editor__item-btn" type="button" data-edit-project="' + esc(p.id) + '">editar</button>' +
            '<button class="editor__item-btn" type="button" data-delete-project="' + esc(p.id) + '">borrar</button>' +
          '</span>' +
        '</li>'
      );
    }).join('');
  }

  function fillProjectForm(project) {
    var form = $('editor-project-form');
    form.elements.id.value = project ? project.id : '';
    form.elements.title.value = project ? project.title : '';
    form.elements.summary.value = project ? project.summary : '';
    form.elements.detail.value = project ? project.detail : '';
    form.elements.tags.value = project ? (project.tags || []).join(', ') : '';
    form.elements.year.value = project ? project.year : '';
    form.elements.role.value = project ? project.role : '';
    form.elements.repo.value = project ? project.repo : '';
    form.elements.demo.value = project ? project.demo : '';
    form.elements.image.value = project ? project.image : '';
    $('ep-submit').textContent = project ? 'Guardar cambios' : 'Agregar proyecto';
    $('ep-cancel').hidden = !project;
  }

  function initProjects() {
    var form = $('editor-project-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var f = form.elements;
      var title = f.title.value.trim();
      if (!title) {
        setStatus('El título es obligatorio.');
        f.title.focus();
        return;
      }

      var values = {
        title: title,
        summary: f.summary.value.trim(),
        detail: f.detail.value.trim(),
        tags: f.tags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        year: f.year.value.trim(),
        role: f.role.value.trim(),
        repo: f.repo.value.trim(),
        demo: f.demo.value.trim(),
        image: f.image.value.trim()
      };

      var existing = DATA.projects.filter(function (p) { return p.id === f.id.value; })[0];
      if (existing) {
        Object.keys(values).forEach(function (k) { existing[k] = values[k]; });
        existing.imageLabel = title + ' · captura 16:10';
        setStatus('Proyecto actualizado.');
      } else {
        values.id = uniqueId(slug(title));
        values.imageLabel = title + ' · captura 16:10';
        DATA.projects.push(values);
        setStatus('Proyecto agregado.');
      }

      reindexProjects();
      save();
      refreshSite();
      renderProjectList();
      fillProjectForm(null);
    });

    $('ep-cancel').addEventListener('click', function () {
      fillProjectForm(null);
    });

    $('editor-project-list').addEventListener('click', function (event) {
      var edit = event.target.closest('[data-edit-project]');
      var del = event.target.closest('[data-delete-project]');
      if (edit) {
        var p = DATA.projects.filter(function (x) { return x.id === edit.getAttribute('data-edit-project'); })[0];
        if (p) {
          fillProjectForm(p);
          $('ep-title').focus();
        }
      } else if (del) {
        var id = del.getAttribute('data-delete-project');
        if (!window.confirm('¿Eliminar este proyecto (solo en este navegador)?')) return;
        DATA.projects = DATA.projects.filter(function (x) { return x.id !== id; });
        reindexProjects();
        save();
        refreshSite();
        renderProjectList();
        setStatus('Proyecto eliminado.');
      }
    });
  }

  /* --- Habilidades --- */

  function renderSkillList() {
    var list = $('editor-skill-list');
    var select = $('es-group');
    if (!list || !select) return;

    var current = select.value;
    select.innerHTML = DATA.skillGroups.map(function (g, i) {
      return '<option value="' + i + '">' + esc(g.name) + '</option>';
    }).join('');
    if (current) select.value = current;

    var items = [];
    DATA.skillGroups.forEach(function (g, gi) {
      (g.skills || []).forEach(function (s, si) {
        items.push(
          '<li class="editor__item">' +
            '<span class="editor__item-name">' + esc(g.name) + ' · ' + esc(s.name) + ' (' + esc(s.abbr) + ')</span>' +
            '<span class="editor__item-actions">' +
              '<button class="editor__item-btn" type="button" data-delete-skill="' + gi + ':' + si + '">borrar</button>' +
            '</span>' +
          '</li>'
        );
      });
    });
    list.innerHTML = items.join('');
  }

  function initSkills() {
    var form = $('editor-skill-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var f = form.elements;
      var group = DATA.skillGroups[Number(f.group.value)];
      var abbr = f.abbr.value.trim();
      var name = f.name.value.trim();
      if (!group || !abbr || !name) {
        setStatus('Grupo, abreviatura y nombre son obligatorios.');
        return;
      }
      group.skills = group.skills || [];
      group.skills.push({ abbr: abbr, name: name, level: Number(f.level.value) || 2 });
      save();
      refreshSite();
      renderSkillList();
      f.abbr.value = '';
      f.name.value = '';
      setStatus('Habilidad agregada a ' + group.name + '.');
    });

    $('editor-skill-list').addEventListener('click', function (event) {
      var del = event.target.closest('[data-delete-skill]');
      if (!del) return;
      var parts = del.getAttribute('data-delete-skill').split(':');
      var group = DATA.skillGroups[Number(parts[0])];
      if (!group) return;
      group.skills.splice(Number(parts[1]), 1);
      save();
      refreshSite();
      renderSkillList();
      setStatus('Habilidad eliminada.');
    });
  }

  /* --- Exportar / restablecer --- */

  function initExport() {
    var output = $('editor-output');
    var copyBtn = $('editor-copy');

    $('editor-export').addEventListener('click', function () {
      output.value = JSON.stringify(snapshot(), null, 2);
      copyBtn.hidden = false;
      setStatus('JSON generado. Pégalo en js/data.js (settings, projects y skillGroups) y haz commit.');
      output.focus();
      output.select();
    });

    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output.value).then(function () {
          setStatus('Copiado al portapapeles.');
        }, function () {
          setStatus('No se pudo copiar; selecciona el texto y copia manualmente.');
        });
      } else {
        output.select();
        setStatus('Selecciona el texto y copia con Ctrl+C.');
      }
    });

    $('editor-reset').addEventListener('click', function () {
      if (!window.confirm('¿Descartar los cambios locales y volver a js/data.js?')) return;
      clear();
      window.location.reload();
    });
  }

  function renderLists() {
    renderProjectList();
    renderSkillList();
  }

  /* --- Inicialización (la llama main.js) --- */

  function init() {
    var toggle = $('editor-toggle');
    var panel = $('editor');
    if (!toggle || !panel) return;

    if (!DATA.settings || DATA.settings.editorEnabled === false) return; /* desactivado */

    toggle.hidden = false;
    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    $('editor-close').addEventListener('click', function () { setOpen(false); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    initPhoto();
    initProjects();
    initSkills();
    initExport();
    fillProjectForm(null);
    renderLists();

    if (load()) setStatus('Hay cambios locales guardados en este navegador.');
  }

  window.PortfolioEditor = { init: init, open: function () { setOpen(true); } };
})();
