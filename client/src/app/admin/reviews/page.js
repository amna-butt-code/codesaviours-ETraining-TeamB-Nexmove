"use client";
import { useState } from "react";

export default function Reviews() {
  const [id, setId] = useState("");
  const [msg, setMsg] = useState("");

  async function approve(e) {
    e.preventDefault();
    setMsg("Saving...");
    try {
      const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id.trim())}/approve`, { method: "PUT" });
      const j = await res.json().catch(() => ({}));
      setMsg(res.ok ? "Review approved." : j.message || "Could not approve.");
    } catch {
      setMsg("Could not approve.");
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Review moderation</h1>
      <p className="text-sm">There is no endpoint to list pending reviews yet, so a review can only be approved by ID.</p>
      <form onSubmit={approve} className="space-y-3">
        <input className="border rounded-lg p-3 w-full" placeholder="Review ID" required value={id} onChange={(e) => setId(e.target.value)} />
        <button className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">Approve review</button>
        {msg && <p role="alert">{msg}</p>}
      </form>
    </div>
  );
}