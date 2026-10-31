import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }) {
  const store = await cookies();
  let user = {};
  try { user = JSON.parse(store.get("nx_user")?.value || "{}"); } catch {}
  if (!store.get("nx_token") || user.role !== "admin") redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="flex flex-wrap gap-4 border-b pb-3 mb-6">
        <Link href="/admin" className="font-semibold">Dashboard</Link>
        <Link href="/admin/messages" className="underline">Messages</Link>
        <Link href="/admin/appointments" className="underline">Appointments</Link>
      </nav>
      {children}
    </div>
  );
}