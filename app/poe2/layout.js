export const metadata = {
  title: "Path of Exile 2 아이템 필터 생성기 | REIM",
  description: "PoE2 최고의 아이템 필터 생성 도구. 커스텀 필터를 쉽게 만들고, 티어 리스트를 관리하며, 커뮤니티와 공유하세요. 초보자부터 전문가까지 모두를 위한 완벽한 필터 솔루션.",
  keywords: "poe2, path of exile 2, 아이템 필터, 필터 생성기, item filter, loot filter, 티어 리스트, 화폐 필터, 장비 필터, 모드 필터",
  openGraph: {
    title: "PoE2 아이템 필터 생성기 | REIM",
    description: "Path of Exile 2 최고의 아이템 필터 생성 도구",
    url: "https://reim.kr/poe2",
    siteName: "REIM",
    images: [
      {
        url: "/images/main_image.png",
        width: 1200,
        height: 630,
        alt: "REIM PoE2 필터 생성기",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PoE2 아이템 필터 생성기 | REIM",
    description: "Path of Exile 2 최고의 아이템 필터 생성 도구",
    images: ["/images/main_image.png"],
  },
};

export default function Poe2Layout({ children }) {
  return <>{children}</>;
}
