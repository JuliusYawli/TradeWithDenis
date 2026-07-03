import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin";
import { products as seedProducts, siteSettings as seedSettings, testimonials as seedTestimonials } from "@/lib/seed";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Appointment, Lead, Product, SiteSettings, Testimonial, TestimonialRequest } from "@/lib/types";

const exportTypes = ["appointments", "leads", "products", "settings", "testimonials", "testimonial-requests"] as const;

type ExportType = (typeof exportTypes)[number];
type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type CsvValue = string | number | boolean | null | undefined | string[];
type CsvRow = Record<string, CsvValue>;
type CsvColumn = readonly [keyof CsvRow, string];
type LeadSummary = Pick<Lead, "customer_name" | "phone" | "email" | "preferred_contact_method" | "message" | "desired_payment_option">;
type AppointmentExportRow = Omit<Appointment, "leads"> & {
  leads?: LeadSummary | LeadSummary[] | null;
};
type SiteSettingsExportRow = SiteSettings & {
  created_at?: string;
  updated_at?: string;
};

function isExportType(value: string): value is ExportType {
  return exportTypes.includes(value as ExportType);
}

async function adminSupabase(request: Request): Promise<{ supabase: ServerSupabase | null; response?: NextResponse }> {
  if (!hasSupabaseEnv()) return { supabase: null };

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return { supabase: null, response: NextResponse.redirect(new URL("/admin/login", request.url)) };
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    return { supabase: null, response: NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url)) };
  }

  return { supabase };
}

