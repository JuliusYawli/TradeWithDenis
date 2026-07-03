import Image from "next/image";
import Link from "next/link";
import { AppointmentModalButton } from "@/components/appointment-modal-button";
import { LeadForm } from "@/components/lead-form";
import { MobileMenu } from "@/components/mobile-menu";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
import type { SiteSettings } from "@/lib/types";

export function Nav(_props: { settings: SiteSettings }) {
  void _props;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-xl">
      <nav className="container-page flex min-h-14 items-center justify-between gap-3 py-2 md:min-h-16">
        <Link href="/" className="flex min-w-0 shrink-0 items-center" aria-label="TradeWithDennis home">
          <Image src="/logo.svg" alt="TradeWithDennis" width={190} height={68} className="h-9 w-auto max-w-[138px] object-contain sm:h-10 sm:max-w-[158px] md:h-11 md:max-w-[178px]" priority />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-line bg-snow p-0.5 text-sm font-medium text-neutral-700 lg:flex">
          <Link className="rounded-full px-3.5 py-1.5 transition hover:bg-white hover:text-red" href="/iphones">Catalog</Link>
          <Link className="rounded-full px-3.5 py-1.5 transition hover:bg-white hover:text-red" href="/warranty">Warranty</Link>
          <Link className="rounded-full px-3.5 py-1.5 transition hover:bg-white hover:text-red" href="/#faq">FAQ</Link>
          <Link className="rounded-full px-3.5 py-1.5 transition hover:bg-white hover:text-red" href="/contact">Contact</Link>
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
