"use client";
import { useState } from "react";
import Link from "next/link";
import BodyMap from "./BodyMap";
import { DURATIONS, AGGRAVATING, RED_FLAGS, suggestions } from "../lib/painData";

export default function PainAssessment() {
  const [view, setView] = useState("front");
  const [areas, setAreas] = useState({});
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [aggravating, setAggravating] = useState([]);
  const [injury, setInjury] = useState("");
  const [surgery, setSurgery] = useState("");
  const [flags, setFlags] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const toggle = (key, label) =>
    setAreas((a) => {
      const n = { ...a };
      if (n[key]) delete n[key];
      else n[key] = label;
      return n;
    });
  const pick = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function submit(e) {
    e.preventDefault();
    const err = {};
    if (Object.keys(areas).length === 0) err.areas = "Please select at least one area on the body map.";
    if (level === "") err.level = "Please choose your pain level from 0 to 10.";
    if (!duration) err.duration = "Please choose how long you have had the pain.";
    if (!injury) err.injury = "Please answer the injury question.";
    if (!surgery) err.surgery = "Please answer the surgery question.";
    setErrors(err);
    if (Object.keys(err).length) return;

    const payload = {
      areas: Object.values(areas),
      painLevel: Number(level),
      duration,
      aggravatingFactors: aggravating,
      recentInjury: injury === "yes",
      recentSurgery: surgery === "yes",
      redFlags: flags,
    };
    setBusy(true);
    let saved = false;
    try {
      const res = await fetch("/api/pain-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      saved = res.ok;
    } catch {}
    setBusy(false);
    setResult({
      saved,
      urgent: flags.length > 0 || Number(level) >= 9,
      conditions: suggestions(Object.keys(areas)),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {result.urgent && (
          <div role="alert" className="border-2 border-red-700 bg-red-50 text-red-900 rounded-lg p-4">
            <p className="font-semibold">Your answers may describe an urgent problem.</p>
            <p>Please seek emergency care now (in Pakistan, Rescue 1122) or go to the nearest hospital. Do not wait for an appointment.</p>
          </div>
        )}
        <div className="bg-[var(--color-light)] rounded-xl p-5 space-y-3">
          <h2 className="text-2xl font-bold text-[var(--color-dark)]">Your results</h2>
          <p>Areas: {Object.values(areas).join(", ")}. Pain level: {level}/10. Duration: {duration}.</p>
          <p>Topics that may be relevant to you:</p>
          <ul className="list-disc ml-6">
            {result.conditions.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="flex flex-wrap gap-4">
            <Link href="/conditions" className="underline text-[var(--color-primary)]">Conditions we treat</Link>
            <Link href="/services" className="underline text-[var(--color-primary)]">Our services</Link>
          </p>
          <p className="text-sm">This is guidance only. It is not a diagnosis. A physiotherapist must assess you.</p>
        </div>
        {!result.saved && (
          <p className="text-sm">Your answers were not saved because the saving service is not available yet. Please tell the clinic about them when you book.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href="/book" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">Book Assessment</Link>
          <button onClick={() => setResult(null)} className="border px-6 py-3 rounded-lg">Edit answers</button>
        </div>
      </div>
    );
  }

  const Err = ({ k }) => (errors[k] ? <p role="alert" className="text-red-700 text-sm mt-1">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <p className="text-sm bg-[var(--color-light)] rounded-lg p-3">
        This tool gives guidance only. It is not a diagnosis and does not replace a physiotherapist or doctor.
        If you have chest pain, trouble breathing, sudden weakness or numbness, or have had a serious accident, seek emergency care now (Rescue 1122).
      </p>

      <fieldset>
        <legend className="text-xl font-bold text-[var(--color-dark)] mb-2">1. Where does it hurt?</legend>
        <div className="flex gap-2 justify-center mb-3">
          {["front", "back"].map((v) => (
            <button type="button" key={v} onClick={() => setView(v)} aria-pressed={view === v}
              className={`px-4 py-2 rounded-lg border ${view === v ? "bg-[var(--color-primary)] text-white" : ""}`}>
              {v === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>
        <BodyMap view={view} selected={Object.keys(areas)} onToggle={toggle} />
        <p className="mt-2">Selected: {Object.values(areas).join(", ") || "none"}</p>
        <Err k="areas" />
      </fieldset>

      <div>
        <label htmlFor="level" className="text-xl font-bold text-[var(--color-dark)] block mb-2">2. Pain level (0 = none, 10 = worst)</label>
        <input id="level" type="range" min="0" max="10" value={level === "" ? 0 : level}
          onChange={(e) => setLevel(e.target.value)} className="w-full" />
        <p>{level === "" ? "Move the slider to choose" : `${level} / 10`}</p>
        <Err k="level" />
      </div>

      <div>
        <label htmlFor="duration" className="text-xl font-bold text-[var(--color-dark)] block mb-2">3. How long have you had it?</label>
        <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="border rounded-lg p-3 w-full">
          <option value="">Choose</option>
          {DURATIONS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <Err k="duration" />
      </div>

      <fieldset>
        <legend className="text-xl font-bold text-[var(--color-dark)] mb-2">4. What makes it worse? (optional)</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {AGGRAVATING.map((a) => (
            <label key={a} className="flex gap-2 items-center">
              <input type="checkbox" checked={aggravating.includes(a)} onChange={() => pick(aggravating, setAggravating, a)} />
              {a}
            </label>
          ))}
        </div>
      </fieldset>

      {[["injury", "5. Any recent injury?", injury, setInjury], ["surgery", "6. Any recent surgery?", surgery, setSurgery]].map(([k, q, val, set]) => (
        <fieldset key={k}>
          <legend className="text-xl font-bold text-[var(--color-dark)] mb-2">{q}</legend>
          <label className="mr-6"><input type="radio" name={k} checked={val === "yes"} onChange={() => set("yes")} /> Yes</label>
          <label><input type="radio" name={k} checked={val === "no"} onChange={() => set("no")} /> No</label>
          <Err k={k} />
        </fieldset>
      ))}

      <fieldset>
        <legend className="text-xl font-bold text-[var(--color-dark)] mb-2">7. Do any of these apply right now?</legend>
        {RED_FLAGS.map((f) => (
          <label key={f} className="flex gap-2 items-center mb-1">
            <input type="checkbox" checked={flags.includes(f)} onChange={() => pick(flags, setFlags, f)} />
            {f}
          </label>
        ))}
        {flags.length > 0 && (
          <p role="alert" className="mt-2 border-2 border-red-700 bg-red-50 text-red-900 rounded-lg p-3">
            Please seek emergency care now (Rescue 1122) or go to the nearest hospital.
          </p>
        )}
      </fieldset>

      <button disabled={busy} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
        {busy ? "Please wait..." : "See my results"}
      </button>
    </form>
  );
}