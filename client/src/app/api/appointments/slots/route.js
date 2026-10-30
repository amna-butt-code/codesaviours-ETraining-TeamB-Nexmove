import { NextResponse } from "next/server";
import { API } from "../../../../lib/serverApi";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const therapistId = searchParams.get("therapistId") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const date = searchParams.get("date") || "";

  if (
    !OBJECT_ID.test(therapistId) ||
    !OBJECT_ID.test(serviceId) ||
    !DATE_PATTERN.test(date)
  ) {
    return NextResponse.json(
      { message: "Choose a valid service, therapist and date." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      `${API.replace(/\/+$/, "")}/api/appointments/getAvailableSlots`
    );

    url.searchParams.set("therapistId", therapistId);
    url.searchParams.set("serviceId", serviceId);
    url.searchParams.set("date", date);

    const response = await fetch(url, { cache: "no-store" });
    const json = await response.json().catch(() => ({}));

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("Appointment slots proxy error:", error);

    return NextResponse.json(
      { message: "The booking server is unavailable." },
      { status: 502 }
    );
  }
}
