import PageHero from "../../components/PageHero";

export const metadata = {
  title: "About | Nexmove Physiotherapy Clinic",
  description: "Learn about Nexmove Physiotherapy Clinic, our mission and facilities.",
};

export default function About() {
  return (
    <div>
      <PageHero title="About Nexmove" subtitle="[Short clinic tagline from client]" />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Our story</h2>
          <p>Nexmove is a rehabilitation and wellness clinic in Faisalabad, helping you move better.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Our mission</h2>
          <p>[Mission from client]</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Facilities and equipment</h2>
          <p>[Facilities from client]</p>
        </div>
      </section>
    </div>
  );
}