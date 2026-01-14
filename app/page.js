"use client";

import Link from "next/link";

export default function Home() {
  const services = [
    {
      id: "poe-filter",
      name: "POE 아이템 필터",
      desc: "지능적인 티어 자동 분류와 실시간 미리보기를 제공하는 전문가급 필터 생성기.",
      color: "var(--neon-blue)"
    },
    {
      id: "wow-addon",
      name: "WoW 통합 애드온",
      desc: "필수 애드온들을 하나로 묶어 최적의 설정을 제공하는 통합 패키지.",
      color: "var(--neon-green)"
    },
    {
      id: "build-guide",
      name: "게임 빌드 가이드",
      desc: "POE, Last Epoch 등 핵심 게임들의 강력한 엔드게임 빌드를 공유합니다.",
      color: "var(--neon-orange)"
    },
    {
      id: "community",
      name: "게임 정보 허브",
      desc: "패치 노트부터 커뮤니티 추천 팁까지 모든 정보를 확인하세요.",
      color: "var(--neon-pink)"
    }
  ];

  return (
    <main className="home-page">
      {/* Hero Section: Fixed 400px, contain image */}
      <section className="hero-v7-section">
        <div 
          className="hero-v7-image"
          style={{ backgroundImage: 'url("/images/main_image.png")' }}
        ></div>
      </section>

      <div className="container-v7">
        {/* Features Row: WoW & POE side by side with boxes */}
        <div className="features-row">
          <section className="feature-col wow-theme">
            <span className="badge-v7">WORLD OF WARCRAFT</span>
            <div className="feature-box-v8">
              <div className="feature-header-v7">
                <h2 className="sharp-stroke sharp-stroke-green">
                  통합 애드온 패키지를<br />한 번에 설치하고 관리하세요
                </h2>
              </div>
              <div className="feature-content-v7">
                <p className="desc-v7">
                  수십 개의 필수 애드온을 하나로 묶어 간편하게 배포하고 설치할 수 있습니다.<br />
                  복잡한 설정 없이 클릭 한 번으로 최적화된 게임 환경을 구축하세요.
                </p>
              </div>
            </div>
          </section>

          <section className="feature-col poe-theme">
            <span className="badge-v7">PATH OF EXILE</span>
            <div className="feature-box-v8">
              <div className="feature-header-v7">
                <h2 className="sharp-stroke sharp-stroke-blue">
                  복잡한 필터 코드 작성,<br />이제 더 이상 필요 없습니다
                </h2>
              </div>
              <div className="feature-content-v7">
                <p className="desc-v7">
                  직관적인 UI로 드래그 앤 드롭만으로 아이템 필터를 쉽게 만들 수 있습니다.<br />
                  티어 분류, 스타일 커스터마이징, 실시간 미리보기까지 한 곳에서 관리하세요.
                </p>
                <ul className="check-list-v7">
                  <li><span>✓</span> 시각적 필터 생성 - 코드 작성 불필요</li>
                  <li><span>✓</span> S~E 티어 자동 분류 및 관리</li>
                  <li><span>✓</span> 실시간 미리보기로 즉시 확인</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="divider-v7" />

        {/* Simplified Services Section */}
        <div className="section-title-v7">
          <h2 className="sharp-stroke sharp-stroke-white">주요 서비스</h2>
          <p>게이머를 위한 최상의 도구와 커뮤니티를 제공합니다.</p>
        </div>

        <div className="service-row-v7">
          {services.map((service) => (
            <div key={service.id} className="service-box-v7" style={{ borderColor: service.color }}>
              <h3 className="service-title-v7">{service.name}</h3>
              <p className="service-text-v7">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .home-page {
          background: #000;
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .hero-v7-section {
          width: 100%;
          height: 400px;
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .hero-v7-image {
          width: 1320px;
          height: 400px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        .container-v7 {
          max-width: 1320px;
          margin: 0 auto;
          padding: 60px 24px;
        }

        .features-row {
          display: flex;
          gap: 40px;
          margin-bottom: 60px;
        }

        .feature-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .badge-v7 {
          display: inline-block;
          padding: 4px 12px;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid currentColor;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        /* Feature Box v8 Style */
        .feature-box-v8 {
          border: 1px solid currentColor;
          padding: 40px;
          background: rgba(255, 255, 255, 0.02);
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wow-theme { color: var(--neon-green); }
        .poe-theme { color: var(--neon-blue); }

        .feature-header-v7 h2 {
          font-size: 36px;
          line-height: 1.2;
        }

        .desc-v7 {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.6;
        }

        .check-list-v7 {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-top: 24px; /* 설명 문구와 체크리스트 사이 간격 추가 */
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .check-list-v7 li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .check-list-v7 span {
          color: var(--neon-blue);
          font-weight: 900;
        }

        .divider-v7 {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin: 60px 0;
        }

        .section-title-v7 {
          margin-bottom: 40px;
          border-left: 5px solid var(--neon-blue);
          padding-left: 20px;
        }

        .section-title-v7 h2 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .section-title-v7 p {
          color: var(--muted);
          font-size: 16px;
        }

        .service-row-v7 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .service-box-v7 {
          background: #111;
          padding: 24px;
          border-left: 3px solid;
          transition: transform 0.3s;
        }

        .service-title-v7 {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 12px;
        }

        .service-text-v7 {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .features-row {
            flex-direction: column;
            gap: 60px;
          }
          .service-row-v7 {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-v7-image {
            width: 100%;
          }
          .feature-box-v8 {
            padding: 30px;
          }
        }

        @media (max-width: 640px) {
          .service-row-v7 {
            grid-template-columns: 1fr;
          }
          .feature-header-v7 h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
