import Link from "next/link";

export const metadata = {
  title: "About Nexmove | Rehabilitation & Wellness",
  description:
    "Discover the ideas behind Nexmove: rehabilitation, wellness, and helping you move better.",
};

const principles = [
  {
    number: "01",
    title: "Rehabilitation",
    description:
      "A focus on rehabilitation and taking steps towards better movement.",
  },
  {
    number: "02",
    title: "Wellness",
    description:
      "A broader perspective on wellbeing, with movement as part of everyday life.",
  },
  {
    number: "03",
    title: "Better movement",
    description:
      "A simple guiding idea: helping you move better, one step at a time.",
  },
];

export default function About() {
  return (
    <main className="nm-about-page">
      <section className="nm-about-hero">
        <div className="nm-container nm-about-hero-grid">
          <div className="nm-about-intro">
            <span className="nm-about-eyebrow">
              REHABILITATION <span>·</span> WELLNESS
            </span>

            <h1>
              Your next move towards a{" "}
              <em>better life.</em>
            </h1>

            <p className="nm-about-lead">
              Helping you move better.
            </p>

            <p className="nm-about-description">
              At Nexmove, the message is simple: rehabilitation and
              wellness, with a focus on helping people move better.
              Because every step forward can be a step towards a
              better life.
            </p>

            <div className="nm-about-actions">
              <Link href="/services" className="nm-button">
                Explore our services
                
              </Link>

              <Link href="/contact" className="nm-about-text-link">
                Get in touch
              </Link>
            </div>
          </div>

          <aside className="nm-about-message">
            <span className="nm-about-message-label">
              THE NEXMOVE MESSAGE
            </span>

            <div className="nm-about-message-mark" aria-hidden="true">
              N
            </div>

            <p>
              Helping you
              <br />
              move <em>better.</em>
            </p>

            <span className="nm-about-message-bottom">
              YOUR NEXT MOVE STARTS HERE
            </span>
          </aside>
        </div>
      </section>

      <section className="nm-about-principles">
        <div className="nm-container">
          <div className="nm-about-section-heading">
            <span className="nm-about-eyebrow">WHAT NEXMOVE STANDS FOR</span>

            <h2>
              Three ideas.
              <br />
              <em>One direction.</em>
            </h2>

            <p>
              The clinic&apos;s message brings together three connected
              ideas that shape the way Nexmove presents its purpose.
            </p>
          </div>

          <div className="nm-about-principle-grid">
            {principles.map((item) => (
              <article
                className="nm-about-principle"
                key={item.number}
              >
                <span className="nm-about-principle-number">
                  {item.number}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nm-about-closing">
        <div className="nm-container nm-about-closing-inner">
          <div>
            <span className="nm-about-eyebrow">
              YOUR NEXT MOVE
            </span>

            <h2>
              Take the next step towards{" "}
              <em>better movement.</em>
            </h2>

            <p>
              Explore the information available on our website or
              contact Nexmove with your questions.
            </p>
          </div>

          <Link
            href="/contact"
            className="nm-button nm-button--light"
          >
            Contact Nexmove
            
          </Link>
        </div>
      </section>
    </main>
  );
}