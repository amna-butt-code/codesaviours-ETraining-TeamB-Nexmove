"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHero from "../../components/PageHero";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", consent: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json.message || "Signup failed");
      else router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHero title="Create account" subtitle="Sign up to manage your appointments." />
      <section className="max-w-md mx-auto px-4 py-10">
        <form onSubmit={submit} className="space-y-4">
          <input className="border rounded-lg p-3 w-full" placeholder="Full name" required
            value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className="border rounded-lg p-3 w-full" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => set("email", e.target.value)} />
          <input className="border rounded-lg p-3 w-full" placeholder="Phone" required
            value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className="border rounded-lg p-3 w-full" type="password" placeholder="Password (min 8 characters)" required minLength={8}
            value={form.password} onChange={(e) => set("password", e.target.value)} />
          <label className="flex gap-2 items-start">
            <input type="checkbox" required checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1" />
            <span>I agree to the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
          </label>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <button disabled={busy} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
            {busy ? "Creating..." : "Sign up"}
          </button>
          <p>Already registered? <Link href="/login" className="underline text-[var(--color-primary)]">Login</Link></p>
        </form>
      </section>
    </div>
  );
}