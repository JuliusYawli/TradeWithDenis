import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "./supabase-env";
import { createServerSupabaseClient } from "./supabase-server";
import { products as seedProducts, siteSettings as seedSettings, testimonials as seedTestimonials } from "./seed";
import type { Appointment, Lead, Product, Testimonial } from "./types";

export const publicCacheTags = {
  products: "public-products",
  settings: "public-site-settings",
  testimonials: "public-testimonials"
} as const;

const publicRevalidateSeconds = 60;

function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

const getCachedPublicProducts = unstable_cache(
  async () => {
    if (!hasSupabaseEnv()) return seedProducts;
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    return (data as Product[] | null) ?? seedProducts;
  },
  ["public-products"],
  { revalidate: publicRevalidateSeconds, tags: [publicCacheTags.products] }
);

const getCachedPublicTestimonials = unstable_cache(
  async () => {
    if (!hasSupabaseEnv()) return seedTestimonials;
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });
    const approvedTestimonials = (data as Testimonial[] | null) ?? [];
    if (approvedTestimonials.length >= 4) return approvedTestimonials.slice(0, 4);

    const supplementalTestimonials = seedTestimonials.filter((seed) => (
      !approvedTestimonials.some((testimonial) => testimonial.customer_name === seed.customer_name && testimonial.quote === seed.quote)
    ));

    return [...approvedTestimonials, ...supplementalTestimonials].slice(0, 4);
  },
  ["public-testimonials"],
  { revalidate: publicRevalidateSeconds, tags: [publicCacheTags.testimonials] }
);

const getCachedAllPublicTestimonials = unstable_cache(
  async () => {
    if (!hasSupabaseEnv()) return seedTestimonials;
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data as Testimonial[] | null) ?? [];
  },
  ["all-public-testimonials"],
  { revalidate: publicRevalidateSeconds, tags: [publicCacheTags.testimonials] }
);

const getCachedPublicSiteSettings = unstable_cache(
  async () => {
    if (!hasSupabaseEnv()) return seedSettings;
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    return data ?? seedSettings;
  },
  ["public-site-settings"],
  { revalidate: publicRevalidateSeconds, tags: [publicCacheTags.settings] }
);

export async function getProducts() {
  noStore();
  if (!hasSupabaseEnv()) return seedProducts;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (data as Product[] | null) ?? seedProducts;
}

export async function getPublicProducts() {
  return getCachedPublicProducts();
}

export async function getProduct(slug: string) {
  const all = await getPublicProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  const all = await getPublicProducts();
  return all.filter((product) => product.is_featured).slice(0, 4);
}

export async function getTestimonials() {
  return getCachedPublicTestimonials();
}

export async function getAllPublicTestimonials() {
  return getCachedAllPublicTestimonials();
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

export async function getPublicSiteSettings() {
  return getCachedPublicSiteSettings();
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
