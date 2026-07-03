"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/admin";
import { isAppointmentTimeSlot } from "@/lib/appointment-times";
import { sendAppointmentUpdateNotification, sendTestimonialRequestNotification } from "@/lib/notifications";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function adminClient() {
  if (!hasSupabaseEnv()) throw new Error("Supabase environment variables are required for admin mutations.");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  if (!isAllowedAdminEmail(data.user.email)) redirect("/admin/login?error=unauthorized");
  return supabase;
}

function safePublicPath(value: FormDataEntryValue | null) {
  const path = String(value || "/");
  if (path === "/admin/login") return path;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/admin")) return "/";
  return path;
}

function imageUrls(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
}

type AdminActionResult = {
  ok: boolean;
  message: string;
};

function adminToast(message: string, section?: string) {
  const target = `/admin?toast=${encodeURIComponent(message)}&type=success`;
  redirect(section ? `${target}#${section}` : target);
}

function siteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000");
  return value.replace(/\/$/, "");
}

function reviewToken() {
  return randomBytes(32).toString("hex");
}

type AdminSupabase = Awaited<ReturnType<typeof adminClient>>;
type ReviewRequestResult = "sent" | "already_sent" | "no_email" | "failed";

async function sendCompletedVisitReviewRequest({
  supabase,
  appointmentId,
  leadId,
  lead
}: {
  supabase: AdminSupabase;
  appointmentId: string;
  leadId: string | null;
  lead: { customer_name: string; email: string | null };
}): Promise<ReviewRequestResult> {
  if (!lead.email) return "no_email";

  const { data: existing, error: existingError } = await supabase
    .from("testimonial_requests")
    .select("id, token, status, sent_at")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (existingError) {
    console.error(existingError);
    return "failed";
  }

  if (existing?.sent_at || ["submitted", "approved", "declined"].includes(String(existing?.status))) {
    return "already_sent";
  }

  const token = existing?.token ?? reviewToken();
  let requestId = existing?.id as string | undefined;

  if (!requestId) {
    const { data: inserted, error: insertError } = await supabase
      .from("testimonial_requests")
      .insert({
        appointment_id: appointmentId,
        lead_id: leadId,
        token,
        customer_name: lead.customer_name,
        customer_email: lead.email,
        status: "created"
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);
      return "failed";
    }

    requestId = inserted.id;
  }

  try {
    await sendTestimonialRequestNotification({
      lead,
      reviewUrl: `${siteUrl()}/review/${token}`
    });
  } catch {
    return "failed";
  }

  const { error: updateError } = await supabase
    .from("testimonial_requests")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) {
    console.error(updateError);
    return "failed";
  }

  return "sent";
}

export async function logoutAdmin(formData: FormData) {
  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect(safePublicPath(formData.get("next")));
}

async function persistProduct(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const payload = {
    slug: String(formData.get("slug") || ""),
    model: String(formData.get("model") || ""),
    storage: String(formData.get("storage") || ""),
    condition: String(formData.get("condition") || "Used"),
    grade: String(formData.get("grade") || "") || null,
    price: Number(formData.get("price") || 0),
    down_payment_percent: Number(formData.get("down_payment_percent") || 40),
    weekly_payment: Number(formData.get("weekly_payment") || 0),
    installment_weeks: Number(formData.get("installment_weeks") || 12),
    stock_status: String(formData.get("stock_status") || "in_stock"),
    quantity: Number(formData.get("quantity") || 1),
    image_urls: imageUrls(formData.get("image_urls")),
    description: String(formData.get("description") || "") || null,
    warranty_months: Number(formData.get("warranty_months") || 3),
    is_featured: formData.get("is_featured") === "on"
  };

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/iphones");
  return { id, message: id ? "Product updated." : "Product added." };
}

export async function saveProduct(formData: FormData) {
  const result = await persistProduct(formData);
  adminToast(result.message, "products");
}

export async function saveProductInline(formData: FormData): Promise<AdminActionResult> {
  try {
    const result = await persistProduct(formData);
    return { ok: true, message: result.message };
  } catch (error) {
    console.error("Product save failed", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Product could not be saved."
    };
  }
}

export async function deleteProduct(formData: FormData) {
  await persistDeleteProduct(formData);
  adminToast("Product deleted.", "products");
}

async function persistDeleteProduct(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Product id is required.");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/iphones");
}

export async function deleteProductInline(formData: FormData): Promise<AdminActionResult> {
  try {
    await persistDeleteProduct(formData);
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    console.error("Product delete failed", error);
    return { ok: false, message: error instanceof Error ? error.message : "Product could not be deleted." };
  }
}

export async function updateLeadStatus(formData: FormData) {
  await persistLeadStatus(formData);
  adminToast("Lead status updated.", "leads");
}

