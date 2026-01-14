"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GameNav() {
  const pathname = usePathname();
  const [activeGame, setActiveGame] = useState("poe2");
  const [lang, setLang] = useState("ko");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);

    const handleLangChange = () => {
      const currentLang = localStorage.getItem("lang") || "ko";
      setLang(currentLang);
    };

    window.addEventListener("storage", handleLangChange);
    window.addEventListener("langchange", handleLangChange);

    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("langchange", handleLangChange);
    };
  }, []);

  const allGames = [
    { id: "wow", name: "WOW", nameKo: "WOW" },
    { id: "poe1", name: "POE1", nameKo: "POE1" },
    { id: "poe2", name: "POE2", nameKo: "POE2" },
    { id: "last-epoch", name: "LastEpoch", nameKo: "라스트에포크" },
    { id: "once-human", name: "Once Human", nameKo: "원스휴먼" },
    { id: "fellowship", name: "Fellowship", nameKo: "Fellowship" },
  ];

  // 애드센스 심사 기간 동안 POE2만 표시
  const games = allGames.filter(game => game.id === "poe2");

  return (
    <nav className="game-nav">
      <div className="game-nav-container">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.id === "poe2" ? "/poe2/item-filter/presets" : `/${game.id}`}
            className={`game-nav-item ${
              pathname?.startsWith(`/${game.id}`) ? "active" : ""
            }`}
          >
            {lang === "ko" ? game.nameKo : game.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
