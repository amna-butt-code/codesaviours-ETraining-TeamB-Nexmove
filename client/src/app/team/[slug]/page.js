import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../../components/PageHero";
import { getList } from "../../../lib/api";

export const dynamic = 'force-dynamic';

export default async function TherapistProfile({ params }) {
  const { slug } = await params;

  const therapists = await getList(
    "/api/therapists/allTherapists",
    { listKey: "therapists" }
  );

  const therapist = therapists.find(
    (item) => String(item._id) === String(slug)
  );

  if (!therapist || therapist.inactive) {
    notFound();
  }

  return (
    <div>
      <PageHero
        title={therapist.name}
        subtitle={(therapist.specialties || []).join(" · ")}
      />

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-10">
        {therapist.profileImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={therapist.profileImage}
            alt={`Portrait of ${therapist.name}`}
            className="max-h-96 w-full rounded-2xl object-cover"
          />
        )}

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold text-[var(--color-dark)]">
            Professional Information
          </h2>

          <p className="mt-3">
            <strong>Qualifications:</strong>{" "}
            {therapist.qualification?.join(", ") || "Not provided"}
          </p>

          <p className="mt-2">
            <strong>Specialties:</strong>{" "}
            {therapist.specialties?.join(", ") || "Not provided"}
          </p>
        </div>

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