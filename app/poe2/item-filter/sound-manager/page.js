"use client";

import { useState, useEffect } from "react";
import ItemFilterActions from "@/app/components/ItemFilterActions";

const VOLUME_OPTIONS = [100, 200, 300];
const normalizeVolume = (value) =>
  VOLUME_OPTIONS.includes(value) ? value : 300;

const DEFAULT_SOUND_SETTINGS = [
  { id: "currency_s", name: "화폐 S 티어", pcFile: "1_currency_s.mp3", ps5Slot: 5, volume: 300, enabled: true, category: "currency", type: "custom", ingameId: 6 },
  { id: "currency_a", name: "화폐 A 티어", pcFile: "2_currency_a.mp3", ps5Slot: 1, volume: 300, enabled: true, category: "currency", type: "custom", ingameId: 2 },
  { id: "currency_b", name: "화폐 B 티어", pcFile: "3_currency_b.mp3", ps5Slot: 2, volume: 300, enabled: true, category: "currency", type: "custom", ingameId: 2 },
  { id: "currency_c", name: "화폐 C 티어", pcFile: "4_currency_c.mp3", ps5Slot: 2, volume: 300, enabled: true, category: "currency", type: "custom", ingameId: 2 },
  { id: "currency_stack", name: "화폐 중첩 (Stack)", pcFile: "10_stack.mp3", ps5Slot: null, volume: 200, enabled: true, category: "currency", type: "custom", ingameId: null },
  { id: "waystones", name: "경로석 (Waystones)", pcFile: "9_maps.mp3", ps5Slot: null, volume: 300, enabled: true, category: "map", type: "custom", ingameId: null },
  { id: "gear_t1", name: "장비 아이템 T1", pcFile: "5_item_t1.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear", type: "custom", ingameId: null },
  { id: "gear_t2", name: "장비 아이템 T2", pcFile: "6_item_t2.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear", type: "custom", ingameId: null },
  { id: "gear_t3", name: "장비 아이템 T3", pcFile: "7_item_t3.mp3", ps5Slot: null, volume: 300, enabled: true, category: "gear", type: "custom", ingameId: null },
  { id: "flasks", name: "플라스크 (Flasks)", pcFile: "8_flask.mp3", ps5Slot: null, volume: 300, enabled: true, category: "etc", type: "custom", ingameId: null },
];

