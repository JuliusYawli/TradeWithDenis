"use client";

import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function AdminUnsavedChanges() {
  useEffect(() => {
    let dirty = false;
    const markDirty = (event: Event) => {
      if (event.target instanceof HTMLElement && event.target.closest(".admin-workspace form")) dirty = true;
    };
    const clearDirty = () => { dirty = false; };
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("input", markDirty);
    document.addEventListener("change", markDirty);
    document.addEventListener("submit", clearDirty);
    window.addEventListener("beforeunload", warn);
    return () => {
      document.removeEventListener("input", markDirty);
      document.removeEventListener("change", markDirty);
      document.removeEventListener("submit", clearDirty);
      window.removeEventListener("beforeunload", warn);
    };
  }, []);
  return null;
}

export function ConfirmDeleteButton({ itemName }: { itemName: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="admin-clickable inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/5 disabled:opacity-50"
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(`Delete ${itemName} permanently? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <Trash2 className="h-4 w-4" /> {pending ? "Deleting..." : "Delete product"}
    </button>
  );
}
