"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Calculator, Smartphone, X } from "lucide-react";

type ModalName = "calculator" | "appointment" | null;

export function HomeActionModals({
  calculator,
  appointment
}: {
  calculator: ReactNode;
  appointment: ReactNode;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<ModalName>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "calculator" || action === "appointment") {
      setOpen(action);
    }
  }, [searchParams]);

  return (
    <>
      <div className="mt-7 grid w-full gap-3 sm:mt-9 sm:flex sm:flex-wrap sm:justify-center">
        <Link className="btn-secondary w-full sm:w-auto" href="/iphones"><Smartphone className="h-4 w-4" /> Browse iPhones</Link>
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setOpen("calculator")}><Calculator className="h-4 w-4" /> Calculate payments</button>
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setOpen("appointment")}><CalendarCheck className="h-4 w-4" /> Book appointment</button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={() => setOpen(null)} />
          <div className="modal-panel max-w-3xl overflow-y-auto p-4 sm:p-5 md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                  {open === "calculator" ? "Calculate payments" : "Book appointment"}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {open === "calculator" ? "Estimate deposit, weekly payment, and total cost before you choose a phone." : "Choose a visit time, then complete the order at the shop after inspection."}
                </p>
              </div>
              <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(null)}>
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
