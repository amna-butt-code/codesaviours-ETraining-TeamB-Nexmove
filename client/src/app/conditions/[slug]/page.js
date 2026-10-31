import Link from "next/link";
import { notFound } from "next/navigation";
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

export const dynamic = "force-dynamic";

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
    <main className="nm-detail-page">
      <section className="nm-detail-hero">
        <div className="nm-container">
          <Link href="/conditions" className="nm-detail-back">
            Back to conditions
          </Link>

          <span className="nm-directory-eyebrow">
            NEXMOVE <span aria-hidden="true">|</span> CONDITION INFORMATION
          </span>

          <h1>{condition.title}</h1>

          {condition.summary && <p>{condition.summary}</p>}
        </div>
      </section>

      <article className="nm-container nm-detail-content">
        {condition.description && (
          <section className="nm-detail-card">
            <h2>Overview</h2>
            <p className="whitespace-pre-wrap">
              {condition.description}
            </p>
          </section>
        )}

        {symptoms.length > 0 && (
          <section className="nm-detail-card">
            <h2>Common symptoms</h2>
            <ul className="nm-detail-list">
              {symptoms.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {seekHelp.length > 0 && (
          <section className="nm-detail-card">
            <h2>When to seek help</h2>
            <ul className="nm-detail-list">
              {seekHelp.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="nm-detail-card nm-detail-contact">
          <h2>Have a question?</h2>
          <p>
            Contact the clinic for enquiries. A qualified healthcare
            professional can advise on individual concerns.
          </p>

          <Link href="/contact" className="nm-button">
            Contact Nexmove
          </Link>
        </section>

        <p className="nm-directory-disclaimer">
          This information is for general educational purposes. It is not
          a diagnosis or a substitute for advice from a qualified
          healthcare professional.
        </p>
      </article>
    </main>
  );
}