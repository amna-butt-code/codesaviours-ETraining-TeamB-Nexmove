
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Conditions", href: "/conditions" },
  { name: "Our Team", href: "/team" },
  { name: "Packages & Fees", href: "/packages" },
];

const resourceLinks = [
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Ask Nexmove", href: "/chat" },
  { name: "Pain Assessment", href: "/pain-assessment" },
  { name: "Book Appointment", href: "/book" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="nm-footer">
      <div className="nm-container nm-footer-main">
        <div>
          <Link href="/" aria-label="Nexmove home">
            <Image
              src="/images/nexmove-logo.png"
              alt="Nexmove Physiotherapy Clinic"
              width={310}
              height={110}
              className="nm-footer-logo"
            />
          </Link>

          <p className="nm-footer-description">
            Nexmove Physiotherapy Clinic, Faisalabad.
            Explore our listed physiotherapy services and contact
            the clinic to discuss your appointment.
          </p>

          <a
            href="https://www.instagram.com/nexmove_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>

        <div>
          <h2 className="nm-footer-heading">Explore</h2>

          <ul className="nm-footer-links">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="nm-footer-contact">
          <h2 className="nm-footer-heading">Visit the clinic</h2>

          <p>
            Riyaz Ul Jannah Colony,
            Daewoo Road, Faisalabad
          </p>

          <p>
            <a href="tel:03266312211">0326 6312211</a>
          </p>

          <p>
            Men: 9 AM - 1 PM
            <br />
            Women and children: 1 PM - 10 PM
          </p>

          <a
            href="https://share.google/i4m42aMPoyZVJKvn3"
            target="_blank"
            rel="noopener noreferrer"
          >
            View location on Google Maps
          </a>

          <div>
            <h3 className="nm-footer-heading">More from Nexmove</h3>

            <ul className="nm-footer-links">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="nm-footer-bottom">
        <div className="nm-container nm-footer-bottom-inner">
          <p>
            &copy; {year} Nexmove Physiotherapy Clinic. All rights reserved.
            <br />
            Website information is general guidance and is not a
            medical diagnosis or a substitute for professional advice.
          </p>

          <div className="nm-footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
