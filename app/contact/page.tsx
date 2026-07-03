import type { Metadata } from "next";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { Footer } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Contact", description: "Contact TradeWithDenis for iPhone sales and financing in Ghana." };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`;

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page grid gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact TradeWithDenis</h1>
          <p className="mt-3 max-w-xl text-neutral-600">
            Visit the shop, call, message on WhatsApp, or book an appointment for current iPhone stock and payment options.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <a className="flex items-start gap-3 rounded-md border border-line bg-white p-4 hover:border-gold" href={`tel:${settings.phone ?? ""}`}>
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">Phone number</strong>{settings.phone}</span>
            </a>
            <a className="flex items-start gap-3 rounded-md border border-line bg-white p-4 hover:border-gold" href={whatsappUrl}>
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">WhatsApp number</strong>{settings.whatsapp}</span>
            </a>
            <a className="flex items-start gap-3 rounded-md border border-line bg-white p-4 hover:border-gold" href={`mailto:${settings.email ?? ""}`}>
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">Email address</strong>{settings.email}</span>
            </a>
            <a className="flex items-start gap-3 rounded-md border border-line bg-white p-4 hover:border-gold" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">Shop address</strong>{settings.address}</span>
            </a>
            <p className="flex items-start gap-3 rounded-md border border-line bg-white p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">Business hours</strong>{settings.opening_hours}</span>
            </p>
            <p className="flex items-start gap-3 rounded-md border border-line bg-white p-4">
              <Store className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span><strong className="block text-ink">Business registration</strong>{settings.business_registration}</span>
            </p>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-medium sm:flex sm:flex-wrap">
            <a className="btn-secondary w-full px-4 py-2 sm:w-auto" href={settings.facebook_url ?? "#"} target="_blank" rel="noreferrer"><Facebook className="h-4 w-4" /> Facebook</a>
            <a className="btn-secondary w-full px-4 py-2 sm:w-auto" href={settings.instagram_url ?? "#"} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a>
            <a className="btn-secondary w-full px-4 py-2 sm:w-auto" href={settings.tiktok_url ?? "#"} target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </section>
        <LeadForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
