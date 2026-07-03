import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Appointment Requested",
  description: "Your TradeWithDenis shop appointment request has been received."
};

export default async function AppointmentConfirmedPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const settings = await getSiteSettings();
  const params = await searchParams;
  const needsManualFollowUp = params?.status === "manual-follow-up";
  const whatsappUrl = `https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`;
  const title = needsManualFollowUp ? "Please contact the shop to confirm" : "Appointment request received";
  const message = needsManualFollowUp
    ? "The online booking system could not save your request just now. Please call or WhatsApp TradeWithDenis so the team can confirm your visit directly."
    : "Thank you. TradeWithDenis has received your shop visit request. The team will contact you to confirm availability before you come in.";

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-16">
        <section className="mx-auto max-w-3xl rounded-lg border border-line bg-white p-6 text-center shadow-soft md:p-10">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-50">
            <CalendarCheck className="h-7 w-7 text-emerald-700" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-neutral-600">
            {message}
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-md bg-snow p-4 text-sm font-semibold leading-6 text-neutral-700">
            No sale is completed online. You will inspect the device and complete payment or financing at the shop.
          </p>

          <div className="mt-8 grid gap-3 text-left text-sm md:grid-cols-3">
            <a className="rounded-md border border-line p-4 hover:border-gold" href={`tel:${settings.phone ?? ""}`}>
              <Phone className="mb-2 h-5 w-5 text-gold" />
              <strong className="block">Call</strong>
              {settings.phone}
            </a>
            <a className="rounded-md border border-line p-4 hover:border-gold" href={whatsappUrl}>
              <MessageCircle className="mb-2 h-5 w-5 text-gold" />
              <strong className="block">WhatsApp</strong>
              {settings.whatsapp}
            </a>
            <a className="rounded-md border border-line p-4 hover:border-gold" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer">
              <MapPin className="mb-2 h-5 w-5 text-gold" />
              <strong className="block">Shop</strong>
              {settings.address}
            </a>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className="btn-primary" href="/iphones">Browse more iPhones</Link>
            <Link className="btn-secondary" href="/contact">Contact shop</Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
