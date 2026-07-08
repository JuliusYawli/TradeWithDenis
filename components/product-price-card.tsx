"use client";

import { useMemo, useState } from "react";
import { financingFor, formatCedi, isCashOnly } from "@/lib/finance";
import type { Product, StorageOption } from "@/lib/types";

export function ProductPriceCard({ product }: { product: Product }) {
  const cashOnly = isCashOnly(product);

  const variants = useMemo<StorageOption[]>(() => {
    const base: StorageOption = { storage: product.storage, price: product.price, weekly_payment: product.weekly_payment };
    const extras = (product.storage_options ?? []).filter((option) => option.storage && option.storage !== base.storage);
    return [base, ...extras];
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const variant = variants[selectedIndex] ?? variants[0];
  const finance = financingFor({
    price: variant.price,
    weekly_payment: variant.weekly_payment,
    down_payment_percent: product.down_payment_percent,
    installment_weeks: product.installment_weeks
  });

  return (
    <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
      {variants.length > 1 ? (
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Storage</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((option, index) => (
              <button
                key={option.storage}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  index === selectedIndex
                    ? "border-gold bg-gold text-white shadow-glow-sm"
                    : "border-line bg-white text-ink hover:border-gold hover:text-red"
                }`}
              >
                {option.storage}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Cash price</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-ink">{formatCedi(variant.price)}</p>
        </div>
        <div className="rounded-2xl bg-snow px-4 py-3 text-right">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">{cashOnly ? "Payment" : "Weekly plan"}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-red">{cashOnly ? "Cash only" : formatCedi(variant.weekly_payment)}</p>
        </div>
      </div>

      {cashOnly ? (
        <p className="mt-5 rounded-2xl bg-snow p-4 text-sm leading-6 text-neutral-700">
          This phone is sold at cash price only — no weekly payment plan. Pay the full {formatCedi(variant.price)} at the shop after inspecting the device.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Down payment", finance.downPayment],
            ["Financed balance", finance.financedBalance],
            ["Term", `${product.installment_weeks} weeks`],
            ["Total weekly paid", finance.totalWeeklyPaid],
            ["Total paid", finance.totalPaid],
            ["Finance cost", finance.financeCost]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-snow p-4">
              <p className="text-sm font-medium text-neutral-500">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{typeof value === "number" ? formatCedi(value) : value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
