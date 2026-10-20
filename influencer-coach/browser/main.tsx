/**
 * Hosted demo entry: the real app (components, learner, API route handlers) running entirely in
 * the browser. fetch("/api/...") is routed to the same route handlers the server uses; Claude is
 * reached through the viewer's own claude.ai account via the artifact `sample` capability.
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import css from "../app/globals.css";
import { aiHooks } from "../lib/ai-hooks.ts";
import Home from "../app/page.tsx";
import LabPage from "../app/lab/page.tsx";
import AdminPage from "../app/admin/page.tsx";
import Dashboard from "../components/Dashboard.tsx";
import * as creators from "../app/api/creators/route.ts";
import * as creator from "../app/api/creators/[id]/route.ts";
import * as tip from "../app/api/creators/[id]/tip/route.ts";
import * as feedback from "../app/api/creators/[id]/feedback/route.ts";
import * as reviews from "../app/api/creators/[id]/reviews/route.ts";
import * as reviewOne from "../app/api/creators/[id]/reviews/[rid]/route.ts";
import * as admin from "../app/api/admin/route.ts";
import * as adminReview from "../app/api/admin/reviews/[rid]/route.ts";
import * as adminCorrections from "../app/api/admin/corrections/route.ts";
import * as adminTips from "../app/api/admin/tips/route.ts";
import { DEMO_ADMIN_KEY } from "./admin.ts";
import { resetDemo } from "./store.ts";
import { currentPath, navigate, subscribe } from "./router.ts";
import Link from "./next-link.tsx";

// ---------- API routes, in the browser ----------

type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
type Mod = Partial<Record<"GET" | "POST" | "PATCH" | "DELETE", Handler>>;
const ROUTES: [RegExp, string[], Mod][] = [
  [/^\/api\/creators$/, [], creators as unknown as Mod],
  [/^\/api\/creators\/([^/]+)$/, ["id"], creator as unknown as Mod],
  [/^\/api\/creators\/([^/]+)\/tip$/, ["id"], tip as unknown as Mod],
  [/^\/api\/creators\/([^/]+)\/feedback$/, ["id"], feedback as unknown as Mod],
  [/^\/api\/creators\/([^/]+)\/reviews$/, ["id"], reviews as unknown as Mod],
  [/^\/api\/creators\/([^/]+)\/reviews\/([^/]+)$/, ["id", "rid"], reviewOne as unknown as Mod],
  [/^\/api\/admin$/, [], admin as unknown as Mod],
  [/^\/api\/admin\/reviews\/([^/]+)$/, ["rid"], adminReview as unknown as Mod],
  [/^\/api\/admin\/corrections$/, [], adminCorrections as unknown as Mod],
  [/^\/api\/admin\/tips$/, [], adminTips as unknown as Mod],
];

const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!url.startsWith("/api/")) return realFetch(input, init);
  const path = url.split("?")[0];
  const method = (init?.method ?? "GET").toUpperCase() as keyof Mod;
  for (const [re, names, mod] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    const handler = mod[method];
    if (!handler) break;
    const params = Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
    try {
      return await handler(new Request(new URL(url, "https://demo.local"), init), { params: Promise.resolve(params) });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Something went wrong in the demo" }), { status: 500 });
    }
  }
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
};

// ---------- Claude through the viewer's account ----------

const dataUrlToBlob = (d: string) => {
  const bin = atob(d.split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "image/jpeg" });
};

type Sample = {
  json: (input: string, opts?: { images?: Blob[]; modelTier?: string; cache?: boolean }) => Promise<unknown>;
  limits: () => Promise<{ images?: { maxCount: number } }>;
};
let aiStatus: "connecting" | "on" | "off" = "connecting";
const statusListeners = new Set<() => void>();
(window as unknown as { claude?: { use: (n: string) => Promise<unknown> } }).claude
  ?.use("sample")
  .then(async (s) => {
    const sample = s as Sample | null;
    if (!sample) {
      aiStatus = "off";
    } else {
      const limits = await sample.limits().catch(() => ({}) as { images?: { maxCount: number } });
      aiHooks.json = (system, prompt, images) =>
        sample.json(`${system}\n\n---\n\n${prompt}`, {
          modelTier: "default",
          cache: false,
          ...(images?.length && limits.images ? { images: images.slice(0, limits.images.maxCount).map(dataUrlToBlob) } : {}),
        });
      aiStatus = "on";
    }
    statusListeners.forEach((l) => l());
  })
  .catch(() => {
    aiStatus = "off";
    statusListeners.forEach((l) => l());
  });
setTimeout(() => {
  if (aiStatus === "connecting") {
    aiStatus = "off";
    statusListeners.forEach((l) => l());
  }
}, 11000);

// ---------- Shell ----------

function Page({ path }: { path: string }) {
  const [p, query] = path.split("#")[0].split("?");
  const qs = new URLSearchParams(query ?? "");
  const u = p.match(/^\/u\/([^/]+)$/);
  if (u) return <Dashboard key={path} id={u[1]} focusTip={qs.get("tip") ?? undefined} focusReview={qs.get("review") ?? undefined} welcome={qs.get("welcome") === "1"} />;
  if (p === "/lab") return <LabPage />;
  if (p === "/admin")
    return (
      <>
        <div className="banner">Demo coach console key: <b>{DEMO_ADMIN_KEY}</b></div>
        <AdminPage />
      </>
    );
  return <Home />;
}

function App() {
  const [path, setPath] = useState(currentPath());
  const [, force] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    const off = subscribe(setPath);
    statusListeners.add(() => force((n) => n + 1));
    // Internal links in shared components are plain <a href="/...">: route them here.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      const href = a?.getAttribute("href");
      if (href?.startsWith("/") && !a?.target) {
        e.preventDefault();
        navigate(href);
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      off();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="brand">cadence<span>.</span></Link>
        <div className="nav-links">
          <Link href="/#how">How it works</Link>
          <Link href="/lab">Learning lab</Link>
          <Link href="/admin">Coach console</Link>
        </div>
      </nav>
      <div className="demo-bar small">
        <span>
          Demo · runs in your browser, data stays on this device, messages are simulated in the web inbox ·{" "}
          {aiStatus === "on" ? "Claude writes tips and reviews" : aiStatus === "connecting" ? "connecting to Claude..." : "Claude unavailable here, using the built-in library"}
        </span>
        {confirmReset ? (
          <span className="row">
            Erase all demo data?
            <button className="btn ghost sm" onClick={() => { resetDemo(); setConfirmReset(false); navigate("/"); }}>Erase</button>
            <button className="btn ghost sm" onClick={() => setConfirmReset(false)}>Keep</button>
          </span>
        ) : (
          <button className="btn ghost sm" onClick={() => setConfirmReset(true)}>Reset demo</button>
        )}
      </div>
      <Page path={path} />
    </div>
  );
}

const style = document.createElement("style");
style.textContent = css + `
.demo-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between; color:var(--muted);
  border:1px dashed var(--line); border-radius:10px; padding:8px 12px; margin:-12px 0 22px; }`;
document.head.appendChild(style);
createRoot(document.getElementById("root")!).render(<App />);
