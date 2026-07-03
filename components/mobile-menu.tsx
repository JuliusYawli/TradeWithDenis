"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Calculator, ChevronRight, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/components/use-lock-body-scroll";

const links = [
  ["How It Works", "/#how-it-works"],
  ["iPhones", "/iphones"],
  ["Why Us", "/#why-us"],
  ["FAQ", "/#faq"]
] as const;

type MobileModalName = "calculator" | "appointment" | null;

export function MobileMenu({
  calculator,
  appointment
}: {
  calculator: ReactNode;
  appointment: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<MobileModalName>(null);

  useLockBodyScroll(open || Boolean(activeModal));

  function openActionModal(modal: Exclude<MobileModalName, null>) {
    setOpen(false);
    setActiveModal(modal);
  }

  const actionModal = activeModal ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-hidden bg-ink/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6 lg:hidden" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={() => setActiveModal(null)} />
      <div className="modal-panel z-10 flex max-h-[calc(100svh-1.5rem)] max-w-3xl flex-col sm:max-h-[min(90vh,760px)]">
        <div className="shrink-0 border-b border-line bg-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {activeModal === "calculator" ? "Calculate payments" : "Book appointment"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                {activeModal === "calculator" ? "Estimate deposit, weekly payment, and total cost before you choose a phone." : "Choose a visit time, then complete the order at the shop after inspection."}
              </p>
            </div>
            <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-gold hover:text-red" type="button" aria-label="Close modal" onClick={() => setActiveModal(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {activeModal === "calculator" ? calculator : appointment}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition active:scale-95 lg:hidden"
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute right-3 top-3 flex max-h-[calc(100dvh-1.5rem)] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-line bg-snow px-4 py-3">
              <Link href="/" className="min-w-0" aria-label="TradeWithDennis home" onClick={() => setOpen(false)}>
                <Image src="/logo.svg" alt="TradeWithDennis" width={150} height={54} className="h-10 w-auto object-contain" />
              </Link>
              <button
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-line transition active:scale-95"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                {links.map(([label, href]) => (
                  <Link
                    key={label}
                    className="flex min-h-14 items-center justify-between gap-3 px-4 text-base font-semibold text-ink transition hover:bg-snow active:bg-snow"
                    href={href}
                    onClick={() => setOpen(false)}
                  >
                    <span>{label}</span>
                    <ChevronRight className="h-4 w-4 text-gold" />
                  </Link>
                ))}
                <button
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-base font-semibold text-ink transition hover:bg-snow active:bg-snow"
                  type="button"
                  onClick={() => openActionModal("calculator")}
                >
                  <span>Calculator</span>
                  <Calculator className="h-4 w-4 text-gold" />
                </button>
              </div>

              <button
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-center text-base font-medium text-white shadow-soft transition hover:bg-red active:scale-[0.99]"
                type="button"
                onClick={() => openActionModal("appointment")}
              >
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </button>

              <div className="mt-4 rounded-xl bg-snow p-4 text-sm leading-6 text-neutral-700">
                <p className="font-medium text-ink">TradeWithDennis</p>
                <p>Circle Mall, Block C, Shop 27</p>
                <p>8:00 AM - 7:00 PM</p>
              </div>
            </nav>
          </aside>
        </div>
      ) : null}

      {actionModal ? createPortal(actionModal, document.body) : null}
    </>
  );
}
