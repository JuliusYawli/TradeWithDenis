import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found", description: "The requested TradeWithDennis page could not be found.", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-snow px-4 py-12 text-center">
      <section className="w-full max-w-xl rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-10">
        <SearchX className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-red">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">That page is not available.</h1>
        <p className="mt-4 leading-7 text-neutral-600">The address may be incorrect, or the page may have moved. Return home or continue browsing available iPhones.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/">Return home</Link>
          <Link className="btn-secondary" href="/iphones">Browse iPhones</Link>
        </div>
      </section>
    </main>
  );
}
