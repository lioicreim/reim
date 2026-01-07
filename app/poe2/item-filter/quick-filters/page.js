"use client";

import { useState, useEffect, Fragment } from "react";
import quickFilterDefaults from "@/data/quick-filter-defaults.json";
import ItemPreviewBox from "@/app/components/ItemPreviewBox";
import ColorPicker from "@/app/components/ColorPicker";
import StyleSettingsModal from "@/app/components/StyleSettingsModal";
import presetsData from "@/data/presets.json";
import { generateFilterCode } from "@/lib/filter-generator";

export default function QuickFiltersPage() {
  // 언어 상태
  const [lang, setLang] = useState("ko");

  // 언어 설정 불러오기
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

  // 골드 설정 로드 (서버와 클라이언트에서 동일한 초기값 사용)
  const [goldSettings, setGoldSettings] = useState(quickFilterDefaults.gold);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트에서만 localStorage에서 값 불러오기
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_gold");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // 기본값과 병합하여 제목을 기본값으로 업데이트
          const defaultRules = quickFilterDefaults.gold.rules;
          const savedRules = parsed.rules || [];

          // 저장된 규칙의 제목을 기본값으로 업데이트
          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              return {
                ...savedRule,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          // 기본값에 있는데 저장된 것에 없는 규칙 추가
          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setGoldSettings({
            enabled:
              parsed.enabled !== undefined
                ? parsed.enabled
                : quickFilterDefaults.gold.enabled,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved gold settings", e);
        }
      }
    }
  }, []);

  // 골드 설정 저장
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      localStorage.setItem("quickFilter_gold", JSON.stringify(goldSettings));
    }
  }, [goldSettings, isClient]);

  // 골드 규칙 활성화/비활성화
  const toggleGoldRule = (ruleId) => {
    const updatedRules = goldSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    // 하위 규칙 중 하나라도 활성화되면 상위 카테고리도 활성화
    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setGoldSettings({
      ...goldSettings,
      enabled: hasAnyEnabled || goldSettings.enabled,
      rules: updatedRules,
    });
  };

  // 골드 규칙 값 업데이트
  const updateGoldRule = (ruleId, field, value) => {
    setGoldSettings({
      ...goldSettings,
      rules: goldSettings.rules.map((rule) => {
        if (rule.id === ruleId) {
          if (field.includes(".")) {
            // 중첩된 필드 (예: "conditions.stackSize.value")
            const parts = field.split(".");
            if (parts.length === 2) {
              const [parent, child] = parts;
              return {
                ...rule,
                [parent]: {
                  ...rule[parent],
                  [child]: value,
                },
              };
            } else if (parts.length === 3) {
              // conditions.stackSize.value 같은 경우
              const [parent, child, grandchild] = parts;
              return {
                ...rule,
                [parent]: {
                  ...rule[parent],
                  [child]: {
                    ...rule[parent][child],
                    [grandchild]: value,
                  },
                },
              };
            }
          } else if (
            field === "fontSize" ||
            field === "textColor" ||
            field === "borderColor" ||
            field === "backgroundColor" ||
            field === "playEffect" ||
            field === "minimapIcon" ||
            field === "temp" ||
            field === "playAlertSound"
          ) {
            return {
              ...rule,
              styles: {
                ...(rule.styles || {}),
                [field]: value,
              },
            };
          } else if (field === "textColorOnly") {
            // 폰트 컬러만 해제 (컬러를 기본값으로, fontSize는 유지)
            return {
              ...rule,
              styles: {
                ...(rule.styles || {}),
                textColor:
                  value === null
                    ? null
                    : value || { r: 210, g: 178, b: 135, a: 255 },
              },
            };
          } else {
            return {
              ...rule,
              [field]: value,
            };
          }
        }
        return rule;
      }),
    });
  };

  // 골드 섹션 접기/펼치기 상태
  const [isGoldExpanded, setIsGoldExpanded] = useState(true);

  // 레벨링 단계 섹션 접기/펴기 상태
  const [isLeagueStartExpanded, setIsLeagueStartExpanded] = useState(true);

  // 레벨링 단계 활성화 상태
  const [isLeagueStartEnabled, setIsLeagueStartEnabled] = useState(true);

  // 직업 선택 섹션 접기/펴기 상태
  const [isClassSelectionExpanded, setIsClassSelectionExpanded] =
    useState(true);

  // 섹션 순서 관리 (왼쪽 열)
  const [leftColumnSections, setLeftColumnSections] = useState([
    { id: "league-start", name: "레벨링 단계" },
    { id: "gold", name: "골드" },
  ]);

  // 섹션 순서 관리 (오른쪽 열)
  const [rightColumnSections, setRightColumnSections] = useState([
    { id: "my-equipment", name: "내 장비" },
  ]);

  // 섹션 순서 이동 함수
  const moveSection = (sectionId, direction, column) => {
    if (column === "left") {
      const currentIndex = leftColumnSections.findIndex(
        (s) => s.id === sectionId
      );
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= leftColumnSections.length) return;

      const newSections = [...leftColumnSections];
      [newSections[currentIndex], newSections[newIndex]] = [
        newSections[newIndex],
        newSections[currentIndex],
      ];
      setLeftColumnSections(newSections);
    } else {
      const currentIndex = rightColumnSections.findIndex(
        (s) => s.id === sectionId
      );
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= rightColumnSections.length) return;

      const newSections = [...rightColumnSections];
      [newSections[currentIndex], newSections[newIndex]] = [
        newSections[newIndex],
        newSections[currentIndex],
      ];
      setRightColumnSections(newSections);
    }
  };

  // 직업별 추천 무기/방어구 매핑
  const classRecommendations = {
    warrior: {
      weapons: ["one_hand_maces", "two_hand_maces"],
      armours: ["AR"],
      description: {
        ko: "한손 철퇴, 양손 철퇴 / 방어도",
        en: "One Hand Maces, Two Hand Maces / Armour",
      },
    },
    mercenary: {
      weapons: ["crossbows"],
      armours: ["AR", "AR/EV", "EV"],
      description: {
        ko: "쇠뇌 / 방어도, 방어도/회피, 회피",
        en: "Crossbows / Armour, Armour/Evasion, Evasion",
      },
    },
    ranger: {
      weapons: ["bows", "quivers"],
      armours: ["EV", "EV/ES"],
      description: {
        ko: "활, 화살통 / 회피, 회피/에쉴",
        en: "Bows, Quivers / Evasion, Evasion/Energy Shield",
      },
    },
    huntress: {
      weapons: ["spears"],
      armours: ["EV", "EV/ES"],
      description: {
        ko: "창 / 회피, 회피/에쉴",
        en: "Spears / Evasion, Evasion/Energy Shield",
      },
    },
    monk: {
      weapons: ["quarterstaves"],
      armours: ["EV", "EV/ES", "ES"],
      description: {
        ko: "육척봉 / 회피, 회피/에쉴, 에쉴",
        en: "Quarterstaves / Evasion, Evasion/Energy Shield, Energy Shield",
      },
    },
    witch: {
      weapons: ["staves", "wands", "foci", "sceptres"],
      armours: ["ES"],
      description: {
        ko: "지팡이, 마법봉, 집중구, 셉터 / 에쉴",
        en: "Staves, Wands, Foci, Sceptres / Energy Shield",
      },
    },
    sorceress: {
      weapons: ["staves", "wands", "foci"],
      armours: ["ES"],
      description: {
        ko: "지팡이, 마법봉, 집중구 / 에쉴",
        en: "Staves, Wands, Foci / Energy Shield",
      },
    },
    druid: {
      weapons: ["talismans", "staves"],
      armours: ["AR", "AR/ES", "ES"],
      description: {
        ko: "부적, 지팡이 / 방어도, 방어/에쉴, 에쉴",
        en: "Talismans, Staves / Armour, Armour/Energy Shield, Energy Shield",
      },
    },
  };

  // 모든 무기 타입 목록
  const allWeaponTypes = [
    "spears",
    "talismans",
    "quarterstaves",
    "sceptres",
    "wands",
    "staves",
    "bows",
    "quivers",
    "crossbows",
    "one_hand_maces",
    "two_hand_maces",
    "foci",
  ];

  // 모든 방어구 타입 목록
  const allArmourTypes = [
    "AR",
    "AR/ES",
    "AR/EV",
    "AR/EV/ES",
    "ES",
    "EV",
    "EV/ES",
  ];

  // 직업 선택 상태
  const [levelingClassSelection, setLevelingClassSelection] = useState({
    enabled: true, // 직업 선택 활성화 여부
    class: "all", // "all", "warrior", "mercenary", "ranger", "huntress", "witch", "sorceress", "monk", "druid"
    weaponTypes: [], // 다중 선택: 빈 배열이면 "전체", 아니면 선택된 무기들
    armourTypes: [], // 다중 선택: 빈 배열이면 "전체", 아니면 선택된 방어구들
    areaLevelOperator: "<=", // 지역 레벨 연산자
    areaLevel: 65, // 지역 레벨 값
    rarity: {
      normal: false,
      magic: true,
      rare: true,
    },
  });

  // 드롭다운 열림 상태
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showWeaponDropdown, setShowWeaponDropdown] = useState(false);
  const [showArmourDropdown, setShowArmourDropdown] = useState(false);

  // 드롭다운 버튼 마우스 오버 상태 (추천 무기/방어구 팝업)
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // "weapon" | "armour" | null

  // 스타일 설정 모달 상태
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // 버튼 관련 상태
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showSaveDefaultDropdown, setShowSaveDefaultDropdown] = useState(false);

  // 활성화된 규칙 개수 계산
  const activeRulesCount = goldSettings.rules.filter((r) => r.enabled).length;

  // 활성화된 규칙 텍스트 (언어별)
  const getActiveRulesText = (count) => {
    if (lang === "ko") {
      return `적용된 규칙 ${count}개`;
    } else {
      return `${count} ACTIVE RULES`;
    }
  };

  // RGB to Hex 변환
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Hex to RGB 변환
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    // TODO: 필터 코드 생성 및 다운로드
    const filterCode = generateFilterCode({
      presetId: "starter", // 기본값, 나중에 선택된 프리셋 사용
      isPS5: false,
      excludedOptions: {},
      customGearTiers: {},
      customCurrencyTiers: {},
      selectedLeague: "default",
      quickFilterSettings: {
        gold: goldSettings,
        chance: { enabled: true }, // TODO: 찬스 아이템 설정 추가
        levelingClassSelection: levelingClassSelection,
      },
    });

    const blob = new Blob([filterCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quick-filter-${Date.now()}.filter`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 복사하기 핸들러
  const handleCopy = async () => {
    // TODO: 필터 코드 생성 및 클립보드에 복사
    const filterCode = generateFilterCode({
      presetId: "starter",
      isPS5: false,
      excludedOptions: {},
      customGearTiers: {},
      customCurrencyTiers: {},
      selectedLeague: "default",
      quickFilterSettings: {
        gold: goldSettings,
        chance: { enabled: true }, // TODO: 찬스 아이템 설정 추가
        levelingClassSelection: levelingClassSelection,
      },
    });

    try {
      await navigator.clipboard.writeText(filterCode);
      alert(
        lang === "ko"
          ? "필터 코드가 클립보드에 복사되었습니다!"
          : "Filter code copied to clipboard!"
      );
    } catch (err) {
      console.error("Failed to copy:", err);
      alert(lang === "ko" ? "복사에 실패했습니다." : "Failed to copy.");
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    if (
      confirm(
        lang === "ko"
          ? "모든 설정을 초기화하시겠습니까?"
          : "Reset all settings?"
      )
    ) {
      setGoldSettings(quickFilterDefaults.gold);
      // 로컬스토리지도 초기화
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "quickFilter_gold",
          JSON.stringify(quickFilterDefaults.gold)
        );
      }
    }
  };

  // 기본값으로 저장 핸들러
  const handleSaveAsDefault = (presetId) => {
    if (
      confirm(
        lang === "ko"
          ? `현재 설정을 "${
              presetsData.presets.find((p) => p.id === presetId)?.nameKo ||
              presetId
            }" 프리셋의 기본값으로 저장하시겠습니까?`
          : `Save current settings as default for "${
              presetsData.presets.find((p) => p.id === presetId)?.name ||
              presetId
            }" preset?`
      )
    ) {
      // TODO: 서버에 저장 (현재는 로컬스토리지에만 저장)
      const defaultKey = `quickFilter_default_${presetId}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(defaultKey, JSON.stringify(goldSettings));
        alert(
          lang === "ko" ? "기본값으로 저장되었습니다!" : "Saved as default!"
        );
      }
      setShowSaveDefaultDropdown(false);
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLoadDropdown && !e.target.closest(".action-button-wrapper")) {
        setShowLoadDropdown(false);
      }
      if (
        showSaveDefaultDropdown &&
        !e.target.closest(".action-button-wrapper")
      ) {
        setShowSaveDefaultDropdown(false);
      }
      if (
        showClassDropdown &&
        !e.target.closest(".leveling-dropdown-wrapper")
      ) {
        setShowClassDropdown(false);
      }
      if (
        showWeaponDropdown &&
        !e.target.closest(".leveling-dropdown-wrapper")
      ) {
        setShowWeaponDropdown(false);
      }
      if (
        showArmourDropdown &&
        !e.target.closest(".leveling-dropdown-wrapper")
      ) {
        setShowArmourDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    showLoadDropdown,
    showSaveDefaultDropdown,
    showClassDropdown,
    showWeaponDropdown,
    showArmourDropdown,
  ]);

  // 레벨링 단계 섹션 렌더링 함수
  const renderLeagueStartSection = () => (
    <div className="league-start-wrapper">
      <div
        className="section-header"
        onClick={() => setIsLeagueStartExpanded(!isLeagueStartExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isLeagueStartEnabled}
            onChange={(e) => {
              const newEnabled = e.target.checked;
              setIsLeagueStartEnabled(newEnabled);
              if (!newEnabled) {
                setLevelingClassSelection({
                  ...levelingClassSelection,
                  enabled: false,
                });
              } else {
                setLevelingClassSelection({
                  ...levelingClassSelection,
                  enabled: true,
                });
              }
            }}
          />
        </label>
        <h3
          className="section-title"
          style={{
            opacity: isLeagueStartEnabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "레벨링 단계" : "LEAGUE START"}
        </h3>
        <span className="active-rules-count">
          {getActiveRulesText(0)}
        </span>
        <span className="section-toggle-icon">
          {isLeagueStartExpanded ? "▼" : "▶"}
        </span>
      </div>

      {isLeagueStartExpanded && (
        <div
          className="league-start-content"
          style={{
            opacity: isLeagueStartEnabled ? 1 : 0.5,
            filter: isLeagueStartEnabled ? "none" : "grayscale(100%)",
          }}
        >
          {/* 직업 선택 섹션 */}
          <div className="leveling-class-selection">
            <div
              className="section-header"
              onClick={() =>
                setIsClassSelectionExpanded(!isClassSelectionExpanded)
              }
            >
              <label
                className="section-checkbox"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={
                    levelingClassSelection.enabled && isLeagueStartEnabled
                  }
                  disabled={!isLeagueStartEnabled}
                  onChange={(e) => {
                    const newEnabled = e.target.checked;
                    setLevelingClassSelection({
                      ...levelingClassSelection,
                      enabled: newEnabled,
                    });
                    if (newEnabled) {
                      setIsLeagueStartEnabled(true);
                    }
                  }}
                />
              </label>
              <h3
                className="section-title"
                style={{
                  opacity:
                    levelingClassSelection.enabled && isLeagueStartEnabled
                      ? 1
                      : 0.5,
                }}
              >
                {lang === "ko" ? "직업 선택" : "Class Selection"}
              </h3>
              <span className="active-rules-count">
                {getActiveRulesText(0)}
              </span>
              <span className="section-toggle-icon">
                {isClassSelectionExpanded ? "▼" : "▶"}
              </span>
            </div>

            {(!levelingClassSelection.enabled || !isLeagueStartEnabled) && (
              <div className="leveling-disabled-message">
                {lang === "ko"
                  ? "직업 선택이 비활성화되었습니다."
                  : "Class selection is disabled."}
              </div>
            )}

            {levelingClassSelection.enabled &&
              isLeagueStartEnabled &&
              isClassSelectionExpanded && (
                <div className="section-content">
                  {/* 드롭다운 버튼들 - 한 줄로 배치 */}
                  <div className="leveling-dropdowns-row">
                    {/* 직업 드롭다운 */}
                    <div className="leveling-dropdown-row-item">
                      <div
                        className="leveling-dropdown-wrapper leveling-class-dropdown-wrapper"
                        style={{ position: "relative" }}
                      >
                      <button
                        className={`leveling-dropdown-button ${
                          levelingClassSelection.class === "all"
                            ? "selected"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWeaponDropdown(false);
                          setShowArmourDropdown(false);
                          setShowClassDropdown(!showClassDropdown);
                        }}
                      >
                        <span>
                          {levelingClassSelection.class === "all"
                            ? lang === "ko"
                              ? "직업 선택"
                              : "Select Class"
                            : lang === "ko"
                            ? {
                                warrior: "워리어",
                                mercenary: "머셔너리",
                                ranger: "레인저",
                                huntress: "헌트리스",
                                witch: "위치",
                                sorceress: "소서리스",
                                monk: "몽크",
                                druid: "드루이드",
                              }[levelingClassSelection.class]
                            : levelingClassSelection.class
                                .charAt(0)
                                .toUpperCase() +
                              levelingClassSelection.class.slice(1)}
                        </span>
                        <span className="dropdown-icon">
                          {showClassDropdown ? "▲" : "▼"}
                        </span>
                      </button>
                      {showClassDropdown && (
                        <div className="leveling-dropdown-menu">
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "all"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "all",
                                weaponTypes: [],
                                armourTypes: [],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "전체" : "All Classes"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "warrior"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.warrior;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "warrior",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "워리어" : "Warrior"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "mercenary"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.mercenary;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "mercenary",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "머셔너리" : "Mercenary"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "ranger"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.ranger;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "ranger",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "레인저" : "Ranger"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "huntress"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.huntress;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "huntress",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "헌트리스" : "Huntress"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "witch"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.witch;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "witch",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "위치" : "Witch"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "sorceress"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.sorceress;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "sorceress",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "소서리스" : "Sorceress"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "monk"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations = classRecommendations.monk;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "monk",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "몽크" : "Monk"}
                          </button>
                          <button
                            className={`leveling-dropdown-item ${
                              levelingClassSelection.class === "druid"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              const recommendations =
                                classRecommendations.druid;
                              setLevelingClassSelection({
                                ...levelingClassSelection,
                                class: "druid",
                                weaponTypes: [...recommendations.weapons],
                                armourTypes: [...recommendations.armours],
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            {lang === "ko" ? "드루이드" : "Druid"}
                          </button>
                        </div>
                      )}
                    </div>
                    </div>

                    {/* 무기 종류 드롭다운 */}
                    <div className="leveling-dropdown-row-item">
                      <div
                        className="leveling-dropdown-wrapper"
                        style={{ position: "relative" }}
                      >
                        <button
                          className={`leveling-dropdown-button ${
                            levelingClassSelection.weaponTypes.length === 0
                              ? "selected"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowClassDropdown(false);
                            setShowArmourDropdown(false);
                            setShowWeaponDropdown(!showWeaponDropdown);
                          }}
                          onMouseEnter={() => {
                            if (levelingClassSelection.weaponTypes.length > 0) {
                              setHoveredDropdown("weapon");
                            }
                          }}
                          onMouseLeave={() => setHoveredDropdown(null)}
                        >
                          <span>
                            {levelingClassSelection.weaponTypes.length === 0
                              ? lang === "ko"
                                ? "무기 종류"
                                : "Weapon Type"
                              : levelingClassSelection.weaponTypes.length === 1
                              ? lang === "ko"
                                ? {
                                    spears: "창",
                                    talismans: "부적",
                                    quarterstaves: "육척봉",
                                    sceptres: "셉터",
                                    wands: "마법봉",
                                    staves: "지팡이",
                                    bows: "활",
                                    quivers: "화살통",
                                    crossbows: "쇠뇌",
                                    one_hand_maces: "한손 철퇴",
                                    two_hand_maces: "양손 철퇴",
                                    foci: "집중구",
                                  }[levelingClassSelection.weaponTypes[0]] ||
                                  levelingClassSelection.weaponTypes[0]
                                : levelingClassSelection.weaponTypes[0]
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())
                              : `${levelingClassSelection.weaponTypes.length} ${
                                  lang === "ko" ? "개 선택" : "selected"
                                }`}
                          </span>
                          <span className="dropdown-icon">
                            {showWeaponDropdown ? "▲" : "▼"}
                          </span>
                        </button>
                        {hoveredDropdown === "weapon" &&
                          levelingClassSelection.weaponTypes.length > 0 && (
                            <div className="selected-items-popup">
                              {levelingClassSelection.weaponTypes.map(
                                (weaponId) => {
                                  const weaponNames = {
                                    spears: { ko: "창", en: "Spears" },
                                    talismans: { ko: "부적", en: "Talismans" },
                                    quarterstaves: {
                                      ko: "육척봉",
                                      en: "Quarterstaves",
                                    },
                                    sceptres: { ko: "셉터", en: "Sceptres" },
                                    wands: { ko: "마법봉", en: "Wands" },
                                    staves: { ko: "지팡이", en: "Staves" },
                                    bows: { ko: "활", en: "Bows" },
                                    quivers: { ko: "화살통", en: "Quivers" },
                                    crossbows: { ko: "쇠뇌", en: "Crossbows" },
                                    one_hand_maces: {
                                      ko: "한손 철퇴",
                                      en: "One Hand Maces",
                                    },
                                    two_hand_maces: {
                                      ko: "양손 철퇴",
                                      en: "Two Hand Maces",
                                    },
                                    foci: { ko: "집중구", en: "Foci" },
                                  };
                                  return (
                                    <div
                                      key={weaponId}
                                      className="selected-item-text"
                                    >
                                      {lang === "ko"
                                        ? weaponNames[weaponId]?.ko || weaponId
                                        : weaponNames[weaponId]?.en || weaponId}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        {showWeaponDropdown && (
                          <div className="leveling-dropdown-menu">
                            <div
                              className={`leveling-dropdown-item-multi ${
                                levelingClassSelection.weaponTypes.length === 0
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLevelingClassSelection({
                                  ...levelingClassSelection,
                                  weaponTypes: [],
                                });
                              }}
                            >
                              <span>{lang === "ko" ? "전체" : "All"}</span>
                            </div>
                            {[
                              { id: "spears", ko: "창", en: "Spears" },
                              { id: "talismans", ko: "부적", en: "Talismans" },
                              {
                                id: "quarterstaves",
                                ko: "육척봉",
                                en: "Quarterstaves",
                              },
                              { id: "sceptres", ko: "셉터", en: "Sceptres" },
                              { id: "wands", ko: "마법봉", en: "Wands" },
                              { id: "staves", ko: "지팡이", en: "Staves" },
                              { id: "bows", ko: "활", en: "Bows" },
                              { id: "quivers", ko: "화살통", en: "Quivers" },
                              { id: "crossbows", ko: "쇠뇌", en: "Crossbows" },
                              {
                                id: "one_hand_maces",
                                ko: "한손 철퇴",
                                en: "One Hand Maces",
                              },
                              {
                                id: "two_hand_maces",
                                ko: "양손 철퇴",
                                en: "Two Hand Maces",
                              },
                              { id: "foci", ko: "집중구", en: "Foci" },
                            ].map((weapon) => {
                              const isSelected =
                                levelingClassSelection.weaponTypes.includes(
                                  weapon.id
                                );
                              return (
                                <div
                                  key={weapon.id}
                                  className={`leveling-dropdown-item-multi ${
                                    isSelected ? "selected" : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentTypes = [
                                      ...levelingClassSelection.weaponTypes,
                                    ];
                                    if (isSelected) {
                                      const index = currentTypes.indexOf(
                                        weapon.id
                                      );
                                      currentTypes.splice(index, 1);
                                    } else {
                                      currentTypes.push(weapon.id);
                                    }
                                    setLevelingClassSelection({
                                      ...levelingClassSelection,
                                      weaponTypes: currentTypes,
                                    });
                                  }}
                                >
                                  <span>
                                    {lang === "ko" ? weapon.ko : weapon.en}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 방어구 타입 드롭다운 */}
                    <div className="leveling-dropdown-row-item">
                      <div
                        className="leveling-dropdown-wrapper"
                        style={{ position: "relative" }}
                      >
                        <button
                          className={`leveling-dropdown-button ${
                            levelingClassSelection.armourTypes.length === 0
                              ? "selected"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowClassDropdown(false);
                            setShowWeaponDropdown(false);
                            setShowArmourDropdown(!showArmourDropdown);
                          }}
                          onMouseEnter={() => {
                            if (levelingClassSelection.armourTypes.length > 0) {
                              setHoveredDropdown("armour");
                            }
                          }}
                          onMouseLeave={() => setHoveredDropdown(null)}
                        >
                          <span>
                            {levelingClassSelection.armourTypes.length === 0
                              ? lang === "ko"
                                ? "방어구 종류"
                                : "Armour Type"
                              : levelingClassSelection.armourTypes.length === 1
                              ? lang === "ko"
                                ? {
                                    AR: "방어도",
                                    "AR/ES": "방어/에쉴",
                                    "AR/EV": "방어/회피",
                                    "AR/EV/ES": "방어/회피/에쉴",
                                    ES: "에쉴",
                                    EV: "회피",
                                    "EV/ES": "회피/에쉴",
                                  }[levelingClassSelection.armourTypes[0]] ||
                                  levelingClassSelection.armourTypes[0]
                                : levelingClassSelection.armourTypes[0]
                              : `${levelingClassSelection.armourTypes.length} ${
                                  lang === "ko" ? "개 선택" : "selected"
                                }`}
                          </span>
                          <span className="dropdown-icon">
                            {showArmourDropdown ? "▲" : "▼"}
                          </span>
                        </button>
                        {hoveredDropdown === "armour" &&
                          levelingClassSelection.armourTypes.length > 0 && (
                            <div className="selected-items-popup">
                              {levelingClassSelection.armourTypes.map(
                                (armourId) => {
                                  const armourNames = {
                                    AR: { ko: "방어도", en: "AR" },
                                    "AR/ES": { ko: "방어/에쉴", en: "AR/ES" },
                                    "AR/EV": { ko: "방어/회피", en: "AR/EV" },
                                    "AR/EV/ES": {
                                      ko: "방어/회피/에쉴",
                                      en: "AR/EV/ES",
                                    },
                                    ES: { ko: "에쉴", en: "ES" },
                                    EV: { ko: "회피", en: "EV" },
                                    "EV/ES": { ko: "회피/에쉴", en: "EV/ES" },
                                  };
                                  return (
                                    <div
                                      key={armourId}
                                      className="selected-item-text"
                                    >
                                      {lang === "ko"
                                        ? armourNames[armourId]?.ko || armourId
                                        : armourNames[armourId]?.en || armourId}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        {showArmourDropdown && (
                          <div className="leveling-dropdown-menu">
                            <div
                              className={`leveling-dropdown-item-multi ${
                                levelingClassSelection.armourTypes.length === 0
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLevelingClassSelection({
                                  ...levelingClassSelection,
                                  armourTypes: [],
                                });
                              }}
                            >
                              <span>{lang === "ko" ? "전체" : "All"}</span>
                            </div>
                            {[
                              { id: "AR", ko: "방어도", en: "AR" },
                              { id: "AR/ES", ko: "방어/에쉴", en: "AR/ES" },
                              { id: "AR/EV", ko: "방어/회피", en: "AR/EV" },
                              {
                                id: "AR/EV/ES",
                                ko: "방어/회피/에쉴",
                                en: "AR/EV/ES",
                              },
                              { id: "ES", ko: "에쉴", en: "ES" },
                              { id: "EV", ko: "회피", en: "EV" },
                              { id: "EV/ES", ko: "회피/에쉴", en: "EV/ES" },
                            ].map((armour) => {
                              const isSelected =
                                levelingClassSelection.armourTypes.includes(
                                  armour.id
                                );
                              return (
                                <div
                                  key={armour.id}
                                  className={`leveling-dropdown-item-multi ${
                                    isSelected ? "selected" : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentTypes = [
                                      ...levelingClassSelection.armourTypes,
                                    ];
                                    if (isSelected) {
                                      const index = currentTypes.indexOf(
                                        armour.id
                                      );
                                      currentTypes.splice(index, 1);
                                    } else {
                                      currentTypes.push(armour.id);
                                    }
                                    setLevelingClassSelection({
                                      ...levelingClassSelection,
                                      armourTypes: currentTypes,
                                    });
                                  }}
                                >
                                  <span>
                                    {lang === "ko" ? armour.ko : armour.en}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 초기화 버튼 */}
                    <button
                      className="leveling-reset-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLevelingClassSelection({
                          ...levelingClassSelection,
                          class: "all",
                          weaponTypes: [],
                          armourTypes: [],
                        });
                      }}
                    >
                      {lang === "ko" ? "초기화" : "Reset"}
                    </button>
                  </div>

                  {/* 아이템 희귀도 */}
                  <div className="leveling-rarity-section">
                    <span className="leveling-rarity-title">
                      {lang === "ko" ? "아이템 희귀도" : "Item Rarity"}
                    </span>
                    <label className="leveling-rarity-item">
                      <input
                        type="checkbox"
                        checked={levelingClassSelection.rarity.rare}
                        onChange={(e) => {
                          setLevelingClassSelection({
                            ...levelingClassSelection,
                            rarity: {
                              ...levelingClassSelection.rarity,
                              rare: e.target.checked,
                            },
                          });
                        }}
                      />
                      <span>{lang === "ko" ? "희귀" : "Rare"}</span>
                    </label>
                    <label className="leveling-rarity-item">
                      <input
                        type="checkbox"
                        checked={levelingClassSelection.rarity.magic}
                        onChange={(e) => {
                          setLevelingClassSelection({
                            ...levelingClassSelection,
                            rarity: {
                              ...levelingClassSelection.rarity,
                              magic: e.target.checked,
                            },
                          });
                        }}
                      />
                      <span>{lang === "ko" ? "마법" : "Magic"}</span>
                    </label>
                    <label className="leveling-rarity-item">
                      <input
                        type="checkbox"
                        checked={levelingClassSelection.rarity.normal}
                        onChange={(e) => {
                          setLevelingClassSelection({
                            ...levelingClassSelection,
                            rarity: {
                              ...levelingClassSelection.rarity,
                              normal: e.target.checked,
                            },
                          });
                        }}
                      />
                      <span>{lang === "ko" ? "일반" : "Normal"}</span>
                    </label>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );

  // 골드 섹션 렌더링 함수
  const renderGoldSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className="section-header"
        onClick={() => setIsGoldExpanded(!isGoldExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={goldSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setGoldSettings({
                ...goldSettings,
                enabled: newEnabled,
                rules: goldSettings.rules.map((rule) => ({
                  ...rule,
                  enabled: newEnabled ? true : false,
                })),
              });
            }}
          />
        </label>
        <h3
          className="section-title"
          style={{
            opacity: goldSettings.enabled ? 1 : 0.5,
          }}
        >
          골드
        </h3>
        <span className="active-rules-count">
          {getActiveRulesText(activeRulesCount)}
        </span>
        <span className="section-toggle-icon">
          {isGoldExpanded ? "▼" : "▶"}
        </span>
      </div>
      {isGoldExpanded && (
        <div className="section-content">
          {/* 골드 규칙들 */}
          {goldSettings.rules.map((rule) => (
            <div
              key={rule.id}
              className="filter-rule-item"
              style={{
                opacity: goldSettings.enabled ? 1 : 0.5,
                filter: goldSettings.enabled ? "none" : "grayscale(100%)",
              }}
            >
              <label className="rule-checkbox">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => toggleGoldRule(rule.id)}
                />
              </label>
              <span className="rule-title">{rule.nameKo || rule.name}</span>
              <button
                className="rule-edit-button"
                onClick={() => {
                  setEditingRuleId(rule.id);
                  setStyleModalOpen(true);
                }}
                style={{
                  opacity: goldSettings.enabled ? 1 : 0.5,
                  cursor: goldSettings.enabled ? "pointer" : "not-allowed",
                }}
              >
                수정
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="container">
      <div className="card">
        <div className="cardBody">
          {/* 2열 레이아웃 */}
          <div className="quick-filters-layout">
            {/* 왼쪽 열 */}
            <div className="quick-filters-column">
              {leftColumnSections.map((section) => {
                if (section.id === "league-start") {
                  return (
                    <div key={section.id}>{renderLeagueStartSection()}</div>
                  );
                } else if (section.id === "gold") {
                  return <div key={section.id}>{renderGoldSection()}</div>;
                }
                return null;
              })}
            </div>

            {/* 오른쪽 열: MY EQUIPMENT */}
            <div className="quick-filters-column">
              <div className="column-header">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  <h2 className="column-title">
                    {lang === "ko" ? "내 장비" : "MY EQUIPMENT"}
                  </h2>
                </div>
              </div>

              {/* 여기에 장비 관련 섹션들이 추가될 예정 */}
              <div className="quick-filter-section">
                <div className="section-header">
                  <label
                    className="section-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" defaultChecked />
                  </label>
                  <h3 className="section-title">MY WEAPONS</h3>
                  <span className="active-rules-count">
                    {getActiveRulesText(0)}
                  </span>
                  <span className="section-toggle-icon">▼</span>
                </div>
                <div className="section-content">
                  <button className="add-item-button">Add Weapon Type</button>
                </div>
              </div>

              <div className="quick-filter-section">
                <div className="section-header">
                  <label
                    className="section-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" defaultChecked />
                  </label>
                  <h3 className="section-title">MY ARMOUR</h3>
                  <span className="active-rules-count">
                    {getActiveRulesText(0)}
                  </span>
                  <span className="section-toggle-icon">▼</span>
                </div>
                <div className="section-content">
                  <button className="add-item-button">Add Armour Type</button>
                </div>
              </div>

              <div className="quick-filter-section">
                <div className="section-header">
                  <label
                    className="section-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" defaultChecked />
                  </label>
                  <h3 className="section-title">MY JEWELLERY</h3>
                  <span className="active-rules-count">
                    {getActiveRulesText(0)}
                  </span>
                  <span className="section-toggle-icon">▼</span>
                </div>
                <div className="section-content">
                  <button className="add-item-button">
                    Add Jewellery Type
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼들 */}
      <div className="quick-filters-actions">
        <div className="action-buttons-left">
          {/* 불러오기 */}
          <div className="action-button-wrapper">
            <button
              className="action-button action-button-secondary"
              onClick={() => setShowLoadDropdown(!showLoadDropdown)}
            >
              {lang === "ko" ? "불러오기" : "Load"}
              <span className="dropdown-icon">▼</span>
            </button>
            {showLoadDropdown && (
              <div className="action-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    // TODO: 로컬스토리지에서 불러오기
                    const saved = localStorage.getItem("quickFilter_gold");
                    if (saved) {
                      setGoldSettings(JSON.parse(saved));
                      alert(
                        lang === "ko"
                          ? "설정을 불러왔습니다!"
                          : "Settings loaded!"
                      );
                    } else {
                      alert(
                        lang === "ko"
                          ? "저장된 설정이 없습니다."
                          : "No saved settings found."
                      );
                    }
                    setShowLoadDropdown(false);
                  }}
                >
                  {lang === "ko"
                    ? "로컬 저장소에서 불러오기"
                    : "Load from Local Storage"}
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    // TODO: 파일에서 불러오기
                    alert(
                      lang === "ko"
                        ? "파일 불러오기 기능은 준비 중입니다."
                        : "File load feature coming soon."
                    );
                    setShowLoadDropdown(false);
                  }}
                >
                  {lang === "ko" ? "파일에서 불러오기" : "Load from File"}
                </button>
              </div>
            )}
          </div>

          {/* 다운로드 */}
          <button
            className="action-button action-button-primary"
            onClick={handleDownload}
          >
            {lang === "ko" ? "다운로드" : "Download"}
          </button>

          {/* 계정 연동 */}
          <button
            className="action-button action-button-primary"
            onClick={() => {
              alert(
                lang === "ko"
                  ? "계정 연동 기능은 준비 중입니다."
                  : "Account link feature coming soon."
              );
            }}
          >
            {lang === "ko" ? "계정 연동" : "Account Link"}
          </button>

          {/* 복사하기 */}
          <button
            className="action-button action-button-secondary"
            onClick={handleCopy}
          >
            {lang === "ko" ? "복사하기" : "Copy"}
          </button>

          {/* 초기화 */}
          <button
            className="action-button action-button-secondary"
            onClick={handleReset}
          >
            {lang === "ko" ? "초기화" : "Reset"}
          </button>
        </div>

        <div className="action-buttons-right">
          {/* 기본값으로 저장 */}
          <div className="action-button-wrapper">
            <button
              className="action-button action-button-admin"
              onClick={() => {
                setShowLoadDropdown(false);
                setShowSaveDefaultDropdown(!showSaveDefaultDropdown);
              }}
            >
              {lang === "ko" ? "기본값으로 저장" : "Save as Default"}
              <span className="dropdown-icon">▼</span>
            </button>
            {showSaveDefaultDropdown && (
              <div className="action-dropdown">
                {presetsData.presets.map((preset) => (
                  <button
                    key={preset.id}
                    className="dropdown-item"
                    onClick={() => handleSaveAsDefault(preset.id)}
                  >
                    {preset.nameKo || preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 스타일 설정 모달 */}
      {styleModalOpen &&
        editingRuleId &&
        (() => {
          const editingRule = goldSettings.rules.find(
            (r) => r.id === editingRuleId
          );
          if (!editingRule) return null;

          // styles를 JSON.stringify로 직렬화하여 변경 감지
          const stylesKey = JSON.stringify(editingRule.styles || {});

          return (
            <StyleSettingsModal
              key={`${editingRuleId}-${stylesKey}`} // editingRuleId와 styles를 함께 key로 사용
              isOpen={styleModalOpen}
              onClose={() => {
                setStyleModalOpen(false);
                setEditingRuleId(null);
              }}
              styles={editingRule.styles || {}}
              onChange={(newStyles) => {
                // 스타일 전체를 한 번에 업데이트
                const updatedSettings = {
                  ...goldSettings,
                  rules: goldSettings.rules.map((rule) =>
                    rule.id === editingRuleId
                      ? { ...rule, styles: newStyles }
                      : rule
                  ),
                };
                setGoldSettings(updatedSettings);
              }}
              itemName="Gold"
              baseType="Gold"
              title={editingRule.nameKo || editingRule.name}
              onTitleChange={(newTitle) => {
                const updatedSettings = {
                  ...goldSettings,
                  rules: goldSettings.rules.map((rule) =>
                    rule.id === editingRuleId
                      ? { ...rule, nameKo: newTitle, name: newTitle }
                      : rule
                  ),
                };
                setGoldSettings(updatedSettings);
              }}
              conditions={editingRule.conditions || {}}
              onConditionsChange={(newConditions) => {
                // 조건 전체를 한 번에 업데이트
                const updatedSettings = {
                  ...goldSettings,
                  rules: goldSettings.rules.map((rule) =>
                    rule.id === editingRuleId
                      ? { ...rule, conditions: newConditions }
                      : rule
                  ),
                };
                setGoldSettings(updatedSettings);
              }}
              additionalRules={[]}
              onRulesChange={() => {}}
            />
          );
        })()}

      <style jsx>{`
        .quick-filters-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .quick-filters-layout {
            grid-template-columns: 1fr;
          }
        }

        .quick-filters-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3px;
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .column-header .column-title {
          flex: 1;
          margin: 0;
        }

        .column-header .active-rules-count {
          margin-left: auto;
        }

        .column-header:hover {
          border-color: var(--poe2-primary, var(--game-primary)) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .section-toggle-icon {
          font-size: 12px;
          color: var(--muted);
          margin-left: auto;
        }

        .league-start-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 0;
        }

        .league-start-content {
          margin-bottom: 0;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: none;
        }

        /* 직업 선택 섹션 */
        .leveling-class-selection {
          display: flex;
          flex-direction: column;
          gap: 0;
        }


        .leveling-disabled-message {
          padding: 16px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          background: var(--panel2);
          border: 1px solid var(--border);
        }

        .leveling-dropdowns {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }


        .leveling-class-dropdown-wrapper {
          min-width: 120px !important;
          max-width: 160px !important;
          margin: 4px !important;
        }

        .leveling-dropdowns-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 0 !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 4px !important;
          flex-wrap: nowrap !important;
        }

        .leveling-dropdown-row-item {
          display: flex !important;
          align-items: center !important;
          gap: 0 !important;
          margin: 0 !important;
        }

        .leveling-dropdown-row-item .leveling-dropdown-label {
          margin-bottom: 0 !important;
          white-space: nowrap !important;
          text-align: left !important;
        }

        .leveling-dropdown-row-item .leveling-dropdown-wrapper {
          min-width: 120px !important;
          max-width: 160px !important;
          margin: 4px !important;
        }

        @media (max-width: 1200px) {
          .leveling-dropdowns-row {
            flex-direction: row !important;
            flex-wrap: wrap !important;
          }
        }

        /* section-content 내부의 leveling-dropdowns-row 강제 가로 배치 */
        .section-content .leveling-dropdowns-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 0 !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 4px !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
        }

        .leveling-dropdowns-row .leveling-reset-button {
          margin-left: 8px !important;
        }

        .leveling-dropdown-wrapper {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          min-width: 120px !important;
          max-width: 160px !important;
          z-index: 1 !important;
          margin: 4px !important;
        }

        .leveling-dropdown-label {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: var(--muted) !important;
          margin-bottom: 6px !important;
          display: block !important;
          text-align: center !important;
        }

        .leveling-dropdown-button {
          width: 100% !important;
          padding: 6px 10px !important;
          background: var(--panel2) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          box-sizing: border-box !important;
          text-align: center !important;
        }

        .leveling-dropdown-button > span:first-child {
          flex: 1;
          text-align: center;
        }

        .leveling-dropdown-button .dropdown-icon {
          display: block !important;
          font-size: 12px !important;
          color: var(--muted) !important;
          margin-left: 8px !important;
        }

        .leveling-dropdown-button:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--border) !important;
        }

        .leveling-dropdown-button.selected {
          background: var(--panel2) !important;
          border-color: var(--border) !important;
          color: var(--text) !important;
        }

        .leveling-dropdown-button.selected:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--border) !important;
          color: var(--text) !important;
        }

        .leveling-dropdown-menu {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          right: 0 !important;
          margin-top: 4px !important;
          background: var(--panel2) !important;
          border: 1px solid var(--border) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
          max-height: 300px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          z-index: 1000 !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }

        .leveling-dropdown-item {
          padding: 8px 12px !important;
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          color: var(--text) !important;
          text-align: left !important;
          cursor: pointer !important;
          transition: background 0.2s !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .leveling-dropdown-item:last-child {
          border-bottom: none !important;
        }

        .leveling-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .leveling-dropdown-item.selected,
        div.leveling-dropdown-item.selected,
        button.leveling-dropdown-item.selected {
          background: #3E63DD !important;
          background-color: #3E63DD !important;
          color: #ffffff !important;
          color: rgb(255, 255, 255) !important;
        }

        /* 아이템 희귀도 */
        .leveling-rarity-section {
          display: flex !important;
          flex-direction: row !important;
          gap: 16px !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: wrap !important;
          width: 100% !important;
          margin: 0 auto !important;
        }

        .leveling-rarity-title {
          font-size: 14px;
          font-weight: 400;
          color: var(--text);
        }

        .leveling-reset-button {
          padding: 8px 16px !important;
          background: transparent !important;
          border: 1px solid #3E63DD !important;
          color: #ffffff !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          border-radius: 4px !important;
          margin-left: 8px !important;
        }

        .leveling-reset-button:hover {
          background: rgba(62, 99, 221, 0.1) !important;
          border-color: #3E63DD !important;
          color: #ffffff !important;
        }

        .leveling-rarity-item {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
        }

        .leveling-rarity-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .leveling-rarity-item span {
          font-size: 14px;
          font-weight: 400;
          color: var(--text);
        }

        .leveling-area-level-selector {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .area-level-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 600;
        }

        .area-level-operator {
          padding: 4px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
          font-family: monospace;
        }

        .area-level-operator:focus {
          border-color: var(--game-primary);
        }

        .area-level-input {
          width: 50px;
          padding: 4px 6px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          text-align: center;
        }

        .area-level-input:focus {
          outline: none;
          border-color: var(--game-primary);
        }

        /* 다중 선택 드롭다운 아이템 */
        .leveling-dropdown-item-multi {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 8px !important;
          padding: 8px 12px !important;
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          width: 100% !important;
          text-align: left !important;
          box-sizing: border-box !important;
        }

        .leveling-dropdown-item-multi:last-child {
          border-bottom: none !important;
        }

        .leveling-dropdown-item-multi:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .leveling-dropdown-item-multi.selected,
        div.leveling-dropdown-item-multi.selected {
          background: #3E63DD !important;
          background-color: #3E63DD !important;
          color: #ffffff !important;
          color: rgb(255, 255, 255) !important;
          font-weight: 400 !important;
        }

        .leveling-dropdown-item-multi span {
          flex: 1 !important;
          text-align: left !important;
        }

        /* 선택된 항목 팝업 */
        .selected-items-popup {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          right: 0 !important;
          margin-top: 4px !important;
          padding: 6px 10px !important;
          background: #3E63DD !important;
          border: 1px solid var(--border) !important;
          border-radius: 0 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          z-index: 1001 !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          pointer-events: none !important;
        }

        .selected-items-popup .selected-item-text {
          font-size: 12px !important;
          color: #ffffff !important;
          line-height: 1.5 !important;
          text-align: left !important;
          padding: 3px 0 !important;
        }

        .column-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .quick-filter-section {
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0;
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          width: 100%;
          box-sizing: border-box;
        }

        .section-header .section-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .section-header .active-rules-count {
          margin-left: auto;
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .section-header:hover {
          border-color: var(--poe2-primary, var(--game-primary)) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .section-toggle-icon {
          font-size: 12px;
          color: var(--muted);
          margin-left: 8px;
          flex-shrink: 0;
          white-space: nowrap;
        }


        .section-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .section-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
          margin: 0;
          padding: 0;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .active-rules-count {
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0;
          font-weight: 400;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0;
          margin: 0;
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: none;
        }

        .section-content .leveling-rarity-section {
          display: flex !important;
          flex-direction: row !important;
          gap: 16px !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: wrap !important;
          width: 100% !important;
          margin: 0 auto !important;
        }

        .filter-rule-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 16px 2px 32px;
          min-height: auto;
          border-bottom: none;
          position: relative;
        }

        .filter-rule-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 32px;
          right: 0;
          height: 1px;
          background: #000000;
        }

        .filter-rule-item:last-child::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 32px;
          right: 0;
          height: 1px;
          background: #000000;
        }

        .rule-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
          flex-shrink: 0;
          width: 20px;
        }

        .rule-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
          margin: 0;
          padding: 0;
        }

        .rule-title {
          flex: 1;
          font-size: 14px;
          color: var(--text);
          min-width: 0;
          font-weight: 400;
          line-height: 1.5;
        }

        .rule-edit-button {
          padding: 6px 16px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          border-radius: 0;
        }

        .rule-edit-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--text);
        }

        .option-title-input {
          flex: 1;
          padding: 4px 8px;
          background: var(--panel2);
          border: 1px solid var(--game-primary);
          color: var(--text);
          font-size: 14px;
          outline: none;
        }

        .edit-button {
          padding: 2px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .edit-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--text);
        }

        .option-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 28px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .control-label {
          font-size: 14px;
          color: var(--muted);
          min-width: 80px;
        }

        .style-control-item-box {
          display: flex;
          align-items: center;
          min-height: 32px;
        }

        .style-control-content {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }

        .font-size-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* 슬라이더 스타일은 전역 CSS에서 관리 */

        .font-size-input {
          width: 50px;
          padding: 4px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          text-align: center;
        }

        .style-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .style-control-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .style-control-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .style-control-divider {
          color: var(--muted);
          font-size: 14px;
          padding: 0 4px;
        }

        .style-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-select-small {
          padding: 6px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          min-width: 60px;
        }

        .control-input-small {
          padding: 6px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          width: 80px;
        }

        .control-input-tiny {
          padding: 6px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          width: 60px;
        }

        .control-select-small:focus,
        .control-input-small:focus,
        .control-input-tiny:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .style-preview {
          margin-bottom: 16px;
          padding: 16px;
          background: #0a0a0a;
          border: 1px solid var(--border);
        }

        .style-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .style-control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          cursor: pointer;
          background: none;
          padding: 0;
        }

        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 50%;
        }

        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .add-item-button {
          padding: 12px 20px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
        }

        .add-item-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--game-primary);
        }

        /* 하단 액션 버튼들 */
        .quick-filters-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin-top: 24px;
          background: var(--panel);
          border: 1px solid var(--border);
          gap: 12px;
        }

        .action-buttons-left,
        .action-buttons-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-button-wrapper {
          position: relative;
        }

        /* action-button 스타일 제거 - 전역 CSS 사용 */

        .action-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 8px;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          min-width: 200px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .dropdown-item {
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: var(--panel2);
        }
      `}</style>
    </main>
  );
}
