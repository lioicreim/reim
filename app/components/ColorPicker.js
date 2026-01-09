"use client";

import { useState, useRef, useEffect } from "react";

/**
 * 컬러 피커 컴포넌트
 * 원형 컬러 아이콘 클릭 시 팝업으로 색상 선택
 */
export default function ColorPicker({ 
  color, 
  onChange, 
  label = "",
  showCheckbox = false,
  checked = false,
  onCheckboxChange = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color || { r: 0, g: 0, b: 0, a: 255 });
  const [hexValue, setHexValue] = useState("");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [alpha, setAlpha] = useState(255);
  const [valueFormat, setValueFormat] = useState("hex"); // "hex", "rgba", "hsla"
  const pickerRef = useRef(null);
  const gradientRef = useRef(null);

  // S~D 티어에서 사용한 컬러 팔레트 (10개, 5개씩 2줄)
  const tierColors = [
    { r: 0, g: 0, b: 0, a: 255, name: "Black" },
    { r: 255, g: 255, b: 255, a: 255, name: "White" },
    { r: 255, g: 0, b: 0, a: 255, name: "Red (S)" },
    { r: 204, g: 90, b: 138, a: 255, name: "A Gear BG" },
    { r: 240, g: 35, b: 120, a: 255, name: "A Currency BG" },
    { r: 205, g: 82, b: 80, a: 255, name: "B Gear BG" },
    { r: 240, g: 90, b: 35, a: 255, name: "B Currency BG" },
    { r: 255, g: 165, b: 0, a: 255, name: "C Gear BG" },
    { r: 249, g: 150, b: 25, a: 255, name: "C Currency BG" },
    { r: 210, g: 178, b: 135, a: 255, name: "Default Text" }, // 인게임 기본값
  ];

  // RGB를 HSL로 변환
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // 현재 포맷에 맞는 값 반환
  const getFormattedValue = () => {
    if (valueFormat === "rgba") {
      return `rgba(${localColor.r}, ${localColor.g}, ${localColor.b}, ${((localColor.a || 255) / 255).toFixed(2)})`;
    } else if (valueFormat === "hsla") {
      const hsl = rgbToHsl(localColor.r, localColor.g, localColor.b);
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${((localColor.a || 255) / 255).toFixed(2)})`;
    } else {
      return hexValue;
    }
  };

  // 포맷 토글
  const toggleValueFormat = () => {
    if (valueFormat === "hex") {
      setValueFormat("rgba");
    } else if (valueFormat === "rgba") {
      setValueFormat("hsla");
    } else {
      setValueFormat("hex");
    }
  };

  useEffect(() => {
    if (color) {
      setLocalColor(color);
      setHexValue(rgbToHex(color.r, color.g, color.b));
      const hsv = rgbToHsv(color.r, color.g, color.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
      setAlpha(color.a || 255);
    }
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round(max * 100);
    return { h, s, v };
  };

  const hsvToRgb = (h, s, v) => {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return { r, g, b };
  };

  // HSL을 RGB로 변환
  const hslToRgb = (h, s, l) => {
    h /= 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const handleHexChange = (e) => {
    const value = e.target.value;
    
    if (valueFormat === "hex") {
      setHexValue(value);
      const rgb = hexToRgb(value);
      if (rgb) {
        const newColor = { ...localColor, ...rgb };
        setLocalColor(newColor);
        onChange(newColor);
      }
    } else if (valueFormat === "rgba") {
      // rgba(255, 255, 255, 1.0) 형식 파싱
      const match = value.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? Math.round(parseFloat(match[4]) * 255) : 255;
        const newColor = { r, g, b, a };
        setLocalColor(newColor);
        setHexValue(rgbToHex(r, g, b));
        onChange(newColor);
      }
    } else if (valueFormat === "hsla") {
      // hsla(360, 100%, 50%, 1.0) 형식 파싱
      const match = value.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/i);
      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        const a = match[4] ? Math.round(parseFloat(match[4]) * 255) : 255;
        const rgb = hslToRgb(h, s, l);
        const newColor = { ...rgb, a };
        setLocalColor(newColor);
        setHexValue(rgbToHex(rgb.r, rgb.g, rgb.b));
        onChange(newColor);
      }
    }
  };

  const handleGradientMouseDown = (e) => {
    if (!gradientRef.current) return;
    e.preventDefault();
    const rect = gradientRef.current.getBoundingClientRect();
    let rafId = null;
    
    const updateGradient = (clientX, clientY) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        const s = Math.round((x / rect.width) * 100);
        const v = Math.round(100 - (y / rect.height) * 100);
        setSaturation(s);
        setBrightness(v);
        updateColorFromHsv(hue, s, v, alpha);
      });
    };
    
    updateGradient(e.clientX, e.clientY);
    
    const handleMouseMove = (e) => {
      updateGradient(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleHueMouseDown = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    let rafId = null;
    
    const updateHue = (clientX) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const h = Math.round((x / rect.width) * 360);
        setHue(h);
        updateColorFromHsv(h, saturation, brightness, alpha);
      });
    };
    
    updateHue(e.clientX);
    
    const handleMouseMove = (e) => {
      updateHue(e.clientX);
    };
    
    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  const updateColorFromHsv = (h, s, v, a) => {
    const rgb = hsvToRgb(h, s, v);
    const newColor = { ...rgb, a };
    setLocalColor(newColor);
    setHexValue(rgbToHex(rgb.r, rgb.g, rgb.b));
    onChange(newColor);
  };

  const handleColorPickerChange = (e) => {
    const hex = e.target.value;
    setHexValue(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      const newColor = { ...localColor, ...rgb };
      setLocalColor(newColor);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
      onChange(newColor);
    }
  };

  const handleSwatchClick = (swatchColor) => {
    setLocalColor(swatchColor);
    setHexValue(rgbToHex(swatchColor.r, swatchColor.g, swatchColor.b));
    const hsv = rgbToHsv(swatchColor.r, swatchColor.g, swatchColor.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    setAlpha(swatchColor.a || 255);
    onChange(swatchColor);
    // 팝업창은 닫지 않음
  };

  const currentHex = rgbToHex(localColor.r || 0, localColor.g || 0, localColor.b || 0);
  const currentColorRgba = checked 
    ? `rgba(${localColor.r || 0}, ${localColor.g || 0}, ${localColor.b || 0}, ${(localColor.a || 255) / 255})`
    : `rgba(0, 0, 0, 1)`;
  
  const hueColor = hsvToRgb(hue, 100, 100);
  const hueColorHex = rgbToHex(hueColor.r, hueColor.g, hueColor.b);
  const gradientStyle = {
    background: `linear-gradient(to right, #fff, ${hueColorHex}), linear-gradient(to bottom, transparent, #000)`,
  };

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <div className="color-picker-trigger">
        {showCheckbox && (
          <div
            className={`color-checkbox-custom ${checked ? "color-checkbox-checked" : ""}`}
            style={{
              backgroundColor: checked ? "var(--poe2-primary, var(--game-primary))" : "transparent",
              borderColor: checked ? "var(--poe2-primary, var(--game-primary))" : "var(--border)",
            }}
            onClick={() => {
              if (onCheckboxChange) {
                const newChecked = !checked;
                onCheckboxChange(newChecked);
                if (newChecked) {
                  // 체크 시 기본 색상 설정
                  const defaultColor = label === "텍스트" || label === "Text"
                    ? { r: 210, g: 178, b: 135, a: 255 }
                    : label === "배경" || label === "BG"
                    ? { r: 0, g: 0, b: 0, a: 255 }
                    : { r: 0, g: 0, b: 0, a: 255 };
                  onChange(defaultColor);
                }
              }
            }}
          ></div>
        )}
        {label && <span className="color-label">{label}</span>}
        <div
          className="color-swatch"
          style={{ backgroundColor: checked ? currentColorRgba : "rgba(0, 0, 0, 1)" }}
          onClick={() => {
            if (checked) {
              setIsOpen(!isOpen);
            } else if (showCheckbox && onCheckboxChange) {
              // 체크되지 않은 상태에서 원형 클릭 시 체크
              onCheckboxChange(true);
              const defaultColor = label === "텍스트" || label === "Text"
                ? { r: 210, g: 178, b: 135, a: 255 }
                : label === "배경" || label === "BG"
                ? { r: 0, g: 0, b: 0, a: 255 }
                : { r: 0, g: 0, b: 0, a: 255 };
              onChange(defaultColor);
            }
          }}
        ></div>
      </div>

      {isOpen && (
        <div className="color-picker-popup">
          <div className="color-picker-main">
            {/* 메인 그라데이션 컬러 선택 영역 */}
            <div 
              className="color-picker-gradient"
              ref={gradientRef}
              style={gradientStyle}
              onMouseDown={handleGradientMouseDown}
            >
              <div
                className="color-picker-selector"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                }}
              ></div>
            </div>

            {/* 색조 슬라이더 */}
            <div className="color-picker-sliders">
              <div className="color-slider-container">
                <div
                  className="color-slider hue-slider"
                  onMouseDown={handleHueMouseDown}
                >
                  <div
                    className="color-slider-handle"
                    style={{ left: `${(hue / 360) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* Hex 입력 및 현재 컬러 표시 */}
            <div className="color-picker-hex">
              <div
                className="color-picker-current-swatch"
                style={{ backgroundColor: currentColorRgba }}
              ></div>
              <input
                type="text"
                className="color-hex-input"
                value={getFormattedValue()}
                onChange={handleHexChange}
                placeholder={valueFormat === "hex" ? "#000000" : valueFormat === "rgba" ? "rgba(0, 0, 0, 1.00)" : "hsla(0, 0%, 0%, 1.00)"}
              />
              <button
                type="button"
                className="color-format-toggle"
                onClick={toggleValueFormat}
                title="포맷 변경 (HEX ↔ RGBA ↔ HSLA)"
              >
                <span className="arrow-up">▲</span>
                <span className="arrow-down">▼</span>
              </button>
            </div>

            {/* 티어 컬러 팔레트 (5개씩 2줄, 10개) */}
            <div className="color-picker-swatches-wrapper">
              <div className="color-picker-swatches">
                {tierColors.map((swatch, index) => {
                  const swatchRgba = `rgba(${swatch.r}, ${swatch.g}, ${swatch.b}, ${(swatch.a || 255) / 255})`;
                  return (
                    <div
                      key={index}
                      className="color-swatch-item"
                      style={{ backgroundColor: swatchRgba }}
                      onClick={() => handleSwatchClick(swatch)}
                      title={swatch.name}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .color-picker-container {
          position: relative;
          display: inline-block;
        }

        .color-picker-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .color-checkbox-custom {
          width: 18px;
          height: 18px;
          border: 1px solid var(--border);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
          position: relative;
          border-radius: 0;
        }

        .color-checkbox-custom:hover {
          border-color: var(--game-primary);
        }

        /* 체크된 상태일 때 체크 표시 */
        .color-checkbox-custom.color-checkbox-checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffffff;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }

        .color-label {
          font-size: 13px;
          color: var(--text);
          white-space: nowrap;
        }

        .color-swatch {
          width: 22px;
          height: 22px;
          border-radius: 2px;
          border: 1px solid rgba(210, 178, 135, 1);
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s, border-color 0.2s;
          box-sizing: border-box;
        }

        .color-swatch:hover {
          transform: scale(1.1);
          border-color: var(--game-primary);
        }

        .color-picker-popup {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 1000;
          background: #000000;
          border: 1px solid rgba(210, 178, 135, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          padding: 12px;
          width: 280px;
          box-sizing: border-box;
        }

        .color-picker-current-swatch {
          border: 1px solid rgba(210, 178, 135, 1);
        }

        .color-picker-main {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          will-change: transform;
        }

        .color-picker-area {
          display: flex;
          justify-content: flex-start;
          width: 100%;
        }

        .color-picker-gradient {
          width: 100%;
          height: 200px;
          border: 1px solid var(--border);
          cursor: crosshair;
          position: relative;
          background-blend-mode: multiply;
          user-select: none;
          -webkit-user-select: none;
        }

        .color-picker-selector {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 2px solid #fff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }

        .color-picker-sliders {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .color-slider-container {
          position: relative;
          height: 20px;
        }

        .color-slider {
          width: 100%;
          height: 20px;
          border: 1px solid var(--border);
          cursor: pointer;
          position: relative;
          border-radius: 2px;
          user-select: none;
          -webkit-user-select: none;
        }

        .hue-slider {
          background: linear-gradient(to right,
            #ff0000, #ff7f00, #ffff00, #00ff00,
            #00ffff, #0000ff, #7f00ff, #ff00ff, #ff0000
          );
        }

        .color-slider-handle {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 2px solid var(--border);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
        }

        .color-picker-hex {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .color-picker-current-swatch {
          width: 32px;
          height: 32px;
          border-radius: 2px;
          border: 1px solid rgba(210, 178, 135, 1);
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .color-hex-input {
          padding: 8px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13px;
          text-transform: none;
          flex: 1;
          text-align: center;
          outline: none;
          font-family: var(--font-mono);
        }

        .color-hex-input:focus {
          border-color: var(--game-primary);
        }

        .color-format-toggle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--game-primary);
          color: var(--game-primary);
          cursor: pointer;
          padding: 2px 6px;
          width: 24px;
          height: 32px;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .color-format-toggle:hover {
          background: var(--poe2-primary-hover, var(--game-primary-hover));
        }

        .color-format-toggle .arrow-up,
        .color-format-toggle .arrow-down {
          font-size: 8px;
          line-height: 1;
          color: var(--game-primary);
        }

        .color-format-toggle .arrow-up {
          margin-bottom: 2px;
        }

        .color-picker-swatches-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-top: 8px;
          position: relative;
        }

        .color-picker-swatches-wrapper::before {
          content: '';
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, #634928 25%, #634928 75%, transparent 100%);
          margin-bottom: 8px;
        }

        .color-picker-swatches {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          width: auto;
        }

        .color-swatch-item {
          width: 22px;
          height: 22px;
          border-radius: 2px;
          border: 1px solid rgba(210, 178, 135, 1);
          cursor: pointer;
          transition: transform 0.2s;
          box-sizing: border-box;
        }

        .color-swatch-item:hover {
          transform: scale(1.1);
          border-color: var(--game-primary);
        }
      `}</style>
    </div>
  );
}
