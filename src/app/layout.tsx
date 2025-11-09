import "../styles/globals.css";
import type { ReactNode } from "react";

const DEFAULT_ORG_ID = "ORG1";

export const metadata = { title: "Scheduler MVP" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ==== HEADER ==== */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-dot" />
              <span>Scheduler MVP</span>
            </div>

            <nav className="nav">
              <a href={`/${DEFAULT_ORG_ID}`} className="nav-btn">
                Booking
              </a>
              <a
                href={`/organizer/${DEFAULT_ORG_ID}/settings`}
                className="nav-btn"
              >
                Settings
              </a>
              <a
                href={`/organizer/${DEFAULT_ORG_ID}`}
                className="nav-btn nav-btn-primary"
              >
                Dashboard
              </a>
            </nav>
          </div>
        </header>

        {/* ==== CONTENT SHELL ==== */}
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
