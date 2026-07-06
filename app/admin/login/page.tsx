import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string }>;
}) {
  const params = await searchParams;
  const signedOut = params?.notice === "signed-out";
  const sessionExpired = params?.notice === "session-expired";

  return (
    <main className="grid min-h-screen place-items-center bg-snow px-4 py-10">
      <div className="w-full max-w-md">
        {signedOut ? (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-white p-4 text-sm text-emerald-800 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Logged out successfully</p>
              <p className="mt-1 text-emerald-700">Your admin session has been closed.</p>
            </div>
          </div>
        ) : null}
        {sessionExpired ? (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-yellow-200 bg-white p-4 text-sm text-yellow-800 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold">Session expired</p>
              <p className="mt-1 text-yellow-700">Your session was inactive for 5 minutes. Please log in again.</p>
            </div>
          </div>
        ) : null}
        <LoginForm />
      </div>
    </main>
  );
}
