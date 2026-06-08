"use client";

import { useLenis } from "@/hooks/useLenis";

export default function LenisProvider() {
  useLenis();
  return null;
}
