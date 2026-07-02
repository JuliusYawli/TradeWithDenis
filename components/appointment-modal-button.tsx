"use client";

import { CalendarCheck, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export function AppointmentModalButton({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 lg:inline-flex"
        type="button"
        onClick={() => setOpen(true)}
      >
        <CalendarCheck className="h-4 w-4" />
        Book Appointment
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 px-3 py-4 sm:px-4 sm:py-6" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close appointment modal" onClick={() => setOpen(false)} />
          <div className="relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-lg border border-line bg-white p-4 shadow-soft sm:max-h-[90vh] sm:p-5 md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">Book appointment</h2>
                <p className="mt-1 text-sm text-neutral-600">Choose a visit time, then complete the order at the shop after inspection.</p>
              </div>
              <button className="rounded-md border border-line p-2 text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
