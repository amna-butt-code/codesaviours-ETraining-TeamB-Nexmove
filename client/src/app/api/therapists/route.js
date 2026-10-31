import { NextResponse } from "next/server";
import { API } from "../../../lib/serverApi";

export async function GET() {
  try {
    const response = await fetch(
      `${API.replace(/\/+$/, "")}/api/therapists/allTherapists`,
      { cache: "no-store" }
    );

    const json = await response.json().catch(() => ({}));

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("Therapists proxy error:", error);

    return NextResponse.json(
      { message: "Unable to load therapists." },
      { status: 502 }
    );
  }
}