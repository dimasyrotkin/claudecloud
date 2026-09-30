import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const [,, page_, out, w='1600', h='1400'] = process.argv;
const b = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage(); await p.setViewport({ width: +w, height: +h });
p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
await p.goto(pathToFileURL(resolve(page_)).href); await p.waitForFunction('window.done===true', { timeout: 30000 });
await p.screenshot({ path: out }); await b.close();
