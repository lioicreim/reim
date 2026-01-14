"use client";

import { useState, useEffect, useRef } from "react";
import ColorPicker from "./ColorPicker";
import ItemPreviewBox from "./ItemPreviewBox";
import OperatorSlider from "./OperatorSlider";
import NotificationModal from "./NotificationModal";
import filterConditions from "@/data/filter-conditions.json";

/**
 * 스타일 설정 모달 컴포넌트
 * 폰트 크기, 색상, 빛기둥, 미니맵 아이콘 등을 설정할 수 있는 팝업
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 콜백
 * @param {Object} props.styles - 현재 스타일 설정
 * @param {Function} props.onChange - 스타일 변경 콜백
 * @param {string} props.itemName - 프리뷰에 표시할 아이템 이름
 * @param {boolean} props.isGear - 베이스 아이템 편집 여부 (규칙 추가 기능 활성화)
 * @param {string} props.baseType - BaseType (예: "Gold") - 골드인 경우 StackSize, AreaLevel 추가 가능
 * @param {Array} props.additionalRules - 추가된 규칙들
 * @param {Function} props.onRulesChange - 규칙 변경 콜백
 * @param {string} props.title - 규칙 제목 (편집 가능)
 * @param {Function} props.onTitleChange - 제목 변경 콜백
 * @param {Object} props.conditions - 조건들 (StackSize, AreaLevel 등)
 * @param {Function} props.onConditionsChange - 조건 변경 콜백
 * @param {string} props.ruleType - 규칙 타입: "show" 또는 "hide" (기본값: "show")
 * @param {Function} props.onRuleTypeChange - 규칙 타입 변경 콜백
 */
// 경로석 티어와 지역 레벨 매핑
const pathTierToAreaLevel = {
  1: 65, 2: 66, 3: 67, 4: 68, 5: 69,
  6: 70, 7: 71, 8: 72, 9: 73, 10: 74,
  11: 75, 12: 76, 13: 77, 14: 78, 15: 79, 16: 80
};

// 지역 레벨을 경로석 티어로 변환
const areaLevelToPathTier = (areaLevel) => {
  const tier = Object.keys(pathTierToAreaLevel).find(
    t => pathTierToAreaLevel[t] === areaLevel
  );
  return tier ? parseInt(tier) : null;
};

// 경로석 티어 표시 텍스트 생성
const getPathTierDisplay = (areaLevel, lang = "ko") => {
  const tier = areaLevelToPathTier(areaLevel);
  if (tier) {
    return lang === "ko" ? `T${tier} 경로석` : `T${tier} Path`;
  }
  return areaLevel.toString();
};

