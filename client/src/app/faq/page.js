import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Frequently Asked Questions | Nexmove Physiotherapy Clinic",
  description:
    "Answers to frequently asked questions published by Nexmove Physiotherapy Clinic.",
};

export const dynamic = 'force-dynamic';

export default async function FAQ() {
  const faqs = await getList("/api/faqs");

  const groupedFaqs = faqs.reduce((groups, faq) => {
    const category = faq.category || "General";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(faq);

    return groups;
  }, {});

  return (
    <div>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Answers currently published by the clinic."
      />

      <section className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {faqs.length === 0 ? (
          <p>
            FAQs are not available online yet. Please contact the clinic
            with your question.
          </p>
        ) : (
          Object.entries(groupedFaqs).map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-4 text-2xl font-bold text-[var(--color-dark)]">
                {category}
              </h2>

              <div className="space-y-3">
                {items.map((faq) => (
                  <article
                    key={faq._id || faq.question}
                    className="rounded-xl border bg-white p-5"
                  >
                    <h3 className="font-semibold">{faq.question}</h3>

                    <p className="mt-2 whitespace-pre-wrap text-gray-700">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
}