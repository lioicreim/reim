"use client";

import { useState } from "react";

export default function PreviewPage() {
  const [selectedPreset, setSelectedPreset] = useState("default");
  const [previewMode, setPreviewMode] = useState("grid");

  const mockItems = [
    { name: "Guardian Bow", tier: "S", rarity: "Rare", ilvl: 82 },
    { name: "Gemini Bow", tier: "S", rarity: "Rare", ilvl: 81 },
    { name: "Warmonger Bow", tier: "S", rarity: "Rare", ilvl: 82 },
    { name: "Twin Bow", tier: "A", rarity: "Rare", ilvl: 80 },
    { name: "Ironwood Shortbow", tier: "A", rarity: "Rare", ilvl: 79 },
    { name: "Cavalry Bow", tier: "A", rarity: "Rare", ilvl: 78 },
    { name: "Artillery Bow", tier: "B", rarity: "Rare", ilvl: 77 },
    { name: "Tribal Bow", tier: "B", rarity: "Rare", ilvl: 76 },
  ];

  const tierColors = {
    S: "var(--tier-s)",
    A: "var(--tier-a)",
    B: "var(--tier-b)",
    C: "var(--tier-c)",
    D: "var(--tier-d)",
    E: "var(--tier-e)",
  };

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              프리뷰
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              설정한 필터가 게임 내에서 어떻게 보이는지 미리 확인하세요
            </p>
          </div>
          <div className="preview-controls">
            <select
              className="preview-select"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
            >
              <option value="default">기본 프리셋</option>
              <option value="custom">커스텀 프리셋</option>
            </select>
            <div className="preview-mode-toggle">
              <button
                className={`mode-btn ${previewMode === "grid" ? "active" : ""}`}
                onClick={() => setPreviewMode("grid")}
              >
                그리드
              </button>
              <button
                className={`mode-btn ${previewMode === "list" ? "active" : ""}`}
                onClick={() => setPreviewMode("list")}
              >
                리스트
              </button>
            </div>
          </div>
        </div>

        <div className="cardBody">
          <div className="preview-info">
            <div className="info-item">
              <span className="info-label">프리셋:</span>
              <span className="info-value">{selectedPreset}</span>
            </div>
            <div className="info-item">
              <span className="info-label">아이템 수:</span>
              <span className="info-value">{mockItems.length}개</span>
            </div>
            <div className="info-item">
              <span className="info-label">모드:</span>
              <span className="info-value">{previewMode}</span>
            </div>
          </div>

          {previewMode === "grid" ? (
            <div className="preview-grid">
              {mockItems.map((item, index) => (
                <div
                  key={index}
                  className="preview-item"
                  style={{
                    background: tierColors[item.tier],
                    opacity: 0.9,
                  }}
                >
                  <div className="preview-item-name">{item.name}</div>
                  <div className="preview-item-meta">
                    <span>Tier {item.tier}</span>
                    <span>•</span>
                    <span>{item.rarity}</span>
                    <span>•</span>
                    <span>iLvl {item.ilvl}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="preview-list">
              {mockItems.map((item, index) => (
                <div
                  key={index}
                  className="preview-list-item"
                  style={{
                    borderLeft: `4px solid ${tierColors[item.tier]}`,
                  }}
                >
                  <div className="preview-list-content">
                    <div className="preview-list-name">{item.name}</div>
                    <div className="preview-list-meta">
                      <span>Tier {item.tier}</span>
                      <span>•</span>
                      <span>{item.rarity}</span>
                      <span>•</span>
                      <span>iLvl {item.ilvl}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="preview-actions">
            <button className="btn-primary">필터 다운로드</button>
            <button className="btn-secondary">설정 저장</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .preview-select {
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-size: 14px;
        }

        .preview-mode-toggle {
          display: flex;
          background: var(--panel2);
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }

        .mode-btn {
          padding: 8px 16px;
          background: transparent;
          color: var(--muted);
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: var(--tier-s);
          color: #fff;
        }

        .preview-info {
          display: flex;
          gap: 24px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          gap: 8px;
        }

        .info-label {
          font-size: 12px;
          color: var(--muted);
        }

        .info-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .preview-item {
          padding: 16px;
          border-radius: 8px;
          cursor: default;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .preview-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .preview-item-name {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .preview-item-meta {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          gap: 6px;
        }

        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }

        .preview-list-item {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .preview-list-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .preview-list-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-list-name {
          font-size: 16px;
          font-weight: 600;
        }

        .preview-list-meta {
          font-size: 12px;
          color: var(--muted);
          display: flex;
          gap: 8px;
        }

        .preview-actions {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
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

        .btn-secondary {
          padding: 10px 20px;
          background: var(--panel2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: var(--panel);
        }
      `}</style>
    </main>
  );
}
