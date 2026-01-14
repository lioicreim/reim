"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-wrapper">
        <div className="footer-left">
          <p className="footer-copyright">Copyright © Reim All rights reserved.</p>
        </div>
        
        <div className="footer-center">
          <p className="footer-slogan">reim.kr은 대한민국 아재 게이머들을 응원합니다</p>
          <a href="mailto:riozio@naver.com" className="footer-email">riozio@naver.com</a>
        </div>
        
        <div className="footer-right">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
