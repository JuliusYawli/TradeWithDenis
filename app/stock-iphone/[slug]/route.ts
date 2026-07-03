import { NextResponse } from "next/server";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function titleFromSlug(slug: string) {
  return slug
    .replace(/\.svg$/i, "")
    .split("-")
    .map((part) => {
      if (part === "iphone") return "iPhone";
      if (part === "pro") return "Pro";
      if (part === "max") return "Max";
      if (part === "plus") return "Plus";
      if (part === "new") return "New";
      if (part === "used") return "Used";
      if (part.endsWith("gb")) return part.toUpperCase();
      return part;
    })
    .join(" ");
}

function generation(slug: string) {
  return Number(slug.match(/iphone-(\d+)/)?.[1] ?? 16);
}

function colors(slug: string) {
  const gen = generation(slug);
  if (gen <= 11) return { body: "#1f2937", accent: "#64748b", screen: "#dbeafe" };
  if (gen === 12) return { body: "#0f172a", accent: "#2563eb", screen: "#e0f2fe" };
  if (gen === 13) return { body: "#1f3d35", accent: "#7dd3fc", screen: "#ecfeff" };
  if (gen === 14) return { body: "#312e81", accent: "#93c5fd", screen: "#eef2ff" };
  if (gen === 15) return { body: "#475569", accent: "#38bdf8", screen: "#f0f9ff" };
  if (gen === 16) return { body: "#0f3f9c", accent: "#60a5fa", screen: "#eff6ff" };
  return { body: "#111827", accent: "#93c5fd", screen: "#f8fafc" };
}

function cameras(slug: string) {
  const isPro = slug.includes("-pro");
  const gen = generation(slug);
  if (isPro) {
    return `
      <circle cx="304" cy="230" r="24" fill="#0b1220"/><circle cx="304" cy="230" r="10" fill="#94a3b8"/>
      <circle cx="366" cy="230" r="24" fill="#0b1220"/><circle cx="366" cy="230" r="10" fill="#94a3b8"/>
      <circle cx="334" cy="292" r="24" fill="#0b1220"/><circle cx="334" cy="292" r="10" fill="#94a3b8"/>
      <circle cx="366" cy="292" r="8" fill="#f8fafc" opacity=".8"/>
    `;
  }

  if (gen >= 16) {
    return `
      <circle cx="335" cy="222" r="25" fill="#0b1220"/><circle cx="335" cy="222" r="10" fill="#94a3b8"/>
      <circle cx="335" cy="294" r="25" fill="#0b1220"/><circle cx="335" cy="294" r="10" fill="#94a3b8"/>
      <circle cx="374" cy="258" r="8" fill="#f8fafc" opacity=".75"/>
    `;
  }

  if (gen >= 13) {
    return `
      <circle cx="310" cy="224" r="25" fill="#0b1220"/><circle cx="310" cy="224" r="10" fill="#94a3b8"/>
      <circle cx="365" cy="288" r="25" fill="#0b1220"/><circle cx="365" cy="288" r="10" fill="#94a3b8"/>
      <circle cx="365" cy="224" r="8" fill="#f8fafc" opacity=".75"/>
    `;
  }

  return `
    <circle cx="308" cy="225" r="24" fill="#0b1220"/><circle cx="308" cy="225" r="10" fill="#94a3b8"/>
    <circle cx="366" cy="225" r="24" fill="#0b1220"/><circle cx="366" cy="225" r="10" fill="#94a3b8"/>
    <circle cx="337" cy="285" r="8" fill="#f8fafc" opacity=".75"/>
  `;
}

function svg(slug: string) {
  const label = escapeXml(titleFromSlug(slug));
  const [lineOne, ...rest] = label.split(/ (?=\d+GB|New|Used)/);
  const lineTwo = escapeXml(rest.join(" "));
  const color = colors(slug);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${label} stock image">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eff6ff"/>
    </linearGradient>
    <linearGradient id="phone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color.accent}"/>
      <stop offset=".38" stop-color="${color.body}"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#1553c5" flood-opacity=".18"/>
    </filter>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="930" cy="140" r="220" fill="#dbeafe" opacity=".45"/>
  <circle cx="190" cy="760" r="190" fill="#bfdbfe" opacity=".35"/>
  <g filter="url(#shadow)">
    <rect x="214" y="130" width="260" height="600" rx="46" fill="url(#phone)"/>
    <rect x="238" y="154" width="212" height="552" rx="32" fill="${color.accent}" opacity=".16"/>
    <rect x="286" y="194" width="116" height="140" rx="32" fill="#ffffff" opacity=".22"/>
    ${cameras(slug)}
    <rect x="305" y="665" width="78" height="7" rx="4" fill="#e5e7eb" opacity=".75"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="550" y="92" width="294" height="666" rx="54" fill="#0b1220"/>
    <rect x="572" y="116" width="250" height="618" rx="38" fill="${color.screen}"/>
    <rect x="654" y="132" width="88" height="24" rx="12" fill="#0b1220"/>
    <path d="M572 570 C650 516 715 540 822 466 L822 734 L572 734 Z" fill="${color.accent}" opacity=".3"/>
    <path d="M572 472 C656 428 740 432 822 354 L822 734 L572 734 Z" fill="${color.body}" opacity=".16"/>
    <text x="697" y="386" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="#0b1220">${lineOne}</text>
    <text x="697" y="432" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#334155">${lineTwo}</text>
    <rect x="656" y="698" width="82" height="7" rx="4" fill="#0b1220" opacity=".7"/>
  </g>
  <g font-family="Inter, Arial, sans-serif" fill="#0b1220">
    <text x="600" y="818" text-anchor="middle" font-size="28" font-weight="800">Temporary stock image</text>
    <text x="600" y="852" text-anchor="middle" font-size="18" font-weight="600" fill="#64748b">Replace with real shop photos before launch</text>
  </g>
</svg>`;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  return new NextResponse(svg(slug), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
