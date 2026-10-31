
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHero from "../../components/PageHero";

const STEPS = [
  "Service",
  "Therapist",
  "Date",
  "Time slot",
  "Your details",
];

const TIME_ZONE = "Asia/Karachi";
const ANY_THERAPIST = "any";

function getLocalDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function extractServices(json) {
  const candidates = [
    json,
    json?.data,
    json?.services,
    json?.data?.services,
    json?.data?.data,
    json?.data?.data?.services,
  ];

  return candidates.find(Array.isArray) || [];
}

function extractTherapists(json) {
  const candidates = [
    json,
    json?.data,
    json?.therapists,
    json?.data?.therapists,
    json?.data?.data,
    json?.data?.data?.therapists,
  ];

  return candidates.find(Array.isArray) || [];
}

function extractSlots(json) {
  const candidates = [
    json?.data?.availableSlots,
    json?.availableSlots,
    json?.data?.data?.availableSlots,
  ];

  return candidates.find(Array.isArray) || [];
}

function hasValidServiceDuration(service) {
  return (
    service?.duration !== null &&
    service?.duration !== undefined &&
    service?.duration !== "" &&
    Number.isSafeInteger(Number(service.duration)) &&
    Number(service.duration) > 0
  );
}

function isServiceBookable(service) {
  return (
    service?.bookingEnabled === true &&
    hasValidServiceDuration(service)
  );
}

