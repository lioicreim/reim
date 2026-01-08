"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ItemFilterNav() {
  const pathname = usePathname();

  const baseTabs = [
    { id: "presets", name: "프리셋", path: "/poe2/item-filter/presets" },
    { id: "quick-filters", name: "빠른 설정", path: "/poe2/item-filter/quick-filters" },
    { id: "custom-rules", name: "커스텀", path: "/poe2/item-filter/custom-rules" },
    { id: "sound-manager", name: "사운드", path: "/poe2/item-filter/sound-manager" },
    { id: "preview", name: "프리뷰", path: "/poe2/item-filter/preview" },
    { id: "settings", name: "설정", path: "/poe2/item-filter/settings" },
  ];

  // 티어 리스트 카테고리 탭들
  const tierCategoryTabs = [
    { id: "tier-category-currency", name: "화폐", category: "currency", path: "/poe2/item-filter/currency" },
    { id: "tier-category-uniques", name: "유니크", category: "uniques", path: "/poe2/item-filter/uniques" },
    { id: "tier-category-gear-bases", name: "장비", category: "gear-bases", path: "/poe2/item-filter/gear-bases" },
    { id: "tier-category-mods", name: "모드", category: "mods", path: "/poe2/item-filter/mods" },
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
  
  // 경로에서 카테고리 추출 (currency, uniques, gear-bases, mods)
  const categoryFromPath = pathname?.split("/").pop() || "";
  const validCategories = ["currency", "uniques", "gear-bases", "mods"];
  const activeTierCategory = validCategories.includes(categoryFromPath) ? categoryFromPath : "currency";
  const isTierListPage = validCategories.includes(categoryFromPath);

  // 경로 업데이트
  const updatedBaseTabs = baseTabs.map(tab => ({
    ...tab,
    path: tab.path.replace("/poe2/item-filter", basePath)
  }));

  // 빠른 설정 탭 다음에 카테고리 탭들 삽입
  const allTabs = [];
  updatedBaseTabs.forEach((tab) => {
    // 빠른 설정 탭 다음에 카테고리 탭들 삽입
    if (tab.id === "quick-filters") {
      allTabs.push(tab);
      tierCategoryTabs.forEach((catTab) => {
        allTabs.push({
          ...catTab,
          path: catTab.path.replace("/poe2/item-filter", basePath)
        });
      });
    } else {
      allTabs.push(tab);
    }
  });

  // 현재 활성화된 탭 확인
  const activeTab = allTabs.find((tab) => {
    if (tab.id.startsWith("tier-category")) {
      return pathname === tab.path || pathname?.startsWith(tab.path + "/");
    }
    return pathname === tab.path || pathname?.startsWith(tab.path + "/");
  });

  // 빠른 설정 페이지일 때 설명 텍스트 표시
  const showDescription = activeTab?.id === "quick-filters";
  // 모든 아이템 필터 페이지에서 설명 표시 (임시로 동일한 내용)
  const showTierListDescription = true;

  return (
    <>
      <nav className="item-filter-nav">
        <div className="item-filter-nav-container">
          {allTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.path}
              className={`item-filter-nav-item ${
                pathname === tab.path || pathname?.startsWith(tab.path + "/")
                  ? "active"
                  : ""
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </nav>
      {showDescription && (
        <div className="item-filter-description">
          <p>아이템 필터 규칙을 직관적으로 선택하여 나만의 최적화된 필터를 만드세요</p>
        </div>
      )}
      {showTierListDescription && (
        <div className="item-filter-description tier-list-description">
          <p>아이템을 S~E 티어로 분류하여 시각적으로 확인하세요</p>
        </div>
      )}
    </>
  );
}
