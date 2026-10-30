import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList, formatNumber } from "../../lib/api";

export const metadata = {
  title: "Packages & Fees | Nexmove Physiotherapy Clinic",
  description:
    "View active packages listed by Nexmove Physiotherapy Clinic.",
};

export const dynamic = 'force-dynamic';

export default async function Packages() {
  const packages = await getList("/api/packages");

  return (
    <div>
      <PageHero
        title="Packages & Fees"
        subtitle="Active packages and prices currently published by the clinic."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {packages.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3">
            No active packages are currently published. Please contact the
            clinic for current fee information.
          </p>
        ) : (
          packages.map((item) => (
            <article
              key={item._id || item.slug}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--color-dark)]">
                {item.name}
              </h2>

              <p className="mt-2 text-gray-700">{item.description}</p>

              <p className="mt-4 text-2xl font-bold text-[var(--color-primary)]">
                {item.currency || "PKR"} {formatNumber(item.price)}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {item.sessions}{" "}
                {Number(item.sessions) === 1 ? "session" : "sessions"}
              </p>

              <Link
                href={`/packages/${item.slug}`}
                className="mt-4 inline-block text-[var(--color-primary)] underline"
              >
                Package details
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}