import { NextResponse } from "next/server";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminSupabaseClient();
  const { data: jobs, error } = await supabase.from("notification_outbox").select("id, lead_id, appointment_id, attempts").in("status", ["pending", "failed"]).lt("attempts", 5).order("created_at").limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let delivered = 0;
  for (const job of jobs ?? []) {
    const [{ data: lead }, { data: appointment }] = await Promise.all([
      supabase.from("leads").select("product_id, customer_name, phone, email, preferred_contact_method, desired_payment_option, message").eq("id", job.lead_id).single(),
      supabase.from("appointments").select("appointment_date, appointment_time").eq("id", job.appointment_id).single()
    ]);
    const { data: product } = lead?.product_id ? await supabase.from("products").select("brand, model, storage, price, weekly_payment").eq("id", lead.product_id).maybeSingle() : { data: null };
    try {
      if (!lead || !appointment) throw new Error("Booking data no longer exists.");
      await sendAppointmentNotifications({ lead, appointmentDate: appointment.appointment_date, appointmentTime: appointment.appointment_time, product });
      await supabase.from("notification_outbox").update({ status: "delivered", delivered_at: new Date().toISOString(), attempts: job.attempts + 1, last_error: null }).eq("id", job.id);
      delivered += 1;
    } catch (jobError) {
      await supabase.from("notification_outbox").update({ status: "failed", attempts: job.attempts + 1, last_error: jobError instanceof Error ? jobError.message.slice(0, 500) : "Notification failed" }).eq("id", job.id);
    }
  }
  return NextResponse.json({ processed: jobs?.length ?? 0, delivered });
}
