import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Terms of Use | Nexmove Physiotherapy Clinic",
  description: "Terms of use for the Nexmove Physiotherapy Clinic website.",
};

export default function Terms() {
  return (
    <div>
      <PageHero title="Terms of Use" />
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Medical disclaimer</h2>
          <p>Information on this website is for general guidance only. It is not medical advice or a diagnosis. In an emergency, seek urgent medical care.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Appointments</h2>
          <p>Appointments are subject to confirmation. Cancellation and rescheduling are allowed up to [time] before the appointment.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Use of the website</h2>
          <p>You agree to provide accurate information and not to misuse the website or its services.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Contact</h2>
          <p>[Clinic email and phone]</p>
        </div>
        <p className="text-sm">This is a draft and must be reviewed by the clinic before launch.</p>
      </section>
    </div>
  );
}