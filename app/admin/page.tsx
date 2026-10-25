import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Activity, AlertTriangle, BarChart3, Bell, CalendarDays, Database, Download, ExternalLink, KeyRound, LogOut, Package, Plus, Settings, Star, Users, type LucideIcon } from "lucide-react";
import { AdminAppointmentSearch, AdminLeadSearch } from "@/components/admin-customer-search";
import { AdminToast } from "@/components/admin-toast";
import { AdminPasswordForm } from "@/components/admin-password-form";
import { AdminProductImageUpload } from "@/components/admin-product-image-upload";
import { AdminImageUrlManager } from "@/components/admin-image-url-manager";
import { AdminUnsavedChanges, ConfirmDeleteButton } from "@/components/admin-form-safety";
import { AdminPaymentFields } from "@/components/admin-payment-fields";
import { AdminProductTemplateSelect } from "@/components/admin-product-template-select";
import { AdminStorageOptions } from "@/components/admin-storage-options";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { AdminInactivityLogout } from "@/components/admin-inactivity-logout";
import { AppointmentStatusModal } from "@/components/appointment-status-modal";
import { OverviewStatsModal } from "@/components/overview-stats-modal";
import { isAllowedAdminEmail } from "@/lib/admin";
import { getAdminTestimonials, getAnalyticsSummary, getAppointments, getLeads, getProducts, getSiteSettings, isLeadFromToday } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteProduct, logoutAdmin, saveProduct, saveSettings, updateTestimonialStatus } from "./actions";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

const appointmentStatuses = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["postponed", "Postponed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no_show", "No-show"]
] as const;
const stockStatuses = [
  ["in_stock", "In stock"],
  ["reserved", "Reserved"],
  ["sold", "Sold"]
] as const;
const testimonialStatuses = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["declined", "Declined"]
] as const;
const adminActionButtonClass = "admin-clickable inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-gold hover:bg-snow hover:text-red focus:outline-none focus:ring-2 focus:ring-gold/25";
const adminDangerButtonClass = "admin-clickable inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-danger/20 bg-white px-4 py-2 text-sm font-medium text-danger shadow-sm transition hover:border-danger/40 hover:bg-danger/5 focus:outline-none focus:ring-2 focus:ring-danger/20";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusLabel<T extends readonly (readonly [string, string])[]>(options: T, value: string) {
  return options.find(([status]) => status === value)?.[1] ?? value;
}

