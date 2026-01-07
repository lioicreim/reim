"use client";

import { useState } from "react";
import classes from "@/data/classes.json";
import bases from "@/data/bases.json";

export default function QuickFiltersPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("Rare");
  const [minIlvl, setMinIlvl] = useState("");
  const [maxIlvl, setMaxIlvl] = useState("");

  const classNames = Object.keys(classes).sort();

  const getFilteredBases = () => {
    if (!selectedClass) return [];

    return Object.keys(bases)
      .map((name) => ({ name, ...bases[name] }))
      .filter((item) => {
        if (item.class !== selectedClass) return false;
        if (selectedTier && item.tier !== parseInt(selectedTier)) return false;
        return true;
      });
  };

  const filteredBases = getFilteredBases();

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Quick Filter
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              빠르게 필터를 설정하고 커스터마이징하세요
            </p>
          </div>
        </div>

        <div className="cardBody">
          <div className="filter-controls">
            <div className="filter-group">
              <label className="filter-label">클래스</label>
              <select
                className="filter-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">전체</option>
                {classNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">티어</label>
              <select
                className="filter-select"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                <option value="">전체</option>
                <option value="1">1 (S)</option>
                <option value="2">2 (A)</option>
                <option value="3">3 (B)</option>
                <option value="4">4 (C/D)</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">등급</label>
              <select
                className="filter-select"
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
              >
                <option value="Normal">일반</option>
                <option value="Magic">마법</option>
                <option value="Rare">희귀</option>
                <option value="Unique">고유</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">최소 아이템 레벨</label>
              <input
                type="number"
                className="filter-input"
                value={minIlvl}
                onChange={(e) => setMinIlvl(e.target.value)}
                placeholder="예: 75"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">최대 아이템 레벨</label>
              <input
                type="number"
                className="filter-input"
                value={maxIlvl}
                onChange={(e) => setMaxIlvl(e.target.value)}
                placeholder="예: 82"
              />
            </div>
          </div>

          <div className="filter-results">
            <div className="results-header">
              <h2>필터 결과 ({filteredBases.length}개)</h2>
              <button className="btn-primary">필터 다운로드</button>
            </div>

            <div className="results-grid">
              {filteredBases.map((item) => (
                <div key={item.name} className="result-item">
                  <div className="result-item-name">{item.name}</div>
                  <div className="result-item-meta">
                    <span>Tier {item.tier}</span>
                    {item.armourType && <span>• {item.armourType}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .filter-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .filter-select,
        .filter-input {
          padding: 10px 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .filter-results {
          margin-top: 24px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .results-header h2 {
          font-size: 20px;
          font-weight: 700;
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

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .result-item {
          padding: 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .result-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .result-item-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .result-item-meta {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          gap: 8px;
        }
      `}</style>
    </main>
  );
}
