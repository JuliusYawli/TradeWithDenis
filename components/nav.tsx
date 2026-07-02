import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Nav({ settings }: { settings: SiteSettings }) {
  const whatsappUrl = `https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`;

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
      <nav className="container-page flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex shrink-0 items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-line" aria-label="TradeWithDenis home">
          <Image src="/logo.svg" alt="TradeWithDenis" width={230} height={55} className="h-12 w-auto object-contain" priority />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-line bg-snow p-1 text-sm font-bold text-neutral-700 lg:flex">
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/iphones">Catalog</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/warranty">Warranty</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/#faq">FAQ</Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white hover:text-red" href="/contact">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          <a href={whatsappUrl} className="btn-secondary hidden px-4 py-2 sm:inline-flex">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={`tel:${settings.phone ?? ""}`} className="btn-primary px-4 py-2">
            <Phone className="h-4 w-4" />
            Call
          </a>
        </div>
      </nav>
    </header>
  );
}
