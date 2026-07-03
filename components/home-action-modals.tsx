"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { CalendarCheck, Calculator, Smartphone, X } from "lucide-react";
import { useLockBodyScroll } from "@/components/use-lock-body-scroll";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "calculator" || action === "appointment") {
      setOpen(action);
    }
  }, [searchParams]);

  useLockBodyScroll(Boolean(open));

  const modal = open ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-hidden bg-ink/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={() => setOpen(null)} />
      <div className="modal-panel z-10 flex max-h-[calc(100svh-1.5rem)] max-w-3xl flex-col sm:max-h-[min(90vh,760px)]">
        <div className="shrink-0 border-b border-line bg-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                {open === "calculator" ? "Calculate payments" : "Book appointment"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                {open === "calculator" ? "Estimate deposit, weekly payment, and total cost before you choose a phone." : "Choose a visit time, then complete the order at the shop after inspection."}
              </p>
            </div>
            <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setOpen(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {open === "calculator" ? calculator : appointment}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="mt-7 grid w-full gap-3 sm:mt-9 sm:flex sm:flex-wrap sm:justify-center">
        <Link className="btn-secondary w-full sm:w-auto" href="/iphones"><Smartphone className="h-4 w-4" /> Browse iPhones</Link>
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setOpen("calculator")}><Calculator className="h-4 w-4" /> Calculate payments</button>
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setOpen("appointment")}><CalendarCheck className="h-4 w-4" /> Book appointment</button>
      </div>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
