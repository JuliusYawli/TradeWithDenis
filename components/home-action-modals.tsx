"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CalendarCheck, Calculator, Smartphone, X } from "lucide-react";

type ModalName = "calculator" | "appointment" | null;

export function HomeActionModals({
  calculator,
  appointment
}: {
  calculator: ReactNode;
  appointment: ReactNode;
}) {
  const [open, setOpen] = useState<ModalName>(null);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-primary" href="/iphones"><Smartphone className="h-4 w-4" /> Browse iPhones</Link>
        <button className="btn-secondary" type="button" onClick={() => setOpen("calculator")}><Calculator className="h-4 w-4" /> Calculate payments</button>
        <button className="btn-secondary" type="button" onClick={() => setOpen("appointment")}><CalendarCheck className="h-4 w-4" /> Book appointment</button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 px-4 py-6" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={() => setOpen(null)} />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-soft md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {open === "calculator" ? "Calculate payments" : "Book appointment"}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {open === "calculator" ? "Estimate deposit, weekly payment, and total cost before you choose a phone." : "Choose a visit time, then complete the order at the shop after inspection."}
                </p>
              </div>
              <button className="rounded-md border border-line p-2 text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {open === "calculator" ? calculator : appointment}
          </div>
        </div>
      ) : null}
    </>
  );
}
