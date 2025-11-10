"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ orgId }: { orgId: string }) {
  const pathname = usePathname();

  // aktif jika path sama atau child dari href (mis: /bookings/123)
  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href + "/") ?? false);

  const links = [
    { href: `/${orgId}`, label: "Booking" },
    { href: `/organizer/${orgId}/settings`, label: "Settings" },
    // ✅ tombol baru untuk masuk ke halaman upcoming bookings
    { href: `/organizer/${orgId}/bookings`, label: "Schedule" },
    { href: `/organizer/${orgId}`, label: "Dashboard" },
  ];

  return (
    <nav className="nav">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={isActive(l.href) ? "nav-btn nav-btn-primary" : "nav-btn"}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
