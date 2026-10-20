/** Tiny in-page router: the artifact viewer doesn't expose path or query changes in the URL. */
type Listener = (path: string) => void;
let current = "/";
const listeners = new Set<Listener>();

export const currentPath = () => current;
export function navigate(path: string) {
  current = path;
  listeners.forEach((l) => l(path));
  const hash = path.split("#")[1];
  requestAnimationFrame(() => {
    if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  });
}
export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
