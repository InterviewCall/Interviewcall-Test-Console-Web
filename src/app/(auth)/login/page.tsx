import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/features/auth/login-screen";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    // useSearchParams (for ?next=) needs a Suspense boundary under Cache Components.
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
