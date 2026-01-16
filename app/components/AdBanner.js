"use client";

import { useEffect, useRef } from "react";

/**
 * Google AdSense 광고 배너 컴포넌트
 * 
 * @param {string} adSlot - AdSense 광고 슬롯 ID
 * @param {string} adFormat - 광고 형식 (auto, rectangle, vertical, horizontal)
 * @param {string} adStyle - 광고 스타일 (인라인 스타일 객체를 JSON 문자열로)
 * @param {boolean} fullWidthResponsive - 전체 너비 반응형 여부
 */
export default function AdBanner({
  adSlot = "1234567890", // 기본값 (나중에 실제 슬롯 ID로 교체)
  adFormat = "auto",
  adStyle = { display: "block" },
  fullWidthResponsive = true,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    let observer = null;
    let rafId = null;
    let retryTimer = null;
    let attempts = 0;

    const isReady = () => {
      if (!wrapperRef.current || !insRef.current) return false;
      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;
      if (width <= 0 || height <= 0) return false;
      return true;
    };

    const alreadyRendered = () => {
      if (!insRef.current) return false;
      return Boolean(insRef.current.getAttribute("data-adsbygoogle-status"));
    };

    const tryPush = () => {
      if (pushedRef.current || alreadyRendered()) {
        pushedRef.current = true;
        return;
      }
      if (!isReady()) return;
      if (typeof window === "undefined" || !window.adsbygoogle) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (error) {
        console.error("AdSense error:", error);
      }
    };

    try {
      // 레이아웃 폭 확보 후 광고 푸시
      rafId = window.requestAnimationFrame(() => {
        tryPush();
      });

      observer = new ResizeObserver(() => {
        tryPush();
      });

      if (wrapperRef.current) {
        observer.observe(wrapperRef.current);
      }

      const handleResize = () => {
        tryPush();
      };

      window.addEventListener("resize", handleResize);

      retryTimer = window.setInterval(() => {
        attempts += 1;
        tryPush();

        if (pushedRef.current || attempts >= 10) {
          window.clearInterval(retryTimer);
        }
      }, 1000);

      return () => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        if (observer) {
          observer.disconnect();
        }
        if (retryTimer) {
          window.clearInterval(retryTimer);
        }
        window.removeEventListener("resize", handleResize);
      };
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div ref={wrapperRef} className={`ad-banner-wrapper ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-6650201170584917"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

/**
 * 사전 정의된 광고 크기 컴포넌트들
 */

// 상단 배너 (Leaderboard)
export function AdLeaderboard({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="horizontal"
      adStyle={{ display: "block", width: "100%", height: "90px" }}
      className={`ad-leaderboard ${className}`}
      fullWidthResponsive={false}
    />
  );
}

// 사이드바 광고 (Rectangle)
export function AdRectangle({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="rectangle"
      adStyle={{ display: "block", width: "300px", height: "250px" }}
      className={`ad-rectangle ${className}`}
      fullWidthResponsive={false}
    />
  );
}

// 세로형 광고 (Skyscraper)
export function AdSkyscraper({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="vertical"
      adStyle={{ display: "block", width: "300px", height: "600px" }}
      className={`ad-skyscraper ${className}`}
      fullWidthResponsive={false}
    />
  );
}

// 본문 내 광고 (In-article)
export function AdInArticle({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="fluid"
      adStyle={{ display: "block", textAlign: "center" }}
      className={`ad-in-article ${className}`}
      fullWidthResponsive={true}
    />
  );
}

// 반응형 광고 (모든 크기 자동 조절)
export function AdResponsive({ adSlot, className = "" }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="auto"
      adStyle={{ display: "block" }}
      className={`ad-responsive ${className}`}
      fullWidthResponsive={true}
    />
  );
}
