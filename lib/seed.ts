import type { Product, SiteSettings, Testimonial } from "./types";

const image = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80";

export const siteSettings: SiteSettings = {
  brand_name: "TradeWithDennis",
  phone: "+233 54 370 9361",
  whatsapp: "+233 54 370 9361",
  email: "ampiawdennis5@gmail.com",
  address: "Circle Mall, Block C, Shop 27",
  opening_hours: "8:00 AM - 7:00 PM",
  instagram_url: "https://www.instagram.com/tradewithdennis1?utm_source=qr",
  facebook_url: "https://www.facebook.com/share/1F1FB8s6x3/?mibextid=wwXIfr",
  tiktok_url: "https://www.tiktok.com/@tradewithdennis?_r=1&_t=ZS-97gO9Qd1Q5A",
  google_maps_url: "https://maps.app.goo.gl/ey1DeFiVvcrZf6Lw8",
  business_registration: "BN120850225"
};

export const products: Product[] = [
  ["iphone-12-128gb-used", "iPhone 12", "128GB", "Used", null, 2850, 214, 3, true],
  ["iphone-13-pro-max-256gb-used", "iPhone 13 Pro Max", "256GB", "Used", null, 5850, 439, 3, true],
  ["iphone-14-pro-max-128gb-used", "iPhone 14 Pro Max", "128GB", "Used", null, 7000, 525, 6, true],
  ["iphone-15-pro-max-256gb-used-a-plus", "iPhone 15 Pro Max", "256GB", "Used", "A+", 8500, 638, 6, true],
  ["iphone-16-pro-max-256gb-used", "iPhone 16 Pro Max", "256GB", "Used", null, 10500, 788, 6, false],
  ["iphone-17-pro-max-256gb", "iPhone 17 Pro Max", "256GB", "New", null, 17900, 1343, 12, false]
].map(([slug, model, storage, condition, grade, price, weekly, warranty, featured], index) => ({
  id: String(index + 1),
  slug: String(slug),
  brand: "Apple",
  model: String(model),
  storage: String(storage),
  condition: String(condition),
  grade: grade ? String(grade) : null,
  price: Number(price),
  down_payment_percent: 40,
  weekly_payment: Number(weekly),
  installment_weeks: 12,
  stock_status: "in_stock",
  quantity: 2,
  image_urls: [image],
  description: "Carefully inspected Apple device with transparent payment terms and documented warranty support.",
  warranty_months: Number(warranty),
  is_featured: Boolean(featured),
  created_at: new Date(Date.now() - index * 86400000).toISOString()
}));

export const testimonials: Testimonial[] = [
  {
    id: "1",
    customer_name: "Ama B.",
    location: "Accra",
    rating: 5,
    quote: "Clear payment plan, quick responses, and the phone condition matched what I saw online.",
    image_url: null,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    customer_name: "Kwame A.",
    location: "Tema",
    rating: 5,
    quote: "The financing breakdown made it easy to decide before reserving.",
    image_url: null,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    customer_name: "Esi M.",
    location: "East Legon",
    rating: 5,
    quote: "I liked that I could check the price and book first, then test the iPhone properly at the shop before paying.",
    image_url: null,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    customer_name: "Nana K.",
    location: "Kasoa",
    rating: 5,
    quote: "They explained the warranty and payment plan clearly. The phone was ready when I arrived, so the whole process felt easy.",
    image_url: null,
    is_featured: true,
    created_at: new Date().toISOString()
  }
];
