import { notFound } from "next/navigation";
import PageHero from "../../../components/PageHero";
import { getRecord } from "../../../lib/api";

function toTextList(value) {
  if (Array.isArray(value)) {
    return value.filter(
      (item) => typeof item === "string" && item.trim()
    );
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export const dynamic = 'force-dynamic';

export default async function ConditionDetail({ params }) {
  const { slug } = await params;

  const condition = await getRecord(
    `/api/conditions/${encodeURIComponent(slug)}`
  );

  if (!condition || !condition.slug) {
    notFound();
  }

  const symptoms = toTextList(condition.commonSymptoms);
  const seekHelp = toTextList(condition.whenToSeekHelp);

  return (
    <div>
      <PageHero
        title={condition.title}
        subtitle={condition.summary || ""}
      />

      <article className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        {condition.description && (
          <p className="whitespace-pre-wrap leading-8">
            {condition.description}
          </p>
        )}

        {symptoms.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-bold text-[var(--color-dark)]">
              Common Symptoms
            </h2>

            <ul className="list-disc space-y-2 pl-6">
              {symptoms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {seekHelp.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-bold text-[var(--color-dark)]">
              When to Seek Help
            </h2>

            <ul className="list-disc space-y-2 pl-6">
              {seekHelp.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="border-t pt-4 text-sm text-gray-600">
          This content is general information and does not diagnose a
          condition or replace advice from a qualified healthcare
          professional.
        </p>
      </article>
    </div>
  );
}