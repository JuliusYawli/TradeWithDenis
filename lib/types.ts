export type Product = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  grade: string | null;
  price: number;
  down_payment_percent: number;
  weekly_payment: number;
  installment_weeks: number;
  stock_status: string;
  quantity: number;
  image_urls: string[];
  description: string | null;
  warranty_months: number;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
};

export type Testimonial = {
  id: string;
  testimonial_request_id?: string | null;
  appointment_id?: string | null;
  customer_name: string;
  location: string | null;
  rating: number;
  quote: string;
  image_url: string | null;
  is_featured: boolean;
  status?: "pending" | "approved" | "declined";
  product_model?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type TestimonialRequest = {
  id: string;
  appointment_id: string | null;
  lead_id: string | null;
  token: string;
  customer_name: string;
  customer_email: string | null;
  status: "created" | "sent" | "submitted" | "approved" | "declined";
  sent_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type Lead = {
  id: string;
  product_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  preferred_contact_method: string;
  message: string | null;
  desired_payment_option: string | null;
  status: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  lead_id: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  archived?: boolean | null;
  leads?: Pick<Lead, "customer_name" | "phone" | "email" | "preferred_contact_method" | "message" | "desired_payment_option"> | null;
};

export type SiteSettings = {
  id?: string;
  brand_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  opening_hours: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  google_maps_url: string | null;
  business_registration: string | null;
  homepage_hero_image_url?: string | null;
  homepage_hero_video_url?: string | null;
};
