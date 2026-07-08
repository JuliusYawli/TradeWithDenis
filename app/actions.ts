"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function submitLead(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const preferredColor = String(formData.get("preferred_color") || "").trim();
  const customerMessage = String(formData.get("message") || "").trim();
  const payload = {
    product_id: String(formData.get("product_id") || "") || null,
    customer_name: String(formData.get("customer_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email,
    preferred_contact_method: String(formData.get("preferred_contact_method") || "whatsapp"),
    desired_payment_option: String(formData.get("desired_payment_option") || "") || null,
    message: [preferredColor ? `Preferred color: ${preferredColor}.` : "", customerMessage].filter(Boolean).join(" ") || null
  };
  const appointmentDate = String(formData.get("appointment_date") || "") || null;
  const appointmentTime = String(formData.get("appointment_time") || "") || null;

  if (!payload.customer_name || !payload.phone || !payload.email) {
    throw new Error("Name, phone, and email are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("A valid email address is required.");
  }

  try {
    if (hasSupabaseEnv()) {
      const supabase = createAdminSupabaseClient();
      const { data: lead, error } = await supabase.from("leads").insert(payload).select("id").single();
      if (error) throw new Error(error.message);

      const { error: appointmentError } = await supabase.from("appointments").insert({
        lead_id: lead.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: "Customer requested an in-shop appointment from the website. No sale is completed online."
      });
      if (appointmentError) throw new Error(appointmentError.message);

      const { data: product } = payload.product_id
        ? await supabase
            .from("products")
            .select("brand, model, storage, price, weekly_payment")
            .eq("id", payload.product_id)
            .maybeSingle()
        : { data: null };

      await sendAppointmentNotifications({
        lead: payload,
        appointmentDate,
        appointmentTime,
        product
      });
    }
  } catch (error) {
    console.error("Appointment booking failed", error);
    try {
      await sendAppointmentNotifications({
        lead: payload,
        appointmentDate,
        appointmentTime,
        product: null
      });
    } catch (notificationError) {
      console.error("Fallback appointment notification failed", notificationError);
    }
    redirect("/appointment-confirmed?status=manual-follow-up");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/appointment-confirmed");
}
