import Image from "next/image";
import Link from "next/link";
import { AppointmentModalButton } from "@/components/appointment-modal-button";
import { LeadForm } from "@/components/lead-form";
import { MobileMenu } from "@/components/mobile-menu";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
import { Clock3, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const navLinks = [
  ["Home", "/"],
  ["How it works", "/#how-it-works"],
  ["Catalog", "/iphones"],
  ["Reviews", "/reviews"],
  ["Warranty", "/warranty"],
  ["FAQ", "/#faq"],
  ["Contact", "/contact"]
] as const;

export function Nav({ settings }: { settings: SiteSettings }) {

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-snow/90 backdrop-blur-xl">
      <div className="hidden border-b border-stone-200/80 bg-ink text-white/75 md:block">
        <div className="container-page flex h-8 items-center justify-between text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3 text-[#e6c675]" /> {settings.address}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3 text-[#e6c675]" /> Open {settings.opening_hours}</span>
        </div>
      </div>
      <nav className="container-page flex min-h-16 items-center justify-between gap-3 py-2">
        <Link href="/" className="flex min-w-0 shrink-0 items-center" aria-label="TradeWithDennis home">
          <Image src="/logo-transparent.svg" alt="TradeWithDennis" width={190} height={80} className="h-11 w-auto max-w-[174px] object-contain sm:h-12 sm:max-w-[196px]" priority />
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-neutral-700 lg:flex">
          {navLinks.map(([label, href]) => (
            <Link key={label} className="transition hover:text-red" href={href}>{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <AppointmentModalButton>
            <LeadForm variant="modal" />
          </AppointmentModalButton>
          <MobileMenu calculator={<PaymentCalculatorPanel />} appointment={<LeadForm variant="modal" />} />
        </div>
      </nav>
    </header>
  );
}
