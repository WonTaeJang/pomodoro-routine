import type { Metadata } from "next";
import { PetPlayground } from "@/features/pet/components/PetPlayground";

export const metadata: Metadata = {
  description: "까미를 쓰다듬고 잠깐 쉬어가세요. 도트 강아지 돌봄 프로토타입.",
  robots: { index: false },
};

export default function PetPage() {
  return <PetPlayground />;
}
