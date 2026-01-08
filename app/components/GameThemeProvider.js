"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getAllGameColors } from "@/lib/game-colors";

export default function GameThemeProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // 현재 게임 확인
    let gameClass = "";
    let gameId = "";
    if (pathname?.startsWith("/poe2")) {
      gameClass = "game-poe2";
      gameId = "poe2";
    } else if (pathname?.startsWith("/poe1")) {
      gameClass = "game-poe1";
      gameId = "poe1";
    } else if (pathname?.startsWith("/wow")) {
      gameClass = "game-wow";
      gameId = "wow";
    } else if (pathname?.startsWith("/last-epoch")) {
      gameClass = "game-last-epoch";
      gameId = "last-epoch";
    } else if (pathname?.startsWith("/fellowship")) {
      gameClass = "game-fellowship";
      gameId = "fellowship";
    } else if (pathname?.startsWith("/once-human")) {
      gameClass = "game-once-human";
      gameId = "once-human";
    }

    // body에 게임 클래스 추가/제거
    const body = document.body;
    const gameClasses = [
      "game-poe2",
      "game-poe1",
      "game-wow",
      "game-last-epoch",
      "game-fellowship",
      "game-once-human",
    ];
    
    // 기존 게임 클래스 제거
    gameClasses.forEach((cls) => body.classList.remove(cls));
    
    // 새 게임 클래스 추가
    if (gameClass) {
      body.classList.add(gameClass);
      
      // 저장된 컬러 적용
      const gameColors = getAllGameColors();
      const color = gameColors[gameId];
      if (color) {
        const hex = color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        body.style.setProperty("--game-primary", color);
        body.style.setProperty("--game-primary-hover", `rgba(${r}, ${g}, ${b}, 0.1)`);
        body.style.setProperty("--game-primary-border", color);
        body.style.setProperty("--game-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`); // 배경용 어두운 버전
        
        // POE2 전용 변수도 업데이트
        if (gameId === "poe2") {
          body.style.setProperty("--poe2-primary", color);
          body.style.setProperty("--poe2-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`);
        }
      }
    }
    
    // 컬러 변경 이벤트 리스너
    const handleColorChange = () => {
      if (gameId) {
        const gameColors = getAllGameColors();
        const color = gameColors[gameId];
        if (color) {
          const hex = color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          
          body.style.setProperty("--game-primary", color);
          body.style.setProperty("--game-primary-hover", `rgba(${r}, ${g}, ${b}, 0.1)`);
          body.style.setProperty("--game-primary-border", color);
          body.style.setProperty("--game-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`); // 배경용 어두운 버전
          
          // POE2 전용 변수도 업데이트
          if (gameId === "poe2") {
            body.style.setProperty("--poe2-primary", color);
            body.style.setProperty("--poe2-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`);
          }
        }
      }
    };
    
    window.addEventListener("gamecolorchange", handleColorChange);
    
    return () => {
      window.removeEventListener("gamecolorchange", handleColorChange);
    };
  }, [pathname]);

  return null;
}
