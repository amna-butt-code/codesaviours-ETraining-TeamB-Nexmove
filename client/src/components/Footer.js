const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Conditions We Treat", href: "/conditions" },
  { name: "Our Team", href: "/team" },
  { name: "Packages & Fees", href: "/packages" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-bold mb-3">Nexmove</h3>
          <p className="text-gray-200">
            Nexmove Physiotherapy Clinic helps you move better and recover
            faster. Rehabilitation and wellness. Your next move starts here
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l.name}>
                <a href={l.href} className="text-gray-200 hover:text-white">
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
<h4 className="font-semibold mb-3">Visit Us</h4>
<p className="text-gray-200">Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad</p>
<p className="text-gray-200 mt-2">Phone: 0326 6312211</p>
<p className="text-gray-200">Men: 9 AM to 1 PM</p>
<p className="text-gray-200">Women and children: 1 PM to 10 PM</p>
<a href="https://share.google/i4m42aMPoyZVJKvn3" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline mt-2 inline-block">
  View on Google Maps
</a>
<p className="text-gray-200 mt-3">
  <a href="https://www.instagram.com/nexmove_/" target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>
</p>
        </div>
      </div>

      <div className="border-t border-white/20 px-4 py-4 text-center text-sm text-gray-300">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/terms" className="hover:text-white">Terms</a>
        </div>
        <p>
          Medical disclaimer: Information on this website is for general guidance
          only and is not medical advice or a diagnosis.
        </p>
        <p className="mt-1">© 2026 Nexmove Physiotherapy Clinic</p>
      </div>
    </footer>
  );
}