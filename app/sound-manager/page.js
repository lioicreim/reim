"use client";

import { useState } from "react";

export default function SoundManagerPage() {
  const [sounds, setSounds] = useState([
    {
      id: 1,
      name: "고레벨 희귀 아이템",
      soundFile: "rare_high_level.mp3",
      volume: 80,
      enabled: true,
    },
    {
      id: 2,
      name: "고유 아이템",
      soundFile: "unique_item.mp3",
      volume: 100,
      enabled: true,
    },
    {
      id: 3,
      name: "화폐 아이템",
      soundFile: "currency.mp3",
      volume: 70,
      enabled: false,
    },
  ]);

  const toggleSound = (id) => {
    setSounds(
      sounds.map((sound) =>
        sound.id === id ? { ...sound, enabled: !sound.enabled } : sound
      )
    );
  };

  const updateVolume = (id, volume) => {
    setSounds(
      sounds.map((sound) =>
        sound.id === id ? { ...sound, volume } : sound
      )
    );
  };

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              사운드 관리
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              아이템 발견 시 재생될 사운드를 설정하고 관리하세요
            </p>
          </div>
        </div>

        <div className="cardBody">
          <div className="sounds-list">
            {sounds.map((sound) => (
              <div key={sound.id} className="sound-card">
                <div className="sound-header">
                  <div>
                    <h3 className="sound-name">{sound.name}</h3>
                    <div className="sound-file">{sound.soundFile}</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={sound.enabled}
                      onChange={() => toggleSound(sound.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="sound-controls">
                  <div className="volume-control">
                    <label className="volume-label">볼륨: {sound.volume}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sound.volume}
                      onChange={(e) =>
                        updateVolume(sound.id, parseInt(e.target.value))
                      }
                      disabled={!sound.enabled}
                      className="volume-slider"
                    />
                  </div>
                  <button
                    className="btn-test"
                    disabled={!sound.enabled}
                  >
                    테스트 재생
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="sound-actions">
            <button className="btn-primary">사운드 파일 업로드</button>
            <button className="btn-secondary">기본 사운드 복원</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sounds-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .sound-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px;
        }

        .sound-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .sound-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .sound-file {
          font-size: 12px;
          color: var(--muted);
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--panel2);
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--tier-s);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .sound-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .volume-control {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .volume-label {
          font-size: 12px;
          color: var(--muted);
        }

        .volume-slider {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--panel2);
          outline: none;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--tier-s);
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--tier-s);
          cursor: pointer;
          border: none;
        }

        .volume-slider:disabled {
          opacity: 0.5;
        }

        .btn-test {
          padding: 8px 16px;
          background: var(--panel2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-test:hover:not(:disabled) {
          background: var(--panel);
        }

        .btn-test:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sound-actions {
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
