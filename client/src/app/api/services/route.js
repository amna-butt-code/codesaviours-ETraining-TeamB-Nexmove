import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

export async function GET() {
  try {
    const response = await fetch(
      `${API.replace(/\/+$/, "")}/api/services/getServices`,
      { cache: "no-store" }
    );

    const json = await response.json().catch(() => []);

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("Services proxy error:", error);

    return NextResponse.json(
      { message: "Unable to load services." },
      { status: 502 }
    );
  }
}