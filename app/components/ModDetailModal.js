"use client";

import { useEffect } from "react";

/**
 * 모드 상세 정보를 보여주는 모달 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 콜백
 * @param {Object} props.mod - 모드 데이터 객체
 * @param {string} props.lang - 언어 설정 ("ko" 또는 "en")
 */
export default function ModDetailModal({
  isOpen = false,
  onClose,
  mod,
  lang = "ko",
}) {
  if (!isOpen || !mod) return null;

  return (
    <>
      <div className="mod-modal-overlay" onClick={onClose}>
        <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
          <div className="mod-modal-header">
            <div className="mod-modal-title-group">
              <span className={`mod-type-badge ${mod.type}`}>
                {mod.type === "prefix" ? (lang === "ko" ? "접두어" : "Prefix") : (lang === "ko" ? "접미어" : "Suffix")}
              </span>
              <h3 className="mod-modal-title">
                {lang === "ko" ? mod.nameKo : mod.nameEn}
              </h3>
            </div>
            <button className="mod-modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="mod-modal-content">
            <div className="mod-tags">
              {mod.tags && mod.tags.map((tag, idx) => (
                <span key={idx} className={`mod-tag tag-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mod-modal-subtitle">
              {lang === "ko" ? "티어별 옵션 정보" : "Tier statistics"}
            </div>

            <div className="mod-tiers-list">
              <div className="mod-tier-row header">
                <div className="tier-col-rank">TIER</div>
                <div className="tier-col-name">{lang === "ko" ? "이름" : "Name"}</div>
                <div className="tier-col-level">{lang === "ko" ? "레벨" : "Level"}</div>
                <div className="tier-col-values">{lang === "ko" ? "수치" : "Values"}</div>
              </div>
              
              {mod.tiers && mod.tiers.map((t, idx) => (
                <div key={idx} className="mod-tier-row">
                  <div className="tier-col-rank">T{t.tier}</div>
                  <div className="tier-col-name">
                    <div className="tier-internal-en">{t.nameEn}</div>
                    <div className="tier-internal-ko">{t.nameKo}</div>
                  </div>
                  <div className="tier-col-level">{t.level}</div>
                  <div className="tier-col-values">{t.values}</div>
                </div>
              ))}
            </div>
            
            <div className="mod-modal-footer-info">
              {lang === "ko" 
                ? "* 게임 내 아이템 필터에서는 영문 등급 이름(예: Crystalising)으로 구분됩니다." 
                : "* In-game item filters use internal names (e.g. Crystalising) for identification."}
            </div>
          </div>
          
          <div className="mod-modal-actions">
            <button className="mod-modal-button" onClick={onClose}>
              {lang === "ko" ? "닫기" : "Close"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mod-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .mod-modal {
          background: #121212;
          border: 1px solid #333;
          width: 90%;
          max-width: 650px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalAppear {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .mod-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a1a;
        }

        .mod-modal-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mod-modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .mod-type-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          text-transform: uppercase;
          border-radius: 2px;
        }

        .mod-type-badge.prefix {
          background: rgba(66, 153, 225, 0.15);
          color: #4299e1;
          border: 1px solid rgba(66, 153, 225, 0.3);
        }

        .mod-type-badge.suffix {
          background: rgba(159, 122, 234, 0.15);
          color: #9f7aea;
          border: 1px solid rgba(159, 122, 234, 0.3);
        }

        .mod-modal-close {
          background: none;
          border: none;
          color: #666;
          font-size: 30px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: color 0.2s;
        }

        .mod-modal-close:hover {
          color: #fff;
        }

        .mod-modal-content {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .mod-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
        }

        .mod-tag {
          font-size: 12px;
          padding: 2px 8px;
          background: #252525;
          color: #aaa;
          border-radius: 4px;
        }

        .tag-피해 { color: #ff4d4d; background: rgba(255, 77, 77, 0.15); border: 1px solid rgba(255, 77, 77, 0.2); }
        .tag-물리 { color: #d4af37; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.2); }
        .tag-공격 { color: #82ccdd; background: rgba(130, 204, 221, 0.15); border: 1px solid rgba(130, 204, 221, 0.2); }
        .tag-원소 { color: #60a3bc; background: rgba(96, 163, 188, 0.15); border: 1px solid rgba(96, 163, 188, 0.2); }
        .tag-냉기 { color: #70a1ff; background: rgba(112, 161, 255, 0.15); border: 1px solid rgba(112, 161, 255, 0.2); }
        .tag-화염 { color: #e67e22; background: rgba(230, 126, 34, 0.15); border: 1px solid rgba(230, 126, 34, 0.2); }
        .tag-번개 { color: #f1c40f; background: rgba(241, 196, 15, 0.15); border: 1px solid rgba(241, 196, 15, 0.2); }
        .tag-카오스 { color: #9b59b6; background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.2); }
        .tag-속도 { color: #2ecc71; background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.2); }
        .tag-생명력 { color: #e74c3c; background: rgba(231, 76, 60, 0.15); border: 1px solid rgba(231, 76, 60, 0.2); }
        .tag-마나 { color: #3498db; background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.2); }
        .tag-에너지보호막 { color: #ecf0f1; background: rgba(236, 240, 241, 0.15); border: 1px solid rgba(236, 240, 241, 0.2); }
        .tag-능력치 { color: #bdc3c7; background: rgba(189, 195, 199, 0.15); border: 1px solid rgba(189, 195, 199, 0.2); }
        .tag-크리티컬 { color: #e67e22; background: rgba(230, 126, 34, 0.15); border: 1px solid rgba(230, 126, 34, 0.2); }

        .mod-modal-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #888;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .mod-tiers-list {
          border: 1px solid #222;
          background: #0a0a0a;
        }

        .mod-tier-row {
          display: grid;
          grid-template-columns: 50px 1fr 60px 180px;
          padding: 12px 16px;
          border-bottom: 1px solid #1a1a1a;
          align-items: center;
        }

        .mod-tier-row:last-child {
          border-bottom: none;
        }

        .mod-tier-row.header {
          background: #1a1a1a;
          font-size: 11px;
          font-weight: 800;
          color: #555;
          text-transform: uppercase;
        }

        .tier-col-rank {
          font-weight: 800;
          color: #555;
        }

        .tier-col-name {
          display: flex;
          flex-direction: column;
        }

        .tier-internal-en {
          font-size: 14px;
          font-weight: 600;
          color: #ccc;
        }

        .tier-internal-ko {
          font-size: 12px;
          color: #666;
        }

        .tier-col-level {
          font-size: 14px;
          color: #888;
          text-align: center;
        }

        .tier-col-values {
          font-size: 14px;
          color: #a3ff12;
          font-family: monospace;
          text-align: right;
        }

        .mod-modal-footer-info {
          margin-top: 24px;
          font-size: 12px;
          color: #555;
          font-style: italic;
        }

        .mod-modal-actions {
          padding: 16px 24px;
          border-top: 1px solid #222;
          background: #1a1a1a;
          display: flex;
          justify-content: flex-end;
        }

        .mod-modal-button {
          background: #333;
          color: #fff;
          border: none;
          padding: 8px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .mod-modal-button:hover {
          background: #444;
        }
      `}</style>
    </>
  );
}
