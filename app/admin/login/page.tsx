import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-snow px-4">
      <LoginForm />
    </main>
  );
}
