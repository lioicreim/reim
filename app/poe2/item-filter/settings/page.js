"use client";

import { useState, useEffect } from "react";
import ItemFilterActions from "@/app/components/ItemFilterActions";

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

  const handleSaveAsDefault = (presetId) => {
    if (
      confirm(
        lang === "ko"
          ? `현재 설정을 기본값으로 저장하시겠습니까?`
          : `Save current settings as default?`
      )
    ) {
      // TODO: 실제 저장 로직 구현
      alert(lang === "ko" ? "기본값으로 저장되었습니다!" : "Saved as default!");
    }
  };

  return (
    <main className="container">
      <div className="card">
        <div className="cardBody">
          <p>설정 페이지 (구현 예정)</p>
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
      />
    </main>
  );
}
