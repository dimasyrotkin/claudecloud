import { timingSafeEqual } from "node:crypto";

/** Admin endpoints require the x-admin-key header to match ADMIN_KEY. No key configured = admin disabled. */
export function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  const got = req.headers.get("x-admin-key");
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}
