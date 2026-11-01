"use client";
import { useState } from "react";

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"];

export default function Appointments() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("Saving...");
    try {
      const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id.trim())}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const j = await res.json().catch(() => ({}));
      setMsg(res.ok ? "Status updated." : j.message || "Could not update.");
    } catch {
      setMsg("Could not update.");
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Appointments</h1>
      <p className="text-sm">
        The backend has no endpoint to list all appointments yet, so a status can only be changed by appointment ID.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded-lg p-3 w-full" placeholder="Appointment ID" required value={id} onChange={(e) => setId(e.target.value)} />
        <select className="border rounded-lg p-3 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">Update status</button>
        {msg && <p role="alert">{msg}</p>}
      </form>
    </div>
  );
}