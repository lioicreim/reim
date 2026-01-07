// 관리자 인증 유틸리티
// 
// TODO: 나중에 실제 로그인 시스템으로 교체 필요
// 현재는 개발/데모용으로 localStorage 기반 인증 사용
// 
// 실제 구현 시 변경 사항:
// 1. 서버 사이드 세션/토큰 확인
// 2. API 엔드포인트로 권한 확인
// 3. 로그인/로그아웃 API 연동
// 4. JWT 또는 세션 쿠키 사용

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  // TODO: 서버 사이드에서 세션/토큰 확인
  return localStorage.getItem("admin") === "true";
};

export const setAdmin = (value) => {
  if (typeof window === "undefined") return;
  // TODO: 실제 로그인 API 호출
  if (value) {
    localStorage.setItem("admin", "true");
  } else {
    localStorage.removeItem("admin");
  }
  // 관리자 상태 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent("adminchange"));
};

// TODO: 실제 로그인 함수
// export const login = async (email, password) => {
//   const response = await fetch('/api/auth/login', {
//     method: 'POST',
//     body: JSON.stringify({ email, password })
//   });
//   // ... 로그인 처리
// };

// TODO: 실제 로그아웃 함수
// export const logout = async () => {
//   await fetch('/api/auth/logout', { method: 'POST' });
//   setAdmin(false);
// };
