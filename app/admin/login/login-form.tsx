"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!hasSupabaseEnv()) {
      setError("Add Supabase environment variables to enable admin login.");
      return;
    }
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <input className="field mt-6" name="email" type="email" placeholder="Email" required />
      <input className="field mt-3" name="password" type="password" placeholder="Password" required />
      {error ? <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <button className="btn-primary mt-4 w-full" type="submit">Sign in</button>
    </form>
  );
}
