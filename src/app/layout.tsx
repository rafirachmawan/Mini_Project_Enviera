import "../styles/globals.css";
import type { ReactNode } from "react";
import Nav from "./Nav";

const DEFAULT_ORG_ID = "ORG1"; // ganti kalau ID-mu berbeda

export const metadata = { title: "Scheduler MVP" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* HEADER */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-dot" />
              <span>Scheduler MVP</span>
            </div>

            {/* Navbar */}
            <Nav orgId={DEFAULT_ORG_ID} />
          </div>
        </header>

        {/* CONTENT */}
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
