"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Appointment } from "@/lib/types";

const appointmentStatuses = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["postponed", "Postponed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no_show", "No-show"]
] as const;

function statusLabel(value: string) {
  return appointmentStatuses.find(([status]) => status === value)?.[1] ?? value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AppointmentStatusModal({
  appointments,
  statusCounts
}: {
  appointments: Appointment[];
  statusCounts: Array<readonly [string, number]>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filtered = selectedStatus
    ? appointments.filter((apt) => apt.status === selectedStatus)
    : [];

  return (
    <>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {statusCounts.map(([label, count]) => {
          const status = appointmentStatuses.find(([s]) => s === label)?.[0];
          return (
            <button
              key={label}
              onClick={() => setSelectedStatus(status ?? null)}
              className="rounded-md border border-line bg-snow px-3 py-2 text-left transition hover:border-gold hover:bg-white cursor-pointer"
            >
              <p className="text-xs font-medium uppercase text-neutral-500">{label}</p>
              <p className="text-xl font-semibold">{count}</p>
            </button>
          );
        })}
      </div>

      {selectedStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <button
              onClick={() => setSelectedStatus(null)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {statusLabel(selectedStatus)} Appointments ({filtered.length})
            </h3>

            <div className="space-y-3">
              {filtered.length ? (
                filtered.map((apt) => (
                  <div key={apt.id} className="rounded-md border border-line bg-snow p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-medium">{apt.leads?.customer_name ?? "Customer"}</p>
                      <span className="text-xs font-medium text-neutral-600">
                        {apt.appointment_date ?? "No date"}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {apt.appointment_time ?? "No time"} · {apt.leads?.phone}
                    </p>
                    {apt.notes && (
                      <p className="mt-2 text-sm text-neutral-600">{apt.notes}</p>
                    )}
                    <p className="mt-1 text-xs text-neutral-500">
                      Booked {formatDateTime(apt.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-600">No appointments</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