function getServicePrice(service) {
  if (
    service?.price === null ||
    service?.price === undefined ||
    service?.price === ""
  ) {
    return null;
  }

  const price = Number(service.price);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

function getSlotTime(slot) {
  const value = slot?.startTime;

  if (typeof value !== "string") {
    return "";
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "";
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

export default function Book() {
  const [step, setStep] = useState(0);

  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState("");

  const [sessionUser, setSessionUser] = useState(null);
  const [bookingType, setBookingType] = useState("guest");

  const [form, setForm] = useState({
    serviceId: "",
    therapistId: "",
    date: "",
    slot: null,
    name: "",
    email: "",
    phone: "",
    notes: "",
    consentGiven: false,
  });

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const selectedService = useMemo(
    () => services.find((item) => item._id === form.serviceId),
    [services, form.serviceId]
  );

  const selectedTherapist = useMemo(
    () => therapists.find((item) => item._id === form.therapistId),
    [therapists, form.therapistId]
  );

  const selectedTherapistLabel =
    form.therapistId === ANY_THERAPIST
      ? "Any available therapist"
      : selectedTherapist?.name || "—";

  const bookableServices = useMemo(
    () => services.filter(isServiceBookable),
    [services]
  );

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setLoadingLists(true);
      setListError("");

      try {
        const [serviceResponse, therapistResponse, sessionResponse] =
          await Promise.all([
            fetch("/api/services", { cache: "no-store" }).catch(() => null),
            fetch("/api/therapists", { cache: "no-store" }).catch(() => null),
            fetch("/api/session", { cache: "no-store" }).catch(() => null),
          ]);

        let serviceData = [];
        let therapistData = [];
        let user = null;

        if (serviceResponse?.ok) {
          const json = await serviceResponse.json().catch(() => []);
          serviceData = extractServices(json);
        }

        if (therapistResponse?.ok) {
          const json = await therapistResponse.json().catch(() => ({}));
          therapistData = extractTherapists(json);
        }

        if (sessionResponse?.ok) {
          const json = await sessionResponse.json().catch(() => ({}));
          user = json?.user || null;
        }

        if (!active) return;

        const activeServices = serviceData.filter(
          (item) =>
            item?._id &&
            item.isActive !== false &&
            item.inactive !== true
        );

        const activeTherapists = therapistData.filter(
          (item) =>
            item?._id &&
            item.inactive !== true &&
            item.isActive !== false
        );

        setServices(activeServices);
        setTherapists(activeTherapists);
        setSessionUser(user);

        if (user) {
          setBookingType("account");

          setForm((current) => ({
            ...current,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
          }));
        }

        const issues = [];

        if (!serviceResponse?.ok) {
          issues.push("services");
        }

        if (!therapistResponse?.ok) {
          issues.push("therapist profiles");
        }

        if (issues.length > 0) {
          setListError(
            `Unable to load ${issues.join(
              " and "
            )}. Please refresh the page or contact the clinic.`
          );
        } else if (!activeServices.length) {
          setListError("No active services are currently available.");
        } else if (!activeTherapists.length) {
          setListError(
            "No active therapist profiles are currently available."
          );
        }
      } catch (error) {
        if (active) {
          console.error("Booking data loading error:", error);
          setListError(
            "We couldn't load the booking information. Please refresh the page or try again later."
          );
        }
      } finally {
        if (active) {
          setLoadingLists(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function selectService(serviceId) {
    const service = services.find((item) => item._id === serviceId);

    if (!service || !isServiceBookable(service)) {
      setSubmitError(
        "A confirmed session duration is required before this service can be booked online. Please contact the clinic."
      );
      return;
    }

    setForm((current) => ({
      ...current,
      serviceId,
      therapistId: "",
      date: "",
      slot: null,
    }));

    setSlots([]);
    setSlotError("");
    setSubmitError("");
    setStep(1);
  }

  function selectTherapist(therapistId) {
    const isAnyAvailable = therapistId === ANY_THERAPIST;

    const therapistExists = therapists.some(
      (therapist) => therapist._id === therapistId
    );

    if (!isAnyAvailable && !therapistExists) {
      setSlotError("Please select a valid therapist.");
      return;
    }

    if (isAnyAvailable && therapists.length === 0) {
      setSlotError("No active therapist profiles are available.");
      return;
    }

    setForm((current) => ({
      ...current,
      therapistId,
      date: "",
      slot: null,
    }));

    setSlots([]);
    setSlotError("");
    setSubmitError("");
    setStep(2);
  }

  async function findAvailableSlots() {
    if (!form.serviceId || !form.therapistId || !form.date) {
      setSlotError("Please select a service, therapist and date.");
      return;
    }

    if (!isServiceBookable(selectedService)) {
      setSlotError(
        "A confirmed session duration is required before checking appointment slots."
      );
      return;
    }

    const candidates =
      form.therapistId === ANY_THERAPIST
        ? therapists
        : therapists.filter(
            (therapist) => therapist._id === form.therapistId
          );

    if (candidates.length === 0) {
      setSlotError("No eligible therapist profiles are available.");
      return;
    }

    setSlotsLoading(true);
    setSlotError("");
    setSlots([]);

    updateForm("slot", null);

    try {
      const results = await Promise.allSettled(
        candidates.map(async (therapist) => {
          const query = new URLSearchParams({
            serviceId: form.serviceId,
            therapistId: therapist._id,
            date: form.date,
          });

          const response = await fetch(
            `/api/appointments/slots?${query.toString()}`,
            { cache: "no-store" }
          );

          const json = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              json.message ||
                `Could not check ${therapist.name}'s availability.`
            );
          }

          const availableSlots = extractSlots(json);

          if (!Array.isArray(availableSlots)) {
            throw new Error(
              "The server returned an unexpected slot response."
            );
          }

          return availableSlots
            .filter((slot) => getSlotTime(slot))
            .map((slot) => ({
              ...slot,
              therapistId: therapist._id,
              therapistName: therapist.name,
            }));
        })
      );

      const successfulResults = results.filter(
        (result) => result.status === "fulfilled"
      );

      const failedCount = results.length - successfulResults.length;

      if (successfulResults.length === 0) {
        throw new Error(
          "We couldn't check therapist availability. Please try again."
        );
      }

      const availableSlots = successfulResults
        .flatMap((result) => result.value)
        .sort((a, b) => {
          const timeDifference = getSlotTime(a).localeCompare(
            getSlotTime(b)
          );

          if (timeDifference !== 0) {
            return timeDifference;
          }

          return String(a.therapistName || "").localeCompare(
            String(b.therapistName || "")
          );
        });

      setSlots(availableSlots);

      if (availableSlots.length === 0) {
        setSlotError(
          failedCount > 0
            ? "We couldn't verify availability for every therapist. Please try again or choose a specific therapist."
            : "No available slots were returned for this date. Try another date."
        );
      } else if (failedCount > 0) {
        setSlotError(
          "Availability could not be checked for one or more therapists. The displayed slots are from therapists whose schedules were checked successfully."
        );
      }
    } catch (error) {
      setSlotError(
        getErrorMessage(
          error,
          "Could not retrieve available appointments."
        )
      );
    } finally {
      setSlotsLoading(false);
    }
  }

  function selectSlot(slot) {
    const therapistId =
      slot?.therapistId ||
      (form.therapistId !== ANY_THERAPIST
        ? form.therapistId
        : "");

    const therapistExists = therapists.some(
      (therapist) => therapist._id === therapistId
    );

    const matchesSelectedTherapist =
      form.therapistId === ANY_THERAPIST ||
      therapistId === form.therapistId;

    if (
      !getSlotTime(slot) ||
      !therapistId ||
      !therapistExists ||
      !matchesSelectedTherapist
    ) {
      setSlotError(
        "We couldn't verify the therapist or time for this appointment. Please select another slot."
      );
      return;
    }

    setForm((current) => ({
      ...current,
      therapistId,
      slot: {
        ...slot,
        therapistId,
      },
    }));

    setSubmitError("");
    setSlotError("");
    setStep(4);
  }

  function createAppointmentDate() {
    const startTime = getSlotTime(form.slot);

    if (!form.date || !startTime) {
      return null;
    }

    // Interpret the selected clinic time using Pakistan's UTC+05:00 offset.
    const dateTime = new Date(`${form.date}T${startTime}:00+05:00`);

    if (Number.isNaN(dateTime.getTime())) {
      return null;
    }

    return dateTime.toISOString();
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitError("");

    if (!isServiceBookable(selectedService)) {
      setSubmitError(
        "A confirmed session duration is required before this service can be booked online."
      );
      return;
    }

    if (
      !form.slot ||
      !form.therapistId ||
      form.therapistId === ANY_THERAPIST ||
      form.slot.therapistId !== form.therapistId ||
      !therapists.some(
        (therapist) => therapist._id === form.therapistId
      )
    ) {
      setSubmitError(
        "Please select a valid appointment slot and therapist."
      );
      return;
    }

    if (!form.consentGiven) {
      setSubmitError(
        "Consent is required before submitting your booking."
      );
      return;
    }

    if (bookingType === "account" && !sessionUser) {
      setSubmitError(
        "Your account session could not be verified. Please sign in again or continue as a guest."
      );
      return;
    }

    if (bookingType === "guest") {
      const normalizedPhone = form.phone.replace(/\s+/g, "");

      const validDetails =
        form.name.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
        /^03\d{9}$/.test(normalizedPhone);

      if (!validDetails) {
        setSubmitError(
          "Please enter a valid name, email address and Pakistani mobile number."
        );
        return;
      }
    }

    const appointmentDate = createAppointmentDate();

    if (!appointmentDate) {
      setSubmitError(
        "The selected appointment date or time is invalid."
      );
      return;
    }

    const payload = {
      bookingType,
      therapistId: form.therapistId,
      serviceId: form.serviceId,
      appointmentDate,
      consentGiven: true,
      notes: form.notes.trim(),
    };

    if (bookingType === "guest") {
      payload.guestName = form.name.trim();
      payload.guestEmail = form.email.trim();
      payload.guestPhone = form.phone.replace(/\s+/g, "");
    }

    setSubmitting(true);

    try {
const bookingEndpoint = "/api/appointments/book";

      const response = await fetch(bookingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationMessage = Array.isArray(json.errors)
          ? json.errors
              .map((error) => error.message)
              .filter(Boolean)
              .join(" ")
          : "";

        throw new Error(
          json.message ||
            validationMessage ||
            "Your appointment request could not be submitted."
        );
      }

      setConfirmation(json);
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          "Your appointment request could not be submitted."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    setSubmitError("");
    setStep((current) => Math.max(0, current - 1));
  }

  const validGuestDetails =
    form.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    /^03\d{9}$/.test(form.phone.replace(/\s+/g, ""));

  return (
    <div>
      <PageHero
        title="Book an Appointment"
        subtitle="Choose a service, therapist and available appointment time."
      />

      <section className="mx-auto max-w-3xl px-4 py-10">
        {!confirmation && (
          <div className="mb-8 flex flex-wrap gap-2">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-sm ${
                  index === step
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-light)] text-[var(--color-text)]"
                }`}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        )}

        {confirmation ? (
          <div
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
            role="status"
          >
            <h2 className="text-2xl font-bold text-[var(--color-dark)]">
              Appointment request received
            </h2>

            <p className="mt-3">
              Your appointment request has been submitted successfully.
            </p>

            <p className="mt-2 text-sm text-gray-700">
              Your appointment is not confirmed until the clinic confirms it.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block font-semibold text-[var(--color-primary)] underline"
            >
              Return to homepage
            </Link>
          </div>
        ) : loadingLists ? (
          <p role="status">Loading services and therapists…</p>
        ) : (
          <>
            {listError && (
              <p
                role="alert"
                className="mb-5 rounded-lg bg-amber-50 p-3 text-amber-900"
              >
                {listError}
              </p>
            )}

            {step === 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">
                  Choose a service
                </h2>

                {services.length === 0 ? (
                  <p>
                    No active services are currently available for booking.
                  </p>
                ) : (
                  <>
                    {bookableServices.length === 0 && (
                      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                        Online booking is unavailable because confirmed
                        session durations have not been provided for these
                        services. Please contact the clinic for appointment
                        information.
                      </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((service) => {
                        const bookable = isServiceBookable(service);
                        const price = getServicePrice(service);

                        return (
                          <button
                            key={service._id}
                            type="button"
                            disabled={!bookable}
                            onClick={() => selectService(service._id)}
                            className={`rounded-xl border bg-white p-4 text-left transition ${
                              bookable
                                ? "hover:border-[var(--color-primary)] hover:shadow-sm"
                                : "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70"
                            }`}
                          >
                            <span className="block font-semibold">
                              {service.name}
                            </span>

                            {service.description && (
                              <span className="mt-1 block text-sm text-gray-600">
                                {service.description}
                              </span>
                            )}

                            <span className="mt-2 block text-sm text-gray-600">
                              Fee:{" "}
                              {price === null
                                ? "Please contact the clinic"
                                : `${price.toLocaleString("en-PK")} (currency not specified)`}
                            </span>

                            {bookable ? (
                              <span className="mt-1 block text-sm text-gray-600">
                                Duration: {Number(service.duration)} minutes
                              </span>
                            ) : (
                              <span className="mt-2 block text-sm text-amber-800">
                                Session duration has not been confirmed.
                                Please contact the clinic to arrange an
                                appointment.
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-2 text-2xl font-bold">
                  Choose a therapist
                </h2>

                <p className="mb-4 text-sm text-gray-600">
                  Choose a specific therapist or let us check availability
                  across all active therapists.
                </p>

                {therapists.length === 0 ? (
                  <p>
                    No active therapist profiles are currently available.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      key={ANY_THERAPIST}
                      type="button"
                      onClick={() => selectTherapist(ANY_THERAPIST)}
                      className="rounded-xl border border-[var(--color-primary)] bg-white p-4 text-left transition hover:shadow-sm"
                    >
                      <span className="block font-semibold">
                        Any available therapist
                      </span>

                      <span className="mt-1 block text-sm text-gray-600">
                        Check appointment times across all active therapists.
                      </span>
                    </button>

                    {therapists.map((therapist) => (
                      <button
                        key={therapist._id}
                        type="button"
                        onClick={() => selectTherapist(therapist._id)}
                        className="rounded-xl border bg-white p-4 text-left transition hover:border-[var(--color-primary)] hover:shadow-sm"
                      >
                        <span className="block font-semibold">
                          {therapist.name}
                        </span>

                        {therapist.qualification?.length > 0 && (
                          <span className="mt-1 block text-sm text-gray-600">
                            {therapist.qualification.join(", ")}
                          </span>
                        )}

                        {therapist.specialties?.length > 0 && (
                          <span className="mt-1 block text-sm text-gray-600">
                            {therapist.specialties.join(" · ")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">
                  Choose an appointment date
                </h2>

                <p className="mb-4 text-sm text-gray-600">
                  Selected therapist: {selectedTherapistLabel}
                </p>

                <label
                  htmlFor="appointment-date"
                  className="mb-2 block font-medium"
                >
                  Date
                </label>

                <input
                  id="appointment-date"
                  type="date"
                  min={getLocalDate()}
                  value={form.date}
                  onChange={(event) => {
                    updateForm("date", event.target.value);
                    updateForm("slot", null);
                    setSlots([]);
                    setSlotError("");
                    setSubmitError("");
                  }}
                  className="w-full max-w-xs rounded-lg border p-3"
                  required
                />

                <button
                  type="button"
                  disabled={!form.date || slotsLoading}
                  onClick={() => {
                    setStep(3);
                    findAvailableSlots();
                  }}
                  className="mt-5 block rounded-lg bg-[var(--color-primary)] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Find available times
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-2 text-2xl font-bold">
                  Available time slots
                </h2>

                <p className="mb-4 text-sm text-gray-600">
                  {form.date} &middot; {selectedTherapistLabel} &middot;{" "}
                  {selectedService?.name}
                </p>

                {slotsLoading ? (
                  <p role="status">Checking availability…</p>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={`${slot.therapistId}-${slot.startTime}-${slot.endTime || ""}`}
                        type="button"
                        onClick={() => selectSlot(slot)}
                        className="rounded-lg border p-3 font-medium transition hover:border-[var(--color-primary)] hover:bg-[var(--color-light)]"
                      >
                        <span className="block">
                          {slot.startTime}
                          {slot.endTime ? ` – ${slot.endTime}` : ""}
                        </span>

                        {form.therapistId === ANY_THERAPIST && (
                          <span className="mt-1 block text-xs font-normal text-gray-600">
                            {slot.therapistName}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>
                    {slotError || "No available slots were returned."}
                  </p>
                )}

                {slotError && slots.length > 0 && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-amber-800"
                  >
                    {slotError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={goBack}
                  className="mt-6 underline"
                >
                  Choose another date
                </button>
              </div>
            )}

            {step === 4 && (
              <form onSubmit={submitBooking} className="space-y-5">
                <div className="rounded-xl bg-[var(--color-light)] p-4">
                  <h2 className="text-xl font-bold">
                    Review your appointment
                  </h2>

                  <p className="mt-2">
                    Service: {selectedService?.name || "—"}
                  </p>

                  <p>Therapist: {selectedTherapistLabel}</p>

                  <p>
                    Date and time: {form.date} at{" "}
                    {form.slot?.startTime || "—"}
                  </p>

                  <p>
                    Fee:{" "}
                    {getServicePrice(selectedService) === null
                      ? "Please confirm with the clinic"
                      : `${getServicePrice(selectedService).toLocaleString("en-PK")} (currency not specified)`}
                  </p>
                </div>

                {sessionUser && (
                  <fieldset className="space-y-3">
                    <legend className="font-semibold">
                      Booking method
                    </legend>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        value="account"
                        checked={bookingType === "account"}
                        onChange={() => setBookingType("account")}
                      />
                      Use my account ({sessionUser.email})
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        value="guest"
                        checked={bookingType === "guest"}
                        onChange={() => setBookingType("guest")}
                      />
                      Continue as a guest
                    </label>
                  </fieldset>
                )}

                {bookingType === "guest" ? (
                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="guest-name"
                        className="mb-1 block font-medium"
                      >
                        Full name
                      </label>

                      <input
                        id="guest-name"
                        type="text"
                        required
                        maxLength={100}
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) =>
                          updateForm("name", event.target.value)
                        }
                        className="w-full rounded-lg border p-3"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guest-email"
                        className="mb-1 block font-medium"
                      >
                        Email address
                      </label>

                      <input
                        id="guest-email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) =>
                          updateForm("email", event.target.value)
                        }
                        className="w-full rounded-lg border p-3"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guest-phone"
                        className="mb-1 block font-medium"
                      >
                        Pakistani mobile number
                      </label>

                      <input
                        id="guest-phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="03[0-9]{9}"
                        maxLength={11}
                        placeholder="03XXXXXXXXX"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateForm(
                            "phone",
                            event.target.value.replace(/\s+/g, "")
                          )
                        }
                        className="w-full rounded-lg border p-3"
                      />

                      <p className="mt-1 text-xs text-gray-600">
                        Enter 11 digits, starting with 03.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">
                      Booking with your signed-in account
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {sessionUser?.name || "Account"} ·{" "}
                      {sessionUser?.email}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Your account must have a patient profile to submit an
                      authenticated booking.
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="booking-notes"
                    className="mb-1 block font-medium"
                  >
                    Notes (optional)
                  </label>

                  <textarea
                    id="booking-notes"
                    rows={3}
                    maxLength={500}
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    className="w-full rounded-lg border p-3"
                    placeholder="Anything the clinic should know for this booking?"
                  />
                </div>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={form.consentGiven}
                    onChange={(event) =>
                      updateForm("consentGiven", event.target.checked)
                    }
                    className="mt-1"
                    required
                  />

                  <span className="text-sm">
                    I agree to the{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>{" "}
                    and consent to my details being used to process this
                    booking.
                  </span>
                </label>

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
                  >
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !form.consentGiven ||
                    !form.slot ||
                    (bookingType === "guest" && !validGuestDetails)
                  }
                  className="rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting…"
                    : "Submit appointment request"}
                </button>
              </form>
            )}

            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="mt-6 underline"
              >
                Back
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
