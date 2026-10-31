import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageHero from "../../components/PageHero";
import LogoutButton from "./LogoutButton";
import { API } from "../../lib/serverApi";

export const metadata = {
  title: "My Portal | Nexmove Physiotherapy Clinic",
};

function formatPakistanDateTime(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(status) {
  if (typeof status !== "string" || !status.trim()) {
    return "Unknown";
  }

  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getAppointments(token) {
  try {
    const baseUrl = API.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return {
        expired: true,
        list: [],
      };
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        list: [],
        failed: true,
        message: json.message || "Could not load your appointments.",
      };
    }

    return {
      list: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error) {
    console.error("Patient portal appointment request failed:", error);

    return {
      list: [],
      failed: true,
      message:
        "The clinic server could not be reached. Please try again later.",
    };
  }
}

export default async function Portal() {
  const store = await cookies();
  const token = store.get("nx_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user = {};

  try {
    user = JSON.parse(store.get("nx_user")?.value || "{}");
  } catch {
    user = {};
  }

  const { list, expired, failed, message } =
    await getAppointments(token);

  if (expired) {
    redirect("/login");
  }

  return (
    <div>
      <PageHero
        title="My Portal"
        subtitle={user.name ? `Welcome, ${user.name}` : "Welcome"}
      />

      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-[var(--color-dark)]">
            My appointments
          </h2>

          <LogoutButton />
        </div>

        {failed && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            {message}
          </p>
        )}

        {!failed && list.length === 0 && (
          <div className="rounded-xl border p-6">
            <p className="font-medium">No appointments found.</p>

            <p className="mt-2 text-sm text-gray-600">
              Your booked appointments will appear here.
            </p>
          </div>
        )}

        {!failed && list.length > 0 && (
          <ul className="space-y-4">
            {list.map((appointment) => (
              <li
                key={appointment._id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Appointment date and time
                    </p>

                    <p className="mt-1 font-semibold text-[var(--color-dark)]">
                      {formatPakistanDateTime(
                        appointment.appointmentDate
                      )}
                    </p>

                    {appointment.appointmentEnd && (
                      <p className="mt-1 text-sm text-gray-600">
                        Ends:{" "}
                        {formatPakistanDateTime(
                          appointment.appointmentEnd
                        )}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {formatStatus(appointment.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}