function csvEscape(value: CsvValue) {
  const normalized = Array.isArray(value) ? value.join(" | ") : value ?? "";
  const text = String(normalized).replace(/\r?\n/g, " ").trim();
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(columns: CsvColumn[], rows: CsvRow[]) {
  const header = columns.map(([, label]) => csvEscape(label)).join(",");
  const body = rows.map((row) => columns.map(([key]) => csvEscape(row[key])).join(","));
  return [header, ...body].join("\n");
}

function csvResponse(filename: string, content: string) {
  return new NextResponse(`\uFEFF${content}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function firstLead(leads: AppointmentExportRow["leads"]) {
  return Array.isArray(leads) ? leads[0] : leads;
}

async function exportProducts(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase.from("products").select("*").order("created_at", { ascending: false })
    : { data: seedProducts, error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as Product[]).map((product) => ({
    id: product.id,
    slug: product.slug,
    brand: product.brand,
    model: product.model,
    storage: product.storage,
    condition: product.condition,
    grade: product.grade,
    price: product.price,
    down_payment_percent: product.down_payment_percent,
    weekly_payment: product.weekly_payment,
    installment_weeks: product.installment_weeks,
    stock_status: product.stock_status,
    quantity: product.quantity,
    warranty_months: product.warranty_months,
    is_featured: product.is_featured,
    image_urls: product.image_urls,
    description: product.description,
    created_at: product.created_at,
    updated_at: product.updated_at
  }));

  return toCsv([
    ["id", "ID"],
    ["slug", "Slug"],
    ["brand", "Brand"],
    ["model", "Model"],
    ["storage", "Storage"],
    ["condition", "Condition"],
    ["grade", "Grade"],
    ["price", "Price"],
    ["down_payment_percent", "Deposit percent"],
    ["weekly_payment", "Weekly payment"],
    ["installment_weeks", "Installment weeks"],
    ["stock_status", "Stock status"],
    ["quantity", "Quantity"],
    ["warranty_months", "Warranty months"],
    ["is_featured", "Featured"],
    ["image_urls", "Image URLs"],
    ["description", "Description"],
    ["created_at", "Created at"],
    ["updated_at", "Updated at"]
  ], rows);
}

async function exportLeads(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase.from("leads").select("*").order("created_at", { ascending: false })
    : { data: [] as Lead[], error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as Lead[]).map((lead) => ({
    id: lead.id,
    product_id: lead.product_id,
    customer_name: lead.customer_name,
    phone: lead.phone,
    email: lead.email,
    preferred_contact_method: lead.preferred_contact_method,
    desired_payment_option: lead.desired_payment_option,
    status: lead.status,
    message: lead.message,
    created_at: lead.created_at
  }));

  return toCsv([
    ["id", "ID"],
    ["product_id", "Product ID"],
    ["customer_name", "Customer name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["preferred_contact_method", "Preferred contact"],
    ["desired_payment_option", "Payment option"],
    ["status", "Status"],
    ["message", "Message"],
    ["created_at", "Created at"]
  ], rows);
}

async function exportAppointments(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase
      .from("appointments")
      .select("*, leads(customer_name, phone, email, preferred_contact_method, message, desired_payment_option)")
      .order("created_at", { ascending: false })
    : { data: [] as AppointmentExportRow[], error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as AppointmentExportRow[]).map((appointment) => {
    const lead = firstLead(appointment.leads);
    return {
      id: appointment.id,
      lead_id: appointment.lead_id,
      customer_name: lead?.customer_name,
      phone: lead?.phone,
      email: lead?.email,
      preferred_contact_method: lead?.preferred_contact_method,
      desired_payment_option: lead?.desired_payment_option,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      notes: appointment.notes,
      customer_message: lead?.message,
      created_at: appointment.created_at
    };
  });

  return toCsv([
    ["id", "ID"],
    ["lead_id", "Lead ID"],
    ["customer_name", "Customer name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["preferred_contact_method", "Preferred contact"],
    ["desired_payment_option", "Payment option"],
    ["appointment_date", "Appointment date"],
    ["appointment_time", "Appointment time"],
    ["status", "Status"],
    ["notes", "Internal notes"],
    ["customer_message", "Customer message"],
    ["created_at", "Created at"]
  ], rows);
}

async function exportSettings(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase.from("site_settings").select("*").order("created_at", { ascending: false })
    : { data: [seedSettings], error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as SiteSettingsExportRow[]).map((settings) => ({
    id: settings.id,
    brand_name: settings.brand_name,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    opening_hours: settings.opening_hours,
    instagram_url: settings.instagram_url,
    facebook_url: settings.facebook_url,
    tiktok_url: settings.tiktok_url,
    google_maps_url: settings.google_maps_url,
    business_registration: settings.business_registration,
    created_at: settings.created_at,
    updated_at: settings.updated_at
  }));

  return toCsv([
    ["id", "ID"],
    ["brand_name", "Brand name"],
    ["phone", "Phone"],
    ["whatsapp", "WhatsApp"],
    ["email", "Email"],
    ["address", "Address"],
    ["opening_hours", "Opening hours"],
    ["instagram_url", "Instagram"],
    ["facebook_url", "Facebook"],
    ["tiktok_url", "TikTok"],
    ["google_maps_url", "Google Maps"],
    ["business_registration", "Business registration"],
    ["created_at", "Created at"],
    ["updated_at", "Updated at"]
  ], rows);
}

async function exportTestimonials(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase.from("testimonials").select("*").order("created_at", { ascending: false })
    : { data: seedTestimonials, error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as Testimonial[]).map((testimonial) => ({
    id: testimonial.id,
    testimonial_request_id: testimonial.testimonial_request_id,
    appointment_id: testimonial.appointment_id,
    customer_name: testimonial.customer_name,
    location: testimonial.location,
    rating: testimonial.rating,
    quote: testimonial.quote,
    image_url: testimonial.image_url,
    is_featured: testimonial.is_featured,
    status: testimonial.status,
    product_model: testimonial.product_model,
    reviewed_at: testimonial.reviewed_at,
    created_at: testimonial.created_at,
    updated_at: testimonial.updated_at
  }));

  return toCsv([
    ["id", "ID"],
    ["testimonial_request_id", "Review request ID"],
    ["appointment_id", "Appointment ID"],
    ["customer_name", "Customer name"],
    ["location", "Location"],
    ["rating", "Rating"],
    ["quote", "Quote"],
    ["image_url", "Image URL"],
    ["is_featured", "Featured"],
    ["status", "Status"],
    ["product_model", "Product model"],
    ["reviewed_at", "Reviewed at"],
    ["created_at", "Created at"],
    ["updated_at", "Updated at"]
  ], rows);
}

async function exportTestimonialRequests(supabase: ServerSupabase | null) {
  const data = supabase
    ? await supabase.from("testimonial_requests").select("*").order("created_at", { ascending: false })
    : { data: [] as TestimonialRequest[], error: null };
  if (data.error) throw new Error(data.error.message);

  const rows = ((data.data ?? []) as TestimonialRequest[]).map((request) => ({
    id: request.id,
    appointment_id: request.appointment_id,
    lead_id: request.lead_id,
    customer_name: request.customer_name,
    customer_email: request.customer_email,
    status: request.status,
    sent_at: request.sent_at,
    submitted_at: request.submitted_at,
    reviewed_at: request.reviewed_at,
    created_at: request.created_at,
    updated_at: request.updated_at
  }));

  return toCsv([
    ["id", "ID"],
    ["appointment_id", "Appointment ID"],
    ["lead_id", "Lead ID"],
    ["customer_name", "Customer name"],
    ["customer_email", "Customer email"],
    ["status", "Status"],
    ["sent_at", "Sent at"],
    ["submitted_at", "Submitted at"],
    ["reviewed_at", "Reviewed at"],
    ["created_at", "Created at"],
    ["updated_at", "Updated at"]
  ], rows);
}

export async function GET(request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  if (!isExportType(type)) {
    return NextResponse.json({ error: "Unknown export type." }, { status: 404 });
  }

  const { supabase, response } = await adminSupabase(request);
  if (response) return response;

  try {
    const csv = await {
      appointments: exportAppointments,
      leads: exportLeads,
      products: exportProducts,
      settings: exportSettings,
      testimonials: exportTestimonials,
      "testimonial-requests": exportTestimonialRequests
    }[type](supabase);

    return csvResponse(`tradewithdennis-${type}-${todayStamp()}.csv`, csv);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed." }, { status: 500 });
  }
}
