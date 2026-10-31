import Link from "next/link";
import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Packages & Fees | Nexmove Physiotherapy Clinic",
  description: "Session fees and treatment packages at Nexmove Physiotherapy Clinic.",
};

const packages = [
  "Single session",
  "Assessment",
  "5-session package",
  "10-session package",
  "Home visit",
];

export default function Packages() {
  return (
    <div>
      <PageHero title="Packages & Fees" subtitle="Fees as provided by the clinic." />
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <div key={p} className="bg-white rounded-xl p-5 shadow-sm border">
            <h2 className="text-xl font-bold text-[var(--color-dark)]">{p}</h2>
            <p className="mt-2 text-2xl text-[var(--color-primary)]">[Fee]</p>
            <Link href="/book" className="inline-block mt-4 underline text-[var(--color-primary)]">
              Book now
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}