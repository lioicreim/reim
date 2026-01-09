"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Reim</h1>
          <p className="hero-subtitle">
            게이머를 위한 통합 도구 플랫폼
          </p>
          <p className="hero-description">
            WoW 애드온부터 POE 아이템 필터까지, 게임을 더 즐겁게 만들어 드립니다
          </p>
        </div>
      </section>

      {/* WoW Section */}
      <section className="feature-section wow-section">
        <div className="feature-container">
          <div className="feature-content">
            <div className="feature-badge">World of Warcraft</div>
            <h2 className="feature-title">
              통합 애드온 패키지를<br />한 번에 설치하고 관리하세요
            </h2>
            <p className="feature-description">
              수십 개의 필수 애드온을 하나로 묶어 간편하게 배포하고 설치할 수 있습니다.
              복잡한 설정 없이 클릭 한 번으로 최적화된 게임 환경을 구축하세요.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>원클릭 설치 및 업데이트</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>자동 호환성 검사 및 충돌 방지</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>통합 설정 관리 및 백업</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>커뮤니티 추천 프리셋 제공</span>
              </li>
            </ul>
            <div className="feature-cta">
              <Link href="/wow" className="cta-button cta-primary">
                WoW 애드온 시작하기
              </Link>
            </div>
          </div>
          <div className="feature-visual">
            <div className="visual-placeholder">
              <div className="visual-icon">⚔️</div>
              <p>WoW 애드온 관리 화면</p>
            </div>
          </div>
        </div>
      </section>

      {/* POE Section */}
      <section className="feature-section poe-section">
        <div className="feature-container">
          <div className="feature-visual">
            <div className="visual-placeholder">
              <div className="visual-icon">🎯</div>
              <p>POE 아이템 필터 생성기</p>
            </div>
          </div>
          <div className="feature-content">
            <div className="feature-badge poe-badge">
              Path of Exile 1 & 2
            </div>
            <h2 className="feature-title">
              복잡한 필터 코드 작성,<br />이제 더 이상 필요 없습니다
            </h2>
            <p className="feature-description">
              직관적인 UI로 드래그 앤 드롭만으로 아이템 필터를 쉽게 만들 수 있습니다.
              티어 분류, 스타일 커스터마이징, 실시간 미리보기까지 모든 기능을 한 곳에서 관리하세요.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>시각적 필터 생성 - 코드 작성 불필요</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>S~E 티어 자동 분류 및 관리</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>실시간 미리보기로 즉시 확인</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>프리셋 저장 및 공유 기능</span>
              </li>
            </ul>
            <div className="feature-cta">
              <Link href="/poe2" className="cta-button cta-primary">
                POE2 필터 시작하기
              </Link>
              <Link href="/poe1" className="cta-button cta-secondary">
                POE1 필터 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-container">
          <h2 className="benefits-title">왜 Reim을 선택해야 할까요?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3 className="benefit-title">빠른 시작</h3>
              <p className="benefit-text">
                복잡한 설정 없이 몇 분 만에 시작할 수 있습니다
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💾</div>
              <h3 className="benefit-title">클라우드 저장</h3>
              <p className="benefit-text">
                설정을 클라우드에 저장해 어디서든 접근 가능합니다
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔄</div>
              <h3 className="benefit-title">자동 업데이트</h3>
              <p className="benefit-text">
                최신 기능과 패치를 자동으로 받아보세요
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3 className="benefit-title">커뮤니티</h3>
              <p className="benefit-text">
                다른 유저들과 설정을 공유하고 배워보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">지금 바로 시작해보세요</h2>
          <p className="cta-description">
            무료로 시작하고 게임 경험을 한 단계 업그레이드하세요
          </p>
          <div className="cta-buttons">
            <Link href="/poe2" className="cta-button cta-primary cta-large">
              POE2 필터 시작
            </Link>
            <Link href="/wow" className="cta-button cta-secondary cta-large">
              WoW 애드온 시작
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          width: 100%;
          min-height: 100vh;
          background: var(--foreground);
        }

        /* Hero Section */
        .hero-section {
          padding: 120px 24px 80px;
          text-align: center;
          background: linear-gradient(
            135deg,
            rgba(21, 93, 252, 0.1) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          border-bottom: 1px solid var(--border);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 72px;
          font-weight: 900;
          margin-bottom: 16px;
          background: linear-gradient(
            135deg,
            var(--poe2-primary, var(--game-primary, #155dfc)) 0%,
            #3b82f6 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -2px;
        }

        .hero-subtitle {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
        }

        .hero-description {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Feature Section */
        .feature-section {
          padding: 100px 24px;
          border-bottom: 1px solid var(--border);
        }

        .wow-section {
          background: linear-gradient(
            135deg,
            rgba(0, 112, 210, 0.05) 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .poe-section {
          background: linear-gradient(
            135deg,
            rgba(21, 93, 252, 0.05) 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .feature-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .poe-section .feature-container {
          direction: rtl;
        }

        .poe-section .feature-content {
          direction: ltr;
        }

        .feature-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .feature-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0, 112, 210, 0.1);
          color: #0070d2;
          border: 1px solid rgba(0, 112, 210, 0.2);
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        .poe-badge {
          background: rgba(21, 93, 252, 0.1);
          color: var(--poe2-primary, var(--game-primary, #155dfc));
          border-color: rgba(21, 93, 252, 0.2);
        }

        .feature-title {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.2;
          color: var(--text);
          letter-spacing: -1px;
        }

        .feature-description {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.7;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          color: var(--text);
        }

        .check-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--poe2-primary, var(--game-primary, #155dfc));
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .feature-cta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .feature-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .visual-placeholder {
          width: 100%;
          height: 400px;
          background: var(--panel2);
          border: 2px dashed var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .visual-icon {
          font-size: 64px;
          opacity: 0.5;
        }

        .visual-placeholder p {
          color: var(--muted);
          font-size: 14px;
        }

        /* Benefits Section */
        .benefits-section {
          padding: 100px 24px;
          background: var(--panel2);
          border-bottom: 1px solid var(--border);
        }

        .benefits-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .benefits-title {
          font-size: 42px;
          font-weight: 800;
          text-align: center;
          color: var(--text);
          margin-bottom: 60px;
          letter-spacing: -1px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .benefit-card {
          padding: 32px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .benefit-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .benefit-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }

        .benefit-text {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 100px 24px;
          text-align: center;
        }

        .cta-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 42px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .cta-description {
          font-size: 18px;
          color: var(--muted);
          margin-bottom: 40px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Buttons */
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .cta-button.cta-large {
          padding: 16px 32px;
          font-size: 18px;
        }

        .cta-primary {
          background: var(--poe2-primary, var(--game-primary, #155dfc));
          color: white;
          border-color: var(--poe2-primary, var(--game-primary, #155dfc));
        }

        .cta-primary:hover {
          background: var(--poe2-primary-hover, #0d4dc7);
          border-color: var(--poe2-primary-hover, #0d4dc7);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21, 93, 252, 0.3);
        }

        .cta-secondary {
          background: transparent;
          color: var(--text);
          border-color: var(--border);
        }

        .cta-secondary:hover {
          background: var(--panel2);
          border-color: var(--poe2-primary, var(--game-primary, #155dfc));
          color: var(--poe2-primary, var(--game-primary, #155dfc));
        }

        /* Responsive */
        @media (max-width: 968px) {
          .hero-title {
            font-size: 48px;
          }

          .feature-container {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .poe-section .feature-container {
            direction: ltr;
          }

          .feature-visual {
            min-height: 300px;
          }

          .visual-placeholder {
            height: 300px;
          }

          .feature-title {
            font-size: 32px;
          }

          .benefits-title,
          .cta-title {
            font-size: 32px;
          }
        }

        @media (max-width: 640px) {
          .hero-section {
            padding: 80px 16px 60px;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 20px;
          }

          .hero-description {
            font-size: 16px;
          }

          .feature-section {
            padding: 60px 16px;
          }

          .benefits-section {
            padding: 60px 16px;
          }

          .cta-section {
            padding: 60px 16px;
          }

          .feature-title {
            font-size: 28px;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .cta-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
