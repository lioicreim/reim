"use client";

import Script from "next/script";

/**
 * Google Analytics 4 컴포넌트
 * 
 * 사용법:
 * 1. Google Analytics에서 측정 ID 생성 (G-XXXXXXXXXX 형식)
 * 2. measurementId props에 전달
 * 
 * @param {string} measurementId - GA4 측정 ID (예: "G-XXXXXXXXXX")
 */
export default function GoogleAnalytics({ measurementId }) {
  // 측정 ID가 없거나 개발 환경이면 아무것도 렌더링하지 않음
  if (!measurementId || process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * 사용자 정의 이벤트 추적 함수
 * 
 * 사용 예시:
 * trackEvent('filter_generated', { filter_type: 'currency' });
 * trackEvent('filter_downloaded', { preset: 'beginner' });
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * 페이지뷰 추적 함수
 * 
 * 사용 예시:
 * trackPageView('/poe2/item-filter/currency');
 */
export function trackPageView(url) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}
