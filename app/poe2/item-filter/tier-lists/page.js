"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import bases from "@/data/bases.json";
import classes from "@/data/classes.json";
import currencyTiers from "@/data/currency-tiers.json";
import { translateItemName, translateClassName } from "@/lib/translations";
import dict from "@/data/dict.json";

// 티어 매핑: 1->S, 2->A, 3->B, 4->C, 5->D, 6->E
const tierMapping = {
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
  E: 6,
};

const tierColors = {
  S: "var(--tier-s)",
  A: "var(--tier-a)",
  B: "var(--tier-b)",
  C: "var(--tier-c)",
  D: "var(--tier-d)",
  E: "var(--tier-e)",
};

function getTierLabel(numTier) {
  const mapping = {
    1: "S",
    2: "A",
    3: "B",
    4: "C",
  };
  return mapping[numTier] || "D";
}

export default function TierListPage() {
  const [selectedCategory, setSelectedCategory] = useState("currency");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCurrencyType, setSelectedCurrencyType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isArmourTypeDropdownOpen, setIsArmourTypeDropdownOpen] = useState(false);
  const [selectedArmourType, setSelectedArmourType] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("default");
  
  // 화폐 종류 드롭다운에서 선택한 카테고리 추적
  const [activeCurrencyCategory, setActiveCurrencyCategory] = useState("");
  
  // 제외할 화폐 종류 체크박스 상태
  const [excludedTypes, setExcludedTypes] = useState({
    runes: false,
    essences: false,
    uncutGems: false,
    lineageGems: false,
  });

  // 드래그 앤 드롭 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromTier, setDraggedFromTier] = useState(null);
  
  // 커스텀 티어 정보 (로컬스토리지에서 불러온 사용자 커스텀 설정)
  const [customCurrencyTiers, setCustomCurrencyTiers] = useState({});
  const [customGearTiers, setCustomGearTiers] = useState({});
  
  // TODO: 실제 API에서 가져올 데이터 (현재는 하드코딩된 예시)
  const priceData = {
    lastUpdate: "2026-01-04 21:20:21",
    previousUpdate: "2026-01-03 03:35:35",
    divinePrice: {
      current: 305.79,
      previous: 273.09,
      change: 11.97
    }
  };
  
  // 티어리스트 카테고리 (상단 탭에 표시되는 메인 카테고리)
  const categories = [
    { id: "currency", name: "화폐", nameEn: "Currency" },
    { id: "uniques", name: "유니크", nameEn: "Uniques" },
    { id: "chance-bases", name: "찬스 아이템", nameEn: "Chance Bases" },
    { id: "gear-bases", name: "장비", nameEn: "Gear Bases" },
    { id: "mods", name: "옵션", nameEn: "Mods" },
  ];

         // 평균 시세 필터
         const leagueFilters = [
           { id: "default", name: "기본값" },
           { id: "early", name: "리그 초반" },
           { id: "normal", name: "리그 중반" },
           { id: "late", name: "리그 후반" },
           { id: "ssf", name: "SSF" },
         ];

  // 언어 상태 (기본값: 한국어)
  const [lang, setLang] = useState("ko");
  
  // 언어 상태를 localStorage에서 가져오기
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);
    
    // Header의 언어 변경 이벤트 리스너
    const handleLangChange = () => {
      const currentLang = localStorage.getItem("lang") || "ko";
      setLang(currentLang);
    };
    
    window.addEventListener("storage", handleLangChange);
    // 커스텀 이벤트도 리스닝 (같은 페이지 내에서 언어 변경 시)
    window.addEventListener("langchange", handleLangChange);
    
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("langchange", handleLangChange);
    };
  }, []);

  // 화폐 종류 (Currency Types) - 언어에 따라 표시
  // 화폐 카테고리 선택 시 드롭다운에서 세부 카테고리 선택 가능
  const currencyTypes = [
    { id: "", name: lang === "ko" ? "전체" : "All" },
    { id: "currency", name: lang === "ko" ? "화폐" : "Currency" },
    { id: "waystones", name: lang === "ko" ? "경로석" : "Waystones" },
    { id: "essences", name: lang === "ko" ? "에센스" : "Essences" },
    { id: "ritual-omen", name: lang === "ko" ? "징조" : "Ritual Omen" },
    { id: "runes", name: lang === "ko" ? "룬" : "Runes" },
    { id: "delirium", name: lang === "ko" ? "액체 감정" : "Delirium" },
    { id: "breach", name: lang === "ko" ? "균열" : "Breach" },
    { id: "ancient-bones", name: lang === "ko" ? "고대 뼈" : "Ancient Bones" },
    { id: "abyssal", name: lang === "ko" ? "심연 응시" : "Abyssal" },
    { id: "expedition", name: lang === "ko" ? "탐험" : "Expedition" },
    { id: "tablet", name: lang === "ko" ? "서판" : "Tablet" },
    { id: "uncut-gems", name: lang === "ko" ? "미가공 젬" : "Uncut Gems" },
    { id: "lineage-gems", name: lang === "ko" ? "혈통 젬" : "Lineage Gems" },
    { id: "jewels", name: lang === "ko" ? "주얼" : "Jewels" },
    { id: "charm", name: lang === "ko" ? "호신부" : "Charms" },
    { id: "flask", name: lang === "ko" ? "플라스크" : "Flasks" },
    { id: "pinnacle-key", name: lang === "ko" ? "보스 조각" : "Pinnacle Keys" },
    { id: "map-fragments", name: lang === "ko" ? "조각" : "Map Fragments" },
    { id: "vault-key", name: lang === "ko" ? "보관실 키" : "Vault Keys" },
    { id: "incubators", name: lang === "ko" ? "인큐베이터" : "Incubators" },
    { id: "soul-cores", name: lang === "ko" ? "영혼핵" : "Soul Cores" },
    { id: "idosl", name: lang === "ko" ? "우상" : "Idols" },
  ];
  

  // 클래스를 카테고리별로 분류
  const classCategories = {
    "무기": [
      "Bows", "Quivers", "Crossbows", "Wands", "Staves", "Sceptres",
      "Spears", "Quarterstaves", "Talismans", "One Hand Maces", "Two Hand Maces"
      // 활, 화살통, 쇠뇌, 마법봉, 지팡이, 셉터, 창, 육척봉, 부적, 한손 철퇴, 양손 철퇴 순서
    ],
    "방어구": [
      "Helmets", "Armours", "Gloves", "Boots", "Shields", "Foci", "Bucklers"  // 투구, 갑옷, 장갑, 장화, 방패, 집중구, 버클러 순서
    ],
    "장신구": [
      "Amulets", "Rings", "Belts"  // 목걸이, 반지, 벨트 순서
    ]
  };

  // 방어구 타입이 있는 클래스 목록
  const classesWithArmourType = ["Armours", "Helmets", "Gloves", "Boots", "Shields"];

  // 방어구 타입 목록
  const armourTypes = [
    { id: "", name: lang === "ko" ? "전체" : "All" },
    { id: "AR", name: lang === "ko" ? "방어도" : "AR" },
    { id: "AR/ES", name: lang === "ko" ? "방어/에쉴" : "AR/ES" },
    { id: "AR/EV", name: lang === "ko" ? "방어/회피" : "AR/EV" },
    { id: "AR/EV/ES", name: lang === "ko" ? "방어/에쉴/회피" : "AR/EV/ES" },
    { id: "ES", name: lang === "ko" ? "에너지 보호막" : "ES" },
    { id: "EV", name: lang === "ko" ? "회피" : "EV" },
    { id: "EV/ES", name: lang === "ko" ? "회피/에쉴" : "EV/ES" },
  ];
  
  // 장비 아이템의 실제 티어 가져오기 (커스텀 티어 우선) - 먼저 정의
  const getGearItemTier = (itemName) => {
    // 커스텀 티어가 있으면 사용
    if (customGearTiers[itemName]) {
      return customGearTiers[itemName];
    }
    // 기본 티어 찾기
    const item = bases[itemName];
    if (!item) return null;
    const numTier = item.tier || 4;
    if (item.class === "Belts") return "E";
    if (numTier === 1) return "S";
    if (numTier === 2) return "A";
    if (numTier === 3) return "B";
    if (numTier === 4) return "C";
    return "D";
  };

  // 모든 아이템을 티어별로 그룹화 (커스텀 티어 반영)
  const itemsByTier = useMemo(() => {
    const result = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
    };

    // bases.json에서 모든 아이템을 가져와서 실제 티어로 분류
    Object.keys(bases).forEach((itemName) => {
      const item = bases[itemName];
      const actualTier = getGearItemTier(itemName);
      if (actualTier) {
        result[actualTier].push({ name: itemName, ...item });
      }
    });

    return result;
  }, [customGearTiers]);

  // 클래스별로 그룹화
  const itemsByClass = {};
  ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
    itemsByTier[tier].forEach((item) => {
      if (!itemsByClass[item.class]) {
        itemsByClass[item.class] = {};
      }
      if (!itemsByClass[item.class][tier]) {
        itemsByClass[item.class][tier] = [];
      }
      itemsByClass[item.class][tier].push(item);
    });
  });

  // 로컬스토리지에서 커스텀 티어 정보 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 화폐 커스텀 티어 불러오기
    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    const currencyKey = `tier-list-custom-currency-${leagueKey}`;
    const savedCurrencyTiers = localStorage.getItem(currencyKey);
    if (savedCurrencyTiers) {
      try {
        setCustomCurrencyTiers(JSON.parse(savedCurrencyTiers));
      } catch (e) {
        console.error("Failed to parse saved currency tiers:", e);
      }
    } else {
      setCustomCurrencyTiers({});
    }
    
    // 장비 커스텀 티어 불러오기
    const gearKey = "tier-list-custom-gear";
    const savedGearTiers = localStorage.getItem(gearKey);
    if (savedGearTiers) {
      try {
        setCustomGearTiers(JSON.parse(savedGearTiers));
      } catch (e) {
        console.error("Failed to parse saved gear tiers:", e);
      }
    } else {
      setCustomGearTiers({});
    }
  }, [selectedLeague]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (isArmourTypeDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsArmourTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isArmourTypeDropdownOpen]);

  // 화폐 아이템의 실제 티어 가져오기 (커스텀 티어 우선)
  const getCurrencyItemTier = (itemName) => {
    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    // 커스텀 티어가 있으면 사용
    if (customCurrencyTiers[itemName]) {
      return customCurrencyTiers[itemName];
    }
    // 기본 티어 찾기
    for (const tier of ["S", "A", "B", "C", "D", "E"]) {
      if (currencyTiers[leagueKey]?.[tier]?.includes(itemName)) {
        return tier;
      }
    }
    return null;
  };


  // 화폐 아이템 티어 변경
  const moveCurrencyItem = (itemName, fromTier, toTier) => {
    if (fromTier === toTier) return;
    
    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    const newCustomTiers = { ...customCurrencyTiers };
    newCustomTiers[itemName] = toTier;
    setCustomCurrencyTiers(newCustomTiers);
    
    // 로컬스토리지에 저장
    const currencyKey = `tier-list-custom-currency-${leagueKey}`;
    localStorage.setItem(currencyKey, JSON.stringify(newCustomTiers));
  };

  // 장비 아이템 티어 변경
  const moveGearItem = (itemName, fromTier, toTier) => {
    if (fromTier === toTier) return;
    
    const newCustomTiers = { ...customGearTiers };
    newCustomTiers[itemName] = toTier;
    setCustomGearTiers(newCustomTiers);
    
    // 로컬스토리지에 저장
    const gearKey = "tier-list-custom-gear";
    localStorage.setItem(gearKey, JSON.stringify(newCustomTiers));
  };

  // 드래그 시작
  const handleDragStart = (e, itemName, tier) => {
    setDraggedItem(itemName);
    setDraggedFromTier(tier);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemName);
  };

  // 드래그 오버 (드롭 가능 영역)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 드롭
  const handleDrop = (e, toTier) => {
    e.preventDefault();
    if (!draggedItem || !draggedFromTier) return;
    
    if (selectedCategory === "currency") {
      moveCurrencyItem(draggedItem, draggedFromTier, toTier);
    } else if (selectedCategory === "gear-bases") {
      moveGearItem(draggedItem, draggedFromTier, toTier);
    }
    
    setDraggedItem(null);
    setDraggedFromTier(null);
  };

  // 초기화 (기본값으로 복원)
  const handleReset = () => {
    if (selectedCategory === "currency") {
      const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
      const currencyKey = `tier-list-custom-currency-${leagueKey}`;
      localStorage.removeItem(currencyKey);
      setCustomCurrencyTiers({});
    } else if (selectedCategory === "gear-bases") {
      const gearKey = "tier-list-custom-gear";
      localStorage.removeItem(gearKey);
      setCustomGearTiers({});
    }
  };

  // 다운로드 (JSON 파일로)
  const handleDownload = () => {
    let data = {};
    if (selectedCategory === "currency") {
      const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
      data = {
        category: "currency",
        league: selectedLeague,
        customTiers: customCurrencyTiers
      };
    } else if (selectedCategory === "gear-bases") {
      data = {
        category: "gear-bases",
        customTiers: customGearTiers
      };
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tier-list-${selectedCategory}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 복사하기 (클립보드)
  const handleCopy = async () => {
    let data = {};
    if (selectedCategory === "currency") {
      const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
      data = {
        category: "currency",
        league: selectedLeague,
        customTiers: customCurrencyTiers
      };
    } else if (selectedCategory === "gear-bases") {
      data = {
        category: "gear-bases",
        customTiers: customGearTiers
      };
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert(lang === "ko" ? "클립보드에 복사되었습니다." : "Copied to clipboard!");
    } catch (e) {
      console.error("Failed to copy:", e);
      alert(lang === "ko" ? "복사에 실패했습니다." : "Failed to copy!");
    }
  };

  // 불러오기 (JSON 파일)
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.category === "currency" && data.customTiers) {
            const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
            const currencyKey = `tier-list-custom-currency-${leagueKey}`;
            localStorage.setItem(currencyKey, JSON.stringify(data.customTiers));
            setCustomCurrencyTiers(data.customTiers);
          } else if (data.category === "gear-bases" && data.customTiers) {
            const gearKey = "tier-list-custom-gear";
            localStorage.setItem(gearKey, JSON.stringify(data.customTiers));
            setCustomGearTiers(data.customTiers);
          }
          alert(lang === "ko" ? "불러오기 성공!" : "Import successful!");
        } catch (e) {
          console.error("Failed to import:", e);
          alert(lang === "ko" ? "불러오기 실패: 잘못된 파일 형식입니다." : "Import failed: Invalid file format!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <main className="container">
      {/* 설명 영역 - 티어 구분 영역과 동일한 너비 */}
      <div className="tier-list-description-section">
        <div className="tier-list-description-content">
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>
            아이템을 S~E 티어로 분류하여 시각적으로 확인하세요
          </p>
          <div className="tier-list-info">
            <div className="info-item">
              <span style={{ color: "var(--muted)", fontSize: 12 }}>데이터 출처: </span>
              <span style={{ color: "var(--text)", fontSize: 12 }}>poe2scout.com, poe2.ninja</span>
            </div>
            <div className="info-item">
              <span style={{ color: "var(--muted)", fontSize: 12 }}>마지막 업데이트: </span>
              <span style={{ color: "var(--text)", fontSize: 12 }}>{priceData.lastUpdate}</span>
            </div>
            <div className="info-item">
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Divine Orb 가격 변동: </span>
              <span style={{ color: "var(--poe2-secondary, #ffffff)", fontSize: 12 }}>
                {priceData.divinePrice.previous} → {priceData.divinePrice.current} ({priceData.divinePrice.change > 0 ? "+" : ""}{priceData.divinePrice.change}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader" style={{ padding: "0", borderBottom: "none" }}>
          <div className="tier-list-filters">
            {/* 카테고리 선택 탭 - 왼쪽 */}
            <div className="category-tabs-wrapper">
              <div className="category-tabs">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-tab ${
                      selectedCategory === category.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      // 화폐가 아닌 다른 카테고리 선택 시 currencyType 및 activeCurrencyCategory 초기화
                      if (category.id !== "currency") {
                        setSelectedCurrencyType("");
                        setActiveCurrencyCategory("");
                      }
                      // 장비가 아닌 다른 카테고리 선택 시 방어구 타입 초기화
                      if (category.id !== "gear-bases") {
                        setSelectedArmourType("");
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cardBody" style={{ paddingTop: 0 }}>
          {/* 화폐 카테고리일 때 Currency Types 드롭다운, 체크박스, 시세 그룹 표시 */}
          {selectedCategory === "currency" && (
            <div className="currency-filter-row">
              <div className="currency-filter-left">
                <label className="class-selector-label">
                  {lang === "ko" ? "화폐 종류" : "CURRENCY TYPES"}
                </label>
                <div className="custom-dropdown">
                  <div
                    className="dropdown-trigger"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedCurrencyType 
                      ? currencyTypes.find(t => t.id === selectedCurrencyType)?.name || (lang === "ko" ? "전체" : "All")
                      : (lang === "ko" ? "전체" : "All")}
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      {currencyTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`dropdown-option ${
                            selectedCurrencyType === type.id ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedCurrencyType(type.id);
                            setIsDropdownOpen(false);
                            // 드롭다운에서 선택한 카테고리로 변경
                            if (type.id) {
                              setActiveCurrencyCategory(type.id);
                            } else {
                              setActiveCurrencyCategory("");
                            }
                          }}
                        >
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="except-section">
                  <span className="except-label">{lang === "ko" ? "제외" : "EXCEPT"}</span>
                  <div className="except-checkboxes">
                    <label className="except-checkbox">
                      <input
                        type="checkbox"
                        checked={excludedTypes.runes}
                        onChange={(e) => setExcludedTypes({ ...excludedTypes, runes: e.target.checked })}
                      />
                      <span>{lang === "ko" ? "룬" : "RUNES"}</span>
                    </label>
                    <label className="except-checkbox">
                      <input
                        type="checkbox"
                        checked={excludedTypes.essences}
                        onChange={(e) => setExcludedTypes({ ...excludedTypes, essences: e.target.checked })}
                      />
                      <span>{lang === "ko" ? "에센스" : "ESSENCES"}</span>
                    </label>
                    <label className="except-checkbox">
                      <input
                        type="checkbox"
                        checked={excludedTypes.uncutGems}
                        onChange={(e) => setExcludedTypes({ ...excludedTypes, uncutGems: e.target.checked })}
                      />
                      <span>{lang === "ko" ? "미가공 젬" : "UNCUT GEMS"}</span>
                    </label>
                    <label className="except-checkbox">
                      <input
                        type="checkbox"
                        checked={excludedTypes.lineageGems}
                        onChange={(e) => setExcludedTypes({ ...excludedTypes, lineageGems: e.target.checked })}
                      />
                      <span>{lang === "ko" ? "혈통 젬" : "LINEAGE GEMS"}</span>
                    </label>
                  </div>
                </div>
              </div>
              {/* 시세 그룹 - 오른쪽 */}
              <div className="league-filters-inline">
                {leagueFilters.map((league) => (
                  <button
                    key={league.id}
                    className={`league-filter ${
                      selectedLeague === league.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedLeague(league.id)}
                  >
                    {league.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 장비 베이스 카테고리일 때 클래스 선택 드롭다운 표시 */}
          {selectedCategory === "gear-bases" && (
            <div className="class-selector">
              <label className="class-selector-label">
                {lang === "ko" ? "아이템 종류" : "ITEM CLASS"}
              </label>
              <div className="custom-dropdown">
                <div
                  className="dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedClass ? translateClassName(selectedClass) : "전체 클래스"}
                  <span className="dropdown-arrow">▼</span>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedClass("");
                        setIsDropdownOpen(false);
                        // 전체 클래스 선택 시 방어구 타입 초기화
                        setSelectedArmourType("");
                      }}
                    >
                      전체 클래스
                    </div>
                    {Object.keys(classCategories).map((category) => (
                      <div key={category}>
                        <div className="dropdown-category">{category}</div>
                        {classCategories[category]
                          .filter((className) => classes[className])
                          .map((className) => (
                            <div
                              key={className}
                              className={`dropdown-option dropdown-option-indented ${
                                selectedClass === className ? "selected" : ""
                              }`}
                              onClick={() => {
                                setSelectedClass(className);
                                setIsDropdownOpen(false);
                                // 방어구 타입이 없는 클래스 선택 시 방어구 타입 초기화
                                if (!classesWithArmourType.includes(className)) {
                                  setSelectedArmourType("");
                                }
                              }}
                            >
                              {translateClassName(className)}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 방어구 타입 드롭다운 (방어구 타입이 있는 클래스 선택 시에만 표시) */}
              {selectedClass && classesWithArmourType.includes(selectedClass) && (
                <>
                  <label className="class-selector-label">
                    {lang === "ko" ? "방어구 타입" : "ARMOUR TYPE"}
                  </label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-trigger"
                      onClick={() => setIsArmourTypeDropdownOpen(!isArmourTypeDropdownOpen)}
                    >
                      {selectedArmourType
                        ? armourTypes.find(t => t.id === selectedArmourType)?.name || (lang === "ko" ? "전체" : "All")
                        : (lang === "ko" ? "전체" : "All")}
                      <span className="dropdown-arrow">▼</span>
                    </div>
                    {isArmourTypeDropdownOpen && (
                      <div className="dropdown-menu">
                        {armourTypes.map((type) => (
                          <div
                            key={type.id}
                            className={`dropdown-option ${
                              selectedArmourType === type.id ? "selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedArmourType(type.id);
                              setIsArmourTypeDropdownOpen(false);
                            }}
                          >
                            {type.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 모든 카테고리에서 티어 그리드 표시 */}
          {/* S, A, B, C, D 티어 그리드 */}
          <div className="tier-grid-main">
            {["S", "A", "B", "C", "D"].map((tier) => (
              <div key={tier} className="tier-column">
                <div
                  className="tier-header"
                  style={{
                    background: tierColors[tier],
                    color: tier === "S" ? "rgb(255, 0, 0)" : tier === "A" || tier === "B" ? "#ffffff" : "#000000",
                  }}
                >
                  <div className="tier-label">{tier} 티어</div>
                  <div className="tier-count">
                    {(() => {
                      if (selectedCategory === "currency") {
                        const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
                        // 모든 화폐 아이템을 가져와서 실제 티어로 필터링하여 카운트
                        let count = 0;
                        ["S", "A", "B", "C", "D", "E"].forEach((t) => {
                          const items = currencyTiers[leagueKey]?.[t] || [];
                          items.forEach((itemName) => {
                            const actualTier = getCurrencyItemTier(itemName);
                            if (actualTier === tier) {
                              count++;
                            }
                          });
                        });
                        return count;
                      } else if (selectedCategory === "gear-bases") {
                        // 장비는 itemsByTier에서 실제 티어로 분류된 아이템 수 반환
                        return itemsByTier[tier].length;
                      }
                      return 0;
                    })()}개
                  </div>
                </div>
                <div 
                  className="tier-items"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tier)}
                >
                  {/* 화폐 카테고리일 때 화폐 아이템 표시 */}
                  {selectedCategory === "currency" && (
                    <>
                      {(() => {
                        // 기본값은 리그 중반(normal) 값을 사용
                        const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
                        // 모든 화폐 아이템을 가져와서 실제 티어로 필터링
                        const allCurrencyItems = [];
                        ["S", "A", "B", "C", "D", "E"].forEach((t) => {
                          const items = currencyTiers[leagueKey]?.[t] || [];
                          items.forEach((itemName) => {
                            const actualTier = getCurrencyItemTier(itemName);
                            if (actualTier === tier) {
                              allCurrencyItems.push(itemName);
                            }
                          });
                        });
                        
                        if (allCurrencyItems.length === 0) return null;
                        
                        const getTierTextColor = (tier) => {
                          if (tier === "S") return "#000000";
                          if (tier === "A" || tier === "B") return "#ffffff";
                          if (tier === "E") return "rgb(220, 175, 132)";
                          return "#000000";
                        };
                        
                        return allCurrencyItems.map((itemName) => {
                          const actualTier = getCurrencyItemTier(itemName);
                          return (
                            <div
                              key={itemName}
                              className="tier-item"
                              draggable
                              onDragStart={(e) => handleDragStart(e, itemName, actualTier)}
                              onDragOver={handleDragOver}
                              style={{
                                background: tierColors[actualTier],
                                opacity: actualTier === "S" ? 1 : 0.9,
                                color: getTierTextColor(actualTier),
                                cursor: "grab",
                              }}
                              title={translateItemName(itemName)}
                            >
                              <div className="tier-item-name">{translateItemName(itemName)}</div>
                            </div>
                          );
                        });
                      })()}
                      
                      {/* D 티어 열에 E 티어 화폐 아이템들 추가 */}
                      {tier === "D" && (
                        <>
                          {(() => {
                            // 기본값은 리그 중반(normal) 값을 사용
                            const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
                            const baseETierItems = currencyTiers[leagueKey]?.["E"] || [];
                            
                            // 커스텀 티어를 반영하여 E 티어에 표시할 아이템 필터링
                            const eTierItems = baseETierItems.filter(itemName => {
                              const actualTier = getCurrencyItemTier(itemName);
                              return actualTier === "E";
                            });
                            
                            if (eTierItems.length === 0) return null;
                            
                            return (
                              <>
                                <div className="tier-e-divider">
                                  <div className="tier-e-header">
                                    <div className="tier-e-label">E 티어</div>
                                    <div className="tier-e-count">
                                      {eTierItems.length}개
                                    </div>
                                  </div>
                                </div>
                                {eTierItems.map((itemName) => {
                                  const actualTier = getCurrencyItemTier(itemName);
                                  const getTierTextColor = (tier) => {
                                    if (tier === "S") return "#000000";
                                    if (tier === "A" || tier === "B") return "#ffffff";
                                    if (tier === "E") return "rgb(220, 175, 132)";
                                    return "#000000";
                                  };
                                  return (
                                    <div
                                      key={`E-${itemName}`}
                                      className="tier-item"
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, itemName, actualTier || "E")}
                                      style={{
                                        background: tierColors[actualTier || "E"],
                                        opacity: (actualTier || "E") === "S" ? 1 : 0.9,
                                        color: getTierTextColor(actualTier || "E"),
                                        cursor: "grab",
                                      }}
                                      title={translateItemName(itemName)}
                                    >
                                      <div className="tier-item-name">{translateItemName(itemName)}</div>
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </>
                  )}
                  
                  {/* 장비 카테고리일 때만 아이템 표시 */}
                  {selectedCategory === "gear-bases" && (
                    <>
                      {Object.keys(itemsByClass)
                        .sort()
                        .filter((className) => !selectedClass || className === selectedClass)
                        .map((className) => {
                          let classItems = itemsByClass[className][tier] || [];
                          
                          // 방어구 타입 필터링 (방어구 타입이 있는 클래스이고 방어구 타입이 선택된 경우)
                          if (classesWithArmourType.includes(className) && selectedArmourType) {
                            classItems = classItems.filter((item) => item.armourType === selectedArmourType);
                          }
                          
                          // 커스텀 티어를 반영하여 현재 티어에 표시할 아이템 필터링
                          classItems = classItems.filter((item) => {
                            const actualTier = getGearItemTier(item.name);
                            return actualTier === tier;
                          });
                          
                          if (classItems.length === 0) return null;

                          return (
                            <div key={className} className="tier-class-group">
                              {!selectedClass && (
                                <div className="tier-class-name">{translateClassName(className)}</div>
                              )}
                              {classItems.map((item) => {
                                const actualTier = getGearItemTier(item.name);
                                const getTierTextColor = (tier) => {
                                  if (tier === "S") return "#000000";
                                  if (tier === "A" || tier === "B") return "#ffffff";
                                  if (tier === "E") return "rgb(220, 175, 132)";
                                  return "#000000";
                                };
                                return (
                                  <div
                                    key={item.name}
                                    className="tier-item"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.name, actualTier)}
                                    style={{
                                      background: tierColors[actualTier],
                                      opacity: actualTier === "S" ? 1 : 0.9,
                                      color: getTierTextColor(actualTier),
                                      cursor: "grab",
                                    }}
                                    title={`${translateItemName(item.name)} (${item.name}) - ${translateClassName(item.class)}${item.armourType ? ` - ${item.armourType}` : ""}`}
                                  >
                                    <div className="tier-item-name">{translateItemName(item.name)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      
                      {/* D 티어 열에 E 티어 아이템들 추가 */}
                      {tier === "D" && (
                        <>
                          {itemsByTier.E.length > 0 && (
                            <>
                              <div className="tier-e-divider">
                                <div 
                                  className="tier-e-header"
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, "E")}
                                >
                                  <div className="tier-e-label">E 티어</div>
                                  <div className="tier-e-count">
                                    {(() => {
                                      if (selectedCategory === "gear-bases") {
                                        // 커스텀 티어를 반영하여 실제 E 티어 아이템 수 계산
                                        const allEItems = itemsByTier.E || [];
                                        const actualEItems = allEItems.filter(item => {
                                          const actualTier = getGearItemTier(item.name);
                                          return actualTier === "E";
                                        });
                                        return actualEItems.length;
                                      }
                                      return itemsByTier.E.length;
                                    })()}개
                                  </div>
                                </div>
                              </div>
                              {Object.keys(itemsByClass)
                                .sort()
                                .filter((className) => !selectedClass || className === selectedClass)
                                .map((className) => {
                                  let classItems = itemsByClass[className]["E"] || [];
                                  
                                  // 방어구 타입 필터링 (방어구 타입이 있는 클래스이고 방어구 타입이 선택된 경우)
                                  if (classesWithArmourType.includes(className) && selectedArmourType) {
                                    classItems = classItems.filter((item) => item.armourType === selectedArmourType);
                                  }
                                  
                                  // 커스텀 티어를 반영하여 E 티어에 표시할 아이템 필터링
                                  classItems = classItems.filter((item) => {
                                    const actualTier = getGearItemTier(item.name);
                                    return actualTier === "E";
                                  });
                                  
                                  if (classItems.length === 0) return null;

                                  return (
                                    <div key={`E-${className}`} className="tier-class-group">
                                      {!selectedClass && (
                                        <div className="tier-class-name">{translateClassName(className)}</div>
                                      )}
                                      {classItems.map((item) => {
                                        const actualTier = getGearItemTier(item.name);
                                        const getTierTextColor = (tier) => {
                                          if (tier === "S") return "#000000";
                                          if (tier === "A" || tier === "B") return "#ffffff";
                                          if (tier === "E") return "rgb(220, 175, 132)";
                                          return "#000000";
                                        };
                                        return (
                                          <div
                                            key={item.name}
                                            className="tier-item"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.name, actualTier)}
                                            style={{
                                              background: tierColors[actualTier],
                                              opacity: actualTier === "S" ? 1 : 0.9,
                                              color: getTierTextColor(actualTier),
                                              cursor: "grab",
                                            }}
                                            title={`${translateItemName(item.name)} (${item.name}) - ${translateClassName(item.class)}${item.armourType ? ` - ${item.armourType}` : ""}`}
                                          >
                                            <div className="tier-item-name">{translateItemName(item.name)}</div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  {/* 다른 카테고리들은 빈 상태 (추후 데이터 추가 예정) */}
                  {selectedCategory !== "gear-bases" && selectedCategory !== "currency" && (
                    <div className="tier-empty-state">
                      <p style={{ color: "var(--muted)", fontSize: 14, padding: "24px", textAlign: "center" }}>
                        {categories.find((c) => c.id === selectedCategory)?.name || 
                         currencyTypes.find((t) => t.id === selectedCategory)?.name || 
                         selectedCategory} 티어 리스트 데이터가 곧 추가될 예정입니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 하단 버튼 영역 */}
        <div className="tier-list-actions">
          <button className="action-button action-button-secondary" onClick={handleImport}>
            {lang === "ko" ? "불러오기" : "IMPORT"}
            <span className="dropdown-icon">▼</span>
          </button>
          <button className="action-button action-button-primary" onClick={handleDownload}>
            {lang === "ko" ? "다운로드" : "DOWNLOAD"}
          </button>
          <button className="action-button action-button-primary" onClick={() => alert(lang === "ko" ? "계정 연동 기능은 준비 중입니다." : "Account sync feature coming soon.")}>
            {lang === "ko" ? "계정 연동" : "SYNC TO POE2"}
          </button>
          <button className="action-button action-button-secondary" onClick={handleCopy}>
            {lang === "ko" ? "복사하기" : "COPY TO CLIPBOARD"}
          </button>
          <button className="action-button action-button-secondary" onClick={handleReset}>
            {lang === "ko" ? "초기화" : "RESET"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .tier-list-description-section {
          width: 100%;
          margin-bottom: 24px;
          padding: 0;
        }

        .tier-list-description-content {
          width: 100%;
          padding: 16px 24px;
          background: #1a1a1a;
          border: 1px solid var(--border);
        }

        .tier-list-info {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .info-item {
          display: flex;
          gap: 4px;
        }

        .tier-list-filters {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin: 0;
          padding: 16px 24px;
        }

        .category-tabs-wrapper {
          position: relative;
          overflow: hidden;
          flex: 1;
        }

        .category-tabs {
          display: flex;
          gap: 0;
          align-items: flex-end;
          position: relative;
          width: fit-content;
        }

        .league-filters {
          display: flex;
          gap: 2px;
          align-items: center;
          margin-left: auto;
        }

        .category-tab {
          padding: 12px 24px 10px 24px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
          margin-right: -12px;
        }

        .category-tab:first-child {
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%);
          margin-left: 0;
        }

        .category-tab:last-child {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 12px 100%);
          margin-right: 0;
          padding-right: 24px;
        }

        .category-tab:hover {
          color: var(--text);
        }

        .category-tab.active {
          color: var(--poe2-secondary, #ffffff);
          border-bottom-color: var(--poe2-primary, var(--game-primary));
          background: var(--poe2-primary, var(--game-primary));
          z-index: 1;
        }

        .category-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--poe2-primary, var(--game-primary));
          z-index: 2;
        }

        .league-filter {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .league-filter:hover {
          color: var(--text);
        }

        .league-filter.active {
          color: var(--text);
          background: rgba(255, 255, 255, 0.08);
        }

        .currency-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 20px;
          padding-bottom: 20px;
          border-top: 1px solid var(--border);
        }

        .currency-filter-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .except-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .except-label {
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .except-checkboxes {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .except-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          user-select: none;
        }

        .except-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .except-checkbox:hover {
          color: var(--text);
        }

        .league-filters-inline {
          display: flex;
          gap: 2px;
          align-items: center;
        }

        .class-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 20px;
          padding-bottom: 20px;
          border-top: 1px solid var(--border);
        }

        .coming-soon-content {
          padding: 48px 24px;
        }

        .coming-soon-card {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          padding: 48px;
          text-align: center;
        }

        .coming-soon-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
        }

        .coming-soon-description {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.6;
        }

        .class-selector-label {
          font-size: 14px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .custom-dropdown {
          position: relative;
          min-width: 140px;
          max-width: 180px;
        }

        .dropdown-trigger {
          padding: 8px 12px;
          background: #2a2a2a;
          border: 1px solid var(--border);
          border-radius: 0;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.2s;
        }

        .dropdown-trigger:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .dropdown-arrow {
          font-size: 10px;
          opacity: 0.7;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          margin-top: 4px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dropdown-category {
          padding: 8px 12px;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          background: #0f0f0f;
          border-bottom: 1px solid var(--border);
        }

        .dropdown-option {
          padding: 8px 12px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-option:hover {
          background: #2a2a2a;
        }

        .dropdown-option.selected {
          background: #2a2a2a;
          color: var(--tier-s);
        }

        .dropdown-option-indented {
          padding-left: 24px;
        }

        .tier-grid-main {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          margin-top: 0;
          margin-bottom: 0;
        }

        .tier-column {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          padding-right: 16px;
          margin-right: 16px;
        }

        .tier-column:last-child {
          border-right: none;
          padding-right: 0;
          margin-right: 0;
        }

        .tier-header {
          padding: 8px 12px;
          border-radius: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .tier-label {
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .tier-count {
          font-size: 11px;
          opacity: 0.9;
        }

        .tier-items {
          flex: 1;
          overflow: visible;
        }

        .tier-class-group {
          margin-bottom: 16px;
        }

        .tier-class-name {
          font-size: 13px;
          color: var(--game-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .tier-item {
          padding: 6px 12px;
          border-radius: 0;
          margin-bottom: 4px;
          cursor: default;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .tier-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tier-item-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .tier-item-meta {
          font-size: 10px;
          opacity: 0.7;
        }

        .tier-e-divider {
          margin-top: 24px;
          margin-bottom: 16px;
          padding-top: 24px;
          border-top: 2px solid var(--border);
        }

        .tier-e-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--tier-e);
          border-radius: 0;
          margin-bottom: 12px;
        }

        .tier-e-label {
          font-size: 14px;
          font-weight: 700;
          color: rgb(220, 175, 132);
          letter-spacing: 0.5px;
        }

        .tier-e-count {
          font-size: 11px;
          color: rgb(220, 175, 132);
          opacity: 0.9;
        }

        .tier-list-actions {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border);
          background: var(--panel);
          justify-content: flex-start;
          align-items: center;
        }

        /* tier-action-btn 스타일 제거 - 전역 action-button 스타일 사용 */

        /* tier-action-icon 스타일 제거 - 전역 dropdown-icon 스타일 사용 */

        @media (max-width: 1200px) {
          .tier-grid-main {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tier-grid-main {
            grid-template-columns: 1fr;
          }

          .tier-e-grid {
            grid-template-columns: 1fr;
          }

          .tier-list-actions {
            flex-wrap: wrap;
            gap: 8px;
          }

          .tier-action-btn {
            padding: 8px 16px;
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}
