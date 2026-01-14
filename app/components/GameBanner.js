"use client";

import { usePathname } from "next/navigation";

export default function GameBanner() {
  const pathname = usePathname();
  
  // 현재 활성화된 게임 확인
  const getActiveGame = () => {
    if (pathname?.startsWith("/poe2")) return "poe2";
    if (pathname?.startsWith("/wow")) return "wow";
    if (pathname?.startsWith("/poe1")) return "poe1";
    if (pathname?.startsWith("/last-epoch")) return "last-epoch";
    if (pathname?.startsWith("/fellowship")) return "fellowship";
    if (pathname?.startsWith("/once-human")) return "once-human";
    if (pathname?.startsWith("/shop")) return "shop";
    return null;
  };

  const activeGame = getActiveGame();

  // 게임별 정보
  const gameInfo = {
    poe2: {
      name: "PATH OF EXILE 2",
      logo: "POE2",
      bgImage: "/images/poe2-bg.jpg", // 나중에 이미지 추가
    },
    wow: {
      name: "WORLD OF WARCRAFT",
      logo: "WOW",
      bgImage: "/images/wow-bg.jpg",
    },
    "poe1": {
      name: "PATH OF EXILE",
      logo: "POE1",
      bgImage: "/images/poe1-bg.jpg",
    },
    "last-epoch": {
      name: "LAST EPOCH",
      logo: "LAST EPOCH",
      bgImage: "/images/last-epoch-bg.jpg",
    },
    fellowship: {
      name: "FELLOWSHIP",
      logo: "FELLOWSHIP",
      bgImage: "/images/fellowship-bg.jpg",
    },
    "once-human": {
      name: "ONCE HUMAN",
      logo: "ONCE HUMAN",
      bgImage: "/images/once-human-bg.jpg",
    },
    shop: {
      name: "SHOP",
      logo: "SHOP",
      bgImage: "/images/shop-bg.jpg",
    },
  };

  if (!activeGame) {
    // 메인 페이지에서는 배너를 표시하지 않음
    return null;
  }

  const game = gameInfo[activeGame];

  // bgImage가 실제로 존재하는지 확인 (임시로 false로 설정 - 나중에 이미지 추가 시 수정)
  const hasBgImage = false; // game.bgImage && 이미지 파일이 실제로 존재할 때 true로 변경
  
  return (
    <div 
      className="game-banner game-hero ad-banner-placeholder"
      style={hasBgImage && game.bgImage ? {
        '--bg-image-url': `url(${game.bgImage})`,
      } : {}}
    >
      <div className="game-hero-overlay"></div>
      <div className="game-hero-content ad-placeholder-content">
        <div className="game-logo" style={{ fontSize: '42px', fontWeight: '900', color: 'var(--neon-blue)', marginBottom: '8px' }}>{game.logo}</div>
        <div className="ad-label">Advertisement</div>
      </div>
    </div>
  );
}
