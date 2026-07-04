import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, ShieldCheck } from "lucide-react";
import { financingFor, formatCedi } from "@/lib/finance";
import { stockImageForProduct } from "@/lib/iphone-pricing";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const finance = financingFor(product);
  const imageUrl = product.image_urls[0] || stockImageForProduct(product.model, product.storage, product.condition);
  const hasRealPhoto = product.image_urls.length > 0;
  const stockLabel = product.stock_status.replace("_", " ");
  const conditionLabel = product.grade ? `${product.condition} / Grade ${product.grade}` : product.condition;

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-soft">
      <Link href={`/iphones/${product.slug}`} className="block" aria-label={`View ${product.model} ${product.storage}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f7fb]">
          <Image
            src={imageUrl}
            alt={`${product.model} ${product.storage}`}
            fill
            className={`object-cover transition duration-500 group-hover:scale-[1.03] ${hasRealPhoto ? "" : "p-4 sm:p-6"}`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-red shadow-sm ring-1 ring-black/5 backdrop-blur">{stockLabel}</span>
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">{product.warranty_months} mo warranty</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/20 to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-black/5 backdrop-blur sm:inline-flex">
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="badge-soft">{product.storage}</span>
            <span className="badge-soft">{conditionLabel}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">{product.model}</h3>
            <p className="mt-1 text-sm text-neutral-600">Verified stock · Qty {product.quantity}</p>
          </div>
        </div>
        <div className="border-y border-line py-4 text-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Cash price</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{formatCedi(product.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Weekly</p>
              <p className="mt-1 text-lg font-semibold text-red">{formatCedi(product.weekly_payment)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-neutral-500">Deposit</p>
              <p className="font-medium text-ink">{formatCedi(finance.downPayment)}</p>
            </div>
            <div>
              <p className="text-neutral-500">Term</p>
              <p className="font-medium text-ink">{product.installment_weeks} weeks</p>
            </div>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Link className="btn-primary flex-1 py-2.5" href={`/iphones/${product.slug}`}>
            <BadgeCheck className="h-4 w-4" />
            Book visit
          </Link>
          <Link className="btn-secondary px-3 py-2.5" href={`/iphones/${product.slug}`} aria-label={`View ${product.model}`}>
            <Eye className="h-4 w-4" />
            <span className="sm:hidden">View details</span>
          </Link>
        </div>
        <p className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Inspect and complete payment in shop.</p>
      </div>
    </article>
  );
}
