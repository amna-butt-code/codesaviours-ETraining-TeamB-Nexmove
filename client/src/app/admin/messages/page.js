"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages");
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.message || "Could not load messages.");
      else setList(Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : []);
    } catch {
      setError("Could not load messages.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
    else setError("Could not update the message.");
  }

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError("Could not delete the message.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Messages</h1>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && list.length === 0 && <p>No messages yet.</p>}
      <ul className="space-y-3">
        {list.map((m) => (
          <li key={m._id} className="border rounded-xl p-4 space-y-1">
            <p className="font-semibold">
              {m.name} {m.phone ? `| ${m.phone}` : ""} | {m.email}
            </p>
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <span className="text-sm">Status: {m.status}</span>
              <button onClick={() => setStatus(m._id, "read")} className="border px-3 py-1 rounded">Mark read</button>
              <button onClick={() => setStatus(m._id, "replied")} className="border px-3 py-1 rounded">Mark replied</button>
              <button onClick={() => remove(m._id)} className="border px-3 py-1 rounded text-red-700">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}