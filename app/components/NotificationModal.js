"use client";

import { useEffect } from "react";

/**
 * 재사용 가능한 알림 모달 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 콜백
 * @param {string} props.type - 모달 타입: "success", "confirm", "info", "warning", "error"
 * @param {string} props.title - 모달 제목
 * @param {string|ReactNode} props.message - 메인 메시지
 * @param {string|ReactNode} props.description - 설명 텍스트 (선택)
 * @param {string} props.confirmText - 확인 버튼 텍스트 (기본: "확인")
 * @param {string} props.cancelText - 취소 버튼 텍스트 (기본: "취소")
 * @param {Function} props.onConfirm - 확인 버튼 클릭 콜백 (confirm 타입일 때만)
 * @param {boolean} props.showCancel - 취소 버튼 표시 여부 (기본: confirm 타입일 때만 true)
 * @param {number} props.autoCloseDelay - 자동 닫기 시간(ms), 0이면 자동 닫기 안 함 (기본: success일 때 3000)
 * @param {string} props.lang - 언어 설정 (기본: "ko")
 */
export default function NotificationModal({
  isOpen = false,
  onClose,
  type = "info",
  title = "",
  message = "",
  description = "",
  confirmText = "",
  cancelText = "",
  onConfirm = null,
  showCancel = null,
  autoCloseDelay = null,
  lang = "ko",
}) {
  // 기본값 설정
  const defaultConfirmText = lang === "ko" ? "확인" : "OK";
  const defaultCancelText = lang === "ko" ? "취소" : "Cancel";
  
  const finalConfirmText = confirmText || defaultConfirmText;
  const finalCancelText = cancelText || defaultCancelText;
  const finalShowCancel = showCancel !== null ? showCancel : (type === "confirm");
  // 자동 닫기 시간 최소 7초로 설정
  let calculatedDelay = autoCloseDelay !== null 
    ? autoCloseDelay 
    : (type === "success" ? 7000 : 0);
  const finalAutoCloseDelay = calculatedDelay > 0 && calculatedDelay < 7000 
    ? 7000 
    : calculatedDelay;

  // 자동 닫기
  useEffect(() => {
    if (isOpen && finalAutoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, finalAutoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, finalAutoCloseDelay, onClose]);

  if (!isOpen) return null;

  // 아이콘 SVG
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        );
      case "confirm":
      case "warning":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        );
      case "error":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        );
      default: // info
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  // 아이콘 색상
  const getIconColor = () => {
    switch (type) {
      case "success":
        return "var(--poe2-primary, var(--game-primary))";
      case "confirm":
      case "warning":
        return "#ffa500";
      case "error":
        return "#ff4757";
      default:
        return "var(--poe2-primary, var(--game-primary))";
    }
  };

  // 확인 버튼 색상
  const getConfirmButtonStyle = () => {
    switch (type) {
      case "error":
        return {
          background: "#ff4757",
          borderColor: "#ff4757",
        };
      case "success":
        return {
          background: "var(--poe2-primary, var(--game-primary))",
          borderColor: "var(--poe2-primary, var(--game-primary))",
        };
      default:
        return {
          background: "var(--poe2-primary, var(--game-primary))",
          borderColor: "var(--poe2-primary, var(--game-primary))",
        };
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="notification-modal-overlay"
        onClick={onClose}
      >
        <div 
          className="notification-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notification-modal-header">
            {title ? (
              <h3 className="notification-modal-title">
                {title}
              </h3>
            ) : (
              <div></div>
            )}
            <button
              className="notification-modal-close"
              onClick={onClose}
              aria-label={lang === "ko" ? "닫기" : "Close"}
            >
              ×
            </button>
          </div>
          <div className="notification-modal-content">
            <div 
              className="notification-modal-icon"
              style={{ color: getIconColor() }}
            >
              {getIcon()}
            </div>
            <div className="notification-modal-message">
              {message}
            </div>
            {description && (
              <p className="notification-modal-description">
                {description}
              </p>
            )}
          </div>
          <div className="notification-modal-actions">
            {finalShowCancel && (
              <button
                className="notification-modal-button notification-modal-button-cancel"
                onClick={onClose}
              >
                {finalCancelText}
              </button>
            )}
            <button
              className="notification-modal-button notification-modal-button-confirm"
              onClick={handleConfirm}
              style={getConfirmButtonStyle()}
            >
              {finalConfirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notification-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .notification-modal {
          position: relative;
          background: #0f0f0f;
          border: 1px solid var(--border, #333);
          border-radius: 0;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
          overflow: hidden;
          z-index: 1;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .notification-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 24px;
          border-bottom: 1px solid var(--border, #333);
          background: rgba(255, 255, 255, 0.02);
        }

        .notification-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text, #fff);
        }

        .notification-modal-close {
          background: none;
          border: none;
          color: var(--muted, #999);
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
          margin-left: auto;
        }

        .notification-modal-close:hover {
          color: var(--text, #fff);
        }

        .notification-modal-content {
          padding: 32px 24px;
          text-align: center;
        }

        .notification-modal-icon {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .notification-modal-icon svg {
          width: 48px;
          height: 48px;
        }

        .notification-modal-message {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text, #fff);
          margin: 0 0 16px 0;
        }

        .notification-modal-message :global(strong) {
          color: var(--poe2-primary, var(--game-primary));
          font-weight: 600;
        }

        .notification-modal-description {
          font-size: 14px;
          line-height: 1.5;
          color: var(--muted, #999);
          margin: 0;
        }

        .notification-modal-actions {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border, #333);
          background: rgba(255, 255, 255, 0.02);
        }

        .notification-modal-button {
          flex: 1;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 0;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          color: #fff;
        }

        .notification-modal-button-cancel {
          background: transparent;
          border-color: var(--border, #333);
          color: var(--text, #fff);
        }

        .notification-modal-button-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--muted, #999);
        }

        .notification-modal-button-confirm {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
        }

        .notification-modal-button-confirm:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}
