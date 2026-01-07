"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ItemFilterPage() {
  const router = useRouter();

  useEffect(() => {
    // 아이템 필터 기본 페이지 접근 시 첫 번째 탭(프리셋)으로 리다이렉트
    router.replace("/poe2/item-filter/presets");
  }, [router]);

  return null;
}
