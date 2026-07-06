import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, Database, Download, ExternalLink, KeyRound, LogOut, Package, Plus, Settings, Star, Users, type LucideIcon } from "lucide-react";
import { AdminAppointmentSearch, AdminLeadSearch } from "@/components/admin-customer-search";
import { AdminToast } from "@/components/admin-toast";
import { AdminPasswordForm } from "@/components/admin-password-form";
import { AdminProductImageUpload } from "@/components/admin-product-image-upload";
import { AdminProductTemplateSelect } from "@/components/admin-product-template-select";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { AppointmentStatusModal } from "@/components/appointment-status-modal";
import { isAllowedAdminEmail } from "@/lib/admin";
import { getAdminTestimonials, getAppointments, getLeads, getProducts, getSiteSettings } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteProduct, logoutAdmin, saveProduct, saveSettings, updateTestimonialStatus } from "./actions";

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

  const [products, settings, testimonials, leads, appointments] = await Promise.all([
    getProducts(),
    getSiteSettings(),
    getAdminTestimonials(),
    getLeads(),
    getAppointments()
  ]);
  const inStock = products.filter((product) => product.stock_status === "in_stock").length;
  const appointmentStatusCounts = appointmentStatuses.map(([status, label]) => [
    label,
    appointments.filter((appointment) => appointment.status === status).length
  ] as const);
  const testimonialStatusCounts = testimonialStatuses.map(([status, label]) => [
    label,
    testimonials.filter((testimonial) => (testimonial.status ?? "approved") === status).length
  ] as const);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Total products", products.length, Package],
    ["In stock", inStock, BarChart3],
    ["New leads", leads.filter((lead) => lead.status === "new").length, Users],
    ["Appointment queue", appointments.filter((appointment) => !["completed", "cancelled", "no_show"].includes(appointment.status)).length, CalendarDays]
  ];
  const adminNavItems: Array<[string, string, LucideIcon, string | number | null]> = [
    ["Overview", "#overview", BarChart3, null],
    ["Appointments", "#appointments", CalendarDays, appointments.length],
    ["Leads", "#leads", Users, leads.length],
    ["Add product", "#add-product", Plus, null],
    ["Products", "#products", Package, products.length],
    ["Backups", "#backups", Database, null],
    ["Settings", "#settings", Settings, null],
    ["Password", "#password", KeyRound, null],
    ["Testimonials", "#testimonials", Star, testimonials.length]
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
      <AdminToast message={toast?.toast} title={toast?.toastTitle} type={toast?.type} />
      <div className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="mt-2 text-neutral-600">Manage products, leads, appointments, testimonials, and site settings.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/iphones" />
              <AdminSubmitButton className={adminActionButtonClass} pendingLabel="Opening..."><ExternalLink className="h-4 w-4" /> Catalog</AdminSubmitButton>
            </form>
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/" />
              <AdminSubmitButton className={adminActionButtonClass} pendingLabel="Opening..."><ExternalLink className="h-4 w-4" /> View site</AdminSubmitButton>
            </form>
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/admin/login" />
              <AdminSubmitButton className={adminDangerButtonClass} pendingLabel="Logging out..."><LogOut className="h-4 w-4" /> Logout</AdminSubmitButton>
            </form>
          </div>
        </div>

        <div className="admin-shell grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden rounded-xl border border-line bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:block">
            <div className="border-b border-line px-3 pb-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Admin menu</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">Workspace</h2>
            </div>
            <nav className="mt-3 space-y-1">
              {adminNavItems.map(([label, href, Icon, count]) => (
                <a key={label} className="admin-nav-link admin-clickable flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium text-neutral-700 transition hover:bg-snow hover:text-red" href={href}>
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gold" />
                    {label}
                  </span>
                  {count !== null ? <span className="rounded-full bg-snow px-2 py-0.5 text-xs text-neutral-500">{count}</span> : null}
                </a>
              ))}
            </nav>
            <div className="mt-4 space-y-2 border-t border-line pt-4">
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/iphones" />
                <AdminSubmitButton className={`${adminActionButtonClass} w-full`} pendingLabel="Opening..."><ExternalLink className="h-4 w-4" /> Catalog</AdminSubmitButton>
              </form>
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/" />
                <AdminSubmitButton className={`${adminActionButtonClass} w-full`} pendingLabel="Opening..."><ExternalLink className="h-4 w-4" /> View site</AdminSubmitButton>
              </form>
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/admin/login" />
                <AdminSubmitButton className={`${adminDangerButtonClass} w-full`} pendingLabel="Logging out..."><LogOut className="h-4 w-4" /> Logout</AdminSubmitButton>
              </form>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="mt-6 rounded-lg border border-line bg-white p-4 lg:hidden">
              <h2 className="text-lg font-semibold">Admin sections</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {adminNavItems.map(([label, href, Icon]) => (
                  <a key={label} className="admin-nav-link btn-secondary justify-start px-4 py-2" href={href}><Icon className="h-4 w-4" /> {label}</a>
                ))}
              </div>
            </section>

            <div className="admin-workspace mt-8">
          <section id="overview" className="admin-panel admin-panel-overview scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="mt-1 text-sm text-neutral-600">Your daily snapshot for stock, inquiries, and appointment activity.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {stats.map(([label, value, Icon]) => (
                <div key={String(label)} className="rounded-lg border border-line bg-snow p-5">
                  <Icon className="h-5 w-5 text-gold" />
                  <p className="mt-4 text-sm text-neutral-500">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
              ))}
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
          </section>

          <section id="appointments" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Appointment queue</h2>
                <p className="mt-1 text-sm text-neutral-600">Showing the latest {appointments.length} bookings. New bookings start as pending, then you move them through confirmed, postponed, completed, cancelled, or no-show.</p>
              </div>
            </div>
            <AdminAppointmentSearch appointments={appointments}>
              <AppointmentStatusModal appointments={appointments} statusCounts={appointmentStatusCounts} />
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
                <label className="text-xs font-medium uppercase text-neutral-500">Weekly payment<input className="field mt-1" name="weekly_payment" type="number" placeholder="675" required /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Deposit %<input className="field mt-1" name="down_payment_percent" type="number" placeholder="40" defaultValue={40} /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Payment weeks<input className="field mt-1" name="installment_weeks" type="number" placeholder="12" defaultValue={12} /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Quantity<input className="field mt-1" name="quantity" type="number" placeholder="1" defaultValue={1} /></label>
                <label className="text-xs font-medium uppercase text-neutral-500">Warranty months<input className="field mt-1" name="warranty_months" type="number" placeholder="3" defaultValue={3} /></label>
              </div>
              <div className="grid gap-2">
                <AdminProductImageUpload />
                <label className="text-xs font-medium uppercase text-neutral-500">Image URLs<textarea className="field mt-1 min-h-20" name="image_urls" placeholder="Uploaded photo URLs will appear here. You can also paste image URLs, one per line." /></label>
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
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/iphones" />
                <button className="btn-secondary px-4 py-2" type="submit">View catalog</button>
              </form>
            </div>
            <div className="mt-5 space-y-3">
              {products.map((product) => (
                <details key={product.id} className="rounded-md border border-line bg-snow p-4">
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
                      <label className="text-xs font-medium uppercase text-neutral-500">Weekly<input className="field mt-1" name="weekly_payment" type="number" defaultValue={product.weekly_payment} required /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Deposit %<input className="field mt-1" name="down_payment_percent" type="number" defaultValue={product.down_payment_percent} /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Weeks<input className="field mt-1" name="installment_weeks" type="number" defaultValue={product.installment_weeks} /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Quantity<input className="field mt-1" name="quantity" type="number" defaultValue={product.quantity} /></label>
                      <label className="text-xs font-medium uppercase text-neutral-500">Warranty months<input className="field mt-1" name="warranty_months" type="number" defaultValue={product.warranty_months} /></label>
                    </div>
                    <div className="grid gap-2">
                      <AdminProductImageUpload />
                      <label className="text-xs font-medium uppercase text-neutral-500">Image URLs<textarea className="field mt-1 min-h-20" name="image_urls" defaultValue={product.image_urls.join("\n")} /></label>
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
                    <button className="admin-clickable rounded-md px-2 py-1 text-sm font-medium text-danger transition hover:bg-danger/5" type="submit">Delete product</button>
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
      </div>
    </main>
  );
}
