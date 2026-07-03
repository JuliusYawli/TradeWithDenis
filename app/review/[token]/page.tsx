import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { submitTestimonial } from "./actions";

type ReviewRequest = {
  customer_name: string;
  status: "created" | "sent" | "submitted" | "approved" | "declined";
};

async function getReviewRequest(token: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("testimonial_requests")
    .select("customer_name, status")
    .eq("token", token)
    .maybeSingle();

  return data as ReviewRequest | null;
}

function MessageCard({
  title,
  copy
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 text-center shadow-soft sm:p-8">
      <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">{copy}</p>
    </div>
  );
}

export default async function ReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ submitted?: string; error?: string; status?: string }>;
}) {
  const [{ token }, query, settings] = await Promise.all([params, searchParams, getSiteSettings()]);
  const request = await getReviewRequest(token);
  const isSubmitted = query?.submitted === "1" || query?.status === "already_submitted" || ["submitted", "approved", "declined"].includes(request?.status ?? "");
  const errorCopy: Record<string, string> = {
    unavailable: "The review form is not available until Supabase is connected.",
    invalid: "This review link is invalid or has expired.",
    missing: "Please add your name, review, and publishing permission before submitting.",
    failed: "Your review could not be saved. Please try again."
  };

  return (
    <>
      <Nav settings={settings} />
      <main className="min-h-screen bg-snow">
        <section className="container-page py-12 sm:py-16">
          {!request ? (
            <MessageCard title="Review link unavailable" copy={errorCopy[query?.error ?? "invalid"] ?? errorCopy.invalid} />
          ) : isSubmitted ? (
            <MessageCard title="Thank you for your review" copy="Your testimonial has been sent to TradeWithDennis for review. If approved, it can appear on the homepage." />
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <p className="section-eyebrow">Customer review</p>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Share your TradeWithDennis experience.</h1>
                <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-base">
                  Hi {request.customer_name}, thank you for completing your shop visit. Your review helps future customers feel confident before booking.
                </p>
                <div className="mt-6 rounded-xl border border-line bg-snow p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <p className="text-sm leading-6 text-neutral-600">
                      Reviews are checked by the admin before publishing. Only approved testimonials appear on the homepage.
                    </p>
                  </div>
                </div>
              </div>

              <form action={submitTestimonial} className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
                <input type="hidden" name="token" value={token} />
                {query?.error ? (
                  <p className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
                    {errorCopy[query.error] ?? "Please check the form and try again."}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium uppercase text-neutral-500">
                    Name
                    <input className="field mt-1" name="customer_name" defaultValue={request.customer_name} required />
                  </label>
                  <label className="text-xs font-medium uppercase text-neutral-500">
                    Location
                    <input className="field mt-1" name="location" placeholder="Example: Accra" />
                  </label>
                </div>
                <label className="mt-4 block text-xs font-medium uppercase text-neutral-500">
                  Rating
                  <select className="field mt-1 bg-white" name="rating" defaultValue="5">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-xs font-medium uppercase text-neutral-500">
                  Testimonial
                  <textarea className="field mt-1 min-h-36" name="quote" placeholder="Tell people about your shop visit, the service, and the phone you inspected or bought." required />
                </label>
                <label className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-snow p-4 text-sm leading-6 text-neutral-700">
                  <input className="mt-1" name="permission" type="checkbox" required />
                  I give TradeWithDennis permission to publish my name, location, rating, and testimonial on the website if approved.
                </label>
                <button className="btn-primary mt-5 w-full" type="submit">
                  <Star className="h-4 w-4" /> Submit review
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
