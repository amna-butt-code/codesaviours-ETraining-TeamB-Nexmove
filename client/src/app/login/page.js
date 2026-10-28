"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHero from "../../components/PageHero";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message || "Login failed");
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHero title="Login" subtitle="Access your appointments." />
      <section className="max-w-md mx-auto px-4 py-10">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input id="email" type="email" required className="border rounded-lg p-3 w-full"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1">Password</label>
            <input id="password" type="password" required className="border rounded-lg p-3 w-full"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <button disabled={busy} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
            {busy ? "Logging in..." : "Login"}
          </button>
          <p>No account? <Link href="/signup" className="underline text-[var(--color-primary)]">Sign up</Link></p>
        </form>
      </section>
    </div>
  );
}