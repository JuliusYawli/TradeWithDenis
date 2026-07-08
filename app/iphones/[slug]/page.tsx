import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { Footer } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { ProductCard } from "@/components/product-card";
import { ProductPriceCard } from "@/components/product-price-card";
import { getProduct, getPublicProducts, getPublicSiteSettings } from "@/lib/data";
import { stockImageForProduct } from "@/lib/iphone-pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? `${product.model} ${product.storage}` : "iPhone", description: product?.description ?? "iPhone product details" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [settings, product, allProducts] = await Promise.all([getPublicSiteSettings(), getProduct(slug), getPublicProducts()]);
  if (!product) notFound();

  const similar = allProducts.filter((item) => item.slug !== product.slug).slice(0, 3);
  const validImages = product.image_urls.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  const imageUrls = validImages.length ? validImages : [stockImageForProduct(product.model, product.storage, product.condition)];
  const stockLabel = product.stock_status.replace("_", " ");
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.model} ${product.storage}`,
    brand: product.brand,
    image: imageUrls,
    offers: { "@type": "Offer", price: product.price, priceCurrency: "GHS", availability: "https://schema.org/InStock" }
  };

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-8 sm:py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-[#f5f7fb] shadow-sm">
              <Image src={imageUrls[0]} alt={`${product.model} ${product.storage}`} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-red shadow-sm ring-1 ring-black/5 backdrop-blur">{stockLabel}</span>
                <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">{product.condition}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  <Image src={src} alt={product.model} fill className="object-contain" sizes="120px" />
                </div>
              ))}
            </div>
          </div>
          <section className="lg:pt-2">
            <p className="section-eyebrow">Verified device</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{product.model} {product.storage}</h1>
            <p className="mt-3 text-base text-neutral-600">{product.condition}{product.grade ? ` · Grade ${product.grade}` : ""} · {product.warranty_months} week warranty</p>
            {product.colors?.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">Available colors:</span>
                {product.colors.map((color) => (
                  <span key={color} className="badge-soft">{color}</span>
                ))}
              </div>
            ) : null}

            <ProductPriceCard product={product} />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="#reserve">Book shop appointment</Link>
              <a className="btn-secondary" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}?text=I%20am%20interested%20in%20${encodeURIComponent(product.model)}`}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-white p-4">
                <Smartphone className="h-5 w-5 text-red" />
                <p className="mt-2 text-sm font-medium text-ink">Inspect device</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <CalendarCheck className="h-5 w-5 text-red" />
                <p className="mt-2 text-sm font-medium text-ink">Confirm visit</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <ShieldCheck className="h-5 w-5 text-red" />
                <p className="mt-2 text-sm font-medium text-ink">Warranty support</p>
              </div>
            </div>
          </section>
        </div>

        <section id="reserve" className="mt-14 grid gap-8 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold">Book a shop visit</h2>
            <p className="mt-2 text-neutral-600">This does not complete a sale online. The customer visits the shop to inspect the device, confirm terms, and complete the order.</p>
          </div>
          <LeadForm product={product} />
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Similar products</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {similar.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
