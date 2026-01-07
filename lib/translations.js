// 번역 유틸리티 함수
import dict from "@/data/dict.json";

/**
 * 아이템 이름을 한국어로 번역
 * @param {string} itemName - 영어 아이템 이름
 * @returns {string} 한국어 번역 또는 원본 이름
 */
export function translateItemName(itemName) {
  if (!itemName) return itemName;
  
  // 직접 매칭
  if (dict[itemName]) {
    return dict[itemName];
  }
  
  // 공백을 언더스코어로 변환하여 매칭
  const underscoreName = itemName.replace(/\s/g, "_");
  if (dict[underscoreName]) {
    return dict[underscoreName];
  }
  
  // URL 인코딩된 형태로 매칭
  const encodedName = encodeURIComponent(itemName);
  if (dict[encodedName]) {
    return dict[encodedName];
  }
  
  // 원본 반환
  return itemName;
}

/**
 * 클래스명을 한국어로 번역
 * @param {string} className - 영어 클래스명
 * @returns {string} 한국어 번역 또는 원본 이름
 */
export function translateClassName(className) {
  const classNamesKo = {
    "Wands": "마법봉",
    "Staves": "지팡이",
    "Foci": "집중구",
    "Sceptres": "셉터",
    "Bows": "활",
    "Quivers": "화살통",
    "Crossbows": "쇠뇌",
    "Quarterstaves": "육척봉",
    "Spears": "창",
    "Talismans": "부적",
    "One Hand Maces": "한손 철퇴",
    "Two Hand Maces": "양손 철퇴",
    "Armours": "갑옷",
    "Helmets": "투구",
    "Gloves": "장갑",
    "Boots": "장화",
    "Shields": "방패",
    "Bucklers": "버클러",
    "Amulets": "목걸이",
    "Rings": "반지",
    "Belts": "벨트"
  };
  
  return classNamesKo[className] || className;
}
