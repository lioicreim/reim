"use client";

import { useState, useEffect } from "react";
import presetsData from "@/data/presets.json";
import NotificationModal from "./NotificationModal";

export default function ItemFilterActions({
  lang = "ko",
  onDownload,
  onCopy,
  onReset,
  onResetAll,
  onResetPage,
  onSaveAsDefault,
  onLoadFromStorage,
  onLoadFromFile,
  onAccountLink,
  onSaveAsMyFilter,
  onLoadMyFilter,
  showSaveAsDefaultDropdown = true,
  showReset = true,
  onShowSuccess,
  onSaveAsLeagueDefault, // 시세 그룹별 기본값 저장 콜백
  leagueOptions = [], // 시세 그룹 옵션 배열 [{ id: "default", name: "기본값" }, ...]
  showSaveAsLeagueDefault = true, // 관리자 기능 표시 여부 (현재는 항상 true)
}) {
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showSaveDefaultDropdown, setShowSaveDefaultDropdown] = useState(false);
  const [showSaveLeagueDefaultDropdown, setShowSaveLeagueDefaultDropdown] = useState(false);
  const [showResetDropdown, setShowResetDropdown] = useState(false);
  const [hoveredMyFilter, setHoveredMyFilter] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'all' or 'page'
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 저장된 필터 목록 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_filters");
      if (saved) {
        try {
          const filters = JSON.parse(saved);
          setSavedFilters(Array.isArray(filters) ? filters : []);
        } catch (e) {
          console.error("Failed to parse saved filters:", e);
          setSavedFilters([]);
        }
      } else {
        setSavedFilters([]);
      }
    }
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLoadDropdown && !e.target.closest(".action-button-wrapper")) {
        setShowLoadDropdown(false);
      }
      if (
        showSaveDefaultDropdown &&
        !e.target.closest(".action-button-wrapper")
      ) {
        setShowSaveDefaultDropdown(false);
      }
      if (
        showSaveLeagueDefaultDropdown &&
        !e.target.closest(".action-button-wrapper")
      ) {
        setShowSaveLeagueDefaultDropdown(false);
      }
      if (
        showResetDropdown &&
        !e.target.closest(".action-button-wrapper")
      ) {
        setShowResetDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLoadDropdown, showSaveDefaultDropdown, showSaveLeagueDefaultDropdown, showResetDropdown]);

  const handleLoadFromStorage = () => {
    if (onLoadFromStorage) {
      onLoadFromStorage();
    } else {
      alert(
        lang === "ko"
          ? "파일 불러오기 기능은 준비 중입니다."
          : "File load feature coming soon."
      );
    }
    setShowLoadDropdown(false);
  };

  const handleLoadFromFile = () => {
    if (onLoadFromFile) {
      onLoadFromFile();
    } else {
      alert(
        lang === "ko"
          ? "파일 불러오기 기능은 준비 중입니다."
          : "File load feature coming soon."
      );
    }
    setShowLoadDropdown(false);
  };

  const handleAccountLink = () => {
    if (onAccountLink) {
      onAccountLink();
    } else {
      // 공식 사이트의 아이템 필터 페이지로 새 창에서 열기
      window.open(
        "https://poe.game.daum.net/account/view-profile/riozio-6470/item-filters",
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleSaveAsDefault = (presetId) => {
    if (onSaveAsDefault) {
      onSaveAsDefault(presetId);
      setShowSaveDefaultDropdown(false);
    }
  };

  const handleSaveAsLeagueDefault = (leagueId) => {
    if (onSaveAsLeagueDefault) {
      onSaveAsLeagueDefault(leagueId);
      setShowSaveLeagueDefaultDropdown(false);
    }
  };

  const handleSaveAsMyFilter = () => {
    setShowSaveDefaultDropdown(false);
    if (onSaveAsMyFilter) {
      onSaveAsMyFilter();
    } else {
      // 나중에 팝업창이 뜨도록 할 예정
      alert(lang === "ko" ? "필터 이름을 입력하는 팝업창 기능은 준비 중입니다." : "Filter name input popup feature coming soon.");
    }
  };

  const handleLoadMyFilter = (filterId) => {
    setShowLoadDropdown(false);
    setHoveredMyFilter(false);
    if (onLoadMyFilter) {
      onLoadMyFilter(filterId);
    } else {
      alert(lang === "ko" ? "필터 불러오기 기능은 준비 중입니다." : "Load filter feature coming soon.");
    }
  };

  const handleResetAll = () => {
    setShowResetDropdown(false);
    setConfirmType("all");
    setConfirmModalOpen(true);
  };

  const handleResetPage = () => {
    setShowResetDropdown(false);
    setConfirmType("page");
    setConfirmModalOpen(true);
  };

  const handleConfirmReset = () => {
    setConfirmModalOpen(false);
    if (confirmType === "all" && onResetAll) {
      onResetAll((message) => {
        setSuccessMessage(message);
        setSuccessModalOpen(true);
      });
    } else if (confirmType === "page" && onResetPage) {
      onResetPage((message) => {
        setSuccessMessage(message);
        setSuccessModalOpen(true);
      });
    } else if (onReset) {
      // 기존 onReset 호환성 유지
      onReset();
    }
    setConfirmType(null);
  };

  const handleCloseSuccess = () => {
    setSuccessModalOpen(false);
    setSuccessMessage("");
  };

  const handleCancelReset = () => {
    setConfirmModalOpen(false);
    setConfirmType(null);
  };

  return (
    <>
      <div className="quick-filters-actions">
        <div className="action-buttons-left">
          {/* 불러오기 */}
          <div className="action-button-wrapper">
            <button
              className="action-button action-button-secondary"
              onClick={() => setShowLoadDropdown(!showLoadDropdown)}
            >
              {lang === "ko" ? "불러오기" : "Load"}
              <span className="dropdown-icon">▼</span>
            </button>
            {showLoadDropdown && (
              <div className="action-dropdown">
                <button
                  className="dropdown-item"
                  onClick={handleLoadFromStorage}
                >
                  {lang === "ko"
                    ? "로컬 저장소에서 불러오기"
                    : "Load from Local Storage"}
                </button>
                <button
                  className="dropdown-item"
                  onClick={handleLoadFromFile}
                >
                  {lang === "ko" ? "파일에서 불러오기" : "Load from File"}
                </button>
                {savedFilters.length > 0 && (
                  <div
                    className="dropdown-item dropdown-item-with-submenu"
                    onMouseEnter={() => setHoveredMyFilter(true)}
                    onMouseLeave={() => setHoveredMyFilter(false)}
                  >
                    {lang === "ko" ? "내 필터" : "My Filters"}
                    <span className="submenu-arrow">▶</span>
                    {hoveredMyFilter && (
                      <div className="action-submenu">
                        {savedFilters.map((filter) => (
                          <button
                            key={filter.id}
                            className="submenu-item"
                            onClick={() => handleLoadMyFilter(filter.id)}
                          >
                            {filter.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 다운로드 */}
          <button
            className="action-button action-button-primary"
            onClick={onDownload}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "8px" }}
            >
              <rect
                x="3"
                y="2"
                width="10"
                height="8"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M8 10V14M8 14L5.5 11.5M8 14L10.5 11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {lang === "ko" ? "다운로드" : "Download"}
          </button>

          {/* 계정 연동 */}
          <button
            className="action-button action-button-primary"
            onClick={handleAccountLink}
          >
            {lang === "ko" ? "계정 연동" : "Account Link"}
          </button>

          {/* 복사하기 */}
          <button
            className="action-button action-button-secondary"
            onClick={onCopy}
          >
            {lang === "ko" ? "복사하기" : "Copy"}
          </button>
        </div>

        <div className="action-buttons-right">
          {/* 시세 기본값으로 저장 (관리자 기능) */}
          {showSaveAsLeagueDefault && leagueOptions.length > 0 && (
            <div className="action-button-wrapper">
              <button
                className="action-button action-button-admin-league"
                onClick={() => {
                  setShowLoadDropdown(false);
                  setShowSaveDefaultDropdown(false);
                  setShowSaveLeagueDefaultDropdown(!showSaveLeagueDefaultDropdown);
                }}
              >
                {lang === "ko" ? "시세 기본값으로 저장" : "Save as League Default"}
                <span className="dropdown-icon">▼</span>
              </button>
              {showSaveLeagueDefaultDropdown && (
                <div className="action-dropdown">
                  {leagueOptions.map((league) => (
                    <button
                      key={league.id}
                      className="dropdown-item"
                      onClick={() => handleSaveAsLeagueDefault(league.id)}
                    >
                      {league.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 기본값으로 저장 */}
          {showSaveAsDefaultDropdown && (
            <div className="action-button-wrapper">
              <button
                className="action-button action-button-admin"
                onClick={() => {
                  setShowLoadDropdown(false);
                  setShowSaveDefaultDropdown(!showSaveDefaultDropdown);
                }}
              >
                {lang === "ko" ? "기본값으로 저장" : "Save as Default"}
                <span className="dropdown-icon">▼</span>
              </button>
              {showSaveDefaultDropdown && (
                <div className="action-dropdown">
                  {presetsData.presets.map((preset) => (
                    <button
                      key={preset.id}
                      className="dropdown-item"
                      onClick={() => handleSaveAsDefault(preset.id)}
                    >
                      {preset.nameKo || preset.name}
                    </button>
                  ))}
                  <button
                    className="dropdown-item"
                    onClick={handleSaveAsMyFilter}
                  >
                    {lang === "ko" ? "내 필터로 저장" : "Save as My Filter"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 초기화 */}
          {showReset && (
            <div className="action-button-wrapper">
              <button
                className="action-button action-button-reset-admin"
                onClick={() => {
                  setShowLoadDropdown(false);
                  setShowSaveDefaultDropdown(false);
                  setShowSaveLeagueDefaultDropdown(false);
                  setShowResetDropdown(!showResetDropdown);
                }}
              >
                {lang === "ko" ? "초기화" : "Reset"}
                <span className="dropdown-icon">▼</span>
              </button>
              {showResetDropdown && (
                <div className="action-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={handleResetAll}
                  >
                    {lang === "ko" ? "전체 초기화" : "Reset All"}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={handleResetPage}
                  >
                    {lang === "ko" ? "이 페이지만" : "This Page Only"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .quick-filters-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin-top: 12px;
          background: transparent;
          border: none;
          gap: 12px;
        }

        .action-buttons-left,
        .action-buttons-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-button-wrapper {
          position: relative;
        }

        .action-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 8px;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          min-width: 200px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .dropdown-item {
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item-with-submenu {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .submenu-arrow {
          font-size: 10px;
          color: var(--muted);
        }

        .action-submenu {
          position: absolute;
          left: 100%;
          top: 0;
          margin-left: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          min-width: 180px;
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }

        .submenu-item {
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .submenu-item:last-child {
          border-bottom: none;
        }

        .submenu-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .action-button-admin-league {
          border: 2px solid #ff4757 !important;
          color: #ff4757 !important;
          background: transparent !important;
          font-weight: 600;
        }

        .action-button-admin-league:hover {
          background: rgba(255, 71, 87, 0.1) !important;
        }

        .action-button-reset-admin {
          border: 2px solid #ff4757 !important;
          color: #ff4757 !important;
          background: transparent !important;
          font-weight: 600;
        }

        .action-button-reset-admin:hover {
          background: rgba(255, 71, 87, 0.1) !important;
        }

      `}</style>
      <NotificationModal
        isOpen={successModalOpen}
        onClose={handleCloseSuccess}
        type="success"
        message={successMessage}
        autoCloseDelay={7000}
        lang={lang}
      />
      <NotificationModal
        isOpen={confirmModalOpen}
        onClose={handleCancelReset}
        type="confirm"
        message={
          confirmType === "all"
            ? lang === "ko"
              ? "정말 전체를 초기화 하시겠습니까?"
              : "Are you sure you want to reset all settings?"
            : lang === "ko"
            ? "정말 이 페이지를 초기화 하시겠습니까?"
            : "Are you sure you want to reset this page?"
        }
        confirmText={lang === "ko" ? "확인" : "Confirm"}
        cancelText={lang === "ko" ? "취소" : "Cancel"}
        onConfirm={handleConfirmReset}
        showCancel={true}
        lang={lang}
      />
    </>
  );
}
