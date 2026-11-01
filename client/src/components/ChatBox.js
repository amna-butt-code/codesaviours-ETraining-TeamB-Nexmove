
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const URGENT = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "sudden weakness",
  "numbness",
  "unconscious",
  "fainted",
  "severe bleeding",
  "accident",
  "stroke",
  "heart attack",
  "seizure",
];

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I can answer questions about Nexmove: services, timings and booking.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urgent, setUrgent] = useState(false);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(e) {
    e.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    setError("");

    if (URGENT.some((keyword) => text.toLowerCase().includes(keyword))) {
      setUrgent(true);
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || typeof json.reply !== "string" || !json.reply.trim()) {
        setError(
          json.message || "Something went wrong. Please try again."
        );
        return;
      }

      if (json.urgent) {
        setUrgent(true);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "bot", text: json.reply.trim() },
      ]);
    } catch {
      setError("Unable to reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <p className="text-sm bg-[var(--color-light)] rounded-lg p-3 mb-4">
        This assistant does not give medical advice. It cannot diagnose or
        prescribe.
      </p>

      {urgent && (
        <div
          role="alert"
          className="border-2 border-red-700 bg-red-50 text-red-900 rounded-lg p-4 mb-4"
        >
          <p className="font-semibold">
            Your message may describe an urgent problem.
          </p>
          <p>
            If you have chest pain, trouble breathing, sudden weakness or
            numbness, or have had an accident, seek emergency care now (in
            Pakistan, Rescue 1122) or go to the nearest hospital. Do not wait
            for an appointment.
          </p>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="border rounded-xl h-96 overflow-y-auto p-3 space-y-3 bg-white scroll-smooth"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={`inline-block rounded-2xl px-4 py-2 max-w-[85%] whitespace-pre-wrap break-words ${
                message.role === "user"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-light)]"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}

        {loading && (
          <p className="text-sm text-gray-600" role="status">
            Assistant is typing...
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-red-700 mt-2">
          {error}
        </p>
      )}

      <form onSubmit={send} className="flex gap-2 mt-3">
        <input
          className="border rounded-lg p-3 flex-1 min-w-0"
          placeholder="Type your question"
          maxLength={500}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Your message"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-[var(--color-primary)] text-white px-5 rounded-lg font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/book"
          className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold"
        >
          Book an appointment
        </Link>

        <p className="mt-2 text-sm">
          Or message the clinic on Instagram DM (@nexmove_) or call 0326
          6312211.
        </p>
      </div>
    </div>
  );
}
