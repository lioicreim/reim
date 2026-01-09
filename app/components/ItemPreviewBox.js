"use client";

/**
 * 아이템 미리보기 박스 컴포넌트
 * 빠른 설정, 커스텀 룰 등에서 아이템 스타일을 미리 볼 수 있게 해주는 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.itemName - 아이템 이름 (예: "Gold", "Incense Relic")
 * @param {Object} props.styles - 스타일 설정
 * @param {number} props.styles.fontSize - 폰트 크기
 * @param {Object} props.styles.textColor - 텍스트 색상 {r, g, b, a}
 * @param {Object} props.styles.backgroundColor - 배경 색상 {r, g, b, a}
 * @param {Object} props.styles.borderColor - 테두리 색상 {r, g, b, a}
 * @param {string} props.styles.playEffect - 효과 (Yellow, White, Red, Orange)
 * @param {string} props.backgroundImage - 배경 이미지 경로 (기본값: "/preview-ground.jpg")
 */
export default function ItemPreviewBox({ 
  itemName = "Item", 
  styles = {},
  backgroundImage = "/preview-ground.jpg"
}) {
  // 인게임 기본값
  const DEFAULT_TEXT_COLOR = { r: 210, g: 178, b: 135, a: 255 };
  const DEFAULT_BACKGROUND_COLOR = { r: 0, g: 0, b: 0, a: 255 };
  // 테두리는 기본값이 없음 (표시 안됨)

  const {
    fontSize = 30,
    textColor: textColorRaw,
    backgroundColor: backgroundColorRaw,
    borderColor = null, // 기본값 없음
    playEffect = null,
  } = styles;

  // null이나 undefined일 때 기본값 사용
  const textColor = textColorRaw || DEFAULT_TEXT_COLOR;
  const backgroundColor = backgroundColorRaw || DEFAULT_BACKGROUND_COLOR;

  // 인게임 폰트 크기를 프리뷰 크기로 변환 (인게임 45 = 프리뷰 약 24px 정도로 조정)
  // 인게임 폰트 크기와 웹 프리뷰 크기의 비율을 조정
  // 최소 폰트 크기를 14px로 보장하여 30일 때도 보이도록 함
  const previewFontSize = Math.max(14, fontSize * 0.53); // 인게임 45 → 프리뷰 약 24px, 최소 14px


  return (
    <div className="item-preview-box">
      <div 
        className="preview-ground"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(to bottom, rgba(26, 26, 26, 0.3), rgba(10, 10, 10, 0.3)), url(${backgroundImage})`
            : "linear-gradient(to bottom, #1a1a1a, #0a0a0a)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: backgroundImage ? "overlay" : "normal",
        }}
      >
        <div
          className="preview-label"
          style={{
            fontSize: `${previewFontSize}px`,
            color: `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${(textColor.a || 255) / 255})`,
            backgroundColor: backgroundColor
              ? `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${(backgroundColor.a || 255) / 255})`
              : `rgba(${DEFAULT_BACKGROUND_COLOR.r}, ${DEFAULT_BACKGROUND_COLOR.g}, ${DEFAULT_BACKGROUND_COLOR.b}, ${DEFAULT_BACKGROUND_COLOR.a / 255})`,
            borderColor: borderColor
              ? `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${(borderColor.a || 255) / 255})`
              : "transparent",
            borderWidth: borderColor ? "1px" : "0px",
            borderStyle: borderColor ? "solid" : "none",
          }}
        >
          {itemName}
        </div>
      </div>

      <style jsx>{`
        .item-preview-box {
          width: 100%;
        }

        .preview-ground {
          position: relative;
          height: 140px;
          border-radius: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 20px;
          overflow: hidden;
        }

        .preview-label {
          position: relative;
          z-index: 1;
          padding: 10px 16px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          outline: none;
          min-height: 40px;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
