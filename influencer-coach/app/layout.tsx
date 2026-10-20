import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadence Coach",
  description: "A daily content coach for creators that learns what actually helps you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <nav className="nav">
            <Link href="/" className="brand">
              cadence<span>.</span>
            </Link>
            <div className="nav-links">
              <Link href="/#how">How it learns</Link>
              <Link href="/lab">Learning lab</Link>
              <Link href="/#start">Start</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
