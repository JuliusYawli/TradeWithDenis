"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase-env";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function reviewRedirect(token: string, params: string): never {
  redirect(`/review/${token}?${params}`);
}

export async function submitTestimonial(formData: FormData) {
  const token = clean(formData.get("token"));
  const customerName = clean(formData.get("customer_name"));
  const location = clean(formData.get("location")) || null;
  const quote = clean(formData.get("quote"));
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));
  const hasPermission = formData.get("permission") === "on";

  if (!token) redirect("/");
  if (!hasSupabaseEnv()) reviewRedirect(token, "error=unavailable");
  if (!customerName || !quote || !hasPermission) reviewRedirect(token, "error=missing");

  const supabase = createAdminSupabaseClient();
  const { data: request, error } = await supabase
    .from("testimonial_requests")
    .select("id, appointment_id, customer_name, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !request) reviewRedirect(token, "error=invalid");
  if (!["created", "sent"].includes(request.status)) reviewRedirect(token, "status=already_submitted");

  const { error: testimonialError } = await supabase.from("testimonials").insert({
    testimonial_request_id: request.id,
    appointment_id: request.appointment_id,
    customer_name: customerName,
    location,
    rating,
    quote,
    image_url: null,
    is_featured: false,
    status: "pending"
  });

  if (testimonialError) reviewRedirect(token, "error=failed");

  const { error: requestError } = await supabase
    .from("testimonial_requests")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", request.id);

  if (requestError) reviewRedirect(token, "error=failed");

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/review/${token}?submitted=1`);
}
