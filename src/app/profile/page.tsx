import type { Metadata } from "next";
import { ProfileScreen } from "@/features/auth/components/ProfileScreen";

export const metadata: Metadata = { robots: { index: false } };

export default function ProfilePage() {
  return <ProfileScreen />;
}
