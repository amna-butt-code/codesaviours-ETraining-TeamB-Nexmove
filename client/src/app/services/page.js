
import Link from "next/link";
import Reveal from "../../components/Reveal";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Physiotherapy Services | Nexmove",
  description:
    "Explore physiotherapy services, session fees and estimated appointment durations at Nexmove in Faisalabad.",
};

export const dynamic = "force-dynamic";

function getDuration(service) {
  if (
    service?.duration === null ||
    service?.duration === undefined ||
    service?.duration === ""
  ) {
    return null;
  }

  const duration = Number(service.duration);

  return Number.isSafeInteger(duration) && duration > 0
    ? duration
    : null;
}

function getPrice(service) {
  if (
    service?.price === null ||
    service?.price === undefined ||
    service?.price === ""
  ) {
    return null;
  }

  const price = Number(service.price);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

function formatPKR(amount) {
  return `PKR ${amount.toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;
}

export default async function Services() {
  const services = await getList("/api/services/getServices");

  return (
    <main className="nm-directory-page">
      <section className="nm-directory-hero">
        <div className="nm-container nm-directory-hero-grid">
          <div>
            <span className="nm-directory-eyebrow">
              Rehabilitation and wellness
            </span>

            <h1>Services for better movement.</h1>

            <p>
              Explore the physiotherapy services currently listed by
              Nexmove. View session fees and estimated appointment
              durations, and choose the service that best matches your
              needs.
            </p>
          </div>

          <aside
            className="nm-directory-highlight"
            aria-label="The Nexmove message"
          >
            <span>The Nexmove message</span>
            <strong>Helping you move better.</strong>
            <p>Your next move towards a better life.</p>
          </aside>
        </div>
      </section>

      <section className="nm-directory-section">
        <div className="nm-container">
          <div className="nm-directory-heading">
            <div>
              <span className="nm-directory-eyebrow">
                Our services
              </span>
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
              {services.map((service, index) => {
                const duration = getDuration(service);
                const price = getPrice(service);
                const isEstimated =
                  service.durationIsEstimated === true;

                return (
                  <Reveal
                    key={
                      service._id ||
                      `${service.name || "service"}-${index}`
                    }
                  >
                    <article className="nm-directory-card">
                      <div className="nm-directory-card-top">
                        <span
                          className="nm-directory-card-mark"
                          aria-hidden="true"
                        />
                      </div>

                      <h3>{service.name}</h3>

                      <p>
                        {service.description?.trim() ||
                          "Contact the clinic for further information about this service."}
                      </p>

                      <dl className="nm-directory-meta">
                        <div>
                          <dt>
                            {isEstimated
                              ? "Estimated duration"
                              : "Session duration"}
                          </dt>
                          <dd>
                            {duration === null
                              ? "Contact the clinic"
                              : `${duration} minutes`}
                          </dd>
                        </div>

                        <div>
                          <dt>Fee per session</dt>
                          <dd>
                            {price === null
                              ? "Contact the clinic"
                              : formatPKR(price)}
                          </dd>
                        </div>
                      </dl>

                      {service._id ? (
                        <Link
                          href={`/services/${encodeURIComponent(
                            String(service._id)
                          )}`}
                          className="nm-directory-link"
                        >
                          View service details
                        </Link>
                      ) : (
                        <Link
                          href="/contact"
                          className="nm-directory-link"
                        >
                          Contact the clinic
                        </Link>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          <p className="nm-directory-disclaimer">
            The session fee is PKR 1,500. Displayed durations are
            estimates for appointment scheduling, not guaranteed
            treatment times. Actual session duration may vary according
            to the patient's assessment and treatment requirements.
            Contact the clinic if you need further information.
          </p>
        </div>
      </section>
    </main>
  );
}
