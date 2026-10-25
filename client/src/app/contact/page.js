"use client";
import { useState } from "react";
import PageHero from "../../components/PageHero";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "Thank you. We will get back to you." : "Could not send. Please try again.");
    } catch {
      setStatus("Could not send. Please try again.");
    }
  }

  return (
    <div>
      <PageHero title="Contact Us" subtitle="Book by phone or Instagram DM, or send us a message." />
      <section className="max-w-5xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <p>Address: Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad</p>
          <p>Phone: 0326 6312211</p>
          <p>Email: [Clinic email]</p>
          <p>Men: 9 AM to 1 PM</p>
          <p>Women and children: 1 PM to 10 PM</p>
          <p>
            <a href="https://www.instagram.com/nexmove_/" target="_blank" rel="noopener noreferrer" className="underline text-[var(--color-primary)]">Instagram DM</a>
            {" | "}
            <a href="https://share.google/i4m42aMPoyZVJKvn3" target="_blank" rel="noopener noreferrer" className="underline text-[var(--color-primary)]">Google Maps</a>
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="border rounded-lg p-3 w-full" placeholder="Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className="border rounded-lg p-3 w-full" placeholder="Phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className="border rounded-lg p-3 w-full" placeholder="Email (optional)" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <textarea className="border rounded-lg p-3 w-full" rows={4} placeholder="Message" required value={form.message} onChange={(e) => set("message", e.target.value)} />
          <button className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">Send message</button>
          {status && <p>{status}</p>}
        </form>
      </section>
    </div>
  );
}