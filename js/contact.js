/* ==========================================================================
   contact.js — Validación del formulario y envío real con Web3Forms
   Reglas:
     - Nombre: obligatorio.
     - Correo: formato válido (expresión regular).
     - Mensaje: mínimo 10 caracteres (tras trim).
   Envío:
     - fetch POST a https://api.web3forms.com/submit con la access_key del
       campo oculto. Estados: enviando / enviado / error.
     - Si la clave sigue siendo el placeholder [WEB3FORMS_ACCESS_KEY], el
       formulario solo valida y avisa que falta configurar la clave.
   ========================================================================== */

(function () {
  'use strict';

  var ENDPOINT = 'https://api.web3forms.com/submit';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_MESSAGE = 10;

  var form, status, submitBtn;

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

  /* --- Estado del envío --- */

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add('is-' + kind);
    status.hidden = !text;
  }

  function setSending(sending) {
    if (!submitBtn) return;
    submitBtn.disabled = sending;
    submitBtn.textContent = sending ? 'Enviando…' : 'Enviar mensaje';
  }

  function accessKey() {
    var input = form.elements.access_key;
    return input ? input.value.trim() : '';
  }

  function hasRealKey() {
    var key = accessKey();
    return key && !/^\[.*\]$/.test(key);
  }

  /* --- Envío --- */

  function send() {
    var payload = {
      access_key: accessKey(),
      subject: form.elements.subject ? form.elements.subject.value : 'Nuevo mensaje desde el portafolio',
      from_name: form.elements.from_name ? form.elements.from_name.value : 'Portafolio',
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      botcheck: form.elements.botcheck ? form.elements.botcheck.checked : false
    };

    setSending(true);
    setStatus('Enviando…', '');

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error del servicio');
          }
          return data;
        });
      })
      .then(function () {
        setStatus('✓ Mensaje enviado. ¡Gracias!', 'success');
        form.reset();
      })
      .catch(function () {
        setStatus('✕ No se pudo enviar. Inténtalo de nuevo o escribe al correo.', 'error');
      })
      .then(function () {
        setSending(false);
      });
  }

  function onSubmit(event) {
    event.preventDefault();
    setStatus('', '');

    if (!validateAll()) return;

    /* Honeypot marcado: probable bot, se ignora en silencio */
    if (form.elements.botcheck && form.elements.botcheck.checked) {
      setStatus('✓ Mensaje enviado. ¡Gracias!', 'success');
      form.reset();
      return;
    }

    if (!hasRealKey()) {
      /* Sin clave configurada no hay entrega real: se avisa con claridad */
      setStatus('✓ Formulario válido (demo). Configura la access_key de Web3Forms para enviar de verdad.', 'success');
      return;
    }

    send();
  }

  /* El error de un campo se limpia al escribir y se resetea el estado "enviado" */
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
    submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', onSubmit);
    form.addEventListener('input', onInput);
  }

  window.PortfolioContact = { init: init, validate: validateAll };
})();
