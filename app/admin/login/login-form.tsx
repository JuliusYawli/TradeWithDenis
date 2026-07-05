"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setSuccess(false);
    setIsSubmitting(true);
    if (!hasSupabaseEnv()) {
      setError("Add Supabase environment variables to enable admin login.");
      setIsSubmitting(false);
      return;
    }
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    });
    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    window.setTimeout(() => {
      router.push("/admin?toast=Welcome%20back.%20Your%20admin%20dashboard%20is%20ready.&toastTitle=Login%20successful&type=success");
      router.refresh();
    }, 700);
  }

  return (
    <form action={onSubmit} className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="border-b border-line bg-snow px-6 py-5">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-gold shadow-sm">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Admin login</h1>
        <p className="mt-1 text-sm leading-6 text-neutral-600">Sign in to manage products, appointments, leads, and reviews.</p>
      </div>

      <div className="p-6">
      <input className="field" name="email" type="email" placeholder="Email" required disabled={isSubmitting} />
      <input className="field mt-3" name="password" type="password" placeholder="Password" required disabled={isSubmitting} />
      {error ? <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Login successful</p>
            <p className="mt-0.5 text-emerald-700">Preparing your admin dashboard...</p>
          </div>
        </div>
      ) : null}
      <button className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      </div>
    </form>
  );
}
