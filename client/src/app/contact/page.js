"use client";

import { useState } from "react";
import Link from "next/link";
import BrandMark from "../../components/BrandMark";
import PageHero from "../../components/PageHero";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

const contactItems = [
  {
    label: "Visit the clinic",
    value: "Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad",
    href: "https://share.google/i4m42aMPoyZVJKvn3",
    linkLabel: "Get directions",
  },
  {
    label: "Call the clinic",
    value: "0326 6312211",
    href: "tel:03266312211",
    linkLabel: "Call now",
  },
  {
    label: "Clinic timings",
    value: "Men: 9 AM – 1 PM",
    secondValue: "Women and children: 1 PM – 10 PM",
  },
  {
    label: "Instagram",
    value: "@nexmove_",
    href: "https://www.instagram.com/nexmove_/",
    linkLabel: "Visit Instagram",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    text: "",
  });

  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (busy) return;

    setStatus("");
    setBusy(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      text: form.text.trim(),
    };

    try {
      const response = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const firstError =
          data.errors && typeof data.errors === "object"
            ? Object.values(data.errors)[0]
            : null;

        setStatus(
          typeof firstError === "string"
            ? firstError
            : data.message || "Could not send your message. Please try again."
        );

        return;
      }

      setStatus("Thank you. Your message has been sent.");
      setForm({
        name: "",
        phone: "",
        email: "",
        text: "",
      });
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setStatus("Could not reach the clinic server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <PageHero
        title="Contact Us"
        subtitle="Book by phone or Instagram DM, or send the clinic a message."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
        <div>
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#16848e]">
              Get in touch
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2350] sm:text-3xl">
              We&apos;re here to help.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-[#62717a]">
              Reach out to Nexmove for clinic information, service
              enquiries or appointment assistance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {contactItems.map((item) => (
              <article
                key={item.label}
                className="min-w-0 border border-[#dfe9e5] bg-white p-3 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#829098] sm:text-xs">
                    {item.label}
                  </span>

                  <BrandMark className="h-8 w-8 rounded-lg sm:h-9 sm:w-9" />
                </div>

                <p className="break-words text-sm font-semibold leading-6 text-[#0a2350] sm:text-base">
                  {item.value}
                </p>

                {item.secondValue && (
                  <p className="mt-2 text-xs leading-5 text-[#62717a] sm:text-sm">
                    {item.secondValue}
                  </p>
                )}

                {item.href && (
                  <a
                    href={item.href}
                    target={item.href.startsWith("https://") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("https://")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-3 inline-flex text-xs font-semibold text-[#16848e] hover:text-[#0a2350] sm:text-sm"
                  >
                    {item.linkLabel} <span className="ml-1">→</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="border border-[#dfe9e5] bg-white p-5 sm:p-7 lg:p-8">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#16848e]">
            Send an enquiry
          </span>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2350]">
            Write to Nexmove.
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#62717a]">
            Complete the form below and the clinic can get back to you.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-1.5 block text-sm font-medium text-[#263b48]"
              >
                Name
              </label>

              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                className="w-full rounded-md border border-[#d6e1dd] bg-[#fcfdfc] px-3 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#16848e] focus:ring-2 focus:ring-[#16848e]/10"
                placeholder="Your name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="contact-phone"
                className="mb-1.5 block text-sm font-medium text-[#263b48]"
              >
                Phone
              </label>

              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="w-full rounded-md border border-[#d6e1dd] bg-[#fcfdfc] px-3 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#16848e] focus:ring-2 focus:ring-[#16848e]/10"
                placeholder="03266312211"
                maxLength={20}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-1.5 block text-sm font-medium text-[#263b48]"
              >
                Email
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-[#d6e1dd] bg-[#fcfdfc] px-3 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#16848e] focus:ring-2 focus:ring-[#16848e]/10"
                placeholder="you@example.com"
                required
                maxLength={254}
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-sm font-medium text-[#263b48]"
              >
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows={5}
                minLength={10}
                maxLength={2000}
                className="w-full resize-y rounded-md border border-[#d6e1dd] bg-[#fcfdfc] px-3 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#16848e] focus:ring-2 focus:ring-[#16848e]/10"
                placeholder="How can we help?"
                required
                value={form.text}
                onChange={(event) => updateField("text", event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#16848e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2350] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Sending..." : "Send message"}
              {!busy && <span aria-hidden="true">→</span>}
            </button>

            {status && (
              <p
                role="status"
                aria-live="polite"
                className="text-sm leading-6 text-[#52616a]"
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}