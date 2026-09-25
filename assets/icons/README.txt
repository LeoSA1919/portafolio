Logos monocromos de las tecnologías (assets/icons/<nombre>.svg).

Fuente: Simple Icons (https://simpleicons.org), licencia CC0 1.0.
No se cargan directamente: `node scripts/build-icons.js` los compila en
js/icons.js y main.js los inserta en línea con fill="currentColor", así toman
el color del chip en ambos temas y funcionan también abriendo index.html con
file:// (una máscara CSS o un fetch fallarían por CORS).

Para agregar uno: descarga el SVG monocromo aquí, ejecuta el script y pon
`icon: '<nombre>'` en la habilidad correspondiente en js/data.js.
