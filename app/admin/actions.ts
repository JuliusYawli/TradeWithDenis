"use server";

import { randomBytes } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/admin";
import { isAppointmentTimeSlot } from "@/lib/appointment-times";
import { publicCacheTags } from "@/lib/data";
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
  const next = safePublicPath(formData.get("next"));
  redirect(next === "/admin/login" ? "/admin/login?notice=signed-out" : next);
}

export async function saveProduct(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");

  const slug = String(formData.get("slug") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const storage = String(formData.get("storage") || "").trim();
  const price = Number(formData.get("price") || 0);
  const weekly_payment = Number(formData.get("weekly_payment") || 0);

  if (!slug || !model || !storage || isNaN(price) || isNaN(weekly_payment) || price <= 0 || weekly_payment <= 0) {
    throw new Error("Please fill in all required fields: Model, Slug, Storage, Price, and Weekly payment (must be numbers greater than 0)");
  }

  const payload = {
    slug,
    model,
    storage,
    condition: String(formData.get("condition") || "Used"),
    grade: String(formData.get("grade") || "") || null,
    price,
    down_payment_percent: Number(formData.get("down_payment_percent") || 40),
    weekly_payment,
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
    if (error) throw new Error(`Update failed: ${error.message}`);
  } else {
    const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (existing) throw new Error("This slug already exists. Please use a unique slug.");
    const { error } = await supabase.from("products").insert(payload);
    if (error) throw new Error(`Insert failed: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/iphones");
  revalidatePath("/");
  revalidateTag(publicCacheTags.products);
  adminToast(id ? "Product updated." : "Product added.", "products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { error: leadError } = await supabase.from("leads").update({ product_id: null }).eq("product_id", id);
  if (leadError) throw new Error(leadError.message);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/iphones");
  revalidatePath("/");
  revalidateTag(publicCacheTags.products);
  adminToast("Product deleted.", "products");
}

export async function updateLeadStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  if (!id) return;
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  adminToast("Lead status updated.", "leads");
}

export async function updateAppointmentStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  if (!id) return;
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
    adminToast("Appointment completed. Review request sent to the customer.", "appointments");
  } else if (reviewResult === "already_sent") {
    adminToast("Appointment updated. Review request had already been sent.", "appointments");
  } else if (reviewResult === "no_email") {
    adminToast("Appointment updated. No customer email was available for a review request.", "appointments");
  } else if (reviewResult === "failed") {
    adminToast("Appointment updated, but the review request could not be sent.", "appointments");
  } else {
    adminToast("Appointment updated. Customer notification was attempted if an email exists.", "appointments");
  }
}

export async function saveSettings(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const payload = {
    brand_name: String(formData.get("brand_name") || "TradeWithDennis"),
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    address: String(formData.get("address") || "") || null,
    opening_hours: String(formData.get("opening_hours") || "") || null,
    instagram_url: String(formData.get("instagram_url") || "") || null,
    facebook_url: String(formData.get("facebook_url") || "") || null,
    tiktok_url: String(formData.get("tiktok_url") || "") || null,
    google_maps_url: String(formData.get("google_maps_url") || "") || null,
    homepage_hero_image_url: String(formData.get("homepage_hero_image_url") || "") || null,
    homepage_hero_video_url: String(formData.get("homepage_hero_video_url") || "") || null,
    business_registration: String(formData.get("business_registration") || "") || null
  };

  const query = id
    ? supabase.from("site_settings").update(payload).eq("id", id)
    : supabase.from("site_settings").insert(payload);
  const { error } = await query;
  if (error) {
    const fallbackPayload = {
      brand_name: payload.brand_name,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      email: payload.email,
      address: payload.address,
      opening_hours: payload.opening_hours,
      instagram_url: payload.instagram_url,
      facebook_url: payload.facebook_url,
      tiktok_url: payload.tiktok_url,
      google_maps_url: payload.google_maps_url,
      homepage_hero_image_url: payload.homepage_hero_image_url,
      homepage_hero_video_url: payload.homepage_hero_video_url,
      business_registration: payload.business_registration
    };
    const fallbackQuery = id
      ? supabase.from("site_settings").update(fallbackPayload).eq("id", id)
      : supabase.from("site_settings").insert(fallbackPayload);
    const fallbackResult = await fallbackQuery;
    if (fallbackResult.error) throw new Error(fallbackResult.error.message);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidateTag(publicCacheTags.settings);
    adminToast("Site settings saved. Add the homepage hero image database column before saving the hero image.", "settings");
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag(publicCacheTags.settings);
  adminToast("Site settings saved.", "settings");
}

export async function updateTestimonialStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["approved", "declined"].includes(status)) return;

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
  revalidateTag(publicCacheTags.testimonials);
  adminToast(isApproved ? "Testimonial approved." : "Testimonial declined.", "testimonials");
}
