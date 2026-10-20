import Admin from "@/components/Admin.tsx";

export const metadata = { title: "Coach console · Cadence Coach", robots: { index: false } };

export default function AdminPage() {
  return (
    <>
      <h1 style={{ fontSize: 30 }}>Coach console</h1>
      <p className="muted" style={{ marginTop: -6, marginBottom: 20 }}>
        Check AI post reviews before creators see them, spot-check daily tips, and turn mistakes into rules.
      </p>
      <Admin />
    </>
  );
}
