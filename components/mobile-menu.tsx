"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["How It Works", "/#how-it-works"],
  ["iPhones", "/iphones"],
  ["Calculator", "/?action=calculator"],
  ["Why Us", "/#why-us"],
  ["FAQ", "/#faq"]
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

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
              <Link href="/" className="min-w-0" aria-label="TradeWithDenis home" onClick={() => setOpen(false)}>
                <Image src="/logo.svg" alt="TradeWithDenis" width={150} height={54} className="h-10 w-auto object-contain" />
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

            <nav className="flex flex-col p-3">
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
              </div>

              <Link
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-center text-base font-bold text-white shadow-soft transition hover:bg-red active:scale-[0.99]"
                href="/?action=appointment"
                onClick={() => setOpen(false)}
              >
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </Link>

              <div className="mt-4 rounded-xl bg-snow p-4 text-sm leading-6 text-neutral-700">
                <p className="font-bold text-ink">TradeWithDenis</p>
                <p>Circle Mall, Block C, Shop 27</p>
                <p>8:00 AM - 7:00 PM</p>
              </div>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
