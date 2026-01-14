"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Poe2Page() {
  const router = useRouter();

  useEffect(() => {
    // 애드센스 심사 기간 동안 가이드 페이지 대신 아이템 필터로 리다이렉트
    router.replace("/poe2/item-filter/presets");
  }, [router]);

  return null;
}

