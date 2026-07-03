"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Phone, Search } from "lucide-react";
import { appointmentTimeSlots } from "@/lib/appointment-times";
import type { Appointment, Lead } from "@/lib/types";
import { updateAppointmentStatus, updateLeadStatus } from "@/app/admin/actions";

const appointmentStatuses = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["postponed", "Postponed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no_show", "No-show"]
] as const;

const leadStatuses = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["follow_up", "Follow up"],
  ["qualified", "Qualified"],
  ["converted", "Converted"],
  ["lost", "Lost"]
] as const;

function statusLabel<T extends readonly (readonly [string, string])[]>(options: T, value: string) {
  return options.find(([status]) => status === value)?.[1] ?? value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function phoneHref(phone?: string | null) {
  return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "#";
}

function whatsappHref(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function matchesAppointment(appointment: Appointment, query: string) {
  const lead = appointment.leads;
  return [
    lead?.customer_name,
    lead?.phone,
    lead?.email,
    lead?.message,
    lead?.preferred_contact_method,
    lead?.desired_payment_option,
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.status,
    appointment.notes
  ].some((value) => normalize(value).includes(query));
}

function matchesLead(lead: Lead, query: string) {
  return [
    lead.customer_name,
    lead.phone,
    lead.email,
    lead.message,
    lead.preferred_contact_method,
    lead.desired_payment_option,
    lead.status
  ].some((value) => normalize(value).includes(query));
}

export function AdminAppointmentSearch({ appointments }: { appointments: Appointment[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (normalizedQuery ? appointments.filter((appointment) => matchesAppointment(appointment, normalizedQuery)) : appointments),
    [appointments, normalizedQuery]
  );

  return (
    <>
      <div className="mt-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="field bg-white pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search appointments by name, phone, email, or note"
            type="search"
          />
        </label>
        <p className="mt-2 text-xs font-medium text-neutral-500">{filtered.length} of {appointments.length} appointments showing</p>
      </div>
      <div className="mt-4 max-h-[820px] space-y-3 overflow-y-auto pr-2">
        {filtered.length ? filtered.map((appointment) => (
          <div key={appointment.id} className="rounded-md bg-snow p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{appointment.leads?.customer_name ?? "Customer"} · {appointment.appointment_date ?? "Date not chosen"} · {appointment.appointment_time ?? "Time not chosen"}</p>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-neutral-600">{statusLabel(appointmentStatuses, appointment.status)}</span>
            </div>
            <p className="mt-2 text-neutral-700">{appointment.leads?.phone} · {appointment.leads?.email ?? "No email"} · {appointment.leads?.preferred_contact_method}</p>
            <p className="mt-1 text-neutral-600">Payment: {appointment.leads?.desired_payment_option ?? "Not selected"}</p>
            <p className="mt-1 text-neutral-600">{appointment.leads?.message ?? appointment.notes}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-500">Booked {formatDateTime(appointment.created_at)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="btn-secondary px-3 py-2" href={phoneHref(appointment.leads?.phone)}><Phone className="h-4 w-4" /> Call</a>
              <a className="btn-secondary px-3 py-2" href={whatsappHref(appointment.leads?.phone)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              {appointment.leads?.email ? <a className="btn-secondary px-3 py-2" href={`mailto:${appointment.leads.email}`}><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
            <form action={updateAppointmentStatus} className="mt-3 grid gap-2 rounded-md border border-line bg-white p-3">
              <input type="hidden" name="id" value={appointment.id} />
              <div className="grid gap-2 md:grid-cols-3">
                <label className="text-xs font-medium uppercase text-neutral-500">Status<select className="field mt-1 bg-white" name="status" defaultValue={appointment.status}>
                  {appointmentStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Visit date<input className="field mt-1" name="appointment_date" type="date" defaultValue={appointment.appointment_date ?? ""} /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Visit time<select className="field mt-1" name="appointment_time" defaultValue={appointment.appointment_time ?? ""}>
                  <option value="">Choose time</option>
                  {appointment.appointment_time && !appointmentTimeSlots.includes(appointment.appointment_time as (typeof appointmentTimeSlots)[number]) ? (
                    <option value={appointment.appointment_time}>{appointment.appointment_time}</option>
                  ) : null}
                  {appointmentTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select></label>
              </div>
              <label className="text-xs font-medium uppercase text-neutral-500">Internal note<textarea className="field mt-1 min-h-20" name="notes" defaultValue={appointment.notes ?? ""} placeholder="Example: customer asked to postpone to Friday, confirmed by WhatsApp" /></label>
              <button className="btn-primary w-full px-4 py-2 md:w-fit" type="submit">Save appointment</button>
            </form>
          </div>
        )) : <p className="rounded-md bg-snow p-4 text-sm text-neutral-600">No appointments match that search.</p>}
      </div>
    </>
  );
}

export function AdminLeadSearch({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLeads = leads.slice(0, 20);
  const filtered = useMemo(
    () => (normalizedQuery ? visibleLeads.filter((lead) => matchesLead(lead, normalizedQuery)) : visibleLeads),
    [visibleLeads, normalizedQuery]
  );

  return (
    <>
      <div className="mt-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="field bg-white pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads by name, phone, email, or message"
            type="search"
          />
        </label>
        <p className="mt-2 text-xs font-medium text-neutral-500">{filtered.length} of {visibleLeads.length} leads showing</p>
      </div>
      <div className="mt-4 space-y-3">
        {filtered.length ? filtered.map((lead) => (
          <div key={lead.id} className="rounded-md bg-snow p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{lead.customer_name}</p>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-neutral-600">{statusLabel(leadStatuses, lead.status)}</span>
            </div>
            <p className="mt-1 text-neutral-700">{lead.phone} · {lead.email ?? "No email"} · {lead.preferred_contact_method}</p>
            <p className="mt-1 text-neutral-600">Payment: {lead.desired_payment_option ?? "Not selected"}</p>
            <p className="mt-2 text-neutral-600">{lead.message}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-500">Created {formatDateTime(lead.created_at)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="btn-secondary px-3 py-2" href={phoneHref(lead.phone)}><Phone className="h-4 w-4" /> Call</a>
              <a className="btn-secondary px-3 py-2" href={whatsappHref(lead.phone)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              {lead.email ? <a className="btn-secondary px-3 py-2" href={`mailto:${lead.email}`}><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
            <form action={updateLeadStatus} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select className="field max-w-44 bg-white" name="status" defaultValue={lead.status}>
                {leadStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button className="btn-secondary px-4 py-2" type="submit">Update</button>
            </form>
          </div>
        )) : <p className="rounded-md bg-snow p-4 text-sm text-neutral-600">No leads match that search.</p>}
      </div>
    </>
  );
}