export default function SoundManagerPage() {
  const [lang, setLang] = useState("ko");
  const [soundOption, setSoundOption] = useState("default"); // default, ps5, s_only, none
  const [soundSettings, setSoundSettings] = useState(DEFAULT_SOUND_SETTINGS);
  const [audioPreviews, setAudioPreviews] = useState({}); // { id: blobUrl }

  const normalizeSoundSettings = (settings) =>
    (settings || []).map((item) => ({
      ...item,
      volume: normalizeVolume(item.volume),
    }));

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
        const parsedSettings = JSON.parse(savedSettings);
        setSoundSettings(normalizeSoundSettings(parsedSettings));
      } catch (e) {
        console.error("Failed to parse sound settings", e);
      }
    } else {
      setSoundSettings(normalizeSoundSettings(DEFAULT_SOUND_SETTINGS));
    }

    const handleStorage = (e) => {
      if (e.key === "lang") setLang(e.newValue || "ko");
      if (e.key === "poe2_sound_option") setSoundOption(e.newValue || "default");
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      // 컴포넌트 언마운트 시 생성된 Blob URL 해제 (메모리 누수 방지)
      Object.values(audioPreviews).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // 설정 저장
  const saveAll = (newOption, newSettings) => {
    localStorage.setItem("poe2_sound_option", newOption);
    const normalized = normalizeSoundSettings(newSettings);
    localStorage.setItem("poe2_sound_settings", JSON.stringify(normalized));
    
    // 타 페이지 연동을 위한 커스텀 이벤트
    window.dispatchEvent(new Event("poe2_sound_settings_changed"));
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = (id, newVolume) => {
    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, volume: parseInt(newVolume) } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 활성화 토글 핸들러
  const handleEnabledToggle = (id) => {
    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 파일 변경 핸들러
  const handleFileChange = (id, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 기존 미리보기 URL 해제
    if (audioPreviews[id]) {
      URL.revokeObjectURL(audioPreviews[id]);
    }

    // 새 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setAudioPreviews(prev => ({ ...prev, [id]: url }));

    // 파일 이름만 추출 (확장자 포함)
    const fileName = file.name;
    
    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, pcFile: fileName } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 타입 변경 핸들러
  const handleTypeChange = (id, newType) => {
    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, type: newType } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 인게임 ID 변경 핸들러
  const handleIngameIdChange = (id, newId) => {
    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, ingameId: parseInt(newId) } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 파일명 초기화 핸들러 (취소 기능)
  const handleResetFile = (id) => {
    const defaultItem = DEFAULT_SOUND_SETTINGS.find((d) => d.id === id);
    if (!defaultItem) return;

    // 미리보기 해제
    if (audioPreviews[id]) {
        URL.revokeObjectURL(audioPreviews[id]);
        setAudioPreviews(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }

    const updated = soundSettings.map((item) =>
      item.id === id ? { ...item, pcFile: defaultItem.pcFile } : item
    );
    setSoundSettings(updated);
    saveAll(soundOption, updated);
  };

  // 사운드 재생 핸들러
  const handlePlaySound = (id) => {
    const url = audioPreviews[id];
    if (!url) {
      alert(lang === "ko" ? "먼저 파일을 변경하여 사운드를 로드해야 합니다." : "Please change the file to load sound first.");
      return;
    }

    const item = soundSettings.find(s => s.id === id);
    const volume = item ? item.volume : 300;
    
    const audio = new Audio(url);
    // HTML Audio volume is 0.0 to 1.0. Map 300 -> 1.0, 0 -> 0.0
    audio.volume = Math.min(volume / 300, 1.0);
    audio.play().catch(e => console.error("Playback failed:", e));
  };

  return (
    <main className="container">
      {/* 2. 다운로드 및 가이드 */}
      {soundOption === "default" && (
        <section className="card mb-24 info-card">
          <div className="cardBody flex-between">
            <div>
              <h3 className="info-title">{lang === "ko" ? "추천 커스텀 사운드 팩" : "Recommended Sound Pack"}</h3>
              <p className="info-desc">{lang === "ko" ? "기본 설정된 파일명이 포함된 사운드 팩을 다운로드하세요." : "Download the sound pack containing the default filenames."}</p>
            </div>
            <button
              className="btn-download-pack"
              onClick={() =>
                window.open(
                  "https://blog.kakaocdn.net/dna/cNVwZG/dJMb99SAI0E/AAAAAAAAAAAAAAAAAAAAADK2BeM3xX-EpczErBX2hf7gV3c1lqJTIrGUGu30df5Q/custom_sound.zip?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1769871599&allow_ip=&allow_referer=&signature=0sfprH0jFoZPBnKg63URZo2a6fM%3D&attach=1&knm=tfile.zip",
                  "_blank"
                )
              }
            >
              {lang === "ko" ? "다운로드 (.zip)" : "Download (.zip)"}
            </button>
          </div>
          <div className="guide-section">
            <h4 className="guide-title">{lang === "ko" ? "설치 가이드" : "Installation Guide"}</h4>
            <ol className="guide-list">
              <li>{lang === "ko" ? "압축 파일을 해제합니다." : "Extract the downloaded ZIP file."}</li>
              <li>{lang === "ko" ? "인게임에서 설정-게임-아이템 필터의 폴더 아이콘을 클릭하세요" : "In-game, go to Settings - Game - Item Filter and click the folder icon."}</li>
              <li>{lang === "ko" ? "폴더가 열리면 압축이 풀린 custom_sound 폴더를 폴더채 넣으세요" : "When the folder opens, copy the extracted custom_sound folder into it."}</li>
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

      {/* 3. 사운드 파일 관리 테이블 */}
      {soundOption === "default" && (
        <section className="card mb-24">
          <div className="cardBody p-0">
            <div className="table-container">
              <table className="sound-table">
                <thead>
                  <tr>
                    <th>{lang === "ko" ? "사용" : "Use"}</th>
                    <th>{lang === "ko" ? "아이템" : "Item"}</th>
                    <th>{lang === "ko" ? "PC 파일명" : "PC Filename"}</th>
                    <th>{lang === "ko" ? "볼륨" : "Volume"}</th>
                    <th>{lang === "ko" ? "테스트" : "Test"}</th>
                  </tr>
                </thead>
                <tbody>
                  {soundSettings.map((item) => (
                    <tr key={item.id} className={!item.enabled ? "disabled" : ""}>
                      <td>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => handleEnabledToggle(item.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td className="item-name">{item.name}</td>
                      <td style={{ minWidth: "320px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {/* 타입 선택 (기본/커스텀) */}
                          <select
                            className="select-input"
                            value={item.type || "custom"} // 기존 데이터 호환 위해 기본값 custom
                            onChange={(e) => handleTypeChange(item.id, e.target.value)}
                            style={{ width: "90px", flexShrink: 0 }}
                          >
                            <option value="custom">{lang === "ko" ? "커스텀" : "Custom"}</option>
                            <option value="default">{lang === "ko" ? "기본" : "Basic"}</option>
                          </select>

                          {/* 타입에 따른 입력 UI */}
                          {(item.type === "default") ? (
                            <select
                                className="select-input"
                                value={item.ingameId || ""}
                                onChange={(e) => handleIngameIdChange(item.id, e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="">{lang === "ko" ? "선택 안함" : "None"}</option>
                                {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0 }}>
                              <span style={{ color: "var(--muted)", fontSize: "13px", whiteSpace: "nowrap" }}>
                                custom_sound/
                              </span>
                              <input
                                type="text"
                                className="text-input"
                                value={item.pcFile}
                                readOnly
                                style={{ flex: 1, minWidth: "100px" }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="vol-cell">
                        <div className="vol-control">
                          <select
                            className="select-input volume-select"
                            value={item.volume}
                            onChange={(e) => handleVolumeChange(item.id, e.target.value)}
                          >
                            {VOLUME_OPTIONS.map((vol) => (
                              <option key={vol} value={vol}>
                                {vol}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="test-actions">
                          <button
                            className="btn-play-mini"
                            title={lang === "ko" ? "재생" : "Play"}
                            onClick={() => handlePlaySound(item.id)}
                            disabled={!audioPreviews[item.id]}
                            style={{ 
                              opacity: audioPreviews[item.id] ? 1 : 0.5,
                              backgroundColor: audioPreviews[item.id] ? "#3166ff" : "var(--panel2)", // 활성화 시 파란색
                              color: audioPreviews[item.id] ? "#fff" : "var(--text)", // 활성화 시 흰색
                              borderColor: audioPreviews[item.id] ? "#3166ff" : "var(--border)"
                            }}
                          >
                            ▶
                          </button>
                          
                          {/* 초기화(취소) 버튼: 항상 표시하되 상태에 따라 스타일 변경 */}
                          {(() => {
                            const defaultFile = DEFAULT_SOUND_SETTINGS.find(d => d.id === item.id)?.pcFile;
                            const isChanged = item.pcFile !== defaultFile;
                            
                            return (
                              <button
                                className={`btn-reset-mini ${!isChanged ? "disabled" : ""}`}
                                onClick={() => isChanged && handleResetFile(item.id)}
                                title={lang === "ko" 
                                  ? (isChanged ? "기본 설정으로 되돌리기" : "기본 설정입니다") 
                                  : (isChanged ? "Reset to default" : "Default setting")}
                                disabled={!isChanged}
                              >
                                ✕
                              </button>
                            );
                          })()}
                          
                          <label className="btn-file-mini">
                            {lang === "ko" ? "파일 변경" : "Change File"}
                            <input
                              type="file"
                              accept=".mp3,.wav,.ogg"
                              onChange={(e) => handleFileChange(item.id, e)}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* PS5 사운드 슬롯 테이블 */}
      {soundOption === "ps5" && (
        <section className="card mb-24">
          <div className="cardBody p-0">
            <div className="table-container">
              <table className="sound-table">
                <thead>
                  <tr>
                    <th>{lang === "ko" ? "사용" : "Use"}</th>
                    <th>{lang === "ko" ? "아이템" : "Item"}</th>
                    <th>{lang === "ko" ? "PS5 슬롯" : "PS5 Slot"}</th>
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_SOUND_SETTINGS.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            readOnly
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td className="item-name">{item.name}</td>
                      <td>
                        {item.ps5Slot !== null ? (
                          <select
                            className="select-input"
                            value={item.ps5Slot}
                            disabled
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="no-mapping">
                            {lang === "ko" ? "매핑 없음" : "No mapping"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <ItemFilterActions
        lang={lang}
        onDownload={() => {}} 
        showSaveAsDefaultDropdown={false}
        showSaveAsLeagueDefault={false}
        onResetAll={(onSuccess) => {
          if (confirm(lang === "ko" ? "모든 설정을 초기화하시겠습니까?" : "Reset all settings?")) {
            localStorage.removeItem("poe2_sound_option");
            localStorage.removeItem("poe2_sound_settings");
            setSoundOption("default");
            setSoundSettings(normalizeSoundSettings(DEFAULT_SOUND_SETTINGS));
            if (onSuccess) onSuccess(lang === "ko" ? "초기화되었습니다." : "Reset complete.");
          }
        }}
        onResetPage={(onSuccess) => {
          setSoundSettings(normalizeSoundSettings(DEFAULT_SOUND_SETTINGS));
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
          color: #fff;
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
          vertical-align: middle;
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

        .volume-select {
          width: 100%;
        }

        .btn-play-mini {
          width: 32px;
          height: 32px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
        }

        .test-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* 초기화 버튼 */
        .btn-reset-mini {
          width: 32px;
          height: 32px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: #ff4444; /* 활성화 시 빨간색 */
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .btn-reset-mini:not(.disabled):hover {
          background: var(--panel);
          border-color: #ff4444;
          transform: scale(1.05);
        }
        
        /* 비활성 상태 (기본값일 때) */
        .btn-reset-mini.disabled {
          color: var(--muted);     /* 흑백/회색 */
          border-color: transparent;
          cursor: default;
          opacity: 0.3;
        }

        .btn-file-mini {
          height: 32px;
          padding: 0 16px;
          border: none;
          background: var(--poe2-primary); /* 항상 파란색 */
          color: #ffffff; /* 항상 흰색 */
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border-radius: 2px;
          transition: opacity 0.2s;
        }
        
        .btn-file-mini:hover {
          opacity: 0.9;
        }

        .btn-file-mini:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* 체크박스 커스텀 */
        .checkbox-container {
          display: block;
          position: relative;
          padding-left: 24px;
          cursor: pointer;
          user-select: none;
          height: 100%;
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
          top: 50%;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: var(--panel2);
          border: 1px solid var(--border);
          transform: translateY(-50%);
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
