
import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Packages & Fees | Nexmove Physiotherapy Clinic",
  description:
    "Explore packages currently published by Nexmove Physiotherapy Clinic.",
};

export const dynamic = "force-dynamic";

function getValidPrice(item) {
  if (
    item?.price === null ||
    item?.price === undefined ||
    item?.price === ""
  ) {
    return null;
  }

  const price = Number(item.price);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

function getValidSessions(item) {
  if (
    item?.sessions === null ||
    item?.sessions === undefined ||
    item?.sessions === ""
  ) {
    return null;
  }

  const sessions = Number(item.sessions);

  return Number.isSafeInteger(sessions) && sessions > 0
    ? sessions
    : null;
}

function formatPrice(price) {
  return price.toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });
}

export default async function Packages() {
  const packages = await getList("/api/packages");

  return (
    <main>
      <PageHero
        title="Packages & Fees"
        subtitle="Explore the packages currently published by Nexmove Physiotherapy Clinic."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        {packages.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--color-dark)]">
              Package information is being updated
            </h2>

            <p className="mt-3 text-gray-600">
              No active packages are currently published. Contact the
              clinic for confirmed session and fee information.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-[var(--color-primary)] px-5 py-3 font-semibold text-white"
            >
              Contact the clinic
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => {
              const price = getValidPrice(item);
              const sessions = getValidSessions(item);

              const currency =
                typeof item.currency === "string" &&
                item.currency.trim()
                  ? item.currency.trim().toUpperCase()
                  : "PKR";

              return (
                <article
                  key={item._id || item.slug || item.name}
                  className="flex flex-col rounded-xl border bg-white p-5 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-[var(--color-dark)]">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-gray-700">
                    {item.description?.trim() ||
                      "Contact the clinic for further information about this package."}
                  </p>

                  <div className="mt-5">
                    {price === null ? (
                      <p className="text-lg font-semibold text-[var(--color-primary)]">
                        Contact clinic for price
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-[var(--color-primary)]">
                        {currency} {formatPrice(price)}
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {sessions === null
                      ? "Session count not published"
                      : `${sessions} ${sessions === 1 ? "session" : "sessions"}`}
                  </p>

                  <div className="mt-auto pt-5">
                    {item.slug ? (
                      <Link
                        href={`/packages/${encodeURIComponent(item.slug)}`}
                        className="inline-block text-[var(--color-primary)] underline"
                      >
                        Package details
                      </Link>
                    ) : (
                      <Link
                        href="/contact"
                        className="inline-block text-[var(--color-primary)] underline"
                      >
                        Ask about this package
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-sm leading-relaxed text-gray-500">
          Package prices and session details are shown only where
          confirmed information is available. Contact Nexmove for
          current pricing and package arrangements.
        </p>
      </section>
    </main>
  );
}
