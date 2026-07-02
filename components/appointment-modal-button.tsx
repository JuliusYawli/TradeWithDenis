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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close appointment modal" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl sm:max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 border-b border-line bg-snow px-4 py-4 sm:px-5">
              <div className="flex min-w-0 gap-3">
                <div className="mt-0.5 hidden rounded-full bg-white p-2 shadow-sm ring-1 ring-line sm:inline-flex">
                  <CalendarCheck className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Book appointment</h2>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Choose a visit time, then complete the order at the shop after inspection.</p>
                </div>
              </div>
              <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
