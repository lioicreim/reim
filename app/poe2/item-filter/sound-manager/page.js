"use client";

import { useState, useEffect, useMemo } from "react";
import ItemFilterActions from "@/app/components/ItemFilterActions";

const DEFAULT_SOUND_SETTINGS = [
  { id: "currency_s", name: "화폐 S 티어", pcFile: "1_currency_s.mp3", ps5Slot: 5, volume: 300, enabled: true, category: "currency" },
  { id: "currency_a", name: "화폐 A 티어", pcFile: "2_currency_a.mp3", ps5Slot: 1, volume: 300, enabled: true, category: "currency" },
  { id: "currency_b", name: "화폐 B 티어", pcFile: "3_currency_b.mp3", ps5Slot: 2, volume: 300, enabled: true, category: "currency" },
  { id: "currency_c", name: "화폐 C 티어", pcFile: "4_currency_c.mp3", ps5Slot: 2, volume: 300, enabled: true, category: "currency" },
  { id: "currency_stack", name: "화폐 중첩 (Stack)", pcFile: "10_stack.mp3", ps5Slot: null, volume: 200, enabled: true, category: "currency" },
  { id: "waystones", name: "경로석 (Waystones)", pcFile: "9_maps.mp3", ps5Slot: null, volume: 300, enabled: true, category: "map" },
  { id: "gear_t1", name: "장비 아이템 T1", pcFile: "5_item_t1.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear" },
  { id: "gear_t2", name: "장비 아이템 T2", pcFile: "6_item_t2.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear" },
  { id: "gear_t3", name: "장비 아이템 T3", pcFile: "7_item_t3.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear" },
  { id: "flasks", name: "플라스크 (Flasks)", pcFile: "8_flask.mp3", ps5Slot: null, volume: 300, enabled: true, category: "etc" },
];

