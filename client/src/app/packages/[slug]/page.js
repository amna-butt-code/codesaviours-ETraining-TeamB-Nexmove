import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../../components/PageHero";
import { getRecord, formatNumber } from "../../../lib/api";

export const dynamic = 'force-dynamic';

export default async function PackageDetail({ params }) {
  const { slug } = await params;

  const item = await getRecord(
    `/api/packages/${encodeURIComponent(slug)}`
  );

  if (!item || !item.slug) {
    notFound();
  }

  return (
    <div>
      <PageHero title={item.name} subtitle={item.description} />

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-3xl font-bold text-[var(--color-primary)]">
            {item.currency || "PKR"} {formatNumber(item.price)}
          </p>

          <p className="mt-2">
            {item.sessions}{" "}
            {Number(item.sessions) === 1 ? "session" : "sessions"}
          </p>

          <Link
            href="/book"
            className="mt-6 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white"
          >
            Request an Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}