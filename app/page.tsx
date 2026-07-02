import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { Footer } from "@/components/footer";
import { AppointmentModalButton } from "@/components/appointment-modal-button";
import { HomeActionModals } from "@/components/home-action-modals";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getSiteSettings, getTestimonials } from "@/lib/data";

const trustItems: Array<[string, LucideIcon]> = [
  ["Verified iPhones", BadgeCheck],
  ["In-shop inspection", Store],
  ["Flexible payments", Wallet],
  ["Warranty terms", ShieldCheck],
  ["Secure process", LockKeyhole]
];

const steps: Array<[string, string, LucideIcon]> = [
  ["Choose your iPhone", "Browse the available models, compare price, storage, condition, warranty, and payment details.", Smartphone],
  ["Book your visit", "Pick your preferred date and time so the shop can prepare the phone before you arrive.", CalendarCheck],
  ["Inspect and complete", "Visit Circle Mall, inspect the device, confirm terms, and complete the order in person.", PackageCheck]
];

export default async function Home() {
  const [settings, featured, testimonials] = await Promise.all([getSiteSettings(), getFeaturedProducts(), getTestimonials()]);

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.brand_name,
    address: settings.address,
    telephone: settings.phone,
    email: settings.email,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tradewithdenis.com"
  };

  return (
    <>
      <Nav settings={settings} />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

        <section id="top" className="hero-showcase border-b border-line bg-white">
          <div className="container-page py-12 text-center sm:py-16 lg:py-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center">
              <p className="section-eyebrow">
                Premium iPhones in Ghana
              </p>
              <h1 className="mt-6 text-balance text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Own your next iPhone with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-xl sm:leading-8">
                Browse verified iPhones, see payment details clearly, then book a shop appointment to inspect the device and complete the order in person.
              </p>
              <HomeActionModals calculator={<PaymentCalculatorPanel />} appointment={<LeadForm variant="modal" />} />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-neutral-500 sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" /> Verified stock</span>
                <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" /> {settings.opening_hours}</span>
                <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> Circle Mall, Block C</span>
              </div>
            </div>

            <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16">
              <div className="showcase-frame relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-snow shadow-soft sm:rounded-[2.25rem]">
                <div className="aspect-[16/9] bg-[url('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
                <div className="grid gap-3 rounded-2xl border border-white/60 bg-white p-4 text-left shadow-soft md:absolute md:inset-x-6 md:bottom-6 md:grid-cols-3 md:bg-white/90 md:backdrop-blur">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-red">40% deposit ready</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-600">Discuss payment terms before visiting.</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-red">No online checkout</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-600">Every order is completed at the shop.</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-red">Prepared appointment</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-600">The shop knows what you want to inspect.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white py-8">
          <div className="container-page">
            <div className="grid gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
              {trustItems.map(([label, Icon]) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3">
                  <Icon className="h-5 w-5 text-gold" />
                  <span className="text-sm font-bold text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-snow py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">How it works</p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Simple flow. Serious purchase.</h2>
              <p className="mt-5 text-base leading-7 text-neutral-600 sm:text-lg">The website helps customers choose and book. The final decision happens in the shop after inspection.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map(([title, copy, Icon], index) => (
                <div key={title} className="premium-card p-7">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">Step 0{index + 1}</span>
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="mt-12 text-2xl font-black tracking-tight text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="iphones" className="bg-white py-16 sm:py-24">
          <div className="container-page">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Available stock</p>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Featured iPhones ready for inspection.</h2>
                <p className="mt-4 text-base leading-7 text-neutral-600">Every listing shows the details customers need before booking a shop visit.</p>
              </div>
              <Link className="btn-secondary w-full sm:w-auto" href="/iphones">View all iPhones</Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>

        <section id="why-us" className="scroll-mt-24 bg-snow py-16 sm:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="section-eyebrow">Why customers trust it</p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Clear before visit. Confident before payment.</h2>
              <p className="mt-5 text-base leading-7 text-neutral-600">TradeWithDenis keeps the online experience focused on discovery and appointment booking, while the final purchase remains personal and inspectable in shop.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Transparent pricing", "Customers see the cash price, deposit, weekly payment, warranty, and stock status before contacting the shop."],
                ["Real shop visit", "No hidden online checkout. The customer inspects the device and confirms everything at Circle Mall."],
                ["Fast follow-up", "Appointments and inquiries enter the admin dashboard so the shop can call, WhatsApp, or email quickly."],
                ["Editable business site", "Products, prices, contact details, policies, and customer requests can be managed from the admin dashboard."]
              ].map(([title, copy]) => (
                <div key={title} className="premium-card p-5">
                  <h3 className="font-black text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">Customer voices</p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">A buying experience built around trust.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="premium-card p-5">
                  <p className="text-sm leading-6 text-neutral-700">&quot;{item.quote}&quot;</p>
                  <footer className="mt-4 text-sm font-black">{item.customer_name} · {item.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-snow py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Questions before booking.</h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
              {[
                ["Are devices genuine?", "Devices should be inspected and listed with accurate condition, storage, warranty, and stock status."],
                ["What is the default deposit?", "The default down payment is 40%, but the admin can set this per product."],
                ["How long are installments?", "The default term is 12 weeks unless a product shows a different term."],
                ["Where is the shop?", "TradeWithDenis is at Circle Mall, Block C, Shop 27. Use the Google Maps link on the contact page for directions."]
              ].map(([q, a]) => (
                <div key={q} className="premium-card p-5">
                  <h3 className="font-black">{q}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="container-page">
            <div className="rounded-[2rem] border border-line bg-ink p-7 text-center text-white shadow-soft sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Ready to visit?</p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Book a shop appointment and inspect your iPhone in person.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">The shop receives your request, prepares for your visit, and follows up through your preferred contact method.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <AppointmentModalButton className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-ink focus:outline-none focus:ring-2 focus:ring-white/30" label="Book appointment" showIcon={false}>
                  <LeadForm variant="modal" />
                </AppointmentModalButton>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-ink" href="/iphones">Browse iPhones</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <a className="fixed bottom-20 right-4 z-40 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-soft md:bottom-6" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
      <Footer settings={settings} />
    </>
  );
}
