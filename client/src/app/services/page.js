import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList, formatNumber } from "../../lib/api";

export const metadata = {
  title: "Services | Nexmove Physiotherapy Clinic",
  description:
    "View the current services listed by Nexmove Physiotherapy Clinic.",
};

export const dynamic = 'force-dynamic';

export default async function Services() {
  const services = await getList("/api/services/getServices");

  return (
    <div>
      <PageHero
        title="Our Services"
        subtitle="Services currently listed by the clinic."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3">
            No active services are currently listed online. Please contact
            the clinic for current service information.
          </p>
        ) : (
          services.map((service) => (
            <article
              key={service._id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--color-dark)]">
                {service.name}
              </h2>

              <p className="mt-2 text-gray-700">
                {service.description ||
                  "A detailed description has not yet been provided."}
              </p>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                {service.duration != null && (
                  <p>
                    Duration: {formatNumber(service.duration)} minutes
                  </p>
                )}

                {service.price != null && (
                  <p>
                    Recorded price: {formatNumber(service.price)}
                    <span className="ml-1 text-xs">
                      (currency not specified in this service record)
                    </span>
                  </p>
                )}
              </div>

              <Link
                href={`/services/${service._id}`}
                className="mt-4 inline-block font-medium text-[var(--color-primary)] underline"
              >
                View details
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}