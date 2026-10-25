import Link from "next/link";
import { Suspense } from "react";
import {
  BadgeCheck,
  ArrowRight,
  CalendarCheck,
  Clock,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { Footer } from "@/components/footer";
import { HomeActionModals } from "@/components/home-action-modals";
import { HeroVideo } from "@/components/hero-video";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getPublicSiteSettings, getTestimonials } from "@/lib/data";

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
  const [settings, featured, testimonials] = await Promise.all([getPublicSiteSettings(), getFeaturedProducts(), getTestimonials()]);
  const fallbackImage = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1800&q=85";
  // Pexels stock video (free for commercial use); admins can override it in site settings.
  const heroVideoUrl = settings.homepage_hero_video_url || "https://videos.pexels.com/video-files/6611941/6611941-hd_1920_1080_25fps.mp4";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.brand_name,
    address: settings.address,
    telephone: settings.phone,
    email: settings.email,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tradewithdennis.com"
  };

  return (
    <>
      <Nav settings={settings} />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

        <section id="top" className="relative isolate flex min-h-[calc(100svh-4rem)] overflow-hidden border-b border-line md:min-h-[calc(100svh-6rem)]">
          <div className="absolute inset-0 -z-20 bg-ink">
            <HeroVideo videoUrl={heroVideoUrl} imageUrl={settings.homepage_hero_image_url} fallbackImage={fallbackImage} />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,26,43,0.95)_0%,rgba(8,26,43,0.78)_42%,rgba(8,26,43,0.28)_75%,rgba(8,26,43,0.38)_100%)] max-md:bg-[linear-gradient(180deg,rgba(8,26,43,0.76)_0%,rgba(8,26,43,0.82)_40%,rgba(8,26,43,0.98)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(200,146,46,0.18),transparent_36%)]" />

          <div className="container-page flex w-full flex-col justify-end py-8 sm:py-12 lg:py-14">
            <div className="max-w-2xl text-left">
              <h1 className="text-balance text-[2.75rem] font-bold leading-[0.98] text-white sm:text-[4rem] lg:text-[5rem] animate-slide-up">
                Find the right iPhone.
                <span className="block pb-2 text-gradient-gold">Inspect it before you pay.</span>
              </h1>
              <p className="mt-5 max-w-xl text-balance text-base leading-7 text-stone-300 sm:text-lg animate-slide-up" style={{ animationDelay: "0.15s" }}>
                Talk directly with the shop, compare honest prices, and inspect your chosen device at Circle Mall before making the final decision.
              </p>
              <Suspense fallback={null}>
                <HomeActionModals variant="hero" calculator={<PaymentCalculatorPanel />} appointment={<LeadForm variant="modal" />} />
              </Suspense>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 animate-fade-in sm:mt-8" style={{ animationDelay: "0.3s" }}>
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#f4dfae] sm:text-sm"><ShieldCheck className="h-4 w-4 text-[#e6c675]" /> Verified stock</span>
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#f4dfae] sm:text-sm"><Clock className="h-4 w-4 text-[#e6c675]" /> {settings.opening_hours}</span>
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#f4dfae] sm:text-sm"><MapPin className="h-4 w-4 text-[#e6c675]" /> Circle Mall, Shop 27</span>
              </div>
            </div>

            <div className="mt-8 grid gap-3 border-t border-white/15 pt-5 text-left sm:grid-cols-3 lg:max-w-4xl">
              {[
                { title: "40% deposit ready", desc: "Discuss payment terms before visiting." },
                { title: "No online checkout", desc: "Every order is completed at the shop." },
                { title: "Prepared appointment", desc: "The shop knows what you want to inspect." }
              ].map((item, i) => (
                <div key={item.title} className="border-l border-gold/40 px-4 py-1 animate-slide-up" style={{ animationDelay: `${0.35 + i * 0.1}s` }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#e6c675]">{item.title}</p>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-stone-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white py-6 sm:py-7 animate-fade-in">
          <div className="container-page">
            <div className="flex gap-7 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {trustItems.map(([label, Icon], i) => (
                <div
                  key={label}
                  className="flex min-w-max items-center gap-2.5 text-left transition-all duration-300 lg:min-w-0 lg:justify-center hover:scale-105 animate-scale-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Icon className="h-6 w-6 text-gold transition-colors duration-300" />
                  <span className="text-sm font-medium text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-snow py-16 sm:py-24 animate-fade-in">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center animate-slide-up">
              <p className="section-eyebrow">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold sm:mt-5 sm:text-5xl">Simple flow. Serious purchase.</h2>
              <p className="mt-5 text-base leading-7 text-neutral-600 sm:text-lg">The website helps customers choose and book. The final decision happens in the shop after inspection.</p>
            </div>
            <div className="relative mt-10 grid gap-0 border-y border-stone-300 md:grid-cols-3">
              {steps.map(([title, copy, Icon], index) => (
                <div key={title} className="border-b border-stone-300 bg-transparent p-6 last:border-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-9 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between">
                    <Icon className="h-6 w-6 text-gold transition-transform duration-300 hover:scale-110" />
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink sm:mt-12 sm:text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-5 rounded-[1.5rem] bg-ink p-6 text-white sm:mt-10 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8 animate-slide-up">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Ready to visit?</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Book a shop visit. We’ll prepare the phone.</h2>
                <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">Tell us what you want to inspect and the shop will follow up through your preferred contact method.</p>
              </div>
              <Link className="btn-hero-primary" href="/?action=appointment"><CalendarCheck className="h-4 w-4" /> Book your visit</Link>
            </div>
          </div>
        </section>

        <section id="iphones" className="bg-white py-16 sm:py-24 animate-fade-in">
          <div className="container-page">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-slide-up">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Available stock</p>
                <h2 className="mt-5 text-3xl font-semibold sm:text-5xl">Featured iPhones ready for inspection.</h2>
                <p className="mt-4 text-base leading-7 text-neutral-600">Every listing shows the details customers need before booking a shop visit.</p>
              </div>
              <Link className="btn-primary w-full sm:w-auto transition-all duration-300 hover:shadow-glow" href="/iphones">View all iPhones</Link>
            </div>
            <div className="featured-rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
              {featured.map((product, i) => (
                <div key={product.id} className="w-[86vw] max-w-[360px] shrink-0 snap-start animate-scale-in md:w-auto md:max-w-none" style={{ animationDelay: `${i * 0.08}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why-us" className="scroll-mt-24 overflow-hidden bg-ink py-16 text-white sm:py-24 animate-fade-in">
          <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="animate-slide-up">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e6c675]">A more personal way to buy</p>
              <h2 className="mt-5 text-3xl font-semibold text-white sm:text-5xl lg:text-6xl">The website helps you choose. The shop helps you decide.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/65">TradeWithDennis is built around a real conversation and an in-person inspection, without pressure to complete an anonymous online checkout.</p>
              <a className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#e6c675] hover:text-[#e6c675]" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`}>Talk to the shop on WhatsApp <ArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="grid border border-white/10 sm:grid-cols-2">
              {[
                ["Transparent pricing", "Customers see the cash price, deposit, weekly payment, warranty, and stock status before contacting the shop."],
                ["Real shop visit", "No hidden online checkout. The customer inspects the device and confirms everything at Circle Mall."],
                ["Fast follow-up", "Appointments and inquiries enter the admin dashboard so the shop can call, WhatsApp, or email quickly."],
                ["Editable business site", "Products, prices, contact details, policies, and customer requests can be managed from the admin dashboard."]
              ].map(([title, copy], i) => (
                <div key={title} className="border-b border-white/10 p-6 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:p-8 animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {testimonials.length ? <section className="bg-white py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">Customer voices</p>
              <h2 className="mt-5 text-3xl font-semibold sm:text-5xl">A buying experience built around trust.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="premium-card p-5">
                  <div className="flex gap-1 text-gold" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < item.rating ? "fill-current" : "text-neutral-200"}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-neutral-700">&quot;{item.quote}&quot;</p>
                  <footer className="mt-4 text-sm font-semibold">{item.customer_name}{item.location ? ` · ${item.location}` : ""}</footer>
                </blockquote>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link className="btn-secondary w-full sm:w-auto" href="/reviews">View all reviews</Link>
            </div>
          </div>
        </section> : null}

        <section id="faq" className="scroll-mt-24 bg-snow py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="mt-5 text-3xl font-semibold sm:text-5xl">Questions before booking.</h2>
            </div>
            <div className="mx-auto mt-10 max-w-4xl divide-y divide-stone-300 border-y border-stone-300">
              {[
                ["Are devices genuine?", "Devices should be inspected and listed with accurate condition, storage, warranty, and stock status."],
                ["What is the default deposit?", "The default down payment is 40%, but the admin can set this per product."],
                ["How long are installments?", "The default term is 12 weeks unless a product shows a different term."],
                ["Where is the shop?", "TradeWithDennis is at Circle Mall, Block C, Shop 27. Use the Google Maps link on the contact page for directions."]
              ].map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden"><span>{q}</span><span className="text-2xl font-light text-gold transition group-open:rotate-45">+</span></summary>
                  <p className="max-w-2xl pb-2 pr-10 text-sm leading-6 text-neutral-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>
      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-ink/95 p-2 shadow-2xl backdrop-blur md:hidden">
        <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-ink" href="/iphones"><Smartphone className="h-4 w-4" /> Browse phones</Link>
        <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-ink" href="/?action=appointment"><CalendarCheck className="h-4 w-4" /> Book a visit</Link>
      </div>
      <Footer settings={settings} />
    </>
  );
}
