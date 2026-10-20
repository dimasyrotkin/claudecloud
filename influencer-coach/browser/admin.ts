/** Demo build: the coach console key is "demo". */
export const DEMO_ADMIN_KEY = "demo";
export function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-key") === DEMO_ADMIN_KEY;
}
