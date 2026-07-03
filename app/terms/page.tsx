import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Terms", description: "TradeWithDennis website and purchase terms." };

const sections = [
  {
    title: "Online browsing and appointments",
    body: [
      "This website helps customers view available iPhones, compare prices and payment estimates, and request a shop appointment. A booking request is not a completed sale, reservation, or financing approval.",
      "TradeWithDennis may contact you by phone, WhatsApp, SMS, or email to confirm product availability, appointment time, payment preference, and any questions before you visit the shop."
    ]
  },
  {
    title: "Product information and availability",
    body: [
      "We try to keep product names, storage, condition, price, photos, warranty period, and stock status accurate. Availability can change quickly because devices may be inspected, reserved, or sold in the shop.",
      "Final product condition, accessories, battery health, warranty coverage, price, and payment terms should be confirmed in person before any payment is made."
    ]
  },
  {
    title: "In-shop inspection",
    body: [
      "Customers are expected to inspect the device in the shop before completing a purchase. This includes checking the model, storage, screen, cameras, Face ID or Touch ID, battery health, charging, speaker, buttons, network compatibility, and any visible cosmetic condition.",
      "If you decide not to proceed after inspection, no online sale has been completed through this website."
    ]
  },
  {
    title: "Payments and financing",
    body: [
      "Any weekly payment, deposit, or installment figure shown on the website is an estimate for convenience. Final financing terms, deposit amount, installment schedule, eligibility, and approval are confirmed directly by TradeWithDennis before purchase.",
      "TradeWithDennis may refuse, cancel, or adjust a financing arrangement if the customer information, product availability, payment history, or risk checks do not meet shop requirements."
    ]
  },
  {
    title: "Pricing errors and corrections",
    body: [
      "If a price, payment estimate, product detail, or stock status is listed incorrectly, TradeWithDennis may correct the information before completing the sale. We are not required to complete a sale based on an obvious error or outdated listing.",
      "Promotions, discounts, and offers may be changed or withdrawn unless already confirmed in writing by the shop."
    ]
  },
  {
    title: "Customer responsibilities",
    body: [
      "Customers should provide accurate contact details, attend appointments on time, inspect the device before payment, and ask questions about warranty, financing, accessories, and return conditions before completing a purchase.",
      "Customers should not submit false information, misuse the website, attempt unauthorized access to admin areas, or interfere with the security or operation of the service."
    ]
  },
  {
    title: "Limitation of online service",
    body: [
      "The website may be updated, unavailable, or interrupted from time to time. TradeWithDennis may change product listings, website content, appointment flows, and admin features as needed.",
      "To the fullest extent allowed by applicable law, TradeWithDennis is not responsible for indirect losses caused by website downtime, outdated listings, typographical errors, or a customer's failure to confirm details before purchase."
    ]
  },
  {
    title: "Changes to these terms",
    body: [
      "TradeWithDennis may update these terms as the business grows, services change, or legal requirements are updated. The latest version published on this page applies when you use the website."
    ]
  }
];

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
          <p className="mt-4 text-sm font-medium text-neutral-500">Last updated: July 3, 2026</p>
          <p className="mt-6 leading-7 text-neutral-700">
            These terms explain how customers use the TradeWithDennis website and how online appointment requests relate to in-shop purchases. By using this website or submitting a request, you agree to the terms below.
          </p>
        </section>
        <div className="mt-10 max-w-3xl space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
              <div className="mt-3 space-y-3 leading-7 text-neutral-700">
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
          <section className="rounded-lg border border-line bg-snow p-5">
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3 leading-7 text-neutral-700">Questions about these terms can be sent to {settings.email ?? "the shop"} or discussed directly at {settings.address ?? "the TradeWithDennis shop"}.</p>
          </section>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
