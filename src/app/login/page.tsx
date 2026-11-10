import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/components/LoginScreen";

export const metadata: Metadata = { robots: { index: false } };

export default function LoginPage() {
  return <LoginScreen />;
}
