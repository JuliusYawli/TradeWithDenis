import Link from "next/link";
import { Suspense } from "react";
import {
  BadgeCheck,
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

        <section id="top" className="hero-showcase relative overflow-hidden border-b border-line bg-white animate-fade-in">
          <div className="container-page relative py-9 text-center sm:py-16 lg:py-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center">
              <p className="section-eyebrow animate-slide-up" style={{ animationDelay: "0.1s" }}>
                Premium iPhones in Ghana
              </p>
              <h1 className="mt-4 max-w-5xl text-balance text-3xl font-semibold tracking-tight text-ink sm:mt-6 sm:text-5xl lg:whitespace-nowrap lg:text-6xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
                Own Your Next iPhone With Confidence.
              </h1>
              <div className="mt-5 grid w-full max-w-3xl gap-2 text-left sm:mt-6 sm:grid-cols-3 sm:gap-3">
                {[
                  { title: "40% deposit ready", desc: "Discuss payment terms before visiting." },
                  { title: "No online checkout", desc: "Every order is completed at the shop." },
                  { title: "Prepared appointment", desc: "The shop knows what you want to inspect." }
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="card-modern p-3 sm:rounded-xl sm:p-4 animate-slide-up transition-all duration-300 hover:shadow-glow"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold">{item.title}</p>
                    <p className="mt-1 text-sm font-medium leading-5 text-neutral-600 dark:text-neutral-300">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Suspense fallback={null}>
                <HomeActionModals calculator={<PaymentCalculatorPanel />} appointment={<LeadForm variant="modal" />} />
              </Suspense>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-neutral-500 sm:mt-6 sm:gap-x-5 sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" /> Verified stock</span>
                <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" /> {settings.opening_hours}</span>
                <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> Circle Mall, Block C</span>
              </div>
            </div>

            <div className="relative mx-auto mt-8 max-w-6xl sm:mt-16">
              <div className="showcase-frame relative overflow-hidden rounded-2xl border border-white/80 bg-snow shadow-soft sm:rounded-[2.25rem]">
                <div className="aspect-[16/9]">
                  <HeroVideo videoUrl={settings.homepage_hero_video_url} imageUrl={settings.homepage_hero_image_url} fallbackImage={fallbackImage} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/90 backdrop-blur py-6 sm:py-8 animate-fade-in">
          <div className="container-page">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-y-6 lg:grid-cols-5">
              {trustItems.map(([label, Icon], i) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 text-center transition-all duration-300 sm:flex-row sm:justify-center sm:gap-3 hover:scale-105 animate-scale-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Icon className="h-6 w-6 text-gold transition-colors duration-300" />
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-snow py-12 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">How it works</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:mt-5 sm:text-4xl">Simple flow. Serious purchase.</h2>
              <p className="mt-5 text-base leading-7 text-neutral-600 sm:text-lg">The website helps customers choose and book. The final decision happens in the shop after inspection.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
              {steps.map(([title, copy, Icon], index) => (
                <div key={title} className="premium-card p-5 sm:p-7">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Step 0{index + 1}</span>
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink sm:mt-12 sm:text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl border border-line bg-white p-5 shadow-sm sm:mt-10 sm:p-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red">Ready to visit?</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Book a shop appointment and inspect your iPhone in person.</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">The shop receives your request, prepares for your visit, and follows up through your preferred contact method.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="iphones" className="bg-white py-16 sm:py-24">
          <div className="container-page">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Available stock</p>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Featured iPhones ready for inspection.</h2>
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
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Clear before visit. Confident before payment.</h2>
              <p className="mt-5 text-base leading-7 text-neutral-600">TradeWithDennis keeps the online experience focused on discovery and appointment booking, while the final purchase remains personal and inspectable in shop.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Transparent pricing", "Customers see the cash price, deposit, weekly payment, warranty, and stock status before contacting the shop."],
                ["Real shop visit", "No hidden online checkout. The customer inspects the device and confirms everything at Circle Mall."],
                ["Fast follow-up", "Appointments and inquiries enter the admin dashboard so the shop can call, WhatsApp, or email quickly."],
                ["Editable business site", "Products, prices, contact details, policies, and customer requests can be managed from the admin dashboard."]
              ].map(([title, copy]) => (
                <div key={title} className="premium-card p-5">
                  <h3 className="font-semibold text-ink">{title}</h3>
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
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">A buying experience built around trust.</h2>
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
        </section>

        <section id="faq" className="scroll-mt-24 bg-snow py-16 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Questions before booking.</h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
              {[
                ["Are devices genuine?", "Devices should be inspected and listed with accurate condition, storage, warranty, and stock status."],
                ["What is the default deposit?", "The default down payment is 40%, but the admin can set this per product."],
                ["How long are installments?", "The default term is 12 weeks unless a product shows a different term."],
                ["Where is the shop?", "TradeWithDennis is at Circle Mall, Block C, Shop 27. Use the Google Maps link on the contact page for directions."]
              ].map(([q, a]) => (
                <div key={q} className="premium-card p-5">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <a className="fixed bottom-20 right-4 z-40 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft md:bottom-6" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
      <Footer settings={settings} />
    </>
  );
}
