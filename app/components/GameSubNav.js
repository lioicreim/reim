"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function GameSubNav() {
  const pathname = usePathname();
  
  // 현재 게임 확인
  const getCurrentGame = () => {
    if (pathname?.startsWith("/poe2")) return "poe2";
    if (pathname?.startsWith("/wow")) return "wow";
    if (pathname?.startsWith("/poe1")) return "poe1";
    if (pathname?.startsWith("/last-epoch")) return "last-epoch";
    if (pathname?.startsWith("/fellowship")) return "fellowship";
    if (pathname?.startsWith("/once-human")) return "once-human";
    return null;
  };

  const currentGame = getCurrentGame();
  
  if (!currentGame) return null;

  // 게임별 탭 설정
  const getTabsForGame = (game) => {
    switch (game) {
      case "wow":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "addon", name: "통합애드온", path: `/${game}/addon` },
          { id: "addons", name: "애드온", path: `/${game}/addons` },
          { id: "weakaura", name: "위크오라", path: `/${game}/weakaura` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      case "poe1":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "leveling", name: "레벨링", path: `/${game}/leveling` },
          { id: "item-filter", name: "아이템 필터", path: `/${game}/item-filter` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      case "poe2":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "leveling", name: "레벨링", path: `/${game}/leveling` },
          { id: "item-filter", name: "아이템 필터", path: `/${game}/item-filter` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      case "last-epoch":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "strategy", name: "공략", path: `/${game}/strategy` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      case "fellowship":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "dungeon", name: "던전 공략", path: `/${game}/dungeon` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      case "once-human":
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "build", name: "빌드", path: `/${game}/build` },
          { id: "dungeon", name: "던전 공략", path: `/${game}/dungeon` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
      default:
        return [
          { id: "community", name: "커뮤니티", path: `/${game}/community` },
          { id: "guides", name: "가이드", path: `/${game}/guides` },
          { id: "leveling", name: "레벨링", path: `/${game}/leveling` },
          { id: "library", name: "자료실", path: `/${game}/library` },
        ];
    }
  };

  const tabs = getTabsForGame(currentGame);
  
  // 경로 길이 순으로 정렬 (긴 경로를 먼저 체크하여 /wow/addon과 /wow/addons 구분)
  const sortedTabs = [...tabs].sort((a, b) => b.path.length - a.path.length);

  // 각 탭의 활성 상태를 정확하게 계산 (긴 경로부터 체크)
  const getIsActive = (tab) => {
    if (!pathname) return false;
    // 정확한 경로 일치
    if (pathname === tab.path) return true;
    // 경로 + "/"로 시작하는 경우
    if (pathname.startsWith(tab.path + "/")) {
      // 더 긴 경로를 가진 다른 탭이 매칭되는지 확인
      const longerTabs = sortedTabs.filter(t => 
        t.path.length > tab.path.length && 
        pathname.startsWith(t.path + "/")
      );
      // 더 긴 경로가 매칭되지 않으면 활성화
      return longerTabs.length === 0;
    }
    return false;
  };

  return (
    <nav className="game-sub-nav">
      <div className="game-sub-nav-container">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`game-sub-nav-item ${getIsActive(tab) ? "active" : ""}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
