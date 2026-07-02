"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export function AdminToast({ message, type = "success" }: { message?: string; type?: "success" | "info" }) {
  const router = useRouter();
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;
    const timeout = window.setTimeout(() => {
      setVisible(false);
      router.replace("/admin", { scroll: false });
    }, 4200);
    return () => window.clearTimeout(timeout);
  }, [message, router]);

  if (!message || !visible) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className={type === "success" ? "mt-0.5 text-emerald-600" : "mt-0.5 text-gold"}>
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-ink">{type === "success" ? "Saved successfully" : "Admin notice"}</p>
          <p className="mt-1 text-sm leading-5 text-neutral-600">{message}</p>
        </div>
        <button
          className="rounded-md p-1 text-neutral-400 transition hover:bg-snow hover:text-ink"
          type="button"
          aria-label="Close notification"
          onClick={() => {
            setVisible(false);
            router.replace("/admin", { scroll: false });
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
