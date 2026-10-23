import Link from "next/link";
import PageHero from "../../../components/PageHero";

export default async function TherapistProfile({ params }) {
  const { slug } = await params;
  return (
    <div>
      <PageHero title="[Physiotherapist name]" subtitle={`[Profile: ${slug}]`} />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-3">
        <p>Qualification: [From client]</p>
        <p>Specialty: [From client]</p>
        <p>Experience: [From client]</p>
        <p>Available days: [From client]</p>
        <Link href="/book" className="inline-block mt-4 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">
          Book with this therapist
        </Link>
      </section>
    </div>
  );
}