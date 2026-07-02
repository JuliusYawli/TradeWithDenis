"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
        className="inline-flex items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm lg:hidden"
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-white lg:hidden" role="dialog" aria-modal="true">
          <div className="flex min-h-screen flex-col">
            <div className="border-b border-line bg-gradient-to-b from-blue-50 to-white px-6 py-10">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="opacity-60" aria-label="TradeWithDenis home" onClick={() => setOpen(false)}>
                  <Image src="/logo.svg" alt="TradeWithDenis" width={150} height={54} className="h-10 w-auto object-contain" />
                </Link>
                <button className="rounded-md p-2 text-ink" type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
                  <X className="h-8 w-8" />
                </button>
              </div>
            </div>

            <nav className="flex flex-1 flex-col px-8 py-10">
              <div className="space-y-9">
                {links.map(([label, href]) => (
                  <Link key={label} className="block text-4xl font-medium tracking-tight text-ink" href={href} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>

              <Link
                className="mt-auto inline-flex min-h-16 w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-center text-2xl font-bold text-white"
                href="/?action=appointment"
                onClick={() => setOpen(false)}
              >
                Book Appointment
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
