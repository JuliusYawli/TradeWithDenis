import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { financingFor, formatCedi } from "@/lib/finance";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const finance = financingFor(product);

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/iphones/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-neutral-100">
          <Image src={product.image_urls[0]} alt={`${product.model} ${product.storage}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      </Link>
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{product.stock_status.replace("_", " ")}</span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">{product.warranty_months} mo warranty</span>
          </div>
          <h3 className="text-lg font-bold">{product.model}</h3>
          <p className="text-sm text-neutral-600">{product.storage} · {product.condition}{product.grade ? ` · Grade ${product.grade}` : ""}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-md bg-snow p-3 text-sm">
          <div>
            <p className="text-neutral-500">Price</p>
            <p className="font-bold">{formatCedi(product.price)}</p>
          </div>
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
            <p className="font-bold">{product.installment_weeks} weeks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link className="btn-primary flex-1 py-2.5" href={`/iphones/${product.slug}`}>
            <BadgeCheck className="h-4 w-4" />
            Book visit
          </Link>
          <Link className="btn-secondary px-3 py-2.5" href="/warranty" aria-label="Warranty">
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
