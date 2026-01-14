"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import bases from "@/data/bases.json";
import classes from "@/data/classes.json";
import currencyTiers from "@/data/currency-tiers.json";
import { translateItemName, translateClassName } from "@/lib/translations";
import ItemFilterActions from "@/app/components/ItemFilterActions";
import dict from "@/data/dict.json";
import currencyItemCategories from "@/data/currency-item-categories.json";
import CurrencyTypeColorEditor from "@/app/components/CurrencyTypeColorEditor";
import presetsData from "@/data/presets.json";
import uniquesTiers from "@/data/uniques-tiers.json";
import quickFilterDefaults from "@/data/quick-filter-defaults.json";
import NotificationModal from "@/app/components/NotificationModal";
import StyleSettingsModal from "@/app/components/StyleSettingsModal";
import currencyTypeDefaultColors from "@/data/currency-type-default-colors.json";
import filterRules from "@/data/filter-rules.json";
import { generateFilterCode } from "@/lib/filter-generator";
import modsTiersData from "@/data/mods-tiers.json";
import ModDetailModal from "@/app/components/ModDetailModal";
import ItemTooltip from "@/app/components/ItemTooltip";
import itemDefinitions from "@/data/item-definitions-ko.json";

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

const FALLBACK_ICON_SRC = "/item-fallback.svg";

