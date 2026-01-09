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

  // 각 탭별 설명 텍스트 정의
  const descriptions = {
    presets: "게임 진행 상황에 맞는 프리셋을 선택하여 필터를 시작하세요",
    "quick-filters": "아이템 필터 규칙을 직관적으로 선택하여 나만의 최적화된 필터를 만드세요",
    "tier-category-currency": "화폐 아이템을 S~E 티어로 분류하여 시각적으로 확인하세요",
    "tier-category-uniques": "유니크 아이템을 S~C 티어로 분류하여 시각적으로 확인하세요",
    "tier-category-gear-bases": "장비 베이스를 S~E 티어로 분류하여 시각적으로 확인하세요",
    "tier-category-mods": "모드를 S~E 티어로 분류하여 시각적으로 확인하세요",
    "custom-rules": "고급 사용자를 위한 커스텀 규칙을 직접 작성하세요",
    "sound-manager": "아이템별 사운드 효과를 세밀하게 설정하세요",
    preview: "생성된 필터 코드를 미리보기하고 테스트하세요",
    settings: "필터 생성 옵션과 기본 설정을 관리하세요",
  };

  // 현재 활성화된 탭의 설명 텍스트 가져오기
  const currentDescription = activeTab ? descriptions[activeTab.id] || "" : "";

  // 설명 표시 여부 (설명이 있을 때만 표시)
  const showDescription = currentDescription !== "";

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
        <div className={`item-filter-description ${activeTab?.id === "tier-category-uniques" ? "item-filter-description-with-search" : ""}`}>
          <p>{currentDescription}</p>
          <div id="unique-search-container"></div>
        </div>
      )}
    </>
  );
}
