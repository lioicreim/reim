export default function PrivacyPage() {
  return (
    <main className="privacy-container" style={{ maxWidth: 840, margin: "0 auto", padding: "80px 24px", color: "var(--text)", lineHeight: "1.8" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "40px", color: "var(--neon-blue)" }}>개인정보처리방침</h1>

      <section style={{ marginBottom: "40px" }}>
        <p style={{ marginBottom: "16px" }}>
          <strong>REIM (www.reim.kr)</strong>(이하 “사이트”)은 개인정보보호법 등
          관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같이
          개인정보처리방침을 수립·공개합니다.
        </p>

        <ul style={{ listStyle: "none", padding: 0, color: "var(--muted)", fontSize: "14px" }}>
          <li>시행일: 2026년 1월 14일</li>
          <li>문의 이메일: riozio@naver.com</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>1. 개인정보의 처리 목적</h2>
        <p>사이트는 다음 목적을 위해 필요한 최소한의 정보만을 처리합니다.</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>PoE2 아이템 필터 제작 기능 제공</li>
          <li>이용자 설정을 브라우저에 저장하여 편의 제공</li>
          <li>서비스 품질 개선 및 보안 관리</li>
          <li>Google AdSense를 통한 광고 제공</li>
        </ul>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>2. 처리하는 개인정보 항목</h2>
        <p style={{ marginBottom: "20px" }}>
          사이트는 회원가입을 제공하지 않으며, 이름·전화번호 등 직접 식별 가능한
          개인정보를 수집하지 않습니다.
        </p>

        <h3 style={{ fontSize: "18px", marginTop: "30px", marginBottom: "15px" }}>① 자동 수집 정보</h3>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>IP 주소</li>
          <li>브라우저 종류 및 OS</li>
          <li>접속 일시 및 접속 기록</li>
        </ul>

        <h3 style={{ fontSize: "18px", marginTop: "30px", marginBottom: "15px" }}>② 브라우저 저장 정보</h3>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>아이템 필터 설정값(티어, 옵션 등)</li>
          <li>저장 위치: 브라우저 LocalStorage 또는 쿠키</li>
        </ul>

        <p style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px", fontSize: "14px", color: "var(--muted)" }}>
          ※ 브라우저 저장 정보는 이용자 기기 내에만 저장되며, 쿠키 또는 사이트
          데이터를 삭제하면 함께 삭제됩니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>3. 개인정보의 처리 및 보유기간</h2>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>회원 DB 형태의 개인정보 저장 없음</li>
          <li>접속 로그 보관 기간: 최대 90일</li>
          <li>브라우저 저장 정보는 이용자가 직접 삭제 가능</li>
        </ul>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>4. 개인정보의 제3자 제공</h2>
        <p>
          사이트는 원칙적으로 개인정보를 외부에 제공하지 않습니다. 다만, 법령에
          따른 경우에는 예외로 할 수 있습니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>5. 개인정보 처리의 위탁</h2>
        <p>
          현재 개인정보 처리 업무를 외부에 위탁하지 않으며, 추후 위탁 시 본 방침을
          통해 안내합니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>6. 광고 서비스(Google AdSense)</h2>
        <p style={{ marginBottom: "15px" }}>
          사이트는 Google LLC의 Google AdSense 광고 서비스를 사용할 수 있으며,
          Google을 포함한 제3자 광고 사업자는 쿠키 또는 유사 기술을 사용하여 맞춤형
          광고를 제공할 수 있습니다.
        </p>
        <p>
          이용자는 브라우저 설정 또는 Google 광고 설정을 통해 맞춤형 광고를 제한할
          수 있습니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>7. 정보주체의 권리</h2>
        <p>
          이용자는 브라우저 설정을 통해 쿠키 및 사이트 데이터를 직접 삭제하거나
          차단할 수 있습니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>8. 개인정보의 파기</h2>
        <p>
          접속 로그는 보유기간 경과 후 복구 불가능한 방식으로 삭제되며, 브라우저
          저장 정보는 이용자가 직접 삭제할 수 있습니다.
        </p>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>9. 개인정보의 안전성 확보 조치</h2>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>접근 권한 최소화</li>
          <li>보안 업데이트 및 취약점 점검</li>
          <li>HTTPS 암호화 통신 적용</li>
        </ul>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>10. 개인정보 보호책임자</h2>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li>책임자: 유찬혁</li>
          <li>이메일: riozio@naver.com</li>
        </ul>

        <h2 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "20px", borderLeft: "4px solid var(--neon-blue)", paddingLeft: "15px" }}>11. 방침 변경</h2>
        <p>
          본 개인정보처리방침이 변경될 경우, 사이트 내 공지 또는 본 페이지를 통해
          안내합니다.
        </p>
      </section>
    </main>
  );
}
