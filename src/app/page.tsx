import type { Metadata } from "next";
import { Showcase } from "@/components/showcase";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <Showcase />;
}
