"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureProfile, signInWithEmail, signUpWithEmail } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);
  const initialMode = useMemo(
    () => (searchParams.get("mode") === "signup" ? "signup" : "signin"),
    [searchParams]
  );

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // [수정] useRef를 사용하여 모든 위치에서 안전하게 마운트 상태 확인
  const mountedRef = useRef(true);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    mountedRef.current = true;
    console.log("[LoginPage] Auth 구독 시작");

    const checkSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("[LoginPage] 세션 확인 오류:", sessionError);
          return;
        }
        
        if (mountedRef.current && data?.session?.user) {
          console.log("[LoginPage] 기존 세션 발견, 리다이렉트 시도:", redirectTo);
          if (window.location.pathname === "/login") {
            router.replace(redirectTo);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          return; // AbortError는 무시
        }
        console.error("[LoginPage] checkSession 캐치:", err);
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[LoginPage] Auth 상태 변경 이벤트:", event);
      if (mountedRef.current && session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        console.log("[LoginPage] 로그인 상태 감지됨, 리다이렉트 실행");
        if (window.location.pathname === "/login") {
          router.replace(redirectTo);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      console.log("[LoginPage] Auth 구독 해제");
      listener?.subscription?.unsubscribe();
    };
  }, [redirectTo, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setMessage("");
    setLoading(true);
    console.log("[LoginPage] 폼 제출 시작 - 모드:", mode, "이메일:", email);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) {
          console.error("[LoginPage] 회원가입 API 오류:", signUpError);
          throw signUpError;
        }

        if (data?.session?.user) {
          console.log("[LoginPage] 회원가입 후 프로필 보장 절차 시작");
          await ensureProfile(data.session.user);
        }

        setMessage("회원가입 신청 완료! 이메일 인증이 필요합니다. 메일을 확인해주세요.");
      } else {
        const { data, error: signInError } = await signInWithEmail(email, password);
        
        if (signInError) {
          if (signInError.name === 'AbortError' || signInError.message?.includes('aborted')) {
            console.warn("[LoginPage] 로그인 중 AbortError 발생 (작업 중단됨):", signInError);
            return;
          }
          console.error("[LoginPage] 로그인 API 오류 (400 발생 가능):", signInError);
          throw signInError;
        }

        if (data?.user) {
          console.log("[LoginPage] 로그인 성공, 프로필 보장 절차 시작");
          try {
            await ensureProfile(data.user);
          } catch (profileErr) {
            console.warn("[LoginPage] 프로필 생성 중 비치명적 오류 (로그인은 유지됨):", profileErr);
          }
        }

        console.log("[LoginPage] 모든 절차 완료, 리다이렉트 최종 시도");
        if (window.location.pathname === "/login" && mountedRef.current) {
          router.replace(redirectTo);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.warn("[LoginPage] catch 블록 AbortError 무시");
        return;
      }
      console.error("[LoginPage] handleSubmit 전체 오류 catch:", err);
      setError(err?.message || "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader auth-header">
          <h1 className="auth-heading">
            {mode === "signup" ? "회원가입" : "로그인"}
          </h1>
          <p className="auth-subtitle">로그인 또는 회원가입으로 서비스를 이용하세요.</p>
        </div>
        <div className="cardBody">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              이메일
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="auth-label">
              비밀번호
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </label>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-message">{message}</div>}

            <button className="btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
            </button>
            <div className="auth-footer">
              {mode === "signup" ? "이미 회원이신가요? " : "회원이 아니신가요? "}
              <button
                type="button"
                className="auth-link"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              >
                {mode === "signup" ? "로그인하기" : "회원가입하기"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
        }

        .auth-heading {
          font-size: 22px;
          font-weight: 700;
        }

        .auth-subtitle {
          color: var(--muted);
          font-size: 13px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          max-width: 420px;
        }

        .auth-label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
        }

        .auth-input {
          height: 44px;
          padding: 0 14px;
          background: #0f0f0f;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text);
          font-size: 14px;
          border-radius: 10px;
        }

        .auth-input:focus {
          outline: 2px solid rgba(21, 93, 252, 0.5);
          outline-offset: 1px;
        }

        .auth-error {
          color: var(--tier-s);
          font-size: 13px;
        }

        .auth-message {
          color: var(--neon-green);
          font-size: 13px;
        }

        .auth-submit {
          margin-top: 8px;
          width: 100%;
          border-radius: 12px;
          padding: 12px 16px;
          font-weight: 700;
        }

        .auth-footer {
          text-align: center;
          font-size: 12px;
          color: var(--muted);
        }

        .auth-link {
          background: transparent;
          border: none;
          color: var(--text);
          font-weight: 700;
          cursor: pointer;
        }

        .card {
          max-width: 520px;
          margin: 0 auto;
        }

        .cardBody {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </main>
  );
}
