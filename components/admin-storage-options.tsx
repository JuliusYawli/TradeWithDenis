"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { StorageOption } from "@/lib/types";

type OptionRow = { storage: string; price: string; weekly_payment: string };

function toRows(options: StorageOption[]): OptionRow[] {
  return options.map((option) => ({
    storage: option.storage,
    price: option.price ? String(option.price) : "",
    weekly_payment: option.weekly_payment ? String(option.weekly_payment) : ""
  }));
}

export function AdminStorageOptions({ defaultOptions = [] }: { defaultOptions?: StorageOption[] }) {
  const [rows, setRows] = useState<OptionRow[]>(toRows(defaultOptions));

  const update = (index: number, field: keyof OptionRow, value: string) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const serialized = JSON.stringify(
    rows
      .map((row) => ({
        storage: row.storage.trim(),
        price: Number(row.price || 0),
        weekly_payment: Number(row.weekly_payment || 0)
      }))
      .filter((row) => row.storage && row.price > 0)
  );

  return (
    <div className="rounded-md border border-line bg-white p-3">
      <input type="hidden" name="storage_options" value={serialized} />
      <p className="text-xs font-medium uppercase text-neutral-500">More storage options</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">The main Storage and Price above are the first option. Add extra storages here, each with its own price (and weekly payment for installment products).</p>
      {rows.map((row, index) => (
        <div key={index} className="mt-2 flex flex-wrap items-center gap-2">
          <input className="field w-28 flex-1 sm:flex-none" placeholder="512GB" value={row.storage} onChange={(e) => update(index, "storage", e.target.value)} />
          <input className="field w-28 flex-1 sm:flex-none" type="number" placeholder="Price" value={row.price} onChange={(e) => update(index, "price", e.target.value)} />
          <input className="field w-28 flex-1 sm:flex-none" type="number" placeholder="Weekly" value={row.weekly_payment} onChange={(e) => update(index, "weekly_payment", e.target.value)} />
          <button
            type="button"
            aria-label="Remove storage option"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-neutral-500 transition hover:border-danger hover:text-danger"
            onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-snow px-3 py-2 text-sm font-medium text-ink transition hover:border-gold hover:text-red"
        onClick={() => setRows((current) => [...current, { storage: "", price: "", weekly_payment: "" }])}
      >
        <Plus className="h-4 w-4" /> Add another storage
      </button>
    </div>
  );
}
