"use client";

import { Search } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useMemo, useState } from "react";

export function ProductFilters({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return products
      .filter((product) => `${product.model} ${product.storage}`.toLowerCase().includes(normalized))
      .filter((product) => condition === "all" || product.condition === condition)
      .filter((product) => stock === "all" || product.stock_status === stock)
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "weekly") return a.weekly_payment - b.weekly_payment;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
  }, [condition, products, query, sort, stock]);

  return (
    <div>
      <div className="mb-8 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_160px_160px_180px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
          <input className="field pl-10" placeholder="Search model or storage" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="field" value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option value="all">All conditions</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
        <select className="field" value={stock} onChange={(event) => setStock(event.target.value)}>
          <option value="all">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="reserved">Reserved</option>
        </select>
        <select className="field" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-low">Price low</option>
          <option value="price-high">Price high</option>
          <option value="weekly">Weekly payment</option>
        </select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
