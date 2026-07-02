import Link from "next/link";
import { BadgeCheck, CreditCard, LockKeyhole, PackageCheck, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { Footer } from "@/components/footer";
import { HomeActionModals } from "@/components/home-action-modals";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { PaymentCalculatorPanel } from "@/components/payment-calculator";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getSiteSettings, getTestimonials } from "@/lib/data";

const trustItems: Array<[string, LucideIcon]> = [
  ["Genuine devices", BadgeCheck],
  ["Warranty terms", ShieldCheck],
  ["Flexible payment", CreditCard],
  ["Verified stock", PackageCheck],
  ["Secure process", LockKeyhole]
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
        <section className="border-b border-line bg-white">
          <div className="container-page grid items-center gap-8 py-8 sm:py-12 lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-14">
            <div>
              <p className="mb-4 inline-flex max-w-full rounded-full border border-line px-3 py-1 text-xs font-semibold text-red sm:text-sm">iPhones and Apple financing in Ghana</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-7xl">TradeWithDenis</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:mt-5 sm:text-lg sm:leading-8">
                Browse premium iPhones with clear prices and payment plans, then book a shop appointment to inspect the device and complete the order in person.
              </p>
              <HomeActionModals calculator={<PaymentCalculatorPanel />} appointment={<LeadForm />} />
            </div>
            <div className="rounded-lg border border-line bg-snow p-3 shadow-soft sm:p-5">
              <div className="aspect-[5/4] rounded-md bg-[url('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center lg:aspect-[4/5]" />
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-snow py-5">
          <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {trustItems.map(([label, Icon]) => (
              <div key={String(label)} className="flex items-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold">
                <Icon className="h-5 w-5 text-gold" />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-10 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Featured iPhones</h2>
              <p className="mt-2 text-neutral-600">Verified stock with transparent deposit details before you book a shop visit.</p>
            </div>
            <Link className="hidden text-sm font-bold text-red md:block" href="/iphones">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="container-page grid gap-4 py-10 sm:gap-10 sm:py-16 lg:grid-cols-3">
          {["Choose your device", "Book a shop visit", "Complete order in person"].map((title, index) => (
            <div key={title} className="rounded-lg border border-line bg-white p-6">
              <span className="text-sm font-black text-gold">0{index + 1}</span>
              <h3 className="mt-3 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {index === 0 && "Compare model, storage, condition, warranty, and payment plan before contacting us."}
                {index === 1 && "Choose a preferred appointment date and time so the shop can prepare the device for inspection."}
                {index === 2 && "Visit Circle Mall, inspect the phone, confirm terms, and complete payment or financing at the shop."}
              </p>
            </div>
          ))}
        </section>

        <section className="bg-white py-10 sm:py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Sparkles className="mb-4 h-8 w-8 text-gold" />
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Clear enough to trust. Simple enough to manage.</h2>
              <p className="mt-4 text-neutral-600">Business contact details, social links, registration, product stock, testimonials, and lead follow-up are all editable from the admin dashboard.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="rounded-lg border border-line bg-snow p-5">
                  <p className="text-sm leading-6 text-neutral-700">“{item.quote}”</p>
                  <footer className="mt-4 text-sm font-bold">{item.customer_name} · {item.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="container-page py-10 sm:py-16">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Are devices genuine?", "Devices should be inspected and listed with accurate condition, storage, warranty, and stock status."],
              ["What is the default deposit?", "The default down payment is 40%, but the admin can set this per product."],
              ["How long are installments?", "The default term is 12 weeks unless a product shows a different term."],
              ["Where is the shop?", "TradeWithDenis is at Circle Mall, Block C, Shop 27. Use the Google Maps link on the contact page for directions."]
            ].map(([q, a]) => (
              <div key={q} className="rounded-lg border border-line bg-white p-5">
                <h3 className="font-bold">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <a className="fixed bottom-20 right-4 z-40 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-soft md:bottom-6" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
      <Footer settings={settings} />
    </>
  );
}
