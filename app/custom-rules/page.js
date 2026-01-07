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
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              커스텀 룰
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              자신만의 필터 규칙을 만들고 관리하세요
            </p>
          </div>
          <button className="btn-primary">규칙 추가</button>
        </div>

        <div className="cardBody">
          {/* 2열 레이아웃 */}
          <div className="custom-rules-layout">
            {/* 왼쪽 열 */}
            <div className="custom-rules-column">
              <div className="rules-list">
                {rules.filter((_, index) => index % 2 === 0).map((rule) => (
                  <div key={rule.id} className="rule-item">
                    <div className="rule-item-header" onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", flex: 1 }}>
                        <span className="section-toggle-icon">{editingRule === rule.id ? "▼" : "▶"}</span>
                        <h3 className="rule-item-title">{rule.name}</h3>
                      </div>
                      <button 
                        className="rule-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("이 규칙을 삭제하시겠습니까?")) {
                            setRules(rules.filter(r => r.id !== rule.id));
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                    {editingRule === rule.id && (
                      <div className="rule-item-content">
                        {/* 편집 내용이 여기에 들어갈 예정 */}
                        <div className="rule-summary">
                          ItemLevel {rule.conditions.itemLevel.min}~{rule.conditions.itemLevel.max} • {rule.conditions.rarity}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽 열 */}
            <div className="custom-rules-column">
              <div className="rules-list">
                {rules.filter((_, index) => index % 2 === 1).map((rule) => (
                  <div key={rule.id} className="rule-item">
                    <div className="rule-item-header" onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", flex: 1 }}>
                        <span className="section-toggle-icon">{editingRule === rule.id ? "▼" : "▶"}</span>
                        <h3 className="rule-item-title">{rule.name}</h3>
                      </div>
                      <button 
                        className="rule-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("이 규칙을 삭제하시겠습니까?")) {
                            setRules(rules.filter(r => r.id !== rule.id));
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                    {editingRule === rule.id && (
                      <div className="rule-item-content">
                        {/* 편집 내용이 여기에 들어갈 예정 */}
                        <div className="rule-summary">
                          ItemLevel {rule.conditions.itemLevel.min}~{rule.conditions.itemLevel.max} • {rule.conditions.rarity}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-primary {
          padding: 10px 20px;
          background: var(--game-primary);
          color: var(--poe2-secondary, #ffffff);
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

        .custom-rules-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .custom-rules-layout {
            grid-template-columns: 1fr;
          }
        }

        .custom-rules-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rule-item {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .rule-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .rule-item-header:hover {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .section-toggle-icon {
          font-size: 12px;
          color: var(--muted);
          transition: transform 0.2s;
          display: inline-block;
          width: 16px;
          text-align: center;
        }

        .rule-item-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .rule-delete-btn {
          padding: 2px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .rule-delete-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--text);
        }

        .rule-item-content {
          padding: 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: none;
        }

        .rule-summary {
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </main>
  );
}
