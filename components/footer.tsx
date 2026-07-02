import Image from "next/image";
import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const whatsappUrl = `https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`;

  return (
    <footer className="border-t border-blue-900 bg-ink text-white">
      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.4fr_0.75fr]">
          <div>
            <div className="inline-flex rounded-lg bg-white p-3">
              <Image
                src="/logo.svg"
                alt="TradeWithDenis"
                width={280}
                height={67}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Premium Apple devices in Ghana with clear appointment booking, transparent payment discussions, and in-shop order completion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a className="btn-primary px-4 py-2" href={whatsappUrl}><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a className="btn-secondary border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white hover:text-ink" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer"><MapPin className="h-4 w-4" /> Directions</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-200">Shop details</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition hover:border-blue-300 hover:bg-white/10" href={`tel:${settings.phone ?? ""}`}>
                <Phone className="mb-2 h-5 w-5 text-blue-300" />
                <strong className="block text-white">Phone number</strong>
                {settings.phone}
              </a>
              <a className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition hover:border-blue-300 hover:bg-white/10" href={whatsappUrl}>
                <MessageCircle className="mb-2 h-5 w-5 text-blue-300" />
                <strong className="block text-white">WhatsApp</strong>
                {settings.whatsapp}
              </a>
              <a className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition hover:border-blue-300 hover:bg-white/10" href={`mailto:${settings.email ?? ""}`}>
                <Mail className="mb-2 h-5 w-5 text-blue-300" />
                <strong className="block text-white">Email</strong>
                {settings.email}
              </a>
              <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <Clock className="mb-2 h-5 w-5 text-blue-300" />
                <strong className="block text-white">Business hours</strong>
                {settings.opening_hours}
              </p>
              <a className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition hover:border-blue-300 hover:bg-white/10 sm:col-span-2" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer">
                <MapPin className="mb-2 h-5 w-5 text-blue-300" />
                <strong className="block text-white">Shop address</strong>
                {settings.address}
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-200">Policies</p>
              <div className="mt-4 space-y-2 text-sm text-white/75">
                <Link className="block hover:text-white" href="/warranty">Warranty</Link>
                <Link className="block hover:text-white" href="/financing-terms">Financing terms</Link>
                <Link className="block hover:text-white" href="/privacy">Privacy</Link>
                <Link className="block hover:text-white" href="/terms">Terms</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-200">Social</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-white/75">
                <a className="inline-flex items-center gap-1 hover:text-white" href={settings.facebook_url ?? "#"} target="_blank" rel="noreferrer"><Facebook className="h-4 w-4" /> Facebook</a>
                <a className="inline-flex items-center gap-1 hover:text-white" href={settings.instagram_url ?? "#"} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a>
                <a className="hover:text-white" href={settings.tiktok_url ?? "#"} target="_blank" rel="noreferrer">TikTok</a>
              </div>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/75">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              Registration: {settings.business_registration}
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-semibold text-white/55">
          <p>&copy; 2026 {settings.brand_name}. All rights reserved.</p>
          <p>Buy. Sell. Trade. Complete every order in shop.</p>
        </div>
      </div>
    </footer>
  );
}