export default function StyleSettingsModal({
  isOpen = false,
  onClose,
  styles = {},
  onChange,
  itemName = "Item",
  isGear = false,
  baseType = null,
  additionalRules = [],
  onRulesChange,
  title = "",
  onTitleChange,
  conditions = {},
  onConditionsChange,
  ruleType = "show",
  onRuleTypeChange = null,
  enabled = true,
  onEnabledChange = null
}) {
  // 인게임 기본값 상수
  const DEFAULT_TEXT_COLOR = { r: 171, g: 159, b: 130, a: 255 }; // #ab9f82
  const DEFAULT_BORDER_COLOR = { r: 10, g: 13, b: 17, a: 255 }; // #0a0d11
  
  // PC/PS5 사운드 매핑 테이블 (1:1 대응)
  const PC_TO_PS5_SOUND_MAP = {
    "custom_sound/1_currency_s.mp3": 5,
    "custom_sound/2_currency_a.mp3": 1,
    "custom_sound/3_currency_b.mp3": 2,
    "custom_sound/4_currency_c.mp3": 2,
  };
  
  const PS5_TO_PC_SOUND_MAP = {
    5: "custom_sound/1_currency_s.mp3",
    1: "custom_sound/2_currency_a.mp3",
    2: "custom_sound/3_currency_b.mp3", // B, C 모두 slot 2
  };
  
  /* -------------------------------
   * quality input ref
   * ------------------------------- */
  const qualityInputRef = useRef(null);

  const [localStyles, setLocalStyles] = useState(() => {
    // styles가 null 값을 덮어씌우는 것을 방지하기 위해 기본값 보장
    return {
      fontSize: 30,
      textColor: DEFAULT_TEXT_COLOR,
      borderColor: null,
      backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
      playEffect: null,
      minimapIcon: {
        size: null,
        color: null,
        shape: null
      },
      customSound: null,
      ps5Sound: null,
      ps5SoundVolume: 300, // 기본값 300
      soundPlatform: null,
      soundType: "default",
      ...styles,
      // null 값이 덮어씌워지지 않도록 기본값 보장 (체크 해제 상태 유지) - ?? 사용
      textColor: styles.textColor ?? DEFAULT_TEXT_COLOR,
      borderColor: styles.borderColor ?? null,
      backgroundColor: styles.backgroundColor ?? { r: 0, g: 0, b: 0, a: 255 },
      // soundType과 soundPlatform 설정
      soundPlatform: styles.soundPlatform ?? (styles.customSound ? "PC" : null),
      soundType: styles.soundPlatform === "PS5" ? "default" : (styles.channel ? "default" : (styles.soundType || (styles.customSound ? "custom" : "default")))
    };
  });

  const [localRules, setLocalRules] = useState(additionalRules || []);
  const [showRuleDropdown, setShowRuleDropdown] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localConditions, setLocalConditions] = useState(conditions || {});
  const [areaLevelInputMode, setAreaLevelInputMode] = useState(false);
  const [lang, setLang] = useState("ko");
  const [localRuleType, setLocalRuleType] = useState(ruleType || "show");
  
  // 초기 스타일 저장 (모달 열 때의 값)
  const [initialStyles, setInitialStyles] = useState(null);
  const [initialTitle, setInitialTitle] = useState("");
  const [initialConditionsSnapshot, setInitialConditionsSnapshot] = useState({});
  const [initialRulesSnapshot, setInitialRulesSnapshot] = useState([]);
  const [initialRuleTypeSnapshot, setInitialRuleTypeSnapshot] = useState("show");
  const [initialEnabledSnapshot, setInitialEnabledSnapshot] = useState(true);
  
  // 붙여넣기 프리뷰 상태
  const [pastePreview, setPastePreview] = useState(null);
  
  // 알림 모달 상태
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });

  // 이전 isOpen 상태 추적 (무한 루프 방지)
  const prevIsOpenRef = useRef(false);
  
  // 모달 ref (컬러피커 위치 계산용)
  const modalContentRef = useRef(null);

  // 언어 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, []);

  // 모달이 열릴 때만 초기화 (무한 루프 방지)
  useEffect(() => {
    // 모달이 닫혔다가 열릴 때만 초기화
    if (isOpen && !prevIsOpenRef.current) {
      // 초기 스타일 저장 (모달 열 때의 값)
      const initial = {
        fontSize: styles.fontSize ?? 30,
        // null 값(체크 해제)을 보존하기 위해 ?? 사용. undefined일 때만 기본값 적용.
        textColor: styles.textColor ?? DEFAULT_TEXT_COLOR,
        borderColor: styles.borderColor ?? null,
        backgroundColor: styles.backgroundColor ?? { r: 0, g: 0, b: 0, a: 255 },
        playEffect: styles.playEffect ?? null,
        minimapIcon: styles.minimapIcon || {
          size: null,
          color: null,
          shape: null
        },
        customSound: styles.customSound ?? null,
        ps5Sound: styles.ps5Sound ?? null,
        ps5SoundVolume: styles.ps5SoundVolume ?? 300,
        soundPlatform: styles.soundPlatform ?? (styles.customSound ? "PC" : null),
        soundType: styles.soundPlatform === "PS5" ? "default" : (styles.soundType || (styles.customSound ? "custom" : "default")),
        ruleType: ruleType || "show",
        ...styles
      };
      setInitialStyles(initial);
      setInitialTitle(title || "");
      setInitialConditionsSnapshot(conditions || {});
      setInitialRulesSnapshot(additionalRules || []);
      setInitialRuleTypeSnapshot(ruleType || "show");
      setInitialEnabledSnapshot(enabled);
      
      // localStyles 업데이트
      setLocalStyles(initial);
      setLocalRules(additionalRules || []);
      setLocalTitle(title || "");
      setLocalConditions(conditions || {});
      setLocalRuleType(ruleType || "show");
    }
    
    // 모달이 닫힐 때 프리뷰 초기화
    if (!isOpen && prevIsOpenRef.current) {
      setPastePreview(null);
    }
    
    // 이전 isOpen 상태 업데이트
    prevIsOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleStyleChange = (key, value) => {
    // 함수형 업데이트 패턴 사용: 이전 상태를 기반으로 새 상태 생성
    // 이렇게 하면 빠른 연속 변경 시 stale closure 문제 방지
    setLocalStyles(prev => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (newTitle) => {
    setLocalTitle(newTitle);
  };

  const handleConditionChange = (conditionKey, field, value) => {
    // 함수형 업데이트 패턴 사용
    setLocalConditions(prev => {
      const newConditions = { ...prev };
      if (!newConditions[conditionKey]) {
        newConditions[conditionKey] = {};
      }
      // 객체 깊은 복사를 위해 spread 연산자 사용
      if (typeof newConditions[conditionKey] === 'object') {
        newConditions[conditionKey] = { ...newConditions[conditionKey] };
      }
      newConditions[conditionKey][field] = value;
      
      // 즉시 부모에게 변경사항 전파 (실시간 프리뷰/리스트 반영을 위해)
      if (onConditionsChange) {
        onConditionsChange(newConditions);
      }
      
      return newConditions;
    });
  };

  const handleApply = () => {
    // 모든 변경사항을 부모 컴포넌트에 전달 (적용 버튼 클릭 시에만)
    if (onChange) {
      onChange(localStyles);
    }
    if (onTitleChange) {
      onTitleChange(localTitle);
    }
    if (onConditionsChange) {
      onConditionsChange(localConditions);
    }
    if (onRulesChange) {
      onRulesChange(localRules);
    }
    if (onRuleTypeChange) {
      onRuleTypeChange(localRuleType);
    }
    onClose();
  };

  const handleMinimapIconChange = (key, value) => {
    // 함수형 업데이트 패턴 사용
    setLocalStyles(prev => ({
      ...prev,
      minimapIcon: { ...prev.minimapIcon, [key]: value }
    }));
  };

  // 복사 기능
  const handleCopy = () => {
    const styleData = {
      ...localStyles,
      ruleType: localRuleType,
      title: localTitle,
      conditions: localConditions,
      rules: localRules
    };
    localStorage.setItem("styleSettingsClipboard", JSON.stringify(styleData));
    
    // 복사 성공 알림
    setNotificationModal({
      isOpen: true,
      type: "success",
      title: lang === "ko" ? "복사 완료" : "Copy Complete",
      message: lang === "ko" ? "스타일 설정이 복사되었습니다." : "Style settings copied."
    });
  };

  // 붙여넣기 기능
  const handlePaste = () => {
    try {
      const clipboardData = localStorage.getItem("styleSettingsClipboard");
      if (!clipboardData) {
        setNotificationModal({
          isOpen: true,
          type: "warning",
          title: lang === "ko" ? "알림" : "Notice",
          message: lang === "ko" ? "복사된 스타일 설정이 없습니다." : "No copied style settings found."
        });
        return;
      }

      const pastedData = JSON.parse(clipboardData);
      
      // 프리뷰 표시
      setPastePreview(pastedData);
      
      // 실제 붙여넣기
      setLocalStyles({
        fontSize: pastedData.fontSize ?? 30,
        textColor: pastedData.textColor || { r: 255, g: 255, b: 255, a: 255 }, // 인게임 기본값 #FFF
        borderColor: pastedData.borderColor ?? null,
        backgroundColor: pastedData.backgroundColor || { r: 0, g: 0, b: 0, a: 255 },
        playEffect: pastedData.playEffect ?? null,
        minimapIcon: pastedData.minimapIcon || {
          size: null,
          color: null,
          shape: null
        },
        customSound: pastedData.customSound ?? null,
        ps5Sound: pastedData.ps5Sound ?? null,
        ps5SoundVolume: pastedData.ps5SoundVolume ?? 300,
        soundPlatform: pastedData.soundPlatform ?? (pastedData.customSound ? "PC" : null),
        soundType: pastedData.soundPlatform === "PS5" ? "default" : (pastedData.soundType || (pastedData.customSound ? "custom" : "default")),
      });
      
      if (pastedData.ruleType) {
        setLocalRuleType(pastedData.ruleType);
      }
      if (pastedData.title && onTitleChange) {
        setLocalTitle(pastedData.title);
      }
      if (pastedData.conditions && onConditionsChange) {
        setLocalConditions(pastedData.conditions);
      }
      if (pastedData.rules && onRulesChange) {
        setLocalRules(pastedData.rules);
      }
      
      // 3초 후 프리뷰 자동 닫기
      setTimeout(() => {
        setPastePreview(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to paste style settings:", error);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: lang === "ko" ? "오류" : "Error",
        message: lang === "ko" ? "스타일 설정 붙여넣기에 실패했습니다." : "Failed to paste style settings."
      });
    }
  };

  // 초기화 기능 (기본값으로 복원)
  const handleReset = () => {
    // "처음 입력된 필터값(=모달 오픈 시점 스냅샷)"으로 되돌리기
    const nextStyles = initialStyles || {
      fontSize: 30,
      textColor: DEFAULT_TEXT_COLOR,
      borderColor: null,
      backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
      playEffect: null,
      minimapIcon: { size: null, color: null, shape: null },
      customSound: null,
      ps5Sound: null,
      ps5SoundVolume: 300,
      soundPlatform: null,
      soundType: "default",
      ruleType: "show"
    };

    setLocalStyles(nextStyles);
    setLocalTitle(initialTitle || "");
    setLocalConditions(initialConditionsSnapshot || {});
    setLocalRules(initialRulesSnapshot || []);
    setLocalRuleType(initialRuleTypeSnapshot || "show");
    setAreaLevelInputMode(false);

    // 이 모달에서 일부 값은 실시간으로 부모 상태에 반영되므로(조건/추가규칙/활성/타입),
    // 초기화 시에도 부모에 스냅샷을 다시 동기화한다.
    if (onConditionsChange) onConditionsChange(initialConditionsSnapshot || {});
    if (onRulesChange) onRulesChange(initialRulesSnapshot || []);
    if (onRuleTypeChange) onRuleTypeChange(initialRuleTypeSnapshot || "show");
    if (onEnabledChange) onEnabledChange(!!initialEnabledSnapshot);
  };


  // 사용 가능한 추가 규칙 목록
  const getAvailableRules = () => {
    // 골드인 경우
    if (baseType === "Gold") {
      // StackSize와 AreaLevel 둘 다 추가 가능
      return ["StackSize", "AreaLevel"]
        .map(code => filterConditions.conditions[code])
        .filter(Boolean);
    }
    
    // 베이스 아이템인 경우
    if (isGear) {
      const gearConditions = filterConditions.classConditions.gear.additional || [];
      return gearConditions.map(code => filterConditions.conditions[code]).filter(Boolean);
    }
    
    return [];
  };

  // 규칙 추가 기능 활성화 여부
  const canAddRules = isGear || baseType === "Gold";

  // 규칙 추가
  const handleAddRule = (conditionCode) => {
    const condition = filterConditions.conditions[conditionCode];
    if (!condition) return;

    const newRule = {
      id: `rule_${Date.now()}`,
      code: conditionCode,
      name: condition.name,
      nameEn: condition.nameEn,
      type: condition.type,
      operator: condition.defaultOperator,
      value: condition.type === "boolean" ? condition.values[0] : (condition.type === "select" ? condition.values?.[0] : 0),
      values: condition.values || null,
      label: condition.label || null // StackSize의 경우 "골드" 라벨 저장
    };

    const updatedRules = [...localRules, newRule];
    setLocalRules(updatedRules);
    if (onRulesChange) {
      onRulesChange(updatedRules);
    }
    setShowRuleDropdown(false);
  };

  // 규칙 삭제
  const handleRemoveRule = (ruleId) => {
    const updatedRules = localRules.filter(rule => rule.id !== ruleId);
    setLocalRules(updatedRules);
    if (onRulesChange) {
      onRulesChange(updatedRules);
    }
  };

  // 규칙 값 변경
  const handleRuleChange = (ruleId, field, value) => {
    const updatedRules = localRules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    setLocalRules(updatedRules);
    if (onRulesChange) {
      onRulesChange(updatedRules);
    }
  };

  const playEffectOptions = [
    { value: null, label: "없음", labelEn: "None" },
    { value: "Yellow", label: "노란색", labelEn: "Yellow" },
    { value: "White", label: "흰색", labelEn: "White" },
    { value: "Red", label: "빨강", labelEn: "Red" },
    { value: "Orange", label: "주황", labelEn: "Orange" },
    { value: "Pink", label: "분홍", labelEn: "Pink" },
    { value: "Blue", label: "파랑", labelEn: "Blue" },
    { value: "Green", label: "초록", labelEn: "Green" }
  ];

  const minimapSizeOptions = [
    { value: null, label: "없음", labelEn: "None" },
    { value: 0, label: "크게", labelEn: "Large" },
    { value: 1, label: "중간", labelEn: "Medium" },
    { value: 2, label: "작게", labelEn: "Small" }
  ];

  // 색상 이름과 실제 색상 값 매핑
  const colorValueMap = {
    "Red": "#FF0000",
    "Orange": "#FF7F00",
    "Yellow": "#FFFF00",
    "Pink": "#FF69B4",
    "Blue": "#0000FF",
    "Green": "#00FF00",
    "Brown": "#8B4513",
    "White": "#FFFFFF",
    "Cyan": "#00FFFF",
    "Grey": "#808080"
  };

  const minimapColorOptions = [
    { value: null, label: "없음", labelEn: "None" },
    { value: "Red", label: "빨강", labelEn: "Red" },
    { value: "Orange", label: "주황", labelEn: "Orange" },
    { value: "Yellow", label: "노랑", labelEn: "Yellow" },
    { value: "Pink", label: "분홍", labelEn: "Pink" },
    { value: "Blue", label: "파랑", labelEn: "Blue" },
    { value: "Green", label: "초록", labelEn: "Green" },
    { value: "Brown", label: "갈색", labelEn: "Brown" },
    { value: "White", label: "흰색", labelEn: "White" },
    { value: "Cyan", label: "청록", labelEn: "Cyan" },
    { value: "Grey", label: "회색", labelEn: "Grey" }
  ];

  const minimapShapeOptions = [
    { value: null, label: "없음", labelEn: "None" },
    { value: "Star", label: "별", labelEn: "Star" },
    { value: "Circle", label: "원형", labelEn: "Circle" },
    { value: "Triangle", label: "삼각형", labelEn: "Triangle" },
    { value: "Square", label: "사각형", labelEn: "Square" },
    { value: "Diamond", label: "마름모", labelEn: "Diamond" },
    { value: "Pentagon", label: "오각형", labelEn: "Pentagon" },
    { value: "Hexagon", label: "육각형", labelEn: "Hexagon" },
    { value: "Kite", label: "방패 모양", labelEn: "Kite" },
    { value: "Cross", label: "십자가", labelEn: "Cross" },
    { value: "Moon", label: "달", labelEn: "Moon" },
    { value: "Raindrop", label: "물방울", labelEn: "Raindrop" },
    { value: "UpsideDownHouse", label: "역방향 집", labelEn: "UpsideDownHouse" }
  ];

  /* -------------------------------
   * sound options 정의 (추가됨)
   * ------------------------------- */
  const pcSoundOptions = [
    { value: null, label: "없음", labelEn: "None" },
    { value: "custom_sound/1_currency_s.mp3", label: "사운드 1 (S)", labelEn: "Sound 1 (S)" },
    { value: "custom_sound/2_currency_a.mp3", label: "사운드 2 (A)", labelEn: "Sound 2 (A)" },
    { value: "custom_sound/3_currency_b.mp3", label: "사운드 3 (B)", labelEn: "Sound 3 (B)" },
    { value: "custom_sound/4_currency_c.mp3", label: "사운드 4 (C)", labelEn: "Sound 4 (C)" },
    // 필요 시 추가
  ];

  const ps5SoundOptions = [
    { value: null, label: "없음", labelEn: "None" },
    // 0~16 (일부 값 예시)
    { value: 1, label: "슬롯 1", labelEn: "Slot 1" },
    { value: 2, label: "슬롯 2", labelEn: "Slot 2" },
    { value: 3, label: "슬롯 3", labelEn: "Slot 3" },
    { value: 4, label: "슬롯 4", labelEn: "Slot 4" },
    { value: 5, label: "슬롯 5", labelEn: "Slot 5" },
    { value: 10, label: "슬롯 10", labelEn: "Slot 10" },
    { value: 16, label: "슬롯 16", labelEn: "Slot 16" }
  ];

  // 퀄리티 입력 필드 스크롤 방지 (비수동 리스너) -- 기존 코드 유지
  useEffect(() => {
    const input = qualityInputRef.current;
    if (input) {
      const handleWheel = (e) => {
        if (document.activeElement === input) {
          e.preventDefault();
          
          // 수동 값 변경 (스크롤은 막고 값은 변경)
          const delta = e.deltaY < 0 ? 1 : -1;
          
          setLocalConditions(prev => {
            const newConditions = { ...prev };
            // 현재 값 가져오기
            let currentVal = 0;
            if (typeof prev.quality === 'object') {
              currentVal = prev.quality?.value || prev.quality?.min || 0;
            } else {
              currentVal = prev.quality || 0;
            }
            
            const newVal = Math.max(0, currentVal + delta);
            
            if (typeof newConditions.quality === 'object') {
               newConditions.quality = { ...newConditions.quality, min: newVal, value: newVal };
            } else {
               newConditions.quality = newVal;
            }
            return newConditions;
          });
        }
      };
      // passive: false로 설정
      input.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        input.removeEventListener("wheel", handleWheel);
      };
    }
  }, [localConditions.quality]);

  // 골드 입력 필드 스크롤 방지용 refs
  const goldInputRefs = useRef({ areaLevel: null, stackSize: null });

  // 골드 입력 필드 스크롤 방지 Effect
  useEffect(() => {
    const handleGoldInputWheel = (e, key) => {
        const input = goldInputRefs.current[key];
        // 마우스 오버 상태에서도 동작하도록 activeElement 체크 제거
        if (input) {
            e.preventDefault(); // 브라우저 스크롤 방지
            
            // 휠 방향에 따라 값 증감 (deltaY < 0 이면 위로 스크롤 -> 값 증가)
            const delta = e.deltaY < 0 ? 1 : -1;
            
            // 현재 값 가져오기
            const currentConditions = localConditions[key];
            let currentVal = 0;
            
            if (currentConditions && typeof currentConditions.value === 'number') {
                currentVal = currentConditions.value;
            } else if (key === 'areaLevel') {
                 // 지역 레벨 기본값 (없을 경우)
                 currentVal = 65; 
            }

            // 새 값 계산 (최소값 0, 지역레벨은 1)
            const minVal = key === 'areaLevel' ? 1 : 0;
            const newVal = Math.max(minVal, currentVal + delta);
            
            // 값 변경 핸들러 호출
            // handleConditionChange는 컴포넌트 스코프의 함수 사용
            // localConditions가 의존성에 있으므로 최신 상태 반영됨
            handleConditionChange(key, "value", newVal);
        }
    };

    const areaLevelInput = goldInputRefs.current.areaLevel;
    const stackSizeInput = goldInputRefs.current.stackSize;

    const areaHandler = (e) => handleGoldInputWheel(e, "areaLevel");
    const stackHandler = (e) => handleGoldInputWheel(e, "stackSize");

    if (areaLevelInput) {
        areaLevelInput.addEventListener("wheel", areaHandler, { passive: false });
    }
    if (stackSizeInput) {
        stackSizeInput.addEventListener("wheel", stackHandler, { passive: false });
    }

    return () => {
        if (areaLevelInput) areaLevelInput.removeEventListener("wheel", areaHandler);
        if (stackSizeInput) stackSizeInput.removeEventListener("wheel", stackHandler);
    };
  }, [localConditions, areaLevelInputMode]); // 리렌더링 될 때마다 이벤트 리스너 다시 부착

  // Hook 호출 순서를 보장하기 위해(ESLint rules-of-hooks),
  // 조기 return은 모든 Hook 선언 이후에 배치
  if (!isOpen) return null;

  return (
    <div className="style-settings-modal">
      <div className="style-settings-overlay" onClick={onClose}></div>
      <div className="style-settings-content-wrapper">
      <div className="style-settings-content" ref={modalContentRef}>
        {/* 프리뷰 영역 (여백 없음) */}
        <div className="style-preview-panel">
          {/* 닫기 버튼을 프리뷰 위에 오버레이 (오른쪽 위) */}
          <button className="close-button preview-close-button" onClick={onClose}>×</button>
          <ItemPreviewBox
            itemName={itemName}
            styles={{
              ...localStyles,
              // 인게임 기본값 적용 (null일 때 프리뷰에서 기본값 표시)
              textColor: localStyles.textColor || { r: 171, g: 159, b: 130, a: 255 }, // 인게임 기본값 #ab9f82
              borderColor: localStyles.borderColor || { r: 10, g: 13, b: 17, a: 255 } // #0a0d11
            }}
          />
        </div>

        {/* 아래 영역 (여백 유지) */}
        <div className="style-settings-body">
          {/* 상단: 규칙 모드(비활성/표시/숨김) + 제목 (프리뷰 아래로 이동) */}
          <div className="style-top-controls">
            {(onRuleTypeChange || onEnabledChange) && (
              <div className="rule-mode-row">
                <select
                  className="style-select rule-mode-select"
                  value={onEnabledChange && !enabled ? "disabled" : localRuleType}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (val === "disabled") {
                      // 체크리스트 미체크 상태(=필터 적용 안 함)
                      if (onEnabledChange) onEnabledChange(false);
                      return;
                    }

                    // 표시/숨김 선택 시 체크리스트는 자동 체크되어야 함
                    if (onEnabledChange) onEnabledChange(true);

                    // Show/Hide 타입 반영
                    setLocalRuleType(val);
                    if (onRuleTypeChange) onRuleTypeChange(val);
                  }}
                >
                  {onEnabledChange && (
                    <option value="disabled">{lang === "ko" ? "비활성" : "Disabled"}</option>
                  )}
                  <option value="show">{lang === "ko" ? "표시" : "Show"}</option>
                  <option value="hide">{lang === "ko" ? "숨김" : "Hide"}</option>
                </select>
              </div>
            )}

            {title !== undefined && onTitleChange ? (
              <input
                type="text"
                className="style-title-input"
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="규칙 제목"
                disabled={!enabled}
              />
            ) : (
              <span style={{ fontWeight: 700, fontSize: "16px", color: enabled ? "var(--text)" : "var(--muted)" }}>
                {lang === "ko" ? "스타일 설정" : "Style Settings"}
              </span>
            )}
          </div>

          {/* 공통 기본 규칙 (프리뷰 아래) */}
          <div className="style-settings-panel">
            {/* 폰트 / 테두리 / 배경 (한 줄) */}
            <div className="style-setting-group">
              <div className="color-effect-row">
                <div className="color-effect-item-inline font-size-item-left">
                  <input
                    type="checkbox"
                    id="text-color-checkbox"
                    className="color-checkbox"
                    checked={localStyles.textColor !== null}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      handleStyleChange("textColor", checked ? DEFAULT_TEXT_COLOR : null);
                    }}
                  />
                  <label 
                    htmlFor="text-color-checkbox"
                    className={`style-setting-label-inline ${localStyles.textColor === null ? "label-disabled" : ""}`}
                  >
                    <span>폰트</span>
                  </label>
                  <ColorPicker
                    color={localStyles.textColor || DEFAULT_TEXT_COLOR}
                    onChange={(color) => handleStyleChange("textColor", color)}
                    onPreview={(color) => handleStyleChange("textColor", color)}
                    showCheckbox={false}
                    checked={localStyles.textColor !== null}
                    modalRef={modalContentRef}
                  />
                  <div className="font-size-control">
                    <input
                      type="range"
                      min="30"
                      max="45"
                      step="1"
                      value={localStyles.fontSize ?? 30}
                      onChange={(e) => handleStyleChange("fontSize", parseInt(e.target.value) || 30)}
                    />
                    <input
                      type="number"
                      min="30"
                      max="45"
                      className="font-size-input"
                      value={localStyles.fontSize ?? 30}
                      onChange={(e) => {
                        const val = Math.min(45, Math.max(30, parseInt(e.target.value) || 30));
                        handleStyleChange("fontSize", val);
                      }}
                    />
                  </div>
                </div>
                <div className="color-effect-item-group-right">
                  <div className="color-effect-item-inline">
                    <input
                      type="checkbox"
                      id="border-color-checkbox"
                      className="color-checkbox"
                      checked={localStyles.borderColor !== null}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        handleStyleChange("borderColor", checked ? DEFAULT_BORDER_COLOR : null);
                      }}
                    />
                    <label 
                      htmlFor="border-color-checkbox"
                      className={`style-setting-label-inline ${localStyles.borderColor === null ? "label-disabled" : ""}`}
                    >
                      <span>테두리</span>
                    </label>
                    <ColorPicker
                      color={localStyles.borderColor || DEFAULT_BORDER_COLOR}
                      onChange={(color) => handleStyleChange("borderColor", color)}
                      onPreview={(color) => handleStyleChange("borderColor", color)}
                      showCheckbox={false}
                      checked={localStyles.borderColor !== null}
                      modalRef={modalContentRef}
                    />
                  </div>
                  <div className="color-effect-item-inline">
                    <input
                      type="checkbox"
                      id="background-color-checkbox"
                      className="color-checkbox"
                      checked={localStyles.backgroundColor !== null}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        handleStyleChange("backgroundColor", checked ? { r: 0, g: 0, b: 0, a: 255 } : null);
                      }}
                    />
                    <label 
                      htmlFor="background-color-checkbox"
                      className={`style-setting-label-inline ${localStyles.backgroundColor === null ? "label-disabled" : ""}`}
                    >
                      <span>배경</span>
                    </label>
                    <ColorPicker
                      color={localStyles.backgroundColor || { r: 0, g: 0, b: 0, a: 255 }}
                      onChange={(color) => handleStyleChange("backgroundColor", color)}
                      onPreview={(color) => handleStyleChange("backgroundColor", color)}
                      showCheckbox={false}
                      checked={localStyles.backgroundColor !== null}
                      modalRef={modalContentRef}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 미니맵 아이콘 & 빛기둥 (한 줄) */}
            <div className="style-setting-group">
              <div className="minimap-icon-inline-row">
                <input
                  type="checkbox"
                  id="minimap-icon-checkbox"
                  className="color-checkbox"
                  checked={localStyles.minimapIcon?.size !== null || localStyles.minimapIcon?.color !== null || localStyles.minimapIcon?.shape !== null}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      handleMinimapIconChange("size", 0);
                      handleMinimapIconChange("color", "Red");
                      handleMinimapIconChange("shape", "Star");
                    } else {
                      handleMinimapIconChange("size", null);
                      handleMinimapIconChange("color", null);
                      handleMinimapIconChange("shape", null);
                    }
                  }}
                />
                <label 
                  htmlFor="minimap-icon-checkbox"
                  className={`style-setting-label-inline ${(localStyles.minimapIcon?.size === null && localStyles.minimapIcon?.color === null && localStyles.minimapIcon?.shape === null) ? "label-disabled" : ""}`}
                >
                  <span>미니맵 아이콘</span>
                </label>
                <select
                  className="style-select minimap-inline-select"
                  value={localStyles.minimapIcon?.size ?? ""}
                  onChange={(e) => handleMinimapIconChange("size", e.target.value ? parseInt(e.target.value) : null)}
                  disabled={localStyles.minimapIcon?.size === null && localStyles.minimapIcon?.color === null && localStyles.minimapIcon?.shape === null}
                >
                  {minimapSizeOptions.map((option) => (
                    <option key={option.value ?? "none"} value={option.value ?? ""}>
                      {lang === "ko" ? option.label : option.labelEn}
                    </option>
                  ))}
                </select>
                <select
                  className="style-select color-select minimap-inline-select"
                  value={localStyles.minimapIcon?.color || ""}
                  onChange={(e) => handleMinimapIconChange("color", e.target.value || null)}
                  style={{
                    color: localStyles.minimapIcon?.color ? colorValueMap[localStyles.minimapIcon.color] || "var(--text)" : "var(--text)"
                  }}
                  disabled={localStyles.minimapIcon?.size === null && localStyles.minimapIcon?.color === null && localStyles.minimapIcon?.shape === null}
                >
                  {minimapColorOptions.map((option) => {
                    const colorValue = option.value ? colorValueMap[option.value] : null;
                    return (
                      <option 
                        key={option.value || "none"} 
                        value={option.value || ""}
                        style={{
                          color: colorValue || "var(--text)",
                          backgroundColor: "var(--panel2)"
                        }}
                      >
                        {lang === "ko" ? option.label : option.labelEn}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="style-select minimap-inline-select"
                  value={localStyles.minimapIcon?.shape || ""}
                  onChange={(e) => handleMinimapIconChange("shape", e.target.value || null)}
                  disabled={localStyles.minimapIcon?.size === null && localStyles.minimapIcon?.color === null && localStyles.minimapIcon?.shape === null}
                >
                  {minimapShapeOptions.map((option) => (
                    <option key={option.value || "none"} value={option.value || ""}>
                      {lang === "ko" ? option.label : option.labelEn}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  id="play-effect-checkbox"
                  className="color-checkbox"
                  checked={localStyles.playEffect !== null}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleStyleChange("playEffect", checked ? "Red" : null);
                  }}
                />
                <label 
                  htmlFor="play-effect-checkbox"
                  className={`style-setting-label-inline ${localStyles.playEffect === null ? "label-disabled" : ""}`}
                >
                  <span>빛기둥</span>
                </label>
                <select
                  className="style-select minimap-inline-select"
                  value={localStyles.playEffect || ""}
                  onChange={(e) => handleStyleChange("playEffect", e.target.value || null)}
                  style={{
                    color: localStyles.playEffect ? colorValueMap[localStyles.playEffect] || "var(--text)" : "var(--text)"
                  }}
                  disabled={localStyles.playEffect === null}
                >
                  {playEffectOptions.map((option) => {
                    const colorValue = option.value ? colorValueMap[option.value] : null;
                    return (
                        <option 
                            key={option.value || "none"} 
                            value={option.value || ""}
                            style={{
                                color: colorValue || "var(--text)",
                                backgroundColor: "var(--panel2)"
                            }}
                        >
                        {lang === "ko" ? option.label : option.labelEn}
                        </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 사운드 설정 */}
            <div className="style-setting-group">
              <div className="sound-setting-row">
                <input
                  type="checkbox"
                  id="custom-sound-checkbox"
                  className="color-checkbox"
                  checked={localStyles.customSound !== null || localStyles.ps5Sound !== null}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      // 체크 시 기존 값이 있으면 유지, 없으면 기본값 설정
                      if (localStyles.ps5Sound) {
                        // PS5 사운드가 있으면 그대로 유지
                        setLocalStyles(prev => ({
                          ...prev,
                          soundType: "default",
                          soundPlatform: "PS5",
                          ps5SoundVolume: prev.ps5SoundVolume || 300
                        }));
                      } else if (localStyles.customSound) {
                        // PC 사운드가 있으면 그대로 유지
                        setLocalStyles(prev => ({
                          ...prev,
                          soundType: "custom",
                          soundPlatform: "PC",
                          ps5SoundVolume: 300
                        }));
                      } else {
                        // 둘 다 없으면 기본 PC 사운드 설정 (한 번에 업데이트)
                        setLocalStyles(prev => ({
                          ...prev,
                          soundType: "custom",
                          customSound: "custom_sound/1_currency_s.mp3",
                          soundPlatform: "PC",
                          ps5Sound: null,
                          ps5SoundVolume: 300
                        }));
                      }
                    } else {
                      // 체크해제 시 모든 사운드 값 초기화 (한 번에 업데이트)
                      setLocalStyles(prev => ({
                        ...prev,
                        customSound: null,
                        ps5Sound: null,
                        ps5SoundVolume: 300,
                        soundPlatform: null,
                        soundType: "default"
                      }));
                    }
                  }}
                />
                <label 
                  htmlFor="custom-sound-checkbox"
                  className={`style-setting-label-inline ${(localStyles.customSound === null && localStyles.ps5Sound === null) ? "label-disabled" : ""}`}
                >
                  <span>사운드</span>
                </label>
                <select
                  className="style-select sound-type-select"
                  value={localStyles.soundType || "default"}
                  onChange={(e) => {
                    const newSoundType = e.target.value;
                    const currentSound = localStyles.customSound;
                    const currentPs5Sound = localStyles.ps5Sound;
                    
                    if (newSoundType === "default") {
                      // 기본(PS5)로 변경
                      if (currentSound && PC_TO_PS5_SOUND_MAP[currentSound]) {
                        // PC 사운드가 있으면 PS5로 변환
                        const ps5Slot = PC_TO_PS5_SOUND_MAP[currentSound];
                        setLocalStyles(prev => ({
                          ...prev,
                          ps5Sound: ps5Slot,
                          ps5SoundVolume: prev.ps5SoundVolume || 300,
                          customSound: null,
                          soundPlatform: "PS5",
                          soundType: "default"
                        }));
                      } else if (currentPs5Sound) {
                        // 이미 PS5 사운드가 있으면 그대로 유지
                        setLocalStyles(prev => ({
                          ...prev,
                          soundPlatform: "PS5",
                          soundType: "default"
                        }));
                      } else {
                        // PC 사운드가 매핑에 없으면 체크해제 (사운드 비활성화)
                        setLocalStyles(prev => ({
                          ...prev,
                          customSound: null,
                          ps5Sound: null,
                          ps5SoundVolume: 300,
                          soundPlatform: null,
                          soundType: "default"
                        }));
                      }
                    } else {
                      // 커스텀(PC)로 변경
                      if (currentPs5Sound && PS5_TO_PC_SOUND_MAP[currentPs5Sound]) {
                        // PS5 사운드가 있으면 PC로 변환
                        const pcSound = PS5_TO_PC_SOUND_MAP[currentPs5Sound];
                        setLocalStyles(prev => ({
                          ...prev,
                          customSound: pcSound,
                          ps5Sound: null,
                          ps5SoundVolume: 300,
                          soundPlatform: "PC",
                          soundType: "custom"
                        }));
                      } else if (currentSound) {
                        // 이미 PC 사운드가 있으면 그대로 유지
                        setLocalStyles(prev => ({
                          ...prev,
                          soundPlatform: "PC",
                          soundType: "custom"
                        }));
                      } else {
                        // 기본값 설정
                        setLocalStyles(prev => ({
                          ...prev,
                          customSound: "custom_sound/1_currency_s.mp3",
                          ps5Sound: null,
                          ps5SoundVolume: 300,
                          soundPlatform: "PC",
                          soundType: "custom"
                        }));
                      }
                    }
                  }}
                  disabled={localStyles.customSound === null && localStyles.ps5Sound === null}
                >
                  <option value="default">{lang === "ko" ? "기본" : "Normal"}</option>
                  <option value="custom">{lang === "ko" ? "커스텀" : "Custom"}</option>
                </select>

                {/* 볼륨 드롭다운: 이제 모든 사운드 모드에서 표시 */}
                <select
                  className="style-select sound-volume-select"
                  value={localStyles.ps5SoundVolume || 300}
                  onChange={(e) => handleStyleChange("ps5SoundVolume", parseInt(e.target.value))}
                  disabled={localStyles.customSound === null && localStyles.ps5Sound === null}
                >
                  <option value="300">300 ({lang === "ko" ? "최대" : "Max"})</option>
                  <option value="250">250</option>
                  <option value="200">200</option>
                  <option value="150">150</option>
                  <option value="100">100</option>
                  <option value="50">50</option>
                </select>

                {/* 커스텀 모드: 입력 필드 + 파일 버튼 표시 */}
                {localStyles.soundType === "custom" && (
                  <div className="custom-sound-input-wrapper">
                    <input
                      type="text"
                      className="style-input sound-input"
                      placeholder={lang === "ko" ? "사운드 파일 경로 (예: custom_sound/1_currency_s.mp3)" : "Sound file path (e.g. custom_sound/1_currency_s.mp3)"}
                      value={localStyles.customSound || ""}
                      onChange={(e) => handleStyleChange("customSound", e.target.value || null)}
                      disabled={!localStyles.customSound && !localStyles.ps5Sound}
                    />
                    <button className="sound-file-button">
                      {lang === "ko" ? "파일" : "File"}
                    </button>
                  </div>
                )}

                {/* 기본 모드: 슬롯 드롭다운 표시 */}
                {localStyles.soundType === "default" && (
                  <select
                    className="style-select sound-select"
                    value={localStyles.soundType === "default"
                      ? (localStyles.soundPlatform === "PS5" ? (localStyles.ps5Sound || "") : (localStyles.customSound ? "" : (localStyles.ps5Sound ? "" : (localStyles.customSound || ""))))
                      : (localStyles.soundPlatform === "PS5" ? (localStyles.ps5Sound || "") : (localStyles.customSound || ""))}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;

                      const isPC = localStyles.soundPlatform === "PC";

                      if (isPC) {
                        handleStyleChange("customSound", value);
                        handleStyleChange("ps5Sound", null);
                      } else {
                        handleStyleChange("ps5Sound", parseInt(value));
                        handleStyleChange("customSound", null);
                      }
                    }}
                    disabled={localStyles.customSound === null && localStyles.ps5Sound === null}
                  >
                    {(localStyles.soundPlatform === "PS5" ? ps5SoundOptions : pcSoundOptions).map((option) => (
                      <option key={option.value || "none"} value={option.value || ""}>
                        {lang === "ko" ? option.label : option.labelEn}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 퀄리티 조건 설정 (별도 그룹으로 이동) */}
            {(localConditions.quality !== undefined || title === "퀄리티") && (
              <div className="style-setting-group">
                <div className="quality-condition-ui" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="quality-checkbox"
                    className="color-checkbox"
                    checked={localConditions.quality !== undefined && localConditions.quality !== null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleConditionChange("quality", "value", 23);
                        handleConditionChange("quality", "min", 23);
                      } else {
                        const newConditions = { ...localConditions };
                        delete newConditions.quality;
                        setLocalConditions(newConditions);
                      }
                    }}
                  />
                  <label htmlFor="quality-checkbox" className="style-setting-label-inline">
                      <span>{lang === "ko" ? "퀄리티" : "Quality"}</span>
                  </label>
                  <input
                    ref={qualityInputRef}
                    type="number"
                    className="font-size-input"
                    style={{ width: "60px" }}
                    value={localConditions.quality?.min || localConditions.quality?.value || localConditions.quality || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const newConditions = { ...localConditions };
                      if (typeof newConditions.quality === 'object') {
                          newConditions.quality = { ...newConditions.quality, min: val, value: val };
                      } else {
                          newConditions.quality = val;
                      }
                      setLocalConditions(newConditions);
                    }}
                    disabled={localConditions.quality === undefined || localConditions.quality === null}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 공통이 아닌 규칙 (맨 아래) */}
              
              {/* 조건 설정 섹션 (가로 분리선 + 텍스트) */}
              {(isGear || baseType === "Gold") && (
                <div className="condition-settings-group">
                   <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 12px 0" }}>
                      <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                      <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                        {lang === "ko" ? "조건 설정" : "Condition Settings"}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                   </div>

                  {(() => {
                    // Gold 타입이면 항상 전용 UI 표시
                    if (baseType === "Gold") {
                        const areaLevelCondition = localConditions.areaLevel;
                        const stackSizeCondition = localConditions.stackSize;
                        
                        // 조건이 없어도 UI 값을 표시하기 위한 임시 변수
                        // 조건이 있으면 그 값을, 없으면 기본값(65)이나 마지막 선택값을 사용
                        // 여기서는 조건이 없으면 0으로 처리되지만, UI상 1티어(65)처럼 보이게 할지 결정 필요
                        // 다만, disabled 상태이므로 값은 크게 중요하지 않을 수 있음. 
                        const displayLevel = areaLevelCondition?.value || 65; 
                        
                        // 경로석 티어 계산 (65~80)
                        const currentPathTier = displayLevel >= 65 && displayLevel <= 80 
                            ? displayLevel - 64 
                            : null;
                        
                        const isCustomInput = displayLevel > 0 && (displayLevel < 65 || displayLevel > 80);

                        return (
                             <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                                {/* 왼쪽: 지역 레벨 설정 */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <input
                                        type="checkbox"
                                        checked={!!areaLevelCondition}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // 조건 추가 (기본값: >= 65 (1티어))
                                                // 중요: 조건이 변경되었음을 확실히 알리기 위해 새로운 객체 생성
                                                const newConditions = { 
                                                    ...localConditions,
                                                    areaLevel: { operator: ">=", value: 65 } 
                                                };
                                                setLocalConditions(newConditions);
                                                if (onConditionsChange) {
                                                    onConditionsChange(newConditions);
                                                }
                                            } else {
                                                // 조건 삭제
                                                const newConditions = { ...localConditions };
                                                delete newConditions.areaLevel;
                                                setLocalConditions(newConditions);
                                                if (onConditionsChange) {
                                                    onConditionsChange(newConditions);
                                                }
                                            }
                                        }}
                                    />
                                    <span 
                                        className="style-setting-label" 
                                        style={{ 
                                            minWidth: "auto",
                                            opacity: !!areaLevelCondition ? 1 : 0.5,
                                            color: !!areaLevelCondition ? "var(--text-main)" : "var(--text-muted)"
                                        }}
                                    >
                                        {lang === "ko" ? "지역 레벨" : "Area Level"}
                                    </span>
                                    
                                    <div style={{ 
                                        display: "flex", 
                                        gap: "6px", 
                                        opacity: !!areaLevelCondition ? 1 : 0.5,
                                        pointerEvents: !!areaLevelCondition ? "auto" : "none"
                                    }}>
                                        <select
                                            className="condition-operator"
                                            value={areaLevelCondition?.operator || ">="}
                                            onChange={(e) => handleConditionChange("areaLevel", "operator", e.target.value)}
                                            style={{ width: "50px", minWidth: "50px" }}
                                            disabled={!areaLevelCondition}
                                        >
                                            <option value=">=">≥</option>
                                            <option value="<=">≤</option>
                                            <option value=">">&gt;</option>
                                            <option value="<">&lt;</option>
                                            <option value="==">==</option>
                                        </select>
                                        
                                        {/* 경로석 티어 드롭다운 또는 직접 입력 인풋 */}
                                        {areaLevelInputMode ? (
                                             <input
                                                ref={(el) => {
                                                    // 스크롤 방지 로직 적용
                                                    if (el) {
                                                        const handleWheel = (e) => {
                                                            if (document.activeElement === el) {
                                                                e.preventDefault();
                                                                // 필요한 경우 여기서 값 변경 로직 추가 가능
                                                            }
                                                        };
                                                        el.addEventListener("wheel", handleWheel, { passive: false });
                                                        // 클린업 함수는 useEffect에서 처리하거나, 여기서 매번 리스너를 추가하지 않도록 주의해야 함.
                                                        // 리액트 ref 콜백 패턴상 이 방식은 리렌더링마다 리스너가 중복될 수 있음.
                                                        // 따라서 별도 useEffect로 처리하는 것이 안전함. 여기서 ref만 할당.
                                                        goldInputRefs.current.areaLevel = el;
                                                    }
                                                }}
                                                type="number"
                                                className="condition-value"
                                                value={displayLevel || ""}
                                                onChange={(e) => handleConditionChange("areaLevel", "value", parseInt(e.target.value) || 0)}
                                                style={{ width: "80px" }}
                                                placeholder="Level"
                                                disabled={!areaLevelCondition}
                                            />
                                        ) : (
                                            <select
                                                className="condition-value"
                                                value={isCustomInput ? "custom" : (currentPathTier || "custom")}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "custom") {
                                                        setAreaLevelInputMode(true);
                                                    } else {
                                                        const tier = parseInt(val);
                                                        handleConditionChange("areaLevel", "value", 64 + tier);
                                                    }
                                                }}
                                                style={{ width: "200px" }} 
                                                disabled={!areaLevelCondition}
                                            >
                                                <option value="custom">{lang === "ko" ? "직접 입력" : "Custom Input"}</option>
                                                {Array.from({ length: 16 }, (_, i) => i + 1).map(tier => (
                                                    <option key={tier} value={tier}>
                                                        {lang === "ko" ? `경로석 ${tier}티어 (${64+tier})` : `Waystone T${tier} (${64+tier})`}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 구분선 */}
                                <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>

                                {/* 오른쪽: 골드 설정 (항상 표시 / 조건 없으면 빈 값) */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                     <span className="style-setting-label" style={{ minWidth: "auto" }}>
                                        {lang === "ko" ? "골드" : "Gold"}
                                    </span>
                                    <select
                                        className="condition-operator"
                                        value={stackSizeCondition?.operator || ">="}
                                        onChange={(e) => handleConditionChange("stackSize", "operator", e.target.value)}
                                        style={{ width: "50px", minWidth: "50px" }}
                                    >
                                        <option value=">=">≥</option>
                                        <option value="<=">≤</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value="==">==</option>
                                    </select>
                                    <input
                                        ref={(el) => {
                                             if (el) goldInputRefs.current.stackSize = el;
                                        }}
                                        type="number"
                                        className="condition-value"
                                        value={stackSizeCondition?.value || ""}
                                        onChange={(e) => handleConditionChange("stackSize", "value", parseInt(e.target.value) || 0)}
                                        style={{ width: "80px" }}
                                        placeholder="Amount"
                                    />
                                </div>
                             </div>
                        );
                    }

                    // 기본 렌더링 (골드 아닐 때만 렌더링하도록 조건 추가)
                    return (
                        <>
                          {/* StackSize: 골드가 아닐 때만 표시 (골드는 위에서 처리) */}
                          {localConditions.stackSize && baseType !== "Gold" && (
                            <div className="condition-row-inline">
                                <span className="style-setting-label">
                                    {lang === "ko" ? "스택 수량" : "Stack Size"}
                                </span>
                                <select
                                  className="condition-operator-compact"
                                  value={localConditions.stackSize.operator || ">="}
                                  onChange={(e) => handleConditionChange("stackSize", "operator", e.target.value)}
                                >
                                  <option value=">=">≥</option>
                                  <option value="<=">≤</option>
                                  <option value=">">&gt;</option>
                                  <option value="<">&lt;</option>
                                  <option value="==">==</option>
                                </select>
                              <div className="condition-slider-wrapper-inline">
                                <OperatorSlider
                                  value={localConditions.stackSize.value || 0}
                                  onChange={(newValue) => handleConditionChange("stackSize", "value", newValue)}
                                  operator={localConditions.stackSize.operator || ">="}
                                  min={0}
                                  max={10000}
                                  step={10}
                                  label="" 
                                />
                              </div>
                            </div>
                          )}

                          {/* AreaLevel: 골드가 아닐 때만 표시 (골드는 위에서 처리) */}
                          {areaLevelCondition && baseType !== "Gold" && (
                              <div className="condition-row-with-slider">
                                <div className="condition-label-wrapper">
                                  <span className="style-setting-label">지역 레벨</span>
                                  <select
                                    className="condition-operator"
                                    value={localConditions.areaLevel?.operator || ">="}
                                    onChange={(e) => handleConditionChange("areaLevel", "operator", e.target.value)}
                                  >
                                    <option value=">=">≥</option>
                                    <option value="<=">≤</option>
                                    <option value=">">&gt;</option>
                                    <option value="<">&lt;</option>
                                    <option value="==">==</option>
                                  </select>
                                </div>
                                <div className="condition-slider-wrapper">
                                    <OperatorSlider
                                      value={localConditions.areaLevel?.value || 1}
                                      onChange={(newValue) => {
                                        handleConditionChange("areaLevel", "value", newValue);
                                      }}
                                      operator={localConditions.areaLevel?.operator || ">="}
                                      min={1}
                                      max={100}
                                      step={1}
                                    />
                                </div>
                              </div>
                          )}
                        </>
                    );
                  })()}
                </div>
              )}
              {/* 추가 규칙 (기본코드 + 추가 코드 순서) */}
              {canAddRules && localRules.length > 0 && (
                <div className="style-setting-group">
                  <label className="style-setting-label">
                    <span>추가 규칙</span>
                  </label>
                  <div className="additional-rules-list">
                    {localRules.map((rule) => {
                      const condition = filterConditions.conditions[rule.code];
                      if (!condition) return null;

                      // StackSize의 경우 라벨 사용 (저장된 라벨 또는 조건의 라벨)
                      const displayName = (rule.label || condition.label)
                        ? (lang === "ko" ? (rule.label || condition.label).ko : (rule.label || condition.label).en)
                        : (lang === "ko" ? rule.name : rule.nameEn);

                      return (
                        <div key={rule.id} className="rule-item">
                          <div className="rule-header">
                            <span className="rule-name">{displayName}</span>
                            <button 
                              className="rule-remove-btn"
                              onClick={() => handleRemoveRule(rule.id)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="rule-controls">
                            {/* 연산자 */}
                            <div className="rule-controls-row">
                              <select
                                className="rule-operator"
                                value={rule.operator}
                                onChange={(e) => handleRuleChange(rule.id, "operator", e.target.value)}
                              >
                                {condition.operators.map((op) => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>

                              {/* 값 입력 - number 타입이 아닌 경우 기존 input 사용 */}
                              {condition.type !== "number" && condition.type === "select" && condition.values && (
                                <select
                                  className="rule-value"
                                  value={rule.value || ""}
                                  onChange={(e) => handleRuleChange(rule.id, "value", e.target.value)}
                                >
                                  {condition.values.map((val) => (
                                    <option key={val} value={val}>{val}</option>
                                  ))}
                                </select>
                              )}

                              {condition.type === "boolean" && (
                                <select
                                  className="rule-value"
                                  value={rule.value ? "true" : "false"}
                                  onChange={(e) => handleRuleChange(rule.id, "value", e.target.value === "true")}
                                >
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </select>
                              )}
                            </div>

                            {/* 값 입력 - number 타입인 경우 슬라이더 사용 */}
                            {condition.type === "number" && (() => {
                              // 조건별 기본 min/max/step 설정
                              const getRangeForCondition = (code) => {
                                switch (code) {
                                  case "StackSize":
                                    return { min: 0, max: 10000, step: 10 };
                                  case "AreaLevel":
                                    return { min: 1, max: 100, step: 1 };
                                  case "ItemLevel":
                                    return { min: 1, max: 82, step: 1 };
                                  case "Quality":
                                    return { min: 0, max: 28, step: 1 };
                                  case "Sockets":
                                    return { min: 0, max: 3, step: 1 };
                                  case "UnidentifiedItemTier":
                                    return { min: 1, max: 5, step: 1 };
                                  default:
                                    return { min: 0, max: 100, step: 1 };
                                }
                              };
                              const range = getRangeForCondition(condition.code);
                              
                              return (
                                <div className="rule-slider-wrapper">
                                  <OperatorSlider
                                    value={rule.value || range.min}
                                    onChange={(newValue) => handleRuleChange(rule.id, "value", newValue)}
                                    operator={rule.operator}
                                    min={range.min}
                                    max={range.max}
                                    step={range.step}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

        </div>
        {/* 하단 버튼 영역 (규칙 추가 + 복사/붙여넣기 + 초기화 + 적용) */}
        <div className="style-settings-footer">
          {canAddRules && (
            <div className="rule-add-button-container">
            {showRuleDropdown ? (
              <div className="rule-dropdown">
                <div className="rule-dropdown-header">
                  <span>규칙 추가</span>
                  <button 
                    className="rule-dropdown-close"
                    onClick={() => setShowRuleDropdown(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="rule-dropdown-list">
                  {getAvailableRules().map((condition) => {
                    // 이미 추가된 규칙은 제외
                    const isAdded = localRules.some(rule => rule.code === condition.code);
                    if (isAdded) return null;

                    // StackSize의 경우 라벨 사용
                    const displayName = condition.label 
                      ? (lang === "ko" ? condition.label.ko : condition.label.en)
                      : (lang === "ko" ? condition.name : condition.nameEn);

                    return (
                      <button
                        key={condition.code}
                        className="rule-dropdown-item"
                        onClick={() => handleAddRule(condition.code)}
                      >
                        <span>{displayName}</span>
                        <span className="rule-code">{condition.code}</span>
                      </button>
                    );
                  })}
                  {getAvailableRules().filter(condition => 
                    !localRules.some(rule => rule.code === condition.code)
                  ).length === 0 && (
                    <div className="rule-dropdown-empty">
                      추가 가능한 규칙이 없습니다
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                className="rule-add-button"
                onClick={() => setShowRuleDropdown(true)}
              >
                + 규칙 추가
              </button>
            )}
            </div>
          )}
          
          {/* 복사/붙여넣기 버튼 영역 (왼쪽 정렬) */}
          <div className="copy-paste-button-group">
            <button className="copy-paste-button" onClick={handleCopy}>
              {lang === "ko" ? "복사" : "Copy"}
            </button>
            <button className="copy-paste-button" onClick={handlePaste}>
              {lang === "ko" ? "붙여넣기" : "Paste"}
            </button>
          </div>
          
          {/* 초기화/적용 버튼 영역 (오른쪽 정렬) */}
          <div className="footer-action-buttons">
            <button className="reset-button-footer" onClick={handleReset}>
              초기화
            </button>
            <button className="close-button-primary" onClick={handleApply}>
              적용
            </button>
          </div>
        </div>
      </div>

      {/* 붙여넣기 프리뷰 팝업 */}
      {pastePreview && (
        <div className="paste-preview-popup">
          <div className="paste-preview-header">
            <span>{lang === "ko" ? "붙여넣기 프리뷰" : "Paste Preview"}</span>
            <button 
              className="paste-preview-close"
              onClick={() => setPastePreview(null)}
            >
              ×
            </button>
          </div>
          <div className="paste-preview-content">
            <ItemPreviewBox
              itemName={itemName}
              styles={{
                ...pastePreview,
                // 인게임 기본값 적용 (null일 때 프리뷰에서 기본값 표시)
                textColor: pastePreview?.textColor || DEFAULT_TEXT_COLOR,
                borderColor: pastePreview?.borderColor || DEFAULT_BORDER_COLOR
              }}
            />
          </div>
        </div>
      )}
      </div>
      
      {/* 알림 모달 */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        lang={lang}
      />

      <style jsx>{`
        /* 모달창 내부 공통 스타일 - 전역 스타일 적용 */
        .style-settings-modal input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0;
          background: transparent;
          position: relative;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .style-settings-modal input[type="checkbox"]:checked {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
        }

        .style-settings-modal input[type="checkbox"]:checked::before {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffffff;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }

        .style-settings-modal input[type="radio"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          cursor: pointer;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          background: transparent;
          outline: none;
          transition: all 0.2s;
        }

        .style-settings-modal input[type="radio"]:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }

        .style-settings-modal input[type="radio"]:checked {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          box-shadow: 0 0 4px rgba(21, 93, 252, 0.3);
        }

        .style-settings-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .style-settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 1;
        }

        .style-settings-content-wrapper {
          position: relative;
          display: flex;
          align-items: flex-start;
          z-index: 2;
        }

        .style-settings-content {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--border);
          width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .rule-add-button-container {
          position: relative;
          z-index: 100;
        }

        .rule-add-button {
          padding: 8px 20px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          height: 36px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .rule-add-button:hover {
          opacity: 0.9;
        }



        .rule-dropdown {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 8px;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          width: 280px;
          max-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .rule-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-size: 16px;
          font-weight: 600;
        }

        .rule-dropdown-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rule-dropdown-close:hover {
          color: var(--text);
        }

        .rule-dropdown-list {
          overflow-y: auto;
          max-height: 350px;
        }

        .rule-dropdown-item {
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: background 0.2s;
        }

        .rule-dropdown-item:hover {
          background: var(--panel2);
        }

        .rule-dropdown-item .rule-code {
          font-size: 12px;
          color: var(--muted);
        }

        .rule-dropdown-empty {
          padding: 24px;
          text-align: center;
          color: var(--muted);
          font-size: 14px;
        }

        .additional-rules-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rule-item {
          padding: 8px 10px;
          background: var(--panel2);
          border: 1px solid var(--border);
          border-radius: 2px;
        }

        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .rule-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .rule-remove-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .rule-remove-btn:hover {
          color: #ff4757;
        }

        .rule-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rule-slider-wrapper {
          flex: 1;
        }

        .rule-operator,
        .rule-value {
          padding: 5px 8px;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          height: 32px;
          box-sizing: border-box;
        }

        .rule-operator {
          min-width: 50px;
          width: 50px;
          text-align: center;
        }

        .rule-value {
          width: 100px;
        }

        .rule-controls-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .rule-operator:focus,
        .rule-value:focus {
          border-color: var(--game-primary);
        }

        .style-preview-panel {
          position: relative;
        }

        .style-preview-panel .preview-label {
          transform: scale(0.9);
          transform-origin: center;
        }

        .preview-close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
        }

        .style-top-controls {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .rule-mode-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rule-mode-select {
          height: 34px;
          padding: 0 8px;
          font-size: 14px;
          font-weight: 600;
          min-width: 120px;
        }

        .style-title-input {
          flex: 1;
          min-width: 100px;
          padding: 6px 10px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s;
        }

        .style-title-input:focus {
          border-color: var(--game-primary);
        }

        .condition-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .condition-row-with-slider {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }

        .condition-label-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .condition-slider-wrapper {
          flex: 1;
        }

        .condition-label {
          font-size: 14px;
          color: var(--text);
          min-width: 70px;
          font-weight: 500;
        }

        .condition-operator {
          padding: 5px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          min-width: 50px;
          width: 50px;
          height: 32px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          text-align: center;
        }

        .condition-operator:focus {
          border-color: var(--game-primary);
        }

        .condition-value {
          width: 100px;
          padding: 5px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          height: 32px;
          box-sizing: border-box;
        }

        .condition-value:focus {
          border-color: var(--game-primary);
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: var(--text);
        }

        .style-settings-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .style-settings-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .condition-settings-group {
          margin-top: 4px;
        }

        .style-setting-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .style-setting-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .style-setting-code {
          font-size: 14px;
          color: var(--muted);
          font-weight: 400;
        }

        .style-input,
        .style-select {
          padding: 6px 10px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          height: 32px;
          box-sizing: border-box;
        }

        .style-input:focus,
        .style-select:focus {
          border-color: var(--game-primary);
        }

        /* 색상 드롭다운 스타일 */
        .color-select {
          font-weight: 500;
        }

        /* 색상 옵션 스타일 - 브라우저마다 지원이 다를 수 있음 */
        .color-select option {
          background: var(--panel2);
          color: var(--text);
        }

        .color-select option[value="Red"] {
          color: #FF0000;
        }

        .color-select option[value="Orange"] {
          color: #FF7F00;
        }

        .color-select option[value="Yellow"] {
          color: #FFFF00;
        }

        .color-select option[value="Pink"] {
          color: #FF69B4;
        }

        .color-select option[value="Blue"] {
          color: #0000FF;
        }

        .color-select option[value="Green"] {
          color: #00FF00;
        }

        .color-select option[value="Brown"] {
          color: #8B4513;
        }

        .color-select option[value="White"] {
          color: #FFFFFF;
        }

        .color-select option[value="Cyan"] {
          color: #00FFFF;
        }

        .color-select option[value="Grey"] {
          color: #808080;
        }

        .font-size-item-left {
          flex: 0 0 auto;
          min-width: 0;
          max-width: 100%;
        }

        .font-size-control {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 300px;
          min-width: 0;
        }

        .font-size-control input[type="range"] {
          flex: 1;
          min-width: 150px;
          max-width: 200px;
        }

        /* 슬라이더 스타일은 전역 CSS에서 관리 */

        .font-size-input {
          width: 48px;
          padding: 4px 6px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          text-align: center;
          height: 32px;
          box-sizing: border-box;
        }

        .color-effect-row {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          padding: 0;
          box-sizing: border-box;
        }

        .color-effect-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .color-effect-item-inline {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .color-effect-item-group-right {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }


        .color-effect-item-inline input[type="checkbox"] {
          position: relative;
          cursor: pointer;
        }

        .style-setting-label-inline {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          min-width: fit-content;
          white-space: nowrap;
        }

        .style-setting-label-inline.label-disabled {
          color: var(--muted, #999);
        }

        .color-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
          margin-right: 8px;
          flex-shrink: 0;
        }


        .sound-setting-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sound-type-select {
          min-width: 100px;
          width: auto;
          flex-shrink: 0;
        }

        .sound-input {
          flex: 1;
          min-width: 0;
        }

        .custom-sound-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--panel2);
          border: 1px solid var(--border);
          box-sizing: border-box;
          height: 32px;
        }

        .custom-sound-input-wrapper .sound-input {
          border: none;
          background: transparent;
        }

        .sound-file-button {
          height: 100%;
          padding: 0 12px;
          background: var(--game-primary);
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }

        .sound-file-button:hover {
          opacity: 0.9;
        }

        .sound-slot-select,
        .sound-volume-select {
          min-width: 85px;
          width: auto;
        }

        .minimap-icon-settings-row {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .minimap-setting-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .minimap-label {
          font-size: 14px;
          color: var(--muted);
          font-weight: 500;
        }

        .minimap-icon-inline-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
          justify-content: flex-start;
          width: 100%;
        }

        /* .color-effect-row는 위에서 이미 정의됨 */

        .minimap-icon-inline-row .style-setting-label,
        .minimap-icon-inline-row .style-setting-label-inline {
          margin: 0;
          min-width: fit-content;
          white-space: nowrap;
        }

        .minimap-inline-select {
          flex: 1;
          min-width: 80px;
          max-width: 110px;
          text-align: left;
        }

        .minimap-inline-select option {
          text-align: left;
        }

        .style-preview-panel {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin: 0;
          padding: 0;
          position: relative;
        }

        .style-settings-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-top: 1px solid var(--border);
        }

        .copy-paste-button-group {
          display: flex;
          gap: 8px;
        }

        .footer-action-buttons {
          display: flex;
          gap: 10px;
        }

        .close-button-primary {
          padding: 8px 20px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          height: 36px;
          box-sizing: border-box;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .close-button-primary:hover {
          opacity: 0.9;
        }

        .reset-button-footer {
          padding: 8px 20px;
          background: transparent;
          border: 2px solid #ff4757;
          color: #ff4757;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          height: 36px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .reset-button-footer:hover {
          background: rgba(255, 71, 87, 0.1);
        }

        .copy-paste-button {
          padding: 8px 16px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          height: 36px;
          box-sizing: border-box;
        }

        .copy-paste-button:hover {
          opacity: 0.9;
        }

        .paste-preview-popup {
          position: absolute;
          right: -320px;
          top: 0;
          width: 300px;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow-y: auto;
        }

        .paste-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--panel2);
        }

        .paste-preview-header span {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .paste-preview-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .paste-preview-close:hover {
          color: var(--text);
        }

        .paste-preview-content {
          padding: 16px;
        }

        .condition-separator {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--muted);
          font-size: 12px;
          margin: 16px 0 12px 0;
          width: 100%;
        }

        .condition-separator::before,
        .condition-separator::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }

        .condition-separator span {
          padding: 0 10px;
          font-weight: 500;
        }

        .condition-row-inline {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .condition-label-text {
          font-size: 14px;
          color: var(--text);
          font-weight: 500;
          white-space: nowrap;
          min-width: 40px;
        }

        .condition-operator-compact {
          padding: 5px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          width: 60px;
          height: 32px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          text-align: center;
          flex-shrink: 0;
        }
        
        .condition-operator-compact:focus {
           border-color: var(--game-primary);
        }

        .condition-slider-wrapper-inline {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 0; 
        }

        @media (max-width: 900px) {
          .style-settings-layout {
            grid-template-columns: 1fr;
          }

          .paste-preview-popup {
            right: 0;
            top: auto;
            bottom: 0;
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}
