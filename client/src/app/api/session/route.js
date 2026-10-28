import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

const opts = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24,
};

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  let res;
  try {
    res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ message: "Cannot reach the server. Please try again." }, { status: 502 });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.data?.token) {
    return NextResponse.json({ message: json.message || "Login failed" }, { status: res.status || 400 });
  }
  const store = await cookies();
  store.set("nx_token", json.data.token, opts);
  store.set("nx_user", JSON.stringify(json.data.user), opts);
  return NextResponse.json({ user: json.data.user });
}

export async function GET() {
  const store = await cookies();
  const raw = store.get("nx_user")?.value;
  if (!store.get("nx_token") || !raw) return NextResponse.json({ user: null }, { status: 401 });
  try {
    return NextResponse.json({ user: JSON.parse(raw) });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete("nx_token");
  store.delete("nx_user");
  return NextResponse.json({ ok: true });
}