function supabaseProjectInfo() {
  const fallback = "https://supabase.com/dashboard/projects";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return { ref: null, url: fallback };

  try {
    const hostname = new URL(supabaseUrl).hostname;
    const ref = hostname.endsWith(".supabase.co") ? hostname.split(".")[0] : null;
    return { ref, url: ref ? `https://supabase.com/dashboard/project/${ref}` : fallback };
  } catch {
    return { ref: null, url: fallback };
  }
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ toast?: string; toastTitle?: string; type?: "success" | "info" }>;
}) {
  const toast = await searchParams;

  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/admin/login");
    if (!isAllowedAdminEmail(data.user.email)) redirect("/admin/login?error=unauthorized");
  }

  const [products, settings, testimonials, leads, appointments, analytics] = await Promise.all([
    getProducts(),
    getSiteSettings(),
    getAdminTestimonials(),
    getLeads(),
    getAppointments(),
    getAnalyticsSummary()
  ]);
  const inStock = products.filter((product) => product.stock_status === "in_stock").length;
  const todaysLeads = leads.filter((lead) => isLeadFromToday(lead.created_at));
  const activeAppointments = appointments.filter((appointment) => !appointment.archived);
  const appointmentQueue = activeAppointments.filter((appointment) => !["completed", "cancelled", "no_show"].includes(appointment.status));
  const newLeadCount = todaysLeads.filter((lead) => lead.status === "new").length;
  const pendingTestimonialCount = testimonials.filter((testimonial) => (testimonial.status ?? "approved") === "pending").length;
  const productsMissingImages = products.filter((product) => !product.image_urls.length);
  const productsMissingDetails = products.filter((product) => !product.description?.trim() || !product.warranty_months);
  const stockConflicts = products.filter((product) => product.stock_status === "in_stock" && product.quantity <= 0);
  const notifications = [
    appointmentQueue.length ? { label: `${appointmentQueue.length} appointment${appointmentQueue.length === 1 ? "" : "s"} need action`, href: "#appointments", tone: "urgent" } : null,
    newLeadCount ? { label: `${newLeadCount} new lead${newLeadCount === 1 ? "" : "s"} today`, href: "#leads", tone: "urgent" } : null,
    pendingTestimonialCount ? { label: `${pendingTestimonialCount} review${pendingTestimonialCount === 1 ? "" : "s"} awaiting approval`, href: "#testimonials", tone: "normal" } : null,
    productsMissingImages.length ? { label: `${productsMissingImages.length} product${productsMissingImages.length === 1 ? "" : "s"} missing photos`, href: "#products", tone: "normal" } : null,
    stockConflicts.length ? { label: `${stockConflicts.length} in-stock listing${stockConflicts.length === 1 ? " has" : "s have"} zero quantity`, href: "#products", tone: "urgent" } : null
  ].filter((item): item is { label: string; href: string; tone: string } => Boolean(item));
  const recentActivity = [
    ...products.map((product) => ({ label: `${product.model} · ${product.storage}`, detail: "Product record", at: product.updated_at ?? product.created_at, href: "#products" })),
    ...leads.map((lead) => ({ label: lead.customer_name, detail: `Lead · ${statusLabel([["new", "New"], ["contacted", "Contacted"], ["follow_up", "Follow up"], ["qualified", "Qualified"], ["converted", "Converted"], ["lost", "Lost"]] as const, lead.status)}`, at: lead.created_at, href: "#leads" })),
    ...testimonials.map((testimonial) => ({ label: testimonial.customer_name, detail: "Customer review", at: testimonial.updated_at ?? testimonial.created_at, href: "#testimonials" }))
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 5);
  const appointmentStatusCounts = appointmentStatuses.map(([status, label]) => [
    label,
    activeAppointments.filter((appointment) => appointment.status === status).length
  ] as const);
  const testimonialStatusCounts = testimonialStatuses.map(([status, label]) => [
    label,
    testimonials.filter((testimonial) => (testimonial.status ?? "approved") === status).length
  ] as const);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Total products", products.length, Package],
    ["In stock", inStock, BarChart3],
    ["New leads", newLeadCount, Users],
    ["Appointment queue", appointmentQueue.length, CalendarDays],
    ["30-day product views", analytics.productViews, BarChart3],
    ["30-day booking starts", analytics.bookingStarts, CalendarDays],
    ["30-day bookings", analytics.bookings, Users]
  ];
  const adminNavItems: Array<[string, string, LucideIcon, string | number | null]> = [
    ["Overview", "#overview", BarChart3, null],
    ["Appointments", "#appointments", CalendarDays, appointmentQueue.length],
    ["Leads", "#leads", Users, newLeadCount],
    ["Add product", "#add-product", Plus, null],
    ["Products", "#products", Package, products.length],
    ["Backups", "#backups", Database, null],
    ["Settings", "#settings", Settings, null],
    ["Password", "#password", KeyRound, null],
    ["Testimonials", "#testimonials", Star, pendingTestimonialCount]
  ];
  const backupExports: Array<[string, string, string, number | string]> = [
    ["Appointments", "Customer visit bookings with status, dates, notes, and contact details.", "/admin/exports/appointments", "Full CSV"],
    ["Customer leads", "All inquiries collected from appointment and contact forms.", "/admin/exports/leads", "Full CSV"],
    ["Products", "Inventory, prices, payment terms, stock status, warranty, and image URLs.", "/admin/exports/products", "Full CSV"],
    ["Site settings", "Business contact details, address, social links, and registration number.", "/admin/exports/settings", "Full CSV"],
    ["Testimonials", "Customer testimonials and approval status.", "/admin/exports/testimonials", "Full CSV"],
    ["Review requests", "Review email requests linked to completed appointments.", "/admin/exports/testimonial-requests", "Full CSV"]
  ];
  const supabaseBackupInfo = supabaseProjectInfo();

  return (
    <main className="min-h-screen bg-snow">
      <AdminInactivityLogout />
      <AdminUnsavedChanges />
      <AdminToast message={toast?.toast} title={toast?.toastTitle} type={toast?.type} />
      <div className="border-b border-white/10 bg-ink text-white">
      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e6c675]">Store operations</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Admin dashboard</h1>
            <p className="mt-2 text-white/65">Manage today&apos;s work and keep the storefront accurate.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            <a className={adminActionButtonClass} href="/iphones" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Catalog</a>
            <a className={adminActionButtonClass} href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View site</a>
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/admin/login" />
              <AdminSubmitButton className={adminDangerButtonClass} pendingLabel="Logging out..."><LogOut className="h-4 w-4" /> Logout</AdminSubmitButton>
            </form>
          </div>
        </div>
      </div>
      </div>

      <div className="container-page py-6 sm:py-8">
        <div className="admin-shell grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden overflow-hidden rounded-2xl bg-ink p-3 text-white shadow-lg lg:sticky lg:top-6 lg:block">
            <div className="border-b border-white/10 px-3 pb-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#e6c675]">Admin menu</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Workspace</h2>
            </div>
            <nav className="mt-3 space-y-1">
              {adminNavItems.map(([label, href, Icon, count]) => (
                <a key={label} className="admin-nav-link admin-clickable flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href={href}>
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gold" />
                    {label}
                  </span>
                  {count !== null ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{count}</span> : null}
                </a>
              ))}
            </nav>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <a className={`${adminActionButtonClass} w-full`} href="/iphones" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Catalog</a>
              <a className={`${adminActionButtonClass} w-full`} href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View site</a>
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/admin/login" />
                <AdminSubmitButton className={`${adminDangerButtonClass} w-full`} pendingLabel="Logging out..."><LogOut className="h-4 w-4" /> Logout</AdminSubmitButton>
              </form>
            </div>
          </aside>

          <div className="min-w-0">
            <details className="mt-6 rounded-lg border border-line bg-white p-4 lg:hidden">
              <summary className="cursor-pointer font-semibold text-ink">Admin sections</summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {adminNavItems.map(([label, href, Icon]) => (
                  <a key={label} className="admin-nav-link btn-secondary justify-start px-4 py-2" href={href}><Icon className="h-4 w-4" /> {label}</a>
                ))}
              </div>
            </details>

            <div className="admin-workspace mt-6">
          <section id="overview" className="admin-panel admin-panel-overview scroll-mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="mt-1 text-sm text-neutral-600">Click any stat to view details. Your daily snapshot for stock, inquiries, and appointment activity.</p>
            </div>
            <OverviewStatsModal
              products={products}
              leads={todaysLeads}
              appointments={activeAppointments}
              stats={stats.map(([label, value]) => [String(label), Number(value)])}
            />
            <div className="mt-5 rounded-lg border border-line bg-snow p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Needs attention</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    <span className="font-semibold text-ink">{appointmentQueue.length}</span> appointment{appointmentQueue.length === 1 ? "" : "s"} in queue, <span className="font-semibold text-ink">{newLeadCount}</span> new lead{newLeadCount === 1 ? "" : "s"}, and <span className="font-semibold text-ink">{pendingTestimonialCount}</span> review{pendingTestimonialCount === 1 ? "" : "s"} awaiting moderation.
                  </p>
                </div>
                <a className="btn-primary px-4 py-2" href={appointmentQueue.length ? "#appointments" : newLeadCount ? "#leads" : pendingTestimonialCount ? "#testimonials" : "#products"}>
                  {appointmentQueue.length || newLeadCount || pendingTestimonialCount ? "Review next task" : "Review inventory"}
                </a>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-4">
              <a className="admin-clickable rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#appointments">
                <CalendarDays className="h-5 w-5 text-gold" />
                <p className="mt-3 font-semibold">Review appointments</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Confirm, postpone, complete, cancel, or mark visits as no-show.</p>
              </a>
              <a className="admin-clickable rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#leads">
                <Users className="h-5 w-5 text-gold" />
                <p className="mt-3 font-semibold">Follow up leads</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Call, WhatsApp, email, and update customer inquiry status.</p>
              </a>
              <a className="admin-clickable rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#products">
                <Package className="h-5 w-5 text-gold" />
                <p className="mt-3 font-semibold">Manage inventory</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Update product prices, stock status, images, and featured devices.</p>
              </a>
              <a className="admin-clickable rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#backups">
                <Database className="h-5 w-5 text-gold" />
                <p className="mt-3 font-semibold">Back up records</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Open Supabase backup settings and export business records as CSV files.</p>
              </a>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-line bg-ink p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-[#e6c675]" /><h3 className="font-semibold text-white">Notifications</h3></div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">{notifications.length}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {notifications.length ? notifications.map((item) => (
                    <a key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" href={item.href}>
                      <span className="flex items-center gap-2">{item.tone === "urgent" ? <AlertTriangle className="h-4 w-4 shrink-0 text-[#e6c675]" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-[#e6c675]" />}{item.label}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  )) : <p className="rounded-lg border border-white/10 p-4 text-sm text-white/60">You&apos;re caught up. No operational alerts.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-line bg-snow p-5">
                <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-gold" /><h3 className="font-semibold text-ink">Recent record activity</h3></div>
                <div className="mt-4 divide-y divide-line">
                  {recentActivity.map((item) => (
                    <a key={`${item.detail}-${item.label}-${item.at}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-red" href={item.href}>
                      <span><span className="block font-medium text-ink">{item.label}</span><span className="text-xs text-neutral-500">{item.detail}</span></span>
                      <time className="shrink-0 text-xs text-neutral-500" dateTime={item.at}>{formatDateTime(item.at)}</time>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="appointments" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Appointment queue</h2>
                <p className="mt-1 text-sm text-neutral-600">Showing the latest {appointments.length} bookings. New bookings start as pending, then you move them through confirmed, postponed, completed, cancelled, or no-show.</p>
              </div>
            </div>
            <AdminAppointmentSearch appointments={appointments}>
              <AppointmentStatusModal appointments={activeAppointments} statusCounts={appointmentStatusCounts} />
            </AdminAppointmentSearch>
          </section>

          <section id="leads" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div>
              <h2 className="text-xl font-semibold">Recent leads</h2>
              <p className="mt-1 text-sm text-neutral-600">Track every inquiry after you call or message the customer.</p>
            </div>
            <AdminLeadSearch leads={leads} />
          </section>
          <section id="add-product" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Add product</h2>
                <p className="mt-1 text-sm text-neutral-600">Create a new iPhone listing with price, payment plan, stock, warranty, and photos.</p>
              </div>
            </div>
            <form action={saveProduct} className="mt-5 grid gap-3 rounded-md bg-snow p-4">
              <AdminProductTemplateSelect />
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs font-medium uppercase text-neutral-500">Model<input className="field mt-1" name="model" placeholder="iPhone 16 Pro Max" required /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Slug<input className="field mt-1" name="slug" placeholder="iphone-16-pro-max-256gb-used" required /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Storage<input className="field mt-1" name="storage" placeholder="256GB" required /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Condition<select className="field mt-1" name="condition" defaultValue="Used"><option>Used</option><option>New</option></select></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Grade<input className="field mt-1" name="grade" placeholder="A+, A, clean, etc." /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Stock<select className="field mt-1" name="stock_status" defaultValue="in_stock">{stockStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Price<input className="field mt-1" name="price" type="number" placeholder="9000" required /></label>
                <AdminPaymentFields />
                <label className="text-xs font-medium uppercase text-neutral-500">Warranty weeks<input className="field mt-1" name="warranty_months" type="number" placeholder="12" defaultValue={12} /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Available colors<input className="field mt-1" name="colors" placeholder="Black Titanium, Natural, Blue" /></label>
              </div>
              <AdminStorageOptions />
              <div className="grid gap-2">
                <AdminProductImageUpload />
                <AdminImageUrlManager />
              </div>
              <label className="text-xs font-medium uppercase text-neutral-500">Description<textarea className="field mt-1 min-h-20" name="description" placeholder="Description" /></label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input name="is_featured" type="checkbox" /> Featured</label>
              <button className="btn-primary w-full md:w-fit" type="submit">Add product</button>
            </form>
          </section>

          <section id="products" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Products</h2>
                <p className="mt-1 text-sm text-neutral-600">Edit prices, update photos, and change stock status.</p>
              </div>
              <a className="btn-secondary px-4 py-2" href="/iphones" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View catalog</a>
            </div>
            {(productsMissingImages.length || productsMissingDetails.length || stockConflicts.length) ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-2xl font-semibold text-ink">{productsMissingImages.length}</p><p className="text-sm text-neutral-700">Missing product photos</p></div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-2xl font-semibold text-ink">{productsMissingDetails.length}</p><p className="text-sm text-neutral-700">Incomplete descriptions or warranty</p></div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-2xl font-semibold text-ink">{stockConflicts.length}</p><p className="text-sm text-neutral-700">Stock status conflicts</p></div>
              </div>
            ) : null}
            <div className="mt-5 space-y-3">
              {products.map((product) => (
                <details key={product.id} data-product-id={product.id} className="rounded-md border border-line bg-snow p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{product.model} · {product.storage}</p>
                        <p className="mt-1 text-sm text-neutral-600">GH₵{product.price.toLocaleString()} · GH₵{product.weekly_payment.toLocaleString()} weekly · {product.stock_status} · Qty {product.quantity}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {product.is_featured ? <span className="rounded-full bg-white px-3 py-1 text-neutral-700">Featured</span> : null}
                        <span className="rounded-full bg-white px-3 py-1 text-neutral-700">{product.image_urls.length} image{product.image_urls.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </summary>
                  <form action={saveProduct} className="mt-4 grid gap-3 border-t border-line pt-4">
                    <input type="hidden" name="id" value={product.id} />
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="text-xs font-medium uppercase text-neutral-500">Model<input className="field mt-1" name="model" defaultValue={product.model} required /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Slug<input className="field mt-1" name="slug" defaultValue={product.slug} required /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Storage<input className="field mt-1" name="storage" defaultValue={product.storage} required /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Condition<select className="field mt-1" name="condition" defaultValue={product.condition}><option>Used</option><option>New</option></select></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Grade<input className="field mt-1" name="grade" defaultValue={product.grade ?? ""} /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Stock<select className="field mt-1" name="stock_status" defaultValue={product.stock_status}>{stockStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Price<input className="field mt-1" name="price" type="number" defaultValue={product.price} required /></label>
                      <AdminPaymentFields defaultCashOnly={!product.weekly_payment || product.weekly_payment <= 0} weeklyPayment={product.weekly_payment} downPaymentPercent={product.down_payment_percent} installmentWeeks={product.installment_weeks} />
                      <label className="text-xs font-medium uppercase text-neutral-500">Warranty weeks<input className="field mt-1" name="warranty_months" type="number" defaultValue={product.warranty_months} /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Available colors<input className="field mt-1" name="colors" placeholder="Black Titanium, Natural, Blue" defaultValue={(product.colors ?? []).join(", ")} /></label>
                    </div>
                    <AdminStorageOptions defaultOptions={product.storage_options ?? []} />
                    <div className="grid gap-2">
                      <AdminProductImageUpload />
                      <AdminImageUrlManager defaultUrls={product.image_urls} />
                    </div>
                    <label className="text-xs font-medium uppercase text-neutral-500">Description<textarea className="field mt-1 min-h-20" name="description" defaultValue={product.description ?? ""} /></label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold"><input name="is_featured" type="checkbox" defaultChecked={product.is_featured} /> Featured</label>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary px-4 py-2" type="submit">Save product</button>
                      </div>
                    </div>
                  </form>
                  <form action={deleteProduct} className="mt-3">
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmDeleteButton itemName={`${product.model} ${product.storage}`} />
                  </form>
                </details>
              ))}
            </div>
          </section>
          <section id="backups" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Database className="h-5 w-5 text-gold" />
                <h2 className="mt-3 text-xl font-semibold">Backups</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-600">
                  Keep two backup layers: Supabase for database restore, and CSV exports for day-to-day business copies.
                </p>
              </div>
              <span className="rounded-full bg-snow px-3 py-1 text-xs font-semibold text-neutral-600">
                {hasSupabaseEnv() ? "Supabase connected" : "Supabase env not detected"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-lg border border-line bg-snow p-5">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-semibold text-ink">Supabase database backup</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      This is the recovery backup for the real database. Keep automatic backups enabled in Supabase before production launch.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 rounded-md border border-line bg-white p-4 text-sm text-neutral-700">
                  <p><span className="font-medium">Project:</span> {supabaseBackupInfo.ref ?? "Open from Supabase dashboard"}</p>
                  <p><span className="font-medium">What to check:</span> automatic backups, recovery settings, and restore access.</p>
                  <p><span className="font-medium">Important:</span> CSV exports are useful copies, but they do not replace database restore backups.</p>
                </div>
                <a className={`${adminActionButtonClass} mt-4`} href={supabaseBackupInfo.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open Supabase dashboard
                </a>
              </div>

              <div className="rounded-lg border border-line bg-white p-5">
                <div className="flex items-start gap-3">
                  <Download className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-semibold text-ink">Admin CSV exports</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Download snapshots of business records for Google Drive, email, or local storage.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {backupExports.map(([label, description, href, count]) => (
                    <div key={href} className="flex flex-col gap-3 rounded-md border border-line bg-snow p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink">{label} <span className="text-sm font-medium text-neutral-500">({count})</span></p>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
                      </div>
                      <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-gold hover:text-red" href={href}>
                        <Download className="h-4 w-4" /> CSV
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
            <section id="settings" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
              <Settings className="h-5 w-5 text-gold" />
              <h2 className="mt-3 text-xl font-semibold">Site settings</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">These details appear across the public website, footer, contact page, appointment emails, and business schema.</p>
              <form action={saveSettings} className="mt-5 grid gap-5">
                {"id" in settings ? <input type="hidden" name="id" value={String(settings.id)} /> : null}
                <div className="rounded-lg border border-line bg-snow p-4">
                  <h3 className="font-semibold text-ink">Business identity</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Controls the public brand name and legal/business reference shown on the site.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-medium uppercase text-neutral-500">Brand name<input className="field mt-1" name="brand_name" defaultValue={settings.brand_name} placeholder="TradeWithDennis" /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">Business registration number<input className="field mt-1" name="business_registration" defaultValue={settings.business_registration ?? ""} placeholder="BN..." /></label>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-snow p-4">
                  <h3 className="font-semibold text-ink">Homepage image</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Controls the large image shown near the top of the homepage.</p>
                  <div className="mt-4 grid gap-2">
                    <AdminProductImageUpload
                      fieldName="homepage_hero_image_url"
                      mode="replace"
                      title="Homepage hero image"
                      buttonLabel="Upload homepage image"
                      helpText="Upload one shop or product photo. It will replace the homepage hero image URL below."
                      multiple={false}
                    />
                    <label className="text-xs font-medium uppercase text-neutral-500">Homepage hero image URL<input className="field mt-1" name="homepage_hero_image_url" defaultValue={settings.homepage_hero_image_url ?? ""} placeholder="Upload a photo or paste an image URL" /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">Homepage hero video URL<input className="field mt-1" name="homepage_hero_video_url" defaultValue={settings.homepage_hero_video_url ?? ""} placeholder="Paste video URL (YouTube, Vimeo, or direct video URL)" /></label>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-snow p-4">
                  <h3 className="font-semibold text-ink">Contact and location</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Used in the header/footer, contact page, booking emails, WhatsApp links, and Google directions.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-medium uppercase text-neutral-500">Phone number<input className="field mt-1" name="phone" defaultValue={settings.phone ?? ""} placeholder="+233 ..." /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">WhatsApp number<input className="field mt-1" name="whatsapp" defaultValue={settings.whatsapp ?? ""} placeholder="+233 ..." /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">Business email<input className="field mt-1" name="email" type="email" defaultValue={settings.email ?? ""} placeholder="shop@example.com" /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">Opening hours<input className="field mt-1" name="opening_hours" defaultValue={settings.opening_hours ?? ""} placeholder="8:00 AM - 7:00 PM" /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500 md:col-span-2">Shop address<textarea className="field mt-1 min-h-24" name="address" defaultValue={settings.address ?? ""} placeholder="Circle Mall, Block C, Shop 27" /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500 md:col-span-2">Google Maps link<input className="field mt-1" name="google_maps_url" defaultValue={settings.google_maps_url ?? ""} placeholder="https://maps.app.goo.gl/..." /></label>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-snow p-4">
                  <h3 className="font-semibold text-ink">Appointment availability</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Use weekday numbers from 0 to 6, where Sunday is 0. The default 1,2,3,4,5,6 allows Monday through Saturday.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-medium uppercase text-neutral-500">Open booking days<input className="field mt-1" name="booking_days" defaultValue={(settings.booking_days ?? [1,2,3,4,5,6]).join(",")} /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">How far ahead (days)<input className="field mt-1" name="booking_max_days" type="number" min="7" max="180" defaultValue={settings.booking_max_days ?? 90} /></label>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-snow p-4">
                  <h3 className="font-semibold text-ink">Social links</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">Used wherever the website links customers to TradeWithDennis social pages.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <label className="text-xs font-medium uppercase text-neutral-500">Instagram URL<input className="field mt-1" name="instagram_url" defaultValue={settings.instagram_url ?? ""} placeholder="https://instagram.com/..." /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">Facebook URL<input className="field mt-1" name="facebook_url" defaultValue={settings.facebook_url ?? ""} placeholder="https://facebook.com/..." /></label>
                    <label className="text-xs font-medium uppercase text-neutral-500">TikTok URL<input className="field mt-1" name="tiktok_url" defaultValue={settings.tiktok_url ?? ""} placeholder="https://tiktok.com/..." /></label>
                  </div>
                </div>
                <button className="btn-primary w-full sm:w-fit" type="submit">Save settings</button>
              </form>
            </section>
            <section id="password" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
              <KeyRound className="h-5 w-5 text-gold" />
              <h2 className="mt-3 text-xl font-semibold">Password</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">Change the password for the admin account currently signed in on this device.</p>
              <AdminPasswordForm />
            </section>
            <section id="testimonials" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Star className="h-5 w-5 text-gold" />
                  <h2 className="mt-3 text-xl font-semibold">Testimonials</h2>
                  <p className="mt-1 text-sm text-neutral-600">Approve real customer reviews before they appear on the homepage.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {testimonialStatusCounts.map(([label, count]) => (
                  <div key={label} className="rounded-md border border-line bg-snow px-3 py-2">
                    <p className="text-xs font-medium uppercase text-neutral-500">{label}</p>
                    <p className="text-xl font-semibold">{count}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {testimonials.length ? testimonials.map((testimonial) => {
                  const testimonialStatus = testimonial.status ?? "approved";
                  return (
                    <div key={testimonial.id} className="rounded-md border border-line bg-snow p-4 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{testimonial.customer_name} {testimonial.location ? `· ${testimonial.location}` : ""}</p>
                          <p className="mt-1 text-xs font-medium uppercase text-neutral-500">{testimonial.rating}/5 rating · Submitted {formatDateTime(testimonial.created_at)}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-neutral-600">{statusLabel(testimonialStatuses, testimonialStatus)}</span>
                      </div>
                      <p className="mt-3 rounded-md bg-white p-3 leading-6 text-neutral-700">&quot;{testimonial.quote}&quot;</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-neutral-500">
                          {testimonialStatus === "approved" && testimonial.is_featured ? "Shown on homepage" : testimonialStatus === "approved" ? "Approved but hidden from homepage" : "Not shown on homepage"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <form action={updateTestimonialStatus} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="id" value={testimonial.id} />
                            <input type="hidden" name="status" value="approved" />
                            <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-neutral-700">
                              <input name="is_featured" type="checkbox" defaultChecked={testimonial.is_featured || testimonialStatus === "pending"} />
                              Show on homepage
                            </label>
                            <button className="btn-primary px-4 py-2" type="submit">{testimonialStatus === "approved" ? "Save" : "Approve"}</button>
                          </form>
                          <form action={updateTestimonialStatus}>
                            <input type="hidden" name="id" value={testimonial.id} />
                            <input type="hidden" name="status" value="declined" />
                            <button className="btn-secondary px-4 py-2" type="submit">Decline</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                }) : <p className="text-sm text-neutral-600">No testimonials submitted yet.</p>}
              </div>
            </section>
        </div>
          </div>
        </div>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-ink/95 p-2 text-white shadow-2xl backdrop-blur lg:hidden" aria-label="Quick admin navigation">
          {[['Overview', '#overview', BarChart3], ['Appointments', '#appointments', CalendarDays], ['Leads', '#leads', Users], ['Products', '#products', Package]].map(([label, href, Icon]) => {
            const NavIcon = Icon as LucideIcon;
            return <a key={String(label)} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white" href={String(href)}><NavIcon className="h-4 w-4 text-[#e6c675]" />{String(label)}</a>;
          })}
        </nav>
      </div>
    </main>
  );
}
