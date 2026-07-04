import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy Policy", description: "How TradeWithDennis handles lead and customer information." };

const sections = [
  {
    title: "Information we collect",
    body: [
      "When you contact TradeWithDennis, request an appointment, ask about a device, submit a lead form, or leave a review, we may collect details such as your name, phone number, email address, preferred contact method, appointment date, product interest, payment preference, message, and any information you choose to provide.",
      "If an authorized team member signs in to the admin dashboard, authentication and security information may also be processed to protect the business account and customer records."
    ]
  },
  {
    title: "How we use information",
    body: [
      "We use customer information to respond to inquiries, confirm appointment requests, check product availability, follow up on financing or payment questions, send booking or review emails, manage leads, and provide customer support.",
      "We may also use information to keep accurate business records, improve the website and admin dashboard, prevent misuse, protect the security of the service, and meet legal or regulatory obligations where applicable."
    ]
  },
  {
    title: "Customer communication",
    body: [
      "TradeWithDennis may contact you by phone, WhatsApp, SMS, or email about your inquiry, appointment, product interest, financing request, or after-sale support. You can ask us to stop non-essential follow-up messages at any time.",
      "Important service messages, such as appointment confirmations, warranty support, or payment-related communication, may still be sent when needed to complete your request or support your purchase."
    ]
  },
  {
    title: "Sharing information",
    body: [
      "We do not sell customer personal information. We may share limited information with trusted service providers that help us run the website, store records, send email, host the application, or communicate with customers.",
      "We may also share information if required by law, to protect the rights and safety of TradeWithDennis, customers, or others, or to investigate suspected fraud or misuse of the service."
    ]
  },
  {
    title: "Data storage and security",
    body: [
      "Customer records may be stored in secure business systems used by TradeWithDennis and its service providers. We use reasonable administrative and technical safeguards to protect information from unauthorized access, loss, or misuse.",
      "No online system is completely risk-free. Customers should avoid sending sensitive payment card details, passwords, Apple ID passwords, or private device passcodes through website forms or ordinary chat messages."
    ]
  },
  {
    title: "Retention",
    body: [
      "We keep customer and lead information for as long as needed to respond to requests, manage appointments, support purchases, maintain warranty records, resolve disputes, and meet business or legal requirements.",
      "When information is no longer needed, TradeWithDennis may delete it, anonymize it, or archive it according to business needs and applicable law."
    ]
  },
  {
    title: "Your choices",
    body: [
      "You may contact TradeWithDennis to request access to your information, correct inaccurate details, update your contact preferences, or ask for deletion where deletion is legally and operationally possible.",
      "If you believe information has been submitted incorrectly or without permission, contact the shop so the team can review and correct the record."
    ]
  }
];

export default async function PrivacyPage() {
  const settings = await getPublicSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm font-medium text-neutral-500">Last updated: July 3, 2026</p>
          <p className="mt-6 leading-7 text-neutral-700">
            TradeWithDennis respects customer privacy. This policy explains what information we collect, how we use it, and the choices customers have when they interact with the website or shop.
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
            <p className="mt-3 leading-7 text-neutral-700">Privacy questions or data requests can be sent to {settings.email ?? "the shop"} or discussed directly at {settings.address ?? "the TradeWithDennis shop"}.</p>
          </section>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
