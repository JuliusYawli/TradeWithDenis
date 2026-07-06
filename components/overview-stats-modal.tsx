"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Appointment, Lead, Product } from "@/lib/types";

type StatType = "products" | "in_stock" | "new_leads" | "appointment_queue";

export function OverviewStatsModal({
  products,
  leads,
  appointments,
  stats
}: {
  products: Product[];
  leads: Lead[];
  appointments: Appointment[];
  stats: Array<[string, number]>;
}) {
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null);

  const handleItemClick = (id: string, type: "product" | "lead" | "appointment") => {
    setSelectedStat(null);
    setTimeout(() => {
      if (type === "product") {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
        document.querySelector(`[data-product-id="${id}"]`)?.scrollIntoView({ behavior: "smooth" });
      } else if (type === "lead") {
        document.getElementById("leads")?.scrollIntoView({ behavior: "smooth" });
      } else if (type === "appointment") {
        document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const data = useMemo(() => {
    switch (selectedStat) {
      case "products":
        return { title: `All Products (${products.length})`, items: products, type: "product" };
      case "in_stock":
        const inStock = products.filter((p) => p.stock_status === "in_stock");
        return { title: `In Stock (${inStock.length})`, items: inStock, type: "product" };
      case "new_leads":
        const newLeads = leads.filter((l) => l.status === "new");
        return { title: `New Leads (${newLeads.length})`, items: newLeads, type: "lead" };
      case "appointment_queue":
        const queue = appointments.filter((a) => !["completed", "cancelled", "no_show"].includes(a.status));
        return { title: `Appointment Queue (${queue.length})`, items: queue, type: "appointment" };
      default:
        return null;
    }
  }, [selectedStat, products, leads, appointments]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStat(null);
    };
    if (selectedStat) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [selectedStat]);

  const statLabels: Record<string, StatType> = {
    "Total products": "products",
    "In stock": "in_stock",
    "New leads": "new_leads",
    "Appointment queue": "appointment_queue"
  };

  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => {
          const statType = statLabels[label];
          return (
            <button
              key={label}
              onClick={() => setSelectedStat(statType)}
              className="rounded-lg border border-line bg-snow p-5 text-left transition hover:border-gold hover:bg-white cursor-pointer"
            >
              <p className="mt-4 text-sm text-neutral-500">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </button>
          );
        })}
      </div>

      {selectedStat && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setSelectedStat(null)}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <button
              onClick={() => setSelectedStat(null)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">{data.title}</h3>

            <div className="space-y-2">
              {data.items.length ? (
                data.type === "product" ? (
                  (data.items as Product[]).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleItemClick(product.id, "product")}
                      className="w-full rounded-md border border-line bg-snow p-3 text-left transition hover:border-gold hover:bg-white cursor-pointer"
                    >
                      <p className="font-medium">{product.model} · {product.storage}</p>
                      <p className="text-sm text-neutral-600">GH₵{product.price.toLocaleString()} · {product.stock_status}</p>
                    </button>
                  ))
                ) : data.type === "lead" ? (
                  (data.items as Lead[]).map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleItemClick(lead.id, "lead")}
                      className="w-full rounded-md border border-line bg-snow p-3 text-left transition hover:border-gold hover:bg-white cursor-pointer"
                    >
                      <p className="font-medium">{lead.customer_name}</p>
                      <p className="text-sm text-neutral-600">{lead.phone} · {lead.email || "No email"}</p>
                      <p className="text-xs text-neutral-500 mt-1">Status: {lead.status}</p>
                    </button>
                  ))
                ) : (
                  (data.items as Appointment[]).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => handleItemClick(apt.id, "appointment")}
                      className="w-full rounded-md border border-line bg-snow p-3 text-left transition hover:border-gold hover:bg-white cursor-pointer"
                    >
                      <p className="font-medium">{apt.leads?.customer_name || "Customer"} · {apt.appointment_date || "No date"}</p>
                      <p className="text-sm text-neutral-600">{apt.appointment_time || "No time"} · {apt.leads?.phone}</p>
                    </button>
                  ))
                )
              ) : (
                <p className="text-center text-neutral-600 py-4">No items found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
