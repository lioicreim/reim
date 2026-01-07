"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Poe2SubNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "intro", name: "POE 입문", path: "/poe2/intro" },
    { id: "leveling", name: "레벨링", path: "/poe2/leveling" },
    { id: "guides", name: "공략", path: "/poe2/guides" },
    { id: "community", name: "커뮤니티", path: "/poe2/community" },
    { id: "item-filter", name: "아이템 필터", path: "/poe2/item-filter" },
    { id: "library", name: "자료실", path: "/poe2/library" },
  ];

  return (
    <nav className="poe2-sub-nav">
      <div className="poe2-sub-nav-container">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`poe2-sub-nav-item ${
              pathname?.startsWith(tab.path) ? "active" : ""
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
