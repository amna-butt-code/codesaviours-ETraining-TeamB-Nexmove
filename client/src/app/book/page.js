"use client";
import { useState } from "react";
import PageHero from "../../components/PageHero";

const services = ["[Service 1]", "[Service 2]", "[Service 3]"];
const therapists = ["Any available", "[Physiotherapist 1]", "[Physiotherapist 2]"];
const slots = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00"];
const steps = ["Service", "Therapist", "Date", "Time slot", "Your details", "Confirmation"];

export default function Book() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    service: "", therapist: "", date: "", slot: "",
    name: "", phone: "", consent: false,
  });

  const set = (k, v) => setForm({ ...form, [k]: v });
  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const choice = (list, key) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((item) => (
        <button
          key={item}
          onClick={() => { set(key, item); next(); }}
          className={`border rounded-xl p-4 text-left hover:border-[var(--color-primary)] ${form[key] === item ? "border-[var(--color-primary)] bg-[var(--color-light)]" : ""}`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  const canSubmit = form.name && form.phone && form.consent;

  return (
    <div>
      <PageHero title="Book Appointment" subtitle="Follow the steps to book your session." />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <p className="mb-6 font-semibold text-[var(--color-primary)]">
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>

        {step === 0 && choice(services, "service")}
        {step === 1 && choice(therapists, "therapist")}

        {step === 2 && (
          <div>
            <label htmlFor="date" className="block mb-2">Choose a date</label>
            <input id="date" type="date" value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="border rounded-lg p-3" />
            <div className="mt-4">
              <button disabled={!form.date} onClick={next}
                className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg disabled:opacity-50">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm">Sample slots. Real free slots will come from the server.</p>
            <div className="grid grid-cols-3 gap-3">
              {slots.map((s) => (
                <button key={s} onClick={() => { set("slot", s); next(); }}
                  className="border rounded-lg p-3 hover:border-[var(--color-primary)]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1">Full name</label>
              <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)}
                className="border rounded-lg p-3 w-full" />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1">Phone number</label>
              <input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="border rounded-lg p-3 w-full" />
            </div>
            <label className="flex gap-2 items-start">
              <input type="checkbox" checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)} className="mt-1" />
              <span>I agree to the <a href="/privacy" className="underline">Privacy Policy</a> and consent to my details being used for this booking.</span>
            </label>
            <button disabled={!canSubmit} onClick={next}
              className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg disabled:opacity-50">
              Confirm booking
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="bg-[var(--color-light)] rounded-xl p-6 space-y-2">
            <h2 className="text-2xl font-bold text-[var(--color-dark)]">Booking summary</h2>
            <p>Service: {form.service}</p>
            <p>Therapist: {form.therapist}</p>
            <p>Date: {form.date} at {form.slot}</p>
            <p>Name: {form.name} | Phone: {form.phone}</p>
            <p className="text-sm">Demo only: not saved yet. It will be sent to the booking API once the backend is merged.</p>
          </div>
        )}

        {step > 0 && step < 5 && (
          <button onClick={back} className="mt-6 underline">Back</button>
        )}
      </section>
    </div>
  );
}