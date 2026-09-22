#!/usr/bin/env node
/* Build Ragdoll Drop from its single source, src/game.html.
 *
 *   node build.js
 *
 * src/game.html is the artifact body: no doctype and no <head>, because the
 * Claude artifact platform supplies those. This script emits the two things
 * that body has to become — and src/game.html itself is what gets published to
 * the artifact, since the artifact wants exactly this body with the CDN intact:
 *
 *   index.html        the installable PWA for aussiescupper.github.io/ragdoll-drop/
 *                     — real <head>, iPad meta, manifest, service worker, and
 *                     Three.js swapped from the CDN to the vendored copy so the
 *                     game works with no network at all.
 *
 * Both get the version stamped in from version.js, which is what keeps the
 * number on the home screen, the number in the corner, the service worker cache
 * name and the published artifact from ever drifting apart. Bump it with
 * ../bump.sh ragdoll-drop and re-run this.
 */
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const SRC = path.join(HERE, 'src', 'game.html');
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

const version = (function () {
  const v = fs.readFileSync(path.join(HERE, 'version.js'), 'utf8');
  const m = v.match(/APP_VERSION\s*=\s*"([0-9]+)"/);
  if (!m) { console.error('version.js has no APP_VERSION'); process.exit(1); }
  return m[1];
})();

let src = fs.readFileSync(SRC, 'utf8');

/* stamp the version into the two places the game shows it */
const before = src;
src = src
  .replace(/(<div id="verTag">)v\d+(<\/div>)/, '$1v' + version + '$2')
  .replace(/(<p class="home-ver" id="homeVer">)v\d+(<\/p>)/, '$1v' + version + '$2');
if (!/<div id="verTag">v\d+<\/div>/.test(src) || !/id="homeVer">v\d+</.test(src)) {
  console.error('could not stamp the version — the badge markup in src/game.html moved');
  process.exit(1);
}
if (src !== before) fs.writeFileSync(SRC, src);   // keep the source honest too

/* ---- the installable page ---- */
if (src.indexOf(CDN) < 0) {
  console.error('the Three.js CDN script tag is missing from src/game.html');
  process.exit(1);
}
const page = src.replace(CDN, 'vendor/three.min.js');

const i = page.indexOf('<style>');
if (i < 0) { console.error('no <style> found in src/game.html'); process.exit(1); }
const headExtra = page.slice(0, i).trim();     // <title> and the font links
const body = page.slice(i);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#151A26">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Ragdoll">
<meta name="description" content="Four ways to break a blocky noob: leap off a tower, slice a roomful of them, kit two out for the colosseum, or steer him through a story with eighteen endings.">
<meta name="color-scheme" content="dark">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
${headExtra}
<style>
html,body{margin:0;background:#151A26;overscroll-behavior:none}
/* the game positions its own HUD against the safe-area insets, so the page
   itself must not be padded as well */
[hidden]{display:none!important}
</style>
</head>
<body>
<script src="version.js"></script>
${body}
<script>
/* the badge and the home screen read the version from version.js when it is
   there, so an installed iPad can never show a number the cache disagrees with */
(function(){
  var v = self.APP_VERSION ? 'v' + self.APP_VERSION : null;
  if(v){
    var a = document.getElementById('verTag'), b = document.getElementById('homeVer');
    if(a) a.textContent = v;
    if(b) b.textContent = v;
  }
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(HERE, 'index.html'), html);
console.log('ragdoll-drop v' + version);
console.log('  index.html         ' + html.length + ' bytes  (vendored three.js, PWA)');
console.log('  src/game.html      ' + src.length + ' bytes  (CDN three.js, publish this to the artifact)');
