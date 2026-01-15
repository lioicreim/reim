"use client";
// Force rebuild for JSON update

import { useState, useEffect, Fragment, useRef } from "react";
import quickFilterDefaults from "@/data/quick-filter-defaults.json";
import ItemPreviewBox from "@/app/components/ItemPreviewBox";
import ColorPicker from "@/app/components/ColorPicker";
import StyleSettingsModal from "@/app/components/StyleSettingsModal";
import ItemFilterActions from "@/app/components/ItemFilterActions";
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
  const [goldSettings, setGoldSettings] = useState({
    enabled: true,
    minStackSize: 100,
    rules: quickFilterDefaults.gold.rules || [], // rules 초기화 복구
  });

  const [levelingSettings, setLevelingSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.leveling?.rules || [],
  });

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

          // 저장된 규칙의 제목을 기본값으로 업데이트하고, 새로운 스타일 속성 등 기본값 병합
          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 깊은 병합
              // conditions 병합 (저장된 값이 있으면 저장된 값 우선 - 삭제된 속성 부활 방지)
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule, // 기본값 먼저 적용 (새로운 필드 추가 등)
                ...savedRule, // 저장된 값으로 덮어쓰기 (null 포함)
                conditions: mergedConditions,
                name: defaultRule.name, // 이름은 항상 최신 기본값 사용
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
  // 빠른 설정 진입 시 기본은 "닫힘"
  const [isGoldExpanded, setIsGoldExpanded] = useState(false);

  // 주얼 설정 로드
  const [jewelsSettings, setJewelsSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.jewels?.rules || [],
  });
  const [isClientJewels, setIsClientJewels] = useState(false);

  // 클라이언트에서만 localStorage에서 주얼 설정 불러오기
  useEffect(() => {
    setIsClientJewels(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_jewels");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = quickFilterDefaults.jewels?.rules || [];
          const savedRules = parsed.rules || [];

          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 병합 (저장된 값이 있으면 저장된 값 우선)
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setJewelsSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved jewels settings", e);
        }
      }
    }
  }, []);

  // 주얼 설정 저장
  useEffect(() => {
    if (isClientJewels && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_jewels",
        JSON.stringify(jewelsSettings)
      );
    }
  }, [jewelsSettings, isClientJewels]);

  // 주얼 규칙 활성화/비활성화
  const toggleJewelsRule = (ruleId) => {
    const updatedRules = jewelsSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setJewelsSettings({
      ...jewelsSettings,
      enabled: hasAnyEnabled || jewelsSettings.enabled,
      rules: updatedRules,
    });
  };

  // 주얼 섹션 접기/펼치기 상태
  const [isJewelsExpanded, setIsJewelsExpanded] = useState(false);

  // 금고실 열쇠 설정 로드
  const [vaultKeysSettings, setVaultKeysSettings] = useState({
    enabled: true,
    minTier: "D",
    tiers: quickFilterDefaults.vaultKeys?.tiers || {},
  });
  const [isClientVaultKeys, setIsClientVaultKeys] = useState(false);

  // 클라이언트에서만 localStorage에서 금고실 열쇠 설정 불러오기
  useEffect(() => {
    setIsClientVaultKeys(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_vaultKeys");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultTiers = quickFilterDefaults.vaultKeys?.tiers || {};

          // 기본값과 병합
          const mergedTiers = {};
          ["S", "A", "B", "C", "D"].forEach((tier) => {
            const defaultTier = defaultTiers[tier] || {
              enabled: true,
              baseTypes: [],
              styles: {},
            };
            const savedTier = parsed.tiers?.[tier] || {};
            mergedTiers[tier] = {
              ...defaultTier,
              ...savedTier,
              styles: {
                ...defaultTier.styles,
                ...(savedTier.styles || {}),
              },
            };
          });

          setVaultKeysSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            minTier: parsed.minTier || "D",
            tiers: mergedTiers,
          });
        } catch (e) {
          console.error("Failed to parse saved vault keys settings", e);
        }
      }
    }
  }, []);

  // 금고실 열쇠 설정 저장
  useEffect(() => {
    if (isClientVaultKeys && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_vaultKeys",
        JSON.stringify(vaultKeysSettings)
      );
    }
  }, [vaultKeysSettings, isClientVaultKeys]);

  // 금고실 열쇠 섹션 접기/펼치기 상태
  const [isVaultKeysExpanded, setIsVaultKeysExpanded] = useState(false);

  // 화폐 설정 로드 (골드와 동일한 구조)
  const [currencySettings, setCurrencySettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.currency?.rules || [],
    selectedTiers: [], // 선택된 티어: ["S", "A", "B", "C", "D", "E"]
    minTier: "E", // 최소 표시 티어 (선택한 티어 이상 표시)
  });
  const [isClientCurrency, setIsClientCurrency] = useState(false);

  // 클라이언트에서만 localStorage에서 화폐 설정 불러오기
  useEffect(() => {
    setIsClientCurrency(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_currency");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = quickFilterDefaults.currency?.rules || [];
          const savedRules = parsed.rules || [];

          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 병합 (저장된 값이 있으면 저장된 값 우선)
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setCurrencySettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
            selectedTiers: parsed.selectedTiers || [],
            minTier: parsed.minTier || "E",
          });
        } catch (e) {
          console.error("Failed to parse saved currency settings", e);
        }
      }
    }
  }, []);

  // 화폐 설정 저장
  useEffect(() => {
    if (isClientCurrency && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_currency",
        JSON.stringify(currencySettings)
      );
    }
  }, [currencySettings, isClientCurrency]);

  // 화폐 규칙 활성화/비활성화
  const toggleCurrencyRule = (ruleId) => {
    const updatedRules = currencySettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    // 하위 규칙 중 하나라도 활성화되면 상위 카테고리도 활성화
    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setCurrencySettings({
      ...currencySettings,
      enabled: hasAnyEnabled || currencySettings.enabled,
      rules: updatedRules,
    });
  };

  // 화폐 규칙 값 업데이트
  const updateCurrencyRule = (ruleId, field, value) => {
    setCurrencySettings({
      ...currencySettings,
      rules: currencySettings.rules.map((rule) => {
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

  // 화폐 섹션 접기/펼치기 상태
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);

  // 유니크 설정 로드 (골드와 동일한 구조)
  const [uniquesSettings, setUniquesSettings] = useState({
    enabled: true,
    rules: (quickFilterDefaults.uniques || { rules: [] }).rules,
    minTier: "D", // 최소 표시 티어 (D = 전체 표시)
  });
  const [isClientUniques, setIsClientUniques] = useState(false);
  // qualityInput State는 상단에서 정의됨 (line 44)

  // 클라이언트에서만 localStorage에서 유니크 설정 불러오기
  useEffect(() => {
    setIsClientUniques(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_uniques");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = (quickFilterDefaults.uniques || { rules: [] })
            .rules;
          const savedRules = parsed.rules || [];

          // 저장된 규칙의 제목을 기본값으로 업데이트하고, 새로운 스타일 속성 등 기본값 병합
          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 병합 (저장된 값이 있으면 저장된 값 우선)
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule, // 기본값 먼저 적용
                ...savedRule, // 저장된 값으로 덮어쓰기
                conditions: mergedConditions,
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

          setUniquesSettings({
            enabled:
              parsed.enabled !== undefined
                ? parsed.enabled
                : (quickFilterDefaults.uniques || { enabled: true }).enabled,
            rules: mergedRules,
            minTier: parsed.minTier || "D",
          });
        } catch (e) {
          console.error("Failed to parse saved uniques settings", e);
        }
      }
    }
  }, []);

  // 유니크 설정 저장
  useEffect(() => {
    if (isClientUniques && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_uniques",
        JSON.stringify(uniquesSettings)
      );
    }
  }, [uniquesSettings, isClientUniques]);

  // 유니크 규칙 활성화/비활성화
  const toggleUniquesRule = (ruleId) => {
    const updatedRules = uniquesSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    // 하위 규칙 중 하나라도 활성화되면 상위 카테고리도 활성화
    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setUniquesSettings({
      ...uniquesSettings,
      enabled: hasAnyEnabled || uniquesSettings.enabled,
      rules: updatedRules,
    });
  };

  // 유니크 섹션 접기/펼치기 상태
  const [isUniquesExpanded, setIsUniquesExpanded] = useState(false);

  // 미가공 젬 설정 로드
  const [uncutGemsSettings, setUncutGemsSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.uncut_gems?.rules || [],
  });
  const [isClientUncutGems, setIsClientUncutGems] = useState(false);

  // 클라이언트에서만 localStorage에서 미가공 젬 설정 불러오기
  useEffect(() => {
    setIsClientUncutGems(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_uncutGems");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = quickFilterDefaults.uncut_gems?.rules || [];
          const savedRules = parsed.rules || [];

          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 병합 (저장된 값이 있으면 저장된 값 우선)
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setUncutGemsSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved uncut gems settings", e);
        }
      }
    }
  }, []);

  // 미가공 젬 설정 저장
  useEffect(() => {
    if (isClientUncutGems && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_uncutGems",
        JSON.stringify(uncutGemsSettings)
      );
    }
  }, [uncutGemsSettings, isClientUncutGems]);

  // 미가공 젬 규칙 활성화/비활성화
  const toggleUncutGemsRule = (ruleId) => {
    const updatedRules = uncutGemsSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setUncutGemsSettings({
      ...uncutGemsSettings,
      enabled: hasAnyEnabled || uncutGemsSettings.enabled,
      rules: updatedRules,
    });
  };

  // 미가공 젬 규칙 값 업데이트
  const updateUncutGemsRule = (ruleId, field, value) => {
    setUncutGemsSettings({
      ...uncutGemsSettings,
      rules: uncutGemsSettings.rules.map((rule) => {
        if (rule.id === ruleId) {
          if (field.includes(".")) {
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
            }
          } else if (
            field === "fontSize" ||
            field === "textColor" ||
            field === "borderColor" ||
            field === "backgroundColor" ||
            field === "playEffect" ||
            field === "minimapIcon" ||
            field === "customSound"
          ) {
            return {
              ...rule,
              styles: {
                ...(rule.styles || {}),
                [field]: value,
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

  // 미가공 젬 섹션 접기/펼치기 상태
  const [isUncutGemsExpanded, setIsUncutGemsExpanded] = useState(false);

  // 호신부 설정 로드
  const [charmsSettings, setCharmsSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.charms?.rules || [],
  });
  const [isClientCharms, setIsClientCharms] = useState(false);
  const [isCharmsExpanded, setIsCharmsExpanded] = useState(false);

  // 클라이언트에서만 localStorage에서 호신부 설정 불러오기
  useEffect(() => {
    setIsClientCharms(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_charms");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedRules = parsed.rules || [];
          const defaultRules = quickFilterDefaults.charms?.rules || [];

          // 저장된 규칙과 기본 규칙 병합
          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              const mergedConditions = savedRule.conditions 
                ? savedRule.conditions 
                : (defaultRule.conditions || {});
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setCharmsSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved charms settings", e);
        }
      }
    }
  }, []);

  // 호신부 설정 저장
  useEffect(() => {
    if (isClientCharms && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_charms",
        JSON.stringify(charmsSettings)
      );
    }
  }, [charmsSettings, isClientCharms]);

  // 호신부 규칙 활성화/비활성화
  const toggleCharmsRule = (ruleId) => {
    const updatedRules = charmsSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setCharmsSettings({
      ...charmsSettings,
      enabled: hasAnyEnabled || charmsSettings.enabled,
      rules: updatedRules,
    });
  };

  // 기타 설정 로드
  const [othersSettings, setOthersSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.others?.rules || [],
  });
  const [isClientOthers, setIsClientOthers] = useState(false);

  // 클라이언트에서만 localStorage에서 기타 설정 불러오기
  useEffect(() => {
    setIsClientOthers(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_others");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = quickFilterDefaults.others?.rules || [];
          const savedRules = parsed.rules || [];

          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 깊은 병합: 새로 추가된 조건(corrupted, baseTypes 등)이 유지되도록
              const mergedConditions = {
                ...defaultRule.conditions,
                ...savedRule.conditions,
              };
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setOthersSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved others settings", e);
        }
      }
    }
  }, []);

  // 기타 설정 저장
  useEffect(() => {
    if (isClientOthers && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_others",
        JSON.stringify(othersSettings)
      );
    }
  }, [othersSettings, isClientOthers]);

  // 기타 규칙 활성화/비활성화
  const toggleOthersRule = (ruleId) => {
    const updatedRules = othersSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setOthersSettings({
      ...othersSettings,
      enabled: hasAnyEnabled || othersSettings.enabled,
      rules: updatedRules,
    });
  };

  // 기타 규칙 값 업데이트
  const updateOthersRule = (ruleId, field, value) => {
    setOthersSettings({
      ...othersSettings,
      rules: othersSettings.rules.map((rule) => {
        if (rule.id === ruleId) {
          if (field.includes(".")) {
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
            field === "customSound" ||
            field === "playAlertSound"
          ) {
            return {
              ...rule,
              styles: {
                ...(rule.styles || {}),
                [field]: value,
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

  // 기타 섹션 접기/펼치기 상태
  const [isOthersExpanded, setIsOthersExpanded] = useState(false);

  // 베이스 아이템 설정 로드
  const [baseItemsSettings, setBaseItemsSettings] = useState({
    enabled: true,
    rules: quickFilterDefaults.base_items?.rules || [],
  });
  const [isClientBaseItems, setIsClientBaseItems] = useState(false);
  const [baseItemsDropdown, setBaseItemsDropdown] = useState({
    ruleId: null,
    type: null,
  });

  // 클라이언트에서만 localStorage에서 베이스 아이템 설정 불러오기
  useEffect(() => {
    setIsClientBaseItems(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickFilter_baseItems");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultRules = quickFilterDefaults.base_items?.rules || [];
          const savedRules = parsed.rules || [];

          const mergedRules = savedRules.map((savedRule) => {
            const defaultRule = defaultRules.find((r) => r.id === savedRule.id);
            if (defaultRule) {
              // conditions 깊은 병합
              const mergedConditions = {
                ...(defaultRule.conditions || {}),
                ...(savedRule.conditions || {}),
              };
              return {
                ...defaultRule,
                ...savedRule,
                conditions: mergedConditions,
                name: defaultRule.name,
                nameKo: defaultRule.nameKo,
              };
            }
            return savedRule;
          });

          defaultRules.forEach((defaultRule) => {
            if (!mergedRules.find((r) => r.id === defaultRule.id)) {
              mergedRules.push(defaultRule);
            }
          });

          setBaseItemsSettings({
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
            rules: mergedRules,
          });
        } catch (e) {
          console.error("Failed to parse saved base items settings", e);
        }
      }
    }
  }, []);

  // 베이스 아이템 설정 저장
  useEffect(() => {
    if (isClientBaseItems && typeof window !== "undefined") {
      localStorage.setItem(
        "quickFilter_baseItems",
        JSON.stringify(baseItemsSettings)
      );
    }
  }, [baseItemsSettings, isClientBaseItems]);

  // 베이스 아이템 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".base-items-dropdown-wrapper")) {
        setBaseItemsDropdown({ ruleId: null, type: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 베이스 아이템 규칙 활성화/비활성화
  const toggleBaseItemsRule = (ruleId) => {
    const updatedRules = baseItemsSettings.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    const hasAnyEnabled = updatedRules.some((rule) => rule.enabled);

    setBaseItemsSettings({
      ...baseItemsSettings,
      enabled: hasAnyEnabled || baseItemsSettings.enabled,
      rules: updatedRules,
    });
  };

  // 베이스 아이템 규칙 값 업데이트
  const updateBaseItemsRule = (ruleId, field, value) => {
    setBaseItemsSettings({
      ...baseItemsSettings,
      rules: baseItemsSettings.rules.map((rule) => {
        if (rule.id === ruleId) {
          if (field.includes(".")) {
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
            field === "customSound"
          ) {
            return {
              ...rule,
              styles: {
                ...(rule.styles || {}),
                [field]: value,
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

  // 베이스 아이템 섹션 접기/펼치기 상태
  const [isBaseItemsExpanded, setIsBaseItemsExpanded] = useState(false);

  // 레벨링 단계 섹션 접기/펴기 상태
  const [isLeagueStartExpanded, setIsLeagueStartExpanded] = useState(false);

  // 레벨링 단계 활성화 상태
  const [isLeagueStartEnabled, setIsLeagueStartEnabled] = useState(true);

  // 직업 선택 섹션 접기/펴기 상태
  const [isClassSelectionExpanded, setIsClassSelectionExpanded] =
    useState(false);

  // 게임 메인 컬러 상태
  const [gamePrimaryColor, setGamePrimaryColor] = useState("#155dfc");

  // 게임 메인 컬러 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateColor = () => {
        // body나 documentElement에서 컬러 가져오기
        const body = document.body;
        const root = document.documentElement;

        // 먼저 body의 스타일에서 확인 (GameThemeProvider가 설정한 값)
        const bodyStyle = getComputedStyle(body);
        let color =
          bodyStyle.getPropertyValue("--poe2-primary")?.trim() ||
          bodyStyle.getPropertyValue("--game-primary")?.trim();

        // 없으면 root에서 확인
        if (!color) {
          const rootStyle = getComputedStyle(root);
          color =
            rootStyle.getPropertyValue("--poe2-primary")?.trim() ||
            rootStyle.getPropertyValue("--game-primary")?.trim();
        }

        // 여전히 없으면 기본값
        if (!color) {
          color = "#155dfc";
        }

        setGamePrimaryColor(color);
      };

      // 초기 로드 시 약간의 지연 후 실행 (CSS가 로드된 후)
      const timeoutId = setTimeout(updateColor, 100);

      // 컬러 변경 이벤트 리스너
      window.addEventListener("gamecolorchange", updateColor);
      window.addEventListener("storage", updateColor);

      // 주기적으로 확인 (동적 변경 대응)
      const intervalId = setInterval(updateColor, 500);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        window.removeEventListener("gamecolorchange", updateColor);
        window.removeEventListener("storage", updateColor);
      };
    }
  }, []);

  // 섹션 순서 관리 (왼쪽 열)
  const [leftColumnSections, setLeftColumnSections] = useState([
    { id: "class-selection", name: "클래스 선택" },
    { id: "gold", name: "골드" },
    { id: "currency", name: "화폐" },
    { id: "uniques", name: "유니크" },
    { id: "uncut_gems", name: "미가공 젬" },
  ]);

  // 섹션 순서 관리 (오른쪽 열)
  const [rightColumnSections, setRightColumnSections] = useState([
    { id: "base_items", name: "베이스 아이템" },
    { id: "jewels", name: "주얼" },
    { id: "vaultKeys", name: "금고실 열쇠" },
    { id: "charms", name: "호신부" },
    { id: "others", name: "기타" },
  ]);

  // 체크리스트 상태 텍스트(숨김/강조/표시) 공통 규칙
  const getRuleStatus = (rule) => {
    const styles = rule?.styles;

    if (rule?.type === "hide") {
      return {
        text: lang === "ko" ? "숨김" : "Hide",
        color: "#ff4757",
        fontWeight: "normal",
      };
    }

    const hasMinimapIcon =
      !!styles?.minimapIcon &&
      (styles.minimapIcon.size !== null ||
        styles.minimapIcon.color !== null ||
        styles.minimapIcon.shape !== null);

    const hasPlayEffect = !!styles?.playEffect;

    if (hasMinimapIcon || hasPlayEffect) {
      return {
        text: lang === "ko" ? "강조" : "Highlight",
        color: "#a5ff14",
        fontWeight: "bold",
      };
    }

    return {
      text: lang === "ko" ? "표시" : "Show",
      color: "var(--text-muted)",
      fontWeight: "bold",
    };
  };

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

  // 사용자가 드롭다운에서 한 번이라도 선택했는지 (초기 기본 상태 vs '전체' 명시 선택 구분용)
  const [levelingDropdownTouched, setLevelingDropdownTouched] = useState({
    class: false,
    weapon: false,
    armour: false,
  });

  // 드롭다운 버튼 마우스 오버 상태 (추천 무기/방어구 팝업)
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // "weapon" | "armour" | null

  // 스타일 설정 모달 상태
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingRuleSection, setEditingRuleSection] = useState(null); // "gold" or "currency"

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
        leveling: levelingSettings,
        gold: goldSettings,
        jewels: jewelsSettings,
        uniques: uniquesSettings,
        currency: currencySettings,
        vaultKeys: vaultKeysSettings,
        others: othersSettings,
        baseItems: baseItemsSettings,
        chance: { enabled: true }, // TODO: 찬스 아이템 설정 추가
        levelingClassSelection: levelingClassSelection,
        uncutGems: uncutGemsSettings,
        charms: charmsSettings,
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
        leveling: levelingSettings,
        gold: goldSettings,
        jewels: jewelsSettings,
        uniques: uniquesSettings,
        currency: currencySettings,
        vaultKeys: vaultKeysSettings,
        others: othersSettings,
        baseItems: baseItemsSettings,
        chance: { enabled: true }, // TODO: 찬스 아이템 설정 추가
        levelingClassSelection: levelingClassSelection,
        uncutGems: uncutGemsSettings,
        charms: charmsSettings,
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
  const getActivePresetId = () => {
    if (typeof window === "undefined") return "starter";
    return localStorage.getItem("poe2_selected_preset") || "starter";
  };

  const mergeRulesWithDefaults = (defaultRules = [], savedRules = []) => {
    const mergedRules = (savedRules || []).map((savedRule) => {
      const defaultRule = (defaultRules || []).find(
        (r) => r.id === savedRule.id
      );
      if (defaultRule) {
        return {
          ...defaultRule, // 기본값 먼저 적용 (새 필드 포함)
          ...savedRule, // 저장값으로 덮어쓰기 (null 포함)
          name: defaultRule.name,
          nameKo: defaultRule.nameKo,
        };
      }
      return savedRule;
    });

    (defaultRules || []).forEach((defaultRule) => {
      if (!mergedRules.find((r) => r.id === defaultRule.id)) {
        mergedRules.push(defaultRule);
      }
    });

    return mergedRules;
  };

  const getQuickFilterBaseline = (presetId) => {
    const fallback = {
      gold: quickFilterDefaults.gold,
      jewels: quickFilterDefaults.jewels,
      uncutGems: quickFilterDefaults.uncut_gems,
      vaultKeys: quickFilterDefaults.vaultKeys,
      uniques: quickFilterDefaults.uniques,
      currency: { enabled: true, rules: [], selectedTiers: [], minTier: "E" },
      others: quickFilterDefaults.others,
      baseItems: quickFilterDefaults.base_items || { enabled: true, rules: [] },
    };

    if (typeof window === "undefined") return fallback;

    const key = `quickFilter_default_${presetId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);

      // 구버전 호환: goldSettings 단독 저장 형태
      const stored =
        parsed &&
        (parsed.gold ||
          parsed.jewels ||
          parsed.uniques ||
          parsed.currency ||
          parsed.vaultKeys ||
          parsed.uncutGems ||
          parsed.uncut_gems)
          ? parsed
          : { gold: parsed };

      const goldDefaultRules = quickFilterDefaults.gold?.rules || [];
      const jewelsDefaultRules = quickFilterDefaults.jewels?.rules || [];
      const uniquesDefaultRules =
        (quickFilterDefaults.uniques || { rules: [] }).rules || [];
      const uncutGemsDefaultRules = quickFilterDefaults.uncut_gems?.rules || [];

      // uncutGems 키는 camelCase/legacy snake_case 둘 다 허용
      const storedUncutGems = stored.uncutGems || stored.uncut_gems;

      return {
        gold: {
          ...quickFilterDefaults.gold,
          ...(stored.gold || {}),
          enabled:
            stored.gold?.enabled !== undefined
              ? stored.gold.enabled
              : quickFilterDefaults.gold?.enabled ?? true,
          rules: mergeRulesWithDefaults(
            goldDefaultRules,
            stored.gold?.rules || []
          ),
        },
        jewels: {
          ...quickFilterDefaults.jewels,
          ...(stored.jewels || {}),
          enabled:
            stored.jewels?.enabled !== undefined ? stored.jewels.enabled : true,
          rules: mergeRulesWithDefaults(
            jewelsDefaultRules,
            stored.jewels?.rules || []
          ),
        },
        uncutGems: {
          ...(quickFilterDefaults.uncut_gems || { enabled: true, rules: [] }),
          ...(storedUncutGems || {}),
          enabled:
            storedUncutGems?.enabled !== undefined
              ? storedUncutGems.enabled
              : (quickFilterDefaults.uncut_gems || { enabled: true }).enabled,
          rules: mergeRulesWithDefaults(
            uncutGemsDefaultRules,
            storedUncutGems?.rules || []
          ),
        },
        uniques: {
          ...(quickFilterDefaults.uniques || { enabled: true, rules: [] }),
          ...(stored.uniques || {}),
          enabled:
            stored.uniques?.enabled !== undefined
              ? stored.uniques.enabled
              : (quickFilterDefaults.uniques || { enabled: true }).enabled,
          rules: mergeRulesWithDefaults(
            uniquesDefaultRules,
            stored.uniques?.rules || []
          ),
          minTier: stored.uniques?.minTier || "D",
        },
        currency: {
          enabled:
            stored.currency?.enabled !== undefined
              ? stored.currency.enabled
              : true,
          rules: stored.currency?.rules || [],
          selectedTiers: stored.currency?.selectedTiers || [],
          minTier: stored.currency?.minTier || "E",
        },
        vaultKeys: {
          enabled:
            stored.vaultKeys?.enabled !== undefined
              ? stored.vaultKeys.enabled
              : true,
          minTier: stored.vaultKeys?.minTier || "D",
          tiers:
            stored.vaultKeys?.tiers ||
            quickFilterDefaults.vaultKeys?.tiers ||
            {},
        },
        // 기타 섹션 (주문 감정서, 찬스 아이템 등)
        others: stored.others || quickFilterDefaults.others || { enabled: true, rules: [] },
        // 호신부 섹션
        charms: stored.charms || quickFilterDefaults.charms || { enabled: true, rules: [] },
        // 베이스 아이템 섹션 (baseItems/base_items 둘 다 지원)
        baseItems: stored.baseItems || stored.base_items || quickFilterDefaults.base_items || { enabled: true, rules: [] },
      };
    } catch (e) {
      console.error("Failed to parse quick filter default:", e);
      return fallback;
    }
  };

  const handleResetAll = (onSuccess) => {
    // 전체 초기화: 모든 설정 초기화
    const presetId = getActivePresetId();
    const baseline = getQuickFilterBaseline(presetId);
    setGoldSettings(baseline.gold);
    setJewelsSettings(baseline.jewels);
    setUncutGemsSettings(baseline.uncutGems);
    setUniquesSettings(baseline.uniques);
    setCurrencySettings(baseline.currency);
    setVaultKeysSettings(baseline.vaultKeys);
    // 기타 섹션 초기화 추가
    if (baseline.others) {
      setOthersSettings(baseline.others);
    }
    // 호신부 섹션 초기화 추가
    if (baseline.charms) {
      setCharmsSettings(baseline.charms);
    }
    // 베이스 아이템 섹션 초기화 추가
    if (baseline.baseItems) {
      setBaseItemsSettings(baseline.baseItems);
    }

    // 다른 페이지의 설정도 초기화
    if (typeof window !== "undefined") {
      localStorage.setItem("quickFilter_gold", JSON.stringify(baseline.gold));
      localStorage.setItem(
        "quickFilter_jewels",
        JSON.stringify(baseline.jewels)
      );
      localStorage.setItem(
        "quickFilter_uncutGems",
        JSON.stringify(baseline.uncutGems)
      );
      localStorage.setItem(
        "quickFilter_uniques",
        JSON.stringify(baseline.uniques)
      );
      localStorage.setItem(
        "quickFilter_charms",
        JSON.stringify(baseline.charms)
      );
      localStorage.setItem(
        "quickFilter_currency",
        JSON.stringify(baseline.currency)
      );
      localStorage.setItem(
        "quickFilter_vaultKeys",
        JSON.stringify(baseline.vaultKeys)
      );
      // 기타 섹션 localStorage 저장
      if (baseline.others) {
        localStorage.setItem(
          "quickFilter_others",
          JSON.stringify(baseline.others)
        );
      }
      // 베이스 아이템 섹션 localStorage 저장
      if (baseline.baseItems) {
        localStorage.setItem(
          "quickFilter_baseItems",
          JSON.stringify(baseline.baseItems)
        );
      }
      localStorage.removeItem("tier-list-custom-gear");
      const leagues = ["default", "normal", "early", "mid", "late", "ssf"];
      leagues.forEach((league) => {
        const leagueKey = league === "default" ? "normal" : league;
        localStorage.removeItem(`tier-list-custom-currency-${leagueKey}`);
      });
    }

    if (onSuccess) {
      onSuccess(
        lang === "ko"
          ? "전체 설정이 초기화되었습니다."
          : "All settings have been reset."
      );
    }
  };

  const handleResetPage = (onSuccess) => {
    // 이 페이지만: 현재 페이지의 설정만 초기화
    const presetId = getActivePresetId();
    const baseline = getQuickFilterBaseline(presetId);
    setGoldSettings(baseline.gold);
    setJewelsSettings(baseline.jewels);
    setUncutGemsSettings(baseline.uncutGems);
    setUniquesSettings(baseline.uniques);
    setCurrencySettings(baseline.currency);
    setVaultKeysSettings(baseline.vaultKeys);
    // 기타 섹션 초기화 추가
    if (baseline.others) {
      setOthersSettings(baseline.others);
    }
    // 베이스 아이템 섹션 초기화 추가
    if (baseline.baseItems) {
      setBaseItemsSettings(baseline.baseItems);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("quickFilter_gold", JSON.stringify(baseline.gold));
      localStorage.setItem(
        "quickFilter_jewels",
        JSON.stringify(baseline.jewels)
      );
      localStorage.setItem(
        "quickFilter_uncutGems",
        JSON.stringify(baseline.uncutGems)
      );
      localStorage.setItem(
        "quickFilter_uniques",
        JSON.stringify(baseline.uniques)
      );
      localStorage.setItem(
        "quickFilter_currency",
        JSON.stringify(baseline.currency)
      );
      localStorage.setItem(
        "quickFilter_vaultKeys",
        JSON.stringify(baseline.vaultKeys)
      );
      // 기타 섹션 localStorage 저장
      if (baseline.others) {
        localStorage.setItem(
          "quickFilter_others",
          JSON.stringify(baseline.others)
        );
      }
      // 호신부 섹션 localStorage 저장
      if (baseline.charms) {
        localStorage.setItem(
          "quickFilter_charms",
          JSON.stringify(baseline.charms)
        );
      }
      // 베이스 아이템 섹션 localStorage 저장
      if (baseline.baseItems) {
        localStorage.setItem(
          "quickFilter_baseItems",
          JSON.stringify(baseline.baseItems)
        );
      }
    }

    if (onSuccess) {
      onSuccess(
        lang === "ko"
          ? "이 페이지의 설정이 초기화되었습니다."
          : "This page's settings have been reset."
      );
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
        // 프리셋 기본값은 "페이지 전체 설정" 단위로 저장
        const payload = {
          version: 2,
          presetId,
          savedAt: new Date().toISOString(),
          gold: goldSettings,
          jewels: jewelsSettings,
          uncutGems: uncutGemsSettings,
          uniques: uniquesSettings,
          currency: currencySettings,
          vaultKeys: vaultKeysSettings,
          others: othersSettings,
          charms: charmsSettings,
          baseItems: baseItemsSettings,
        };
        localStorage.setItem(defaultKey, JSON.stringify(payload));
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
  }, [showClassDropdown, showWeaponDropdown, showArmourDropdown]);

  // 직업 선택 섹션 렌더링 함수
  const renderClassSelectionSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isClassSelectionExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsClassSelectionExpanded(!isClassSelectionExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={levelingClassSelection.enabled}
            onChange={(e) => {
              const newEnabled = e.target.checked;
              setLevelingClassSelection({
                ...levelingClassSelection,
                enabled: newEnabled,
              });
            }}
          />
        </label>
        <h3
          className="section-title"
          style={{
            opacity: levelingClassSelection.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "레벨링" : "Leveling"}
        </h3>
        <span className="section-toggle-icon">
          {isClassSelectionExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>

      {!levelingClassSelection.enabled && (
        <div className="leveling-disabled-message">
          {lang === "ko"
            ? "클래스 선택이 비활성화되었습니다."
            : "Class selection is disabled."}
        </div>
      )}

      {levelingClassSelection.enabled && isClassSelectionExpanded && (
        <div
          className="section-content"
          style={{
            opacity: levelingClassSelection.enabled ? 1 : 0.5,
            filter: levelingClassSelection.enabled ? "none" : "grayscale(100%)",
          }}
        >
          {/* 안내 텍스트 */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "8px",
              color: "var(--muted)",
              fontSize: "14px",
              padding: "12px 16px 0 16px",
              background: "#141414",
            }}
          >
            <span style={{ fontSize: "16px" }}>💡</span>
            <span style={{ lineHeight: "1.6" }}>
              {lang === "ko"
                ? "클래스를 선택하지 않으면 모든 무기/방어구에 필터가 적용됩니다."
                : "If no class is selected, the filter applies to all weapons/armour."}
            </span>
          </div>

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
                    levelingClassSelection.class === "all" ? "selected" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWeaponDropdown(false);
                    setShowArmourDropdown(false);
                    setShowClassDropdown(!showClassDropdown);
                  }}
                >
                  <span>
                    {!levelingDropdownTouched.class
                      ? lang === "ko"
                        ? "클래스 선택"
                        : "Select Class"
                      : levelingClassSelection.class === "all"
                      ? lang === "ko"
                        ? "전체"
                        : "All"
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
                      : levelingClassSelection.class.charAt(0).toUpperCase() +
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
                        levelingClassSelection.class === "all" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.warrior;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.mercenary;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.ranger;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.huntress;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.witch;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.sorceress;
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          class: true,
                        }));
                        const recommendations = classRecommendations.druid;
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
                    {!levelingDropdownTouched.weapon &&
                    levelingClassSelection.weaponTypes.length === 0
                      ? lang === "ko"
                        ? "무기 종류"
                        : "Weapon Type"
                      : levelingClassSelection.weaponTypes.length === 0
                      ? lang === "ko"
                        ? "전체"
                        : "All"
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
                      {levelingClassSelection.weaponTypes.map((weaponId) => {
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
                          <div key={weaponId} className="selected-item-text">
                            {lang === "ko"
                              ? weaponNames[weaponId]?.ko || weaponId
                              : weaponNames[weaponId]?.en || weaponId}
                          </div>
                        );
                      })}
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          weapon: true,
                        }));
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
                        levelingClassSelection.weaponTypes.includes(weapon.id);
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
                              const index = currentTypes.indexOf(weapon.id);
                              currentTypes.splice(index, 1);
                            } else {
                              currentTypes.push(weapon.id);
                            }
                            setLevelingClassSelection({
                              ...levelingClassSelection,
                              weaponTypes: currentTypes,
                            });
                            setLevelingDropdownTouched((prev) => ({
                              ...prev,
                              weapon: true,
                            }));
                          }}
                        >
                          <span>{lang === "ko" ? weapon.ko : weapon.en}</span>
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
                className="leveling-dropdown-wrapper leveling-armour-dropdown-wrapper"
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
                    {!levelingDropdownTouched.armour &&
                    levelingClassSelection.armourTypes.length === 0
                      ? lang === "ko"
                        ? "방어구 종류"
                        : "Armour Type"
                      : levelingClassSelection.armourTypes.length === 0
                      ? lang === "ko"
                        ? "전체"
                        : "All"
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
                      {levelingClassSelection.armourTypes.map((armourId) => {
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
                          <div key={armourId} className="selected-item-text">
                            {lang === "ko"
                              ? armourNames[armourId]?.ko || armourId
                              : armourNames[armourId]?.en || armourId}
                          </div>
                        );
                      })}
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
                        setLevelingDropdownTouched((prev) => ({
                          ...prev,
                          armour: true,
                        }));
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
                        levelingClassSelection.armourTypes.includes(armour.id);
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
                              const index = currentTypes.indexOf(armour.id);
                              currentTypes.splice(index, 1);
                            } else {
                              currentTypes.push(armour.id);
                            }
                            setLevelingClassSelection({
                              ...levelingClassSelection,
                              armourTypes: currentTypes,
                            });
                            setLevelingDropdownTouched((prev) => ({
                              ...prev,
                              armour: true,
                            }));
                          }}
                        >
                          <span>{lang === "ko" ? armour.ko : armour.en}</span>
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

          {/* 레벨링 화폐 규칙 리스트 */}
          {levelingSettings.rules.length > 0 && (
            <>
              <div
                className="section-divider"
                style={{
                  margin: "0",
                  borderBottom: "1px solid var(--border)",
                  opacity: 0.3,
                }}
              />
              {/* 레벨링 규칙들 */}
              <div
                className="leveling-rules-list"
                style={{ padding: "0", width: "100%" }}
              >
              {levelingSettings.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="filter-rule-item"
                  style={{
                    opacity:
                      levelingSettings.enabled && rule.enabled ? 1 : 0.5,
                    filter:
                      levelingSettings.enabled && rule.enabled
                        ? "none"
                        : "grayscale(100%)",
                    gap: "0",
                    paddingRight: "16px",
                  }}
                >
                  <label
                    className="rule-checkbox"
                    style={{ marginRight: "10px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => {
                        setLevelingSettings({
                          ...levelingSettings,
                          rules: levelingSettings.rules.map((r) =>
                            r.id === rule.id
                              ? { ...r, enabled: !r.enabled }
                              : r
                          ),
                        });
                      }}
                    />
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      gap: "8px",
                      overflow: "visible",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        minWidth: "fit-content",
                      }}
                    >
                      {lang === "ko" ? rule.nameKo : rule.name}
                    </span>
                    {(() => {
                      const status = getRuleStatus(rule);
                      return (
                        <span
                          style={{
                            fontSize: "14px",
                            color: status.color,
                            marginLeft: "auto",
                            fontWeight: status.fontWeight,
                            whiteSpace: "nowrap",
                            minWidth: "fit-content",
                            flexShrink: 0,
                          }}
                        >
                          {status.text}
                        </span>
                      );
                    })()}
                  </div>

                  <button
                    className="rule-edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRuleId(rule.id);
                      setEditingRuleSection("leveling");
                      setStyleModalOpen(true);
                    }}
                    style={{
                      opacity:
                        levelingSettings.enabled && rule.enabled ? 1 : 0.5,
                      cursor:
                        levelingSettings.enabled && rule.enabled
                          ? "pointer"
                          : "not-allowed",
                      flexShrink: 0,
                    }}
                  >
                    수정
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      )}
    </div>
  );

  // 레벨링 단계 섹션 렌더링 함수
  const renderLeagueStartSection = () => (
    <div className="league-start-wrapper">
      <div
        className={`section-header ${
          isLeagueStartExpanded ? "section-header-expanded" : ""
        }`}
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
        <span className="section-toggle-icon">
          {isLeagueStartExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
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
          {/* 레벨링 단계 내용이 여기에 들어갑니다 */}
        </div>
      )}
    </div>
  );

  // 화폐 섹션 렌더링 함수
  const renderCurrencySection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isCurrencyExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsCurrencyExpanded(!isCurrencyExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={currencySettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setCurrencySettings({
                ...currencySettings,
                enabled: newEnabled,
                rules: currencySettings.rules.map((rule) => ({
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
            opacity: currencySettings.enabled ? 1 : 0.5,
          }}
        >
          화폐
        </h3>
        <span className="section-toggle-icon">
          {isCurrencyExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isCurrencyExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {/* 화폐 티어 선택 */}
          <div className="currency-tier-selection">
            <div
              style={{
                padding: "16px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "var(--color-gray-300)",
                  fontSize: "14px",
                }}
              >
                {lang === "ko"
                  ? "화폐는 몇 티어까지 보고 싶나요?"
                  : "How many currency tiers do you want to see?"}
              </div>
              <div
                style={{
                  color: "var(--color-gray-300)",
                  fontSize: "14px",
                }}
              >
                {currencySettings.minTier === "S"
                  ? lang === "ko"
                    ? "S 티어만 표시"
                    : "S tier only"
                  : `${currencySettings.minTier} ${
                      lang === "ko" ? "티어 이상 표시" : "tier or higher"
                    }`}
              </div>
            </div>
            <div
              style={{
                padding: "0 32px 16px 32px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              {["S", "A", "B", "C", "D", "E"].map((tier) => {
                const tierOrder = { S: 1, A: 2, B: 3, C: 4, D: 5, E: 6 };
                const selectedOrder = tierOrder[currencySettings.minTier] || 6;
                const currentOrder = tierOrder[tier] || 6;
                // 선택한 티어를 포함해서 왼쪽(높은 티어)이 활성화, 오른쪽(낮은 티어)이 비활성화
                const isIncluded = currentOrder <= selectedOrder; // 선택된 티어 이하 (S~선택한 티어)
                const isSelected = tier === currencySettings.minTier; // 현재 선택된 티어만

                const tierColors = {
                  S: "var(--tier-s)",
                  A: "var(--tier-a)",
                  B: "var(--tier-b)",
                  C: "var(--tier-c)",
                  D: "var(--tier-d)",
                  E: "var(--tier-e)",
                };

                // 활성화된 티어: 컬러 배경 + 컬러 테두리 + 밝게 표시
                // 선택된 티어: 흰색 테두리
                // 비활성화된 티어: 본래 컬러에 블랙 50% 오버레이 효과
                let backgroundColor;
                let borderColor;
                let largeTextColor;
                let smallTextColor;

                if (isIncluded) {
                  // 활성화된 티어: 본래 컬러
                  backgroundColor = tierColors[tier];
                  borderColor = isSelected ? "#ffffff" : tierColors[tier];

                  if (tier === "C" || tier === "D") {
                    largeTextColor = "#000000";
                    smallTextColor = "#000000";
                  } else if (tier === "E") {
                    largeTextColor = "rgb(220, 175, 132)";
                    smallTextColor = "rgb(220, 175, 132)";
                  } else {
                    largeTextColor = "#ffffff";
                    smallTextColor = "#ffffff";
                  }
                } else {
                  // 비활성화된 티어: 본래 컬러에 블랙 60% 오버레이 효과
                  backgroundColor = tierColors[tier];
                  borderColor = "rgba(0, 0, 0, 0.6)"; // 테두리도 어둡게

                  // 비활성화된 티어의 텍스트는 대비가 높은 색상으로 표시
                  if (tier === "C" || tier === "D") {
                    // C, D는 노란색/회색 배경이므로 검은색 텍스트
                    largeTextColor = "#000000";
                    smallTextColor = "#000000";
                  } else if (tier === "E") {
                    // E 티어는 티어 리스트와 동일한 컬러 사용
                    largeTextColor = "rgb(220, 175, 132)";
                    smallTextColor = "rgb(220, 175, 132)";
                  } else {
                    // S, A, B는 어두운 배경이므로 흰색 텍스트
                    largeTextColor = "#ffffff";
                    smallTextColor = "var(--muted)";
                  }
                }
                const boxShadow =
                  isIncluded && !isSelected
                    ? `0 0 8px ${tierColors[tier]}40`
                    : isSelected
                    ? `0 0 12px ${tierColors[tier]}60`
                    : "none";

                return (
                  <button
                    key={tier}
                    onClick={() => {
                      if (!currencySettings.enabled) return;
                      setCurrencySettings({
                        ...currencySettings,
                        minTier: tier,
                      });
                    }}
                    disabled={!currencySettings.enabled}
                    className={`currency-tier-button ${
                      isIncluded
                        ? "currency-tier-active"
                        : "currency-tier-inactive"
                    }`}
                    data-included={isIncluded}
                    style={{
                      flex: "1",
                      minWidth: "0",
                      height: "50px",
                      maxWidth: "120px",
                      border: `2px solid ${borderColor}`,
                      background: backgroundColor,
                      cursor: currencySettings.enabled
                        ? "pointer"
                        : "not-allowed",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      position: "relative",
                      transition: "all 0.2s",
                      boxShadow: boxShadow,
                      overflow: "hidden",
                    }}
                  >
                    {!isIncluded && (
                      <div
                        className="currency-tier-overlay"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          background: "rgba(0, 0, 0, 0.6)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />
                    )}
                    {isSelected && (
                      <div
                        className="currency-tier-checkbox"
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          width: "18px",
                          height: "18px",
                          zIndex: 20,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "default",
                            margin: 0,
                            padding: 0,
                          }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: largeTextColor,
                        opacity: 1,
                      }}
                    >
                      {tier}
                    </div>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                padding: "0 32px 16px 32px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                color: "var(--muted)",
                fontSize: "14px",
              }}
            >
              <span style={{ fontSize: "16px" }}>💡</span>
              <span style={{ lineHeight: "1.6" }}>
                {lang === "ko" ? (
                  <>
                    선택한 티어 이상의 화폐만 표시됩니다.
                    <br />
                    예: B 티어 선택 시 S, A, B 티어 화폐가 모두 표시됩니다.
                  </>
                ) : (
                  <>
                    Only currencies of the selected tier or higher are
                    displayed.
                    <br />
                    Example: If B tier is selected, S, A, B tier currencies are
                    all displayed.
                  </>
                )}
              </span>
            </div>

            {/* 화폐 규칙 목록 (중첩 화폐 등) */}
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {currencySettings.rules.map((rule) => {
                 const status = getRuleStatus(rule);
                 return (
                  <div
                    key={rule.id}
                    className="filter-rule-item"
                    style={{
                      opacity: currencySettings.enabled && rule.enabled ? 1 : 0.5,
                      filter: currencySettings.enabled && rule.enabled ? "none" : "grayscale(100%)",
                      gap: "0",
                      paddingRight: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <label className="rule-checkbox" style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleCurrencyRule(rule.id)}
                        disabled={!currencySettings.enabled}
                      />
                    </label>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <span
                        className="rule-title"
                        style={{
                          fontSize: "14px",
                          color: "var(--text-main)",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {rule.conditions?.stackSize ? (
                          <>
                            {lang === "ko" ? "화폐 중첩 " : "Currency Stacks "}
                            <input
                              type="number"
                              value={rule.conditions.stackSize.value || 0}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setCurrencySettings((prev) => ({
                                  ...prev,
                                  rules: prev.rules.map((r) =>
                                    r.id === rule.id
                                      ? {
                                          ...r,
                                          conditions: {
                                            ...r.conditions,
                                            stackSize: {
                                              ...r.conditions.stackSize,
                                              value: val,
                                            },
                                          },
                                        }
                                      : r
                                  ),
                                }));
                              }}
                              disabled={!currencySettings.enabled || !rule.enabled}
                              style={{
                                background: "#000",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-main)",
                                width: "60px",
                                textAlign: "center",
                                fontSize: "14px",
                                margin: "0 6px",
                                padding: "4px"
                              }}
                            />
                            {lang === "ko" ? "개 이상" : "+"}
                          </>
                        ) : (
                          lang === "ko" ? rule.nameKo : rule.name
                        )}
                      </span>

                      {/* 상태 텍스트 (강조/표시/숨김) */}
                      <span
                        style={{
                          fontSize: "14px",
                          color: status.color,
                          marginLeft: "auto",
                          fontWeight: status.fontWeight,
                          whiteSpace: "nowrap",
                          minWidth: "fit-content",
                          flexShrink: 0,
                        }}
                      >
                        {status.text}
                      </span>
                    </div>

                    <button
                      className="rule-edit-button"
                      onClick={() => {
                        setEditingRuleId(rule.id);
                        setEditingRuleSection("currency");
                        setStyleModalOpen(true);
                      }}
                      style={{
                        opacity: currencySettings.enabled ? 1 : 0.5,
                        cursor: currencySettings.enabled ? "pointer" : "not-allowed",
                        marginLeft: "16px",
                        flexShrink: 0
                      }}
                    >
                      {lang === "ko" ? "수정" : "Edit"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 유니크 섹션 렌더링 함수
  const renderUniquesSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isUniquesExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsUniquesExpanded(!isUniquesExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={uniquesSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setUniquesSettings({
                ...uniquesSettings,
                enabled: newEnabled,
                rules: uniquesSettings.rules.map((rule) => ({
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
            opacity: uniquesSettings.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "유니크" : "Uniques"}
        </h3>
        <span className="section-toggle-icon">
          {isUniquesExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isUniquesExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {/* 유니크 티어 선택 */}
          <div className="currency-tier-selection">
            <div
              style={{
                padding: "16px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "var(--color-gray-300)",
                  fontSize: "14px",
                }}
              >
                {lang === "ko"
                  ? "유니크는 몇 티어까지 보고 싶나요?"
                  : "How many unique tiers do you want to see?"}
              </div>
              <div
                style={{
                  color: "var(--color-gray-300)",
                  fontSize: "14px",
                }}
              >
                {uniquesSettings.minTier === "S"
                  ? lang === "ko"
                    ? "S 티어만 표시"
                    : "S tier only"
                  : `${uniquesSettings.minTier} ${
                      lang === "ko" ? "티어 이상 표시" : "tier or higher"
                    }`}
              </div>
            </div>
            <div
              style={{
                padding: "0 32px 16px 32px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              {["S", "A", "B", "C", "D"].map((tier) => {
                const tierOrder = { S: 1, A: 2, B: 3, C: 4, D: 5 };
                const selectedOrder = tierOrder[uniquesSettings.minTier] || 5;
                const currentOrder = tierOrder[tier] || 5;
                // 선택한 티어를 포함해서 왼쪽(높은 티어)이 활성화, 오른쪽(낮은 티어)이 비활성화
                const isIncluded = currentOrder <= selectedOrder; // 선택된 티어 이하 (S~선택한 티어)
                const isSelected = tier === uniquesSettings.minTier; // 현재 선택된 티어만

                const tierColors = {
                  S: "var(--tier-s)",
                  A: "var(--tier-a)",
                  B: "var(--tier-b)",
                  C: "var(--tier-c)",
                  D: "var(--tier-d)",
                };

                let backgroundColor;
                let borderColor;
                let largeTextColor;
                let smallTextColor;

                if (isIncluded) {
                  // 활성화된 티어: 본래 컬러
                  backgroundColor = tierColors[tier];
                  borderColor = isSelected ? "#ffffff" : tierColors[tier];

                  if (tier === "C" || tier === "D") {
                    largeTextColor = "#000000";
                    smallTextColor = "#000000";
                  } else {
                    largeTextColor = "#ffffff";
                    smallTextColor = "#ffffff";
                  }
                } else {
                  // 비활성화된 티어: 본래 컬러에 블랙 60% 오버레이 효과
                  backgroundColor = tierColors[tier];
                  borderColor = "rgba(0, 0, 0, 0.6)"; // 테두리도 어둡게

                  // 비활성화된 티어의 텍스트는 대비가 높은 색상으로 표시
                  if (tier === "C" || tier === "D") {
                    largeTextColor = "#000000";
                    smallTextColor = "#000000";
                  } else {
                    largeTextColor = "#ffffff";
                    smallTextColor = "var(--muted)";
                  }
                }

                const boxShadow =
                  isIncluded && !isSelected
                    ? `0 0 8px ${tierColors[tier]}40`
                    : isSelected
                    ? `0 0 12px ${tierColors[tier]}60`
                    : "none";

                // D 티어 라벨 처리
                const tierLabel =
                  tier === "D"
                    ? lang === "ko"
                      ? "기타 유니크"
                      : "Other Uniques"
                    : `${tier} ${lang === "ko" ? "티어" : "Tier"}`;

                return (
                  <button
                    key={tier}
                    onClick={() => {
                      if (!uniquesSettings.enabled) return;
                      setUniquesSettings({
                        ...uniquesSettings,
                        minTier: tier,
                      });
                    }}
                    disabled={!uniquesSettings.enabled}
                    className={`currency-tier-button ${
                      isIncluded
                        ? "currency-tier-active"
                        : "currency-tier-inactive"
                    }`}
                    data-included={isIncluded}
                    style={{
                      flex: "1",
                      minWidth: "0",
                      minWidth: "0",
                      height: "50px", // 높이 50으로 변경
                      maxWidth: "120px",
                      border: `2px solid ${borderColor}`,
                      background: backgroundColor,
                      cursor: uniquesSettings.enabled
                        ? "pointer"
                        : "not-allowed",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0px", // 간격 제거
                      position: "relative",
                      transition: "all 0.2s",
                      boxShadow: boxShadow,
                      overflow: "hidden",
                    }}
                  >
                    {!isIncluded && (
                      <div
                        className="currency-tier-overlay"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          background: "rgba(0, 0, 0, 0.6)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />
                    )}
                    {isSelected && (
                      <div
                        className="currency-tier-checkbox"
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          width: "18px",
                          height: "18px",
                          zIndex: 20,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "default",
                            margin: 0,
                            padding: 0,
                          }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: largeTextColor,
                        opacity: 1,
                      }}
                    >
                      {tier}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* 유니크 규칙 리스트 (2열 그리드) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0",
                padding: "0",
              }}
            >
              {uniquesSettings.rules.map((rule) => {
                // 기타 유니크(D tier) 체크박스는 렌더링에서 제외
                if (rule.id === "uniques_d_other") return null;

                // 퀄리티 규칙 특수 UI
                if (rule.id === "uniques_quality23") {
                  const status = getRuleStatus(rule);
                  return (
                    <div
                      key={rule.id}
                      className="filter-rule-item"
                      style={{
                        opacity:
                          uniquesSettings.enabled && rule.enabled ? 1 : 0.5,
                        filter:
                          uniquesSettings.enabled && rule.enabled
                            ? "none"
                            : "grayscale(100%)",
                        gap: "0",
                        paddingRight: "16px",
                      }}
                    >
                      <label className="rule-checkbox" style={{ marginRight: "10px" }}>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleUniquesRule(rule.id)}
                        />
                      </label>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 1,
                          gap: "8px",
                          overflow: "visible",
                        }}
                      >
                        {/* 퀄리티 조건 표시 */}
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            whiteSpace: "nowrap",
                            minWidth: "fit-content",
                          }}
                        >
                          {(() => {
                            const qualityVal =
                              typeof rule.conditions?.quality === "object"
                                ? rule.conditions.quality.value
                                : rule.conditions?.quality || 23;

                            return lang === "ko"
                              ? `퀄리티 ${qualityVal} 이상`
                              : `Quality ${qualityVal}+`;
                          })()}
                        </span>

                        {/* 상태 텍스트 */}
                        <span
                          style={{
                            fontSize: "14px",
                            color: status.color,
                            marginLeft: "auto",
                            fontWeight: status.fontWeight,
                            whiteSpace: "nowrap",
                            minWidth: "fit-content",
                            flexShrink: 0,
                          }}
                        >
                          {status.text}
                        </span>
                      </div>

                      <button
                        className="rule-edit-button"
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setEditingRuleSection("uniques");
                          setStyleModalOpen(true);
                        }}
                        disabled={!uniquesSettings.enabled}
                        style={{
                          marginLeft: "auto",
                          opacity: uniquesSettings.enabled ? 1 : 0.5,
                          cursor: uniquesSettings.enabled
                            ? "pointer"
                            : "not-allowed",
                          flexShrink: 0,
                        }}
                      >
                        수정
                      </button>
                    </div>
                  );
                }
                // 기본 체크박스 규칙
                const status = getRuleStatus(rule);
                return (
                  <div
                    key={rule.id}
                    className="filter-rule-item"
                    style={{
                      opacity:
                        uniquesSettings.enabled && rule.enabled ? 1 : 0.5,
                      filter:
                        uniquesSettings.enabled && rule.enabled
                          ? "none"
                          : "grayscale(100%)",
                      gap: "0",
                      paddingRight: "16px",
                    }}
                  >
                    <label className="rule-checkbox" style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleUniquesRule(rule.id)}
                      />
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        gap: "8px",
                        overflow: "visible",
                      }}
                    >
                      <span
                        className="rule-title"
                        style={{
                          fontSize: "14px",
                          color: "var(--text-main)",
                          whiteSpace: "nowrap",
                          minWidth: "fit-content",
                        }}
                      >
                        {rule.nameKo || rule.name}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: status.color,
                          marginLeft: "auto",
                          fontWeight: status.fontWeight,
                          whiteSpace: "nowrap",
                          minWidth: "fit-content",
                          flexShrink: 0,
                        }}
                      >
                        {status.text}
                      </span>
                    </div>
                    <button
                      className="rule-edit-button"
                      onClick={() => {
                        setEditingRuleId(rule.id);
                        setEditingRuleSection("uniques");
                        setStyleModalOpen(true);
                      }}
                      style={{
                        opacity: uniquesSettings.enabled ? 1 : 0.5,
                        cursor: uniquesSettings.enabled
                          ? "pointer"
                          : "not-allowed",
                        marginLeft: "auto", 
                        flexShrink: 0,
                      }}
                    >
                      수정
                    </button>
                  </div>
                );
              })}
            </div>
            {/* 설명 텍스트 */}
            <div
              style={{
                padding: "0 32px 16px 32px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                color: "var(--muted)",
                fontSize: "14px",
              }}
            >
              <span style={{ fontSize: "16px" }}>💡</span>
              <span style={{ lineHeight: "1.6" }}>
                {lang === "ko" ? (
                  <>
                    선택한 티어 이상의 유니크 아이템만 표시됩니다.
                    <br />
                    소켓 유니크는 기본 소켓보다 더 많은 소켓으로 드롭되는
                    유니크입니다.
                  </>
                ) : (
                  <>
                    Only unique items of the selected tier or higher are
                    displayed.
                    <br />
                    Socket Uniques are unique items that drop with more sockets
                    than the default socket.
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 미가공 젬 섹션 렌더링 함수
  const renderUncutGemsSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isUncutGemsExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsUncutGemsExpanded(!isUncutGemsExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={uncutGemsSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setUncutGemsSettings({
                ...uncutGemsSettings,
                enabled: newEnabled,
                rules: uncutGemsSettings.rules.map((rule) => ({
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
            opacity: uncutGemsSettings.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "미가공 젬" : "Uncut Gems"}
        </h3>
        <span className="section-toggle-icon">
          {isUncutGemsExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isUncutGemsExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {uncutGemsSettings.rules.map((rule) => {
            const status = getRuleStatus(rule);

            return (
              <div
                key={rule.id}
                className="filter-rule-item"
                style={{
                  opacity: uncutGemsSettings.enabled && rule.enabled ? 1 : 0.5,
                  filter:
                    uncutGemsSettings.enabled && rule.enabled
                      ? "none"
                      : "grayscale(100%)",
                  gap: "0",
                  paddingRight: "16px",
                }}
              >
                <label
                  className="rule-checkbox"
                  style={{ marginRight: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleUncutGemsRule(rule.id)}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rule.nameKo || rule.name}
                  </span>

                  <span
                    style={{
                      fontSize: "14px",
                      color: status.color,
                      marginLeft: "auto",
                      fontWeight: status.fontWeight,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      flexShrink: 0,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <button
                  className="rule-edit-button"
                  onClick={() => {
                    setEditingRuleId(rule.id);
                    setEditingRuleSection("uncut_gems");
                    setStyleModalOpen(true);
                  }}
                  style={{
                    opacity: uncutGemsSettings.enabled ? 1 : 0.5,
                    cursor: uncutGemsSettings.enabled
                      ? "pointer"
                      : "not-allowed",
                    marginLeft: "auto",
                  }}
                >
                  수정
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 베이스 아이템 섹션 렌더링 함수
  const renderBaseItemsSection = () => {
    // 희귀도 옵션
    const rarityOptions = [
      { value: "Normal", labelKo: "일반", labelEn: "Normal" },
      { value: "Magic", labelKo: "마법", labelEn: "Magic" },
      { value: "Rare", labelKo: "희귀", labelEn: "Rare" },
    ];

    // 희귀도 색상 매핑
    const rarityColors = {
      Rare: "#FFFF77", // 노란색
      Magic: "#8888FF", // 파란색
      Normal: "#FFFFFF", // 흰색
    };

    // 레벨 타입 옵션
    const levelTypeOptions = [
      { value: "MIN_ILVL", labelKo: "최소 레벨", labelEn: "Min Level" },
      { value: "CAP_ILVL", labelKo: "최대 레벨", labelEn: "Max Level" },
    ];

    return (
      <div className="quick-filter-section" style={{ marginTop: "0" }}>
        <div
          className={`section-header ${
            isBaseItemsExpanded ? "section-header-expanded" : ""
          }`}
          onClick={() => setIsBaseItemsExpanded(!isBaseItemsExpanded)}
        >
          <label
            className="section-checkbox"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={baseItemsSettings.enabled}
              onChange={(e) => {
                e.stopPropagation();
                const newEnabled = e.target.checked;
                setBaseItemsSettings({
                  ...baseItemsSettings,
                  enabled: newEnabled,
                  rules: baseItemsSettings.rules.map((rule) => ({
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
              opacity: baseItemsSettings.enabled ? 1 : 0.5,
            }}
          >
            {lang === "ko" ? "베이스 아이템" : "Base Items"}
          </h3>
          <span className="section-toggle-icon">
            {isBaseItemsExpanded ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>
        {isBaseItemsExpanded && (
          <div className="section-content" style={{ background: "#141414" }}>
            {/* 설명 텍스트 */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                gap: "8px",
                color: "var(--muted)",
                fontSize: "14px",
                padding: "12px 16px 0 16px",
                background: "#141414",
              }}
            >
              <span style={{ lineHeight: "2.2", whiteSpace: "pre-line" }}>
                {lang === "ko"
                  ? "선택된 희귀도 이상으로 표시되며 무기/방어구에 따라서 최소/최대 레벨이 적용됩니다\n예를 들어 활은 최소레벨 75, 최대 레벨 82가 적용됩니다"
                  : "Displays items of the selected rarity or higher Min/Max level applied based on weapon/armor\nFor example, bows have a minimum level of 75 and a maximum level of 82"}
              </span>
            </div>

            {baseItemsSettings.rules.map((rule) => {
              const status = getRuleStatus(rule);
              // 모든 규칙에 전체 이름 표시 (T1 베이스, T2 베이스, T1 퀄리티 등)
              const tierName = lang === "ko" ? rule.nameKo : rule.name;
              const rarityValue = rule.conditions?.rarity?.value || "Rare";
              const levelTypeValue =
                rule.conditions?.levelType?.value || "MIN_ILVL";

              const rarityLabel =
                rarityOptions.find((opt) => opt.value === rarityValue)?.[
                  lang === "ko" ? "labelKo" : "labelEn"
                ] || rarityValue;
              const levelTypeLabel =
                levelTypeOptions.find((opt) => opt.value === levelTypeValue)?.[
                  lang === "ko" ? "labelKo" : "labelEn"
                ] || levelTypeValue;

              const isRarityDropdownOpen =
                baseItemsDropdown.ruleId === rule.id &&
                baseItemsDropdown.type === "rarity";
              const isLevelTypeDropdownOpen =
                baseItemsDropdown.ruleId === rule.id &&
                baseItemsDropdown.type === "levelType";
              const rarityZIndex = isRarityDropdownOpen ? 1001 : 1;
              const levelTypeZIndex = isLevelTypeDropdownOpen ? 1001 : 1;

              return (
                <div
                  key={rule.id}
                  className="filter-rule-item"
                  style={{
                    opacity:
                      baseItemsSettings.enabled && rule.enabled ? 1 : 0.5,
                    filter:
                      baseItemsSettings.enabled && rule.enabled
                        ? "none"
                        : "grayscale(100%)",
                    gap: "0",
                    paddingRight: "16px",
                    position: "relative",
                    zIndex:
                      isRarityDropdownOpen || isLevelTypeDropdownOpen
                        ? 1002
                        : "auto",
                  }}
                >
                  <label
                    className="rule-checkbox"
                    style={{ marginRight: "10px" }}
                  >
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleBaseItemsRule(rule.id)}
                    />
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      gap: "8px",
                      overflow: "visible",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        minWidth: "30px",
                      }}
                    >
                      {tierName}
                    </span>

                    {/* 티어 드롭다운 - jewellery 규칙에만 표시 */}
                    {rule.id === "base_items_jewellery" && (
                      <select
                        value={rule.conditions?.itemTier?.value || "all"}
                        onChange={(e) => {
                          updateBaseItemsRule(rule.id, "conditions.itemTier.value", e.target.value);
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                          background: "#2a2a2a",
                          color: "var(--text-main)",
                          fontSize: "13px",
                          cursor: "pointer",
                          minWidth: "60px",
                        }}
                      >
                        <option value="all">{lang === "ko" ? "전체" : "All"}</option>
                        <option value="T1">T1</option>
                        <option value="T2">T2</option>
                      </select>
                    )}

                    {/* 희귀도 드롭다운 */}
                    <div
                      className="leveling-dropdown-wrapper base-items-dropdown-wrapper"
                      style={{
                        position: "relative",
                        minWidth: "60px",
                        maxWidth: "70px",
                        zIndex: rarityZIndex,
                      }}
                    >
                      <button
                        className="leveling-dropdown-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBaseItemsDropdown((prev) =>
                            prev.ruleId === rule.id && prev.type === "rarity"
                              ? { ruleId: null, type: null }
                              : { ruleId: rule.id, type: "rarity" }
                          );
                        }}
                      >
                        <span style={{ color: rarityColors[rarityValue] }}>
                          {rarityLabel}
                        </span>
                        <span className="dropdown-icon">
                          {baseItemsDropdown.ruleId === rule.id &&
                          baseItemsDropdown.type === "rarity"
                            ? "▲"
                            : "▼"}
                        </span>
                      </button>
                      {baseItemsDropdown.ruleId === rule.id &&
                        baseItemsDropdown.type === "rarity" && (
                          <div className="leveling-dropdown-menu">
                            {rarityOptions.map((opt) => (
                              <button
                                key={opt.value}
                                className={`leveling-dropdown-item ${
                                  rarityValue === opt.value ? "selected" : ""
                                }`}
                                onClick={() => {
                                  updateBaseItemsRule(
                                    rule.id,
                                    "conditions.rarity.value",
                                    opt.value
                                  );
                                  setBaseItemsDropdown({
                                    ruleId: null,
                                    type: null,
                                  });
                                }}
                              >
                                <span
                                  style={{ color: rarityColors[opt.value] }}
                                >
                                  {lang === "ko" ? opt.labelKo : opt.labelEn}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* 레벨 타입 드롭다운 - jewellery 규칙이 아닐 때만 표시 */}
                    {rule.id !== "base_items_jewellery" && (
                    <div
                      className="leveling-dropdown-wrapper base-items-dropdown-wrapper"
                      style={{
                        position: "relative",
                        minWidth: "60px",
                        maxWidth: "70px",
                        zIndex: levelTypeZIndex,
                      }}
                    >
                      <button
                        className="leveling-dropdown-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBaseItemsDropdown((prev) =>
                            prev.ruleId === rule.id && prev.type === "levelType"
                              ? { ruleId: null, type: null }
                              : { ruleId: rule.id, type: "levelType" }
                          );
                        }}
                      >
                        <span>{levelTypeLabel}</span>
                        <span className="dropdown-icon">
                          {baseItemsDropdown.ruleId === rule.id &&
                          baseItemsDropdown.type === "levelType"
                            ? "▲"
                            : "▼"}
                        </span>
                      </button>
                      {baseItemsDropdown.ruleId === rule.id &&
                        baseItemsDropdown.type === "levelType" && (
                          <div className="leveling-dropdown-menu">
                            {levelTypeOptions.map((opt) => (
                              <button
                                key={opt.value}
                                className={`leveling-dropdown-item ${
                                  levelTypeValue === opt.value ? "selected" : ""
                                }`}
                                onClick={() => {
                                  updateBaseItemsRule(
                                    rule.id,
                                    "conditions.levelType.value",
                                    opt.value
                                  );
                                  setBaseItemsDropdown({
                                    ruleId: null,
                                    type: null,
                                  });
                                }}
                              >
                                {lang === "ko" ? opt.labelKo : opt.labelEn}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                    )}

                    {/* 미감정 등급 - jewellery 규칙에만 표시 */}
                    {rule.id === "base_items_jewellery" && (
                      <>
                        <input
                          type="checkbox"
                          checked={!!rule.conditions?.unidentifiedItemTier}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateBaseItemsRule(rule.id, "conditions.unidentifiedItemTier", { operator: ">=", value: 5 });
                            } else {
                              // 조건 삭제
                              const newConditions = { ...rule.conditions };
                              delete newConditions.unidentifiedItemTier;
                              setBaseItemsSettings(prev => ({
                                ...prev,
                                rules: prev.rules.map(r => r.id === rule.id ? { ...r, conditions: newConditions } : r)
                              }));
                            }
                          }}
                          style={{ marginLeft: "8px" }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            color: rule.conditions?.unidentifiedItemTier ? "var(--text-main)" : "var(--muted)",
                            whiteSpace: "nowrap",
                            opacity: rule.conditions?.unidentifiedItemTier ? 1 : 0.5,
                          }}
                        >
                          {lang === "ko" ? "미감정 등급" : "Unidentified Tier"}
                        </span>
                        <select
                          value={rule.conditions?.unidentifiedItemTier?.value || 5}
                          onChange={(e) => {
                            updateBaseItemsRule(rule.id, "conditions.unidentifiedItemTier.value", parseInt(e.target.value, 10));
                          }}
                          disabled={!rule.conditions?.unidentifiedItemTier}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border)",
                            background: "#2a2a2a",
                            color: "var(--text-main)",
                            fontSize: "13px",
                            cursor: rule.conditions?.unidentifiedItemTier ? "pointer" : "not-allowed",
                            marginLeft: "4px",
                            minWidth: "50px",
                            opacity: rule.conditions?.unidentifiedItemTier ? 1 : 0.5,
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </>
                    )}

                    {/* Quality 입력 필드 - quality 규칙에만 표시 */}
                    {rule.id.includes('quality') && (
                      <>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            whiteSpace: "nowrap",
                            marginLeft: "8px",
                          }}
                        >
                          {lang === "ko" ? "퀄리티" : "Quality"}
                        </span>

                        {/* Quality 연산자 드롭다운 */}
                        <select
                          value={rule.conditions?.quality?.operator || '>='}
                          onChange={(e) => {
                            updateBaseItemsRule(
                              rule.id,
                              "conditions.quality.operator",
                              e.target.value
                            );
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border)",
                            background: "#2a2a2a",
                            color: "var(--text-main)",
                            fontSize: "13px",
                            cursor: "pointer",
                            marginLeft: "4px",
                            minWidth: "50px",
                          }}
                        >
                          <option value=">=">≥</option>
                          <option value="==">=</option>
                          <option value="<">&lt;</option>
                        </select>

                        {/* Quality 값 선택 - 24%/28% 드롭다운 */}
                        <select
                          value={rule.conditions?.quality?.value || 24}
                          onChange={(e) => {
                            updateBaseItemsRule(rule.id, "conditions.quality.value", parseInt(e.target.value, 10));
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border)",
                            background: "#2a2a2a",
                            color: "var(--text-main)",
                            fontSize: "13px",
                            cursor: "pointer",
                            marginLeft: "4px",
                            minWidth: "80px",
                          }}
                        >
                          <option value="24">24%</option>
                          <option value="28">28%</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 골드 섹션 렌더링 함수
  const renderGoldSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isGoldExpanded ? "section-header-expanded" : ""
        }`}
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
        <span className="section-toggle-icon">
          {isGoldExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isGoldExpanded && (
        <div className="section-content">
          {/* 골드 규칙들 */}
          {goldSettings.rules.map((rule) => {
            // 지역 레벨 표시: conditions.areaLevel이 있을 때만
            const showAreaLevel = rule.conditions && rule.conditions.areaLevel;

            // 골드 수량 표시: conditions.stackSize가 있을 때만
            const showStackSize = rule.conditions && rule.conditions.stackSize;

            const status = getRuleStatus(rule);

            return (
              <div
                key={rule.id}
                className="filter-rule-item"
                style={{
                  opacity: goldSettings.enabled && rule.enabled ? 1 : 0.5,
                  filter:
                    goldSettings.enabled && rule.enabled
                      ? "none"
                      : "grayscale(100%)",
                  gap: "0",
                  paddingRight: "16px",
                }}
              >
                <label
                  className="rule-checkbox"
                  style={{ marginRight: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleGoldRule(rule.id)}
                  />
                </label>

                {/* 텍스트 기반 정보 표시 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px",
                    overflow: "visible",
                  }}
                >
                  {/* 골드 수량 텍스트 (왼쪽에 먼저 표시) */}
                  {showStackSize && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        minWidth: "fit-content",
                      }}
                    >
                      {(() => {
                        const stackValue = rule.conditions.stackSize.value;
                        const operator =
                          rule.conditions.stackSize.operator || ">=";

                        // 연산자에 따른 텍스트 매핑
                        const operatorText = {
                          ">=": { ko: "이상", en: "+" },
                          ">": { ko: "초과", en: ">" },
                          "<=": { ko: "이하", en: "<=" },
                          "<": { ko: "미만", en: "<" },
                          "==": { ko: "", en: "" },
                          "=": { ko: "", en: "" },
                        };

                        const opKo = operatorText[operator]?.ko ?? "이상";
                        const opEn = operatorText[operator]?.en ?? "+";

                        return lang === "ko"
                          ? `골드 ${stackValue} ${opKo}`
                          : `Gold ${stackValue}${opEn}`;
                      })()}
                    </span>
                  )}

                  {/* 구분자 (둘 다 있을 때만) */}
                  {showAreaLevel && showStackSize && (
                    <span style={{ color: "var(--border)", margin: "0 4px" }}>
                      |
                    </span>
                  )}

                  {/* 지역 레벨 텍스트 (오른쪽에 표시) */}
                  {showAreaLevel && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        minWidth: "fit-content",
                      }}
                    >
                      {(() => {
                        const level = rule.conditions.areaLevel.value;
                        const operator =
                          rule.conditions.areaLevel.operator || ">=";

                        // 연산자에 따른 텍스트 매핑
                        const operatorText = {
                          ">=": { ko: "이상", en: "+" },
                          ">": { ko: "초과", en: ">" },
                          "<=": { ko: "이하", en: "<=" },
                          "<": { ko: "미만", en: "<" },
                          "==": { ko: "", en: "" }, // 같음은 별도 표기 없음
                          "=": { ko: "", en: "" },
                        };

                        const opKo = operatorText[operator]?.ko ?? "이상";
                        const opEn = operatorText[operator]?.en ?? "+";

                        if (level >= 65) {
                          const tier = level - 64;
                          return lang === "ko"
                            ? `경로석 ${tier} 티어 ${opKo}`
                            : `Waystone Tier ${tier}${opEn}`;
                        }
                        return lang === "ko"
                          ? `지역레벨 ${level} ${opKo}`
                          : `Area Level ${level}${opEn}`;
                      })()}
                    </span>
                  )}

                  {/* 조건이 없는 기본 규칙인 경우 */}
                  {!showAreaLevel && !showStackSize && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        minWidth: "fit-content",
                      }}
                    >
                      {rule.nameKo || rule.name}
                    </span>
                  )}

                  {/* 상태 텍스트 (강조/표시/숨김) */}
                  <span
                    style={{
                      fontSize: "14px",
                      color: status.color,
                      marginLeft: "auto",
                      fontWeight: status.fontWeight,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      flexShrink: 0,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <button
                  className="rule-edit-button"
                  onClick={() => {
                    setEditingRuleId(rule.id);
                    setEditingRuleSection("gold");
                    setStyleModalOpen(true);
                  }}
                  style={{
                    opacity: goldSettings.enabled ? 1 : 0.5,
                    cursor: goldSettings.enabled ? "pointer" : "not-allowed",
                    flexShrink: 0,
                  }}
                >
                  수정
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 주얼 섹션 렌더링 함수
  const renderJewelsSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isJewelsExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsJewelsExpanded(!isJewelsExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={jewelsSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setJewelsSettings({
                ...jewelsSettings,
                enabled: newEnabled,
                rules: jewelsSettings.rules.map((rule) => ({
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
            opacity: jewelsSettings.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "주얼" : "Jewels"}
        </h3>
        <span className="section-toggle-icon">
          {isJewelsExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isJewelsExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {jewelsSettings.rules.map((rule) => {
            const status = getRuleStatus(rule);

            return (
              <div
                key={rule.id}
                className="filter-rule-item"
                style={{
                  opacity: jewelsSettings.enabled && rule.enabled ? 1 : 0.5,
                  filter:
                    jewelsSettings.enabled && rule.enabled
                      ? "none"
                      : "grayscale(100%)",
                  gap: "0",
                  paddingRight: "16px",
                }}
              >
                <label
                  className="rule-checkbox"
                  style={{ marginRight: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleJewelsRule(rule.id)}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rule.nameKo || rule.name}
                  </span>

                  <span
                    style={{
                      fontSize: "14px",
                      color: status.color,
                      marginLeft: "auto",
                      fontWeight: status.fontWeight,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      flexShrink: 0,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <button
                  className="rule-edit-button"
                  onClick={() => {
                    setEditingRuleId(rule.id);
                    setEditingRuleSection("jewels");
                    setStyleModalOpen(true);
                  }}
                  style={{
                    opacity: jewelsSettings.enabled ? 1 : 0.5,
                    cursor: jewelsSettings.enabled ? "pointer" : "not-allowed",
                    marginLeft: "auto",
                  }}
                >
                  수정
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 금고실 열쇠 섹션 렌더링 함수
  const renderVaultKeysSection = () => {
    const tierColors = {
      S: "var(--tier-s)",
      A: "var(--tier-a)",
      B: "var(--tier-b)",
      C: "var(--tier-c)",
      D: "var(--tier-d)",
    };
    const tierOrder = ["S", "A", "B", "C", "D"];

    return (
      <div className="quick-filter-section" style={{ marginTop: "0" }}>
        <div
          className={`section-header ${
            isVaultKeysExpanded ? "section-header-expanded" : ""
          }`}
          onClick={() => setIsVaultKeysExpanded(!isVaultKeysExpanded)}
        >
          <label
            className="section-checkbox"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={vaultKeysSettings.enabled}
              onChange={(e) => {
                e.stopPropagation();
                setVaultKeysSettings({
                  ...vaultKeysSettings,
                  enabled: e.target.checked,
                });
              }}
            />
          </label>
          <h3
            className="section-title"
            style={{
              opacity: vaultKeysSettings.enabled ? 1 : 0.5,
            }}
          >
            {lang === "ko" ? "금고실 열쇠" : "Vault Keys"}
          </h3>
          <span className="section-toggle-icon">
            {isVaultKeysExpanded ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>
        {isVaultKeysExpanded && (
          <div className="section-content" style={{ background: "#141414" }}>
            {/* 티어 선택 버튼들 */}
            <div className="currency-tier-selection">
              <div
                style={{
                  padding: "16px 32px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ color: "var(--color-gray-300)", fontSize: "14px" }}
                >
                  {lang === "ko"
                    ? "금고실 열쇠는 몇 티어까지 보고 싶나요?"
                    : "How many vault key tiers do you want to see?"}
                </span>
                <span
                  style={{ color: "var(--color-gray-300)", fontSize: "14px" }}
                >
                  {vaultKeysSettings.minTier === "S"
                    ? lang === "ko"
                      ? "S 티어만 표시"
                      : "S tier only"
                    : `${vaultKeysSettings.minTier} ${
                        lang === "ko" ? "티어 이상 표시" : "tier or higher"
                      }`}
                </span>
              </div>
              <div
                style={{
                  padding: "0 32px 16px 32px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "nowrap",
                }}
              >
                {tierOrder.map((tier) => {
                  const tierIndex = tierOrder.indexOf(tier);
                  const minTierIndex = tierOrder.indexOf(
                    vaultKeysSettings.minTier || "D"
                  );
                  const isIncluded = tierIndex <= minTierIndex;
                  const isSelected =
                    tier === (vaultKeysSettings.minTier || "D");

                  let backgroundColor;
                  let borderColor;
                  let largeTextColor;

                  if (isIncluded) {
                    backgroundColor = tierColors[tier];
                    borderColor = isSelected ? "#ffffff" : tierColors[tier];
                    if (tier === "C" || tier === "D") {
                      largeTextColor = "#000000";
                    } else {
                      largeTextColor = "#ffffff";
                    }
                  } else {
                    backgroundColor = tierColors[tier];
                    borderColor = "rgba(0, 0, 0, 0.6)";
                    if (tier === "C" || tier === "D") {
                      largeTextColor = "#000000";
                    } else {
                      largeTextColor = "#ffffff";
                    }
                  }

                  const boxShadow =
                    isIncluded && !isSelected
                      ? `0 0 8px ${tierColors[tier]}40`
                      : isSelected
                      ? `0 0 12px ${tierColors[tier]}60`
                      : "none";

                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        if (!vaultKeysSettings.enabled) return;
                        setVaultKeysSettings({
                          ...vaultKeysSettings,
                          minTier: tier,
                        });
                      }}
                      disabled={!vaultKeysSettings.enabled}
                      className={`currency-tier-button ${
                        isIncluded
                          ? "currency-tier-active"
                          : "currency-tier-inactive"
                      }`}
                      data-included={isIncluded}
                      style={{
                        flex: "1",
                        minWidth: "0",
                        maxWidth: "120px",
                        height: "50px",
                        border: `2px solid ${borderColor}`,
                        background: backgroundColor,
                        cursor: vaultKeysSettings.enabled
                          ? "pointer"
                          : "not-allowed",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        position: "relative",
                        transition: "all 0.2s",
                        boxShadow: boxShadow,
                        overflow: "hidden",
                      }}
                    >
                      {!isIncluded && (
                        <div
                          className="currency-tier-overlay"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.6)",
                            pointerEvents: "none",
                            zIndex: 3,
                          }}
                        />
                      )}
                      {isSelected && (
                        <div
                          className="currency-tier-checkbox"
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            width: "18px",
                            height: "18px",
                            zIndex: 20,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "default",
                              margin: 0,
                              padding: 0,
                            }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: largeTextColor,
                          opacity: 1,
                        }}
                      >
                        {tier}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 아이콘 정보 안내 */}
              <div
                style={{
                  padding: "0 32px 16px 32px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  color: "var(--muted)",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontSize: "16px" }}>💡</span>
                <span style={{ lineHeight: "1.6" }}>
                  {lang === "ko" ? (
                    <>
                      선택한 티어 이상의 금고실 열쇠만 표시됩니다.
                      <br />
                      자세한 아이템 목록과 아이콘은{" "}
                      <strong>화폐 티어 리스트</strong> 페이지에서 확인할 수
                      있습니다.
                    </>
                  ) : (
                    <>
                      Only vault keys of the selected tier or higher are
                      displayed.
                      <br />
                      Detailed item list and icons can be found in the{" "}
                      <strong>Currency Tier List</strong> page.
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 호신부 섹션 렌더링 함수
  const renderCharmsSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isCharmsExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsCharmsExpanded(!isCharmsExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={charmsSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setCharmsSettings({
                ...charmsSettings,
                enabled: newEnabled,
                rules: charmsSettings.rules.map((rule) => ({
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
            opacity: charmsSettings.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "호신부" : "Charms"}
        </h3>
        <span className="section-toggle-icon">
          {isCharmsExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isCharmsExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {charmsSettings.rules.map((rule) => {
            const status = getRuleStatus(rule);

            return (
              <div
                key={rule.id}
                className="filter-rule-item"
                style={{
                  opacity: charmsSettings.enabled && rule.enabled ? 1 : 0.5,
                  filter:
                    charmsSettings.enabled && rule.enabled
                      ? "none"
                      : "grayscale(100%)",
                  gap: "0",
                  paddingRight: "16px",
                }}
              >
                <label
                  className="rule-checkbox"
                  style={{ marginRight: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleCharmsRule(rule.id)}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rule.nameKo || rule.name}
                  </span>

                  <span
                    style={{
                      fontSize: "14px",
                      color: status.color,
                      marginLeft: "auto",
                      fontWeight: status.fontWeight,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      flexShrink: 0,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <button
                  className="rule-edit-button"
                  onClick={() => {
                    setEditingRuleId(rule.id);
                    setEditingRuleSection("charms");
                    setStyleModalOpen(true);
                  }}
                  style={{
                    opacity: charmsSettings.enabled ? 1 : 0.5,
                    cursor: charmsSettings.enabled
                      ? "pointer"
                      : "not-allowed",
                    marginLeft: "auto",
                  }}
                >
                  수정
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 기타 섹션 렌더링 함수
  const renderOthersSection = () => (
    <div className="quick-filter-section" style={{ marginTop: "0" }}>
      <div
        className={`section-header ${
          isOthersExpanded ? "section-header-expanded" : ""
        }`}
        onClick={() => setIsOthersExpanded(!isOthersExpanded)}
      >
        <label
          className="section-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={othersSettings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              const newEnabled = e.target.checked;
              setOthersSettings({
                ...othersSettings,
                enabled: newEnabled,
                rules: othersSettings.rules.map((rule) => ({
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
            opacity: othersSettings.enabled ? 1 : 0.5,
          }}
        >
          {lang === "ko" ? "기타" : "Others"}
        </h3>
        <span className="section-toggle-icon">
          {isOthersExpanded ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isOthersExpanded && (
        <div className="section-content" style={{ background: "#141414" }}>
          {othersSettings.rules.map((rule) => {
            const status = getRuleStatus(rule);

            return (
              <div
                key={rule.id}
                className="filter-rule-item"
                style={{
                  opacity: othersSettings.enabled && rule.enabled ? 1 : 0.5,
                  filter:
                    othersSettings.enabled && rule.enabled
                      ? "none"
                      : "grayscale(100%)",
                  gap: "10px",
                  paddingRight: "16px",
                }}
              >
                <label className="rule-checkbox">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleOthersRule(rule.id)}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rule.nameKo || rule.name}
                  </span>

                  <span
                    style={{
                      fontSize: "14px",
                      color: status.color,
                      marginLeft: "auto",
                      fontWeight: status.fontWeight,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      flexShrink: 0,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <button
                  className="rule-edit-button"
                  onClick={() => {
                    setEditingRuleId(rule.id);
                    setEditingRuleSection("others");
                    setStyleModalOpen(true);
                  }}
                  style={{
                    opacity: othersSettings.enabled ? 1 : 0.5,
                    cursor: othersSettings.enabled ? "pointer" : "not-allowed",
                    marginLeft: "auto",
                  }}
                >
                  수정
                </button>
              </div>
            );
          })}
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
                if (section.id === "class-selection") {
                  return (
                    <div key={section.id}>{renderClassSelectionSection()}</div>
                  );
                } else if (section.id === "league-start") {
                  return (
                    <div key={section.id}>{renderLeagueStartSection()}</div>
                  );
                } else if (section.id === "gold") {
                  return <div key={section.id}>{renderGoldSection()}</div>;
                } else if (section.id === "currency") {
                  return <div key={section.id}>{renderCurrencySection()}</div>;
                } else if (section.id === "uniques") {
                  return <div key={section.id}>{renderUniquesSection()}</div>;
                } else if (section.id === "uncut_gems") {
                  return <div key={section.id}>{renderUncutGemsSection()}</div>;
                } else if (section.id === "base_items") {
                  return <div key={section.id}>{renderBaseItemsSection()}</div>;
                } else if (section.id === "jewels") {
                  return <div key={section.id}>{renderJewelsSection()}</div>;
                } else if (section.id === "charms") {
                  return <div key={section.id}>{renderCharmsSection()}</div>;
                } else if (section.id === "others") {
                  return <div key={section.id}>{renderOthersSection()}</div>;
                }
                return null;
              })}
            </div>

            {/* 오른쪽 열 */}
            <div className="quick-filters-column">
              {rightColumnSections.map((section) => {
                if (section.id === "base_items") {
                  return <div key={section.id}>{renderBaseItemsSection()}</div>;
                }
                if (section.id === "jewels") {
                  return <div key={section.id}>{renderJewelsSection()}</div>;
                }
                if (section.id === "gold") {
                  return <div key={section.id}>{renderGoldSection()}</div>;
                }
                if (section.id === "currency") {
                  return <div key={section.id}>{renderCurrencySection()}</div>;
                }
                if (section.id === "uniques") {
                  return <div key={section.id}>{renderUniquesSection()}</div>;
                }
                if (section.id === "class-selection") {
                  return (
                    <div key={section.id}>{renderLevelingClassSelection()}</div>
                  );
                }
                if (section.id === "league-start") {
                  return (
                    <div key={section.id}>{renderLeagueStartSection()}</div>
                  );
                }
                if (section.id === "vaultKeys") {
                  return <div key={section.id}>{renderVaultKeysSection()}</div>;
                }
                if (section.id === "charms") {
                  return <div key={section.id}>{renderCharmsSection()}</div>;
                }
                if (section.id === "others") {
                  return <div key={section.id}>{renderOthersSection()}</div>;
                }
                return null;
              })}
            </div>
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
        showSaveAsDefaultDropdown={false}
        showSaveAsLeagueDefault={false}
        onLoadFromStorage={() => {
          const saved = localStorage.getItem("quickFilter_gold");
          if (saved) {
            setGoldSettings(JSON.parse(saved));
            alert(lang === "ko" ? "설정을 불러왔습니다!" : "Settings loaded!");
          } else {
            alert(
              lang === "ko"
                ? "저장된 설정이 없습니다."
                : "No saved settings found."
            );
          }
        }}
      />

      {/* 스타일 설정 모달 */}
      {styleModalOpen &&
        editingRuleId &&
        editingRuleSection &&
        (() => {
          // 금고실 열쇠는 티어 기반 구조이므로 별도 처리
          let editingRule = null;
          if (editingRuleSection === "vaultKeys") {
            const tierMatch = editingRuleId?.match(/^vaultKeys_([SABCD])$/);
            if (tierMatch) {
              const tier = tierMatch[1];
              const tierData = vaultKeysSettings.tiers?.[tier] || {};
              editingRule = {
                id: editingRuleId,
                name: `Vault Keys ${tier} Tier`,
                nameKo: `금고실 열쇠 ${tier} 티어`,
                type: "show",
                styles: tierData.styles || {},
                conditions: {},
                enabled: tierData.enabled !== false,
              };
            }
          } else {
            editingRule =
              editingRuleSection === "gold"
                ? goldSettings.rules.find((r) => r.id === editingRuleId)
                : editingRuleSection === "currency"
                ? currencySettings.rules.find((r) => r.id === editingRuleId)
                : editingRuleSection === "jewels"
                ? jewelsSettings.rules.find((r) => r.id === editingRuleId)
              : editingRuleSection === "leveling"
                ? levelingSettings.rules.find((r) => r.id === editingRuleId)
                : editingRuleSection === "uncut_gems"
                ? uncutGemsSettings.rules.find((r) => r.id === editingRuleId)
                : editingRuleSection === "others"
                ? othersSettings.rules.find((r) => r.id === editingRuleId)
                : editingRuleSection === "charms"
                ? charmsSettings.rules.find((r) => r.id === editingRuleId)
                : uniquesSettings.rules.find((r) => r.id === editingRuleId);
          }
          if (!editingRule) return null;

          // styles를 JSON.stringify로 직렬화하여 변경 감지
          const stylesKey = JSON.stringify(editingRule.styles || {});

          // 프리셋 기본값 가져오기
          const presetId = getActivePresetId();
          const baseline = getQuickFilterBaseline(presetId);

          // 현재 편집 중인 규칙의 프리셋 기본값 찾기
          const getPresetDefaultRule = () => {
            if (!editingRuleId || !editingRuleSection) return null;

            let defaultRules = [];
            switch (editingRuleSection) {
              case "gold":
                defaultRules = quickFilterDefaults.gold?.rules || [];
                break;
              case "jewels":
                defaultRules = quickFilterDefaults.jewels?.rules || [];
                break;
              case "leveling":
                defaultRules = quickFilterDefaults.leveling?.rules || [];
                break;
              case "uniques":
                defaultRules = quickFilterDefaults.uniques?.rules || [];
                break;
              case "currency":
                defaultRules = quickFilterDefaults.currency?.rules || [];
                break;
              case "uncut_gems":
                defaultRules = quickFilterDefaults.uncut_gems?.rules || [];
                break;
              case "others":
                defaultRules = quickFilterDefaults.others?.rules || [];
                break;
              case "charms":
                defaultRules = quickFilterDefaults.charms?.rules || [];
                break;
              case "vaultKeys":
                // 금고실 열쇠는 티어 구조
                const tierMatch = editingRuleId?.match(/^vaultKeys_([SABCD])$/);
                if (tierMatch) {
                  const tier = tierMatch[1];
                  return quickFilterDefaults.vaultKeys?.tiers?.[tier] || null;
                }
                return null;
              default:
                return null;
            }

            return defaultRules.find((r) => r.id === editingRuleId) || null;
          };

          const presetDefaultRule = getPresetDefaultRule();

          // itemClass 추출 (미가공 젬 조건용)
          const itemClass = editingRule.conditions?.class?.value || null;
          
          // editingRule.conditions가 없거나 corrupted/baseTypes가 없으면 기본 규칙에서 가져와서 병합
          // gold_default 규칙은 조건 없이 catch-all 역할만 하므로 빈 조건 반환
          const mergedConditions = (() => {
            // gold_default 규칙은 조건 설정 UI 숨김 (catch-all fallback 규칙)
            if (editingRuleId === "gold_default") {
              return {};
            }
            
            const editingConds = editingRule.conditions || {};
            const defaultConds = presetDefaultRule?.conditions || {};
            
            // 기본 조건에서 누락된 조건들만 병합
            const result = { ...editingConds };
            
            // chance_base 규칙이거나 기본 조건에 corrupted가 있으면 추가
            if (defaultConds.corrupted !== undefined && result.corrupted === undefined) {
              result.corrupted = defaultConds.corrupted;
            }
            if (defaultConds.baseTypes !== undefined && result.baseTypes === undefined) {
              result.baseTypes = defaultConds.baseTypes;
            }
            if (defaultConds.rarity !== undefined && result.rarity === undefined) {
              result.rarity = defaultConds.rarity;
            }
            
            return result;
          })();

          return (
            <StyleSettingsModal
              key={editingRuleId} // stylesKey 제거: 스타일 변경 시 모달이 리마운트되어 콜백이 중단되는 문제 방지
              isOpen={styleModalOpen}
              onClose={() => {
                setStyleModalOpen(false);
                setEditingRuleId(null);
                setEditingRuleSection(null);
              }}
              styles={editingRule.styles || {}}
              conditions={mergedConditions}
              presetDefaults={presetDefaultRule}
              itemClass={itemClass}
              hideConditions={editingRuleId === "gold_default"}

              onConditionsChange={(newConditions) => {
                // 조건 변경 콜백
                const ruleId = editingRuleId;
                const section = editingRuleSection;
                
                if (section === "others") {
                  setOthersSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "gold") {
                  setGoldSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "jewels") {
                  setJewelsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "leveling") {
                  setLevelingSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "uncut_gems") {
                  setUncutGemsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "uniques") {
                  setUniquesSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "currency") {
                  setCurrencySettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                } else if (section === "charms") {
                  setCharmsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, conditions: newConditions } : rule
                    ),
                  }));
                }
              }}
              onChange={(newStyles) => {
                // 함수형 업데이트 패턴 사용: stale closure 방지
                // editingRuleId와 editingRuleSection은 이 시점에 유효함 (IIFE 내부)
                const ruleId = editingRuleId; // 현재 값 캡처
                const section = editingRuleSection; // 현재 값 캡처

                if (section === "vaultKeys") {
                  // 금고실 열쇠는 티어 기반 구조
                  const tierMatch = ruleId?.match(/^vaultKeys_([SABCD])$/);
                  if (tierMatch) {
                    const tier = tierMatch[1];
                    setVaultKeysSettings((prev) => ({
                      ...prev,
                      tiers: {
                        ...prev.tiers,
                        [tier]: {
                          ...prev.tiers[tier],
                          styles: newStyles,
                        },
                      },
                    }));
                  }
                } else if (section === "gold") {
                  setGoldSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "currency") {
                  setCurrencySettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "uniques") {
                  setUniquesSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "jewels") {
                  setJewelsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "leveling") {
                  setLevelingSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "uncut_gems") {
                  setUncutGemsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "others") {
                  setOthersSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                } else if (section === "charms") {
                  setCharmsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, styles: newStyles } : rule
                    ),
                  }));
                }
              }}
              itemName={
                editingRuleSection === "gold"
                  ? "Gold"
                  : editingRuleSection === "currency"
                  ? "Currency"
                  : editingRuleSection === "jewels"
                  ? "Jewels"
                  : editingRuleSection === "vaultKeys"
                  ? "Vault Keys"
                  : editingRuleSection === "uncut_gems"
                  ? "Uncut Gems"
                  : editingRuleSection === "others"
                  ? "Others"
                  : editingRuleSection === "charms"
                  ? "Charms"
                  : editingRuleSection === "leveling"
                  ? "Leveling"
                  : "Unique"
              }
              baseType={
                editingRuleSection === "gold"
                  ? "Gold"
                  : editingRuleSection === "leveling"
                  ? "Leveling Item"
                  : editingRuleSection === "currency"
                  ? "Currency"
                  : editingRuleSection === "jewels"
                  ? "Jewels"
                  : editingRuleSection === "vaultKeys"
                  ? "Vault Keys"
                  : editingRuleSection === "uncut_gems"
                  ? "Uncut Gems"
                  : editingRuleSection === "others"
                  ? "Others"
                  : editingRuleSection === "charms"
                  ? "Charms"
                  : "Unique"
              }
              title={editingRule.nameKo || editingRule.name}
              onTitleChange={(newTitle) => {
                // 함수형 업데이트 패턴 사용: stale closure 방지
                const ruleId = editingRuleId;
                const section = editingRuleSection;

                if (section === "gold") {
                  setGoldSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "currency") {
                  setCurrencySettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "uniques") {
                  setUniquesSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "jewels") {
                  setJewelsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "uncut_gems") {
                  setUncutGemsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "others") {
                  setOthersSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                } else if (section === "charms") {
                  setCharmsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, nameKo: newTitle, name: newTitle }
                        : rule
                    ),
                  }));
                }
              }}
              enabled={editingRule.enabled !== false}
              onEnabledChange={(newEnabled) => {
                // 함수형 업데이트 패턴 사용: stale closure 방지
                const ruleId = editingRuleId;
                const section = editingRuleSection;

                if (section === "gold") {
                  setGoldSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "currency") {
                  setCurrencySettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "uniques") {
                  setUniquesSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "jewels") {
                  setJewelsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "uncut_gems") {
                  setUncutGemsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "others") {
                  setOthersSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                } else if (section === "charms") {
                  setCharmsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId
                        ? { ...rule, enabled: newEnabled }
                        : rule
                    ),
                  }));
                }
              }}
              ruleType={editingRule.type || "show"}
              onRuleTypeChange={(newType) => {
                // 함수형 업데이트 패턴 사용: stale closure 방지
                const ruleId = editingRuleId;
                const section = editingRuleSection;

                if (section === "gold") {
                  setGoldSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "currency") {
                  setCurrencySettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "uniques") {
                  setUniquesSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "jewels") {
                  setJewelsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "uncut_gems") {
                  setUncutGemsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "others") {
                  setOthersSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                } else if (section === "charms") {
                  setCharmsSettings((prev) => ({
                    ...prev,
                    rules: prev.rules.map((rule) =>
                      rule.id === ruleId ? { ...rule, type: newType } : rule
                    ),
                  }));
                }
              }}
              additionalRules={[]}
              onRulesChange={() => {}}
            />
          );
        })()}

      <style jsx>{`
        .card {
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .cardBody {
          background: transparent;
          padding: 0;
        }

        .quick-filters-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
          background: var(--foreground);
        }

        @media (max-width: 1200px) {
          .quick-filters-layout {
            grid-template-columns: 1fr;
          }
        }

        .quick-filters-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          gap: 8px;
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
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          margin: 0 4px !important;
        }

        .leveling-dropdowns-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 0 !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 16px !important;
          flex-wrap: nowrap !important;
          background: #141414 !important;
          box-sizing: border-box !important;
        }

        .leveling-dropdown-row-item {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
          gap: 0 !important;
          margin: 0 !important;
          min-width: 0 !important;
        }

        .leveling-dropdown-row-item .leveling-dropdown-label {
          margin-bottom: 0 !important;
          white-space: nowrap !important;
          text-align: left !important;
        }

        .leveling-dropdown-row-item .leveling-dropdown-wrapper {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          margin: 0 4px !important;
        }

        .leveling-dropdown-row-item .leveling-armour-dropdown-wrapper,
        .leveling-armour-dropdown-wrapper {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
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
          margin: 0 !important;
          padding: 16px !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
          background: #141414 !important;
        }

        .leveling-dropdowns-row .leveling-reset-button {
          margin-left: 8px !important;
        }

        .leveling-dropdown-wrapper {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          width: 106px !important;
          min-width: 106px !important;
          max-width: 106px !important;
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
          height: 38px !important;
          padding: 0 10px !important;
          background: #0a0a0a !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          box-sizing: border-box !important;
          text-align: center !important;
          color-scheme: dark;
        }

        select.leveling-dropdown-button {
          background-color: #0a0a0a !important;
          color: var(--text) !important;
          border: 1px solid var(--border) !important;
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
          background: #0a0a0a !important;
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
          background: #3e63dd !important;
          background-color: #3e63dd !important;
          color: #ffffff !important;
          color: rgb(255, 255, 255) !important;
        }

        /* 아이템 희귀도 */
        .leveling-rarity-section {
          display: flex !important;
          flex-direction: row !important;
          gap: 16px !important;
          align-items: center !important;
          justify-content: flex-start !important;
          flex-wrap: wrap !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 16px 16px 0 16px !important;
          background: #141414 !important;
          box-sizing: border-box !important;
        }

        .leveling-rarity-title {
          font-size: 14px;
          font-weight: 400;
          color: var(--text);
        }

        .leveling-reset-button {
          height: 38px !important;
          width: 78px !important;
          padding: 0 10px !important;
          background: #0a0a0a !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          border-radius: 0 !important;
          margin-left: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        }

        .leveling-reset-button:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--border) !important;
          color: var(--text) !important;
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
          background: #3e63dd !important;
          background-color: #3e63dd !important;
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
          background: #3e63dd !important;
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
          margin-bottom: 8px;
          display: flex;
          flex-direction: column;
        }

        /* section-header 스타일은 globals.css에서 관리 */
        /* 로컬 스타일은 globals.css를 보완하는 용도로만 사용 */

        .quick-filter-section {
          margin-bottom: 8px;
        }

        /* section-header 관련 스타일은 globals.css에서 관리 */

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0;
          margin: 0;
          background: #141414;
          border: none;
          border-top: none;
        }

        .section-content .leveling-rarity-section {
          display: flex !important;
          flex-direction: row !important;
          gap: 16px !important;
          align-items: center !important;
          justify-content: flex-start !important;
          flex-wrap: wrap !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 16px 16px 0 16px !important;
          background: #141414 !important;
          box-sizing: border-box !important;
        }

        .filter-rule-item {
          display: flex !important;
          align-items: center;
          gap: 10px;
          padding: 2px 16px 2px 32px;
          min-height: 46px !important;
          height: 46px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          position: relative;
          background: #141414 !important;
        }

        .filter-rule-item::after {
          display: none !important;
        }

        .filter-rule-item:last-child {
          border-bottom: none !important;
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
          padding: 0;
          width: 42px;
          height: 26px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--color-gray-500);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
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

        .currency-tier-button {
        }

        .currency-tier-button:hover:not(:disabled) {
          opacity: 0.8 !important;
        }

        .currency-tier-button:disabled {
          opacity: 0.3;
        }

        .currency-tier-button.currency-tier-inactive::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6) !important;
          pointer-events: none;
          z-index: 3;
          border-radius: 0;
        }

        .currency-tier-button.currency-tier-active::before {
          display: none !important;
        }

        .currency-tier-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6) !important;
          pointer-events: none;
          z-index: 3;
        }

        .currency-tier-button > * {
          position: relative;
          z-index: 4;
        }

        .currency-tier-checkbox {
          position: absolute;
          z-index: 20 !important;
        }

        .currency-tier-checkbox input[type="checkbox"] {
          position: relative;
          z-index: 1;
        }

        /* 모바일 반응형 (768px 이하) */
        @media (max-width: 768px) {
          .quick-filters-layout {
            gap: 16px;
          }

          .column-header {
            padding: 6px 10px;
          }

          .column-header .column-title {
            font-size: 14px;
          }

          .section-header {
            padding: 10px 12px !important;
          }

          .section-content {
            padding: 12px !important;
          }

          .leveling-dropdowns-row {
            flex-wrap: wrap !important;
            padding: 12px !important;
          }

          .section-content .leveling-dropdowns-row {
            flex-wrap: wrap !important;
            padding: 12px !important;
          }

          .leveling-dropdown-wrapper {
            width: 90px !important;
            min-width: 90px !important;
            max-width: 90px !important;
            margin: 2px !important;
          }

          .leveling-dropdown-button {
            padding: 6px 8px !important;
            font-size: 12px !important;
          }

          .currency-tier-selection {
            flex-wrap: wrap;
            gap: 6px !important;
          }

          .currency-tier-button {
            min-width: 50px !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
          }
        }

        /* 소형 모바일 (480px 이하) */
        @media (max-width: 480px) {
          .leveling-dropdown-wrapper {
            width: 80px !important;
            min-width: 80px !important;
            max-width: 80px !important;
          }

          .leveling-dropdown-button {
            padding: 5px 6px !important;
            font-size: 11px !important;
          }

          .currency-tier-button {
            min-width: 44px !important;
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
        }

        /* 베이스 아이템 드롭다운 option 배경색 */
        .leveling-dropdown-button option {
          background-color: #1a1a1a;
          color: #ffffff;
        }
      `}</style>
    </main>
  );
}
