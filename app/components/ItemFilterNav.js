"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ItemFilterNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "presets", name: "프리셋", path: "/poe2/item-filter/presets" },
    { id: "quick-filters", name: "빠른 설정", path: "/poe2/item-filter/quick-filters" },
    { id: "tier-lists", name: "티어리스트", path: "/poe2/item-filter/tier-lists" },
    { id: "custom-rules", name: "커스텀", path: "/poe2/item-filter/custom-rules" },
    { id: "sound-manager", name: "사운드", path: "/poe2/item-filter/sound-manager" },
    { id: "preview", name: "프리뷰", path: "/poe2/item-filter/preview" },
    { id: "settings", name: "설정", path: "/poe2/item-filter/settings" },
  ];

  // 아이템 필터 페이지가 아닐 때는 표시하지 않음
  if (!pathname?.startsWith("/poe2/item-filter") && 
      !pathname?.startsWith("/wow/item-filter") &&
      !pathname?.startsWith("/poe1/item-filter") &&
      !pathname?.startsWith("/last-epoch/item-filter") &&
      !pathname?.startsWith("/fellowship/item-filter") &&
      !pathname?.startsWith("/once-human/item-filter")) {
    return null;
  }

  // 현재 게임 경로 추출
  const gamePath = pathname?.split("/")[1] || "poe2";
  const basePath = `/${gamePath}/item-filter`;

  // 경로 업데이트
  const updatedTabs = tabs.map(tab => ({
    ...tab,
    path: tab.path.replace("/poe2/item-filter", basePath)
  }));

  return (
    <nav className="item-filter-nav">
      <div className="item-filter-nav-container">
        {updatedTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`item-filter-nav-item ${
              pathname === tab.path || pathname?.startsWith(tab.path + "/") ? "active" : ""
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
