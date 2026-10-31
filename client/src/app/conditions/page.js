import Link from "next/link";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Conditions | Nexmove Physiotherapy Clinic",
  description:
    "Browse condition information currently published by Nexmove.",
};

export const dynamic = "force-dynamic";

export default async function Conditions() {
  const conditions = await getList("/api/conditions");

  return (
    <main className="nm-directory-page">
      <section className="nm-directory-hero">
        <div className="nm-container nm-directory-hero-grid">
          <div>
            <span className="nm-directory-eyebrow">
              MOVEMENT <span aria-hidden="true">|</span> WELLNESS
            </span>

            <h1>
              Understand your <em>movement.</em>
            </h1>

            <p>
              Browse the condition information currently available on
              the Nexmove website. For advice about your own symptoms,
              contact a qualified healthcare professional.
            </p>
          </div>

          <aside className="nm-directory-highlight">
            <span>TAKE IT ONE STEP AT A TIME</span>
            <strong>Information can be a useful starting point.</strong>
            <p>Every person&apos;s situation is different.</p>
          </aside>
        </div>
      </section>

      <section className="nm-directory-section">
        <div className="nm-container">
          <div className="nm-directory-heading">
            <div>
              <span className="nm-directory-eyebrow">
                CONDITION INFORMATION
              </span>
              <h2>Browse topics</h2>
            </div>

            <span className="nm-directory-count">
              {conditions.length}{" "}
              {conditions.length === 1 ? "topic" : "topics"} listed
            </span>
          </div>

          {conditions.length === 0 ? (
            <div className="nm-directory-empty">
              <h3>Condition information is being updated</h3>
              <p>
                There are no condition entries available online at the
                moment. Contact the clinic with your questions.
              </p>
              <Link href="/contact" className="nm-button">
                Contact the clinic
              </Link>
            </div>
          ) : (
            <div className="nm-directory-grid">
              {conditions.map((condition, index) => (
                <article
                  className="nm-directory-card"
                  key={condition._id || condition.slug}
                >
                  <div className="nm-directory-card-top">
                    <span className="nm-directory-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nm-directory-card-mark" aria-hidden="true">
                      N
                    </span>
                  </div>

                  <h3>{condition.title}</h3>

                  <p>
                    {condition.summary?.trim() ||
                      "Contact the clinic for more information about this topic."}
                  </p>

                  {condition.slug ? (
                    <Link
                      href={`/conditions/${encodeURIComponent(condition.slug)}`}
                      className="nm-directory-link"
                    >
                      Read condition information
                    </Link>
                  ) : (
                    <Link href="/contact" className="nm-directory-link">
                      Contact the clinic
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}

          <p className="nm-directory-disclaimer">
            This information is for general educational purposes. It is
            not a diagnosis or a substitute for an individual assessment
            by a qualified healthcare professional.
          </p>
        </div>
      </section>
    </main>
  );
}