import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Menu, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Nav({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="hidden border-b border-line bg-ink py-2 text-xs font-semibold text-white/75 md:block">
        <div className="container-page flex items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-blue-300" />
            {settings.address}
          </p>
          <div className="flex items-center gap-5">
            <p className="inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-blue-300" />
              {settings.opening_hours}
            </p>
            <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${settings.phone ?? ""}`}>
              <Phone className="h-3.5 w-3.5 text-blue-300" />
              {settings.phone}
            </a>
          </div>
        </div>
      </div>
      <nav className="container-page flex min-h-16 items-center justify-between gap-3 py-2 md:min-h-20 md:py-3">
        <Link href="/" className="flex min-w-0 shrink-0 items-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-line md:p-2" aria-label="TradeWithDenis home">
          <Image src="/logo.svg" alt="TradeWithDenis" width={230} height={82} className="h-11 w-auto max-w-[156px] object-contain sm:h-14 sm:max-w-[196px] md:h-16 md:max-w-none" priority />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-line bg-snow p-1 text-sm font-bold text-neutral-700 lg:flex">
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/iphones">Catalog</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/warranty">Warranty</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/#faq">FAQ</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/contact">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="inline-flex cursor-pointer list-none items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm marker:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-lg border border-line bg-white p-2 text-sm font-bold text-neutral-700 shadow-soft">
              <Link className="block rounded-md px-3 py-2 hover:bg-snow hover:text-red" href="/iphones">Catalog</Link>
              <Link className="block rounded-md px-3 py-2 hover:bg-snow hover:text-red" href="/warranty">Warranty</Link>
              <Link className="block rounded-md px-3 py-2 hover:bg-snow hover:text-red" href="/#faq">FAQ</Link>
              <Link className="block rounded-md px-3 py-2 hover:bg-snow hover:text-red" href="/contact">Contact</Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
