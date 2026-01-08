"use client";

import { useState, useEffect } from "react";
import presetsData from "@/data/presets.json";

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
}) {
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showSaveDefaultDropdown, setShowSaveDefaultDropdown] = useState(false);
  const [showResetDropdown, setShowResetDropdown] = useState(false);
  const [hoveredMyFilter, setHoveredMyFilter] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'all' or 'page'
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
        showResetDropdown &&
        !e.target.closest(".action-button-wrapper")
      ) {
        setShowResetDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLoadDropdown, showSaveDefaultDropdown, showResetDropdown]);

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
      alert(
        lang === "ko"
          ? "계정 연동 기능은 준비 중입니다."
          : "Account link feature coming soon."
      );
    }
  };

  const handleSaveAsDefault = (presetId) => {
    if (onSaveAsDefault) {
      onSaveAsDefault(presetId);
      setShowSaveDefaultDropdown(false);
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
    setShowConfirmDialog(true);
  };

  const handleResetPage = () => {
    setShowResetDropdown(false);
    setConfirmType("page");
    setShowConfirmDialog(true);
  };

  const handleConfirmReset = () => {
    setShowConfirmDialog(false);
    if (confirmType === "all" && onResetAll) {
      onResetAll((message) => {
        setSuccessMessage(message);
        setShowSuccessDialog(true);
      });
    } else if (confirmType === "page" && onResetPage) {
      onResetPage((message) => {
        setSuccessMessage(message);
        setShowSuccessDialog(true);
      });
    } else if (onReset) {
      // 기존 onReset 호환성 유지
      onReset();
    }
    setConfirmType(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    setSuccessMessage("");
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
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
                className="action-button action-button-reset"
                onClick={() => {
                  setShowLoadDropdown(false);
                  setShowSaveDefaultDropdown(false);
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

        .confirm-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .confirm-dialog {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 24px;
          min-width: 400px;
          max-width: 500px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .confirm-dialog-message {
          font-size: 16px;
          color: var(--text);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .confirm-dialog-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .confirm-dialog-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--border);
        }

        .confirm-dialog-button-cancel {
          background: var(--panel2);
          color: var(--text);
        }

        .confirm-dialog-button-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .confirm-dialog-button-confirm {
          background: transparent;
          color: #ff4757;
          border-color: #ff4757;
        }

        .confirm-dialog-button-confirm:hover {
          background: rgba(255, 71, 87, 0.1);
        }

        .success-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .success-dialog {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 24px;
          min-width: 400px;
          max-width: 500px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .success-dialog-message {
          font-size: 16px;
          color: var(--text);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .success-dialog-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #ff4757;
          background: transparent;
          color: #ff4757;
          width: 100%;
        }

        .success-dialog-button:hover {
          background: rgba(255, 71, 87, 0.1);
        }
      `}</style>
      {showSuccessDialog && (
        <div className="success-dialog-overlay" onClick={handleCloseSuccess}>
          <div className="success-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="success-dialog-message">
              {successMessage}
            </div>
            <button
              className="success-dialog-button"
              onClick={handleCloseSuccess}
            >
              {lang === "ko" ? "확인" : "OK"}
            </button>
          </div>
        </div>
      )}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay" onClick={handleCancelReset}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-message">
              {confirmType === "all"
                ? lang === "ko"
                  ? "정말 전체를 초기화 하시겠습니까?"
                  : "Are you sure you want to reset all settings?"
                : lang === "ko"
                ? "정말 이 페이지를 초기화 하시겠습니까?"
                : "Are you sure you want to reset this page?"}
            </div>
            <div className="confirm-dialog-buttons">
              <button
                className="confirm-dialog-button confirm-dialog-button-cancel"
                onClick={handleCancelReset}
              >
                {lang === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                className="confirm-dialog-button confirm-dialog-button-confirm"
                onClick={handleConfirmReset}
              >
                {lang === "ko" ? "확인" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
