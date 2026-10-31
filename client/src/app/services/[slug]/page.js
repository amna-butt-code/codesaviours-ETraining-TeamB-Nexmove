
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecord } from "../../../lib/api";

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

export default async function ServiceDetail({ params }) {
  const { slug } = await params;

  const service = await getRecord(
    `/api/services/getService/${encodeURIComponent(slug)}`
  );

  if (!service || !service._id || service.isActive === false) {
    notFound();
  }

  const duration = getDuration(service);
  const price = getPrice(service);
  const durationIsEstimated =
    service.durationIsEstimated === true;

  const canBook =
    duration !== null &&
    price !== null;

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
          <span className="nm-directory-eyebrow">
            SERVICE INFORMATION
          </span>

          <h2>What to know</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--color-light)] p-4">
              <span className="block text-sm text-gray-600">
                {durationIsEstimated
                  ? "Estimated session duration"
                  : "Session duration"}
              </span>

              <strong className="mt-1 block text-lg text-[var(--color-dark)]">
                {duration === null
                  ? "Contact the clinic"
                  : `${duration} minutes`}
              </strong>
            </div>

            <div className="rounded-xl bg-[var(--color-light)] p-4">
              <span className="block text-sm text-gray-600">
                Fee per session
              </span>

              <strong className="mt-1 block text-lg text-[var(--color-dark)]">
                {price === null
                  ? "Contact the clinic"
                  : formatPKR(price)}
              </strong>
            </div>
          </div>

          {durationIsEstimated && duration !== null && (
            <p className="mt-4 text-sm text-gray-600">
              The displayed duration is an estimate used for appointment
              scheduling. Actual treatment time may vary according to
              the patient's assessment and treatment requirements.
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--color-dark)]">
              Need more details?
            </h3>

            <p className="mt-2 text-gray-700">
              Contact the clinic to ask about this service, current
              appointment availability and treatment arrangements.
            </p>
          </div>

          <div className="nm-detail-actions">
            <Link href="/contact" className="nm-button">
              Contact Nexmove
            </Link>

            {canBook && (
              <Link href="/book" className="nm-detail-secondary">
                Explore online booking
              </Link>
            )}

            <Link href="/packages" className="nm-detail-secondary">
              View packages and fees
            </Link>
          </div>
        </div>

        <p className="nm-directory-disclaimer">
          Website information is general guidance and is not a diagnosis
          or an individual treatment recommendation. Treatment plans
          and session requirements should be discussed with a qualified
          physiotherapist.
        </p>
      </section>
    </main>
  );
}
