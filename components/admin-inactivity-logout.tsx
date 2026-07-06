"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export function AdminInactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const resetTimeout = () => {
      lastActivityRef.current = Date.now();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const formData = new FormData();
        formData.set("next", "/admin/login?notice=session-expired");
        logoutAdmin(formData);
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return null;
}