function getItemIconSrc(itemDef) {
  const url = itemDef?.iconUrl;
  if (!url) return FALLBACK_ICON_SRC;

  // poe2db CDN에서 일부 폴더 아이콘이 403/404로 막히는 케이스가 있어
  // (예: ReliquaryKeys, SoulCores) 해당 경로는 즉시 fallback을 사용합니다.
  if (
    url.includes("/Currency/ReliquaryKeys/") ||
    url.includes("/Currency/SoulCores/")
  ) {
    return FALLBACK_ICON_SRC;
  }

  return url;
}

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
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // 다중 선택 모드 활성화 여부 (기본값: false = 개별 선택)
  const [isSelectModeDropdownOpen, setIsSelectModeDropdownOpen] = useState(false); // 선택 모드 드롭다운 열림 상태
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isArmourTypeDropdownOpen, setIsArmourTypeDropdownOpen] = useState(false);
  const [selectedArmourType, setSelectedArmourType] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // 유니크 전용 검색 상태
  const [uniqueSearchQuery, setUniqueSearchQuery] = useState("");
  const [debouncedUniqueSearchQuery, setDebouncedUniqueSearchQuery] = useState("");
  const [selectedUniqueTier, setSelectedUniqueTier] = useState("C"); // 기본값은 C 티어
  const [isUniqueTierDropdownOpen, setIsUniqueTierDropdownOpen] = useState(false);
  const [selectedUniqueItem, setSelectedUniqueItem] = useState(null); // 검색 결과에서 선택된 아이템 (baseType)
  
  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuItem, setContextMenuItem] = useState(null);
  
  // 삭제 확인 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // 추가 성공 알림 모달 상태
  const [addSuccessModalOpen, setAddSuccessModalOpen] = useState(false);
  const [addedItemInfo, setAddedItemInfo] = useState(null); // { baseType, tier }
  
  // 일반 알림 모달 상태
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    autoCloseDelay: 0,
  });
  
  // 확인 모달 상태 (confirm 대체)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // 모드 상세 모달 상태
  const [selectedModForDetail, setSelectedModForDetail] = useState(null);
  const [isModDetailModalOpen, setIsModDetailModalOpen] = useState(false);

  // 티어 스타일 설정 모달 상태
  const [tierStyleModal, setTierStyleModal] = useState({
    isOpen: false,
    tier: null, // "S", "A", "B", "C", "D"
    currencyType: null, // 화폐 종류 ID (null이면 "전체")
    styles: null, // 현재 스타일 설정
  });
  
  // 화폐 종류 드롭다운에서 선택한 카테고리 추적
  const [activeCurrencyCategory, setActiveCurrencyCategory] = useState("");

  // 드래그 앤 드롭 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromTier, setDraggedFromTier] = useState(null);
  
  // 커스텀 티어 정보 (로컬스토리지에서 불러온 사용자 커스텀 설정)
  const [customCurrencyTiers, setCustomCurrencyTiers] = useState({});
  const [customGearTiers, setCustomGearTiers] = useState({});
  const [customUniquesTiers, setCustomUniquesTiers] = useState({});
  const [customModsTiers, setCustomModsTiers] = useState({});
  
  // 다중 선택 상태 (화폐 아이템 선택)
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isColorEditorOpen, setIsColorEditorOpen] = useState(false);
  const [editingCurrencyType, setEditingCurrencyType] = useState(null);
  const [soundOption, setSoundOption] = useState("default");
  
  // 제외된 아이템 (기본 리스트에서 제거된 항목들)
  const [excludedItems, setExcludedItems] = useState({}); // { category: [itemNames] }
  
  // 외부 클릭 시 드롭다운 닫기 및 스크롤바 레이아웃 시프트 방지
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 선택 모드 드롭다운 닫기
      if (isSelectModeDropdownOpen) {
        const selectModeDropdown = event.target.closest('.select-mode-dropdown');
        if (!selectModeDropdown) {
          setIsSelectModeDropdownOpen(false);
        }
      }
      // 화폐 종류 드롭다운 닫기
      if (isFilterDropdownOpen) {
        const filterDropdown = event.target.closest('.filter-multi-dropdown');
        if (!filterDropdown) {
          setIsFilterDropdownOpen(false);
        }
      }
      // 유니크 티어 선택 드롭다운 닫기
      if (isUniqueTierDropdownOpen) {
        const uniqueTierDropdown = event.target.closest('.unique-tier-selector');
        if (!uniqueTierDropdown) {
          setIsUniqueTierDropdownOpen(false);
        }
      }
    };
    
    if (isSelectModeDropdownOpen || isFilterDropdownOpen || isUniqueTierDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSelectModeDropdownOpen, isFilterDropdownOpen, isUniqueTierDropdownOpen]);

  // 드롭다운 열림/닫힘 시 스크롤바로 인한 레이아웃 시프트 방지
  // 이제는 CSS의 scrollbar-gutter: stable로 처리하므로 JavaScript 조작 제거
  
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
           { id: "recent", name: "최근 시세", isComingSoon: true }, // 실시간 시세 (업데이트 예정)
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

  // 사운드 옵션 불러오기
  useEffect(() => {
    const savedOption = localStorage.getItem("poe2_sound_option") || "default";
    setSoundOption(savedOption);

    const handleStorage = (e) => {
      if (e.key === "poe2_sound_option") setSoundOption(e.newValue || "default");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 제외된 아이템 로드
  useEffect(() => {
    const savedExcluded = localStorage.getItem("tier-list-excluded-items");
    if (savedExcluded) {
      setExcludedItems(JSON.parse(savedExcluded));
    }
  }, []);

  // 제외된 아이템 저장
  useEffect(() => {
    if (Object.keys(excludedItems).length > 0) {
      localStorage.setItem("tier-list-excluded-items", JSON.stringify(excludedItems));
    }
  }, [excludedItems]);

  // 화폐 종류 드롭다운에서 제외할 항목들
  const excludedCurrencyTypes = ["waystones", "jewels", "flask", "charm", "uncut_gems"];
  
  // 자주 검색하는 화폐 ID 목록 (제외된 항목 제외)
  const frequentCurrencyIds = ["currency", "runes", "essences", "waystones"].filter(id => !excludedCurrencyTypes.includes(id));
  
  // 화폐 종류 (Currency Types) - 언어에 따라 표시
  // 화폐 카테고리 선택 시 드롭다운에서 세부 카테고리 선택 가능
  // 주의: ID는 filter-rules.json의 section 이름과 일치해야 함 (언더스코어 사용)
  const currencyTypes = [
    { id: "", name: lang === "ko" ? "전체" : "All" },
    { id: "currency", name: lang === "ko" ? "화폐" : "Currency" },
    { id: "waystones", name: lang === "ko" ? "경로석" : "Waystones" },
    { id: "essences", name: lang === "ko" ? "에센스" : "Essences" },
    { id: "ritual_omen", name: lang === "ko" ? "징조" : "Ritual Omen" },
    { id: "runes", name: lang === "ko" ? "룬" : "Runes" },
    { id: "delirium", name: lang === "ko" ? "환영" : "Delirium" },
    { id: "breach", name: lang === "ko" ? "균열" : "Breach" },
    { id: "ancient_bones", name: lang === "ko" ? "고대 뼈" : "Ancient Bones" },
    { id: "abyssal", name: lang === "ko" ? "심연" : "Abyssal" },
    { id: "tablet", name: lang === "ko" ? "서판" : "Tablet" },
    { id: "uncut_gems", name: lang === "ko" ? "미가공 젬" : "Uncut Gems" },
    { id: "lineage_gems", name: lang === "ko" ? "혈통 젬" : "Lineage Gems" },
    { id: "jewels", name: lang === "ko" ? "주얼" : "Jewels" },
    { id: "charm", name: lang === "ko" ? "호신부" : "Charms" },
    { id: "flask", name: lang === "ko" ? "플라스크" : "Flasks" },
    { id: "pinnacle_key", name: lang === "ko" ? "보스 조각" : "Pinnacle Keys" },
    { id: "map_fragments", name: lang === "ko" ? "맵 조각" : "Map Fragments" },
    { id: "vault_key", name: lang === "ko" ? "금고실 열쇠" : "Vault Keys" },
    { id: "soul_cores", name: lang === "ko" ? "영혼핵" : "Soul Cores" },
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
  
  // 유니크 아이템의 기본 티어 가져오기 (커스텀 티어 제외)
  const getUniquesItemDefaultTier = (baseType) => {
    for (const t of ["S", "A", "B", "C"]) {
      if (uniquesTiers[t] && uniquesTiers[t].includes(baseType)) {
        return t;
      }
    }
    return null;
  };

  // 유니크 아이템의 실제 티어 가져오기 (커스텀 티어 우선)
  const getUniquesItemTier = (baseType) => {
    // 커스텀 티어가 있으면 사용
    if (customUniquesTiers[baseType]) {
      return customUniquesTiers[baseType];
    }
    // 기본 티어 찾기
    return getUniquesItemDefaultTier(baseType);
  };

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

  // 모드 아이템의 실제 티어 가져오기 (커스텀 티어 우선)
  const getModsItemTier = (modId) => {
    // 커스텀 티어가 있으면 사용
    if (customModsTiers[modId]) {
      return customModsTiers[modId];
    }
    // 기본 티어 찾기
    for (const t of ["S", "A", "B", "C"]) {
      if (modsTiersData[t] && modsTiersData[t].some(m => m.id === modId)) {
        return t;
      }
    }
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
    // 유니크 커스텀 티어 불러오기
    if (selectedCategory === "uniques") {
      const uniquesKey = "tier-list-custom-uniques";
      const savedUniquesTiers = localStorage.getItem(uniquesKey);
      if (savedUniquesTiers) {
        try {
          setCustomUniquesTiers(JSON.parse(savedUniquesTiers));
        } catch (e) {
          console.error("Failed to parse saved uniques tiers", e);
        }
      }
    }
    
    // 모드 커스텀 티어 불러오기
    if (selectedCategory === "mods") {
      const modsKey = "tier-list-custom-mods";
      const savedModsTiers = localStorage.getItem(modsKey);
      if (savedModsTiers) {
        try {
          setCustomModsTiers(JSON.parse(savedModsTiers));
        } catch (e) {
          console.error("Failed to parse saved mods tiers", e);
        }
      }
    }
  }, [selectedCategory]);

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
        setCustomCurrencyTiers({});
      }
    } else {
      // 빈 객체는 한 번만 설정 (이미 빈 객체면 업데이트하지 않음)
      setCustomCurrencyTiers(prev => {
        if (Object.keys(prev).length === 0) {
          return prev; // 이미 빈 객체면 변경하지 않음
        }
        return {}; // 변경이 필요한 경우만 업데이트
      });
    }
    
    // 장비 커스텀 티어 불러오기
    const gearKey = "tier-list-custom-gear";
    const savedGearTiers = localStorage.getItem(gearKey);
    if (savedGearTiers) {
      try {
        setCustomGearTiers(JSON.parse(savedGearTiers));
      } catch (e) {
        console.error("Failed to parse saved gear tiers:", e);
        setCustomGearTiers({});
      }
    } else {
      // 빈 객체는 한 번만 설정 (이미 빈 객체면 업데이트하지 않음)
      setCustomGearTiers(prev => {
        if (Object.keys(prev).length === 0) {
          return prev; // 이미 빈 객체면 변경하지 않음
        }
        return {}; // 변경이 필요한 경우만 업데이트
      });
    }
  }, [selectedLeague]);

  // 유니크 검색 결과 확인 (S~C 티어에 있는지)
  const isUniqueSearchResultInTiers = useMemo(() => {
    if (!uniqueSearchQuery.trim() || selectedCategory !== "uniques") {
      return false;
    }
    
    // D 티어의 기타 유니크 목록 가져오기
    const dTierRule = quickFilterDefaults.uniques?.rules?.find(r => r.id === "uniques_d_other");
    const dTierBaseTypes = dTierRule?.conditions?.baseType?.value || [];
    
    // 검색어로 필터링
    const normalizedQuery = uniqueSearchQuery.toLowerCase().trim();
    const matchedBaseTypes = dTierBaseTypes.filter(baseType => 
      baseType.toLowerCase().includes(normalizedQuery) ||
      translateItemName(baseType).toLowerCase().includes(normalizedQuery)
    );
    
    if (matchedBaseTypes.length === 0) {
      return false;
    }
    
    // 첫 번째 매칭 결과가 S~C 티어에 있는지 확인
    const firstMatch = matchedBaseTypes[0];
    
    // S~C 티어에 있는지 확인
    for (const tier of ["S", "A", "B", "C"]) {
      const tierItems = uniquesTiers[tier] || [];
      if (tierItems.includes(firstMatch)) {
        return true;
      }
      // 커스텀 티어 확인
      if (customUniquesTiers[firstMatch] === tier) {
        return true;
      }
    }
    
    return false;
  }, [uniqueSearchQuery, selectedCategory, customUniquesTiers]);
  
  // 유니크 검색 매칭 결과 (D 티어 기타 유니크 중 검색 결과, S~C 티어에 없는 것만)
  const uniqueSearchMatches = useMemo(() => {
    if (!debouncedUniqueSearchQuery.trim() || selectedCategory !== "uniques") {
      return [];
    }
    
    const dTierRule = quickFilterDefaults.uniques?.rules?.find(r => r.id === "uniques_d_other");
    const dTierBaseTypes = dTierRule?.conditions?.baseType?.value || [];
    
    // 역방향 검색 포함 필터링
    const searchQueryLower = debouncedUniqueSearchQuery.toLowerCase();
    const reverseMatchKeys = new Set();
    
    // 검색어가 한글인 경우에만 역방향 검색 수행
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(debouncedUniqueSearchQuery);
    
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
    
    // D 티어 목록에서 검색 결과 필터링
    const matchedBaseTypes = dTierBaseTypes.filter(baseType => {
      const baseTypeLower = baseType.toLowerCase();
      const translatedName = translateItemName(baseType);
      const translatedNameLower = translatedName.toLowerCase();
      
      // 원본 이름(영문)과 번역된 이름(한글) 검색
      if (baseTypeLower.includes(searchQueryLower) || 
          translatedNameLower.includes(searchQueryLower)) {
        return true;
      }
      
      // 역방향 검색: 검색어가 한글일 때만 수행
      if (isKorean && reverseMatchKeys.has(baseTypeLower)) {
        return true;
      }
      
      return false;
    });
    
    // S~C 티어에 없는 것만 필터링
    return matchedBaseTypes.filter(baseType => {
      // S~C 티어에 있는지 확인
      for (const tier of ["S", "A", "B", "C"]) {
        const tierItems = uniquesTiers[tier] || [];
        if (tierItems.includes(baseType)) {
          return false; // S~C 티어에 있으면 제외
        }
        // 커스텀 티어 확인
        if (customUniquesTiers[baseType] === tier) {
          return false; // 커스텀으로 S~C 티어에 있으면 제외
        }
      }
      return true; // S~C 티어에 없으면 포함
    });
  }, [debouncedUniqueSearchQuery, selectedCategory, customUniquesTiers]);
  
  // 검색 결과 추가 핸들러 (검색창에 있는 아이템 추가)
  const handleAddUniqueToTier = () => {
    // selectedUniqueItem이 있으면 그것을 사용, 없으면 검색창의 텍스트로 baseType 찾기
    let baseTypeToAdd = selectedUniqueItem;
    
    if (!baseTypeToAdd) {
      // 검색창에 입력된 텍스트로 baseType 찾기 (한글 또는 영어 모두 가능)
      const searchText = uniqueSearchQuery.trim();
      if (searchText) {
        // uniqueSearchMatches에서 일치하는 항목 찾기
        const matchedItem = uniqueSearchMatches.find(baseType => {
          const translatedName = translateItemName(baseType);
          return baseType.toLowerCase() === searchText.toLowerCase() || 
                 translatedName.toLowerCase() === searchText.toLowerCase();
        });
        baseTypeToAdd = matchedItem || searchText;
      }
    }
    
    if (!baseTypeToAdd) {
      return;
    }
    
    // 선택한 티어에 추가
    const newCustomTiers = { ...customUniquesTiers };
    newCustomTiers[baseTypeToAdd] = selectedUniqueTier;
    setCustomUniquesTiers(newCustomTiers);
    
    // 로컬스토리지에 저장
    const uniquesKey = "tier-list-custom-uniques";
    localStorage.setItem(uniquesKey, JSON.stringify(newCustomTiers));
    
    // 검색어 및 선택된 아이템 초기화
    setUniqueSearchQuery("");
    setSelectedUniqueItem(null);
    
    // 성공 알림 모달 표시
    setAddedItemInfo({
      baseType: baseTypeToAdd,
      tier: selectedUniqueTier,
    });
    setAddSuccessModalOpen(true);
  };

  // 검색 결과 아이템 선택 핸들러
  const handleSelectUniqueItem = (baseType) => {
    setSelectedUniqueItem(baseType);
    // 한글 이름으로 검색창에 입력
    const translatedName = translateItemName(baseType);
    setUniqueSearchQuery(translatedName);
  };

  // 추가 성공 알림 모달 닫기
  const handleAddSuccessModalClose = () => {
    setAddSuccessModalOpen(false);
    setAddedItemInfo(null);
  };

  // 아이템 삭제 확인 모달 열기
  const handleDeleteItemClick = (baseType) => {
    if (!baseType) return;
    setItemToDelete(baseType);
    setDeleteModalOpen(true);
    // 컨텍스트 메뉴 닫기
    setContextMenu(null);
    setContextMenuItem(null);
  };

  // 아이템 삭제 실행 (통합 로직)
  const handleDeleteItemConfirm = () => {
    if (!itemToDelete) return;
    const category = contextMenu?.category || selectedCategory;
    
    // 1. 커스텀 티어에서 제거 시도
    let customTierFound = false;
    
    if (category === "currency") {
      if (customCurrencyTiers[itemToDelete]) {
        const newTiers = { ...customCurrencyTiers };
        delete newTiers[itemToDelete];
        setCustomCurrencyTiers(newTiers);
        localStorage.setItem("tier-list-custom-currency-" + selectedLeague, JSON.stringify(newTiers));
        customTierFound = true;
      }
    } else if (category === "gear-bases") {
      if (customGearTiers[itemToDelete]) {
        const newTiers = { ...customGearTiers };
        delete newTiers[itemToDelete];
        setCustomGearTiers(newTiers);
        localStorage.setItem("tier-list-custom-gear", JSON.stringify(newTiers));
        customTierFound = true;
      }
    } else if (category === "uniques") {
      if (customUniquesTiers[itemToDelete]) {
        const newTiers = { ...customUniquesTiers };
        delete newTiers[itemToDelete];
        setCustomUniquesTiers(newTiers);
        localStorage.setItem("tier-list-custom-uniques", JSON.stringify(newTiers));
        customTierFound = true;
      }
    } else if (category === "mods") {
      if (customModsTiers[itemToDelete]) {
        const newTiers = { ...customModsTiers };
        delete newTiers[itemToDelete];
        setCustomModsTiers(newTiers);
        localStorage.setItem("tier-list-custom-mods", JSON.stringify(newTiers));
        customTierFound = true;
      }
    }

    // 2. 커스텀 티어가 아니거나, 기본 리스트에서도 제거하고 싶은 경우 excludedItems에 추가
    // (사용자가 우클릭-제거를 했다는 것은 이 리스트에서 더이상 보고싶지 않다는 뜻이므로 무조건 제외 목록에 추가)
    const newExcluded = { ...excludedItems };
    if (!newExcluded[category]) {
      newExcluded[category] = [];
    }
    if (!newExcluded[category].includes(itemToDelete)) {
      newExcluded[category].push(itemToDelete);
    }
    setExcludedItems(newExcluded);
    localStorage.setItem("tier-list-excluded-items", JSON.stringify(newExcluded));
    
    // 모달 닫기
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // 삭제 모달 닫기
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // 우클릭 컨텍스트 메뉴 핸들러
  const handleContextMenu = (e, baseType, category = null) => {
    e.preventDefault();
    setContextMenuItem(baseType);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      category: category || selectedCategory
    });
  };

  // 컨텍스트 메뉴 닫기
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setContextMenuItem(null);
    };
    
    if (contextMenu) {
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [contextMenu]);


  // 검색어 debounce 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150); // 150ms 지연 (더 빠른 반응)

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 유니크 검색어 debounce 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUniqueSearchQuery(uniqueSearchQuery);
    }, 150); // 150ms 지연 (더 빠른 반응)

    return () => clearTimeout(timer);
  }, [uniqueSearchQuery]);

  // 검색어로 필터링하는 함수 (컴포넌트 레벨에서 정의)
  const searchFilter = (items) => {
    if (!debouncedSearchQuery.trim()) return items;
    
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
    
    return items.filter(itemName => {
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
  };

  // 유니크 검색어로 필터링하는 함수 (역방향 검색 포함)
  const uniqueSearchFilter = (items) => {
    if (!debouncedUniqueSearchQuery.trim()) return items;
    
    const searchQueryLower = debouncedUniqueSearchQuery.toLowerCase();
    // 역방향 검색을 위한 캐시: 검색어가 한글일 때 매칭되는 영문 키들
    const reverseMatchKeys = new Set();
    
    // 검색어가 한글인 경우에만 역방향 검색 수행 (성능 최적화)
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(debouncedUniqueSearchQuery);
    
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
    
    return items.filter(baseType => {
      const baseTypeLower = baseType.toLowerCase();
      const translatedName = translateItemName(baseType);
      const translatedNameLower = translatedName.toLowerCase();
      
      // 원본 이름(영문)과 번역된 이름(한글) 검색
      if (baseTypeLower.includes(searchQueryLower) || 
          translatedNameLower.includes(searchQueryLower)) {
        return true;
      }
      
      // 역방향 검색: 검색어가 한글일 때만 수행
      if (isKorean && reverseMatchKeys.has(baseTypeLower)) {
        return true;
      }
      
      return false;
    });
  };

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

  // 검색어 변경 시 선택된 아이템 초기화 (검색 결과창이 다시 표시되도록)
  useEffect(() => {
    if (selectedCategory === "uniques" && selectedUniqueItem) {
      // selectedUniqueItem이 설정되어 있고, 검색어가 변경되면 선택된 아이템 초기화
      // (handleSelectUniqueItem에서 설정한 경우가 아닌, 사용자가 직접 검색어를 변경한 경우)
      const translatedName = translateItemName(selectedUniqueItem);
      // 검색어가 선택된 아이템의 이름과 다른 경우에만 초기화
      if (uniqueSearchQuery !== translatedName) {
        setSelectedUniqueItem(null);
      }
    }
  }, [uniqueSearchQuery, selectedCategory, selectedUniqueItem]);

  // 검색 결과창 위치 및 너비 조정 (480px 고정)
  useEffect(() => {
    if (selectedCategory === "uniques" && debouncedUniqueSearchQuery.trim() && uniqueSearchMatches.length > 0 && !isUniqueSearchResultInTiers && !selectedUniqueItem) {
      const searchInput = document.querySelector('.item-search-input');
      const resultsContainer = document.getElementById('unique-search-results-container');
      
      if (searchInput && resultsContainer) {
        const updatePosition = () => {
          const inputRect = searchInput.getBoundingClientRect();
          const cardRect = resultsContainer.closest('.card')?.getBoundingClientRect();
          
          if (cardRect) {
            const leftOffset = inputRect.left - cardRect.left;
            
            resultsContainer.style.left = `${leftOffset}px`;
            resultsContainer.style.width = `480px`;
            resultsContainer.style.right = 'auto';
          }
        };
        
        updatePosition();
        window.addEventListener('resize', updatePosition);
        
        return () => {
          window.removeEventListener('resize', updatePosition);
        };
      }
    }
  }, [selectedCategory, debouncedUniqueSearchQuery, uniqueSearchMatches, isUniqueSearchResultInTiers]);

  // 화폐 종류별 티어 스타일 가져오기
  // filter-rules.json에서 스타일 추출하는 헬퍼 함수
  const getStyleFromFilterRules = (currencyTypeId, tier) => {
    if (!currencyTypeId || !tier) return null;
    
    // RID 패턴 생성 및 시도
    let baseId = currencyTypeId;
    if (baseId === "ritual_omen") baseId = "omem";
    
    const possibleRids = [
      `${baseId}_${tier.toLowerCase()}`, // 원본 (예: lineage_gems_s, omem_s)
    ];
    
    // 복수형을 단수형으로 변환하여 시도 (예: ancient_bones -> ancient_bone_s)
    if (baseId.endsWith("s")) {
      const singular = baseId.slice(0, -1);
      possibleRids.push(`${singular}_${tier.toLowerCase()}`);
    }
    
    // filter-rules.json에서 해당 RID 찾기
    const rule = filterRules.rules.find(r => possibleRids.includes(r.rid));
    // rule이 없거나 styles 속성이 없으면 null 반환
    // styles가 빈 배열이어도 객체를 반환 (필터 규칙이 존재하므로)
    if (!rule || !rule.styles) return null;
    
    // styles 배열을 객체로 변환 (누락된 속성은 null로 설정)
    const styleObj = {
      fontSize: null,
      textColor: null,
      borderColor: null,
      backgroundColor: null,
      playEffect: null,
      minimapIcon: null,
      customSound: null,
    };
    
    rule.styles.forEach(style => {
      if (style.type === "fontSize") {
        styleObj.fontSize = style.value;
      } else if (style.type === "textColor") {
        styleObj.textColor = { r: style.r, g: style.g, b: style.b, a: style.a || 255 };
      } else if (style.type === "borderColor") {
        styleObj.borderColor = { r: style.r, g: style.g, b: style.b, a: style.a || 255 };
      } else if (style.type === "backgroundColor") {
        styleObj.backgroundColor = { r: style.r, g: style.g, b: style.b, a: style.a || 255 };
      } else if (style.type === "playEffect") {
        styleObj.playEffect = style.value;
      } else if (style.type === "minimapIcon") {
        styleObj.minimapIcon = { size: style.size, color: style.color, shape: style.shape };
      } else if (style.type === "customAlertSound") {
        styleObj.customSound = style.file;
        styleObj.soundPlatform = "PC";
      } else if (style.type === "playAlertSound") {
        styleObj.ps5Sound = style.slot;
        styleObj.ps5SoundVolume = style.volume || 300; // 기본값 300
        styleObj.soundPlatform = "PS5";
        // PC/PS5 매핑 테이블을 사용하여 PC 사운드 찾기
        const pcSoundMap = {
          5: "custom_sound/1_currency_s.mp3",
          1: "custom_sound/2_currency_a.mp3",
          2: "custom_sound/3_currency_b.mp3",
          3: "custom_sound/4_currency_c.mp3"
        };
        styleObj.customSound = pcSoundMap[style.slot] || null;
      }
    });
    
    return styleObj;
  };

  const getCurrencyTypeTierStyle = (currencyTypeId, tier) => {
    if (!currencyTypeId || !tier) return null;
    
    // 1. filter-rules.json에서 실제 필터 규칙의 스타일 우선 가져오기
    const filterRuleStyle = getStyleFromFilterRules(currencyTypeId, tier);
    if (filterRuleStyle) {
      // filter-generator.js의 getCurrencyTierColors에서 추가 정보 가져오기
      const tierColors = getCurrencyTierColorsFromGenerator(tier);
      return mergeTierStyles(filterRuleStyle, tierColors);
    }
    
    // 2. filter-rules.json에 없으면 currency-type-default-colors.json에서 기본 색상 정보 가져오기
    const typeStyles = currencyTypeDefaultColors[currencyTypeId];
    if (!typeStyles) {
      // currencyTypeId가 없으면 "currency" 기본값 사용
      const defaultStyles = currencyTypeDefaultColors["currency"];
      if (!defaultStyles || !defaultStyles[tier]) return null;
      
      // filter-generator.js의 getCurrencyTierColors에서 추가 정보 가져오기
      const tierColors = getCurrencyTierColorsFromGenerator(tier);
      return mergeTierStyles(defaultStyles[tier], tierColors);
    }
    
    const baseStyle = typeStyles[tier];
    if (!baseStyle) return null;
    
    // filter-generator.js의 getCurrencyTierColors에서 추가 정보 가져오기
    const tierColors = getCurrencyTierColorsFromGenerator(tier);
    return mergeTierStyles(baseStyle, tierColors);
  };

  // filter-generator.js의 getCurrencyTierColors 함수와 동일한 로직
  const getCurrencyTierColorsFromGenerator = (tier) => {
    const tierStyles = {
      S: {
        playEffect: "Red",
        minimapIcon: { size: 0, color: "Red", shape: "Star" },
        customSound: "custom_sound/1_currency_s.mp3",
      },
      A: {
        playEffect: "Orange",
        minimapIcon: { size: 0, color: "Orange", shape: "Circle" },
        customSound: "custom_sound/2_currency_a.mp3",
      },
      B: {
        playEffect: "Yellow",
        minimapIcon: { size: 1, color: "Yellow", shape: "Circle" },
        customSound: "custom_sound/3_currency_b.mp3",
      },
      C: {
        playEffect: null,
        minimapIcon: { size: 1, color: "Yellow", shape: "Circle" },
        customSound: "custom_sound/4_currency_c.mp3",
      },
      D: {
        playEffect: null,
        minimapIcon: null,
        customSound: null,
      },
      E: {
        playEffect: null,
        minimapIcon: null,
        customSound: null,
      },
    };
    return tierStyles[tier] || { playEffect: null, minimapIcon: null, customSound: null };
  };

  // 스타일 병합 함수 (baseStyle에 tierColors의 정보 추가)
  const mergeTierStyles = (baseStyle, tierColors) => {
    return {
      ...baseStyle,
      playEffect: tierColors.playEffect || baseStyle.playEffect || null,
      minimapIcon: tierColors.minimapIcon || baseStyle.minimapIcon || { size: null, color: null, shape: null },
      customSound: tierColors.customSound || baseStyle.customSound || null,
    };
  };

  // 화폐 종류별 티어 스타일 저장하기
  const saveCurrencyTypeTierStyle = (currencyTypeId, tier, styles) => {
    // localStorage에 저장 (나중에 서버로 저장)
    const storageKey = `currency-type-tier-styles-${selectedLeague}`;
    const savedStyles = JSON.parse(localStorage.getItem(storageKey) || "{}");
    
    if (!savedStyles[currencyTypeId]) {
      savedStyles[currencyTypeId] = {};
    }
    savedStyles[currencyTypeId][tier] = styles;
    
    localStorage.setItem(storageKey, JSON.stringify(savedStyles));
  };

  // 화폐 아이템의 실제 티어 가져오기 (커스텀 티어 우선) - useCallback으로 메모이제이션하여 무한 루프 방지
  // getFirstItemNameInTier보다 먼저 정의되어야 함
  const getCurrencyItemTier = useCallback((itemName) => {
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
  }, [selectedLeague, customCurrencyTiers]);

  // 티어의 첫 번째 아이템 이름 가져오기 - useCallback으로 메모이제이션하여 무한 루프 방지
  const getFirstItemNameInTier = useCallback((tier, currencyTypeId) => {
    const leagueKey = selectedLeague;
    
    // 선택된 화폐 종류에 해당하는 아이템만 필터링
    let itemsInSelectedCategories = new Set();
    if (currencyTypeId) {
      const categoryItems = currencyItemCategories[currencyTypeId] || [];
      categoryItems.forEach(itemName => {
        itemsInSelectedCategories.add(itemName);
      });
    } else {
      // 전체 선택: 모든 화폐 아이템 포함
      Object.values(currencyItemCategories).forEach(categoryItems => {
        categoryItems.forEach(itemName => {
          itemsInSelectedCategories.add(itemName);
        });
      });
    }
    
    // 해당 티어의 아이템들 중에서 첫 번째 아이템 찾기
    const allItems = [];
    ["S", "A", "B", "C", "D", "E"].forEach((t) => {
      const items = currencyTiers[leagueKey]?.[t] || [];
      items.forEach((itemName) => {
        const actualTier = getCurrencyItemTier(itemName);
        if (actualTier === tier && itemsInSelectedCategories.has(itemName)) {
          allItems.push(itemName);
        }
      });
    });
    
    // 첫 번째 아이템이 있으면 번역된 이름 반환
    if (allItems.length > 0) {
      return translateItemName(allItems[0]);
    }
    
    return null;
  }, [selectedLeague, getCurrencyItemTier]);

  // 티어 헤더 클릭 핸들러
  const handleTierHeaderClick = (tier) => {
    if (selectedCategory !== "currency") return;
    
    const currencyTypeId = selectedCurrencyTypes.length === 0 
      ? null 
      : selectedCurrencyTypes.length === 1 
        ? selectedCurrencyTypes[0] 
        : null; // 다중 선택 시 null (전체와 동일하게 처리)
    
    // 현재 스타일 가져오기
    let currentStyles = null;
    if (currencyTypeId) {
      // 특정 화폐 종류의 티어 스타일
      const storageKey = `currency-type-tier-styles-${selectedLeague}`;
      const savedStyles = JSON.parse(localStorage.getItem(storageKey) || "{}");
      currentStyles = savedStyles[currencyTypeId]?.[tier] || getCurrencyTypeTierStyle(currencyTypeId, tier);
    } else {
      // 전체 상태: 기본 스타일 사용 (또는 "currency" 종류의 기본 스타일)
      const defaultStyle = getCurrencyTypeTierStyle("currency", tier);
      if (defaultStyle) {
        currentStyles = defaultStyle;
      } else {
        // 기본값이 없을 때만 fallback 사용
        const tierColorsFromGen = getCurrencyTierColorsFromGenerator(tier);
        currentStyles = {
          fontSize: 45,
          textColor: { r: 255, g: 255, b: 255, a: 255 },
          borderColor: { r: 255, g: 255, b: 255, a: 255 },
          backgroundColor: tierColors[tier] === "var(--tier-s)" ? { r: 255, g: 71, b: 87, a: 255 } :
                           tierColors[tier] === "var(--tier-a)" ? { r: 255, g: 99, b: 72, a: 255 } :
                           tierColors[tier] === "var(--tier-b)" ? { r: 255, g: 152, b: 0, a: 255 } :
                           tierColors[tier] === "var(--tier-c)" ? { r: 255, g: 193, b: 7, a: 255 } :
                           { r: 149, g: 165, b: 166, a: 255 },
          playEffect: tierColorsFromGen.playEffect,
          minimapIcon: tierColorsFromGen.minimapIcon || { size: null, color: null, shape: null },
          customSound: tierColorsFromGen.customSound,
        };
      }
    }
    
    setTierStyleModal({
      isOpen: true,
      tier,
      currencyType: currencyTypeId,
      styles: currentStyles,
    });
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

  // 유니크 아이템 티어 변경
  const moveUniquesItem = (baseType, fromTier, toTier) => {
    if (fromTier === toTier) return;
    
    const defaultTier = getUniquesItemDefaultTier(baseType);
    const newCustomTiers = { ...customUniquesTiers };
    
    // 본래의 기본 티어로 돌아가면 커스텀 티어에서 제거
    if (toTier === defaultTier) {
      delete newCustomTiers[baseType];
    } else {
      // 다른 티어로 이동하면 커스텀 티어에 추가/업데이트
      newCustomTiers[baseType] = toTier;
    }
    
    setCustomUniquesTiers(newCustomTiers);
    
    // 로컬스토리지에 저장
    const uniquesKey = "tier-list-custom-uniques";
    localStorage.setItem(uniquesKey, JSON.stringify(newCustomTiers));
  };

  // 모드 아이템 티어 변경
  const moveModsItem = (modId, fromTier, toTier) => {
    if (fromTier === toTier) return;
    
    const newCustomTiers = { ...customModsTiers };
    newCustomTiers[modId] = toTier;
    setCustomModsTiers(newCustomTiers);
    
    // 로컬스토리지에 저장
    const modsKey = "tier-list-custom-mods";
    localStorage.setItem(modsKey, JSON.stringify(newCustomTiers));
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
    } else if (selectedCategory === "uniques") {
      moveUniquesItem(draggedItem, draggedFromTier, toTier);
    } else if (selectedCategory === "mods") {
      moveModsItem(draggedItem, draggedFromTier, toTier);
    }

    setDraggedItem(null);
    setDraggedFromTier(null);
  };

  // 초기화 (기본값으로 복원)
  const handleResetAll = (onSuccess) => {
    // 전체 초기화: 모든 설정 초기화
    setCustomCurrencyTiers({});
    setCustomGearTiers({});
    setCustomUniquesTiers({});
    
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
      localStorage.removeItem("tier-list-custom-uniques");
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
    } else if (selectedCategory === "uniques") {
      const uniquesKey = "tier-list-custom-uniques";
      localStorage.removeItem(uniquesKey);
      setCustomUniquesTiers({});
    }
    
    if (onSuccess) {
      onSuccess(lang === "ko" ? "이 페이지의 설정이 초기화되었습니다." : "This page's settings have been reset.");
    }
  };

  // 다운로드 (.filter 파일 생성)
  const handleDownload = () => {
    try {
      // 퀵 필터 설정 로드
      const goldSettings = JSON.parse(localStorage.getItem("quickFilter_gold") || "null");
      const quickFilterSettings = {
        gold: goldSettings,
        // 필요하다면 다른 퀵 필터 설정도 여기서 로드 가능
      };

      const soundSettings = JSON.parse(localStorage.getItem("poe2_sound_settings") || "[]");
      const filterCode = generateFilterCode({
        presetId: "starter", // 기본 프리셋
        soundOption: soundOption,
        soundSettings: soundSettings,
        excludedOptions: {},
        customGearTiers: customGearTiers,
        customCurrencyTiers: customCurrencyTiers,
        customModsTiers: customModsTiers,
        excludedItems: excludedItems,
        selectedLeague: selectedLeague,
        quickFilterSettings: quickFilterSettings
      });
      
      const blob = new Blob([filterCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = `reim-filter-${timestamp}.filter`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (setNotificationModal) {
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "",
          message: lang === "ko" ? "필터 파일이 생성되어 다운로드되었습니다." : "Filter file has been generated and downloaded.",
          autoCloseDelay: 3000,
        });
      }
    } catch (e) {
      console.error("Failed to generate filter:", e);
      if (setNotificationModal) {
        setNotificationModal({
          isOpen: true,
          type: "error",
          title: "",
          message: lang === "ko" ? "필터 생성에 실패했습니다." : "Failed to generate filter.",
          autoCloseDelay: 3000,
        });
      }
    }
  };

  // 복사하기 (클립보드)
  const handleCopy = async () => {
    try {
      const goldSettings = JSON.parse(localStorage.getItem("quickFilter_gold") || "null");
      const quickFilterSettings = {
        gold: goldSettings,
      };

      const soundSettings = JSON.parse(localStorage.getItem("poe2_sound_settings") || "[]");
      const filterCode = generateFilterCode({
        presetId: "starter",
        soundOption: soundOption,
        soundSettings: soundSettings,
        excludedOptions: {},
        customGearTiers: customGearTiers,
        customCurrencyTiers: customCurrencyTiers,
        customModsTiers: customModsTiers,
        selectedLeague: selectedLeague,
        quickFilterSettings: quickFilterSettings
      });

      await navigator.clipboard.writeText(filterCode);
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "",
        message: lang === "ko" ? "필터 코드가 클립보드에 복사되었습니다." : "Filter code copied to clipboard!",
        autoCloseDelay: 3000,
      });
    } catch (e) {
      console.error("Failed to copy:", e);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "",
        message: lang === "ko" ? "복사에 실패했습니다." : "Failed to copy!",
        autoCloseDelay: 3000,
      });
    }
  };

  // 시세 그룹별 기본값으로 저장 (관리자 기능)
  const handleSaveAsLeagueDefault = async (leagueId) => {
    if (selectedCategory !== "currency") {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "",
        message: lang === "ko" ? "이 기능은 화폐 카테고리에서만 사용할 수 있습니다." : "This feature is only available for currency category.",
        autoCloseDelay: 7000,
      });
      return;
    }

    try {
      // 현재 커스텀 티어 설정을 기반으로 해당 시세 그룹의 기본값 업데이트
      // 1. 현재 currency-tiers.json의 해당 시세 그룹 데이터 가져오기
      const currentTiers = currencyTiers[leagueId] || {
        S: [], A: [], B: [], C: [], D: [], E: []
      };

      // 2. 커스텀 티어 설정을 반영하여 새로운 티어 구조 생성
      const updatedTiers = {
        S: [...currentTiers.S],
        A: [...currentTiers.A],
        B: [...currentTiers.B],
        C: [...currentTiers.C],
        D: [...currentTiers.D],
        E: [...currentTiers.E]
      };

      // 3. 커스텀 티어가 있는 아이템들을 해당 티어에서 제거하고 새로운 티어에 추가
      Object.keys(customCurrencyTiers).forEach((itemName) => {
        const newTier = customCurrencyTiers[itemName];
        
        // 기존 티어에서 제거
        ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
          const index = updatedTiers[tier].indexOf(itemName);
          if (index > -1) {
            updatedTiers[tier].splice(index, 1);
          }
        });

        // 새로운 티어에 추가 (중복 방지)
        if (newTier && updatedTiers[newTier] && !updatedTiers[newTier].includes(itemName)) {
          updatedTiers[newTier].push(itemName);
        }
      });

      // 4. 각 티어 배열 정렬
      Object.keys(updatedTiers).forEach((tier) => {
        updatedTiers[tier].sort((a, b) => a.localeCompare(b));
      });

      // 5. 서버에 저장 요청 (TODO: 실제 API 엔드포인트 구현 필요)
      // 현재는 클라이언트에서 직접 파일을 수정할 수 없으므로,
      // 관리자 API를 통해 저장하거나, 수동으로 업데이트할 수 있는 JSON 다운로드 제공
      
      // 임시: JSON 다운로드로 제공 (나중에 API로 대체)
      const dataToSave = {
        [leagueId]: updatedTiers
      };

      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `currency-tiers-${leagueId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "",
        message: lang === "ko"
          ? `${leagueFilters.find(l => l.id === leagueId)?.name || leagueId} 시세 그룹의 기본값이 준비되었습니다.\n\n다운로드된 JSON 파일을 서버의 currency-tiers.json에 반영해주세요.\n\n(나중에 API를 통해 자동 저장됩니다.)`
          : `Default values for ${leagueFilters.find(l => l.id === leagueId)?.name || leagueId} league are ready.\n\nPlease apply the downloaded JSON file to currency-tiers.json on the server.\n\n(Auto-save via API will be implemented later.)`,
        autoCloseDelay: 0,
      });
    } catch (error) {
      console.error("Failed to save league default:", error);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "",
        message: lang === "ko"
          ? "시세 기본값 저장에 실패했습니다."
          : "Failed to save league default.",
        autoCloseDelay: 7000,
      });
    }
  };

  // 프리셋별 기본값으로 저장 (유니크, 장비용)
  const handleSaveAsPresetDefault = async (presetId) => {
    if (selectedCategory === "currency") {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "",
        message: lang === "ko" ? "화폐는 '시세 기본값으로 저장' 기능을 사용해주세요." : "Please use 'Save as League Default' for currency.",
        autoCloseDelay: 7000,
      });
      return;
    }

    try {
      const preset = presetsData.presets.find(p => p.id === presetId);
      if (!preset) {
        setNotificationModal({
          isOpen: true,
          type: "error",
          title: "",
          message: lang === "ko" ? "프리셋을 찾을 수 없습니다." : "Preset not found.",
          autoCloseDelay: 7000,
        });
        return;
      }

      let updatedTiers = null;
      let categoryName = "";

      if (selectedCategory === "uniques") {
        categoryName = "유니크";
        
        // TODO: 나중에 실시간 시세 정보를 가져와서 티어 자동 분류 기능 추가 예정
        // - 각 티어별 디바인 오브(Divine Orb) / 엑잘티드 오브(Exalted Orb) 수량 기준으로 티어 분류
        // - 예: S 티어 = 10 Divine 이상, A 티어 = 5-10 Divine, B 티어 = 2-5 Divine 등
        // - 현재는 JSON으로 수동 저장 (기본값)
        
        // filter-rules.json에서 현재 유니크 티어 구조 가져오기
        // 유니크는 BaseType으로 관리되므로, filter-rules.json의 uniques_s, uniques_a 등을 참조
        // 현재는 커스텀 티어 + 기본 티어 구조 저장 (기본 티어는 filter-rules.json에서 추출 필요)
        
        // 커스텀 티어를 기반으로 티어 구조 생성
        updatedTiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: []
        };

        // TODO: filter-rules.json에서 기본 유니크 티어 가져오기
        // 실제로는 filter-rules.json을 읽어서 uniques_s, uniques_a 등의 BaseType을 가져와야 함
        // 현재는 커스텀 티어만 저장
        
        // 커스텀 티어가 있는 BaseType들을 새로운 티어에 추가
        Object.keys(customUniquesTiers).forEach((baseType) => {
          const newTier = customUniquesTiers[baseType];
          if (newTier && updatedTiers[newTier] && !updatedTiers[newTier].includes(baseType)) {
            updatedTiers[newTier].push(baseType);
          }
        });

        // 각 티어 배열 정렬
        Object.keys(updatedTiers).forEach((tier) => {
          updatedTiers[tier].sort((a, b) => a.localeCompare(b));
        });

      } else if (selectedCategory === "gear-bases") {
        categoryName = "장비";
        // 장비는 bases.json의 기본 티어를 기반으로 함
        updatedTiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: []
        };

        // bases.json의 모든 아이템을 기본 티어로 분류
        Object.keys(bases).forEach((itemName) => {
          const item = bases[itemName];
          const numTier = item.tier || 4;
          let tier = "C";
          if (item.class === "Belts") tier = "E";
          else if (numTier === 1) tier = "S";
          else if (numTier === 2) tier = "A";
          else if (numTier === 3) tier = "B";
          else if (numTier === 4) tier = "C";
          else tier = "D";

          if (!updatedTiers[tier].includes(itemName)) {
            updatedTiers[tier].push(itemName);
          }
        });

        // 커스텀 티어 적용
        Object.keys(customGearTiers).forEach((itemName) => {
          const newTier = customGearTiers[itemName];
          
          // 기존 티어에서 제거
          Object.keys(updatedTiers).forEach((tier) => {
            const index = updatedTiers[tier].indexOf(itemName);
            if (index > -1) {
              updatedTiers[tier].splice(index, 1);
            }
          });

          // 새로운 티어에 추가
          if (newTier && updatedTiers[newTier] && !updatedTiers[newTier].includes(itemName)) {
            updatedTiers[newTier].push(itemName);
          }
        });

        // 각 티어 배열 정렬
        Object.keys(updatedTiers).forEach((tier) => {
          updatedTiers[tier].sort((a, b) => a.localeCompare(b));
        });
      } else {
        setNotificationModal({
          isOpen: true,
          type: "error",
          title: "",
          message: lang === "ko" ? "지원하지 않는 카테고리입니다." : "Unsupported category.",
          autoCloseDelay: 7000,
        });
        return;
      }

      // JSON 다운로드로 제공 (기본값)
      // TODO: 나중에 실시간 시세 기반 자동 분류 기능 추가 시 API로 전환
      const dataToSave = {
        presetId: presetId,
        presetName: preset.nameKo || preset.name,
        category: selectedCategory,
        tiers: updatedTiers,
        // 나중에 시세 기반 자동 분류 시 사용할 필드들:
        // priceData: { ... }, // 실시간 시세 정보
        // tierThresholds: { S: 10, A: 5, B: 2, ... }, // 티어별 디바인/엑잘티드 기준값
        // autoClassified: false // 자동 분류 여부
      };

      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedCategory}-tiers-${presetId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "",
        message: lang === "ko"
          ? `${preset.nameKo || preset.name} 프리셋의 ${categoryName} 티어 기본값이 준비되었습니다.\n\n다운로드된 JSON 파일을 서버에 반영해주세요.\n\n(나중에 API를 통해 자동 저장됩니다.)`
          : `Default ${categoryName} tier values for ${preset.nameKo || preset.name} preset are ready.\n\nPlease apply the downloaded JSON file to the server.\n\n(Auto-save via API will be implemented later.)`,
        autoCloseDelay: 0,
      });
    } catch (error) {
      console.error("Failed to save preset default:", error);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "",
        message: lang === "ko"
          ? "프리셋 기본값 저장에 실패했습니다."
          : "Failed to save preset default.",
        autoCloseDelay: 7000,
      });
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
          setNotificationModal({
            isOpen: true,
            type: "success",
            title: "",
            message: lang === "ko" ? "불러오기 성공!" : "Import successful!",
            autoCloseDelay: 7000,
          });
        } catch (e) {
          console.error("Failed to import:", e);
          setNotificationModal({
            isOpen: true,
            type: "error",
            title: "",
            message: lang === "ko" ? "불러오기 실패: 잘못된 파일 형식입니다." : "Import failed: Invalid file format!",
            autoCloseDelay: 7000,
          });
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
                className={`dropdown-trigger ${isFilterDropdownOpen && isMultiSelectMode && tempSelectedCurrencyTypes.length >= 1 ? "dropdown-trigger-confirm" : ""}`}
                onClick={() => {
                  if (isFilterDropdownOpen && isMultiSelectMode && tempSelectedCurrencyTypes.length >= 1) {
                    // 다중 선택 모드: 드롭다운이 열려있고 선택이 있을 때 확인 버튼 역할
                    setSelectedCurrencyTypes([...tempSelectedCurrencyTypes]);
                    setIsFilterDropdownOpen(false);
                    // 선택된 첫 번째 카테고리로 activeCurrencyCategory 설정
                    if (tempSelectedCurrencyTypes.length > 0) {
                      setActiveCurrencyCategory(tempSelectedCurrencyTypes[0]);
                    } else {
                      setActiveCurrencyCategory("");
                    }
                  } else if (!isFilterDropdownOpen) {
                    // 드롭다운 열 때 현재 선택된 값으로 임시 상태 초기화
                    setTempSelectedCurrencyTypes([...selectedCurrencyTypes]);
                    setIsFilterDropdownOpen(true);
                  } else {
                    // 드롭다운 닫기
                    setIsFilterDropdownOpen(false);
                  }
                }}
              >
                {isFilterDropdownOpen && isMultiSelectMode && tempSelectedCurrencyTypes.length >= 1
                  ? `${lang === "ko" ? "확인" : "Confirm"} (${tempSelectedCurrencyTypes.length}${lang === "ko" ? "개" : ""})`
                  : selectedCurrencyTypes.length === 0
                  ? (lang === "ko" ? "전체" : "All")
                  : selectedCurrencyTypes.length === 1
                  ? currencyTypes.find(t => t.id === selectedCurrencyTypes[0])?.name || (lang === "ko" ? "전체" : "All")
                  : `${selectedCurrencyTypes.length} ${lang === "ko" ? "개 선택" : "selected"}`}
                {!(isFilterDropdownOpen && isMultiSelectMode && tempSelectedCurrencyTypes.length >= 1) && (
                  <span className="dropdown-arrow">▼</span>
                )}
              </div>
              {isFilterDropdownOpen && (
                <div className="dropdown-menu filter-multi-menu">
                  <div className="filter-header-row">
                    <div
                      className={`dropdown-option-multi filter-all-option ${
                        (isMultiSelectMode ? tempSelectedCurrencyTypes.length === 0 : selectedCurrencyTypes.length === 0) ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // "전체" 선택 시 즉시 적용
                        setTempSelectedCurrencyTypes([]);
                        setSelectedCurrencyTypes([]);
                        setActiveCurrencyCategory("");
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      <span>{lang === "ko" ? "전체" : "All"}</span>
                    </div>
                  </div>
                  {(() => {
                    // 제외된 항목들을 필터링하고, 빈 id도 제외
                    const filteredTypes = currencyTypes.filter(t => t.id !== "" && !excludedCurrencyTypes.includes(t.id));
                    
                    // "화폐"는 고정 위치에 두고, 나머지는 정렬
                    const currencyType = filteredTypes.find(t => t.id === "currency");
                    const otherTypes = filteredTypes.filter(t => t.id !== "currency");
                    
                    // 나머지 화폐는 언어별 정렬 (ㄱ-ㅎ 순서)
                    const sortedOther = otherTypes.sort((a, b) => {
                      if (lang === "ko") {
                        return a.name.localeCompare(b.name, "ko");
                      } else {
                        return a.name.localeCompare(b.name, "en");
                      }
                    });
                    
                    // "화폐"를 먼저, 나머지를 ㄱ-ㅎ 순서로 배치
                    return currencyType ? [currencyType, ...sortedOther] : sortedOther;
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
                          
                          if (isMultiSelectMode) {
                            // 다중 선택 모드: 여러 개 선택 가능
                            const current = [...tempSelectedCurrencyTypes];
                            if (isSelected) {
                              const index = current.indexOf(type.id);
                              current.splice(index, 1);
                            } else {
                              current.push(type.id);
                            }
                            setTempSelectedCurrencyTypes(current);
                            // 창은 열어둠 (외부 클릭이나 확인 버튼으로만 닫힘)
                          } else {
                            // 단일 선택 모드: 클릭 시 즉시 적용하고 드롭다운 닫기
                            if (type.id === "") {
                              // "전체" 선택
                              setSelectedCurrencyTypes([]);
                              setActiveCurrencyCategory("");
                            } else {
                              setSelectedCurrencyTypes([type.id]);
                              setActiveCurrencyCategory(type.id);
                            }
                            setIsFilterDropdownOpen(false);
                          }
                        }}
                      >
                        <span>{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* 선택 모드 드롭다운 */}
            <div className="custom-dropdown select-mode-dropdown">
              <div
                className={`dropdown-trigger ${isMultiSelectMode ? "multi-select-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectModeDropdownOpen(!isSelectModeDropdownOpen);
                  // 다른 드롭다운 닫기
                  if (!isSelectModeDropdownOpen) {
                    setIsFilterDropdownOpen(false);
                  }
                }}
              >
                {isMultiSelectMode 
                  ? (lang === "ko" ? "다중 선택" : "Multi-select")
                  : (lang === "ko" ? "개별 선택" : "Single-select")}
                <span className="dropdown-arrow">▼</span>
              </div>
              {isSelectModeDropdownOpen && (
                <div className="dropdown-menu select-mode-menu">
                  <div
                    className={`dropdown-option ${!isMultiSelectMode ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMultiSelectMode(false);
                      // 다중 선택 모드 해제 시 단일 선택으로 변경
                      if (selectedCurrencyTypes.length > 1) {
                        setSelectedCurrencyTypes([selectedCurrencyTypes[0]]);
                        setActiveCurrencyCategory(selectedCurrencyTypes[0]);
                      }
                      setIsFilterDropdownOpen(false);
                      // 드롭다운 닫기
                      setIsSelectModeDropdownOpen(false);
                    }}
                  >
                    {lang === "ko" ? "개별 선택" : "Single-select"}
                  </div>
                  <div
                    className={`dropdown-option ${isMultiSelectMode ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMultiSelectMode(true);
                      setIsFilterDropdownOpen(false);
                      // 드롭다운 닫기
                      setIsSelectModeDropdownOpen(false);
                    }}
                  >
                    {lang === "ko" ? "다중 선택" : "Multi-select"}
                  </div>
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
              {/* 편집 버튼 (화폐 탭에서만 표시) */}
              {selectedCategory === "currency" && (
                <button
                    className="item-edit-button"
                    onClick={() => {
                      // 선택된 아이템들의 클래스 파악
                      const selectedItemNames = Array.from(selectedItems);
                      if (selectedItemNames.length === 0) {
                        setNotificationModal({
                          isOpen: true,
                          type: "warning",
                          title: "",
                          message: lang === "ko" ? "편집할 아이템을 선택해주세요." : "Please select items to edit.",
                          autoCloseDelay: 7000,
                        });
                        return;
                      }
                      
                      // 선택된 아이템들이 속한 화폐 종류 찾기
                      const currencyTypesForItems = new Set();
                      selectedItemNames.forEach(itemName => {
                        Object.keys(currencyItemCategories).forEach(categoryId => {
                          if (currencyItemCategories[categoryId].includes(itemName)) {
                            currencyTypesForItems.add(categoryId);
                          }
                        });
                      });
                      
                      // 여러 클래스가 선택된 경우 경고
                      if (currencyTypesForItems.size > 1) {
                        alert(lang === "ko" ? "같은 화폐 종류의 아이템만 선택해주세요." : "Please select items from the same currency type.");
                        return;
                      }
                      
                      if (currencyTypesForItems.size === 0) {
                        setNotificationModal({
                          isOpen: true,
                          type: "error",
                          title: "",
                          message: lang === "ko" ? "선택된 아이템의 화폐 종류를 찾을 수 없습니다." : "Cannot find currency type for selected items.",
                          autoCloseDelay: 7000,
                        });
                        return;
                      }
                      
                      const currencyTypeId = Array.from(currencyTypesForItems)[0];
                      const currencyType = currencyTypes.find(t => t.id === currencyTypeId);
                      
                      setEditingCurrencyType({
                        id: currencyTypeId,
                        name: currencyType?.name || currencyTypeId,
                      });
                      setIsColorEditorOpen(true);
                    }}
                    disabled={selectedItems.size === 0}
                  >
                    {lang === "ko" ? "편집" : "Edit"} {selectedItems.size > 0 && `(${selectedItems.size})`}
                  </button>
              )}
            </div>
          </div>
          {/* 시세 그룹 - 오른쪽 */}
          <div className="league-filters-inline">
            {leagueFilters.map((league) => (
              <button
                key={league.id}
                className={`league-filter ${
                  selectedLeague === league.id ? "active" : ""
                } ${league.isComingSoon ? "coming-soon" : ""}`}
                onClick={() => {
                  if (league.isComingSoon) {
                    alert(
                      lang === "ko"
                        ? "최근 시세 기능은 업데이트 예정입니다.\n\n실시간 시세 정보를 기반으로 티어를 자동으로 분류하는 기능이 곧 추가될 예정입니다."
                        : "Recent price feature is coming soon.\n\nAuto-tier classification based on real-time price data will be added soon."
                    );
                    return;
                  }
                  setSelectedLeague(league.id);
                }}
              >
                {league.name}
                {league.isComingSoon && (
                  <span className="coming-soon-badge" title={lang === "ko" ? "업데이트 예정" : "Coming Soon"}>
                    ⏳
                  </span>
                )}
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

      {/* 모드 카테고리일 때 클래스 선택 드롭다운 (장비 탭과 동일한 디자인) */}
      {selectedCategory === "mods" && (
        <div className="class-selector">
          <label className="class-selector-label">
            {lang === "ko" ? "아이템 종류" : "ITEM CLASS"}
          </label>
          <div className="custom-dropdown">
            <div
              className="dropdown-trigger"
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
            >
              {selectedClass ? translateClassName(selectedClass) : (lang === "ko" ? "전체 종류" : "All Classes")}
              <span className="dropdown-arrow">▼</span>
            </div>
            {isClassDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-option"
                  onClick={() => {
                    setSelectedClass("");
                    setIsClassDropdownOpen(false);
                    setSelectedArmourType("");
                  }}
                >
                  {lang === "ko" ? "전체 종류" : "All Classes"}
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
          
          {/* 방어구 타입 드롭다운 */}
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
      
      {/* 유니크 카테고리일 때 검색창 (화폐 검색창과 동일한 디자인) */}
      {selectedCategory === "uniques" && (
        <div className="currency-filter-row">
          <div className="currency-filter-left">
            <div className="item-search-wrapper">
              <div className="item-search-input">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder={lang === "ko" ? "유니크 검색..." : "Search unique items..."}
                  value={uniqueSearchQuery}
                  onChange={(e) => setUniqueSearchQuery(e.target.value)}
                  className="item-search-field"
                />
                <button
                  type="button"
                  className={`item-search-clear ${uniqueSearchQuery ? "item-search-clear-visible" : "item-search-clear-hidden"}`}
                  onClick={() => {
                    setUniqueSearchQuery("");
                    setSelectedUniqueItem(null);
                  }}
                  aria-label={lang === "ko" ? "검색어 지우기" : "Clear search"}
                  disabled={!uniqueSearchQuery}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {debouncedUniqueSearchQuery.trim() && (uniqueSearchMatches.length > 0 || selectedUniqueItem) && !isUniqueSearchResultInTiers && (
                <div className="unique-add-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                  <div className="custom-dropdown unique-tier-selector">
                    <div 
                      className="dropdown-trigger"
                      onClick={() => setIsUniqueTierDropdownOpen(!isUniqueTierDropdownOpen)}
                    >
                      {selectedUniqueTier} 티어
                      <span className="dropdown-arrow">▼</span>
                    </div>
                    {isUniqueTierDropdownOpen && (
                      <div className="dropdown-menu">
                        {["S", "A", "B", "C", "D"].map((tier) => (
                          <div
                            key={tier}
                            className={`dropdown-option ${selectedUniqueTier === tier ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedUniqueTier(tier);
                              setIsUniqueTierDropdownOpen(false);
                            }}
                          >
                            {tier} 티어
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="unique-add-button"
                    onClick={handleAddUniqueToTier}
                    disabled={!selectedUniqueItem && !uniqueSearchQuery.trim()}
                  >
                    {lang === "ko" ? "검색 결과 추가" : "Add Search Result"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 티어 영역 컨테이너 시작 */}
      <div className="card" style={{ position: "relative" }}>
        {/* 유니크 검색 결과 리스트 (검색 input 너비에 맞춤, 티어 영역 위에 오버레이로 배치) */}
        {selectedCategory === "uniques" && debouncedUniqueSearchQuery.trim() && uniqueSearchMatches.length > 0 && !isUniqueSearchResultInTiers && !selectedUniqueItem && (
          <div className="unique-search-results-container" id="unique-search-results-container">
            <div className="unique-search-results">
              <div className="unique-search-results-header">
                <span className="unique-search-results-title">
                  {lang === "ko" ? "검색 결과" : "Search Results"} ({uniqueSearchMatches.length}개)
                </span>
              </div>
              <div className="unique-search-results-list">
                {uniqueSearchMatches.map((baseType, index) => {
                  const translatedName = translateItemName(baseType);
                  const searchQueryLower = debouncedUniqueSearchQuery.toLowerCase();
                  const isKoreanQuery = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(debouncedUniqueSearchQuery);
                  
                  // 하이라이트를 위한 텍스트 분할 함수
                  const highlightTextParts = (text, searchQuery) => {
                    if (!searchQuery) {
                      return [{ text, highlight: false }];
                    }
                    
                    const lowerText = text.toLowerCase();
                    const lowerQuery = searchQuery.toLowerCase();
                    const parts = [];
                    let lastIndex = 0;
                    
                    let searchIndex = lowerText.indexOf(lowerQuery, lastIndex);
                    while (searchIndex !== -1) {
                      // 검색어 앞 부분
                      if (searchIndex > lastIndex) {
                        parts.push({ text: text.substring(lastIndex, searchIndex), highlight: false });
                      }
                      // 검색어 부분 (하이라이트)
                      parts.push({ text: text.substring(searchIndex, searchIndex + searchQuery.length), highlight: true });
                      lastIndex = searchIndex + searchQuery.length;
                      searchIndex = lowerText.indexOf(lowerQuery, lastIndex);
                    }
                    // 마지막 부분
                    if (lastIndex < text.length) {
                      parts.push({ text: text.substring(lastIndex), highlight: false });
                    }
                    
                    return parts.length > 0 ? parts : [{ text, highlight: false }];
                  };
                  
                  // 한글과 영어 모두에서 검색어 찾기
                  const koreanParts = highlightTextParts(translatedName, debouncedUniqueSearchQuery);
                  const englishParts = highlightTextParts(baseType, debouncedUniqueSearchQuery);
                  
                  const isSelected = selectedUniqueItem === baseType;
                  
                  return (
                    <div
                      key={baseType}
                      className={`unique-search-result-item ${isSelected ? "unique-search-result-item-selected" : ""}`}
                      onClick={() => handleSelectUniqueItem(baseType)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <div className="unique-search-result-name">
                        {/* 한글 부분 */}
                        {koreanParts.map((part, i) => (
                          <span
                            key={`ko-${i}`}
                            style={{
                              color: part.highlight ? "#a3ff12" : undefined,
                              fontWeight: part.highlight ? 600 : undefined,
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                        {/* 구분자 */}
                        <span style={{ color: "var(--muted, #999)", margin: "0 4px" }}>|</span>
                        {/* 영어 부분 */}
                        {englishParts.map((part, i) => (
                          <span
                            key={`en-${i}`}
                            style={{
                              color: part.highlight ? "#a3ff12" : "var(--muted, #999)",
                              fontWeight: part.highlight ? 600 : undefined,
                              fontStyle: "italic",
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="cardBody" style={{ paddingTop: 0 }}>
          {/* 모든 카테고리에서 티어 그리드 표시 */}
          {/* S, A, B, C, D 티어 그리드 */}
          <div className={`tier-grid-main ${selectedCategory === "uniques" || selectedCategory === "mods" ? "tier-grid-spaced" : ""}`}>
            {(selectedCategory === "mods" ? ["A", "B", "C"] : (selectedCategory === "uniques" ? ["S", "A", "B", "C", "D"] : ["S", "A", "B", "C", "D"])).map((tier) => (
              <div key={tier} className={`tier-column ${selectedCategory === "uniques" || selectedCategory === "mods" ? "tier-column-spaced" : ""} ${selectedCategory === "uniques" && tier === "D" ? "tier-column-dimmed" : ""}`}>
                <div
                  className="tier-header"
                  style={{
                    background: tierColors[tier],
                    color: tier === "C" ? "#000000" : "#ffffff",
                    cursor: selectedCategory === "currency" ? "pointer" : "default",
                  }}
                  onClick={() => selectedCategory === "currency" && handleTierHeaderClick(tier)}
                >
                  <div className="tier-label">{tier} 티어</div>
                  <div className="tier-count">
                    {(() => {
                      if (selectedCategory === "currency") {
                        // selectedLeague를 그대로 사용 (default 키가 존재함)
                        const leagueKey = selectedLeague;
                        
                        // 선택된 화폐 종류가 있으면 먼저 데이터 존재 여부 확인
                        if (selectedCurrencyTypes.length > 0) {
                          const itemsInSelectedCategories = new Set();
                          selectedCurrencyTypes.forEach(categoryId => {
                            const categoryItems = currencyItemCategories[categoryId] || [];
                            categoryItems.forEach(itemName => {
                              itemsInSelectedCategories.add(itemName);
                            });
                          });
                          
                          // 빈 배열이면 데이터 없음
                          if (itemsInSelectedCategories.size === 0) {
                            return 0;
                          }
                          
                          // 모든 티어에서 선택된 화폐 종류에 해당하는 아이템이 있는지 확인
                          let hasAnyItems = false;
                          for (const t of ["S", "A", "B", "C", "D", "E"]) {
                            const items = currencyTiers[leagueKey]?.[t] || [];
                            for (const itemName of items) {
                              if (itemsInSelectedCategories.has(itemName)) {
                                hasAnyItems = true;
                                break;
                              }
                            }
                            if (hasAnyItems) break;
                          }
                          
                          // 데이터가 없으면 0개 반환
                          if (!hasAnyItems) {
                            return 0;
                          }
                          
                          // 선택된 화폐 종류에 해당하는 아이템만 카운트
                          let count = 0;
                          ["S", "A", "B", "C", "D", "E"].forEach((t) => {
                            const items = currencyTiers[leagueKey]?.[t] || [];
                            items.forEach((itemName) => {
                              const actualTier = getCurrencyItemTier(itemName);
                              if (actualTier === tier && itemsInSelectedCategories.has(itemName)) {
                                count++;
                              }
                            });
                          });
                          return count;
                        }
                        
                        // 전체 선택일 때: 모든 화폐 아이템을 가져와서 실제 티어로 필터링하여 카운트
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
                      } else if (selectedCategory === "uniques") {
                        // 유니크는 uniquesTiers에서 해당 티어의 BaseType 수 반환
                        if (tier === "D") {
                          // D 티어는 quick-filter-defaults.json의 uniques_d_other에서 가져옴
                          const dTierRule = quickFilterDefaults.uniques?.rules?.find(r => r.id === "uniques_d_other");
                          const dTierBaseTypes = dTierRule?.conditions?.baseType?.value || [];
                          return dTierBaseTypes.length;
                        }
                        const baseTierItems = uniquesTiers[tier] || [];
                        // 커스텀 티어 반영
                        let count = baseTierItems.length;
                        Object.keys(customUniquesTiers).forEach((baseType) => {
                          const customTier = customUniquesTiers[baseType];
                          // 커스텀 티어가 현재 티어와 다르면 카운트 조정
                          if (customTier === tier && !baseTierItems.includes(baseType)) {
                            count++;
                          } else if (customTier !== tier && baseTierItems.includes(baseType)) {
                            count--;
                          }
                        });
                        return count;
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
                        
                        // 선택된 화폐 종류가 있으면 해당 티어에 데이터가 있는지 확인
                        if (selectedCurrencyTypes.length > 0) {
                          const itemsInSelectedCategories = new Set();
                          selectedCurrencyTypes.forEach(categoryId => {
                            const categoryItems = currencyItemCategories[categoryId] || [];
                            categoryItems.forEach(itemName => {
                              itemsInSelectedCategories.add(itemName);
                            });
                          });
                          
                          // 빈 배열이면 데이터 없음
                          if (itemsInSelectedCategories.size === 0) {
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
                          
                          // 현재 티어에서 선택된 화폐 종류에 해당하는 아이템이 있는지 확인
                          let hasItemsInCurrentTier = false;
                          ["S", "A", "B", "C", "D", "E"].forEach((t) => {
                            const items = currencyTiers[leagueKey]?.[t] || [];
                            items.forEach((itemName) => {
                              const actualTier = getCurrencyItemTier(itemName);
                              if (actualTier === tier && itemsInSelectedCategories.has(itemName)) {
                                hasItemsInCurrentTier = true;
                              }
                            });
                          });
                          
                          // 현재 티어에 데이터가 없으면 아무것도 표시하지 않음
                          if (!hasItemsInCurrentTier) {
                            // 다른 티어에 데이터가 있는지 확인
                            let hasAnyItems = false;
                            for (const t of ["S", "A", "B", "C", "D", "E"]) {
                              const items = currencyTiers[leagueKey]?.[t] || [];
                              for (const itemName of items) {
                                const actualTier = getCurrencyItemTier(itemName);
                                if (itemsInSelectedCategories.has(itemName)) {
                                  hasAnyItems = true;
                                  break;
                                }
                              }
                              if (hasAnyItems) break;
                            }
                            
                            // 전체 데이터가 없을 때만 안내 메시지 표시
                            if (!hasAnyItems) {
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
                            
                            // 특정 티어에만 데이터가 없는 경우 아무것도 표시하지 않음
                            return null;
                          }
                        }
                        
                        // 모든 화폐 아이템을 가져와서 실제 티어로 필터링 (중복 제거)
                        const allCurrencyItemsSet = new Set();
                        ["S", "A", "B", "C", "D", "E"].forEach((t) => {
                          const items = currencyTiers[leagueKey]?.[t] || [];
                          items.forEach((itemName) => {
                            const actualTier = getCurrencyItemTier(itemName);
                            if (actualTier === tier) {
                              allCurrencyItemsSet.add(itemName);
                            }
                          });
                        });
                        const allCurrencyItems = Array.from(allCurrencyItemsSet);
                        
                        // 화폐 종류로 필터링 및 그룹화
                        let categoryFilteredItems = allCurrencyItems;
                        let itemsByCategory = {};
                        
                        if (selectedCurrencyTypes.length > 0) {
                          // 선택된 화폐 종류에 해당하는 아이템만 필터링
                          const itemsInSelectedCategories = new Set();
                          selectedCurrencyTypes.forEach(categoryId => {
                            const categoryItems = currencyItemCategories[categoryId] || [];
                            categoryItems.forEach(itemName => {
                              itemsInSelectedCategories.add(itemName);
                            });
                          });
                          categoryFilteredItems = allCurrencyItems.filter(itemName => 
                            itemsInSelectedCategories.has(itemName)
                          );
                        } else {
                          // 전체 선택일 때: 각 화폐 종류별로 그룹화 (중복 제거)
                          Object.keys(currencyItemCategories).forEach(categoryId => {
                            const categoryItems = currencyItemCategories[categoryId] || [];
                            const itemsInCategorySet = new Set();
                            allCurrencyItems.forEach(itemName => {
                              if (categoryItems.includes(itemName)) {
                                itemsInCategorySet.add(itemName);
                              }
                            });
                            const itemsInCategory = Array.from(itemsInCategorySet);
                            if (itemsInCategory.length > 0) {
                              itemsByCategory[categoryId] = itemsInCategory;
                            }
                          });
                        }
                        
                        const filteredItems = selectedCurrencyTypes.length === 0 
                          ? null // 전체 선택일 때는 itemsByCategory 사용
                          : searchFilter(categoryFilteredItems);
                        
                        // 전체 선택일 때: 각 화폐 종류별로 그룹화해서 표시
                        if (selectedCurrencyTypes.length === 0) {
                          // 검색어로 필터링된 카테고리별 아이템
                          const filteredItemsByCategory = {};
                          Object.keys(itemsByCategory).forEach(categoryId => {
                            const filtered = searchFilter(itemsByCategory[categoryId]);
                            if (filtered.length > 0) {
                              filteredItemsByCategory[categoryId] = filtered;
                            }
                          });
                          
                          if (Object.keys(filteredItemsByCategory).length === 0) {
                            return null;
                          }
                          
                          // 화폐 종류 순서대로 표시 (currencyTypes 순서 유지)
                          const categoryOrder = currencyTypes
                            .filter(t => t.id !== "" && filteredItemsByCategory[t.id])
                            .map(t => t.id);
                          
                          return categoryOrder.map((categoryId) => {
                            const categoryItems = filteredItemsByCategory[categoryId];
                            const categoryName = currencyTypes.find(t => t.id === categoryId)?.name || categoryId;
                            
                            // 중복 제거 및 제외된 아이템 필터링
                            const uniqueCategoryItems = Array.from(new Set(categoryItems))
                              .filter(itemName => !excludedItems["currency"]?.includes(itemName));
                            
                            return (
                              <div key={categoryId} className="tier-class-group">
                                <div className="tier-class-name">{categoryName}</div>
                                {uniqueCategoryItems.map((itemName, index) => {
                                  const actualTier = getCurrencyItemTier(itemName);
                                  const resolvedItemName = itemDefinitions[itemName] ? itemName : (itemDefinitions[`Greater ${itemName}`] ? `Greater ${itemName}` : itemName);
                                  const itemDef = itemDefinitions[resolvedItemName];
                                  return (
                                    <div
                                      key={`${categoryId}-${itemName}-${index}`}
                                      className="tier-item"
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, itemName, actualTier)}
                                      onDragOver={handleDragOver}
                                      onContextMenu={(e) => handleContextMenu(e, itemName, "currency")}
                                      style={{
                                        cursor: "grab",
                                      }}
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
                                      <ItemTooltip itemName={resolvedItemName}>
                                        <div 
                                          className="tier-item-name"
                                          style={{
                                            color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}
                                        >
                                          <img
                                            src={getItemIconSrc(itemDef)}
                                            alt=""
                                            onError={(e) => {
                                              // 일부 아이콘 CDN 경로(예: ReliquaryKeys, SoulCores)가 403/404로 막히는 경우가 있어
                                              // 로드 실패 시 로컬 fallback 아이콘으로 대체합니다.
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src = FALLBACK_ICON_SRC;
                                            }}
                                            style={{ width: '28px', height: 'auto', objectFit: 'contain' }}
                                          />
                                          {translateItemName(itemName)}
                                        </div>
                                      </ItemTooltip>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          });
                        }
                        
                        // 선택된 화폐 종류가 있고, 해당 티어에 아이템이 없으면 null 반환
                        if (filteredItems.length === 0) {
                          return null;
                        }
                        
                        const getTierTextColor = (tier) => {
                          if (tier === "S") return "#000000";
                          if (tier === "A" || tier === "B") return "#ffffff";
                          if (tier === "E") return "rgb(220, 175, 132)";
                          return "#000000";
                        };
                        
                        return filteredItems
                          .filter(itemName => !excludedItems["currency"]?.includes(itemName))
                          .map((itemName) => {
                          const actualTier = getCurrencyItemTier(itemName);
                          const isSelected = selectedItems.has(itemName);
                          const resolvedItemName = itemDefinitions[itemName] ? itemName : (itemDefinitions[`Greater ${itemName}`] ? `Greater ${itemName}` : itemName);
                          const itemDef = itemDefinitions[resolvedItemName];
                          return (
                            <div
                              key={itemName}
                              className={`tier-item ${isSelected ? "tier-item-selected" : ""}`}
                              draggable={selectedItems.size === 0}
                              onDragStart={(e) => {
                                if (selectedItems.size === 0) {
                                  handleDragStart(e, itemName, actualTier);
                                } else {
                                  e.preventDefault();
                                }
                              }}
                              onDragOver={handleDragOver}
                              onContextMenu={(e) => handleContextMenu(e, itemName, "currency")}
                              onClick={(e) => {
                                // 아이템 클릭 시 자동으로 선택/해제 (편집 모드 없이)
                                e.stopPropagation();
                                setSelectedItems(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(itemName)) {
                                    newSet.delete(itemName);
                                  } else {
                                    newSet.add(itemName);
                                  }
                                  return newSet;
                                });
                              }}
                              style={{
                                cursor: selectedItems.size > 0 ? "pointer" : "grab",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                onClick={(e) => e.stopPropagation()}
                                className="tier-item-checkbox"
                                style={{ display: selectedItems.size > 0 || isSelected ? "block" : "none" }}
                              />
                              {selectedItems.size === 0 && !isSelected && (
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
                              )}
                              <ItemTooltip itemName={resolvedItemName}>
                                <div 
                                  className="tier-item-name"
                                  style={{
                                    color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}
                                >
                                  <img
                                    src={getItemIconSrc(itemDef)}
                                    alt=""
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_ICON_SRC;
                                    }}
                                    style={{ width: '28px', height: 'auto', objectFit: 'contain' }}
                                  />
                                  {translateItemName(itemName)}
                                </div>
                              </ItemTooltip>
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
                            let eTierItems = baseETierItems.filter(itemName => {
                              const actualTier = getCurrencyItemTier(itemName);
                              return actualTier === "E";
                            });
                            
                            // 선택된 화폐 종류가 있으면 필터링
                            if (selectedCurrencyTypes.length > 0) {
                              const itemsInSelectedCategories = new Set();
                              selectedCurrencyTypes.forEach(categoryId => {
                                const categoryItems = currencyItemCategories[categoryId] || [];
                                categoryItems.forEach(itemName => {
                                  itemsInSelectedCategories.add(itemName);
                                });
                              });
                              
                              // 빈 배열이면 데이터 없음 - E 티어는 헤더 포함 전체 숨김
                              if (itemsInSelectedCategories.size === 0) {
                                return null;
                              }
                              
                              eTierItems = eTierItems.filter(itemName => 
                                itemsInSelectedCategories.has(itemName)
                              );
                              
                              // E 티어 아이템이 없으면 헤더 포함 전체 숨김
                              if (eTierItems.length === 0) {
                                return null;
                              }
                              
                              // 검색어 및 제외 목록으로 필터링
                              const finalETierItems = searchFilter(eTierItems)
                                .filter(itemName => !excludedItems["currency"]?.includes(itemName));
                              
                              // 검색 후에도 아이템이 없으면 헤더 포함 전체 숨김
                              if (finalETierItems.length === 0) {
                                return null;
                              }
                              
                              return (
                                <>
                                  <div className="tier-e-divider">
                                    <div className="tier-e-header">
                                      <div className="tier-e-label">E 티어</div>
                                      <div className="tier-e-count">
                                        {finalETierItems.length}개
                                      </div>
                                    </div>
                                  </div>
                                  {finalETierItems.map((itemName, index) => {
                                    const actualTier = getCurrencyItemTier(itemName);
                                    const isSelected = selectedItems.has(itemName);
                                    const trimmedItemName = itemName.trim();
                                    const resolvedItemName = itemDefinitions[trimmedItemName]
                                      ? trimmedItemName
                                      : (itemDefinitions[`Greater ${trimmedItemName}`]
                                        ? `Greater ${trimmedItemName}`
                                        : trimmedItemName);
                                    const itemDef = itemDefinitions[resolvedItemName];
                                    const getTierTextColor = (tier) => {
                                      if (tier === "S") return "#000000";
                                      if (tier === "A" || tier === "B") return "#ffffff";
                                      if (tier === "E") return "rgb(220, 175, 132)";
                                      return "#000000";
                                    };
                                    return (
                                      <div
                                        key={`E-${tier}-${itemName}-${index}`}
                                        className={`tier-item ${isSelected ? "tier-item-selected" : ""}`}
                                        draggable={selectedItems.size === 0}
                                        onDragStart={(e) => {
                                          if (selectedItems.size === 0) {
                                            handleDragStart(e, itemName, actualTier || "E");
                                          } else {
                                            e.preventDefault();
                                          }
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, itemName, "currency")}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedItems(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(itemName)) {
                                              newSet.delete(itemName);
                                            } else {
                                              newSet.add(itemName);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        style={{
                                          cursor: selectedItems.size > 0 || isSelected ? "pointer" : "grab",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {}}
                                          onClick={(e) => e.stopPropagation()}
                                          className="tier-item-checkbox"
                                          style={{ display: selectedItems.size > 0 || isSelected ? "block" : "none" }}
                                        />
                                        {selectedItems.size === 0 && !isSelected && (
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
                                        )}
                                        <ItemTooltip itemName={resolvedItemName}>
                                          <div 
                                            className="tier-item-name"
                                            style={{
                                              color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px'
                                            }}
                                          >
                                            <img
                                              src={getItemIconSrc(itemDef)}
                                              alt=""
                                              onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = FALLBACK_ICON_SRC;
                                              }}
                                              style={{ width: '28px', height: 'auto', objectFit: 'contain' }}
                                            />
                                            {translateItemName(itemName)}
                                          </div>
                                        </ItemTooltip>
                                      </div>
                                    );
                                  })}
                                </>
                              );
                            } else {
                              // 전체 선택일 때: 각 화폐 종류별로 그룹화
                              const eTierItemsByCategory = {};
                              Object.keys(currencyItemCategories).forEach(categoryId => {
                                const categoryItems = currencyItemCategories[categoryId] || [];
                                const itemsInCategory = eTierItems.filter(itemName => 
                                  categoryItems.includes(itemName)
                                );
                                if (itemsInCategory.length > 0) {
                                  eTierItemsByCategory[categoryId] = itemsInCategory;
                                }
                              });
                              
                              // 검색어로 필터링
                              const filteredETierItemsByCategory = {};
                              Object.keys(eTierItemsByCategory).forEach(categoryId => {
                                const filtered = searchFilter(eTierItemsByCategory[categoryId]);
                                if (filtered.length > 0) {
                                  filteredETierItemsByCategory[categoryId] = filtered;
                                }
                              });
                              
                              // E 티어 아이템이 없으면 헤더 포함 전체 숨김
                              if (Object.keys(filteredETierItemsByCategory).length === 0) {
                                return null;
                              }
                              
                              // 화폐 종류 순서대로 표시
                              const categoryOrder = currencyTypes
                                .filter(t => t.id !== "" && filteredETierItemsByCategory[t.id])
                                .map(t => t.id);
                              
                              // E 티어 총 개수 계산
                              let totalETierCount = 0;
                              Object.values(filteredETierItemsByCategory).forEach(items => {
                                totalETierCount += items.length;
                              });
                              
                              return (
                                <>
                                  <div className="tier-e-divider">
                                    <div className="tier-e-header">
                                      <div className="tier-e-label">E 티어</div>
                                      <div className="tier-e-count">
                                        {totalETierCount}개
                                      </div>
                                    </div>
                                  </div>
                                  {categoryOrder.map((categoryId) => {
                                    const categoryItems = filteredETierItemsByCategory[categoryId];
                                    const categoryName = currencyTypes.find(t => t.id === categoryId)?.name || categoryId;
                                    
                                    return (
                                      <div key={`E-${categoryId}`} className="tier-class-group">
                                        <div className="tier-class-name">{categoryName}</div>
                                        {categoryItems.map((itemName) => {
                                          const actualTier = getCurrencyItemTier(itemName);
                                          const isSelected = selectedItems.has(itemName);
                                           const trimmedItemName = itemName.trim();
                                           const resolvedItemName = itemDefinitions[trimmedItemName] ? trimmedItemName : (itemDefinitions[`Greater ${trimmedItemName}`] ? `Greater ${trimmedItemName}` : trimmedItemName);
                                           const itemDef = itemDefinitions[resolvedItemName];
                                          return (
                                            <div
                                              key={`E-${categoryId}-${itemName}`}
                                              className={`tier-item ${isSelected ? "tier-item-selected" : ""}`}
                                              draggable={selectedItems.size === 0}
                                              onDragStart={(e) => {
                                                if (selectedItems.size === 0) {
                                                  handleDragStart(e, itemName, actualTier || "E");
                                                } else {
                                                  e.preventDefault();
                                                }
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItems(prev => {
                                                  const newSet = new Set(prev);
                                                  if (newSet.has(itemName)) {
                                                    newSet.delete(itemName);
                                                  } else {
                                                    newSet.add(itemName);
                                                  }
                                                  return newSet;
                                                });
                                              }}
                                              style={{
                                                cursor: selectedItems.size > 0 || isSelected ? "pointer" : "grab",
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                onClick={(e) => e.stopPropagation()}
                                                className="tier-item-checkbox"
                                                style={{ display: selectedItems.size > 0 || isSelected ? "block" : "none" }}
                                              />
                                              {selectedItems.size === 0 && !isSelected && (
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
                                              )}
                                              <ItemTooltip itemName={resolvedItemName}>
                                                <div
                                                  className="tier-item-name"
                                                  style={{
                                                    color: debouncedSearchQuery.trim() ? "#a3ff12" : undefined,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                  }}
                                                >
                                                  <img
                                                    src={getItemIconSrc(itemDef)}
                                                    alt=""
                                                    onError={(e) => {
                                                      e.currentTarget.onerror = null;
                                                      e.currentTarget.src = FALLBACK_ICON_SRC;
                                                    }}
                                                    style={{ width: '28px', height: 'auto', objectFit: 'contain' }}
                                                  />
                                                  {translateItemName(itemName)}
                                                </div>
                                              </ItemTooltip>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </>
                              );
                            }
                          })()}
                        </>
                      )}
                    </>
                  )}
                  
                  {/* 유니크 카테고리일 때 유니크 아이템 표시 */}
                  {selectedCategory === "uniques" && (
                    <>
                      {(() => {
                        // D 티어는 안내 메시지 박스만 표시
                        if (tier === "D") {
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
                                기타 유니크는 빠른 설정에서<br />설정할 수 있습니다.
                              </div>
                            </div>
                          );
                        }
                        
                        // uniquesTiers에서 해당 티어의 BaseType 목록 가져오기
                        const baseTierItems = uniquesTiers[tier] || [];
                        
                        // 커스텀 티어 반영
                        const finalTierItems = [];
                        baseTierItems.forEach((baseType) => {
                          const customTier = customUniquesTiers[baseType];
                          const actualTier = customTier || tier;
                          if (actualTier === tier) {
                            finalTierItems.push(baseType);
                          }
                        });
                        
                        // 커스텀 티어로 다른 티어에서 이동한 아이템 추가
                        Object.keys(customUniquesTiers).forEach((baseType) => {
                          const customTier = customUniquesTiers[baseType];
                          if (customTier === tier && !baseTierItems.includes(baseType)) {
                            finalTierItems.push(baseType);
                          }
                        });
                        
                        // 검색어 및 제외 목록으로 필터링 (유니크 전용 검색 필터 사용)
                        const filteredItems = uniqueSearchFilter(finalTierItems)
                          .filter(baseType => !excludedItems["uniques"]?.includes(baseType));
                        
                        if (filteredItems.length === 0) {
                          return null;
                        }
                        
                        return filteredItems.map((baseType) => {
                              const actualTier = getUniquesItemTier(baseType) || tier;
                              const isCustomTier = !!customUniquesTiers[baseType];
                          return (
                            <div
                              key={baseType}
                              className={`tier-item ${isCustomTier ? "tier-item-custom" : ""}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, baseType, actualTier)}
                              onContextMenu={(e) => handleContextMenu(e, baseType, "uniques")}
                              style={{
                                cursor: "grab",
                              }}
                              title={translateItemName(baseType)}
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
                                  color: debouncedUniqueSearchQuery.trim() ? "#a3ff12" : undefined
                                }}
                              >
                                {translateItemName(baseType)}
                              </div>
                            </div>
                          );
                        });
                      })()}
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
                            return actualTier === tier && !excludedItems["gear-bases"]?.includes(item.name);
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
                                    onContextMenu={(e) => handleContextMenu(e, item.name, "gear-bases")}
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
                                          return actualTier === "E" && !excludedItems["gear-bases"]?.includes(item.name);
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
                                    return actualTier === "E" && !excludedItems["gear-bases"]?.includes(item.name);
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
                                            draggable={selectedItems.size === 0}
                                            onDragStart={(e) => {
                                              if (selectedItems.size === 0) {
                                                handleDragStart(e, item.name, actualTier);
                                              } else {
                                                e.preventDefault();
                                              }
                                            }}
                                            onContextMenu={(e) => handleContextMenu(e, item.name, "gear-bases")}
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
                  
                  {/* 모드 카테고리일 때 아이템 표시 */}
                  {selectedCategory === "mods" && (
                    <>
                      {(() => {
                        // 모든 가용 모드 그룹 목록 (modsTiersData.groups에서 추출)
                        const allModGroups = Object.values(modsTiersData.groups || {});
                        
                        // 현재 티어에 해당하는 모드들 필터링
                        const finalTierMods = allModGroups.filter(mod => {
                          // customModsTiers[mod.id]가 있으면 그것을 우선, 없으면 modsTiersData[tier] 배열 확인
                          const customTier = customModsTiers[mod.id];
                          if (customTier) return customTier === tier;
                          
                          return modsTiersData[tier]?.includes(mod.id);
                        });
                        
                        // 검색어 및 클래스로 필터링
                        const filteredMods = finalTierMods.filter(m => {
                          const matchesSearch = !debouncedSearchQuery.trim() || 
                            m.nameEn.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                            m.nameKo.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                          
                          const matchesClass = !selectedClass || (m.classes && m.classes.includes(selectedClass));
                          
                          const isExcluded = excludedItems["mods"]?.includes(m.id);
                          
                          return matchesSearch && matchesClass && !isExcluded;
                        });
                        
                        if (filteredMods.length === 0) {
                          return (
                            <div className="tier-item tier-empty-button">
                              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                                {lang === "ko" ? "데이터가 없습니다." : "No data found."}
                              </div>
                            </div>
                          );
                        }
                        
                        return filteredMods.map((mod) => {
                          const isCustomTier = !!customModsTiers[mod.id];
                          return (
                            <div
                              key={mod.id}
                              className={`tier-item mod-tier-item ${isCustomTier ? "tier-item-custom" : ""}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, mod.id, tier)}
                              onContextMenu={(e) => {
                                e.stopPropagation();
                                handleContextMenu(e, mod.id, "mods");
                              }}
                              onClick={() => {
                                setSelectedModForDetail(mod);
                                setIsModDetailModalOpen(true);
                              }}
                              style={{ cursor: "pointer", height: "auto", minHeight: "50px", padding: "10px" }}
                              title={`${mod.nameKo} (${mod.nameEn})`}
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
                              </div>
                              <div className="mod-item-content" style={{ flex: 1 }}>
                                <div className="tier-item-name" style={{ color: "#eee", fontSize: "14px" }}>
                                  {lang === "ko" ? mod.nameKo : mod.nameEn}
                                </div>
                                <div className="mod-item-tags" style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                                  {mod.tags && mod.tags.map((tag, idx) => (
                                    <span key={idx} className={`mod-tag tag-${tag}`} style={{ fontSize: "10px", padding: "1px 4px", borderRadius: "2px", background: "rgba(255,255,255,0.05)" }}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* 편집 모달 */}
      {editingCurrencyType && (
        <CurrencyTypeColorEditor
          currencyTypeId={editingCurrencyType.id}
          currencyTypeName={editingCurrencyType.name}
          isOpen={isColorEditorOpen}
          onClose={() => {
            setIsColorEditorOpen(false);
            setEditingCurrencyType(null);
            setSelectedItems(new Set());
          }}
          onSave={(currencyTypeId, colors) => {
            // 저장 완료 후 선택 해제
            setSelectedItems(new Set());
            setIsEditMode(false);
            // TODO: 필터 생성 시 이 색상 정보를 사용하도록 업데이트 필요
          }}
          lang={lang}
        />
      )}

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && contextMenuItem && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleDeleteItemClick(contextMenuItem)}
          >
            {lang === "ko" ? "삭제" : "Delete"}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <NotificationModal
        isOpen={deleteModalOpen && !!itemToDelete}
        onClose={handleDeleteModalClose}
        type="confirm"
        title={lang === "ko" ? "아이템 삭제" : "Delete Item"}
        message={
          <>
            <strong>{translateItemName(itemToDelete)}</strong>
            {lang === "ko" ? "을(를) 삭제하시겠습니까?" : " - Are you sure you want to delete this item?"}
          </>
        }
        description={
          lang === "ko"
            ? "이 작업은 커스텀 티어 설정에서만 제거되며, 기본 티어 설정에는 영향을 주지 않습니다."
            : "This will only remove it from your custom tier settings and will not affect the default tier settings."
        }
        confirmText={lang === "ko" ? "삭제" : "Delete"}
        cancelText={lang === "ko" ? "취소" : "Cancel"}
        onConfirm={handleDeleteItemConfirm}
        lang={lang}
      />

      {/* 추가 성공 알림 모달 */}
      <NotificationModal
        isOpen={addSuccessModalOpen && !!addedItemInfo}
        onClose={handleAddSuccessModalClose}
        type="success"
        title={lang === "ko" ? "티어 추가 완료" : "Tier Added"}
        message={
          <>
            <strong>{addedItemInfo ? translateItemName(addedItemInfo.baseType) : ""}</strong>
            {addedItemInfo && (lang === "ko" 
              ? `이(가) ${addedItemInfo.tier} 티어에 추가되었습니다.`
              : ` has been added to ${addedItemInfo.tier} tier.`)}
          </>
        }
        autoCloseDelay={3000}
        lang={lang}
      />

      {/* 일반 알림 모달 */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        autoCloseDelay={notificationModal.autoCloseDelay}
        lang={lang}
      />

      <ModDetailModal
        isOpen={isModDetailModalOpen}
        onClose={() => setIsModDetailModalOpen(false)}
        mod={selectedModForDetail}
        lang={lang}
      />

      {/* 확인 모달 (confirm 대체) */}
      <NotificationModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          // 확인 모달 닫을 때 티어 스타일 모달도 닫기 (취소 시)
          if (tierStyleModal.isOpen) {
            setTierStyleModal({ isOpen: false, tier: null, currencyType: null, styles: null });
          }
        }}
        type="confirm"
        message={confirmModal.message}
        confirmText={lang === "ko" ? "확인" : "Confirm"}
        cancelText={lang === "ko" ? "취소" : "Cancel"}
        onConfirm={() => {
          if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
          }
        }}
        onCancel={() => {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          // 취소 시 티어 스타일 모달도 닫기
          if (tierStyleModal.isOpen) {
            setTierStyleModal({ isOpen: false, tier: null, currencyType: null, styles: null });
          }
        }}
        showCancel={true}
        lang={lang}
      />

      {/* 티어 스타일 설정 모달 */}
      {tierStyleModal.isOpen && tierStyleModal.tier && tierStyleModal.styles && (
        <StyleSettingsModal
          isOpen={tierStyleModal.isOpen && !confirmModal.isOpen}
          onClose={() => {
            if (!confirmModal.isOpen) {
              setTierStyleModal({ isOpen: false, tier: null, currencyType: null, styles: null });
            }
          }}
          styles={tierStyleModal.styles}
          onChange={(newStyles) => {
            // onChange는 모달이 닫히기 전에 호출되므로, 여기서 확인 모달을 먼저 표시
            const { tier, currencyType } = tierStyleModal;
            
            if (currencyType === null) {
              // 전체 상태: 모든 화폐 종류에 적용
              // 확인 모달 표시
              setConfirmModal({
                isOpen: true,
                message: lang === "ko" 
                  ? "모든 화폐 종류에 변경된 옵션이 적용됩니다. 계속하시겠습니까?"
                  : "The changed options will be applied to all currency types. Continue?",
                onConfirm: () => {
                  // 모든 화폐 종류에 적용
                  Object.keys(currencyItemCategories).forEach(categoryId => {
                    if (categoryId !== "") {
                      saveCurrencyTypeTierStyle(categoryId, tier, newStyles);
                    }
                  });
                  setConfirmModal({ isOpen: false, message: "", onConfirm: null });
                  setTierStyleModal({ isOpen: false, tier: null, currencyType: null, styles: null });
                  
                  // 페이지 새로고침 또는 상태 업데이트로 변경사항 반영
                  window.location.reload();
                },
              });
            } else {
              // 특정 화폐 종류에만 적용
              saveCurrencyTypeTierStyle(currencyType, tier, newStyles);
              setTierStyleModal({ isOpen: false, tier: null, currencyType: null, styles: null });
              
              // 페이지 새로고침 또는 상태 업데이트로 변경사항 반영
              window.location.reload();
            }
          }}
          itemName={(() => {
            // 티어의 첫 번째 아이템 이름 가져오기
            const firstItemName = getFirstItemNameInTier(tierStyleModal.tier, tierStyleModal.currencyType);
            
            // 데이터가 있으면 첫 번째 아이템 이름 사용
            if (firstItemName) {
              return firstItemName;
            }
            
            // 데이터가 없으면 기본 이름 사용
            if (tierStyleModal.currencyType) {
              return `${currencyTypes.find(t => t.id === tierStyleModal.currencyType)?.name || tierStyleModal.currencyType} ${tierStyleModal.tier} 티어`;
            } else {
              return `모든 화폐 종류 ${tierStyleModal.tier} 티어`;
            }
          })()}
          isGear={false}
        />
      )}

      {/* 하단 액션 버튼들 */}
      <ItemFilterActions
        lang={lang}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onResetAll={handleResetAll}
        onResetPage={handleResetPage}
        onLoadFromFile={handleImport}
        onSaveAsDefault={(presetId) => {
          const presetName = presetsData.presets.find(p => p.id === presetId)?.nameKo || presetId;
          setConfirmModal({
            isOpen: true,
            message: lang === "ko"
              ? `현재 ${selectedCategory === "uniques" ? "유니크" : selectedCategory === "gear-bases" ? "장비" : "설정"} 티어 설정을 "${presetName}" 프리셋의 기본값으로 저장하시겠습니까?\n\n이 작업은 ${presetName} 프리셋의 모든 사용자에게 영향을 미칩니다.`
              : `Save current ${selectedCategory === "uniques" ? "uniques" : selectedCategory === "gear-bases" ? "gear" : "settings"} tier settings as default for "${presetName}" preset?\n\nThis will affect all users using the ${presetName} preset.`,
            onConfirm: () => {
              handleSaveAsPresetDefault(presetId);
              setConfirmModal({ isOpen: false, message: "", onConfirm: null });
            },
          });
        }}
        onSaveAsLeagueDefault={(leagueId) => {
          const leagueName = leagueFilters.find(l => l.id === leagueId)?.name || leagueId;
          setConfirmModal({
            isOpen: true,
            message: lang === "ko"
              ? `현재 화폐 티어 설정을 "${leagueName}" 시세 그룹의 기본값으로 저장하시겠습니까?\n\n이 작업은 ${leagueName} 시세 그룹의 모든 사용자에게 영향을 미칩니다.`
              : `Save current currency tier settings as default for "${leagueName}" league?\n\nThis will affect all users using the ${leagueName} league.`,
            onConfirm: () => {
              handleSaveAsLeagueDefault(leagueId);
              setConfirmModal({ isOpen: false, message: "", onConfirm: null });
            },
          });
        }}
        leagueOptions={leagueFilters}
        showSaveAsLeagueDefault={true}
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

        .league-filter.coming-soon {
          position: relative;
          opacity: 0.8;
          border-style: dashed;
        }

        .league-filter.coming-soon:hover {
          opacity: 1;
          border-style: solid;
        }

        .coming-soon-badge {
          margin-left: 4px;
          font-size: 12px;
          opacity: 0.7;
        }

        /* 모드 아이템 태그 스타일 */
        .mod-tag {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 2px;
          color: #aaa;
          background: rgba(255, 255, 255, 0.05);
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .mod-tag.tag-피해 { color: #ff4d4d; background: rgba(255, 77, 77, 0.1); }
        .mod-tag.tag-물리 { color: #d4af37; background: rgba(212, 175, 55, 0.1); }
        .mod-tag.tag-공격 { color: #82ccdd; background: rgba(130, 204, 221, 0.1); }
        .mod-tag.tag-원소 { color: #60a3bc; background: rgba(96, 163, 188, 0.1); }
        .mod-tag.tag-냉기 { color: #70a1ff; background: rgba(112, 161, 255, 0.1); }
        .mod-tag.tag-능력치 { color: #2ed573; background: rgba(46, 213, 115, 0.1); }

        .mod-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mod-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .mod-tier-item {
          transition: transform 0.1s, background 0.2s;
        }

        .mod-tier-item:active {
          transform: scale(0.98);
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

        .multi-select-toggle {
          padding: 0 16px;
          height: 38px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: 0;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .multi-select-toggle:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--border);
        }

        .multi-select-toggle.multi-select-active {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: #ffffff;
        }

        .multi-select-toggle.multi-select-active:hover {
          opacity: 0.9;
        }

        .select-mode-dropdown {
          min-width: 120px;
          max-width: 150px;
        }

        .select-mode-menu {
          min-width: 120px;
        }

        .item-edit-button {
          padding: 0 16px;
          height: 38px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: 0;
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .item-edit-mode-toggle:hover,
        .item-edit-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--poe2-primary, var(--game-primary));
        }

        .item-edit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .item-edit-button:not(:disabled) {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: #ffffff;
        }

        .tier-item-selected {
          background: rgba(163, 255, 18, 0.1) !important;
          border: 1px solid rgba(163, 255, 18, 0.3) !important;
        }

        .tier-item-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          flex-shrink: 0;
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

        .dropdown-trigger-confirm {
          background: var(--poe2-primary, var(--game-primary)) !important;
          border-color: var(--poe2-primary, var(--game-primary)) !important;
          color: #ffffff !important;
          justify-content: center !important;
        }

        .dropdown-trigger-confirm:hover {
          background: var(--poe2-primary, var(--game-primary)) !important;
          opacity: 0.9;
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
          /* 스크롤바로 인한 레이아웃 시프트 방지 */
          scrollbar-gutter: stable;
          /* 또는 항상 스크롤바 표시 (브라우저 호환성을 위해 둘 다 적용) */
          overflow-y: scroll;
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
          /* 스크롤바로 인한 레이아웃 시프트 방지 */
          scrollbar-gutter: stable;
          overflow-y: scroll;
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

        /* 유니크 D 티어 블랙 오버레이 */
        .tier-column-dimmed {
          position: relative;
        }

        .tier-column-dimmed::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          pointer-events: none;
          z-index: 1;
        }

        .tier-column-dimmed .tier-header,
        .tier-column-dimmed .tier-items {
          position: relative;
          z-index: 2;
        }

        .tier-column-dimmed .tier-header {
          opacity: 0.6;
        }

        .tier-column-dimmed .tier-items {
          opacity: 0.5;
        }

        .unique-add-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .unique-tier-selector {
          min-width: 80px;
          position: relative;
        }

        .unique-add-button {
          padding: 0 16px;
          height: 38px;
          background: var(--poe2-primary, var(--game-primary));
          border: 1px solid var(--poe2-primary, var(--game-primary));
          border-radius: 0;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .unique-add-button:hover {
          opacity: 0.9;
        }

        .unique-add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 유니크 검색 결과 컨테이너 (검색 input 너비에 맞춤, 티어 영역 위에 오버레이로 배치) */
        .unique-search-results-container {
          position: absolute;
          top: 0;
          z-index: 100;
          margin-top: 4px;
          margin-bottom: 0;
        }

        /* 유니크 검색 결과 리스트 */
        .unique-search-results {
          background: #1a1a1a;
          border: 1px solid #00ff00; /* 초록색 테두리 */
          border-radius: 0;
          max-height: 400px;
          overflow-y: auto;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* 검색 결과창 스크롤바 스타일 (파란색 게임 컬러) */
        .unique-search-results::-webkit-scrollbar {
          width: 8px;
        }

        .unique-search-results::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        .unique-search-results::-webkit-scrollbar-thumb {
          background: var(--game-primary, #155dfc);
          border-radius: 4px;
        }

        .unique-search-results::-webkit-scrollbar-thumb:hover {
          background: var(--poe2-primary, #155dfc);
          opacity: 0.8;
        }

        /* Firefox 스크롤바 스타일 */
        .unique-search-results {
          scrollbar-width: thin;
          scrollbar-color: var(--game-primary, #155dfc) #0a0a0a;
        }

        .unique-search-results-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: #141414;
        }

        .unique-search-results-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .unique-search-results-list {
          padding: 8px;
        }

        .unique-search-result-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          margin-bottom: 4px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .unique-search-result-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .unique-search-result-item-selected {
          background: rgba(163, 255, 18, 0.1);
          border-color: rgba(163, 255, 18, 0.3);
        }

        .unique-search-result-item-selected:hover {
          background: rgba(163, 255, 18, 0.15);
        }

        .unique-search-result-name {
          font-size: 15px;
          color: var(--text);
          flex: 1;
        }

        /* 우클릭 컨텍스트 메뉴 */
        .context-menu {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          min-width: 120px;
          overflow: hidden;
        }

        .context-menu-item {
          padding: 10px 16px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .context-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .context-menu-item-danger {
          color: #ff4757;
        }

        .context-menu-item-danger:hover {
          background: rgba(255, 71, 87, 0.1);
        }

        /* 커스텀 티어 아이템 표시 */
        .tier-item-custom {
          position: relative;
        }

        .tier-item-custom::after {
          content: "";
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          background: var(--poe2-primary, var(--game-primary));
          border-radius: 50%;
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
          margin-top: 16px;
          font-size: var(--text-sm);
          color: var(--muted);
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
          margin-bottom: 0;
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
