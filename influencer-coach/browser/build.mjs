// Builds the self-contained hosted demo: node browser/build.mjs <out.html>
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = process.argv[2] ?? path.join(here, "dist", "cadence.html");

const redirect = {
  name: "demo-redirects",
  setup(b) {
    const to = (file) => ({ path: path.join(here, file) });
    b.onResolve({ filter: /^@anthropic-ai\/sdk/ }, () => to("sdk-stub.ts"));
    b.onResolve({ filter: /^next\/server$/ }, () => to("next-server.ts"));
    b.onResolve({ filter: /^next\/navigation$/ }, () => to("next-navigation.ts"));
    b.onResolve({ filter: /^next\/link$/ }, () => to("next-link.tsx"));
    b.onResolve({ filter: /(^@\/lib\/|\.\/)store\.ts$/ }, (a) => (a.importer.startsWith(here) ? undefined : to("store.ts")));
    b.onResolve({ filter: /(^@\/lib\/|\.\/)admin\.ts$/ }, (a) => (a.importer.startsWith(here) ? undefined : to("admin.ts")));
    b.onResolve({ filter: /^@\// }, (a) => ({ path: path.join(root, a.path.slice(2)) }));
  },
};

const result = await build({
  entryPoints: [path.join(here, "main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  loader: { ".css": "text" },
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [redirect],
  logLevel: "warning",
});

const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<title>Cadence Coach</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>body{margin:0}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
