import Link from "next/link";
import { getList } from "../lib/api";
import Reveal from "../components/Reveal";
import HeroStage from "../components/HeroStage";
import HeroVisual from "../components/HeroVisual";

export const dynamic = "force-dynamic";

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8H13M9 4L13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const journey = [
  {
    number: "01",
    title: "Explore your options",
    description:
      "Learn about the services and conditions listed by Nexmove.",
  },
  {
    number: "02",
    title: "Request an appointment",
    description:
      "Choose a service and submit an appointment request online.",
  },
  {
    number: "03",
    title: "Discuss your next step",
    description:
      "Contact the clinic to discuss your appointment and available timing.",
  },
];

export default async function Home() {
  const [faqs, conditions, services] = await Promise.all([
    getList("/api/faqs"),
    getList("/api/conditions"),
    getList("/api/services/getServices"),
  ]);

  const featuredServices = services.slice(0, 4);
  const featuredConditions = conditions.slice(0, 6);
  const featuredFaqs = faqs.slice(0, 5);

  return (
    <div className="nm-home">
      <HeroStage className="nm-hero">
        <div className="nm-container nm-hero-grid">
          <div className="nm-hero-copy">
            <p className="nm-hero-kicker" data-fade>
              
              Nexmove Physiotherapy Clinic, Faisalabad
            </p>

            <h1 className="nm-hero-title">
              <span className="nm-line">
                <span data-line>Your next move</span>
              </span>
              <span className="nm-line">
                <span data-line>starts here.</span>
              </span>
            </h1>

            <p className="nm-hero-description" data-fade>
              Explore Nexmove&apos;s physiotherapy services, learn about the
              conditions we treat, and find a clear starting point for your
              next step.
            </p>

            <div className="nm-hero-actions" data-fade>
              <Link href="/book" className="nm-button">
                Book an appointment
                <span className="nm-arrow">
                  <ArrowIcon />
                </span>
              </Link>

              <Link href="/services" className="nm-button nm-button--outline">
                Explore services
              </Link>
            </div>

            <div className="nm-hero-contact" data-fade>
              <span>Daewoo Road, Faisalabad</span>
              <a href="tel:+923266312211">Call 0326 6312211</a>
            </div>
          </div>

          <div className="nm-hero-visual" data-parallax>
            <div className="nm-spine-panel" data-panel>
              <HeroVisual />
            </div>

            <div className="nm-hero-note" data-fade>
              <span>Your next step</span>
              <strong>Start with an appointment request.</strong>
            </div>
          </div>
        </div>
      </HeroStage>

      <section className="nm-intro-strip" aria-label="Website information">
        <div className="nm-container nm-intro-strip-inner">
          <div className="nm-intro-item">
            <span className="nm-intro-number">01</span>
            <div>
              <strong>Explore services</strong>
              <span>See listed physiotherapy services</span>
            </div>
          </div>

          <div className="nm-intro-item">
            <span className="nm-intro-number">02</span>
            <div>
              <strong>Understand conditions</strong>
              <span>Browse available condition information</span>
            </div>
          </div>

          <div className="nm-intro-item">
            <span className="nm-intro-number">03</span>
            <div>
              <strong>Plan your visit</strong>
              <span>Contact the clinic or request an appointment</span>
            </div>
          </div>
        </div>
      </section>

      <section className="nm-section">
        <div className="nm-container">
          <Reveal className="nm-services-heading">
            <div>
              <span className="nm-eyebrow">Explore Nexmove</span>

              <h2 className="nm-section-title">
                Services for the movements that matter.
              </h2>

              <p className="nm-section-copy">
                Browse the services currently listed by the clinic.
                Select a service to explore its available information.
              </p>
            </div>

            <Link
              href="/services"
              className="nm-button nm-button--outline"
            >
              View all services
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </Reveal>

          {featuredServices.length === 0 ? (
            <div className="nm-empty-state">
              Service information is currently unavailable online.
              Please contact the clinic for details.
            </div>
          ) : (
            <div className="nm-service-list">
              {featuredServices.map((service) => (
                <Reveal key={service._id || service.name}>
                  <Link
                    href={
                      service._id
                        ? `/services/${service._id}`
                        : "/services"
                    }
                    className="nm-service-row"
                  >
                    <h3 className="nm-service-name">
                      {service.name}
                    </h3>

                    <p className="nm-service-description">
                      {service.description ||
                        "Contact the clinic for further service information."}
                    </p>

                    <span className="nm-service-arrow">
                      <ArrowIcon />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-9">
            <Link
              href="/services"
              className="nm-button nm-button--outline"
            >
              Discover all services
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="nm-section nm-condition-section">
        <div className="nm-container nm-condition-layout">
          <Reveal>
            <span className="nm-eyebrow">Conditions we treat</span>

            <h2 className="nm-section-title">
              Find information for what&apos;s affecting your movement.
            </h2>

            <p className="nm-section-copy">
              Explore the condition information available through
              Nexmove. These guides provide general information,
              not a personal diagnosis.
            </p>

            <Link href="/conditions" className="nm-button mt-7">
              Explore conditions
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </Reveal>

          <div className="nm-condition-list">
            {featuredConditions.length === 0 ? (
              <div className="nm-empty-state">
                Condition information is currently unavailable.
              </div>
            ) : (
              featuredConditions.map((condition) => (
                <Reveal key={condition._id || condition.slug}>
                  <Link
                    href={
                      condition.slug
                        ? `/conditions/${condition.slug}`
                        : "/conditions"
                    }
                    className="nm-condition-link"
                  >
                    <span>{condition.title}</span>
                    <span>
                      <ArrowIcon />
                    </span>
                  </Link>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="nm-section nm-journey">
        <div className="nm-container">
          <Reveal>
            <span className="nm-eyebrow">Your next move</span>

            <h2 className="nm-section-title">
              A clearer starting point.
            </h2>

            <p className="nm-section-copy">
              Find the information you need and take the next step
              at a pace that works for you.
            </p>
          </Reveal>

          <div className="nm-journey-grid">
            {journey.map((step) => (
              <Reveal key={step.number} className="nm-journey-step">
                <span className="nm-journey-step-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/book" className="nm-button nm-button--light">
              Request an appointment
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="nm-section">
        <div className="nm-container nm-faq-layout">
          <Reveal>
            <span className="nm-eyebrow">Good to know</span>

            <h2 className="nm-section-title">
              Questions before your visit?
            </h2>

            <p className="nm-section-copy">
              Find answers to commonly asked questions.
              For information specific to your situation,
              contact the clinic directly.
            </p>

            <Link
              href="/faq"
              className="nm-button nm-button--outline mt-7"
            >
              Browse all FAQs
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </Reveal>

          <div className="nm-faq-list">
            {featuredFaqs.length === 0 ? (
              <div className="nm-empty-state">
                FAQs are currently unavailable online.
                Please contact the clinic for assistance.
              </div>
            ) : (
              featuredFaqs.map((faq, index) => (
                <Reveal key={faq._id || faq.question || index}>
                  <details className="nm-faq-item">
                    <summary>{faq.question}</summary>
                    <div className="nm-faq-answer">{faq.answer}</div>
                  </details>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="nm-contact-cta">
        <div className="nm-container">
          <Reveal className="nm-contact-card">
            <div>
              <span className="nm-eyebrow">Take the next step</span>

              <h2>Let&apos;s talk about your next move.</h2>

              <p>
                Explore the available services or contact Nexmove
                Physiotherapy Clinic for information about visiting
                the Faisalabad clinic.
              </p>
            </div>

            <Link href="/book" className="nm-button nm-button--light">
              Book an appointment
              <span className="nm-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}