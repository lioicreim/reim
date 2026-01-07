"use client";

import Link from "next/link";

export default function ShopPage() {
  return (
    <main className="container">
      <div className="game-hero-section">
        <div className="hero-content">
          <h1 className="hero-title">SHOP</h1>
          <p className="hero-description">
            게임 관련 상품 및 굿즈를 만나보세요
          </p>
        </div>
      </div>

      <div className="coming-soon-section">
        <div className="coming-soon-card">
          <h2 className="coming-soon-title">샵 오픈 예정</h2>
          <p className="coming-soon-description">
            게임 관련 상품 및 굿즈가 곧 추가될 예정입니다.
          </p>
        </div>
      </div>

      <style jsx>{`
        .game-hero-section {
          padding: 48px 0;
          margin-bottom: 48px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: var(--tier-s);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .hero-description {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
        }

        .coming-soon-section {
          margin-bottom: 48px;
        }

        .coming-soon-card {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          padding: 48px;
          text-align: center;
        }

        .coming-soon-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
        }

        .coming-soon-description {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px;
          }
        }
      `}</style>
    </main>
  );
}
