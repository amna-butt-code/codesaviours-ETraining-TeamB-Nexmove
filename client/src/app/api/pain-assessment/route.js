import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch(`${API}/api/pain-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Cannot reach the server." }, { status: 502 });
  }
}