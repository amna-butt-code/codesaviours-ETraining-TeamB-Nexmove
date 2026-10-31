import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecord } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function ServiceDetail({ params }) {
  const { slug } = await params;

  const service = await getRecord(
    `/api/services/getService/${encodeURIComponent(slug)}`
  );

  if (!service || !service._id || service.isActive === false) {
    notFound();
  }

  return (
    <main className="nm-detail-page">
      <section className="nm-detail-hero">
        <div className="nm-container">
          <Link href="/services" className="nm-detail-back">
            Back to services
          </Link>

          <span className="nm-directory-eyebrow">
            NEXMOVE <span aria-hidden="true">|</span> SERVICES
          </span>

          <h1>{service.name}</h1>

          <p>
            {service.description?.trim() ||
              "Contact Nexmove for further information about this service."}
          </p>
        </div>
      </section>

      <section className="nm-container nm-detail-content">
        <div className="nm-detail-card">
          <span className="nm-directory-eyebrow">SERVICE INFORMATION</span>
          <h2>Need more details?</h2>

          <p>
            Contact the clinic to ask about this service, current
            availability and appointment arrangements.
          </p>

          <div className="nm-detail-actions">
            <Link href="/contact" className="nm-button">
              Contact Nexmove
            </Link>

            <Link href="/services" className="nm-detail-secondary">
              Browse other services
            </Link>
          </div>
        </div>

        <p className="nm-directory-disclaimer">
          Website information is general guidance and is not a diagnosis
          or an individual treatment recommendation.
        </p>
      </section>
    </main>
  );
}