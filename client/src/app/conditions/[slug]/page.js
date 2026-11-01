import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecord } from "../../../lib/api";

const DESCRIPTION_HEADINGS = new Map([
  ["overview", "Overview"],
  ["what it is", "Overview"],
  ["causes", "What can cause it?"],
  ["possible causes", "What can cause it?"],
  ["severity", "How severe can it be?"],
  ["how severe can it be", "How severe can it be?"],
  ["life threatening risk", "Can it be life-threatening?"],
  ["is it life threatening", "Can it be life-threatening?"],
  ["possible long term effects", "Possible long-term effects"],
  ["long term risks", "Possible long-term effects"],
  ["future risks", "Possible long-term effects"],
]);

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

function parseDescriptionSections(description) {
  if (
    typeof description !== "string" ||
    !description.trim()
  ) {
    return [];
  }

  const lines = description
    .replace(/\r\n?/g, "\n")
    .split("\n");

  const sections = [];

  let current = {
    title: "Overview",
    lines: [],
  };

  for (const line of lines) {
    const normalizedHeading = line
      .trim()
      .replace(/^#{1,6}\s*/, "")
      .replace(/:$/, "")
      .replace(/[?]/g, "")
      .replace(/[-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const heading = DESCRIPTION_HEADINGS.get(
      normalizedHeading
    );

    if (heading) {
      const content = current.lines.join("\n").trim();

      if (content) {
        sections.push({
          title: current.title,
          content,
        });
      }

      current = {
        title: heading,
        lines: [],
      };

      continue;
    }

    current.lines.push(line);
  }

  const remainingContent = current.lines.join("\n").trim();

  if (remainingContent) {
    sections.push({
      title: current.title,
      content: remainingContent,
    });
  }

  return sections;
}

function toParagraphs(value) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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

  const descriptionSections = parseDescriptionSections(
    condition.description
  );

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

          {condition.summary && (
            <p>{condition.summary}</p>
          )}

        </div>
      </section>

      <article className="nm-container nm-detail-content">

        {/* Condition description and information */}

        {descriptionSections.map((section, index) => (
          <section
            className="nm-detail-card nm-condition-detail-card"
            key={`${section.title}-${index}`}
          >
            <h2>{section.title}</h2>

            <div className="nm-condition-detail-copy">
              {toParagraphs(section.content).map(
                (paragraph, paragraphIndex) => (
                  <p
                    key={`${index}-${paragraphIndex}`}
                    className="whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                )
              )}
            </div>
          </section>
        ))}

        {/* Symptoms */}

        {symptoms.length > 0 && (
          <section className="nm-detail-card">
            <h2>Common symptoms</h2>

            <p className="nm-condition-section-intro">
              Symptoms can vary depending on the underlying cause.
              Not everyone experiences all of the symptoms listed below.
            </p>

            <ul className="nm-detail-list">
              {symptoms.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Where and when to seek medical help */}

        {seekHelp.length > 0 && (
          <section className="nm-detail-card">
            <h2>When and where to seek help</h2>

            <ul className="nm-detail-list">
              {seekHelp.map((item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact card */}

        <section className="nm-detail-card nm-detail-contact">
          <h2>Have a question?</h2>

          <p>
            Contact the clinic for enquiries. A qualified
            healthcare professional can advise on individual
            concerns.
          </p>

          <Link href="/contact" className="nm-button">
            Contact Nexmove
          </Link>
        </section>

        <p className="nm-directory-disclaimer">
          This information is for general educational purposes.
          It is not a diagnosis or a substitute for advice from
          a qualified healthcare professional. Seek emergency
          medical care when serious warning signs are present.
        </p>

      </article>
    </main>
  );
}