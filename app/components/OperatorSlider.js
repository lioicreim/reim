"use client";

import { useState, useEffect, useRef } from "react";

/**
 * 연산자 기반 슬라이더 컴포넌트
 * 연산자(>=, <=, >, <, ==)에 따라 값에 해당하는 부분을 메인 컬러로 채움
 * 
 * @param {Object} props
 * @param {number} props.value - 현재 값
 * @param {Function} props.onChange - 값 변경 콜백
 * @param {string} props.operator - 연산자 (">=", "<=", ">", "<", "==")
 * @param {number} props.min - 최소값
 * @param {number} props.max - 최대값
 * @param {number} props.step - 단계값
 * @param {string} props.label - 라벨 (선택)
 */
export default function OperatorSlider({
  value = 0,
  onChange,
  operator = ">=",
  min = 0,
  max = 100,
  step = 1,
  label = ""
}) {
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setLocalValue(clampedValue);
    if (onChange) {
      onChange(clampedValue);
    }
  };

  // 연산자에 따른 활성 영역 계산 (0~100% 범위)
  const getActiveRange = () => {
    if (max === min) return { start: 0, end: 0 };
    
    const percentage = ((localValue - min) / (max - min)) * 100;
    
    switch (operator) {
      case ">=":
        // 값 이상: 값부터 최대값까지
        return {
          start: percentage,
          end: 100
        };
      case ">":
        // 값 초과: 값 다음부터 최대값까지 (약간 오른쪽으로)
        const nextValue = Math.min(max, localValue + step);
        const nextPercentage = ((nextValue - min) / (max - min)) * 100;
        return {
          start: nextPercentage,
          end: 100
        };
      case "<=":
        // 값 이하: 최소값부터 값까지
        return {
          start: 0,
          end: percentage
        };
      case "<":
        // 값 미만: 최소값부터 값 이전까지 (약간 왼쪽으로)
        const prevValue = Math.max(min, localValue - step);
        const prevPercentage = ((prevValue - min) / (max - min)) * 100;
        return {
          start: 0,
          end: prevPercentage
        };
      case "==":
        // 값과 같음: 값 위치만 (작은 영역)
        const range = (max - min) * 0.02; // 2% 범위
        const rangePercentage = (range / (max - min)) * 100;
        return {
          start: Math.max(0, percentage - rangePercentage / 2),
          end: Math.min(100, percentage + rangePercentage / 2)
        };
      default:
        return { start: 0, end: 0 };
    }
  };

  const activeRange = getActiveRange();
  const gamePrimary = typeof window !== "undefined" 
    ? getComputedStyle(document.documentElement).getPropertyValue("--poe2-primary")?.trim() ||
      getComputedStyle(document.documentElement).getPropertyValue("--game-primary")?.trim() ||
      "#155dfc"
    : "#155dfc";

  return (
    <div className="operator-slider-container">
      {label && <span className="operator-slider-label">{label}</span>}
      <div className="operator-slider-wrapper">
        <div className="operator-slider-track" ref={trackRef}>
          {/* 활성 영역 (메인 컬러로 채움) */}
          <div
            className="operator-slider-active"
            style={{
              left: `${activeRange.start}%`,
              width: `${activeRange.end - activeRange.start}%`,
              backgroundColor: gamePrimary,
            }}
          />
          {/* 슬라이더 핸들 */}
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            className="operator-slider-input"
          />
        </div>
        {/* 값 표시 */}
        <div className="operator-slider-value">
          {localValue}
        </div>
      </div>

      <style jsx>{`
        .operator-slider-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .operator-slider-label {
          font-size: 12px;
          color: var(--text);
          font-weight: 500;
        }

        .operator-slider-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .operator-slider-track {
          position: relative;
          flex: 1;
          height: 6px;
          /* 전역 CSS의 input[type="range"] 트랙과 동일한 스타일 */
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          /* thumb가 보이도록 overflow: visible로 변경 */
          overflow: visible;
          transition: all 0.2s;
        }

        .operator-slider-track:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .operator-slider-active {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 6px;
          transform: translateY(-50%);
          border-radius: 2px;
          transition: all 0.2s;
          opacity: 0.6;
          /* thumb 뒤에 위치하도록 z-index 설정 */
          z-index: 1;
        }

        .operator-slider-input {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          width: 100%;
          height: 6px;
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          /* thumb가 활성 영역 위에 보이도록 z-index를 높게 설정 */
          z-index: 10;
          /* 전역 CSS의 input[type="range"] 스타일 상속 */
          transition: all 0.2s;
          transform: translateY(-50%);
        }

        /* 전역 CSS의 input[type="range"]::-webkit-slider-thumb와 동일한 스타일 */
        .operator-slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 6px;
          height: 16px;
          background: var(--game-primary);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
          /* thumb가 확실히 보이도록 position과 z-index 설정 */
          position: relative;
          z-index: 20;
        }

        .operator-slider-input::-webkit-slider-thumb:hover {
          background: var(--game-primary-border);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        /* 전역 CSS의 input[type="range"]::-moz-range-thumb와 동일한 스타일 */
        .operator-slider-input::-moz-range-thumb {
          width: 6px;
          height: 16px;
          background: var(--game-primary);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        .operator-slider-input::-moz-range-thumb:hover {
          background: var(--game-primary-border);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .operator-slider-input::-moz-range-track {
          background: transparent;
          border: none;
          height: 6px;
        }

        .operator-slider-value {
          min-width: 60px;
          padding: 4px 8px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          text-align: center;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
