"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [selected, setSelected] = useState(0);
  const active = images[selected] ?? images[0];
  return (
    <div className="space-y-4" data-testid="product-gallery">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-[#f5f7fb] shadow-sm">
        <Image src={active} alt={alt} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 52vw" priority quality={85} />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3" role="list" aria-label="Product photos">
          {images.map((src, index) => (
            <button key={src} className={`relative aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm ${selected === index ? "border-gold ring-2 ring-gold/20" : "border-line"}`} type="button" onClick={() => setSelected(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={selected === index}>
              <Image src={src} alt="" fill className="object-contain" sizes="120px" quality={70} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
