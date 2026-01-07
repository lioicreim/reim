"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import GameColorSettings from "./GameColorSettings";

export default function Header() {
  const [lang, setLang] = useState("ko");
  const [admin, setAdmin] = useState(false);
  const [showColorSettings, setShowColorSettings] = useState(false);
  
  // localStorage에서 언어 설정 불러오기
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);
    setAdmin(isAdmin());
    
    // 관리자 상태 변경 이벤트 리스너
    const handleAdminChange = () => {
      setAdmin(isAdmin());
    };
    
    window.addEventListener("adminchange", handleAdminChange);
    
    return () => {
      window.removeEventListener("adminchange", handleAdminChange);
    };
  }, []);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    // 커스텀 이벤트 발생 (같은 페이지 내에서 언어 변경 알림)
    window.dispatchEvent(new CustomEvent("langchange"));
  };

  return (
    <>
      <header className="top-header">
        <div className="top-header-container">
          <div className="header-left">
            <Link href="/" className="site-logo">
              <span className="logo-placeholder">R</span>
              <span className="site-name">REIM</span>
            </Link>
          </div>
          <div className="header-right">
            <button className="header-btn">광고 제거</button>
            <button className="header-btn">로그인</button>
            <button className="header-btn header-btn-primary">회원가입</button>
            {admin && (
              <button
                className="header-btn header-btn-settings"
                onClick={() => setShowColorSettings(true)}
                title="게임 컬러 설정"
              >
                ⚙️
              </button>
            )}
            <select 
              className="lang-select" 
              value={lang} 
              onChange={handleLangChange}
              title="언어 변경"
            >
              <option value="ko">KO</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </header>
      
      {showColorSettings && (
        <GameColorSettings onClose={() => setShowColorSettings(false)} />
      )}
    </>
  );
}
