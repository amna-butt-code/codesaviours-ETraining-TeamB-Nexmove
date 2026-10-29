import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageHero from "../../components/PageHero";
import LogoutButton from "./LogoutButton";
import { API } from "../../lib/serverApi";

export const metadata = { title: "My Portal | Nexmove Physiotherapy Clinic" };

async function getAppointments(token) {
  try {
    const res = await fetch(`${API}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 401) return { expired: true, list: [] };
    if (!res.ok) return { list: [], failed: true };
    const json = await res.json();
    const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
    return { list };
  } catch {
    return { list: [], failed: true };
  }
}

export default async function Portal() {
  const store = await cookies();
  const token = store.get("nx_token")?.value;
  if (!token) redirect("/login");

  let user = {};
  try { user = JSON.parse(store.get("nx_user")?.value || "{}"); } catch {}

  const { list, expired, failed } = await getAppointments(token);
  if (expired) redirect("/login");

  return (
    <div>
      <PageHero title="My Portal" subtitle={user.name ? `Welcome, ${user.name}` : "Welcome"} />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--color-dark)]">My appointments</h2>
          <LogoutButton />
        </div>
        {failed && <p role="alert">Could not load appointments. Please try again later.</p>}
        {!failed && list.length === 0 && <p>You have no appointments yet.</p>}
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a._id} className="border rounded-xl p-4">
              <p>Date: {a.date ? String(a.date).slice(0, 10) : "-"} {a.slot || a.time || ""}</p>
              <p>Status: {a.status || "-"}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}