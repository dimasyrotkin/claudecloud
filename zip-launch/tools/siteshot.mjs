import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const b = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
for (const [w, name] of [[1440, 'desk'], [400, 'phone']]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(resolve('site/index.html')).href, { waitUntil: 'networkidle0', timeout: 60000 }).catch(e => errs.push(String(e)));
  await new Promise(r => setTimeout(r, 1500));
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  await p.screenshot({ path: `out/check/site_${name}.png`, fullPage: true });
  console.log(name, 'scrollWidth/innerWidth', sw, 'errors', errs.slice(0, 5));
}
await b.close();
