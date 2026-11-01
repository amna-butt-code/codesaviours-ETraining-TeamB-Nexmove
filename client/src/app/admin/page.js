"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHome() {
  const [newCount, setNewCount] = useState(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : [];
        setNewCount(list.filter((m) => m.status === "new").length);
      })
      .catch(() => setNewCount(null));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-[var(--color-dark)]">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/messages" className="border rounded-xl p-5 block">
          <p className="text-sm">New messages</p>
          <p className="text-3xl font-bold">{newCount === null ? "-" : newCount}</p>
        </Link>
        <Link href="/admin/appointments" className="border rounded-xl p-5 block">
          <p className="text-sm">Appointments</p>
          <p>Update an appointment status</p>
        </Link>
      </div>
      <p className="text-sm">Appointment, service, therapist and review counts need list endpoints that are not in main yet.</p>
    </div>
  );
}