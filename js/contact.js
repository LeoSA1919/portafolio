/* ==========================================================================
   contact.js — Validación del formulario y confirmación en pantalla
   Reglas:
     - Nombre: obligatorio.
     - Correo: formato válido (expresión regular).
     - Mensaje: mínimo 10 caracteres (tras trim).
   Envío:
     - Solo del lado del cliente: no hay petición a ningún servicio.
     - Si la validación pasa, se muestra "✓ Mensaje enviado" junto al botón
       y se limpian los campos. Corregir y reenviar vuelve a funcionar.
   ========================================================================== */

(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_MESSAGE = 10;

  var form, status;

  /* --- Validación --- */

  function validators() {
    return {
      name: function (value) {
        return value.trim() ? '' : 'El nombre es obligatorio';
      },
      email: function (value) {
        return EMAIL_RE.test(value.trim()) ? '' : 'Introduce un correo válido';
      },
      message: function (value) {
        return value.trim().length >= MIN_MESSAGE ? '' : 'Mínimo ' + MIN_MESSAGE + ' caracteres';
      }
    };
  }

  function setFieldError(name, message) {
    var input = form.elements[name];
    var errorEl = document.getElementById(name + '-error');
    var field = input && input.closest('.field');
    if (errorEl) errorEl.textContent = message;
    if (field) field.classList.toggle('field--error', !!message);
    if (input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  /* Valida todos los campos; devuelve true si no hay errores */
  function validateAll() {
    var rules = validators();
    var firstInvalid = null;

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      var message = rules[name](input ? input.value : '');
      setFieldError(name, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* --- Estado --- */

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add('is-' + kind);
    status.hidden = !text;
  }

  /* --- Envío (simulado): confirma y limpia --- */

  function onSubmit(event) {
    event.preventDefault();
    setStatus('', '');

    if (!validateAll()) return;

    form.reset();
    setStatus('✓ Mensaje enviado', 'success');
  }

  /* El error de un campo se limpia al escribir y se oculta la confirmación */
  function onInput(event) {
    var input = event.target;
    if (!input.name || !validators()[input.name]) return;
    setFieldError(input.name, '');
    if (status && !status.hidden) setStatus('', '');
  }

  function init() {
    form = document.getElementById('contact-form');
    if (!form) return;
    status = document.getElementById('form-status');

    form.addEventListener('submit', onSubmit);
    form.addEventListener('input', onInput);
  }

  window.PortfolioContact = { init: init, validate: validateAll };
})();
