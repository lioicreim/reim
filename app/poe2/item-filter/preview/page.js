"use client";

import { useState, useEffect } from "react";
import presetsData from "@/data/presets.json";
import currencyTiers from "@/data/currency-tiers.json";
import bases from "@/data/bases.json";
import { generateFilterCode } from "@/lib/filter-generator";
import { translateItemName } from "@/lib/translations";

export default function PreviewPage() {
  const [selectedPreset, setSelectedPreset] = useState("starter");
  const [selectedLeague, setSelectedLeague] = useState("default");
  const [isPS5, setIsPS5] = useState(false);
  const [lang, setLang] = useState("ko");
  const [filterCode, setFilterCode] = useState("");
  const [showCodePreview, setShowCodePreview] = useState(false);

  // 섹션 체크박스 상태
  const [sections, setSections] = useState({
    currency: true,
    uniques: true,
    tierList: true,
    breach: true,
    tablet: true,
  });

  // 커스텀 티어 상태
  const [customGearTiers, setCustomGearTiers] = useState({});
  const [customCurrencyTiers, setCustomCurrencyTiers] = useState({});

  // 제외 옵션
  const [excludedOptions, setExcludedOptions] = useState({
    emotionScroll: false,
    craftingBaseNormal: false,
    classChangeItem: false,
  });

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

    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    const currencyKey = `tier-list-custom-currency-${leagueKey}`;
    const savedCurrencyTiers = localStorage.getItem(currencyKey);
    if (savedCurrencyTiers) {
      try {
        setCustomCurrencyTiers(JSON.parse(savedCurrencyTiers));
      } catch (e) {
        console.error("Failed to parse saved currency tiers:", e);
      }
    }
  }, [selectedLeague]);

  // 코드 하이라이팅 함수 (Show/Hide만 흰색, 나머지는 베이지색)
  const highlightCode = (code) => {
    if (!code) return '';
    
    // HTML 특수문자 이스케이프
    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    };
    
    const escaped = escapeHtml(code);
    // Show/Hide 키워드만 흰색으로 처리
    return escaped.replace(/\b(Show|Hide)\b/g, '<span style="color: #FFFFFF;">$1</span>');
  };

  // 필터 코드 생성
  const handleGeneratePreview = () => {
    try {
      // 빠른 설정에서 골드 설정 불러오기
      let quickFilterSettings = null;
      if (typeof window !== "undefined") {
        const savedGold = localStorage.getItem("quickFilter_gold");
        if (savedGold) {
          try {
            quickFilterSettings = {
              gold: JSON.parse(savedGold),
            };
          } catch (e) {
            console.error("Failed to parse saved gold settings", e);
          }
        }
      }

      const code = generateFilterCode({
        presetId: selectedPreset,
        isPS5: isPS5,
        excludedOptions: excludedOptions,
        customGearTiers: customGearTiers,
        customCurrencyTiers: customCurrencyTiers,
        selectedLeague: selectedLeague,
        quickFilterSettings: quickFilterSettings,
      });
      setFilterCode(code);
      setShowCodePreview(true);
    } catch (error) {
      console.error("Filter generation failed:", error);
      alert(lang === "ko" ? "필터 생성 중 오류가 발생했습니다." : "Error generating filter.");
    }
  };

  // 필터 코드 다운로드
  const handleDownload = () => {
    if (!filterCode) {
      handleGeneratePreview();
      return;
    }

    const preset = presetsData.presets.find((p) => p.id === selectedPreset);
    const blob = new Blob([filterCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset?.nameKo || preset?.name || "filter"}.filter`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 필터 코드 클립보드 복사
  const handleCopyToClipboard = async () => {
    if (!filterCode) {
      handleGeneratePreview();
      return;
    }

    try {
      await navigator.clipboard.writeText(filterCode);
      alert(lang === "ko" ? "클립보드에 복사되었습니다!" : "Copied to clipboard!");
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
      alert(lang === "ko" ? "복사에 실패했습니다." : "Failed to copy!");
    }
  };

  // 초기화
  const handleReset = () => {
    setFilterCode("");
    setShowCodePreview(false);
    setCustomGearTiers({});
    setCustomCurrencyTiers({});
    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    const currencyKey = `tier-list-custom-currency-${leagueKey}`;
    localStorage.removeItem("tier-list-custom-gear");
    localStorage.removeItem(currencyKey);
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

  // 미리보기 아이템 데이터 생성 (화폐 + 장비 샘플)
  const getPreviewItems = () => {
    const items = [];
    const preset = presetsData.presets.find((p) => p.id === selectedPreset);
    if (!preset) return items;

    const leagueKey = selectedLeague === "default" ? "normal" : selectedLeague;
    const leagueData = currencyTiers[leagueKey] || currencyTiers.normal || {};

    // 화폐 아이템 추가
    if (sections.currency) {
      preset.rules.currencyTiers?.forEach((tier) => {
        const currencyItems = leagueData[tier] || [];
        currencyItems.slice(0, 2).forEach((itemName) => {
          items.push({
            name: itemName,
            type: "currency",
            tier: tier,
          });
        });
      });
    }

    // 장비 아이템 추가
    if (sections.tierList) {
      preset.rules.gearTiers?.forEach((tier) => {
        const gearItems = Object.keys(bases)
          .filter((name) => {
            const item = bases[name];
            let finalTier = item.tier || 4;
            if (customGearTiers[name]) {
              const tierMap = { S: 1, A: 2, B: 3, C: 4, D: 5, E: 6 };
              finalTier = tierMap[customGearTiers[name]] || finalTier;
            }
            return finalTier === tier;
          })
          .slice(0, 2);

        gearItems.forEach((itemName) => {
          items.push({
            name: itemName,
            type: "gear",
            tier: tier,
          });
        });
      });
    }

    return items;
  };

  const previewItems = getPreviewItems();
  const currentPreset = presetsData.presets.find((p) => p.id === selectedPreset);

  // 평균 시세 옵션
  const leagueOptions = [
    { id: "default", name: "기본값" },
    { id: "early", name: "리그 초반" },
    { id: "normal", name: "리그 중반" },
    { id: "late", name: "리그 후반" },
    { id: "ssf", name: "SSF" },
  ];

  // 인게임 기본값
  const DEFAULT_TEXT_COLOR = { r: 210, g: 178, b: 135, a: 255 };
  const DEFAULT_BACKGROUND_COLOR = { r: 0, g: 0, b: 0, a: 255 };
  // 테두리는 기본값이 없음 (표시 안됨)

  // 티어별 색상 (필터 코드에서 색상이 없을 때 기본값 적용)
  const getTierColor = (tier) => {
    // 인게임 폰트 크기 기준: S~B: 45, C~D: 42, E: 38
    // 프리뷰에서는 50% 축소 적용 (임시 미리보기 화면이므로)
    const tierMap = {
      S: { bg: "#ffffff", text: "#ff0000", beam: "#ff0000", fontSize: 45 * 0.5 }, // 22.5
      A: { bg: "rgb(204, 90, 138)", text: "#ffffff", beam: "#ff8800", fontSize: 45 * 0.5 }, // 22.5
      B: { bg: "rgb(205, 82, 80)", text: "#ffffff", beam: "#ffff00", fontSize: 45 * 0.5 }, // 22.5
      C: { bg: "rgb(255, 165, 0)", text: "#000000", beam: "#ffff00", fontSize: 42 * 0.5 }, // 21
      D: { 
        bg: `rgb(${DEFAULT_BACKGROUND_COLOR.r}, ${DEFAULT_BACKGROUND_COLOR.g}, ${DEFAULT_BACKGROUND_COLOR.b})`, 
        text: `rgb(${DEFAULT_TEXT_COLOR.r}, ${DEFAULT_TEXT_COLOR.g}, ${DEFAULT_TEXT_COLOR.b})`, 
        beam: "#ffffff",
        fontSize: 42 * 0.5 // 21
      },
      E: { 
        bg: `rgb(${DEFAULT_BACKGROUND_COLOR.r}, ${DEFAULT_BACKGROUND_COLOR.g}, ${DEFAULT_BACKGROUND_COLOR.b})`, 
        text: `rgb(${DEFAULT_TEXT_COLOR.r}, ${DEFAULT_TEXT_COLOR.g}, ${DEFAULT_TEXT_COLOR.b})`, 
        beam: "#ffffff",
        fontSize: 38 * 0.5 // 19
      },
      1: { bg: "#ffffff", text: "#ff0000", beam: "#ff0000", fontSize: 45 * 0.5 }, // 22.5
      2: { bg: "rgb(204, 90, 138)", text: "#ffffff", beam: "#ff8800", fontSize: 45 * 0.5 }, // 22.5
      3: { bg: "rgb(205, 82, 80)", text: "#ffffff", beam: "#ffff00", fontSize: 45 * 0.5 }, // 22.5
      4: { 
        bg: `rgb(${DEFAULT_BACKGROUND_COLOR.r}, ${DEFAULT_BACKGROUND_COLOR.g}, ${DEFAULT_BACKGROUND_COLOR.b})`, 
        text: `rgb(${DEFAULT_TEXT_COLOR.r}, ${DEFAULT_TEXT_COLOR.g}, ${DEFAULT_TEXT_COLOR.b})`, 
        beam: "#ffff00",
        fontSize: 42 * 0.5 // 21
      },
    };
    return tierMap[tier] || tierMap.D;
  };

  return (
    <main className="container">
      <div className="preview-layout">
        <div className="preview-layout-top">
          {/* 왼쪽 사이드바 */}
          <div className="preview-sidebar">
          <div className="sidebar-section">
            <label className="sidebar-toggle-all">
              <input
                type="checkbox"
                checked={Object.values(sections).every(v => v)}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setSections({
                    currency: newValue,
                    uniques: newValue,
                    tierList: newValue,
                    breach: newValue,
                    tablet: newValue,
                  });
                }}
              />
              <span>{lang === "ko" ? "전체 선택" : "TOGGLE ALL SECTIONS"}</span>
            </label>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={sections.currency}
                onChange={(e) => setSections({ ...sections, currency: e.target.checked })}
              />
              <span>{lang === "ko" ? "화폐" : "CURRENCY"}</span>
            </label>
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={sections.uniques}
                onChange={(e) => setSections({ ...sections, uniques: e.target.checked })}
              />
              <span>{lang === "ko" ? "유니크" : "UNIQUES"}</span>
            </label>
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={sections.tierList}
                onChange={(e) => setSections({ ...sections, tierList: e.target.checked })}
              />
              <span>{lang === "ko" ? "티어 리스트" : "TIER LIST"}</span>
            </label>
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={sections.breach}
                onChange={(e) => setSections({ ...sections, breach: e.target.checked })}
              />
              <span>{lang === "ko" ? "균열석" : "BREACH"}</span>
            </label>
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={sections.tablet}
                onChange={(e) => setSections({ ...sections, tablet: e.target.checked })}
              />
              <span>{lang === "ko" ? "서판" : "TABLET"}</span>
            </label>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="preview-main">
          <div className="preview-main-inner">
          {/* 상단 컨트롤 */}
          <div className="preview-controls">
            <div className="control-group">
              <label className="control-label">
                {lang === "ko" ? "프리셋" : "PRESET"}
              </label>
              <select
                className="control-select"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
              >
                {presetsData.presets.filter(p => !p.id.startsWith("ps5-")).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {lang === "ko" ? preset.nameKo : preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">
                {lang === "ko" ? "평균 시세" : "AVERAGE PRICE"}
              </label>
              <select
                className="control-select"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
              >
                {leagueOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group ps5-group">
              <label className="control-checkbox">
                <input
                  type="checkbox"
                  checked={isPS5}
                  onChange={(e) => setIsPS5(e.target.checked)}
                />
                <span>PS5</span>
              </label>
            </div>
          </div>

          {/* 프리뷰 영역 상단: 아이템 하이라이트 */}
          <div className="preview-display-top">
            <div className="preview-items-horizontal">
              {previewItems.map((item, index) => {
                const colors = getTierColor(item.tier);
                const itemName = lang === "ko" ? translateItemName(item.name) : item.name;
                return (
                  <div 
                    key={index} 
                    className="preview-item-wrapper"
                    data-index={index}
                  >
                    <div className="preview-item-box" style={{ background: colors.bg, color: colors.text, fontSize: colors.fontSize + 'px' }}>
                      {itemName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 프리뷰 영역 하단: 액션 버튼들 */}
          <div className="preview-actions-section">
            <div className="preview-actions">
              <div className="preview-actions-inner">
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
                <button className="action-button action-button-secondary" onClick={handleCopyToClipboard}>
                  {lang === "ko" ? "복사하기" : "COPY TO CLIPBOARD"}
                </button>
                <button className="action-button action-button-secondary" onClick={handleReset}>
                  {lang === "ko" ? "초기화" : "RESET"}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
        </div>

        {/* 코드 영역 (별도 컴포넌트) */}
        <div className="filter-output-section">
          <div className="filter-output-header">
            <h3 className="filter-output-title">
              {lang === "ko" ? "필터 미리보기" : "FILTER PREVIEW"}
            </h3>
            <button className="btn-code-preview" onClick={handleGeneratePreview}>
              {lang === "ko" ? "코드 생성" : "GENERATE CODE"}
            </button>
          </div>

          {/* 코드 영역 */}
          {showCodePreview && (
            <div className="filter-output-content">
              <pre 
                className="filter-code" 
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(filterCode || (lang === "ko" ? "필터를 생성해주세요." : "Please generate filter.")) 
                }}
              ></pre>
            </div>
          )}

          {!showCodePreview && (
            <div className="filter-output-placeholder">
              <p>{lang === "ko" ? "코드 미리보기 버튼을 클릭하여 필터 코드를 생성하세요." : "Click 'Code Preview' to generate filter code."}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preview-layout {
          display: flex;
          gap: 0;
          min-height: calc(100vh - 200px);
          flex-direction: column;
        }

        .preview-layout-top {
          display: flex;
          gap: 0;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .preview-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-section:first-child {
          margin-bottom: 6px;
        }

        .sidebar-toggle-all,
        .sidebar-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text);
          user-select: none;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .sidebar-toggle-all:hover,
        .sidebar-checkbox:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-toggle-all {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .sidebar-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .preview-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--panel);
          position: relative;
        }

        .preview-main-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin: 16px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .preview-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-group.ps5-group {
          margin-left: auto;
          align-items: center;
        }

        .control-label {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          white-space: nowrap;
        }

        .control-select {
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          min-width: 160px;
        }

        .control-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
          user-select: none;
        }

        .control-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--poe2-primary, var(--game-primary));
        }

        .preview-display-top {
          padding: 16px 20px 20px 20px;
          background: transparent;
          border-bottom: 1px solid var(--border);
          height: 220px;
          overflow: visible;
          position: relative;
          box-sizing: border-box;
          background-image: url('/preview-ground.jpg');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;
        }

        .preview-display-top::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(26, 26, 26, 0.3), rgba(10, 10, 10, 0.3));
          pointer-events: none;
          z-index: 0;
        }

        .preview-display-top > * {
          position: relative;
          z-index: 1;
        }
        
        .preview-items-horizontal {
          position: relative;
          z-index: 1;
        }
        
        .preview-beams-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .preview-items-horizontal {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 16px;
          align-items: center;
          justify-content: center;
          align-content: center;
          width: 100%;
          height: 100%;
          max-height: 184px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .preview-items-horizontal > * {
          flex: 0 0 auto;
        }

        .preview-item-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: itemAppear 0.5s ease-out;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          max-width: calc(33.333% - 12px);
          box-sizing: border-box;
          justify-content: center;
          height: fit-content;
          align-self: center;
        }

        @keyframes itemAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .preview-item-box {
          padding: 4.8px 9.6px;
          font-weight: 600;
          white-space: nowrap;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          filter: blur(0.5px);
          transition: filter 0.2s ease;
          flex-shrink: 0;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          z-index: 1;
          background: inherit;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-item-wrapper:hover .preview-item-box {
          filter: blur(0px);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .preview-actions-section {
          background: var(--panel);
          border-top: 1px solid var(--border);
        }

        .filter-output-section {
          background: var(--panel);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .filter-output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--panel);
        }

        .filter-output-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .btn-code-preview {
          padding: 8px 16px;
          background: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-code-preview:hover {
          opacity: 0.9;
        }

        .preview-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--panel);
          min-height: 60px;
          max-height: 180px;
        }

        .preview-actions-inner {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 100%;
        }

        /* tier-action-btn 스타일 제거 - 전역 action-button 스타일 사용 */

        /* tier-action-icon 스타일 제거 - 전역 dropdown-icon 스타일 사용 */

        .filter-output-content {
          flex: 1;
          max-height: 400px;
          overflow-y: auto;
          padding: 16px;
          margin: 16px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filter-code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.7;
          color: #D4C5A9;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          background: transparent;
        }

        .filter-output-placeholder {
          flex: 1;
          padding: 48px 24px;
          text-align: center;
          color: var(--muted);
          margin: 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}
