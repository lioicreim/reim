"use client";

export default function Home() {
  return (
    <main className="container">
      <div className="hero-section">
        <h1 className="hero-title">Reim Filter</h1>
        <p className="hero-description">
          Path of Exile 2 아이템 필터를 쉽게 커스터마이징하고 관리하세요
        </p>
      </div>

      <div className="update-notice">
        <p className="update-text">업데이트 예정중입니다</p>
      </div>

      <style jsx>{`
        .hero-section {
          text-align: center;
          padding: 64px 24px;
          margin-bottom: 48px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(
            135deg,
            var(--tier-s) 0%,
            var(--tier-a) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .update-notice {
          text-align: center;
          padding: 64px 24px;
          margin-top: 48px;
        }

        .update-text {
          font-size: 20px;
          color: var(--muted);
          font-weight: 500;
        }
      `}</style>
    </main>
  );
}
