import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Warranty", description: "TradeWithDennis warranty policy and device support terms." };

const sections = [
  {
    title: "Warranty period",
    body: [
      "Each device may have its own warranty period. The warranty period shown on the product page, invoice, or receipt is the period that applies to that specific purchase.",
      "Warranty begins on the purchase date unless the invoice or receipt states otherwise. Customers should keep their receipt, invoice, or confirmed purchase record for warranty support."
    ]
  },
  {
    title: "What the warranty covers",
    body: [
      "TradeWithDennis warranty support is intended to cover eligible hardware faults that appear during normal use within the stated warranty period, subject to inspection by the shop.",
      "Depending on the fault and device condition, TradeWithDennis may repair the device, replace an eligible part, offer a suitable replacement option, or advise the customer on the best next step."
    ]
  },
  {
    title: "What is not covered",
    body: [
      "Warranty does not cover physical damage, cracked screens, bent frames, liquid damage, fire damage, unauthorized repairs, tampering, misuse, loss, theft, or damage caused by chargers, accessories, software changes, or third-party repair attempts.",
      "Warranty also does not cover Apple ID or iCloud locks, forgotten passwords, network or SIM issues that are not caused by a device fault, normal battery wear beyond the stated battery condition, cosmetic wear, or accessories unless the invoice clearly says they are covered."
    ]
  },
  {
    title: "Customer inspection before purchase",
    body: [
      "Customers are encouraged to inspect the device in the shop before payment. This includes checking the model, storage, display, cameras, Face ID or Touch ID, battery health, charging, speakers, buttons, network compatibility, and cosmetic condition.",
      "Once a customer completes the purchase after inspection, warranty support applies only to eligible faults covered by this policy and the specific receipt or invoice."
    ]
  },
  {
    title: "How to request warranty support",
    body: [
      "Contact TradeWithDennis as soon as you notice a possible fault. Bring the device, receipt or invoice, and any accessories that may help the team inspect the issue.",
      "The device must be inspected by the shop before warranty support is confirmed. A fault reported during the warranty period may still be declined if inspection shows an excluded cause such as physical damage, liquid damage, tampering, or misuse."
    ]
  },
  {
    title: "Data and device locks",
    body: [
      "Customers are responsible for backing up personal data before submitting a device for inspection or repair. TradeWithDennis is not responsible for lost photos, messages, apps, accounts, or other personal data during service.",
      "Customers must remove personal passwords, Apple ID locks, Find My iPhone restrictions, or security locks when needed for diagnosis. TradeWithDennis will not bypass security protections without the customer's proper authorization."
    ]
  },
  {
    title: "Financing customers",
    body: [
      "Warranty support does not cancel or pause a customer's payment obligations unless TradeWithDennis confirms otherwise in writing. Customers on installment or financing arrangements should keep payments current while any warranty issue is reviewed.",
      "If a device is replaced or repaired under warranty, the original financing or payment agreement continues unless the shop agrees to update it."
    ]
  },
  {
    title: "Manufacturer warranty",
    body: [
      "Some devices may also have an active manufacturer warranty or Apple service eligibility. Any manufacturer warranty is separate from TradeWithDennis shop warranty and may be subject to the manufacturer's own terms, coverage limits, and service process.",
      "TradeWithDennis may help explain available options, but manufacturer decisions are controlled by the manufacturer or authorized service provider."
    ]
  }
];

export default async function WarrantyPage() {
  const settings = await getPublicSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Warranty Policy</h1>
          <p className="mt-4 text-sm font-medium text-neutral-500">Last updated: July 3, 2026</p>
          <p className="mt-6 leading-7 text-neutral-700">
            TradeWithDennis wants every customer to inspect devices confidently before purchase and understand what support is available after purchase. This policy explains the general warranty terms for devices sold by the shop.
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
            <h2 className="text-xl font-semibold text-ink">Business details</h2>
            <div className="mt-3 space-y-2 leading-7 text-neutral-700">
              <p>Warranty questions can be sent to {settings.email ?? "the shop"} or discussed directly at {settings.address ?? "the TradeWithDennis shop"}.</p>
              {settings.business_registration ? <p>Business registration: {settings.business_registration}</p> : null}
            </div>
          </section>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
