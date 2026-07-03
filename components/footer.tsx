import Image from "next/image";
import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const whatsappUrl = `https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-900 bg-ink text-white">
      <div className="container-page py-8 sm:py-9">
        <div className="grid gap-7 md:grid-cols-[1.15fr_1fr_0.85fr]">
          <div>
            <div className="inline-flex max-w-full rounded-md bg-white px-2.5 py-2">
              <Image
                src="/logo.svg"
                alt="TradeWithDenis"
                width={210}
                height={58}
                className="h-10 w-auto max-w-full object-contain"
              />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
              Premium Apple devices in Ghana with clear appointment booking, transparent payment discussions, and in-shop order completion.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-white transition hover:bg-red" href={whatsappUrl}><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-ink" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer"><MapPin className="h-4 w-4" /> Directions</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Shop details</p>
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <a className="flex items-start gap-2 transition hover:text-white" href={`tel:${settings.phone ?? ""}`}>
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <span><strong className="text-white">Phone:</strong> {settings.phone}</span>
              </a>
              <a className="flex items-start gap-2 transition hover:text-white" href={whatsappUrl}>
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <span><strong className="text-white">WhatsApp:</strong> {settings.whatsapp}</span>
              </a>
              <a className="flex items-start gap-2 transition hover:text-white" href={`mailto:${settings.email ?? ""}`}>
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <span><strong className="text-white">Email:</strong> {settings.email}</span>
              </a>
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <span><strong className="text-white">Hours:</strong> {settings.opening_hours}</span>
              </p>
              <a className="flex items-start gap-2 transition hover:text-white" href={settings.google_maps_url ?? "#"} target="_blank" rel="noreferrer">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <span><strong className="text-white">Address:</strong> {settings.address}</span>
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Policies</p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/75 md:grid-cols-1">
                <Link className="block hover:text-white" href="/warranty">Warranty</Link>
                <Link className="block hover:text-white" href="/financing-terms">Financing terms</Link>
                <Link className="block hover:text-white" href="/privacy">Privacy</Link>
                <Link className="block hover:text-white" href="/terms">Terms</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Social</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-white/75">
                <a className="inline-flex items-center gap-1 hover:text-white" href={settings.facebook_url ?? "#"} target="_blank" rel="noreferrer"><Facebook className="h-4 w-4" /> Facebook</a>
                <a className="inline-flex items-center gap-1 hover:text-white" href={settings.instagram_url ?? "#"} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a>
                <a className="hover:text-white" href={settings.tiktok_url ?? "#"} target="_blank" rel="noreferrer">TikTok</a>
              </div>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              Registration: {settings.business_registration}
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs font-semibold text-white/55">
          <p>&copy; {year} {settings.brand_name}. All rights reserved.</p>
          <p>Buy. Sell. Trade. Complete every order in shop.</p>
        </div>
      </div>
    </footer>
  );
}
