"use client";

import { useState, useEffect } from "react";
import { setAdmin, isAdmin } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("tiers");
  const router = useRouter();
  
  useEffect(() => {
    // TODO: 나중에 실제 로그인 시스템으로 교체 필요
    // 현재는 데모용으로 localStorage 기반 관리자 인증 사용
    // 실제 구현 시:
    // 1. 로그인 페이지로 리다이렉트
    // 2. 세션/토큰 기반 인증
    // 3. 서버 사이드 권한 확인
    
    if (!isAdmin()) {
      // 데모용: 개발 중에는 간단하게 관리자 설정 가능
      // 프로덕션에서는 제거하고 실제 로그인 페이지로 리다이렉트
      const shouldLogin = confirm("관리자 모드에 접근하려면 로그인이 필요합니다.\n\n(데모용: 관리자로 설정하시겠습니까?)");
      if (shouldLogin) {
        setAdmin(true);
      } else {
        router.push("/");
      }
    }
  }, [router]);

  const tabs = [
    { id: "tiers", label: "티어 관리" },
    { id: "bases", label: "베이스 관리" },
    { id: "presets", label: "프리셋 관리" },
    { id: "users", label: "사용자 관리" },
  ];

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              관리자 모드
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              사이트의 모든 설정과 데이터를 관리하세요
            </p>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="cardBody">
          {activeTab === "tiers" && (
            <div className="admin-section">
              <h2 className="section-title">티어 관리</h2>
              <p className="section-description">
                아이템의 티어를 수정하고 관리할 수 있습니다.
              </p>
              <div className="admin-table">
                <div className="table-header">
                  <div>아이템명</div>
                  <div>클래스</div>
                  <div>현재 티어</div>
                  <div>액션</div>
                </div>
                <div className="table-row">
                  <div>Guardian Bow</div>
                  <div>Bows</div>
                  <div>
                    <span className="tier-badge tier-s">S</span>
                  </div>
                  <div>
                    <button className="btn-small">편집</button>
                  </div>
                </div>
                <div className="table-row">
                  <div>Gemini Bow</div>
                  <div>Bows</div>
                  <div>
                    <span className="tier-badge tier-s">S</span>
                  </div>
                  <div>
                    <button className="btn-small">편집</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bases" && (
            <div className="admin-section">
              <h2 className="section-title">베이스 관리</h2>
              <p className="section-description">
                아이템 베이스 정보를 추가, 수정, 삭제할 수 있습니다.
              </p>
              <button className="btn-primary">새 베이스 추가</button>
            </div>
          )}

          {activeTab === "presets" && (
            <div className="admin-section">
              <h2 className="section-title">프리셋 관리</h2>
              <p className="section-description">
                사용자들이 사용할 수 있는 프리셋을 관리합니다.
              </p>
              <div className="presets-list">
                <div className="preset-card">
                  <div className="preset-name">기본 프리셋</div>
                  <div className="preset-meta">사용자: 1,234명</div>
                  <div className="preset-actions">
                    <button className="btn-small">편집</button>
                    <button className="btn-small btn-danger">삭제</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-section">
              <h2 className="section-title">사용자 관리</h2>
              <p className="section-description">
                사용자 계정을 관리하고 권한을 설정할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
        }

        .admin-tab {
          padding: 12px 20px;
          background: transparent;
          color: var(--muted);
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-tab:hover {
          color: var(--text);
        }

        .admin-tab.active {
          color: var(--text);
          border-bottom-color: var(--tier-s);
        }

        .admin-section {
          padding: 24px 0;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .section-description {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .admin-table {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          background: var(--panel2);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--muted);
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px;
          border-top: 1px solid var(--border);
          align-items: center;
        }

        .table-row:hover {
          background: var(--panel2);
        }

        .tier-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
        }

        .tier-badge.tier-s {
          background: var(--tier-s);
        }

        .btn-small {
          padding: 6px 12px;
          background: var(--panel2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-small:hover {
          background: var(--panel);
        }

        .btn-small.btn-danger {
          color: var(--tier-s);
          border-color: var(--tier-s);
        }

        .btn-small.btn-danger:hover {
          background: var(--tier-s);
          color: #fff;
        }

        .btn-primary {
          padding: 10px 20px;
          background: var(--tier-s);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .presets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preset-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .preset-name {
          font-size: 16px;
          font-weight: 600;
        }

        .preset-meta {
          font-size: 12px;
          color: var(--muted);
        }

        .preset-actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </main>
  );
}
