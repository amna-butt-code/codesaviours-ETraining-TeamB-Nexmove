import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ message: "Please type a message." }, { status: 400 });
  }
  try {
    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.reply) {
      return NextResponse.json(
        { message: json.message || "The assistant is unavailable right now." },
        { status: res.ok ? 502 : res.status }
      );
    }
    return NextResponse.json({ reply: json.reply, urgent: !!json.urgent });
  } catch {
    return NextResponse.json({ message: "Cannot reach the server. Please try again." }, { status: 502 });
  }
}