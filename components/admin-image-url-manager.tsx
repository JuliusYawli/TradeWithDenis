"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Trash2 } from "lucide-react";

function parseUrls(value: string) {
  return value.split("\n").map((url) => url.trim()).filter(Boolean);
}

export function AdminImageUrlManager({ defaultUrls = [] }: { defaultUrls?: string[] }) {
  const [value, setValue] = useState(defaultUrls.join("\n"));
  const urls = parseUrls(value);

  function update(next: string[]) {
    setValue(next.join("\n"));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= urls.length) return;
    const next = [...urls];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  return (
    <div className="grid gap-3">
      {urls.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="aspect-[4/3] bg-snow bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(url).slice(1, -1)})` }} role="img" aria-label={`Product image ${index + 1}`} />
              <div className="flex items-center justify-between gap-2 p-2">
                <span className="truncate text-xs font-medium text-neutral-600">{index === 0 ? "Cover image" : `Image ${index + 1}`}</span>
                <div className="flex gap-1">
                  <button className="rounded-md p-2 text-neutral-600 hover:bg-snow disabled:opacity-30" type="button" aria-label="Move image left" disabled={index === 0} onClick={() => move(index, -1)}><ArrowLeft className="h-4 w-4" /></button>
                  <button className="rounded-md p-2 text-neutral-600 hover:bg-snow disabled:opacity-30" type="button" aria-label="Move image right" disabled={index === urls.length - 1} onClick={() => move(index, 1)}><ArrowRight className="h-4 w-4" /></button>
                  <button className="rounded-md p-2 text-danger hover:bg-danger/5" type="button" aria-label="Remove image" onClick={() => update(urls.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-line bg-snow p-4 text-sm text-neutral-600">
          <ImageIcon className="h-5 w-5 text-gold" /> No images added yet. Upload a product photo or paste a URL below.
        </div>
      )}
      <label className="text-xs font-medium uppercase text-neutral-500">Image URLs
        <textarea className="field mt-1 min-h-20" name="image_urls" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Uploaded photo URLs appear here. One URL per line." />
      </label>
      {urls.length > 1 ? <p className="text-xs text-neutral-500">The first image is the catalog cover. Use the arrows to reorder images.</p> : null}
    </div>
  );
}
