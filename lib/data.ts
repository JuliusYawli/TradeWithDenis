import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseEnv } from "./supabase-env";
import { createServerSupabaseClient } from "./supabase-server";
import { products as seedProducts, siteSettings as seedSettings, testimonials as seedTestimonials } from "./seed";
import type { Appointment, Lead, Product } from "./types";

export async function getProducts() {
  noStore();
  if (!hasSupabaseEnv()) return seedProducts;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (data as Product[] | null) ?? seedProducts;
}

export async function getProduct(slug: string) {
  const all = await getProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  const all = await getProducts();
  return all.filter((product) => product.is_featured).slice(0, 4);
}

export async function getTestimonials() {
  noStore();
  if (!hasSupabaseEnv()) return seedTestimonials;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("created_at", { ascending: false });
  return data ?? seedTestimonials;
}

export async function getAdminTestimonials() {
  noStore();
  if (!hasSupabaseEnv()) return seedTestimonials.map((testimonial) => ({ ...testimonial, status: "approved" as const }));
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

export async function getSiteSettings() {
  noStore();
  if (!hasSupabaseEnv()) return seedSettings;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return data ?? seedSettings;
}

export async function getLeads() {
  noStore();
  if (!hasSupabaseEnv()) return [] as Lead[];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(20);
  return (data as Lead[] | null) ?? [];
}

export async function getAppointments() {
  noStore();
  if (!hasSupabaseEnv()) return [] as Appointment[];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("appointments")
    .select("*, leads(customer_name, phone, email, preferred_contact_method, message, desired_payment_option)")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Appointment[] | null) ?? [];
}