async function persistLeadStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  if (!id) throw new Error("Lead id is required.");
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateLeadStatusInline(formData: FormData): Promise<AdminActionResult> {
  try {
    await persistLeadStatus(formData);
    return { ok: true, message: "Lead status updated." };
  } catch (error) {
    console.error("Lead status update failed", error);
    return { ok: false, message: error instanceof Error ? error.message : "Lead status could not be updated." };
  }
}

export async function updateAppointmentStatus(formData: FormData) {
  const message = await persistAppointmentStatus(formData);
  adminToast(message, "appointments");
}

async function persistAppointmentStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  if (!id) throw new Error("Appointment id is required.");
  const appointmentTime = String(formData.get("appointment_time") || "");
  const payload = {
    status,
    appointment_date: String(formData.get("appointment_date") || "") || null,
    appointment_time: isAppointmentTimeSlot(appointmentTime) ? appointmentTime : null,
    notes: String(formData.get("notes") || "") || null
  };
  const { error } = await supabase.from("appointments").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, lead_id, appointment_date, appointment_time, status, leads(customer_name, email)")
    .eq("id", id)
    .maybeSingle();

  const lead = Array.isArray(appointment?.leads) ? appointment.leads[0] : appointment?.leads;
  let reviewResult: ReviewRequestResult | null = null;

  if (lead) {
    if ((appointment?.status ?? status) === "completed") {
      reviewResult = await sendCompletedVisitReviewRequest({
        supabase,
        appointmentId: appointment?.id ?? id,
        leadId: appointment?.lead_id ?? null,
        lead
      });
    } else {
      await sendAppointmentUpdateNotification({
        lead,
        status: appointment?.status ?? status,
        appointmentDate: appointment?.appointment_date ?? payload.appointment_date,
        appointmentTime: appointment?.appointment_time ?? payload.appointment_time
      });
    }
  }

  revalidatePath("/admin");
  if (reviewResult === "sent") {
    return "Appointment completed. Review request sent to the customer.";
  }
  if (reviewResult === "already_sent") {
    return "Appointment updated. Review request had already been sent.";
  }
  if (reviewResult === "no_email") {
    return "Appointment updated. No customer email was available for a review request.";
  }
  if (reviewResult === "failed") {
    return "Appointment updated, but the review request could not be sent.";
  }
  return "Appointment updated. Customer notification was attempted if an email exists.";
}

export async function updateAppointmentStatusInline(formData: FormData): Promise<AdminActionResult> {
  try {
    const message = await persistAppointmentStatus(formData);
    return { ok: true, message };
  } catch (error) {
    console.error("Appointment update failed", error);
    return { ok: false, message: error instanceof Error ? error.message : "Appointment could not be updated." };
  }
}

export async function saveSettings(formData: FormData) {
  await persistSettings(formData);
  adminToast("Site settings saved.", "settings");
}

async function persistSettings(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const payload = {
    brand_name: String(formData.get("brand_name") || "TradeWithDenis"),
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    address: String(formData.get("address") || "") || null,
    opening_hours: String(formData.get("opening_hours") || "") || null,
    instagram_url: String(formData.get("instagram_url") || "") || null,
    facebook_url: String(formData.get("facebook_url") || "") || null,
    tiktok_url: String(formData.get("tiktok_url") || "") || null,
    google_maps_url: String(formData.get("google_maps_url") || "") || null,
    business_registration: String(formData.get("business_registration") || "") || null
  };

  const query = id
    ? supabase.from("site_settings").update(payload).eq("id", id)
    : supabase.from("site_settings").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveSettingsInline(formData: FormData): Promise<AdminActionResult> {
  try {
    await persistSettings(formData);
    return { ok: true, message: "Site settings saved." };
  } catch (error) {
    console.error("Site settings save failed", error);
    return { ok: false, message: error instanceof Error ? error.message : "Site settings could not be saved." };
  }
}

export async function updateTestimonialStatus(formData: FormData) {
  const message = await persistTestimonialStatus(formData);
  adminToast(message, "testimonials");
}

async function persistTestimonialStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["approved", "declined"].includes(status)) throw new Error("A valid testimonial status is required.");

  const isApproved = status === "approved";
  const payload = {
    status,
    is_featured: isApproved && formData.get("is_featured") === "on",
    reviewed_at: new Date().toISOString()
  };

  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .update(payload)
    .eq("id", id)
    .select("testimonial_request_id")
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (testimonial?.testimonial_request_id) {
    const { error: requestError } = await supabase
      .from("testimonial_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", testimonial.testimonial_request_id);

    if (requestError) throw new Error(requestError.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return isApproved ? "Testimonial approved." : "Testimonial declined.";
}

export async function updateTestimonialStatusInline(formData: FormData): Promise<AdminActionResult> {
  try {
    const message = await persistTestimonialStatus(formData);
    return { ok: true, message };
  } catch (error) {
    console.error("Testimonial update failed", error);
    return { ok: false, message: error instanceof Error ? error.message : "Testimonial could not be updated." };
  }
}
