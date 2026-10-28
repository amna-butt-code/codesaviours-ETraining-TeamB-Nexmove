import Link from "next/link";
import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Services | Nexmove Physiotherapy Clinic",
  description: "Physiotherapy services offered at Nexmove Physiotherapy Clinic.",
};

const services = [
  { slug: "service-1", title: "[Service 1]" },
  { slug: "service-2", title: "[Service 2]" },
  { slug: "service-3", title: "[Service 3]" },
  { slug: "service-4", title: "[Service 4]" },
];

export default function Services() {
  return (
    <div>
      <PageHero title="Our Services" subtitle="[Services intro from client]" />
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.slug} className="bg-white rounded-xl p-5 shadow-sm border">
            <h2 className="text-xl font-bold text-[var(--color-dark)]">{s.title}</h2>
            <p className="mt-2">[Short description]</p>
            <Link href={`/services/${s.slug}`} className="inline-block mt-4 text-[var(--color-primary)] underline">
              Learn more
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}