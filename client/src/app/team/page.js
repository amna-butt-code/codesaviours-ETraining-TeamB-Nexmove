import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Our Team | Nexmove Physiotherapy Clinic",
  description:
    "View therapist profiles published by Nexmove Physiotherapy Clinic.",
};

export const dynamic = 'force-dynamic';

export default async function Team() {
  const therapists = await getList(
    "/api/therapists/allTherapists",
    { listKey: "therapists" }
  );

  const activeTherapists = therapists.filter(
    (therapist) => therapist.inactive !== true
  );

  return (
    <div>
      <PageHero
        title="Our Team"
        subtitle="Therapist profiles currently listed by the clinic."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {activeTherapists.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3">
            Therapist profiles are not available online yet. Please contact
            the clinic for current information.
          </p>
        ) : (
          activeTherapists.map((therapist) => (
            <article
              key={therapist._id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              {therapist.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={therapist.profileImage}
                  alt={`Portrait of ${therapist.name}`}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-[var(--color-light)] text-sm text-gray-500">
                  Profile image not provided
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-bold text-[var(--color-dark)]">
                  {therapist.name}
                </h2>

                {therapist.qualification?.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {therapist.qualification.join(", ")}
                  </p>
                )}

                {therapist.specialties?.length > 0 && (
                  <p className="mt-1 text-sm">
                    {therapist.specialties.join(" · ")}
                  </p>
                )}

                <Link
                  href={`/team/${therapist._id}`}
                  className="mt-4 inline-block text-[var(--color-primary)] underline"
                >
                  View Profile
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}