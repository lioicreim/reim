import Header from "./components/Header";
import GameNav from "./components/GameNav";
import GameBanner from "./components/GameBanner";
import GameSubNav from "./components/GameSubNav";
import ItemFilterNav from "./components/ItemFilterNav";
import GameThemeProvider from "./components/GameThemeProvider";
import Footer from "./components/Footer";
import { AdSkyscraper } from "./components/AdBanner";
import GoogleAnalytics from "./components/GoogleAnalytics";
import "./globals.css";

export const metadata = {
  title: "REIM - 게임을 더 쉽고 스마트하게",
  description: "복잡한 게임 설정과 관리를 한곳에서 해결하세요. 당신의 승리를 돕는 든든한 게임 조력자, REIM입니다.",
  openGraph: {
    title: "REIM - 게임을 더 쉽고 스마트하게",
    description: "복잡한 게임 설정과 관리를 한곳에서 해결하세요. 당신의 승리를 돕는 든든한 게임 조력자, REIM입니다.",
    url: "https://reim.kr",
    siteName: "REIM",
    images: [
      {
        url: "/images/main_image.png",
        width: 1200,
        height: 630,
        alt: "REIM 메인 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REIM - 게임을 더 쉽고 스마트하게",
    description: "복잡한 게임 설정과 관리를 한곳에서 해결하세요. 당신의 승리를 돕는 든든한 게임 조력자, REIM입니다.",
    images: ["/images/main_image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* ✅ Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6650201170584917"
          crossOrigin="anonymous"
        />
      </head>
      
      {/* Google Analytics 4 - 환경 변수에 측정 ID 설정 필요 */}
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />

      <body>
        <GameThemeProvider />
        <div className="layout-wrapper">
          {/* 좌측 광고 */}
          <aside className="ad-sidebar ad-left">
            <AdSkyscraper adSlot="1234567890" />
          </aside>

          {/* 메인 */}
          <div className="main-content">
            <Header />
            <GameNav />
            <GameBanner />
            <GameSubNav />
            <ItemFilterNav />

            <div className="page-content-wrapper">{children}</div>

            <Footer />
          </div>

          {/* 우측 광고 */}
          <aside className="ad-sidebar ad-right">
            <AdSkyscraper adSlot="0987654321" />
          </aside>
        </div>
      </body>
    </html>
  );
}
