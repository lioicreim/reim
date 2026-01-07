"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import bases from "@/data/bases.json";
import classes from "@/data/classes.json";

// 티어 매핑: 1->S, 2->A, 3->B, 4->C, 5->D, 6->E
const tierMapping = {
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
  E: 6,
};

const tierColors = {
  S: "var(--tier-s)",
  A: "var(--tier-a)",
  B: "var(--tier-b)",
  C: "var(--tier-c)",
  D: "var(--tier-d)",
  E: "var(--tier-e)",
};

function getTierLabel(numTier) {
  const mapping = {
    1: "S",
    2: "A",
    3: "B",
    4: "C",
  };
  return mapping[numTier] || "D";
}

export default function TierListPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 클래스를 카테고리별로 분류
  const classCategories = {
    "무기": [
      "Wands", "Staves", "Foci", "Sceptres", "Bows", "Quivers",
      "Crossbows", "Quarterstaves", "Spears", "Talismans",
      "One Hand Maces", "Two Hand Maces"
    ],
    "방어구": [
      "Armours", "Helmets", "Gloves", "Boots", "Shields", "Bucklers"
    ],
    "장신구": [
      "Amulets", "Rings", "Belts"
    ]
  };
  
  // 모든 아이템을 티어별로 그룹화
  const itemsByTier = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
  };

  // bases.json에서 모든 아이템을 가져와서 티어별로 분류
  // 티어 매핑: 1->S, 2->A, 3->B, 4->C, 5->D, 6->E
  Object.keys(bases).forEach((itemName) => {
    const item = bases[itemName];
    const numTier = item.tier || 4;
    
    // E 티어는 특정 클래스(Belts)를 먼저 분류
    if (item.class === "Belts") {
      itemsByTier.E.push({ name: itemName, ...item });
      return;
    }
    
    // 티어 매핑
    if (numTier === 1) {
      itemsByTier.S.push({ name: itemName, ...item });
    } else if (numTier === 2) {
      itemsByTier.A.push({ name: itemName, ...item });
    } else if (numTier === 3) {
      itemsByTier.B.push({ name: itemName, ...item });
    } else {
      // 티어 4 이상은 C와 D로 분류
      if (numTier === 4) {
        itemsByTier.C.push({ name: itemName, ...item });
      } else {
        itemsByTier.D.push({ name: itemName, ...item });
      }
    }
  });

  // 클래스별로 그룹화
  const itemsByClass = {};
  ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
    itemsByTier[tier].forEach((item) => {
      if (!itemsByClass[item.class]) {
        itemsByClass[item.class] = {};
      }
      if (!itemsByClass[item.class][tier]) {
        itemsByClass[item.class][tier] = [];
      }
      itemsByClass[item.class][tier].push(item);
    });
  });

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              티어 리스트
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              아이템을 S~E 티어로 분류하여 시각적으로 확인하세요
            </p>
          </div>
        </div>

        <div className="cardBody">
          {/* 아이템 클래스 선택 드롭다운 */}
          <div className="class-selector">
            <label className="class-selector-label">ITEM CLASS</label>
            <div className="custom-dropdown">
              <div
                className="dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedClass || "전체 클래스"}
                <span className="dropdown-arrow">▼</span>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-option"
                    onClick={() => {
                      setSelectedClass("");
                      setIsDropdownOpen(false);
                    }}
                  >
                    전체 클래스
                  </div>
                  {Object.keys(classCategories).map((category) => (
                    <div key={category}>
                      <div className="dropdown-category">{category}</div>
                      {classCategories[category]
                        .filter((className) => classes[className])
                        .sort()
                        .map((className) => (
                          <div
                            key={className}
                            className={`dropdown-option dropdown-option-indented ${
                              selectedClass === className ? "selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedClass(className);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {className}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* S, A, B, C, D 티어 그리드 */}
          <div className="tier-grid-main">
            {["S", "A", "B", "C", "D"].map((tier) => (
              <div key={tier} className="tier-column">
                <div
                  className="tier-header"
                  style={{
                    background: tierColors[tier],
                    color: tier === "S" ? "rgb(255, 0, 0)" : tier === "A" || tier === "B" ? "#ffffff" : "#000000",
                  }}
                >
                  <div className="tier-label">{tier} 티어</div>
                  <div className="tier-count">
                    {itemsByTier[tier].length}개
                  </div>
                </div>
                <div className="tier-items">
                  {Object.keys(itemsByClass)
                    .sort()
                    .filter((className) => !selectedClass || className === selectedClass)
                    .map((className) => {
                      const classItems = itemsByClass[className][tier] || [];
                      if (classItems.length === 0) return null;

                      return (
                        <div key={className} className="tier-class-group">
                          {!selectedClass && (
                            <div className="tier-class-name">{className}</div>
                          )}
                          {classItems.map((item) => (
                            <div
                              key={item.name}
                              className="tier-item"
                              style={{
                                background: tierColors[tier],
                                opacity: tier === "S" ? 1 : 0.9,
                                color: tier === "S" ? "#000000" : tier === "A" || tier === "B" ? "#ffffff" : "#000000",
                              }}
                              title={`${item.name} - ${item.class}`}
                            >
                              <div className="tier-item-name">{item.name}</div>
                              {item.armourType && (
                                <div className="tier-item-meta">
                                  {item.armourType}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  
                  {/* D 티어 열에 E 티어 아이템들 추가 */}
                  {tier === "D" && (
                    <>
                      {itemsByTier.E.length > 0 && (
                        <>
                          <div className="tier-e-divider">
                            <div className="tier-e-header">
                              <div className="tier-e-label">E 티어</div>
                              <div className="tier-e-count">
                                {itemsByTier.E.length}개
                              </div>
                            </div>
                          </div>
                          {Object.keys(itemsByClass)
                            .sort()
                            .filter((className) => !selectedClass || className === selectedClass)
                            .map((className) => {
                              const classItems = itemsByClass[className]["E"] || [];
                              if (classItems.length === 0) return null;

                              return (
                                <div key={`E-${className}`} className="tier-class-group">
                                  {!selectedClass && (
                                    <div className="tier-class-name">{className}</div>
                                  )}
                                  {classItems.map((item) => (
                                    <div
                                      key={item.name}
                                      className="tier-item"
                                      style={{
                                        background: tierColors.E,
                                        opacity: 0.9,
                                        color: "rgb(220, 175, 132)",
                                      }}
                                      title={`${item.name} - ${item.class}`}
                                    >
                                      <div className="tier-item-name">{item.name}</div>
                                      {item.armourType && (
                                        <div className="tier-item-meta">
                                          {item.armourType}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .class-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .class-selector-label {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .custom-dropdown {
          position: relative;
          min-width: 200px;
        }

        .dropdown-trigger {
          padding: 8px 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 0;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.2s;
        }

        .dropdown-trigger:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .dropdown-arrow {
          font-size: 10px;
          opacity: 0.7;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 0;
          margin-top: 4px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dropdown-category {
          padding: 8px 12px;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          background: var(--panel2);
          border-bottom: 1px solid var(--border);
        }

        .dropdown-option {
          padding: 8px 12px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-option:hover {
          background: var(--panel2);
        }

        .dropdown-option.selected {
          background: var(--panel2);
          color: var(--tier-s);
        }

        .dropdown-option-indented {
          padding-left: 24px;
        }

        .tier-grid-main {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .tier-column {
          display: flex;
          flex-direction: column;
        }

        .tier-header {
          padding: 8px 12px;
          border-radius: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .tier-label {
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .tier-count {
          font-size: 11px;
          opacity: 0.9;
        }

        .tier-items {
          flex: 1;
          overflow: visible;
        }

        .tier-class-group {
          margin-bottom: 16px;
        }

        .tier-class-name {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .tier-item {
          padding: 8px 12px;
          border-radius: 0;
          margin-bottom: 6px;
          cursor: default;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .tier-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tier-item-name {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .tier-item-meta {
          font-size: 10px;
          opacity: 0.7;
        }

        .tier-e-divider {
          margin-top: 24px;
          margin-bottom: 16px;
          padding-top: 24px;
          border-top: 2px solid var(--border);
        }

        .tier-e-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--tier-e);
          border-radius: 0;
          margin-bottom: 12px;
        }

        .tier-e-label {
          font-size: 14px;
          font-weight: 700;
          color: rgb(220, 175, 132);
          letter-spacing: 0.5px;
        }

        .tier-e-count {
          font-size: 11px;
          color: rgb(220, 175, 132);
          opacity: 0.9;
        }

        @media (max-width: 1200px) {
          .tier-grid-main {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tier-grid-main {
            grid-template-columns: 1fr;
          }

          .tier-e-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
