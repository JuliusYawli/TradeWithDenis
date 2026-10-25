"use client";

import { Search } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useMemo, useState } from "react";
import { financingFor, formatCedi } from "@/lib/finance";

export function ProductFilters({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("newest");
  const [comparison, setComparison] = useState<Product[]>([]);

  function toggleComparison(product: Product) {
    setComparison((current) => current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : current.length < 3 ? [...current, product] : [...current.slice(1), product]);
  }

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
      {comparison.length ? (
        <div className="mb-8 overflow-x-auto rounded-2xl border border-gold/40 bg-white p-4 shadow-sm" data-testid="comparison-table">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Compare iPhones ({comparison.length}/3)</h2>
            <button className="text-sm font-medium text-red" type="button" onClick={() => setComparison([])}>Clear</button>
          </div>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b border-line"><th className="py-2">Model</th><th>Condition</th><th>Cash price</th><th>Deposit</th><th>Weekly</th><th>Term</th><th>Warranty</th></tr></thead>
            <tbody>{comparison.map((product) => { const finance = financingFor(product); return (
              <tr key={product.id} className="border-b border-line/60 last:border-0"><td className="py-3 font-semibold">{product.model} {product.storage}</td><td>{product.condition}</td><td>{formatCedi(product.price)}</td><td>{formatCedi(finance.downPayment)}</td><td>{product.weekly_payment > 0 ? formatCedi(product.weekly_payment) : "Cash only"}</td><td>{product.installment_weeks} weeks</td><td>{product.warranty_months} weeks</td></tr>
            ); })}</tbody>
          </table>
        </div>
      ) : null}
      {filtered.length ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => <ProductCard key={product.id} product={product} comparing={comparison.some((item) => item.id === product.id)} onCompare={toggleComparison} />)}
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
