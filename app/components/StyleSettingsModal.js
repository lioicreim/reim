"use client";

import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import ItemPreviewBox from "./ItemPreviewBox";
import OperatorSlider from "./OperatorSlider";
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
  onConditionsChange
}) {
  const [localStyles, setLocalStyles] = useState({
    fontSize: 30,
    textColor: { r: 210, g: 178, b: 135, a: 255 },
    borderColor: null,
    backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
    playEffect: null,
    minimapIcon: {
      size: null,
      color: null,
      shape: null
    },
    ...styles
  });

  const [localRules, setLocalRules] = useState(additionalRules || []);
  const [showRuleDropdown, setShowRuleDropdown] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localConditions, setLocalConditions] = useState(conditions || {});
  const [areaLevelInputMode, setAreaLevelInputMode] = useState(false);
  const [lang, setLang] = useState("ko");

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

  useEffect(() => {
    if (isOpen) {
      // styles가 변경될 때마다 localStyles 업데이트
      setLocalStyles({
        fontSize: styles.fontSize ?? 30,
        textColor: styles.textColor || { r: 210, g: 178, b: 135, a: 255 },
        borderColor: styles.borderColor ?? null,
        backgroundColor: styles.backgroundColor || { r: 0, g: 0, b: 0, a: 255 },
        playEffect: styles.playEffect ?? null,
        minimapIcon: styles.minimapIcon || {
          size: null,
          color: null,
          shape: null
        },
        ...styles
      });
      setLocalRules(additionalRules || []);
      setLocalTitle(title || "");
      setLocalConditions(conditions || {});
    }
  }, [isOpen, styles, additionalRules, title, conditions]);

  if (!isOpen) return null;

  const handleStyleChange = (key, value) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
  };

  const handleTitleChange = (newTitle) => {
    setLocalTitle(newTitle);
  };

  const handleConditionChange = (conditionKey, field, value) => {
    const newConditions = { ...localConditions };
    if (!newConditions[conditionKey]) {
      newConditions[conditionKey] = {};
    }
    newConditions[conditionKey][field] = value;
    setLocalConditions(newConditions);
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
    onClose();
  };

  const handleMinimapIconChange = (key, value) => {
    const newMinimapIcon = { ...localStyles.minimapIcon, [key]: value };
    handleStyleChange("minimapIcon", newMinimapIcon);
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

  return (
    <div className="style-settings-modal">
      <div className="style-settings-overlay" onClick={onClose}></div>
      <div className="style-settings-content">
        <div className="style-settings-header">
          {title !== undefined && onTitleChange ? (
            <input
              type="text"
              className="style-title-input"
              value={localTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="규칙 제목"
            />
          ) : (
            <h2>스타일 설정</h2>
          )}
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="style-settings-body">
          {/* 프리뷰 (맨 위) */}
          <div className="style-preview-panel">
            <ItemPreviewBox
              itemName={itemName}
              styles={localStyles}
            />
          </div>

          {/* 공통 기본 규칙 (프리뷰 아래) */}
          <div className="style-settings-panel">
            {/* 폰트 크기 */}
            <div className="style-setting-group">
              <label className="style-setting-label">
                <span>폰트 크기</span>
              </label>
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

            {/* 테두리 색상 / 배경 색상 / 빛기둥 (한 줄) */}
            <div className="style-setting-group">
              <div className="color-effect-row">
                <div className="color-effect-item">
                  <label className="style-setting-label">
                    <span>테두리 색상</span>
                  </label>
                  <ColorPicker
                    color={localStyles.borderColor || { r: 0, g: 0, b: 0, a: 255 }}
                    onChange={(color) => handleStyleChange("borderColor", color)}
                    showCheckbox={true}
                    checked={localStyles.borderColor !== null}
                    onCheckboxChange={(checked) => 
                      handleStyleChange("borderColor", checked ? { r: 0, g: 0, b: 0, a: 255 } : null)
                    }
                  />
                </div>
                <div className="color-effect-item">
                  <label className="style-setting-label">
                    <span>배경 색상</span>
                  </label>
                  <ColorPicker
                    color={localStyles.backgroundColor || { r: 0, g: 0, b: 0, a: 255 }}
                    onChange={(color) => handleStyleChange("backgroundColor", color)}
                    showCheckbox={true}
                    checked={localStyles.backgroundColor !== null}
                    onCheckboxChange={(checked) => 
                      handleStyleChange("backgroundColor", checked ? { r: 0, g: 0, b: 0, a: 255 } : null)
                    }
                  />
                </div>
                <div className="color-effect-item">
                  <label className="style-setting-label">
                    <span>빛기둥</span>
                  </label>
                  <select
                    className="style-select"
                    value={localStyles.playEffect || ""}
                    onChange={(e) => handleStyleChange("playEffect", e.target.value || null)}
                  >
                    {playEffectOptions.map((option) => (
                      <option key={option.value || "none"} value={option.value || ""}>
                        {lang === "ko" ? option.label : option.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 미니맵 아이콘 (크기/색상/모양 한 줄) */}
            <div className="style-setting-group">
              <label className="style-setting-label">
                <span>미니맵 아이콘</span>
              </label>
              <div className="minimap-icon-settings-row">
                <div className="minimap-setting-item">
                  <label className="minimap-label">크기</label>
                  <select
                    className="style-select"
                    value={localStyles.minimapIcon?.size ?? ""}
                    onChange={(e) => handleMinimapIconChange("size", e.target.value ? parseInt(e.target.value) : null)}
                  >
                    {minimapSizeOptions.map((option) => (
                      <option key={option.value ?? "none"} value={option.value ?? ""}>
                        {lang === "ko" ? option.label : option.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="minimap-setting-item">
                  <label className="minimap-label">색상</label>
                  <select
                    className="style-select color-select"
                    value={localStyles.minimapIcon?.color || ""}
                    onChange={(e) => handleMinimapIconChange("color", e.target.value || null)}
                    style={{
                      color: localStyles.minimapIcon?.color ? colorValueMap[localStyles.minimapIcon.color] || "var(--text)" : "var(--text)"
                    }}
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
                </div>

                <div className="minimap-setting-item">
                  <label className="minimap-label">모양</label>
                  <select
                    className="style-select"
                    value={localStyles.minimapIcon?.shape || ""}
                    onChange={(e) => handleMinimapIconChange("shape", e.target.value || null)}
                  >
                    {minimapShapeOptions.map((option) => (
                      <option key={option.value || "none"} value={option.value || ""}>
                        {lang === "ko" ? option.label : option.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 공통이 아닌 규칙 (맨 아래) */}
          {baseType === "Gold" && (conditions !== undefined && onConditionsChange) && (
            <div className="style-setting-group condition-settings-group">
              <label className="style-setting-label">
                <span>조건 설정</span>
              </label>
              
              {/* StackSize 조건 */}
              {localConditions.stackSize && (
                <div className="condition-row-with-slider">
                  <div className="condition-label-wrapper">
                    <span className="condition-label">골드</span>
                    <select
                      className="condition-operator"
                      value={localConditions.stackSize.operator || ">="}
                      onChange={(e) => handleConditionChange("stackSize", "operator", e.target.value)}
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
                      value={localConditions.stackSize.value || 0}
                      onChange={(newValue) => handleConditionChange("stackSize", "value", newValue)}
                      operator={localConditions.stackSize.operator || ">="}
                      min={0}
                      max={10000}
                      step={10}
                    />
                  </div>
                </div>
              )}

                  {/* AreaLevel 조건 */}
                  {localConditions.areaLevel && (() => {
                    const areaLevel = localConditions.areaLevel.value || 0;
                    const pathTier = areaLevelToPathTier(areaLevel);
                    const isPathTier = pathTier !== null && !areaLevelInputMode;
                    
                    return (
                      <div className="condition-row-with-slider">
                        <div className="condition-label-wrapper">
                          <span className="condition-label">지역 레벨</span>
                          <select
                            className="condition-operator"
                            value={localConditions.areaLevel.operator || ">="}
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
                          {isPathTier ? (
                            <button
                              type="button"
                              className="path-tier-display"
                              onClick={() => setAreaLevelInputMode(true)}
                              style={{ 
                                color: "var(--game-primary)", 
                                fontSize: "12px",
                                padding: "5px 8px",
                                background: "var(--panel2)",
                                border: "1px solid var(--border)",
                                borderRadius: "2px",
                                width: "100px",
                                height: "32px",
                                textAlign: "center",
                                display: "inline-block",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                boxSizing: "border-box"
                              }}
                            >
                              T{pathTier} 경로석
                            </button>
                          ) : (
                            <OperatorSlider
                              value={areaLevel}
                              onChange={(newValue) => {
                                handleConditionChange("areaLevel", "value", newValue);
                                setAreaLevelInputMode(false);
                              }}
                              operator={localConditions.areaLevel.operator || ">="}
                              min={1}
                              max={100}
                              step={1}
                            />
                          )}
                        </div>
                      </div>
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

        {/* 하단 버튼 영역 (규칙 추가 + 적용) */}
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
          <button className="close-button-primary" onClick={handleApply}>
            적용
          </button>
        </div>
      </div>

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
        }

        .style-settings-content {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--border);
          width: 90%;
          max-width: 700px;
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
          padding: 8px 16px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          height: 36px;
          box-sizing: border-box;
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
          font-size: 16px;
          color: var(--muted);
        }

        .rule-dropdown-empty {
          padding: 24px;
          text-align: center;
          color: var(--muted);
          font-size: 16px;
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
          font-size: 16px;
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

        .style-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .style-settings-header h2 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .style-title-input {
          flex: 1;
          padding: 6px 10px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 16px;
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
          font-size: 16px;
          color: var(--text);
          min-width: 70px;
          font-weight: 500;
        }

        .condition-operator {
          padding: 5px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 16px;
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
          font-size: 16px;
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
          font-size: 28px;
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
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .style-setting-code {
          font-size: 16px;
          color: var(--muted);
          font-weight: 400;
        }

        .style-input,
        .style-select {
          padding: 6px 10px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 16px;
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

        .font-size-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .font-size-control input[type="range"] {
          flex: 1;
        }

        /* 슬라이더 스타일은 전역 CSS에서 관리 */

        .font-size-input {
          width: 48px;
          padding: 4px 6px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 16px;
          text-align: center;
          height: 32px;
          box-sizing: border-box;
        }

        .color-effect-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .color-effect-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
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
          font-size: 16px;
          color: var(--muted);
          font-weight: 500;
        }

        .style-preview-panel {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 16px;
        }

        .style-settings-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-top: 1px solid var(--border);
        }

        .close-button-primary {
          padding: 8px 20px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          height: 36px;
          box-sizing: border-box;
        }

        .close-button-primary:hover {
          opacity: 0.9;
        }

        @media (max-width: 900px) {
          .style-settings-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
