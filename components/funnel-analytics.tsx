"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { consentStorageKey } from "./cookie-consent";

function record(event: string, path: string) {
  if (localStorage.getItem(consentStorageKey) !== "accepted") return;
  const body = JSON.stringify({ event, path });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
  else void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
}

export function FunnelAnalytics() {
  const pathname = usePathname();
  const opened = useRef(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const event = pathname.startsWith("/iphones/") ? "product_view" : pathname === "/iphones" ? "catalog_view" : "page_view";
    record(event, pathname);
    const onConsent = (consentEvent: Event) => {
      if ((consentEvent as CustomEvent<string>).detail === "accepted") record(event, pathname);
    };
    window.addEventListener("twd-consent-change", onConsent);
    opened.current = false;
    return () => window.removeEventListener("twd-consent-change", onConsent);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const onFocus = (event: FocusEvent) => {
      const form = (event.target as HTMLElement | null)?.closest("form");
      if (!opened.current && form?.querySelector('[name="customer_name"]')) {
        opened.current = true;
        record("booking_started", pathname);
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [pathname]);

  return null;
}
