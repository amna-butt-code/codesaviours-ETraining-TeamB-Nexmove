
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Conditions", href: "/conditions" },
  { name: "Our Team", href: "/team" },
  { name: "Contact", href: "/contact" },
];

const exploreLinks = [
  { name: "Packages & Fees", href: "/packages" },
  { name: "Journal / Blog", href: "/blog" },
  { name: "Frequently Asked Questions", href: "/faq" },
  { name: "Ask Nexmove", href: "/chat" },
  { name: "Pain Assessment", href: "/pain-assessment" },
];

function ArrowIcon({ direction = "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {direction === "right" ? (
        <path
          d="M3 8H13M9 4L13 8L9 12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8 3V13M4 9L8 13L12 9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isActive(pathname, href) {
  return (
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`))
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  const getLinkClass = (href) =>
    `nm-nav-link ${isActive(pathname, href) ? "is-active" : ""}`;

  const getMobileLinkClass = (href) =>
    isActive(pathname, href) ? "is-active" : "";

  return (
    <header className="nm-header">
      <div className="nm-topbar">
        <div className="nm-container nm-topbar-inner">
          <div className="nm-topbar-group">
            <a href="tel:03266312211" className="nm-topbar-item">
              <strong>Phone:</strong> 0326 6312211
            </a>

            <span className="nm-topbar-item nm-topbar-hours">
              Men: 9 AM - 1 PM | Women and children: 1 PM - 10 PM
            </span>
          </div>

          <a
            className="nm-topbar-social"
            href="https://www.instagram.com/nexmove_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram @nexmove_
          </a>
        </div>
      </div>

      <div className="nm-container">
        <nav className="nm-nav" aria-label="Main navigation">
          <Link
            href="/"
            className="nm-brand"
            aria-label="Nexmove home"
            onClick={closeMenu}
          >
            <Image
              src="/images/nexmove-logo.png"
              alt="Nexmove Physiotherapy Clinic"
              width={260}
              height={92}
              priority
            />
          </Link>

          <div className="nm-nav-links">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClass(item.href)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
              >
                {item.name}
              </Link>
            ))}

            <details className="nm-more">
              <summary className="nm-nav-link">
                Explore
                <ChevronIcon />
              </summary>

              <div className="nm-more-panel">
                {exploreLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive(pathname, item.href) ? "is-active" : ""
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="nm-nav-actions">
            <Link href="/login" className="nm-login-link">
              Login
            </Link>

            <Link href="/book" className="nm-button">
              Book a visit
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>

            <button
              type="button"
              className="nm-menu-toggle"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              aria-controls="nm-mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="nm-mobile-panel" id="nm-mobile-menu">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={getMobileLinkClass(item.href)}
            >
              {item.name}
            </Link>
          ))}

          <div className="nm-mobile-section-label">Explore</div>

          {exploreLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={getMobileLinkClass(item.href)}
            >
              {item.name}
            </Link>
          ))}

          <Link href="/login" onClick={closeMenu}>
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
