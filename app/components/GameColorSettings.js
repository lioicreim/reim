"use client";

import { useState, useEffect } from "react";
import { getAllGameColors, setGameColor, resetGameColor, resetAllGameColors } from "@/lib/game-colors";

const GAMES = [
  { id: "poe2", name: "POE2", defaultColor: "#3E63DD", secondaryColor: "#ffffff" },
  { id: "poe1", name: "POE1", defaultColor: "#ff6b35" },
  { id: "wow", name: "WoW", defaultColor: "#D6409F" },
  { id: "last-epoch", name: "Last Epoch", defaultColor: "#9d4edd" },
  { id: "fellowship", name: "Fellowship", defaultColor: "#ffd700" },
  { id: "once-human", name: "Once Human", defaultColor: "#ff4757" },
];

export default function GameColorSettings({ onClose }) {
  const [colors, setColors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const gameColors = getAllGameColors();
    setColors(gameColors);
  }, []);

  const handleColorChange = (gameId, color) => {
    setColors((prev) => ({ ...prev, [gameId]: color }));
    setHasChanges(true);
    setGameColor(gameId, color);
  };

  const handleReset = (gameId) => {
    const game = GAMES.find((g) => g.id === gameId);
    if (game) {
      setColors((prev) => ({ ...prev, [gameId]: game.defaultColor }));
      resetGameColor(gameId);
      setHasChanges(true);
    }
  };

  const handleResetAll = () => {
    if (confirm("모든 게임 컬러를 기본값으로 복원하시겠습니까?")) {
      resetAllGameColors();
      const defaultColors = {};
      GAMES.forEach((game) => {
        defaultColors[game.id] = game.defaultColor;
      });
      setColors(defaultColors);
      setHasChanges(true);
    }
  };

  return (
    <div className="color-settings-modal">
      <div className="color-settings-overlay" onClick={onClose}></div>
      <div className="color-settings-content">
        <div className="color-settings-header">
          <h2>게임별 메인 컬러 설정</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="color-settings-body">
          {GAMES.map((game) => (
            <div key={game.id} className="color-setting-item">
              <div className="color-setting-label">
                <span className="color-setting-name">{game.name}</span>
                <span className="color-setting-default">기본값: {game.defaultColor}</span>
              </div>
              <div className="color-setting-controls">
                <input
                  type="color"
                  value={colors[game.id] || game.defaultColor}
                  onChange={(e) => handleColorChange(game.id, e.target.value)}
                  className="color-picker-input"
                />
                <input
                  type="text"
                  value={colors[game.id] || game.defaultColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                      handleColorChange(game.id, value);
                    }
                  }}
                  className="color-text-input"
                  placeholder="#000000"
                />
                <button
                  className="reset-button"
                  onClick={() => handleReset(game.id)}
                  title="기본값으로 복원"
                >
                  초기화
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="color-settings-footer">
          <button className="reset-all-button" onClick={handleResetAll}>
            전체 초기화
          </button>
          <button className="close-button-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      <style jsx>{`
        .color-settings-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .color-settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
        }

        .color-settings-content {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--border);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .color-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .color-settings-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: var(--text);
        }

        .color-settings-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .color-setting-item {
          margin-bottom: 24px;
        }

        .color-setting-item:last-child {
          margin-bottom: 0;
        }

        .color-setting-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .color-setting-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .color-setting-default {
          font-size: 12px;
          color: var(--muted);
        }

        .color-setting-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .color-picker-input {
          width: 60px;
          height: 40px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .color-text-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          font-family: monospace;
          outline: none;
        }

        .color-text-input:focus {
          border-color: var(--game-primary);
        }

        .reset-button {
          padding: 8px 16px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: var(--panel);
          border-color: var(--game-primary);
        }

        .color-settings-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }

        .reset-all-button {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-all-button:hover {
          color: var(--text);
          border-color: var(--text);
        }

        .close-button-primary {
          padding: 10px 24px;
          background: var(--game-primary);
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .close-button-primary:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
