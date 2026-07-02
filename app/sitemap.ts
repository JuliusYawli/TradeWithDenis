import type { MetadataRoute } from "next";
import { products } from "@/lib/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tradewithdenis.com";
  const routes = ["", "/iphones", "/contact", "/warranty", "/financing-terms", "/privacy", "/terms"];
  return [
    ...routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() })),
    ...products.map((product) => ({ url: `${siteUrl}/iphones/${product.slug}`, lastModified: new Date(product.created_at) }))
  ];
}
