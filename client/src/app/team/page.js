import Link from "next/link";
import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Our Team | Nexmove Physiotherapy Clinic",
  description: "Meet the physiotherapists at Nexmove Physiotherapy Clinic.",
};

const team = [
  { slug: "therapist-1", name: "[Physiotherapist name]" },
  { slug: "therapist-2", name: "[Physiotherapist name]" },
];

export default function Team() {
  return (
    <div>
      <PageHero title="Our Team" subtitle="[Team intro from client]" />
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((t) => (
          <div key={t.slug} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="h-40 bg-[var(--color-light)] rounded-lg mb-4 flex items-center justify-center">[Photo]</div>
            <h2 className="text-xl font-bold text-[var(--color-dark)]">{t.name}</h2>
            <p>[Qualification] | [Specialty]</p>
            <Link href={`/team/${t.slug}`} className="inline-block mt-3 text-[var(--color-primary)] underline">
              View profile
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}