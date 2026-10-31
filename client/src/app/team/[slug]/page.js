import Link from "next/link";
import { notFound } from "next/navigation";
import { getList } from "../../../lib/api";

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

export default async function TherapistProfile({ params }) {
  const { slug } = await params;

  const therapists = await getList(
    "/api/therapists/allTherapists",
    { listKey: "therapists" }
  );

  const therapist = therapists.find(
    (item) =>
      String(item._id) === String(slug) &&
      item.inactive !== true
  );

  if (!therapist) {
    notFound();
  }

  const qualifications = Array.isArray(therapist.qualification)
    ? therapist.qualification.filter(
        (item) => typeof item === "string" && item.trim()
      )
    : [];

  const specialties = Array.isArray(therapist.specialties)
    ? therapist.specialties.filter(
        (item) => typeof item === "string" && item.trim()
      )
    : [];

  return (
    <main className="nm-detail-page">
      <section className="nm-detail-hero">
        <div className="nm-container">
          <Link href="/team" className="nm-detail-back">
            Back to our team
          </Link>

          <span className="nm-directory-eyebrow">
            NEXMOVE <span aria-hidden="true">|</span> OUR TEAM
          </span>

          <h1>{therapist.name}</h1>

          <p>
            Physiotherapist listed in the Nexmove clinic directory.
          </p>
        </div>
      </section>

      <section className="nm-container nm-detail-content">
        <article className="nm-team-profile-card">
          <div
            className="nm-team-avatar nm-team-avatar--profile"
            aria-hidden="true"
          >
            <span>{getInitials(therapist.name)}</span>
          </div>

          <div className="nm-team-profile-content">
            <span className="nm-team-role">PHYSIOTHERAPIST</span>

            <h2>{therapist.name}</h2>

            {qualifications.length > 0 && (
              <div className="nm-team-profile-section">
                <h3>Qualifications</h3>
                <p>{qualifications.join(", ")}</p>
              </div>
            )}

            {specialties.length > 0 && (
              <div className="nm-team-profile-section">
                <h3>Areas of practice</h3>
                <p>{specialties.join(", ")}</p>
              </div>
            )}

            {qualifications.length === 0 && specialties.length === 0 && (
              <p className="nm-team-profile-note">
                Further professional information will be displayed
                after confirmation by the clinic.
              </p>
            )}

            <Link href="/contact" className="nm-button">
              Contact Nexmove
            </Link>
          </div>
        </article>

        <p className="nm-directory-disclaimer">
          Professional details are displayed only when provided and
          confirmed by the clinic.
        </p>
      </section>
    </main>
  );
}