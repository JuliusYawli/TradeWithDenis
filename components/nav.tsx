import Image from "next/image";
import Link from "next/link";
import { AppointmentModalButton } from "@/components/appointment-modal-button";
import { LeadForm } from "@/components/lead-form";
import { MobileMenu } from "@/components/mobile-menu";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
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

export function Nav(_props: { settings: SiteSettings }) {
  void _props;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <nav className="container-page flex min-h-12 items-center justify-between gap-3 py-1.5 md:min-h-14">
        <Link href="/" className="flex min-w-0 shrink-0 items-center" aria-label="TradeWithDennis home">
          <Image src="/logo.svg" alt="TradeWithDennis" width={190} height={68} className="h-8 w-auto max-w-[128px] object-contain sm:h-9 sm:max-w-[148px] md:h-10 md:max-w-[168px]" priority />
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-7 text-xs font-medium text-neutral-700 lg:flex">
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
