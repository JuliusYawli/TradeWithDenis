"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  deleteProductInline,
  saveProductInline,
  saveSettingsInline,
  updateAppointmentStatusInline,
  updateLeadStatusInline,
  updateTestimonialStatusInline
} from "@/app/admin/actions";

type AdminFormResult = {
  ok: boolean;
  message: string;
};

type AdminActionKey =
  | "saveProduct"
  | "deleteProduct"
  | "updateLeadStatus"
  | "updateAppointmentStatus"
  | "saveSettings"
  | "updateTestimonialStatus";

type AdminFormNotice = {
  type: "success" | "error";
  message: string;
} | null;

export function AdminActionForm({
  actionKey,
  children,
  submitLabel,
  pendingLabel,
  resetOnSuccess = false,
  className,
  buttonClassName = "btn-primary w-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70 md:w-fit"
}: {
  actionKey: AdminActionKey;
  children: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  resetOnSuccess?: boolean;
  className: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [notice, setNotice] = useState<AdminFormNotice>(null);
  const [isPending, startTransition] = useTransition();
  const actions: Record<AdminActionKey, (formData: FormData) => Promise<AdminFormResult>> = {
    saveProduct: saveProductInline,
    deleteProduct: deleteProductInline,
    updateLeadStatus: updateLeadStatusInline,
    updateAppointmentStatus: updateAppointmentStatusInline,
    saveSettings: saveSettingsInline,
    updateTestimonialStatus: updateTestimonialStatusInline
  };

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
          const result = await actions[actionKey](formData);
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
      <button className={buttonClassName} type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
