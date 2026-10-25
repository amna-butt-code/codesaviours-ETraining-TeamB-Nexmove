import Link from "next/link";
import { getList } from "../lib/api";

const steps = [
  { title: "Book", text: "Choose a service and a time that suits you." },
  { title: "Assessment", text: "Your physiotherapist assesses your condition." },
  { title: "Treatment plan", text: "You get a plan made for your recovery." },
  { title: "Recovery", text: "Regular sessions help you move better again." },
];

const services = ["[Service 1]", "[Service 2]", "[Service 3]", "[Service 4]"];
const conditions = ["Back pain", "Neck pain", "Knee pain", "Frozen shoulder", "Sciatica", "Sports injuries"];

export default async function Home() {
  const faqs = (await getList("/api/faqs")).slice(0, 3);
  const apiConditions = await getList("/api/conditions");
  const conditionNames = apiConditions.length
    ? apiConditions.map((c) => c.title || c.name)
    : conditions;

  return (
    <div>
      <section className="bg-[var(--color-light)] px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] max-w-3xl mx-auto">
          Move better. Feel better. [Clinic headline]
        </h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          Professional physiotherapy care for pain relief and recovery.
        </p>
        <Link href="/book" className="inline-block mt-8 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90">
          Book Appointment
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Why choose Nexmove</h2>
        <p>[Reasons to be filled from client content]</p>
      </section>

      <section className="bg-[var(--color-light)] px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Our services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s} className="bg-white rounded-xl p-5 shadow-sm">{s}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Conditions we treat</h2>
        <div className="flex flex-wrap gap-3">
          {conditionNames.map((c) => (
            <span key={c} className="bg-[var(--color-light)] px-4 py-2 rounded-full">{c}</span>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-light)] px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-[var(--color-primary)] font-bold text-xl">{i + 1}. {s.title}</div>
                <p className="mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">Frequently asked questions</h2>
        {faqs.length === 0 ? (
          <p>FAQs will appear here soon.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f._id || f.question} className="bg-[var(--color-light)] rounded-xl p-4">
                <h3 className="font-semibold text-[var(--color-dark)]">{f.question}</h3>
                <p className="mt-1">{f.answer}</p>
              </div>
            ))}
          </div>
        )}
        <Link href="/faq" className="inline-block mt-4 text-[var(--color-primary)] underline">See all FAQs</Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">Location and timings</h2>
        <p>Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad</p>
<p>Men: 9 AM to 1 PM. Women and children: 1 PM to 10 PM.</p>
      </section>

      <section className="bg-[var(--color-primary)] text-white px-4 py-14 text-center">
        <h2 className="text-3xl font-bold">Ready to start your recovery?</h2>
        <Link href="/book" className="inline-block mt-6 bg-white text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold">
          Book Appointment
        </Link>
      </section>
    </div>
  );
}