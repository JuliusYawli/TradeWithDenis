"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { saveProductInline } from "@/app/admin/actions";

type ProductFormNotice = {
  type: "success" | "error";
  message: string;
} | null;

export function AdminProductForm({
  children,
  submitLabel,
  pendingLabel,
  resetOnSuccess = false,
  className
}: {
  children: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  resetOnSuccess?: boolean;
  className: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [notice, setNotice] = useState<ProductFormNotice>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const form = formRef.current;
        if (!form || isPending) return;
        setNotice(null);
        const formData = new FormData(form);

        startTransition(async () => {
          const result = await saveProductInline(formData);
          setNotice({ type: result.ok ? "success" : "error", message: result.message });
          if (result.ok) {
            if (resetOnSuccess) form.reset();
            router.refresh();
          }
        });
      }}
    >
      {children}
      {notice ? (
        <div
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-danger/20 bg-danger/5 text-danger"
          }`}
          role="status"
        >
          {notice.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      ) : null}
      <button className="btn-primary w-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70 md:w-fit" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