export default function SoundManagerPage() {
  const [lang, setLang] = useState("ko");
  const [soundOption, setSoundOption] = useState("default"); // default, ps5, s_only, none
  const [soundSettings, setSoundSettings] = useState(DEFAULT_SOUND_SETTINGS);

  useEffect(() => {
    // 언어 설정 불러오기
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);

    // 사운드 옵션 불러오기
    const savedOption = localStorage.getItem("poe2_sound_option") || "default";
    setSoundOption(savedOption);

    // 사운드 상세 설정 불러오기
    const savedSettings = localStorage.getItem("poe2_sound_settings");
    if (savedSettings) {
      try {
        setSoundSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse sound settings", e);
      }
    }

    const handleStorage = (e) => {
      if (e.key === "lang") setLang(e.newValue || "ko");
      if (e.key === "poe2_sound_option") setSoundOption(e.newValue || "default");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 설정 저장
  const saveAll = (newOption, newSettings) => {
    localStorage.setItem("poe2_sound_option", newOption);
    localStorage.setItem("poe2_sound_settings", JSON.stringify(newSettings));
    
    // 타 페이지 연동을 위한 커스텀 이벤트
    window.dispatchEvent(new Event("poe2_sound_settings_changed"));
  };

  const handleOptionChange = (option) => {
    setSoundOption(option);
    saveAll(option, soundSettings);
  };

  const updateSetting = (id, key, value) => {
    const newSettings = soundSettings.map((s) =>
      s.id === id ? { ...s, [key]: value } : s
    );
    setSoundSettings(newSettings);
    saveAll(soundOption, newSettings);
  };

  return (
    <main className="container">
      {/* 1. 글로벌 프리셋 선택 */}
      <section className="card mb-24">
        <div className="cardHeader">
          <h2 className="cardTitle">{lang === "ko" ? "글로벌 사운드 프리셋" : "Global Sound Preset"}</h2>
        </div>
        <div className="cardBody">
          <div className="preset-radio-group">
            {[
              { id: "default", label: lang === "ko" ? "PC 커스텀" : "PC Custom" },
              { id: "ps5", label: lang === "ko" ? "PS5 인게임" : "PS5 In-game" },
              { id: "s_only", label: lang === "ko" ? "S 티어만 듣기" : "S-Tier Only" },
              { id: "none", label: lang === "ko" ? "무음 (Silent)" : "Silent" },
            ].map((opt) => (
              <label key={opt.id} className={`preset-radio-item ${soundOption === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="soundOption"
                  value={opt.id}
                  checked={soundOption === opt.id}
                  onChange={() => handleOptionChange(opt.id)}
                />
                <span className="radio-mark"></span>
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="description-box mt-12">
            <p className="description-text">
              {soundOption === "default" && (lang === "ko" ? "기본 커스텀 사운드를 적용합니다. PC 사용자에게 권장됩니다." : "Applies default custom sounds. Recommended for PC users.")}
              {soundOption === "ps5" && (lang === "ko" ? "인게임 기본 사운드를 적용합니다. PS5 및 콘솔 사용자용입니다." : "Applies in-game default sounds. For PS5 and Console users.")}
              {soundOption === "s_only" && (lang === "ko" ? "가장 가치 있는 S 티어 아이템에 대해서만 사운드가 출력됩니다." : "Sounds will only play for the most valuable S-tier items.")}
              {soundOption === "none" && (lang === "ko" ? "모든 아이템의 사운드를 제거하여 정숙한 플레이가 가능합니다." : "Removes sounds from all items for silent gameplay.")}
            </p>
          </div>
        </div>
      </section>

      {/* 2. 다운로드 및 가이드 */}
      {soundOption === "default" && (
        <section className="card mb-24 info-card">
          <div className="cardBody flex-between">
            <div>
              <h3 className="info-title">{lang === "ko" ? "추천 커스텀 사운드 팩" : "Recommended Sound Pack"}</h3>
              <p className="info-desc">{lang === "ko" ? "기본 설정된 파일명이 포함된 사운드 팩을 다운로드하세요." : "Download the sound pack containing the default filenames."}</p>
            </div>
            <button className="btn-download-pack" onClick={() => window.open('https://github.com', '_blank')}>
              {lang === "ko" ? "다운로드 (.zip)" : "Download (.zip)"}
            </button>
          </div>
          <div className="guide-section">
            <h4 className="guide-title">{lang === "ko" ? "설치 가이드" : "Installation Guide"}</h4>
            <ol className="guide-list">
              <li>{lang === "ko" ? "압축 파일을 해제합니다." : "Extract the downloaded ZIP file."}</li>
              <li>{lang === "ko" ? "필터 파일이 있는 폴더 안에 'custom_sound' 폴더를 생성합니다." : "Create a 'custom_sound' folder in your filter directory."}</li>
              <li>{lang === "ko" ? "해당 폴더 안에 .mp3 파일들을 넣습니다." : "Place the .mp3 files inside that folder."}</li>
            </ol>
          </div>
        </section>
      )}

      {soundOption === "ps5" && (
        <section className="card mb-24 ps5-info-card">
          <div className="cardBody">
            <h3 className="info-title">{lang === "ko" ? "PS5/콘솔 안내" : "PS5/Console Info"}</h3>
            <p className="info-desc">
              {lang === "ko" 
                ? "PS5는 외부 사운드 파일을 지원하지 않으므로, 게임 내에 내장된 PlayAlertSound를 사용합니다. 별도의 다운로드가 필요하지 않습니다." 
                : "PS5 doesn't support custom sound files. It uses built-in PlayAlertSound. No download required."}
            </p>
          </div>
        </section>
      )}

      {/* 3. 고급 사운드 매핑 */}
      <section className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">{lang === "ko" ? "상세 사운드 설정" : "Advanced Sound Mapping"}</h2>
        </div>
        <div className="cardBody p-0">
          <div className="table-container">
            <table className="sound-table">
              <thead>
                <tr>
                  <th>{lang === "ko" ? "구분" : "Category"}</th>
                  <th>{lang === "ko" ? "활성" : "On"}</th>
                  <th>{lang === "ko" ? (soundOption === "ps5" ? "슬롯" : "파일명") : (soundOption === "ps5" ? "Slot" : "File")}</th>
                  <th>{lang === "ko" ? "볼륨" : "Vol"}</th>
                  <th>{lang === "ko" ? "테스트" : "Test"}</th>
                </tr>
              </thead>
              <tbody>
                {soundSettings.map((item) => (
                  <tr key={item.id} className={!item.enabled ? 'disabled' : ''}>
                    <td className="item-name">{item.name}</td>
                    <td>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => updateSetting(item.id, "enabled", e.target.checked)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td>
                      {soundOption === "ps5" ? (
                        item.ps5Slot !== null ? (
                          <select
                            className="select-input"
                            value={item.ps5Slot}
                            onChange={(e) => updateSetting(item.id, "ps5Slot", parseInt(e.target.value))}
                            disabled={!item.enabled}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>Slot {n}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="no-mapping">{lang === "ko" ? "지원불가" : "N/A"}</span>
                        )
                      ) : (
                        <input
                          type="text"
                          className="text-input"
                          value={item.pcFile}
                          onChange={(e) => updateSetting(item.id, "pcFile", e.target.value)}
                          disabled={!item.enabled}
                        />
                      )}
                    </td>
                    <td className="vol-cell">
                      <div className="vol-control">
                        <span className="vol-value">{item.volume}</span>
                        <input
                          type="range"
                          min="0"
                          max={soundOption === "ps5" ? 300 : 100}
                          step={soundOption === "ps5" ? 10 : 5}
                          value={item.volume}
                          onChange={(e) => updateSetting(item.id, "volume", parseInt(e.target.value))}
                          disabled={!item.enabled}
                          className="mini-range"
                        />
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-play-mini"
                        disabled={!item.enabled || (soundOption === "ps5" && item.ps5Slot === null)}
                      >
                        ▶
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ItemFilterActions
        lang={lang}
        onDownload={() => {}} 
        onResetAll={(onSuccess) => {
          if (confirm(lang === "ko" ? "모든 설정을 초기화하시겠습니까?" : "Reset all settings?")) {
            localStorage.removeItem("poe2_sound_option");
            localStorage.removeItem("poe2_sound_settings");
            setSoundOption("default");
            setSoundSettings(DEFAULT_SOUND_SETTINGS);
            if (onSuccess) onSuccess(lang === "ko" ? "초기화되었습니다." : "Reset complete.");
          }
        }}
        onResetPage={(onSuccess) => {
          setSoundSettings(DEFAULT_SOUND_SETTINGS);
          saveAll(soundOption, DEFAULT_SOUND_SETTINGS);
          if (onSuccess) onSuccess(lang === "ko" ? "페이지 설정이 복구되었습니다." : "Page settings restored.");
        }}
      />

      <style jsx>{`
        .mb-24 { margin-bottom: 24px; }
        .mt-12 { margin-top: 12px; }
        .p-0 { padding: 0 !important; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }

        .preset-radio-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .preset-radio-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--panel2);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-radio-item:hover {
          border-color: var(--poe2-primary);
        }

        .preset-radio-item.active {
          background: var(--panel);
          border-color: var(--poe2-primary);
          box-shadow: inset 0 0 10px rgba(var(--poe2-primary-rgb), 0.1);
        }

        .preset-radio-item input {
          display: none;
        }

        .radio-mark {
          width: 14px;
          height: 14px;
          border: 2px solid var(--muted);
          border-radius: 50%;
          position: relative;
        }

        .active .radio-mark {
          border-color: var(--poe2-primary);
        }

        .active .radio-mark:after {
          content: "";
          width: 6px;
          height: 6px;
          background: var(--poe2-primary);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .radio-label {
          font-size: 14px;
          font-weight: 600;
        }

        .description-box {
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .description-text {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }

        /* 인포 카드 */
        .info-card {
          border-left: 4px solid var(--poe2-primary);
        }

        .ps5-info-card {
          border-left: 4px solid #3166ff;
        }

        .info-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .info-desc {
          font-size: 13px;
          color: var(--muted);
        }

        .btn-download-pack {
          padding: 10px 20px;
          background: var(--poe2-primary);
          color: #000;
          border: none;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        .guide-section {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid var(--border);
        }

        .guide-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .guide-list {
          font-size: 13px;
          color: var(--muted);
          padding-left: 20px;
          margin: 0;
        }

        .guide-list li { margin-bottom: 4px; }

        /* 테이블 */
        .table-container {
          overflow-x: auto;
        }

        .sound-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .sound-table th {
          background: var(--panel2);
          padding: 12px 16px;
          text-align: left;
          color: var(--muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border);
        }

        .sound-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }

        .sound-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .sound-table tr.disabled {
          opacity: 0.5;
        }

        .item-name {
          font-weight: 600;
          color: var(--text);
          width: 200px;
        }

        .select-input, .text-input {
          width: 100%;
          min-width: 120px;
          padding: 6px 10px;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
        }

        .no-mapping {
          font-size: 12px;
          color: #ff4444;
          font-style: italic;
        }

        .vol-cell {
          width: 180px;
        }

        .vol-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vol-value {
          font-family: monospace;
          font-size: 13px;
          width: 30px;
          text-align: right;
        }

        .mini-range {
          flex: 1;
          height: 4px;
          background: var(--panel2);
          -webkit-appearance: none;
        }

        .mini-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--poe2-primary);
          cursor: pointer;
        }

        .btn-play-mini {
          width: 32px;
          height: 32px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          cursor: pointer;
          font-size: 12px;
        }

        /* 체크박스 커스텀 */
        .checkbox-container {
          display: block;
          position: relative;
          padding-left: 24px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: var(--panel2);
          border: 1px solid var(--border);
        }

        .checkbox-container:hover input ~ .checkmark {
          background-color: var(--panel);
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: var(--poe2-primary);
          border-color: var(--poe2-primary);
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-container .checkmark:after {
          left: 6px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid #000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>
    </main>
  );
}
