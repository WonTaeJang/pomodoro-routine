import type { Metadata } from "next";
import { AuthCallback } from "@/features/auth/components/AuthCallback";

export const metadata: Metadata = { robots: { index: false } };

export default function AuthCallbackPage() {
  return <AuthCallback />;
}
