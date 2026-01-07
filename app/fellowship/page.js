"use client";

export default function FellowshipPage() {
  return (
    <main className="container">
      <div className="coming-soon-section">
        <div className="coming-soon-card">
          <h2 className="coming-soon-title">콘텐츠 업데이트 예정</h2>
          <p className="coming-soon-description">
            Fellowship 관련 가이드와 공략이 곧 추가될 예정입니다.
          </p>
        </div>
      </div>

      <style jsx>{`
        .coming-soon-section {
          margin: 48px 0;
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
      `}</style>
    </main>
  );
}
