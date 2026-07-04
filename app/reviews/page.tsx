import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getAllPublicTestimonials, getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Read approved customer reviews from TradeWithDennis iPhone buyers."
};

export default async function ReviewsPage() {
  const [settings, testimonials] = await Promise.all([getPublicSiteSettings(), getAllPublicTestimonials()]);

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-8 sm:py-12">
        <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <div className="bg-snow p-5 sm:p-8">
            <p className="section-eyebrow">Customer voices</p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Real customer reviews from shop visits.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              Browse approved reviews from customers who visited, inspected a device, and shared their buying experience.
            </p>
          </div>
        </section>

        {testimonials.length ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.id} className="premium-card p-5">
                <div className="flex gap-1 text-gold" aria-label={`${item.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < item.rating ? "fill-current" : "text-neutral-200"}`} />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-neutral-700">&quot;{item.quote}&quot;</p>
                <footer className="mt-4 text-sm font-semibold text-ink">
                  {item.customer_name}{item.location ? ` · ${item.location}` : ""}
                </footer>
              </blockquote>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-xl border border-line bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-ink">No reviews are published yet.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-600">
              Approved customer reviews will appear here after shop visits are completed and reviewed.
            </p>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className="btn-primary w-full sm:w-auto" href="/iphones">Browse iPhones</Link>
          <Link className="btn-secondary w-full sm:w-auto" href="/#top">Back to home</Link>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
