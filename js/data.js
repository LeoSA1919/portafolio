/* ==========================================================================
   data.js — Contenido del portafolio
   Define el objeto global window.PORTFOLIO_DATA que consumen los demás
   scripts. Para cambiar textos, proyectos o habilidades edita este archivo
   La foto del hero se define directamente en index.html (assets/img/hero.jpg).
   ========================================================================== */

window.PORTFOLIO_DATA = {

  /* --- Proyectos (cada uno se renderiza como <article>).
         url = enlace público del proyecto (botón "Ver en vivo");
         image = ruta relativa a la captura; imageAlt = texto alternativo;
         imagePosition (opcional) = object-position para elegir qué zona de
         la captura queda visible al recortarla a 16:10. --- */
  projects: [
    {
      id: 'chatbot-skytech',
      index: '01',
      title: 'Chatbot de cotizaciones — Skytech-Geo',
      year: '2025',
      role: 'Backend · Automatización',
      summary: 'Chatbot que cotiza servicios de topografía y geoespaciales de forma automática.',
      detail: 'Problema: los clientes pedían cotizaciones por mensajería y cada respuesta era manual. El bot recoge los parámetros del servicio, calcula la cotización y la entrega al instante, dejando registro para el equipo comercial.',
      tags: ['Python', 'Django'],
      url: 'https://skytech-geo.com/',
      image: 'assets/img/proyecto-sky.png',
      imageAlt: 'Captura del chatbot de cotizaciones de Skytech-Geo'
    },
    {
      id: 'chatbot-infraopera',
      index: '02',
      title: 'Chatbot — InfraOpera',
      year: '2025',
      role: 'Backend · Automatización',
      summary: 'Atención y consulta automatizada para la plataforma InfraOpera.',
      detail: 'Problema: dar respuesta inmediata a consultas frecuentes y guiar a los usuarios dentro de la plataforma sin depender de un operador. El bot responde, orienta y escala a una persona cuando hace falta.',
      tags: ['Python', 'Django'],
      url: 'https://infraopera.com/',
      image: 'assets/img/proyecto-infraopera.png',
      imageAlt: 'Captura del chatbot de InfraOpera',
      imagePosition: 'center top'
    },
    {
      id: 'stripe-readyfy',
      index: '03',
      title: 'Integración de Stripe en ReadyFy',
      year: '2025',
      role: 'Backend · Pagos',
      summary: 'Suscripciones y pagos recurrentes para los planes de ReadyFy.',
      detail: 'Problema: cobrar planes de forma segura y recurrente. Se integró Stripe (Checkout, Customer Portal y webhooks) para alta de suscripciones, renovaciones, cancelaciones y sincronización del estado de pago con la plataforma.',
      tags: ['Django', 'Stripe'],
      url: 'https://readyfy.ai/suscriber/',
      image: 'assets/img/proyecto-readyfy.png',
      imageAlt: 'Captura de la pantalla de suscripción de ReadyFy'
    }
  ],

  /* --- Habilidades: nivel 1 = básico, 2 = intermedio, 3 = avanzado.
         icon = nombre de archivo en assets/icons/<icon>.svg (logo monocromo);
         si falta, el chip muestra la abreviatura (abbr). --- */
  levels: { 1: 'básico', 2: 'intermedio', 3: 'avanzado' },

  skillGroups: [
    {
      name: 'Frontend',
      skills: [
        { abbr: 'HT', name: 'HTML', icon: 'html5', level: 3 },
        { abbr: 'CS', name: 'CSS', icon: 'css3', level: 2 },
        { abbr: 'JS', name: 'JavaScript', icon: 'javascript', level: 2 }
      ]
    },
    {
      name: 'Backend',
      skills: [
        { abbr: 'Py', name: 'Python', icon: 'python', level: 3 },
        { abbr: 'Dj', name: 'Django', icon: 'django', level: 3 },
        { abbr: 'St', name: 'Stripe', icon: 'stripe', level: 2 },
        { abbr: 'WA', name: 'API de WhatsApp', icon: 'whatsapp', level: 2 }
      ]
    },
    {
      name: 'Bases de datos',
      skills: [
        { abbr: 'Pg', name: 'PostgreSQL', icon: 'postgresql', level: 3 },
        { abbr: 'SQ', name: 'SQL', level: 2 }
      ]
    },
    {
      name: 'Herramientas',
      skills: [
        { abbr: 'Gt', name: 'Git', icon: 'git', level: 3 },
        { abbr: 'Ng', name: 'nginx', icon: 'nginx', level: 2 },
        { abbr: 'Gu', name: 'gunicorn', icon: 'gunicorn', level: 2 },
        { abbr: 'Ln', name: 'Linux', icon: 'linux', level: 2 },
        { abbr: 'PC', name: 'PyCharm', icon: 'pycharm', level: 3 }
      ]
    },
    {
      name: 'Cloud',
      skills: [
        { abbr: 'VP', name: 'VPS / Despliegue', level: 2 },
        { abbr: 'GP', name: 'GitHub Pages', level: 2 }
      ]
    },
    {
      name: 'Diseño',
      skills: [
        { abbr: 'DS', name: 'Design Systems', level: 1 },
        { abbr: 'A11', name: 'Accesibilidad', level: 1 }
      ]
    }
  ],

  /* --- Paleta mostrada en el Design System (los valores son informativos;
         el color real se pinta con var(token)) --- */
  palette: [
    { name: 'Fondo',        token: '--bg',       values: '#0B0F14 · #FFFFFF' },
    { name: 'Superficie',   token: '--surface',  values: '#131A22 · #F4F6FA' },
    { name: 'Texto',        token: '--text',     values: '#E6EDF3 · #0F172A' },
    { name: 'Texto tenue',  token: '--muted',    values: '#8B98A5 · #64748B' },
    { name: 'Borde',        token: '--border',   values: '#223040 · #E2E8F0' },
    { name: 'Acento',       token: '--accent',   values: '#4F8CFF' },
    { name: 'Secundario',   token: '--accent-2', values: '#A855F7' },
    { name: 'Error',        token: '--error',    values: '#F0546A' }
  ],

  /* --- Escala de espaciado mostrada en el Design System --- */
  spacing: [
    { token: '--sp-1', value: '.25rem' },
    { token: '--sp-2', value: '.5rem' },
    { token: '--sp-3', value: '1rem' },
    { token: '--sp-4', value: '1.5rem' },
    { token: '--sp-5', value: '2.5rem' },
    { token: '--sp-6', value: '4rem' }
  ]
};
