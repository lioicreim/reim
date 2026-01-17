"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isAdmin, signOut } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/client";
import GameColorSettings from "./GameColorSettings";
import { useRouter } from "next/navigation";

export default function Header() {
  const [lang, setLang] = useState("ko");
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showColorSettings, setShowColorSettings] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);
    let isMounted = true;
    console.log("[Header] 세션 로드 및 Auth 구독 시작");

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Header] 세션 로드 중 오류 발생:", error);
          return;
        }
        if (!isMounted) return;
        
        const currentUser = data?.session?.user ?? null;
        console.log("[Header] 초기 세션 확인 결과:", currentUser ? currentUser.email : "비로그인");
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await isAdmin();
          if (isMounted) setAdmin(adminStatus);
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          return; // AbortError는 무시
        }
        console.error("[Header] loadSession 전체 오류:", err);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Header] Auth 상태 변경 감지:", event);
      if (!isMounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // SIGNED_IN 또는 초기 세션인 경우에만 관리자 여부 확인 (부하 감소)
      if (currentUser && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED")) {
        const adminStatus = await isAdmin();
        if (isMounted) setAdmin(adminStatus);
      } else if (!currentUser) {
        setAdmin(false);
      }
    });

    return () => {
      isMounted = false;
      console.log("[Header] 컴포넌트 언마운트 - Auth 구독 해제");
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    // 커스텀 이벤트 발생 (같은 페이지 내에서 언어 변경 알림)
    window.dispatchEvent(new CustomEvent("langchange"));
  };

  const handleSignOut = async () => {
    setUser(null);
    setAdmin(false);
    setShowColorSettings(false);

    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed:", error);
    }

    // Avoid router.refresh() during sign-out to prevent AbortError in dev.
  };

  return (
    <>
      <header className="top-header">
        <div className="top-header-container">
          <div className="header-left">
            <Link href="/" className="site-logo">
              <span className="logo-placeholder" style={{ background: 'var(--neon-blue)', border: '1.5px solid #000', fontFamily: 'var(--font-sans)', fontWeight: '900', color: '#fff' }}>R</span>
              <span className="site-name sharp-stroke sharp-stroke-white">REIM</span>
            </Link>
          </div>
          <div className="header-right">
            {/* 애드센스 심사 중이면 false로 바꾸세요 */}
            {true && (
              <>
                <button className="header-btn">광고 제거</button>
                {user ? (
                  <button className="header-btn" onClick={handleSignOut}>
                    로그아웃
                  </button>
                ) : (
                  <>
                    <Link className="header-btn" href="/login">
                      로그인
                    </Link>
                    <Link className="header-btn header-btn-primary" href="/login?mode=signup">
                      회원가입
                    </Link>
                  </>
                )}
              </>
            )}
            {admin && (
              <button
                className="header-btn header-btn-settings"
                onClick={() => setShowColorSettings(true)}
                title="게임 컬러 설정"
              >
                ⚙️
              </button>
            )}
            <a
              href="https://discord.gg/VMTR3Tufws"
              target="_blank"
              rel="noopener noreferrer"
              className="header-discord-link"
              title="Discord"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
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
