"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const consentStorageKey = "twd-cookie-consent";

export function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  useEffect(() => setChoice(localStorage.getItem(consentStorageKey)), []);

  function choose(value: "accepted" | "rejected") {
    localStorage.setItem(consentStorageKey, value);
    window.dispatchEvent(new CustomEvent("twd-consent-change", { detail: value }));
    setChoice(value);
  }

  if (choice) return null;
  return (
    <aside className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-4xl rounded-[1.25rem] border border-white/10 bg-ink p-4 text-white shadow-2xl sm:p-5" role="dialog" aria-label="Cookie preferences" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-white">A simple privacy choice</h2>
          <p className="mt-1 text-sm leading-5 text-white/65">Allow anonymous analytics to help improve the shop experience. No advertising cookies.</p>
          <Link className="mt-1 inline-block text-xs font-semibold text-[#e6c675] underline-offset-4 hover:underline" href="/privacy#cookies">Read our privacy policy</Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10" type="button" onClick={() => choose("rejected")}>Essential only</button>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-ink hover:bg-[#d9a94f]" type="button" onClick={() => choose("accepted")}>Allow analytics</button>
        </div>
      </div>
    </aside>
  );
}
