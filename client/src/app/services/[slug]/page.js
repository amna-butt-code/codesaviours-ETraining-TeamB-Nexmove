import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../../components/PageHero";
import { getRecord, formatNumber } from "../../../lib/api";

export const dynamic = 'force-dynamic';

export default async function ServiceDetail({ params }) {
  const { slug } = await params;

  // The service API currently uses MongoDB IDs, not service slugs.
  const service = await getRecord(
    `/api/services/getService/${encodeURIComponent(slug)}`
  );

  if (!service || !service._id || service.isActive === false) {
    notFound();
  }

  return (
    <div>
      <PageHero
        title={service.name}
        subtitle={
          service.description ||
          "Service information provided by Nexmove Physiotherapy Clinic."
        }
      />

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-10">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold text-[var(--color-dark)]">
            Service Information
          </h2>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Duration</dt>
              <dd className="font-semibold">
                {formatNumber(service.duration)} minutes
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Recorded price</dt>
              <dd className="font-semibold">
                {formatNumber(service.price)}
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (currency not specified in service record)
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-sm text-gray-600">
          For questions about suitability, treatment details or current
          availability, contact the clinic. This information is not a
          diagnosis or a treatment recommendation.
        </p>

        <Link
          href="/book"
          className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white"
        >
          Request an Appointment
        </Link>
      </section>
    </div>
  );
}