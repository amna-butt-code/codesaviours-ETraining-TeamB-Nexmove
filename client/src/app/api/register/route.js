import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  try {
    const res = await fetch(`${API}/api/auth/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: b.name, email: b.email, password: b.password, phone: b.phone }),
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json({ message: json.message || "Done" }, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Cannot reach the server. Please try again." }, { status: 502 });
  }
}