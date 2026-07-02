"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/admin";
import { isAppointmentTimeSlot } from "@/lib/appointment-times";
import { sendAppointmentUpdateNotification } from "@/lib/notifications";
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

export async function logoutAdmin(formData: FormData) {
  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect(safePublicPath(formData.get("next")));
}

export async function saveProduct(formData: FormData) {
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
  adminToast(id ? "Product updated." : "Product added.", "products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/iphones");
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
    .select("appointment_date, appointment_time, status, leads(customer_name, email)")
    .eq("id", id)
    .maybeSingle();

  const lead = Array.isArray(appointment?.leads) ? appointment.leads[0] : appointment?.leads;
  if (lead) {
    await sendAppointmentUpdateNotification({
      lead,
      status: appointment?.status ?? status,
      appointmentDate: appointment?.appointment_date ?? payload.appointment_date,
      appointmentTime: appointment?.appointment_time ?? payload.appointment_time
    });
  }

  revalidatePath("/admin");
  adminToast("Appointment updated. Customer notification was attempted if an email exists.", "appointments");
}

export async function saveSettings(formData: FormData) {
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
  adminToast("Site settings saved.", "settings");
}
