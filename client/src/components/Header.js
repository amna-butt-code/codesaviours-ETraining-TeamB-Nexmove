"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Conditions We Treat", href: "/conditions" },
  { name: "Our Team", href: "/team" },
  { name: "Packages & Fees", href: "/packages" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-[var(--color-dark)] text-white text-sm px-4 py-1 flex flex-wrap gap-x-6 justify-center md:justify-between">
        <span>Phone: 0326 6312211</span>
<span>Instagram DM: @nexmove_</span>
<span>Men 9 AM-1 PM | Women and children 1 PM-10 PM</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[var(--color-primary)]">
          Nexmove
        </Link>

        <ul className="hidden lg:flex items-center gap-5">
          {links.map((l) => (
            <li key={l.name}>
              <Link href={l.href} className="text-[var(--color-text)] hover:text-[var(--color-primary)]">
                {l.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden lg:inline text-[var(--color-text)] hover:text-[var(--color-primary)]">
            Login
          </Link>
          <Link href="/book" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90">
            Book Appointment
          </Link>
          <button
            className="lg:hidden text-3xl"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="lg:hidden bg-white border-t px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <li key={l.name}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block py-1 text-[var(--color-text)]">
                {l.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/login" className="block py-1 text-[var(--color-text)]">Login</Link>
          </li>
        </ul>
      )}
    </header>
  );
}