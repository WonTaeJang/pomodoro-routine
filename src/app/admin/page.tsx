import type { Metadata } from "next";
import { AdminScreen } from "@/features/admin";

export const metadata: Metadata = { robots: { index: false } };

export default function AdminPage() {
  return <AdminScreen />;
}
