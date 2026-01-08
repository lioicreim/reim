// 게임별 컬러 관리 유틸리티

const DEFAULT_COLORS = {
  poe2: "#3E63DD", // 파란색
  poe1: "#ff6b35", // 주황색
  wow: "#a3ff12", // 밝은 녹색
  "last-epoch": "#9d4edd", // 보라색
  fellowship: "#ffd700", // 금색
  "once-human": "#ff4757", // 빨간색
};

export const getGameColor = (gameId) => {
  if (typeof window === "undefined") return DEFAULT_COLORS[gameId] || DEFAULT_COLORS.poe2;
  
  const savedColors = JSON.parse(localStorage.getItem("game-colors") || "{}");
  return savedColors[gameId] || DEFAULT_COLORS[gameId] || DEFAULT_COLORS.poe2;
};

export const setGameColor = (gameId, color) => {
  if (typeof window === "undefined") return;
  
  const savedColors = JSON.parse(localStorage.getItem("game-colors") || "{}");
  savedColors[gameId] = color;
  localStorage.setItem("game-colors", JSON.stringify(savedColors));
  
  // 컬러 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent("gamecolorchange", { detail: { gameId, color } }));
  
  // CSS 변수 즉시 업데이트
  updateGameColorCSS(gameId, color);
};

export const getAllGameColors = () => {
  if (typeof window === "undefined") return DEFAULT_COLORS;
  
  const savedColors = JSON.parse(localStorage.getItem("game-colors") || "{}");
  return { ...DEFAULT_COLORS, ...savedColors };
};

export const resetGameColor = (gameId) => {
  if (typeof window === "undefined") return;
  
  const savedColors = JSON.parse(localStorage.getItem("game-colors") || "{}");
  delete savedColors[gameId];
  localStorage.setItem("game-colors", JSON.stringify(savedColors));
  
  const defaultColor = DEFAULT_COLORS[gameId];
  if (defaultColor) {
    window.dispatchEvent(new CustomEvent("gamecolorchange", { detail: { gameId, color: defaultColor } }));
    updateGameColorCSS(gameId, defaultColor);
  }
};

export const resetAllGameColors = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("game-colors");
  
  // 모든 게임 컬러를 기본값으로 복원
  Object.keys(DEFAULT_COLORS).forEach((gameId) => {
    updateGameColorCSS(gameId, DEFAULT_COLORS[gameId]);
  });
  
  window.dispatchEvent(new CustomEvent("gamecolorchange"));
};

const updateGameColorCSS = (gameId, color) => {
  if (typeof document === "undefined") return;
  
  const gameClass = `game-${gameId}`;
  const root = document.documentElement;
  const gameElement = document.querySelector(`.${gameClass}`) || document.body;
  
  // RGB 값 계산
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // CSS 변수 업데이트
  gameElement.style.setProperty("--game-primary", color);
  gameElement.style.setProperty("--game-primary-hover", `rgba(${r}, ${g}, ${b}, 0.1)`);
  gameElement.style.setProperty("--game-primary-border", color);
  gameElement.style.setProperty("--game-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`); // 배경용 어두운 버전
  
  // POE2 전용 변수도 업데이트
  if (gameId === "poe2") {
    gameElement.style.setProperty("--poe2-primary", color);
    gameElement.style.setProperty("--poe2-primary-bg", `rgba(${r}, ${g}, ${b}, 0.1)`);
  }
};

// 초기 로드 시 저장된 컬러 적용
if (typeof window !== "undefined") {
  const savedColors = JSON.parse(localStorage.getItem("game-colors") || "{}");
  Object.keys(savedColors).forEach((gameId) => {
    updateGameColorCSS(gameId, savedColors[gameId]);
  });
}
