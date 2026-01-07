"use client";

import { useState, useEffect } from "react";
import presetsData from "@/data/presets.json";
import { generateFilterCode } from "@/lib/filter-generator";

export default function PresetsPage() {
  const [selectedPreset, setSelectedPreset] = useState("starter");
  const [lang, setLang] = useState("ko");

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

  const allPresets = presetsData.presets.filter(p => !p.id.startsWith("ps5-"));
  const currentPreset = presetsData.presets.find(p => p.id === selectedPreset);

  // PS5 체크박스 상태
  const [isPS5, setIsPS5] = useState(false);

  // 제외 옵션 체크박스 상태
  const [excludedOptions, setExcludedOptions] = useState({
    emotionScroll: false,
    socketItem: false,
    craftingBaseNormal: false,
    disassembleItem: false,
    classChangeItem: false,
  });

  // 커스텀 티어 상태 (로컬스토리지에서 불러오기)
  const [customGearTiers, setCustomGearTiers] = useState({});
  const [customCurrencyTiers, setCustomCurrencyTiers] = useState({});
  const [selectedLeague, setSelectedLeague] = useState("default");

  // 로컬스토리지에서 커스텀 티어 불러오기
  useEffect(() => {
    const savedGearTiers = localStorage.getItem("tier-list-custom-gear");
    if (savedGearTiers) {
      try {
        setCustomGearTiers(JSON.parse(savedGearTiers));
      } catch (e) {
        console.error("Failed to parse saved gear tiers:", e);
      }
    }

    const currencyKey = `tier-list-custom-currency-${selectedLeague}`;
    const savedCurrencyTiers = localStorage.getItem(currencyKey);
    if (savedCurrencyTiers) {
      try {
        setCustomCurrencyTiers(JSON.parse(savedCurrencyTiers));
      } catch (e) {
        console.error("Failed to parse saved currency tiers:", e);
      }
    }
  }, [selectedLeague]);

  // 프리셋 적용 및 다운로드
  const handleApplyPreset = () => {
    try {
      const filterCode = generateFilterCode({
        presetId: selectedPreset,
        isPS5: isPS5,
        excludedOptions: excludedOptions,
        customGearTiers: customGearTiers,
        customCurrencyTiers: customCurrencyTiers,
        selectedLeague: selectedLeague,
      });

      // 필터 코드를 파일로 다운로드
      const blob = new Blob([filterCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentPreset?.nameKo || currentPreset?.name || "filter"}.filter`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(lang === "ko" ? "필터가 다운로드되었습니다!" : "Filter downloaded!");
    } catch (error) {
      console.error("Filter generation failed:", error);
      alert(lang === "ko" ? "필터 생성 중 오류가 발생했습니다." : "Error generating filter.");
    }
  };


  return (
    <main className="container">
      <div className="card">
        <div className="cardBody">
          {/* 프리셋 선택 영역 */}
          <div className="preset-selection-section">
            <p className="preset-selection-label">
              {lang === "ko" ? "프리셋을 선택하세요" : "SELECT WHERE YOU ARE AT IN THE GAME"}
            </p>
            <div className="presets-radio-group">
              {allPresets.map((preset) => {
                const presetName = lang === "ko" ? preset.nameKo : preset.name;
                return (
                  <label key={preset.id} className="preset-radio-option">
                    <input
                      type="radio"
                      name="preset"
                      value={preset.id}
                      checked={selectedPreset === preset.id}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                    />
                    <span className="preset-radio-label">{presetName}</span>
                  </label>
                );
              })}
            </div>
            <div className="ps5-checkbox-section">
              <label className="ps5-checkbox" title={lang === "ko" ? "기본 사운드로 변경됩니다" : "Will change to default sound"}>
                <input
                  type="checkbox"
                  checked={isPS5}
                  onChange={(e) => setIsPS5(e.target.checked)}
                />
                <span>{lang === "ko" ? "PS5" : "PS5"}</span>
              </label>
            </div>
          </div>

          {/* 선택된 프리셋 설명 및 제외 옵션 */}
          {currentPreset && (
            <div className="preset-details-section">
              <p className="preset-description-text">
                {lang === "ko" ? currentPreset.descriptionKo : currentPreset.description}
              </p>

              <div className="preset-description-divider"></div>

              <div className="exclude-options-section">
                <p className="exclude-options-label">
                  {lang === "ko" ? "숨기고 싶은 목록을 체크하세요" : "CHECK ITEMS YOU WANT TO HIDE"}
                </p>
                <div className="exclude-options-list">
                  <label className="exclude-option">
                    <input
                      type="checkbox"
                      checked={excludedOptions.emotionScroll}
                      onChange={(e) => setExcludedOptions({ ...excludedOptions, emotionScroll: e.target.checked })}
                    />
                    <span>{lang === "ko" ? "감정 주문서" : "Emotion Scroll"}</span>
                  </label>
                  <label className="exclude-option">
                    <input
                      type="checkbox"
                      checked={excludedOptions.socketItem}
                      onChange={(e) => setExcludedOptions({ ...excludedOptions, socketItem: e.target.checked })}
                    />
                    <span>{lang === "ko" ? "소켓 아이템" : "Socket Item"}</span>
                  </label>
                  <label className="exclude-option">
                    <input
                      type="checkbox"
                      checked={excludedOptions.craftingBaseNormal}
                      onChange={(e) => setExcludedOptions({ ...excludedOptions, craftingBaseNormal: e.target.checked })}
                    />
                    <span>{lang === "ko" ? "제작 베이스 (일반)" : "Crafting Base (Normal)"}</span>
                  </label>
                  <label className="exclude-option">
                    <input
                      type="checkbox"
                      checked={excludedOptions.disassembleItem}
                      onChange={(e) => setExcludedOptions({ ...excludedOptions, disassembleItem: e.target.checked })}
                    />
                    <span>{lang === "ko" ? "분해용 아이템" : "Disassemble Item"}</span>
                  </label>
                  <label className="exclude-option">
                    <input
                      type="checkbox"
                      checked={excludedOptions.classChangeItem}
                      onChange={(e) => setExcludedOptions({ ...excludedOptions, classChangeItem: e.target.checked })}
                    />
                    <span>{lang === "ko" ? "전직 아이템" : "Class Change Item"}</span>
                  </label>
                </div>
              </div>

              <div className="preset-actions">
                <button 
                  className="btn-primary"
                  onClick={handleApplyPreset}
                >
                  {lang === "ko" ? "이 프리셋 적용" : "Apply This Preset"}
                </button>
                <button 
                  className="btn-secondary"
                  title={lang === "ko" ? "현재 프리셋을 기반으로 새로운 커스텀 프리셋을 만듭니다" : "Create a new custom preset based on the current preset"}
                >
                  {lang === "ko" ? "프리셋 복제" : "Clone Preset"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preset-selection-section {
          margin-bottom: 32px;
        }

        .preset-selection-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .presets-radio-group {
          display: flex;
          flex-direction: row;
          gap: 24px;
          margin-bottom: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .preset-radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
          user-select: none;
        }

        .preset-radio-option input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .preset-radio-label {
          flex: 1;
        }

        .preset-radio-option:hover {
          color: var(--text);
        }

        .ps5-checkbox-section {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }

        .ps5-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
          user-select: none;
        }

        .ps5-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .ps5-checkbox:hover {
          color: var(--text);
        }

        .preset-details-section {
          padding-top: 24px;
          border-top: 1px solid var(--border);
          min-height: 400px;
        }

        .preset-description-text {
          font-size: 14px;
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 24px;
          text-align: center;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          white-space: pre-line;
        }

        .preset-description-divider {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin: 24px 0;
        }

        .exclude-options-section {
          margin-bottom: 24px;
        }

        .exclude-options-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          text-align: center;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .exclude-options-list {
          display: flex;
          flex-direction: row;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .exclude-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
          user-select: none;
        }

        .exclude-option input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .exclude-option:hover {
          color: var(--text);
        }

        .preset-actions {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          padding-bottom: 24px;
          border-top: 1px solid var(--border);
          justify-content: flex-end;
          height: 80px;
          align-items: center;
          box-sizing: border-box;
        }

        .btn-primary {
          padding: 12px 24px;
          background: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          min-width: 160px;
          white-space: nowrap;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: var(--panel2);
          color: var(--text);
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          min-width: 120px;
          white-space: nowrap;
        }

        .btn-secondary:hover {
          background: var(--panel);
        }

        @media (max-width: 768px) {
          .presets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
