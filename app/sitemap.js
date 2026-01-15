/**
 * Next.js 동적 사이트맵 생성
 * 모든 정적 및 동적 페이지를 자동으로 포함
 */

export default function sitemap() {
  const baseUrl = "https://reim.kr";
  
  // 기본 페이지 목록
  const routes = [
    "",
    "/poe2",
    "/poe2/item-filter",
    "/poe2/item-filter/currency",
    "/poe2/item-filter/gear-bases",
    "/poe2/item-filter/mods",
    "/poe2/item-filter/quick-filters",
    "/poe2/item-filter/tier-lists",
    "/poe2/item-filter/uniques",
    "/poe2/item-filter/presets",
    "/poe2/item-filter/settings",
    "/poe2/item-filter/preview",
    "/poe2/item-filter/custom-rules",
    "/poe2/item-filter/sound-manager",
    "/poe2/community",
    "/poe2/community/write",
    "/poe2/guides",
    "/poe2/library",
    "/poe2/modifiers",
    "/poe2/leveling",
    "/poe1",
    "/wow",
    "/last-epoch",
    "/once-human",
    "/fellowship",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/poe2") ? 0.8 : 0.5,
  }));
}
