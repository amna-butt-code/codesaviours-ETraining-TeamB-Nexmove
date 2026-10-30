import Link from "next/link";
import { getList } from "../lib/api";

const steps = [
  {
    title: "Book",
    text: "Choose a service and a time that suits you.",
  },
  {
    title: "Assessment",
    text: "Your physiotherapist assesses your condition.",
  },
  {
    title: "Treatment plan",
    text: "Your physiotherapist discusses an appropriate plan with you.",
  },
  {
    title: "Recovery",
    text: "Follow the plan agreed with your physiotherapist.",
  },
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [faqs, conditions, services] = await Promise.all([
    getList("/api/faqs"),
    getList("/api/conditions"),
    getList("/api/services/getServices"),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--color-light)] px-4 py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Nexmove Physiotherapy Clinic
        </p>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-[var(--color-dark)] md:text-5xl">
          Move better. Feel better. Your next move starts here.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg">
          Explore the clinic&apos;s listed services and request an appointment.
        </p>

        <Link
          href="/book"
          className="mt-8 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Book Appointment
        </Link>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-bold text-[var(--color-dark)]">
          Our Services
        </h2>

        {services.length === 0 ? (
          <p>
            Current service details are not available online yet. Please
            contact the clinic for verified information.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service) => (
              <article
                key={service._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <h3 className="font-bold text-[var(--color-dark)]">
                  {service.name}
                </h3>

                {service.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {service.description}
                  </p>
                )}

                {service._id && (
                  <Link
                    href={`/services/${service._id}`}
                    className="mt-3 inline-block text-[var(--color-primary)] underline"
                  >
                    Service details
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}

        <Link
          href="/services"
          className="mt-5 inline-block text-[var(--color-primary)] underline"
        >
          View all services
        </Link>
      </section>

      {/* Conditions */}
      <section className="bg-[var(--color-light)] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-3xl font-bold text-[var(--color-dark)]">
            Conditions We Treat
          </h2>

          {conditions.length === 0 ? (
            <p>
              Condition information is being updated. Please contact the
              clinic with questions about your care.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {conditions.slice(0, 8).map((condition) => (
                <Link
                  key={condition._id || condition.slug}
                  href={`/conditions/${condition.slug}`}
                  className="rounded-full bg-white px-4 py-2 shadow-sm hover:text-[var(--color-primary)]"
                >
                  {condition.title}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/conditions"
            className="mt-5 inline-block text-[var(--color-primary)] underline"
          >
            Explore conditions
          </Link>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-bold text-[var(--color-dark)]">
          How It Works
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <article
              key={item.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <p className="text-xl font-bold text-[var(--color-primary)]">
                {index + 1}. {item.title}
              </p>

              <p className="mt-2">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[var(--color-light)] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-3xl font-bold text-[var(--color-dark)]">
            Frequently Asked Questions
          </h2>

          {faqs.length === 0 ? (
            <p>Frequently asked questions are not available online yet.</p>
          ) : (
            <div className="space-y-3">
              {faqs.slice(0, 3).map((faq) => (
                <article
                  key={faq._id || faq.question}
                  className="rounded-xl bg-white p-4"
                >
                  <h3 className="font-semibold text-[var(--color-dark)]">
                    {faq.question}
                  </h3>
                  <p className="mt-1">{faq.answer}</p>
                </article>
              ))}
            </div>
          )}

          <Link
            href="/faq"
            className="mt-4 inline-block text-[var(--color-primary)] underline"
          >
            See all FAQs
          </Link>
        </div>
      </section>

      {/* Clinic information already supplied by the team */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-3xl font-bold text-[var(--color-dark)]">
          Visit Nexmove
        </h2>

        <p>Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad</p>

        <p className="mt-2">
          Men: 9 AM to 1 PM. Women and children: 1 PM to 10 PM.
        </p>

        <p className="mt-2 text-sm text-gray-600">
          For current appointment availability, please contact the clinic.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-primary)] px-4 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">
          Ready to take your next step?
        </h2>

        <Link
          href="/book"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-[var(--color-primary)]"
        >
          Request an Appointment
        </Link>
      </section>
    </div>
  );
}