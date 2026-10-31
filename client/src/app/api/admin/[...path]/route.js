import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "../../../../lib/serverApi";

const ALLOWED = ["messages", "appointments", "reviews", "services", "therapists", "holidays", "packages"];

async function forward(req, ctx) {
  const { path } = await ctx.params;
  if (!ALLOWED.includes(path[0])) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const store = await cookies();
  const token = store.get("nx_token")?.value;
  if (!token) return NextResponse.json({ message: "Please log in." }, { status: 401 });

  const url = `${API}/api/${path.map(encodeURIComponent).join("/")}${new URL(req.url).search}`;
  const init = {
    method: req.method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };
  if (!["GET", "DELETE"].includes(req.method)) init.body = await req.text();
  try {
    const res = await fetch(url, init);
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Cannot reach the server." }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };