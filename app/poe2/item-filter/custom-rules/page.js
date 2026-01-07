"use client";

import { useState } from "react";

export default function CustomRulesPage() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "고레벨 희귀 아이템",
      conditions: {
        itemLevel: { min: 80, max: 82 },
        rarity: "Rare",
        class: "All",
      },
      actions: {
        fontSize: 45,
        borderColor: { r: 255, g: 0, b: 130 },
        playEffect: true,
        minimapIcon: { size: 2, color: "Pink", type: "Circle" },
      },
    },
  ]);

  const [editingRule, setEditingRule] = useState(null);

  return (
    <main className="container">
      <div className="card">
        <div className="cardBody">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
            <button className="btn-primary">새 규칙 추가</button>
          </div>
          <div className="rules-list">
            {rules.map((rule) => (
              <div key={rule.id} className="rule-card">
                <div className="rule-header">
                  <div>
                    <h3 className="rule-name">{rule.name}</h3>
                    <div className="rule-summary">
                      ItemLevel {rule.conditions.itemLevel.min}~{rule.conditions.itemLevel.max} • {rule.conditions.rarity}
                    </div>
                  </div>
                  <div className="rule-actions">
                    <button className="btn-secondary">편집</button>
                    <button className="btn-danger">삭제</button>
                  </div>
                </div>

                <div className="rule-details">
                  <div className="rule-section">
                    <div className="rule-section-title">조건</div>
                    <div className="rule-section-content">
                      <div>아이템 레벨: {rule.conditions.itemLevel.min} ~ {rule.conditions.itemLevel.max}</div>
                      <div>등급: {rule.conditions.rarity}</div>
                      <div>클래스: {rule.conditions.class}</div>
                    </div>
                  </div>

                  <div className="rule-section">
                    <div className="rule-section-title">액션</div>
                    <div className="rule-section-content">
                      <div>폰트 크기: {rule.actions.fontSize}</div>
                      <div>테두리 색상: RGB({rule.actions.borderColor.r}, {rule.actions.borderColor.g}, {rule.actions.borderColor.b})</div>
                      <div>이펙트 재생: {rule.actions.playEffect ? "예" : "아니오"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-primary {
          padding: 10px 20px;
          background: var(--tier-s);
          color: #000000;
          border: none;
          border-radius: 0;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rule-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 0;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .rule-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .rule-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .rule-summary {
          font-size: 12px;
          color: var(--muted);
        }

        .rule-actions {
          display: flex;
          gap: 8px;
        }

        .btn-secondary {
          padding: 6px 12px;
          background: var(--panel2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 0;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: var(--panel);
        }

        .btn-danger {
          padding: 6px 12px;
          background: transparent;
          color: var(--tier-s);
          border: 1px solid var(--tier-s);
          border-radius: 0;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-danger:hover {
          background: var(--tier-s);
          color: #000000;
        }

        .rule-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .rule-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rule-section-title {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .rule-section-content {
          font-size: 13px;
          color: var(--text);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>
    </main>
  );
}
