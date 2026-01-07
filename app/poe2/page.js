"use client";

import Link from "next/link";

export default function Poe2Page() {
  const guides = [
    {
      id: 1,
      title: "초보자를 위한 PoE2 시작 가이드",
      description: "Path of Exile 2를 처음 시작하는 플레이어를 위한 종합 가이드",
      category: "가이드",
      date: "2024-01-15",
      image: "/images/poe2-guide-1.jpg",
    },
    {
      id: 2,
      title: "레벨링 최적화 전략",
      description: "효율적인 레벨링을 위한 빌드와 팁",
      category: "레벨링",
      date: "2024-01-12",
      image: "/images/poe2-leveling.jpg",
    },
    {
      id: 3,
      title: "엔드게임 컨텐츠 가이드",
      description: "맵, 보스, 고급 컨텐츠 공략",
      category: "공략",
      date: "2024-01-10",
      image: "/images/poe2-endgame.jpg",
    },
  ];

  return (
    <main className="container">
      {/* 최근 가이드 */}
      <div className="guides-section">
        <div className="section-header">
          <h2 className="section-title">최근 가이드</h2>
          <Link href="/poe2/guides" className="view-all-link">
            모두 보기 →
          </Link>
        </div>
        <div className="guides-grid">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/poe2/guides/${guide.id}`}
              className="guide-card"
            >
              <div className="guide-image-placeholder">
                <div className="guide-category">{guide.category}</div>
              </div>
              <div className="guide-content">
                <h3 className="guide-title">{guide.title}</h3>
                <p className="guide-description">{guide.description}</p>
                <div className="guide-meta">
                  <span className="guide-date">{guide.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 인기 콘텐츠 */}
      <div className="popular-section">
        <h2 className="section-title">인기 콘텐츠</h2>
        <div className="popular-list">
          <div className="popular-item">
            <div className="popular-number">1</div>
            <div className="popular-content">
              <h3 className="popular-title">아이템 필터 커스터마이징 가이드</h3>
              <p className="popular-meta">아이템 필터 · 조회수 1,234</p>
            </div>
          </div>
          <div className="popular-item">
            <div className="popular-number">2</div>
            <div className="popular-content">
              <h3 className="popular-title">최신 빌드 메타 분석</h3>
              <p className="popular-meta">가이드 · 조회수 987</p>
            </div>
          </div>
          <div className="popular-item">
            <div className="popular-number">3</div>
            <div className="popular-content">
              <h3 className="popular-title">레벨링 루트 최적화</h3>
              <p className="popular-meta">레벨링 · 조회수 856</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .guides-section {
          margin-bottom: 48px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .view-all-link {
          color: var(--tier-s);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: opacity 0.2s;
        }

        .view-all-link:hover {
          opacity: 0.7;
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .guide-card {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          overflow: hidden;
          text-decoration: none;
          color: var(--text);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .guide-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .guide-image-placeholder {
          height: 180px;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .guide-category {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          background: var(--tier-s);
          color: #000000;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .guide-content {
          padding: 20px;
        }

        .guide-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .guide-description {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .guide-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .guide-date {
          font-size: 12px;
          color: var(--muted);
        }

        .popular-section {
          margin-bottom: 48px;
        }

        .popular-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .popular-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .popular-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .popular-number {
          width: 40px;
          height: 40px;
          background: var(--tier-s);
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          border-radius: 0;
          flex-shrink: 0;
        }

        .popular-content {
          flex: 1;
        }

        .popular-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .popular-meta {
          font-size: 12px;
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .guides-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
