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

  // 사운드 선택 상태 (default, ps5, none)
  const [soundOption, setSoundOption] = useState("default");
  
  // isPS5는 기존 로직 호환성을 위해 유지
  const isPS5 = soundOption === "ps5";

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
            {/* 선택된 프리셋 설명 */}
            {currentPreset && (
              <p className="preset-description-text">
                {lang === "ko" ? currentPreset.descriptionKo : currentPreset.description}
              </p>
            )}
          </div>

          {/* 사운드 선택 및 제외 옵션 */}
          {currentPreset && (
            <div className="preset-details-section">
              {/* 사운드 선택 영역 */}
              <div className="sound-selection-section">
                <p className="sound-selection-label">
                  {lang === "ko" ? "사운드를 설정하세요" : "SELECT SOUND SETTING"}
                </p>
                <div className="sound-radio-group">
                  <label className="sound-radio-option">
                    <input
                      type="radio"
                      name="sound"
                      value="default"
                      checked={soundOption === "default"}
                      onChange={(e) => setSoundOption(e.target.value)}
                    />
                    <span className="sound-radio-label">{lang === "ko" ? "기본값" : "Default"}</span>
                  </label>
                  <label className="sound-radio-option">
                    <input
                      type="radio"
                      name="sound"
                      value="ps5"
                      checked={soundOption === "ps5"}
                      onChange={(e) => setSoundOption(e.target.value)}
                    />
                    <span className="sound-radio-label">{lang === "ko" ? "PS5" : "PS5"}</span>
                  </label>
                  <label className="sound-radio-option">
                    <input
                      type="radio"
                      name="sound"
                      value="none"
                      checked={soundOption === "none"}
                      onChange={(e) => setSoundOption(e.target.value)}
                    />
                    <span className="sound-radio-label">{lang === "ko" ? "모든 사운드 제거" : "Remove All Sounds"}</span>
                  </label>
                </div>
              </div>

              <div className="sound-section-divider"></div>

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
        .container {
          background: #0a0a0a;
        }

        .card {
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .cardBody {
          padding: 0;
        }

        .preset-selection-section {
          margin-bottom: 16px;
        }

        .preset-description-text {
          font-size: 14px;
          color: var(--text);
          line-height: 1.6;
          margin-top: 24px;
          margin-bottom: 0;
          text-align: center;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          white-space: pre-line;
          background: #1a1a1a;
          border-radius: 0;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
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

        .sound-selection-section {
          margin-bottom: 32px;
        }

        .sound-selection-label {
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

        .sound-radio-group {
          display: flex;
          flex-direction: row;
          gap: 24px;
          margin-bottom: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .sound-radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
          user-select: none;
        }

        .sound-radio-option input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .sound-radio-label {
          flex: 1;
        }

        .sound-radio-option:hover {
          color: var(--text);
        }

        .sound-section-divider {
          width: 400px;
          height: 1px;
          background: var(--border);
          margin: 32px auto;
        }

        .preset-details-section {
          padding-top: 24px;
          border-top: none;
          min-height: 400px;
          background: transparent;
        }

        .exclude-options-section {
          margin-bottom: 24px;
        }

        .exclude-options-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          text-align: center;
          height: 24px;
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
          border-top: none;
          justify-content: center;
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
          border-radius: 0;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: #1a1a1a;
          color: var(--text);
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          min-width: 120px;
          white-space: nowrap;
          border-radius: 0;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
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
