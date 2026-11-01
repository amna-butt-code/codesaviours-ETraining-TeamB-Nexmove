import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Privacy Policy | Nexmove Physiotherapy Clinic",
  description: "How Nexmove Physiotherapy Clinic collects and protects your information.",
};

export default function Privacy() {
  return (
    <div>
      <PageHero title="Privacy Policy" />
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">What we collect</h2>
          <p>Name, phone number, email, appointment details, and health information you choose to provide in forms.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">How we use it</h2>
          <p>To book and manage appointments, contact you, and provide physiotherapy care.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">How it is stored and protected</h2>
          <p>Data is stored in a secured database. Session notes and medical history are visible only to your assigned physiotherapist and clinic administrators. Passwords are stored hashed.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Your consent</h2>
          <p>We ask for your consent before collecting medical history or booking details.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Contact</h2>
          <p>
  Phone: <a href="tel:03266312211">0326 6312211</a>
</p>
        </div>
        <p className="text-sm">This is a draft policy and must be reviewed by the clinic before launch.</p>
      </section>
    </div>
  );
}