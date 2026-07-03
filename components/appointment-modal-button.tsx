"use client";

import { CalendarCheck, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/components/use-lock-body-scroll";

export function AppointmentModalButton({
  children,
  className = "hidden min-h-10 items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 lg:inline-flex",
  label = "Book Appointment",
  showIcon = true
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  showIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockBodyScroll(open);

  const modal = open ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-hidden bg-ink/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close appointment modal" onClick={() => setOpen(false)} />
      <div className="modal-panel z-10 flex max-h-[calc(100svh-1.5rem)] max-w-2xl flex-col sm:max-h-[min(90vh,760px)]">
        <div className="shrink-0 border-b border-line bg-snow px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="mt-0.5 hidden rounded-full bg-white p-2 shadow-sm ring-1 ring-line sm:inline-flex">
              <CalendarCheck className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Book appointment</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">Choose a visit time, then complete the order at the shop after inspection.</p>
              <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-red">No online payment required</p>
            </div>
          </div>
          <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setOpen(true)}
      >
        {showIcon ? <CalendarCheck className="h-4 w-4" /> : null}
        {label}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
