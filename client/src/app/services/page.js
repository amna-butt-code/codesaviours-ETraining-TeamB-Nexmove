import Link from "next/link";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Physiotherapy Services | Nexmove",
  description:
    "Explore the physiotherapy services currently listed by Nexmove in Faisalabad.",
};

export const dynamic = "force-dynamic";

export default async function Services() {
  const services = await getList("/api/services/getServices");

  return (
    <main className="nm-directory-page">
      <section className="nm-directory-hero">
        <div className="nm-container nm-directory-hero-grid">
          <div>
            <span className="nm-directory-eyebrow">
              REHABILITATION <span aria-hidden="true">|</span> WELLNESS
            </span>

            <h1>
              Services for <em>better movement.</em>
            </h1>

            <p>
              Explore the physiotherapy services currently listed by
              Nexmove. Contact the clinic for details about availability
              and appointments.
            </p>
          </div>

          <aside className="nm-directory-highlight">
            <span>THE NEXMOVE MESSAGE</span>
            <strong>Helping you move better.</strong>
            <p>Your next move towards a better life.</p>
          </aside>
        </div>
      </section>

      <section className="nm-directory-section">
        <div className="nm-container">
          <div className="nm-directory-heading">
            <div>
              <span className="nm-directory-eyebrow">OUR SERVICES</span>
              <h2>Explore the list</h2>
            </div>

            <span className="nm-directory-count">
              {services.length}{" "}
              {services.length === 1 ? "service" : "services"} listed
            </span>
          </div>

          {services.length === 0 ? (
            <div className="nm-directory-empty">
              <h3>Services are being updated</h3>
              <p>
                There are no active services listed online at the moment.
                Contact the clinic for current information.
              </p>
              <Link href="/contact" className="nm-button">
                Contact the clinic
              </Link>
            </div>
          ) : (
            <div className="nm-directory-grid">
              {services.map((service, index) => (
                <article className="nm-directory-card" key={service._id}>
                  <div className="nm-directory-card-top">
                    <span className="nm-directory-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nm-directory-card-mark" aria-hidden="true">
                      N
                    </span>
                  </div>

                  <h3>{service.name}</h3>

                  <p>
                    {service.description?.trim() ||
                      "Contact the clinic for further information about this service."}
                  </p>

                  {service._id ? (
                    <Link
                      href={`/services/${encodeURIComponent(service._id)}`}
                      className="nm-directory-link"
                    >
                      View service details
                    </Link>
                  ) : (
                    <Link href="/contact" className="nm-directory-link">
                      Ask about this service
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}

          <p className="nm-directory-disclaimer">
            Service information is general website content. Fees and
            session lengths have not been confirmed for publication.
            Contact Nexmove for current details.
          </p>
        </div>
      </section>
    </main>
  );
}