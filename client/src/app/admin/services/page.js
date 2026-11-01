"use client";
import { useCallback, useEffect, useState } from "react";

export default function AdminServices() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/services/getServices");
      const j = await res.json().catch(() => ({}));
      const data = Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : [];
      if (!res.ok) {
        setError(j.message || "Could not load services.");
      } else {
        setError("");
        setList(data);
      }
    } catch {
      setError("Could not load services.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  async function remove(id) {
    if (!confirm("Deactivate this service?")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError("Could not delete the service.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Services</h1>
      <p className="text-sm">Create and edit forms need the exact service fields from the backend and are pending.</p>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && list.length === 0 && <p>No services yet.</p>}
      <ul className="space-y-3">
        {list.map((s) => (
          <li key={s._id} className="border rounded-xl p-4 flex flex-wrap justify-between gap-2">
            <span className="font-semibold">{s.name}</span>
            <button onClick={() => remove(s._id)} className="border px-3 py-1 rounded text-red-700">Deactivate</button>
          </li>
        ))}
      </ul>
    </div>
  );
}