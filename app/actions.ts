"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { BookingValidationError, parseBookingForm } from "@/lib/booking";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function submitLead(formData: FormData) {
  let booking;
  let leadId = "";
  let product: Parameters<typeof sendAppointmentNotifications>[0]["product"] = null;
  try {
    booking = parseBookingForm(formData);
  } catch (error) {
    if (error instanceof BookingValidationError) redirect("/appointment-confirmed?status=invalid");
    throw error;
  }
  const { lead: payload, appointmentDate, appointmentTime } = booking;

  if (!hasSupabaseEnv()) redirect("/appointment-confirmed?status=manual-follow-up");

  try {
    const supabase = createAdminSupabaseClient();
    const requestHeaders = await headers();
    const rateLimitSecret = process.env.BOOKING_RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const fingerprint = (kind: string, value: string) => createHash("sha256")
      .update(`${rateLimitSecret}:${kind}:${value}`)
      .digest("hex");
    const rateLimitKeys = [
      fingerprint("email", payload.email),
      fingerprint("phone", payload.phone.replace(/\D/g, ""))
    ];
    if (process.env.VERCEL === "1") {
      const vercelForwardedFor = requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
      if (vercelForwardedFor) rateLimitKeys.push(fingerprint("ip", vercelForwardedFor));
    }
    const { data, error } = await supabase.rpc("create_public_booking", {
      p_rate_limit_keys: rateLimitKeys,
      p_product_id: payload.product_id,
      p_customer_name: payload.customer_name,
      p_phone: payload.phone,
      p_email: payload.email,
      p_preferred_contact_method: payload.preferred_contact_method,
      p_desired_payment_option: payload.desired_payment_option,
      p_message: payload.message,
      p_appointment_date: appointmentDate,
      p_appointment_time: appointmentTime
    });
    if (error) throw new Error(error.message);
    leadId = String(data);

    const productResult = payload.product_id
      ? await supabase
          .from("products")
          .select("brand, model, storage, price, weekly_payment")
          .eq("id", payload.product_id)
          .maybeSingle()
      : { data: null };
    product = productResult.data;
  } catch (error) {
    console.error("Appointment booking failed", error);
    redirect("/appointment-confirmed?status=manual-follow-up");
  }

  try {
    await sendAppointmentNotifications({ lead: payload, appointmentDate, appointmentTime, product });
    const supabase = createAdminSupabaseClient();
    await supabase.from("notification_outbox").update({ status: "delivered", delivered_at: new Date().toISOString(), attempts: 1 }).eq("lead_id", leadId);
  } catch (error) {
    console.error("Appointment notification queued for retry", error);
  }

  if (hasSupabaseEnv()) {
    const supabase = createAdminSupabaseClient();
    await supabase.from("analytics_events").insert({ event_name: "booking_submitted", path: "/appointment-confirmed" });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/appointment-confirmed");
}
