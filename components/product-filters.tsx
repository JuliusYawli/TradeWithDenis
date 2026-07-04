"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useMemo, useState } from "react";

export function ProductFilters({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return products
      .filter((product) => `${product.model} ${product.storage}`.toLowerCase().includes(normalized))
      .filter((product) => condition === "all" || product.condition === condition)
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "weekly") return a.weekly_payment - b.weekly_payment;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
  }, [condition, products, query, sort]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="section-eyebrow">Catalog</p>
          <p className="mt-2 text-sm font-medium text-neutral-600">{filtered.length} of {products.length} iPhones showing</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm sm:inline-flex">
          <SlidersHorizontal className="h-4 w-4 text-red" />
          Compare price, deposit, and weekly plan
        </div>
      </div>
      <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4 md:mb-8 md:grid-cols-[minmax(0,1fr)_160px_190px]">
        <label className="relative flex min-h-12 items-center md:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-12 w-full rounded-xl border border-line bg-snow pl-11 pr-3 text-sm font-medium text-ink outline-none transition placeholder:text-neutral-400 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
            placeholder="Search model or storage"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="field h-12 rounded-xl bg-snow font-medium" value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option value="all">All conditions</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
        <select className="field h-12 rounded-xl bg-snow font-medium" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-low">Price low</option>
          <option value="price-high">Price high</option>
          <option value="weekly">Weekly payment</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-ink">No iPhones match those filters.</p>
          <p className="mt-2 text-sm text-neutral-600">Try clearing the search or choosing a different condition filter.</p>
        </div>
      )}
    </div>
  );
}
