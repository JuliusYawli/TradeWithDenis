import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, ExternalLink, LogOut, Mail, MessageCircle, Package, Phone, Plus, Settings, Star, Users, type LucideIcon } from "lucide-react";
import { AdminToast } from "@/components/admin-toast";
import { isAllowedAdminEmail } from "@/lib/admin";
import { appointmentTimeSlots } from "@/lib/appointment-times";
import { getAppointments, getLeads, getProducts, getSiteSettings, getTestimonials } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteProduct, logoutAdmin, saveProduct, saveSettings, updateAppointmentStatus, updateLeadStatus } from "./actions";

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
const stockStatuses = [
  ["in_stock", "In stock"],
  ["reserved", "Reserved"],
  ["sold", "Sold"]
] as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusLabel<T extends readonly (readonly [string, string])[]>(options: T, value: string) {
  return options.find(([status]) => status === value)?.[1] ?? value;
}

function phoneHref(phone?: string | null) {
  return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "#";
}

function whatsappHref(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ toast?: string; type?: "success" | "info" }>;
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
    getTestimonials(),
    getLeads(),
    getAppointments()
  ]);
  const inStock = products.filter((product) => product.stock_status === "in_stock").length;
  const appointmentStatusCounts = appointmentStatuses.map(([status, label]) => [
    label,
    appointments.filter((appointment) => appointment.status === status).length
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
    ["Settings", "#settings", Settings, null],
    ["Testimonials", "#testimonials", Star, testimonials.length]
  ];

  return (
    <main className="min-h-screen bg-snow">
      <AdminToast message={toast?.toast} type={toast?.type} />
      <div className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Admin dashboard</h1>
            <p className="mt-2 text-neutral-600">Manage products, leads, appointments, testimonials, and site settings.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/iphones" />
              <button className="btn-secondary px-4 py-2" type="submit"><ExternalLink className="h-4 w-4" /> Catalog</button>
            </form>
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/" />
              <button className="btn-primary px-4 py-2" type="submit"><ExternalLink className="h-4 w-4" /> Site</button>
            </form>
            <form action={logoutAdmin}>
              <input type="hidden" name="next" value="/admin/login" />
              <button className="btn-secondary px-4 py-2" type="submit"><LogOut className="h-4 w-4" /> Logout</button>
            </form>
          </div>
        </div>

        <div className="admin-shell grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden rounded-xl border border-line bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:block">
            <div className="border-b border-line px-3 pb-4 pt-2">
              <p className="text-xs font-black uppercase tracking-wide text-gold">Admin menu</p>
              <h2 className="mt-1 text-lg font-black text-ink">Workspace</h2>
            </div>
            <nav className="mt-3 space-y-1">
              {adminNavItems.map(([label, href, Icon, count]) => (
                <a key={label} className="admin-nav-link flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-bold text-neutral-700 transition hover:bg-snow hover:text-red" href={href}>
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
                <button className="btn-secondary w-full px-4 py-2" type="submit"><ExternalLink className="h-4 w-4" /> Catalog</button>
              </form>
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/" />
                <button className="btn-primary w-full px-4 py-2" type="submit"><ExternalLink className="h-4 w-4" /> View site</button>
              </form>
              <form action={logoutAdmin}>
                <input type="hidden" name="next" value="/admin/login" />
                <button className="btn-secondary w-full px-4 py-2" type="submit"><LogOut className="h-4 w-4" /> Logout</button>
              </form>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="mt-6 rounded-lg border border-line bg-white p-4 lg:hidden">
              <h2 className="text-lg font-black">Admin sections</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {adminNavItems.map(([label, href, Icon]) => (
                  <a key={label} className="admin-nav-link btn-secondary justify-start px-4 py-2" href={href}><Icon className="h-4 w-4" /> {label}</a>
                ))}
              </div>
            </section>

            <div className="admin-workspace mt-8">
          <section id="overview" className="admin-panel admin-panel-overview scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div>
              <h2 className="text-xl font-black">Overview</h2>
              <p className="mt-1 text-sm text-neutral-600">Your daily snapshot for stock, inquiries, and appointment activity.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {stats.map(([label, value, Icon]) => (
                <div key={String(label)} className="rounded-lg border border-line bg-snow p-5">
                  <Icon className="h-5 w-5 text-gold" />
                  <p className="mt-4 text-sm text-neutral-500">{label}</p>
                  <p className="text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <a className="rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#appointments">
                <CalendarDays className="h-5 w-5 text-gold" />
                <p className="mt-3 font-black">Review appointments</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Confirm, postpone, complete, cancel, or mark visits as no-show.</p>
              </a>
              <a className="rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#leads">
                <Users className="h-5 w-5 text-gold" />
                <p className="mt-3 font-black">Follow up leads</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Call, WhatsApp, email, and update customer inquiry status.</p>
              </a>
              <a className="rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-soft" href="#products">
                <Package className="h-5 w-5 text-gold" />
                <p className="mt-3 font-black">Manage inventory</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">Update product prices, stock status, images, and featured devices.</p>
              </a>
            </div>
          </section>

          <section id="appointments" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Appointment queue</h2>
                <p className="mt-1 text-sm text-neutral-600">Showing the latest {appointments.length} bookings. New bookings start as pending, then you move them through confirmed, postponed, completed, cancelled, or no-show.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {appointmentStatusCounts.map(([label, count]) => (
                <div key={label} className="rounded-md border border-line bg-snow px-3 py-2">
                  <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
                  <p className="text-xl font-black">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 max-h-[820px] space-y-3 overflow-y-auto pr-2">
              {appointments.length ? appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-md bg-snow p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{appointment.leads?.customer_name ?? "Customer"} · {appointment.appointment_date ?? "Date not chosen"} · {appointment.appointment_time ?? "Time not chosen"}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-neutral-600">{statusLabel(appointmentStatuses, appointment.status)}</span>
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
                      <label className="text-xs font-bold uppercase text-neutral-500">Status<select className="field mt-1 bg-white" name="status" defaultValue={appointment.status}>
                        {appointmentStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Visit date<input className="field mt-1" name="appointment_date" type="date" defaultValue={appointment.appointment_date ?? ""} /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Visit time<select className="field mt-1" name="appointment_time" defaultValue={appointment.appointment_time ?? ""}>
                        <option value="">Choose time</option>
                        {appointment.appointment_time && !appointmentTimeSlots.includes(appointment.appointment_time as (typeof appointmentTimeSlots)[number]) ? (
                          <option value={appointment.appointment_time}>{appointment.appointment_time}</option>
                        ) : null}
                        {appointmentTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                      </select></label>
                    </div>
                    <label className="text-xs font-bold uppercase text-neutral-500">Internal note<textarea className="field mt-1 min-h-20" name="notes" defaultValue={appointment.notes ?? ""} placeholder="Example: customer asked to postpone to Friday, confirmed by WhatsApp" /></label>
                    <button className="btn-primary w-full px-4 py-2 md:w-fit" type="submit">Save appointment</button>
                  </form>
                </div>
              )) : <p className="text-sm text-neutral-600">No appointment bookings yet.</p>}
            </div>
          </section>

          <section id="leads" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div>
              <h2 className="text-xl font-black">Recent leads</h2>
              <p className="mt-1 text-sm text-neutral-600">Track every inquiry after you call or message the customer.</p>
            </div>
            <div className="mt-4 space-y-3">
              {leads.length ? leads.slice(0, 6).map((lead) => (
                <div key={lead.id} className="rounded-md bg-snow p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{lead.customer_name}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-neutral-600">{statusLabel(leadStatuses, lead.status)}</span>
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
              )) : <p className="text-sm text-neutral-600">No leads yet.</p>}
            </div>
          </section>
          <section id="add-product" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Add product</h2>
                <p className="mt-1 text-sm text-neutral-600">Create a new iPhone listing with price, payment plan, stock, warranty, and photos.</p>
              </div>
            </div>
            <form action={saveProduct} className="mt-5 grid gap-3 rounded-md bg-snow p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input className="field" name="model" placeholder="Model" required />
                <input className="field" name="slug" placeholder="slug" required />
                <input className="field" name="storage" placeholder="Storage" required />
                <select className="field" name="condition" defaultValue="Used"><option>Used</option><option>New</option></select>
                <input className="field" name="grade" placeholder="Grade" />
                <select className="field" name="stock_status" defaultValue="in_stock">{stockStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <input className="field" name="price" type="number" placeholder="Price" required />
                <input className="field" name="weekly_payment" type="number" placeholder="Weekly" required />
                <input className="field" name="down_payment_percent" type="number" placeholder="Deposit %" defaultValue={40} />
                <input className="field" name="installment_weeks" type="number" placeholder="Weeks" defaultValue={12} />
                <input className="field" name="quantity" type="number" placeholder="Qty" defaultValue={1} />
                <input className="field" name="warranty_months" type="number" placeholder="Warranty months" defaultValue={3} />
              </div>
              <textarea className="field min-h-20" name="image_urls" placeholder="Image URLs, one per line" />
              <textarea className="field min-h-20" name="description" placeholder="Description" />
              <label className="flex items-center gap-2 text-sm font-semibold"><input name="is_featured" type="checkbox" /> Featured</label>
              <button className="btn-primary w-full md:w-fit" type="submit">Add product</button>
            </form>
          </section>

          <section id="products" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Products</h2>
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
                        <p className="font-bold">{product.model} · {product.storage}</p>
                        <p className="mt-1 text-sm text-neutral-600">GH₵{product.price.toLocaleString()} · GH₵{product.weekly_payment.toLocaleString()} weekly · {product.stock_status} · Qty {product.quantity}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        {product.is_featured ? <span className="rounded-full bg-white px-3 py-1 text-neutral-700">Featured</span> : null}
                        <span className="rounded-full bg-white px-3 py-1 text-neutral-700">{product.image_urls.length} image{product.image_urls.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </summary>
                  <form action={saveProduct} className="mt-4 grid gap-3 border-t border-line pt-4">
                    <input type="hidden" name="id" value={product.id} />
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="text-xs font-bold uppercase text-neutral-500">Model<input className="field mt-1" name="model" defaultValue={product.model} required /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Slug<input className="field mt-1" name="slug" defaultValue={product.slug} required /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Storage<input className="field mt-1" name="storage" defaultValue={product.storage} required /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Condition<select className="field mt-1" name="condition" defaultValue={product.condition}><option>Used</option><option>New</option></select></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Grade<input className="field mt-1" name="grade" defaultValue={product.grade ?? ""} /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Stock<select className="field mt-1" name="stock_status" defaultValue={product.stock_status}>{stockStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Price<input className="field mt-1" name="price" type="number" defaultValue={product.price} required /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Weekly<input className="field mt-1" name="weekly_payment" type="number" defaultValue={product.weekly_payment} required /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Deposit %<input className="field mt-1" name="down_payment_percent" type="number" defaultValue={product.down_payment_percent} /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Weeks<input className="field mt-1" name="installment_weeks" type="number" defaultValue={product.installment_weeks} /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Quantity<input className="field mt-1" name="quantity" type="number" defaultValue={product.quantity} /></label>
                      <label className="text-xs font-bold uppercase text-neutral-500">Warranty months<input className="field mt-1" name="warranty_months" type="number" defaultValue={product.warranty_months} /></label>
                    </div>
                    <label className="text-xs font-bold uppercase text-neutral-500">Image URLs<textarea className="field mt-1 min-h-20" name="image_urls" defaultValue={product.image_urls.join("\n")} /></label>
                    <label className="text-xs font-bold uppercase text-neutral-500">Description<textarea className="field mt-1 min-h-20" name="description" defaultValue={product.description ?? ""} /></label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold"><input name="is_featured" type="checkbox" defaultChecked={product.is_featured} /> Featured</label>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary px-4 py-2" type="submit">Save product</button>
                      </div>
                    </div>
                  </form>
                  <form action={deleteProduct} className="mt-3">
                    <input type="hidden" name="id" value={product.id} />
                    <button className="text-sm font-bold text-danger" type="submit">Delete product</button>
                  </form>
                </details>
              ))}
            </div>
          </section>
            <section id="settings" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
              <Settings className="h-5 w-5 text-gold" />
              <h2 className="mt-3 text-xl font-black">Site settings</h2>
              <form action={saveSettings} className="mt-4 grid gap-3">
                {"id" in settings ? <input type="hidden" name="id" value={String(settings.id)} /> : null}
                <input className="field" name="brand_name" defaultValue={settings.brand_name} placeholder="Brand name" />
                <input className="field" name="phone" defaultValue={settings.phone ?? ""} placeholder="Phone" />
                <input className="field" name="whatsapp" defaultValue={settings.whatsapp ?? ""} placeholder="WhatsApp" />
                <input className="field" name="email" defaultValue={settings.email ?? ""} placeholder="Email" />
                <textarea className="field" name="address" defaultValue={settings.address ?? ""} placeholder="Address" />
                <input className="field" name="opening_hours" defaultValue={settings.opening_hours ?? ""} placeholder="Opening hours" />
                <input className="field" name="instagram_url" defaultValue={settings.instagram_url ?? ""} placeholder="Instagram URL" />
                <input className="field" name="facebook_url" defaultValue={settings.facebook_url ?? ""} placeholder="Facebook URL" />
                <input className="field" name="tiktok_url" defaultValue={settings.tiktok_url ?? ""} placeholder="TikTok URL" />
                <input className="field" name="google_maps_url" defaultValue={settings.google_maps_url ?? ""} placeholder="Google Maps URL" />
                <input className="field" name="business_registration" defaultValue={settings.business_registration ?? ""} placeholder="Business registration" />
                <button className="btn-primary" type="submit">Save settings</button>
              </form>
            </section>
            <section id="testimonials" className="admin-panel scroll-mt-8 rounded-lg border border-line bg-white p-5">
              <Star className="h-5 w-5 text-gold" />
              <h2 className="mt-3 text-xl font-black">Testimonials</h2>
              <p className="mt-2 text-sm text-neutral-600">{testimonials.length} featured testimonials</p>
            </section>
        </div>
          </div>
        </div>
      </div>
    </main>
  );
}
