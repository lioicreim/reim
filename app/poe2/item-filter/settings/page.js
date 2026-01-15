"use client";

import { useState, useEffect } from "react";
import ItemFilterActions from "@/app/components/ItemFilterActions";
import presetsData from "@/data/presets.json";
import quickFilterDefaults from "@/data/quick-filter-defaults.json";
import currencyTiers from "@/data/currency-tiers.json";

export default function SettingsPage() {
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

  const handleDownload = () => {
    alert(lang === "ko" ? "다운로드 기능은 준비 중입니다." : "Download feature coming soon.");
  };

  const handleCopy = async () => {
    alert(lang === "ko" ? "복사 기능은 준비 중입니다." : "Copy feature coming soon.");
  };

  const handleResetAll = (onSuccess) => {
    // 전체 초기화: 모든 설정 초기화
    if (typeof window !== "undefined") {
      // 설정 관련 localStorage 초기화
      // TODO: 실제 설정 초기화 로직 구현
    }
    if (onSuccess) {
      onSuccess(lang === "ko" ? "전체 설정이 초기화되었습니다." : "All settings have been reset.");
    }
  };

  const handleResetPage = (onSuccess) => {
    // 이 페이지만: 현재 페이지의 설정만 초기화
    // TODO: 실제 설정 초기화 로직 구현
    if (onSuccess) {
      onSuccess(lang === "ko" ? "이 페이지의 설정이 초기화되었습니다." : "This page's settings have been reset.");
    }
  };

  const handleLoadFromFile = () => {
    alert(lang === "ko" ? "파일 불러오기 기능은 준비 중입니다." : "File load feature coming soon.");
  };

  const readJson = (key, fallback) => {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  // 기본값으로 저장 (프리셋별) - quick-filters 기본값 포맷으로 로컬에 저장
  const handleSaveAsDefault = (presetId) => {
    const preset =
      presetsData.presets.find((p) => p.id === presetId) || { name: presetId, nameKo: presetId };
    const presetName = lang === "ko" ? (preset.nameKo || preset.name) : (preset.name || preset.nameKo);

    if (
      !confirm(
        lang === "ko"
          ? `현재 빠른 설정(Quick Filters) 값을 "${presetName}" 프리셋의 기본값으로 저장하시겠습니까?\n\n(정적 배포/API 보류 상태이므로 이 작업은 내 브라우저 로컬에만 저장됩니다.)`
          : `Save current Quick Filters as default for "${presetName}" preset?\n\n(Static deploy / no API: this is saved only in your browser.)`
      )
    ) {
      return;
    }

    const gold = readJson("quickFilter_gold", quickFilterDefaults.gold);
    const jewels = readJson("quickFilter_jewels", quickFilterDefaults.jewels);
    const uniques = readJson("quickFilter_uniques", quickFilterDefaults.uniques);
    const currency = readJson("quickFilter_currency", { enabled: true, rules: [], selectedTiers: [], minTier: "E" });
    const vaultKeys = readJson("quickFilter_vaultKeys", quickFilterDefaults.vaultKeys);
    const uncutGems = readJson("quickFilter_uncutGems", quickFilterDefaults.uncut_gems);

    const payload = {
      version: 2,
      presetId,
      savedAt: new Date().toISOString(),
      gold,
      jewels,
      uncutGems,
      uniques,
      currency,
      vaultKeys,
    };

    try {
      localStorage.setItem(`quickFilter_default_${presetId}`, JSON.stringify(payload));
      alert(lang === "ko" ? "기본값으로 저장되었습니다! (로컬)" : "Saved as default! (local)");
    } catch (e) {
      console.error(e);
      alert(lang === "ko" ? "저장에 실패했습니다." : "Failed to save.");
    }
  };

  // 시세 기본값으로 저장 (리그/시세그룹별) - currency-tiers.json 반영용 JSON 다운로드
  const handleSaveAsLeagueDefault = (leagueId) => {
    // 커스텀 티어는 tier-lists에서 leagueKey 그대로 저장됨
    const tryKeys = [
      `tier-list-custom-currency-${leagueId}`,
      ...(leagueId === "default"
        ? ["tier-list-custom-currency-normal"]
        : leagueId === "normal"
        ? ["tier-list-custom-currency-default"]
        : []),
    ];

    let custom = {};
    for (const k of tryKeys) {
      const loaded = readJson(k, null);
      if (loaded && typeof loaded === "object") {
        custom = loaded;
        break;
      }
    }

    const baseLeagueId = leagueId === "default" ? "normal" : leagueId;
    const currentTiers =
      currencyTiers[leagueId] ||
      currencyTiers[baseLeagueId] ||
      currencyTiers.normal || { S: [], A: [], B: [], C: [], D: [], E: [] };

    const updatedTiers = {
      S: [...(currentTiers.S || [])],
      A: [...(currentTiers.A || [])],
      B: [...(currentTiers.B || [])],
      C: [...(currentTiers.C || [])],
      D: [...(currentTiers.D || [])],
      E: [...(currentTiers.E || [])],
    };

    // 커스텀 티어 반영
    Object.keys(custom || {}).forEach((itemName) => {
      const newTier = custom[itemName];
      ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
        const idx = updatedTiers[tier].indexOf(itemName);
        if (idx > -1) updatedTiers[tier].splice(idx, 1);
      });
      if (newTier && updatedTiers[newTier] && !updatedTiers[newTier].includes(itemName)) {
        updatedTiers[newTier].push(itemName);
      }
    });

    Object.keys(updatedTiers).forEach((tier) => {
      updatedTiers[tier].sort((a, b) => a.localeCompare(b));
    });

    const dataToSave = { [leagueId]: updatedTiers };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `currency-tiers-${leagueId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(
      lang === "ko"
        ? `다운로드된 JSON 파일을 data/currency-tiers.json에 반영 후 배포하면, 서버 초기값처럼 제공할 수 있습니다.\n\n(현재는 정적 배포/API 보류 상태라 자동 저장은 하지 않습니다.)`
        : `Apply the downloaded JSON to data/currency-tiers.json and redeploy to deliver it as server defaults.\n\n(No API yet: no auto-save.)`
    );
  };

  const leagueOptions = [
    { id: "default", name: lang === "ko" ? "기본값" : "Default" },
    { id: "early", name: lang === "ko" ? "리그 초반" : "Early" },
    { id: "normal", name: lang === "ko" ? "리그 중반" : "Normal" },
    { id: "mid", name: lang === "ko" ? "리그 후반" : "Mid" },
    { id: "late", name: lang === "ko" ? "리그 종반" : "Late" },
    { id: "ssf", name: lang === "ko" ? "SSF" : "SSF" },
  ];

  return (
    <main className="container">
      <div className="card">
        <div className="cardBody">
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {lang === "ko"
              ? "알파테스트용 설정 페이지입니다. (탭에서는 숨김, URL 직접 접근)"
              : "Alpha settings page. (Hidden from tabs, direct URL access)"}
          </p>
        </div>
      </div>
      <ItemFilterActions
        lang={lang}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onResetAll={handleResetAll}
        onResetPage={handleResetPage}
        onLoadFromFile={handleLoadFromFile}
        onSaveAsDefault={handleSaveAsDefault}
        onSaveAsLeagueDefault={handleSaveAsLeagueDefault}
        leagueOptions={leagueOptions}
        showSaveAsLeagueDefault={true}
        showSaveAsDefaultDropdown={true}
      />
    </main>
  );
}
