
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "../../../../lib/serverApi";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const PAKISTANI_MOBILE = /^03\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCommon(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    OBJECT_ID.test(payload.therapistId || "") &&
    OBJECT_ID.test(payload.serviceId || "") &&
    typeof payload.appointmentDate === "string" &&
    !Number.isNaN(Date.parse(payload.appointmentDate)) &&
    payload.consentGiven === true &&
    (payload.notes === undefined ||
      (typeof payload.notes === "string" && payload.notes.length <= 500))
  );
}

async function forwardBooking(endpoint, payload, token = null) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `${API.replace(/\/+$/, "")}${endpoint}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const json = await response.json().catch(() => ({}));

    return NextResponse.json(json, {
      status: response.status,
    });
  } catch (error) {
    console.error("Booking proxy error:", error);

    return NextResponse.json(
      { message: "The booking server is unavailable. Please try again." },
      { status: 502 }
    );
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid booking request." },
      { status: 400 }
    );
  }

  const { bookingType, ...payload } = body;

  if (!validateCommon(payload)) {
    return NextResponse.json(
      { message: "Please check your selected appointment and consent." },
      { status: 400 }
    );
  }

  if (bookingType === "guest") {
    const guestName =
      typeof payload.guestName === "string"
        ? payload.guestName.trim()
        : "";

    const guestEmail =
      typeof payload.guestEmail === "string"
        ? payload.guestEmail.trim().toLowerCase()
        : "";

    const guestPhone =
      typeof payload.guestPhone === "string"
        ? payload.guestPhone.replace(/\s+/g, "")
        : "";

    if (
      !guestName ||
      guestName.length > 100 ||
      !EMAIL.test(guestEmail) ||
      guestEmail.length > 254 ||
      !PAKISTANI_MOBILE.test(guestPhone)
    ) {
      return NextResponse.json(
        {
          message:
            "Enter your name, a valid email address and an 11-digit Pakistani mobile number starting with 03.",
        },
        { status: 400 }
      );
    }

    return forwardBooking(
      "/api/appointments/bookGuest",
      {
        therapistId: payload.therapistId,
        serviceId: payload.serviceId,
        appointmentDate: payload.appointmentDate,
        guestName,
        guestEmail,
        guestPhone,
        consentGiven: true,
        notes: payload.notes || "",
      }
    );
  }

  if (bookingType === "account") {
    const store = await cookies();
    const token = store.get("nx_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Your login session has expired. Please log in again or continue as a guest.",
        },
        { status: 401 }
      );
    }

    return forwardBooking(
      "/api/appointments/book",
      {
        therapistId: payload.therapistId,
        serviceId: payload.serviceId,
        appointmentDate: payload.appointmentDate,
        consentGiven: true,
        notes: payload.notes || "",
      },
      token
    );
  }

  return NextResponse.json(
    { message: "Invalid booking type." },
    { status: 400 }
  );
}
