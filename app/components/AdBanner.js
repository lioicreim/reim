"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    try {
      // AdSense 스크립트 로드 확인 및 광고 푸시
      if (typeof window !== "undefined" && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`ad-banner-wrapper ${className}`}>
      <ins
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
