
import React, { useState } from 'react';
import itemDefinitions from '@/data/item-definitions-ko.json';

// Note: itemDefinitions might be partial if the script is still running during dev.
// In production, this file should be fully populated.

export default function ItemTooltip({ itemName, children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const itemData = itemDefinitions[itemName];

  // tooltipHtml이 없는 아이템(예: 일부 금고실 열쇠)은
  // hover 시 빈 툴팁 컨테이너만 떠서 라인/깨짐처럼 보일 수 있으므로
  // 툴팁 기능을 비활성화하고 children만 렌더링합니다.
  if (!itemData || !itemData.tooltipHtml) {
    return <>{children}</>;
  }

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const updatePosition = (e) => {
    // Simple positioning near cursor
    // Adjust offsets as needed
    setPosition({ 
        x: e.clientX + 15, 
        y: e.clientY + 15 
    });
  };

  // Tooltip Portal or Fixed Position
  // For simplicity, we render fixed relative to window here. 
  // In a real app, might want to use a Portal to avoid z-index issues or overflow.
  
  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      {/* Trigger */}
      {children}

      {/* Tooltip */}
      {showTooltip && (
        <div 
            className="poe-tooltip-container"
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 9999,
                pointerEvents: 'none', // Allow clicking through if needed, though usually tooltips block nothing
                // Styles matching poe2db dark theme will come from the HTML content classes
                // But we might need global CSS for .newItemPopup, .content, .Stats etc.
                // Assuming we copy those styles or they are standard.
            }}
        >
            <div 
                className="newItemPopup"
                dangerouslySetInnerHTML={{ __html: itemData.tooltipHtml }} 
            />
        </div>
      )}
    </div>
  );
}
