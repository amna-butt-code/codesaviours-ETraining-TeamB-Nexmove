import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Conditions We Treat | Nexmove Physiotherapy Clinic",
  description:
    "Browse condition information published by Nexmove Physiotherapy Clinic.",
};

export const dynamic = 'force-dynamic';

export default async function Conditions() {
  const conditions = await getList("/api/conditions");

  return (
    <div>
      <PageHero
        title="Conditions We Treat"
        subtitle="Information currently published by the clinic."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {conditions.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3">
            Condition information is not available online yet. Contact the
            clinic with questions about an individual concern.
          </p>
        ) : (
          conditions.map((condition) => (
            <article
              key={condition._id || condition.slug}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--color-dark)]">
                {condition.title}
              </h2>

              <p className="mt-2 text-gray-700">
                {condition.summary}
              </p>

              <Link
                href={`/conditions/${condition.slug}`}
                className="mt-4 inline-block text-[var(--color-primary)] underline"
              >
                Read More
              </Link>
            </article>
          ))
        )}
      </section>

      <p className="mx-auto max-w-6xl px-4 pb-10 text-sm text-gray-600">
        Website information is general guidance, not a diagnosis. A
        qualified clinician should assess individual symptoms.
      </p>
    </div>
  );
}