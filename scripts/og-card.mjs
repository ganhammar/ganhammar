// Regenerates static/og.png, the 1200x630 card social platforms show when a
// page here is shared.
//
// It renders the card as HTML and screenshots it with headless Chrome, so the
// card is built from the same type and palette as the site rather than being
// a separate drawing that drifts. Run it by hand after a design change:
//
//   node scripts/og-card.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(fileURLToPath(new URL('../static/og.png', import.meta.url)));

const WIDTH = 1200;
const HEIGHT = 630;
const CAPTURE_HEIGHT = 820;

const CHROME = [
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].find((path) => existsSync(path));

if (!CHROME) {
	console.error('No Chrome or Chromium found; cannot render the card.');
	process.exit(1);
}

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: #fbfbf9;
    font-family: 'Avenir Next Condensed', 'Helvetica Neue', sans-serif;
    color: #14161a;
    /* The sheet is positioned against this, not the viewport, which is taller
       than the card by the height of the window chrome. */
    position: relative;
  }
  .sheet {
    position: absolute; inset: 50px;
    border: 1px solid #14161a;
    padding: 44px 58px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .sheet::before {
    content: ''; position: absolute; inset: 8px; border: 1px solid #d8dade;
  }
  .wordmark {
    font-size: 82px; letter-spacing: .2em; text-transform: uppercase; font-weight: 600;
    line-height: 1;
  }
  .stop { color: #c8321e; }
  .tagline {
    font-family: Charter, 'Iowan Old Style', Palatino, Georgia, serif;
    font-style: italic; font-size: 31px; color: #565b62; margin-top: 24px; max-width: 30ch;
  }
  .rule { height: 1px; background: #14161a; margin: 30px 0 22px; }
  .meta {
    font-family: 'PT Mono', Menlo, monospace; font-size: 19px; letter-spacing: .22em;
    text-transform: uppercase; color: #9ba1a7;
    display: flex; justify-content: space-between;
  }
  .meta b { color: #14161a; font-weight: 400; }
  svg { position: absolute; right: 54px; top: 66px; width: 268px; }
</style>
<div class="sheet">
  <svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg">
    <g id="plates"></g>
  </svg>
  <div>
    <div class="wordmark">Ganhammar<span class="stop">.</span></div>
    <div class="tagline">Notes on serverless, .NET, and whatever I&rsquo;ve just taken apart.</div>
  </div>
  <div>
    <div class="rule"></div>
    <div class="meta"><span>Anton Ganhammar</span><span><b>www.ganhammar.se</b></span></div>
  </div>
</div>
<script>
  // The same exploded plates as Fig. 1, at card scale.
  var W = 96, D = 60, T = 5, GAP = 62, CX = 150, CY0 = 26, K = Math.cos(Math.PI / 6), YS = 0.28;
  var iso = function (cy, x, y) { return [CX + (x - y) * K, cy + (x + y) * YS]; };
  var pt = function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); };
  var out = '';
  for (var i = 0; i < 5; i++) {
    var cy = CY0 + i * GAP;
    var a = iso(cy, 0, 0), b = iso(cy, W, 0), c = iso(cy, W, D), d = iso(cy, 0, D);
    var dn = function (p) { return [p[0], p[1] + T]; };
    out += '<polygon points="' + pt(d) + ' ' + pt(c) + ' ' + pt(dn(c)) + ' ' + pt(dn(d)) + '" fill="#eeeff0" stroke="#14161a"/>';
    out += '<polygon points="' + pt(b) + ' ' + pt(c) + ' ' + pt(dn(c)) + ' ' + pt(dn(b)) + '" fill="#eeeff0" stroke="#14161a"/>';
    out += '<polygon points="' + pt(a) + ' ' + pt(b) + ' ' + pt(c) + ' ' + pt(d) + '" fill="#fbfbf9" stroke="#14161a"/>';
  }
  document.getElementById('plates').innerHTML = out;
</script>`;

const dir = mkdtempSync(join(tmpdir(), 'og-card-'));
const page = join(dir, 'card.html');
writeFileSync(page, html);

execFileSync(
	CHROME,
	[
		// new headless makes the viewport equal --window-size; the old mode
		// subtracted window chrome and rendered ~88px short.
		'--headless=new',
		'--disable-gpu',
		'--hide-scrollbars',
		'--force-device-scale-factor=1',
		// Headless renders a viewport shorter than the window by the height of
		// the window chrome, so the page is given room and the result cropped
		// back to the card size below.
		`--window-size=1200,${1200 * 0 + CAPTURE_HEIGHT}`,
		`--screenshot=${OUT}`,
		`file://${page}`
	],
	{ stdio: 'ignore' }
);

// Crop away the slack under the card. Pillow is only needed to regenerate the
// card, never to build the site.
execFileSync('python3', [
	'-c',
	`from PIL import Image; im = Image.open(${JSON.stringify(OUT)}); im.crop((0, 0, ${WIDTH}, ${HEIGHT})).save(${JSON.stringify(OUT)})`
]);

console.log(`Wrote ${OUT} (${WIDTH}x${HEIGHT})`);
