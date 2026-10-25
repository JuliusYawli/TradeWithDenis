"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "@/components/use-dialog-focus";
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
  const dialogRef = useDialogFocus(Boolean(selectedStat), () => setSelectedStat(null));

  const handleItemClick = (id: string, type: "product" | "lead" | "appointment") => {
    setSelectedStat(null);
    // Admin panels are hidden until the URL hash targets them, so navigate
    // via the hash instead of scrollIntoView on a display:none section.
    window.location.hash = type === "product" ? "products" : type === "lead" ? "leads" : "appointments";
    if (type === "product") {
      setTimeout(() => {
        const el = document.querySelector(`[data-product-id="${id}"]`);
        if (el instanceof HTMLDetailsElement) el.open = true;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
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

  const statLabels: Record<string, StatType> = {
    "Total products": "products",
    "In stock": "in_stock",
    "New leads": "new_leads",
    "Appointment queue": "appointment_queue"
  };
  const operationalStats = stats.filter(([label]) => statLabels[label]);
  const funnelStats = stats.filter(([label]) => !statLabels[label]);

  return (
    <>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Today&apos;s operations</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {operationalStats.map(([label, value]) => {
          const statType = statLabels[label];
          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedStat(statType)}
              className="admin-clickable rounded-lg border border-line bg-snow p-4 text-left transition hover:border-gold hover:bg-white hover:shadow-sm"
            >
              <p className="text-sm font-medium text-neutral-600">{label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
                <span className="text-xs font-semibold text-red">View details</span>
              </div>
            </button>
          );
        })}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Last 30 days</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {funnelStats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-white p-4">
              <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
              <p className="mt-1 text-sm text-neutral-600">{label.replace("30-day ", "")}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedStat && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setSelectedStat(null)}
        >
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="overview-detail-title" className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <button
              type="button"
              onClick={() => setSelectedStat(null)}
              className="absolute right-4 top-4 rounded-md p-2 hover:bg-gray-100"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 id="overview-detail-title" className="mb-4 pr-10 text-lg font-semibold">{data.title}</h3>

            <div className="space-y-2">
              {data.items.length ? (
                data.type === "product" ? (
                  (data.items as Product[]).map((product) => (
                    <button
                      key={product.id}
                      type="button"
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
                      type="button"
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
                      type="button"
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
