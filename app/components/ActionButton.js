"use client";

/**
 * 액션 버튼 컴포넌트
 * 빠른 설정, 티어리스트, 프리뷰 등에서 사용하는 통일된 버튼 스타일
 * 
 * @param {Object} props
 * @param {string} props.variant - 버튼 스타일 ("primary", "secondary", "admin")
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {React.ReactNode} props.children - 버튼 내용
 * @param {boolean} props.hasDropdown - 드롭다운 아이콘 표시 여부
 * @param {boolean} props.showDropdown - 드롭다운 열림 여부
 */
export default function ActionButton({
  variant = "secondary",
  onClick,
  children,
  hasDropdown = false,
  showDropdown = false,
  className = "",
  ...props
}) {
  const baseClass = "action-button";
  const variantClass = `action-button-${variant}`;
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      {hasDropdown && (
        <span className="dropdown-icon">{showDropdown ? "▲" : "▼"}</span>
      )}
    </button>
  );
}
