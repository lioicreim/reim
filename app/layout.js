import Header from "./components/Header";
import GameNav from "./components/GameNav";
import GameBanner from "./components/GameBanner";
import GameSubNav from "./components/GameSubNav";
import ItemFilterNav from "./components/ItemFilterNav";
import GameThemeProvider from "./components/GameThemeProvider";
import "./globals.css";

export const metadata = {
  title: "REIM - 게임 포털",
  description: "게임 정보와 공략을 제공하는 포털 사이트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <GameThemeProvider />
        <div className="layout-wrapper">
          {/* 좌측 애드센스 */}
          <aside className="ad-sidebar ad-left">
            <div className="ad-placeholder">
              <div className="ad-label">광고</div>
              <div className="ad-content">300x600</div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <div className="main-content">
            <Header />
            <GameNav />
            <GameBanner />
            <GameSubNav />
            <ItemFilterNav />
            <div className="page-content-wrapper">
              {children}
            </div>
          </div>

          {/* 우측 애드센스 */}
          <aside className="ad-sidebar ad-right">
            <div className="ad-placeholder">
              <div className="ad-label">광고</div>
              <div className="ad-content">300x600</div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
