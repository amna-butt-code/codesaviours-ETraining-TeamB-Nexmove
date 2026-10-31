import Link from "next/link";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Our Physiotherapists | Nexmove",
  description:
    "Meet the physiotherapists listed in the Nexmove clinic directory.",
};

export const dynamic = "force-dynamic";

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter((word) => !/^(dr\.?|pt)$/i.test(word));

  if (words.length === 0) return "N";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default async function Team() {
  const therapists = await getList(
    "/api/therapists/allTherapists",
    { listKey: "therapists" }
  );

  const activeTherapists = therapists.filter(
    (therapist) => therapist.inactive !== true && therapist.name
  );

  return (
    <main className="nm-directory-page">
      <section className="nm-directory-hero">
        <div className="nm-container nm-directory-hero-grid">
          <div>
            <span className="nm-directory-eyebrow">
              THE PEOPLE AT NEXMOVE
            </span>

            <h1>
              Meet the <em>team.</em>
            </h1>

            <p>
              Get to know the physiotherapists listed in the Nexmove
              clinic directory.
            </p>
          </div>

          <aside className="nm-directory-highlight">
            <span>REHABILITATION | WELLNESS</span>
            <strong>Your next move starts here.</strong>
            <p>Helping you move better.</p>
          </aside>
        </div>
      </section>

      <section className="nm-directory-section">
        <div className="nm-container">
          <div className="nm-directory-heading">
            <div>
              <span className="nm-directory-eyebrow">
                OUR PHYSIOTHERAPISTS
              </span>
              <h2>People directory</h2>
            </div>

            <span className="nm-directory-count">
              {activeTherapists.length}{" "}
              {activeTherapists.length === 1 ? "profile" : "profiles"} listed
            </span>
          </div>

          {activeTherapists.length === 0 ? (
            <div className="nm-directory-empty">
              <h3>Team profiles are being updated</h3>
              <p>
                Therapist profiles will appear here once they have been
                added to the clinic directory. Contact Nexmove for
                current team information.
              </p>
              <Link href="/contact" className="nm-button">
                Contact the clinic
              </Link>
            </div>
          ) : (
            <div className="nm-team-grid">
              {activeTherapists.map((therapist) => (
                <article className="nm-team-card" key={therapist._id}>
                  <div className="nm-team-avatar" aria-hidden="true">
                    <span>{getInitials(therapist.name)}</span>
                  </div>

                  <div className="nm-team-card-content">
                    <span className="nm-team-role">
                      PHYSIOTHERAPIST
                    </span>

                    <h3>{therapist.name}</h3>

                    <p>
                      Professional profile details will be added after
                      confirmation by the clinic.
                    </p>

                    {therapist._id && (
                      <Link
                        href={`/team/${encodeURIComponent(therapist._id)}`}
                        className="nm-directory-link"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="nm-directory-disclaimer">
            Photos, qualifications and professional details are not
            displayed until confirmed by the clinic.
          </p>
        </div>
      </section>
    </main>
  );
}