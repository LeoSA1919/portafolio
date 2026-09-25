/* ==========================================================================
   build-icons.js — Genera js/icons.js a partir de assets/icons/*.svg
   Uso: node scripts/build-icons.js
   Cada SVG (monocromo, Simple Icons) se reduce a su viewBox y sus trazos;
   main.js los inserta en línea con fill="currentColor", así el logo toma el
   color del chip (acento) y funciona también al abrir index.html con file://.
   ========================================================================== */
'use strict';

var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var srcDir = path.join(root, 'assets', 'icons');
var outFile = path.join(root, 'js', 'icons.js');

var icons = {};
fs.readdirSync(srcDir).filter(function (f) { return /\.svg$/i.test(f); }).sort().forEach(function (file) {
  var svg = fs.readFileSync(path.join(srcDir, file), 'utf8');
  var viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
  var inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .trim();
  if (!inner) throw new Error('SVG vacío: ' + file);
  icons[path.basename(file, '.svg').toLowerCase()] = { viewBox: viewBox, body: inner };
});

var out =
  '/* ==========================================================================\n' +
  '   icons.js — GENERADO por scripts/build-icons.js a partir de assets/icons/*.svg\n' +
  '   No editar a mano: agrega el SVG monocromo en assets/icons/ y vuelve a\n' +
  '   ejecutar `node scripts/build-icons.js`. Fuente: Simple Icons (CC0).\n' +
  '   ========================================================================== */\n\n' +
  'window.PORTFOLIO_ICONS = ' + JSON.stringify(icons, null, 2) + ';\n';

fs.writeFileSync(outFile, out, 'utf8');
console.log('js/icons.js: ' + Object.keys(icons).length + ' iconos (' + Object.keys(icons).join(', ') + ')');
