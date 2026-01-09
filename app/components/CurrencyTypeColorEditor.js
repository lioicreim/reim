"use client";

import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import defaultColorsData from "@/data/currency-type-default-colors.json";

/**
 * 화폐 종류별 티어 색상 편집 모달
 * @param {Object} props
 * @param {string} props.currencyTypeId - 편집할 화폐 종류 ID (예: "currency", "runes")
 * @param {string} props.currencyTypeName - 화폐 종류 이름 (표시용)
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 콜백
 * @param {Function} props.onSave - 저장 콜백 (colors 객체 전달)
 * @param {string} props.lang - 언어 ("ko" | "en")
 */
export default function CurrencyTypeColorEditor({
  currencyTypeId,
  currencyTypeName,
  isOpen,
  onClose,
  onSave,
  lang = "ko",
}) {
  const [colors, setColors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // 기본 색상 불러오기
  useEffect(() => {
    if (!isOpen || !currencyTypeId) return;

    // localStorage에서 저장된 색상 불러오기
    const savedColors = typeof window !== "undefined" 
      ? JSON.parse(localStorage.getItem("currency-type-colors") || "{}")
      : {};
    
    // 기본 색상과 저장된 색상 병합
    const defaultColorData = defaultColorsData[currencyTypeId] || {};
    const savedColorData = savedColors[currencyTypeId] || {};
    
    const mergedColors = {};
    ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
      // 저장된 색상이 있으면 사용, 없으면 기본값 사용
      mergedColors[tier] = savedColorData[tier] || defaultColorData[tier] || null;
    });
    
    setColors(mergedColors);
    setHasChanges(false);
  }, [isOpen, currencyTypeId]);

  // 색상 변경 핸들러
  const handleColorChange = (tier, colorType, color) => {
    setColors((prev) => {
      const newColors = { ...prev };
      if (!newColors[tier]) {
        newColors[tier] = {};
      }
      newColors[tier] = {
        ...newColors[tier],
        [colorType]: color,
      };
      return newColors;
    });
    setHasChanges(true);
  };

  // 기본값으로 복원
  const handleReset = () => {
    const defaultColorData = defaultColorsData[currencyTypeId] || {};
    setColors(defaultColorData);
    setHasChanges(true);
  };

  // 저장
  const handleSave = () => {
    // localStorage에 저장
    const savedColors = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currency-type-colors") || "{}")
      : {};
    
    savedColors[currencyTypeId] = colors;
    localStorage.setItem("currency-type-colors", JSON.stringify(savedColors));
    
    // 부모 컴포넌트에 저장 알림
    if (onSave) {
      onSave(currencyTypeId, colors);
    }
    
    setHasChanges(false);
    onClose();
  };

  // 취소
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm(lang === "ko" ? "변경사항이 있습니다. 정말 닫으시겠습니까?" : "You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const tiers = ["S", "A", "B", "C", "D", "E"];

  return (
    <div className="color-editor-overlay" onClick={handleCancel}>
      <div className="color-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="color-editor-header">
          <h2 className="color-editor-title">
            {currencyTypeName} {lang === "ko" ? "색상 편집" : "Color Editor"}
          </h2>
          <button className="color-editor-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="color-editor-content">
          {tiers.map((tier) => {
            const tierColor = colors[tier];
            if (!tierColor) return null; // 티어가 없으면 표시하지 않음

            return (
              <div key={tier} className="color-editor-tier-section">
                <div className="color-editor-tier-header">
                  <span className="color-editor-tier-label">{tier} 티어</span>
                </div>
                <div className="color-editor-color-pickers">
                  <div className="color-editor-color-group">
                    <label className="color-editor-label">
                      {lang === "ko" ? "폰트 색상" : "Text Color"}
                    </label>
                    <ColorPicker
                      color={tierColor.textColor || { r: 0, g: 0, b: 0, a: 255 }}
                      onChange={(color) => handleColorChange(tier, "textColor", color)}
                    />
                  </div>
                  <div className="color-editor-color-group">
                    <label className="color-editor-label">
                      {lang === "ko" ? "테두리 색상" : "Border Color"}
                    </label>
                    <ColorPicker
                      color={tierColor.borderColor || { r: 0, g: 0, b: 0, a: 255 }}
                      onChange={(color) => handleColorChange(tier, "borderColor", color)}
                    />
                  </div>
                  <div className="color-editor-color-group">
                    <label className="color-editor-label">
                      {lang === "ko" ? "배경 색상" : "Background Color"}
                    </label>
                    <ColorPicker
                      color={tierColor.backgroundColor || { r: 0, g: 0, b: 0, a: 255 }}
                      onChange={(color) => handleColorChange(tier, "backgroundColor", color)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="color-editor-footer">
          <button className="color-editor-reset" onClick={handleReset}>
            {lang === "ko" ? "기본값으로 복원" : "Reset to Default"}
          </button>
          <div className="color-editor-actions">
            <button className="color-editor-cancel" onClick={handleCancel}>
              {lang === "ko" ? "취소" : "Cancel"}
            </button>
            <button
              className="color-editor-save"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              {lang === "ko" ? "저장" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .color-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .color-editor-modal {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .color-editor-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .color-editor-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .color-editor-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 32px;
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

        .color-editor-close:hover {
          color: var(--text);
        }

        .color-editor-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .color-editor-tier-section {
          margin-bottom: 32px;
        }

        .color-editor-tier-section:last-child {
          margin-bottom: 0;
        }

        .color-editor-tier-header {
          margin-bottom: 16px;
        }

        .color-editor-tier-label {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .color-editor-color-pickers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .color-editor-color-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .color-editor-label {
          font-size: 14px;
          color: var(--muted);
          font-weight: 600;
        }

        .color-editor-footer {
          padding: 20px 24px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .color-editor-reset {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-editor-reset:hover {
          border-color: var(--text);
          color: var(--text);
        }

        .color-editor-actions {
          display: flex;
          gap: 12px;
        }

        .color-editor-cancel,
        .color-editor-save {
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .color-editor-cancel {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .color-editor-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .color-editor-save {
          background: var(--poe2-primary, var(--game-primary));
          color: #ffffff;
        }

        .color-editor-save:hover:not(:disabled) {
          opacity: 0.9;
        }

        .color-editor-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .color-editor-color-pickers {
            grid-template-columns: 1fr;
          }

          .color-editor-footer {
            flex-direction: column;
            gap: 12px;
          }

          .color-editor-reset,
          .color-editor-actions {
            width: 100%;
          }

          .color-editor-actions {
            justify-content: stretch;
          }

          .color-editor-cancel,
          .color-editor-save {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
