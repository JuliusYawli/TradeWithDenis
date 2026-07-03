"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase";

export function AdminPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setMessage("");
    setError("");

    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are required.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Use the new password next time you sign in.");
  }

  return (
    <form action={onSubmit} className="mt-5 grid gap-4 rounded-lg border border-line bg-snow p-4">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div>
          <h3 className="font-semibold text-ink">Change admin password</h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600">Update the password for the currently signed-in admin account.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium uppercase text-neutral-500">
          New password
          <input className="field mt-1" name="password" type="password" minLength={8} autoComplete="new-password" required />
        </label>
        <label className="text-xs font-medium uppercase text-neutral-500">
          Confirm password
          <input className="field mt-1" name="confirm_password" type="password" minLength={8} autoComplete="new-password" required />
        </label>
      </div>

      {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit" type="submit" disabled={isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSaving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
