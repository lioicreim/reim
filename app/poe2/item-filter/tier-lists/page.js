"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import bases from "@/data/bases.json";
import classes from "@/data/classes.json";
import currencyTiers from "@/data/currency-tiers.json";
import { translateItemName, translateClassName } from "@/lib/translations";
import ItemFilterActions from "@/app/components/ItemFilterActions";
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
  const [selectedCurrencyTypes, setSelectedCurrencyTypes] = useState([]); // 다중 선택: 빈 배열이면 "전체"
  const [tempSelectedCurrencyTypes, setTempSelectedCurrencyTypes] = useState([]); // 임시 선택 상태
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isArmourTypeDropdownOpen, setIsArmourTypeDropdownOpen] = useState(false);
  const [selectedArmourType, setSelectedArmourType] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // 화폐 종류 드롭다운에서 선택한 카테고리 추적
  const [activeCurrencyCategory, setActiveCurrencyCategory] = useState("");

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
  
  const pathname = usePathname();

  // 티어리스트 카테고리 (상단 탭에 표시되는 메인 카테고리)
  const categories = [
    { id: "currency", name: "화폐", nameEn: "Currency" },
    { id: "uniques", name: "유니크", nameEn: "Uniques" },
    { id: "gear-bases", name: "장비", nameEn: "Gear Bases" },
    { id: "mods", name: "모드", nameEn: "Mods" },
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

  // URL 경로에서 카테고리 추출
  useEffect(() => {
    if (!pathname) return;
    const categoryFromPath = pathname.split("/").pop() || "";
    const validCat = categories.find((c) => c.id === categoryFromPath)?.id || "currency";
    if (validCat !== selectedCategory) {
      setSelectedCategory(validCat);
    }
  }, [pathname, categories]);
  
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

  // 자주 검색하는 화폐 ID 목록
  const frequentCurrencyIds = ["currency", "runes", "essences", "waystones"];
  
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
    // selectedLeague를 그대로 사용 (default 키가 존재함)
    const leagueKey = selectedLeague;
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

  // 검색어 debounce 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150); // 150ms 지연 (더 빠른 반응)

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest(".filter-multi-dropdown")) {
        // 확인 없이 외부 클릭 시 취소 (임시 선택 상태 초기화)
        setTempSelectedCurrencyTypes([...selectedCurrencyTypes]);
        setIsFilterDropdownOpen(false);
      }
      if (isClassDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsClassDropdownOpen(false);
      }
      if (isArmourTypeDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsArmourTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterDropdownOpen, isClassDropdownOpen, isArmourTypeDropdownOpen, selectedCurrencyTypes]);

  // 화폐 아이템의 실제 티어 가져오기 (커스텀 티어 우선)
  const getCurrencyItemTier = (itemName) => {
    // selectedLeague를 그대로 사용 (default 키가 존재함)
    const leagueKey = selectedLeague;
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
    
    // selectedLeague를 그대로 사용 (default 키가 존재함)
    const leagueKey = selectedLeague;
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
  const handleResetAll = (onSuccess) => {
    // 전체 초기화: 모든 설정 초기화
    setCustomCurrencyTiers({});
    setCustomGearTiers({});
    
    // 다른 페이지의 설정도 초기화
    if (typeof window !== "undefined") {
      localStorage.removeItem("quickFilter_gold");
      const leagues = ["default", "normal", "early", "mid", "late", "ssf"];
      leagues.forEach(league => {
        // selectedLeague를 그대로 사용 (default 키가 존재함)
        const leagueKey = league;
        localStorage.removeItem(`tier-list-custom-currency-${leagueKey}`);
      });
      localStorage.removeItem("tier-list-custom-gear");
    }
    
    if (onSuccess) {
      onSuccess(lang === "ko" ? "전체 설정이 초기화되었습니다." : "All settings have been reset.");
    }
  };

  const handleResetPage = (onSuccess) => {
    // 이 페이지만: 현재 페이지의 설정만 초기화
    if (selectedCategory === "currency") {
      // selectedLeague를 그대로 사용 (default 키가 존재함)
      const leagueKey = selectedLeague;
      const currencyKey = `tier-list-custom-currency-${leagueKey}`;
      localStorage.removeItem(currencyKey);
      setCustomCurrencyTiers({});
    } else if (selectedCategory === "gear-bases") {
      const gearKey = "tier-list-custom-gear";
      localStorage.removeItem(gearKey);
      setCustomGearTiers({});
    }
    
    if (onSuccess) {
      onSuccess(lang === "ko" ? "이 페이지의 설정이 초기화되었습니다." : "This page's settings have been reset.");
    }
  };

  // 다운로드 (JSON 파일로)
  const handleDownload = () => {
    let data = {};
    if (selectedCategory === "currency") {
      // selectedLeague를 그대로 사용 (default 키가 존재함)
      const leagueKey = selectedLeague;
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
      // selectedLeague를 그대로 사용 (default 키가 존재함)
      const leagueKey = selectedLeague;
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
            // selectedLeague를 그대로 사용 (default 키가 존재함)
            const leagueKey = selectedLeague;
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
      {/* 화폐 카테고리일 때 Currency Types 드롭다운, 체크박스, 시세 그룹 표시 - 설명 영역 아래 */}
      {selectedCategory === "currency" && (
        <div className="currency-filter-row">
          <div className="currency-filter-left">
            <label className="class-selector-label">
              {lang === "ko" ? "화폐 종류" : "CURRENCY TYPES"}
            </label>
            <div className="custom-dropdown filter-multi-dropdown">
              <div
                className="dropdown-trigger"
                onClick={() => {
                  if (!isFilterDropdownOpen) {
                    // 드롭다운 열 때 현재 선택된 값으로 임시 상태 초기화
                    setTempSelectedCurrencyTypes([...selectedCurrencyTypes]);
                  }
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                }}
              >
                {selectedCurrencyTypes.length === 0
                  ? (lang === "ko" ? "전체" : "All")
                  : selectedCurrencyTypes.length === 1
                  ? currencyTypes.find(t => t.id === selectedCurrencyTypes[0])?.name || (lang === "ko" ? "전체" : "All")
                  : `${selectedCurrencyTypes.length} ${lang === "ko" ? "개 선택" : "selected"}`}
                <span className="dropdown-arrow">▼</span>
              </div>
              {isFilterDropdownOpen && (
                <div className="dropdown-menu filter-multi-menu">
                  <div className="filter-header-row">
                    <div
                      className={`dropdown-option-multi filter-all-option ${
                        tempSelectedCurrencyTypes.length === 0 ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempSelectedCurrencyTypes([]);
                        // 창은 열어둠 (외부 클릭이나 확인 버튼으로만 닫힘)
                      }}
                    >
                      <span>{lang === "ko" ? "전체" : "All"}</span>
                    </div>
                    {tempSelectedCurrencyTypes.length >= 1 && (
                      <button
                        className="filter-confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCurrencyTypes([...tempSelectedCurrencyTypes]);
                          setIsFilterDropdownOpen(false);
                          // 선택된 첫 번째 카테고리로 activeCurrencyCategory 설정
                          if (tempSelectedCurrencyTypes.length > 0) {
                            setActiveCurrencyCategory(tempSelectedCurrencyTypes[0]);
                          } else {
                            setActiveCurrencyCategory("");
                          }
                        }}
                      >
                        {lang === "ko" ? "확인" : "Confirm"}
                      </button>
                    )}
                  </div>
                  {(() => {
                    const filteredTypes = currencyTypes.filter(t => t.id !== "");
                    
                    // 자주 검색하는 화폐와 나머지 분리
                    const frequentTypes = filteredTypes.filter(t => frequentCurrencyIds.includes(t.id));
                    const otherTypes = filteredTypes.filter(t => !frequentCurrencyIds.includes(t.id));
                    
                    // 자주 검색하는 화폐는 정의된 순서대로 유지
                    const sortedFrequent = frequentTypes.sort((a, b) => {
                      const indexA = frequentCurrencyIds.indexOf(a.id);
                      const indexB = frequentCurrencyIds.indexOf(b.id);
                      return indexA - indexB;
                    });
                    
                    // 나머지 화폐는 언어별 정렬
                    const sortedOther = otherTypes.sort((a, b) => {
                      if (lang === "ko") {
                        return a.name.localeCompare(b.name, "ko");
                      } else {
                        return a.name.localeCompare(b.name, "en");
                      }
                    });
                    
                    // 자주 검색하는 화폐를 먼저, 나머지를 나중에 배치
                    return [...sortedFrequent, ...sortedOther];
                  })().map((type) => {
                    const isSelected = tempSelectedCurrencyTypes.includes(type.id);
                    return (
                      <div
                        key={type.id}
                        className={`dropdown-option-multi ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const current = [...tempSelectedCurrencyTypes];
                          if (isSelected) {
                            const index = current.indexOf(type.id);
                            current.splice(index, 1);
                          } else {
                            current.push(type.id);
                          }
                          setTempSelectedCurrencyTypes(current);
                          // 창은 열어둠 (외부 클릭이나 확인 버튼으로만 닫힘)
                        }}
                      >
                        <span>{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* 아이템 검색 input */}
            <div className="item-search-wrapper">
              <div className="item-search-input">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder={lang === "ko" ? "아이템 검색..." : "Search items..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="item-search-field"
                />
                <button
                  type="button"
                  className={`item-search-clear ${searchQuery ? "item-search-clear-visible" : "item-search-clear-hidden"}`}
                  onClick={() => setSearchQuery("")}
                  aria-label={lang === "ko" ? "검색어 지우기" : "Clear search"}
                  disabled={!searchQuery}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
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

      {/* 장비 베이스 카테고리일 때 클래스 선택 드롭다운 표시 - 설명 영역 아래 */}
      {selectedCategory === "gear-bases" && (
        <div className="class-selector">
              <label className="class-selector-label">
                {lang === "ko" ? "아이템 종류" : "ITEM CLASS"}
              </label>
              <div className="custom-dropdown">
                <div
                  className="dropdown-trigger"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                >
                  {selectedClass ? translateClassName(selectedClass) : "전체 클래스"}
                  <span className="dropdown-arrow">▼</span>
                </div>
                {isClassDropdownOpen && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedClass("");
                        setIsClassDropdownOpen(false);
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
                                setIsClassDropdownOpen(false);
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

      <div className="card">
        <div className="cardBody" style={{ paddingTop: 0 }}>
          {/* 모든 카테고리에서 티어 그리드 표시 */}
          {/* S, A, B, C, D 티어 그리드 */}
          <div className={`tier-grid-main ${selectedCategory === "uniques" || selectedCategory === "mods" ? "tier-grid-spaced" : ""}`}>
            {["S", "A", "B", "C", "D"].map((tier) => (
              <div key={tier} className={`tier-column ${selectedCategory === "uniques" || selectedCategory === "mods" ? "tier-column-spaced" : ""}`}>
                <div
                  className="tier-header"
                  style={{
                    background: tierColors[tier],
                    color: tier === "C" ? "#000000" : "#ffffff",
                  }}
                >
                  <div className="tier-label">{tier} 티어</div>
                  <div className="tier-count">
                    {(() => {
                      if (selectedCategory === "currency") {
                        // selectedLeague를 그대로 사용 (default 키가 존재함)
                        const leagueKey = selectedLeague;
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
                        // selectedLeague를 그대로 사용 (default 키가 존재함)
                        const leagueKey = selectedLeague;
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
                        
                        // 검색어로 필터링 (한글/영문 모두 검색 가능, 최적화된 버전)
                        const filteredItems = debouncedSearchQuery.trim() 
                          ? (() => {
                              const searchQueryLower = debouncedSearchQuery.toLowerCase();
                              // 역방향 검색을 위한 캐시: 검색어가 한글일 때 매칭되는 영문 키들
                              const reverseMatchKeys = new Set();
                              
                              // 검색어가 한글인 경우에만 역방향 검색 수행 (성능 최적화)
                              const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(debouncedSearchQuery);
                              
                              if (isKorean) {
                                // dict에서 검색어가 포함된 항목의 키만 찾기
                                for (const [key, value] of Object.entries(dict)) {
                                  if (typeof value === 'string' && value.toLowerCase().includes(searchQueryLower)) {
                                    reverseMatchKeys.add(key.toLowerCase());
                                    reverseMatchKeys.add(key.replace(/\s/g, "_").toLowerCase());
                                    reverseMatchKeys.add(encodeURIComponent(key).toLowerCase());
                                  }
                                }
                              }
                              
                              return allCurrencyItems.filter(itemName => {
                                const itemNameLower = itemName.toLowerCase();
                                const translatedName = translateItemName(itemName);
                                const translatedNameLower = translatedName.toLowerCase();
                                
                                // 원본 이름(영문)과 번역된 이름(한글) 검색
                                if (itemNameLower.includes(searchQueryLower) || 
                                    translatedNameLower.includes(searchQueryLower)) {
                                  return true;
                                }
                                
                                // 역방향 검색: 검색어가 한글일 때만 수행
                                if (isKorean && reverseMatchKeys.has(itemNameLower)) {
                                  return true;
                                }
                                
                                return false;
                              });
                            })()
                          : allCurrencyItems;
                        
                        if (filteredItems.length === 0) return null;
                        
                        const getTierTextColor = (tier) => {
                          if (tier === "S") return "#000000";
                          if (tier === "A" || tier === "B") return "#ffffff";
                          if (tier === "E") return "rgb(220, 175, 132)";
                          return "#000000";
                        };
                        
                        return filteredItems.map((itemName) => {
                          const actualTier = getCurrencyItemTier(itemName);
                          return (
                            <div
                              key={itemName}
                              className="tier-item"
                              draggable
                              onDragStart={(e) => handleDragStart(e, itemName, actualTier)}
                              onDragOver={handleDragOver}
                              style={{
                                cursor: "grab",
                              }}
                              title={translateItemName(itemName)}
                            >
                              <div className="tier-item-drag-handle">
                                <div className="tier-item-drag-handle-dots">
                                  <div className="tier-item-drag-handle-dot"></div>
                                  <div className="tier-item-drag-handle-dot"></div>
                                </div>
                                <div className="tier-item-drag-handle-dots">
                                  <div className="tier-item-drag-handle-dot"></div>
                                  <div className="tier-item-drag-handle-dot"></div>
                                </div>
                                <div className="tier-item-drag-handle-dots">
                                  <div className="tier-item-drag-handle-dot"></div>
                                  <div className="tier-item-drag-handle-dot"></div>
                                </div>
                              </div>
                              <div 
                                className="tier-item-name"
                                style={{
                                  color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined
                                }}
                              >
                                {translateItemName(itemName)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
                      {/* D 티어 열에 E 티어 화폐 아이템들 추가 */}
                      {tier === "D" && (
                        <>
                          {(() => {
                            // selectedLeague를 그대로 사용 (default 키가 존재함)
                            const leagueKey = selectedLeague;
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
                                        cursor: "grab",
                                      }}
                                      title={translateItemName(itemName)}
                                    >
                                      <div className="tier-item-drag-handle">
                                        <div className="tier-item-drag-handle-dots">
                                          <div className="tier-item-drag-handle-dot"></div>
                                          <div className="tier-item-drag-handle-dot"></div>
                                        </div>
                                        <div className="tier-item-drag-handle-dots">
                                          <div className="tier-item-drag-handle-dot"></div>
                                          <div className="tier-item-drag-handle-dot"></div>
                                        </div>
                                        <div className="tier-item-drag-handle-dots">
                                          <div className="tier-item-drag-handle-dot"></div>
                                          <div className="tier-item-drag-handle-dot"></div>
                                        </div>
                                      </div>
                                      <div 
                                        className="tier-item-name"
                                        style={{
                                          color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined
                                        }}
                                      >
                                        {translateItemName(itemName)}
                                      </div>
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
                                      cursor: "grab",
                                    }}
                                    title={`${translateItemName(item.name)} (${item.name}) - ${translateClassName(item.class)}${item.armourType ? ` - ${item.armourType}` : ""}`}
                                  >
                                    <div className="tier-item-drag-handle">
                                      <div className="tier-item-drag-handle-dots">
                                        <div className="tier-item-drag-handle-dot"></div>
                                        <div className="tier-item-drag-handle-dot"></div>
                                      </div>
                                      <div className="tier-item-drag-handle-dots">
                                        <div className="tier-item-drag-handle-dot"></div>
                                        <div className="tier-item-drag-handle-dot"></div>
                                      </div>
                                      <div className="tier-item-drag-handle-dots">
                                        <div className="tier-item-drag-handle-dot"></div>
                                        <div className="tier-item-drag-handle-dot"></div>
                                      </div>
                                    </div>
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
                                              cursor: "grab",
                                            }}
                                            title={`${translateItemName(item.name)} (${item.name}) - ${translateClassName(item.class)}${item.armourType ? ` - ${item.armourType}` : ""}`}
                                          >
                                            <div className="tier-item-drag-handle">
                                              <div className="tier-item-drag-handle-dots">
                                                <div className="tier-item-drag-handle-dot"></div>
                                                <div className="tier-item-drag-handle-dot"></div>
                                              </div>
                                              <div className="tier-item-drag-handle-dots">
                                                <div className="tier-item-drag-handle-dot"></div>
                                                <div className="tier-item-drag-handle-dot"></div>
                                              </div>
                                              <div className="tier-item-drag-handle-dots">
                                                <div className="tier-item-drag-handle-dot"></div>
                                                <div className="tier-item-drag-handle-dot"></div>
                                              </div>
                                            </div>
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
                  
                  {/* 다른 카테고리들 (유니크, 모드 등) - 각 티어별로 아이템이 없으면 빈 버튼 표시 */}
                  {selectedCategory !== "gear-bases" && selectedCategory !== "currency" && (() => {
                    // 현재 티어에 아이템이 있는지 확인 (현재는 데이터가 없으므로 항상 빈 버튼)
                    // TODO: 실제 데이터가 추가되면 여기서 아이템 개수를 확인
                    const hasItems = false; // 임시로 false
                    
                    if (!hasItems) {
                      return (
                        <div className="tier-item tier-empty-button">
                          <div style={{ 
                            color: "var(--muted)", 
                            fontSize: 13, 
                            textAlign: "center",
                            lineHeight: "1.5",
                            width: "100%",
                            padding: "0 8px"
                          }}>
                            해당하는 데이터가 없거나<br />업데이트 예정입니다.
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* 하단 액션 버튼들 */}
      <ItemFilterActions
        lang={lang}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onResetAll={handleResetAll}
        onResetPage={handleResetPage}
        onLoadFromFile={handleImport}
        onSaveAsDefault={(presetId) => {
          if (
            confirm(
              lang === "ko"
                ? `현재 설정을 기본값으로 저장하시겠습니까?`
                : `Save current settings as default?`
            )
          ) {
            // TODO: 실제 저장 로직 구현
            alert(lang === "ko" ? "기본값으로 저장되었습니다!" : "Saved as default!");
          }
        }}
      />

      <style jsx>{`
        .container {
          padding-top: 0;
          margin-top: 16px;
          background: var(--foreground) !important;
        }

        :global(.cardBody) {
          background: #0a0a0a !important;
          border: none !important;
          box-shadow: none !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        :global(.card) {
          border: none !important;
        }

        .league-filter {
          padding: 4px 8px;
          height: 38px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: 0;
          color: var(--color-gray-500);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-sizing: border-box;
        }

        .league-filter:hover {
          color: var(--text);
        }

        .league-filter.active {
          background: #1a1a2e;
          border: 2px solid var(--poe2-primary, var(--game-primary));
          color: #ffffff;
        }

        .currency-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin: 0;
          margin-top: 0;
          margin-bottom: 0;
          padding: 8px 10px;
          background: #1a1a1a;
          width: 100%;
        }

        .currency-filter-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          padding-left: 0;
        }

        .item-search-wrapper {
          display: flex;
          align-items: center;
        }

        .item-search-input {
          position: relative;
          display: flex;
          align-items: center;
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: 0;
          height: 38px;
          padding: 0 12px;
          gap: 8px;
        }

        .item-search-input svg {
          flex-shrink: 0;
          color: var(--muted);
        }

        .item-search-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: var(--font-sans);
          width: 100%;
        }

        .item-search-field::placeholder {
          color: var(--muted);
        }

        .item-search-clear {
          flex-shrink: 0;
          background: transparent;
          border: none;
          padding: 4px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          transition: opacity 0.2s, color 0.2s;
        }

        .item-search-clear-hidden {
          opacity: 0;
          pointer-events: none;
          cursor: default;
        }

        .item-search-clear-visible {
          opacity: 1;
          cursor: pointer;
        }

        .item-search-clear-visible:hover {
          color: var(--text);
        }

        .item-search-input:focus-within {
          border-color: var(--poe2-primary, var(--game-primary));
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
          margin: 0 -24px;
          margin-top: 0;
          margin-bottom: 0;
          padding: 16px 24px;
          background: #0a0a0a;
          width: calc(100% + 48px);
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
          font-size: 16px;
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
          padding: 0 10px !important;
          background: #0a0a0a !important;
          border: 1px solid var(--border) !important;
          border-radius: 0 !important;
          color: var(--text);
          font-size: 14px !important;
          height: 38px !important;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        .dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--border) !important;
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

        /* 다중 선택 드롭다운 스타일 */
        .filter-multi-dropdown {
          min-width: 150px;
          max-width: 210px;
        }

        .filter-multi-menu {
          max-height: 400px;
        }

        .filter-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border);
          padding: 0;
        }

        .filter-all-option {
          flex: 1;
          border-bottom: none !important;
        }

        .dropdown-option-multi {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-option-multi:last-child {
          border-bottom: none;
        }

        .dropdown-option-multi:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-option-multi.selected {
          background: var(--poe2-primary, var(--game-primary));
          color: #ffffff;
        }

        .dropdown-option-multi span {
          flex: 1;
          text-align: left;
        }

        .filter-confirm-btn {
          padding: 6px 12px;
          margin: 4px 8px 4px 0;
          background: var(--poe2-primary, var(--game-primary));
          border: none;
          border-radius: 0;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .filter-confirm-btn:hover {
          opacity: 0.9;
        }

        .tier-grid-main {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-top: 0;
          margin-bottom: 0;
          background: transparent;
        }

        /* 유니크와 모드 카테고리일 때 티어 간 간격을 더 명확하게 */
        .tier-grid-spaced {
          gap: 12px;
        }

        .tier-column-spaced {
          background: var(--foreground);
        }

        .tier-column {
          display: flex;
          flex-direction: column;
        }

        .tier-header {
          padding: 12px;
          border-radius: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 900;
          margin-bottom: 0;
          height: 52px;
          box-sizing: border-box;
        }

        .tier-label {
          font-size: var(--text-lg);
          letter-spacing: 0.5px;
          font-weight: 900;
        }

        .tier-count {
          font-size: 14px;
          opacity: 0.9;
          font-weight: normal;
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
          padding: 8px;
          height: 40px;
          border-radius: 0;
          margin-bottom: 1px;
          cursor: default;
          background: #1a1a1a !important;
          color: #BDBDBD;
          display: flex;
          align-items: center;
          gap: 8px;
          box-sizing: border-box;
        }

        .tier-item.tier-empty-button {
          height: 80px;
          min-height: 80px;
          align-items: center;
          justify-content: center;
          background: #1a1a1a !important;
          border: none;
          display: flex;
        }

        .tier-item.tier-empty-button:hover {
          background: #1a1a1a !important;
        }

        .tier-item:hover {
          background: #363636 !important;
        }

        .tier-item-drag-handle {
          display: flex;
          flex-direction: column;
          gap: 2px;
          cursor: grab;
          opacity: 0.6;
          flex-shrink: 0;
        }

        .tier-item-drag-handle-dots {
          display: flex;
          gap: 2px;
        }

        .tier-item-drag-handle-dot {
          width: 3px;
          height: 3px;
          background: var(--color-gray-500);
          border-radius: 50%;
        }

        .tier-item-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #BDBDBD;
          flex: 1;
        }

        .tier-item-meta {
          font-size: 10px;
          opacity: 0.7;
          color: #BDBDBD;
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
          padding: 12px;
          background: var(--tier-e);
          border: 1px solid rgb(220, 175, 132);
          border-radius: 0;
          margin-bottom: 0;
          height: 52px;
          box-sizing: border-box;
          font-weight: 900;
        }

        .tier-e-label {
          font-size: var(--text-lg);
          letter-spacing: 0.5px;
          font-weight: 900;
          color: rgb(220, 175, 132);
        }

        .tier-e-count {
          font-size: 14px;
          opacity: 0.9;
          font-weight: normal;
          color: rgb(220, 175, 132);
        }

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
        }
      `}</style>
    </main>
  );
}
