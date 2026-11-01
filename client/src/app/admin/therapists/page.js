"use client";
import { useEffect, useState } from "react";

export default function AdminTherapists() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/therapists/allTherapists");
        const j = await res.json().catch(() => ({}));
        const data = Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : [];
        if (!res.ok) setError(j.message || "Could not load therapists.");
        else setList(data);
      } catch {
        setError("Could not load therapists.");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Therapists</h1>
      <p className="text-sm">Create and edit forms need the exact therapist fields from the backend and are pending.</p>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && list.length === 0 && <p>No therapists yet.</p>}
      <ul className="space-y-3">
        {list.map((t) => (
          <li key={t._id} className="border rounded-xl p-4">
            <span className="font-semibold">{t.name}</span>
            {t.qualification ? <span> | {t.qualification}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}