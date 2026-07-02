import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Eye, ShieldCheck } from "lucide-react";
import { financingFor, formatCedi } from "@/lib/finance";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const finance = financingFor(product);

  return (
    <article className="premium-card overflow-hidden">
      <Link href={`/iphones/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-snow to-white">
          <Image src={product.image_urls[0]} alt={`${product.model} ${product.storage}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-black capitalize text-red shadow-sm backdrop-blur">{product.stock_status.replace("_", " ")}</span>
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-xs font-black text-white shadow-sm backdrop-blur">{product.condition}</span>
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="badge-soft">{product.storage}</span>
            <span className="badge-soft">{product.warranty_months} mo warranty</span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-ink">{product.model}</h3>
          <p className="text-sm text-neutral-600">{product.grade ? `Grade ${product.grade}` : "Verified device"} · Qty {product.quantity}</p>
        </div>
        <div className="rounded-lg border border-line bg-snow p-3 text-sm">
          <div>
            <p className="text-neutral-500">Price</p>
            <p className="text-xl font-black text-ink">{formatCedi(product.price)}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
            <div>
              <p className="text-neutral-500">Weekly</p>
              <p className="font-bold">{formatCedi(product.weekly_payment)}</p>
            </div>
            <div>
              <p className="text-neutral-500">Deposit</p>
              <p className="font-bold">{formatCedi(finance.downPayment)}</p>
            </div>
            <div>
              <p className="text-neutral-500">Term</p>
              <p className="font-bold">{product.installment_weeks} wks</p>
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
        <p className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Complete purchase in shop after inspection.</p>
      </div>
    </article>
  );
}
