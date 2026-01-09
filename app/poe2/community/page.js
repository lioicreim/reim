"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CommunityPage() {
  const pathname = usePathname();
  const [lang, setLang] = useState("ko");
  const [activeTab, setActiveTab] = useState("all"); // "all", "notice"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("title-content"); // "title", "content", "title-content", "author"

  // 게임 ID 추출 (경로에서)
  const gameId = pathname?.split("/")[1] || "poe2";

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ko";
    setLang(savedLang);

    const handleLangChange = () => {
      const currentLang = localStorage.getItem("lang") || "ko";
      setLang(currentLang);
    };

    window.addEventListener("storage", handleLangChange);
    window.addEventListener("langchange", handleLangChange);

    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("langchange", handleLangChange);
    };
  }, []);

  // 말머리 카테고리
  const categories = [
    { id: "all", name: "전체", nameEn: "All", icon: null },
    { id: "general", name: "일반", nameEn: "General", icon: null },
    { id: "question", name: "질문", nameEn: "Question", icon: "?" },
    { id: "info", name: "정보", nameEn: "Info", icon: "⭐" },
    { id: "ssf", name: "SSF", nameEn: "SSF", icon: null },
    { id: "build", name: "빌드", nameEn: "Build", icon: "✓" },
    { id: "brag", name: "자랑", nameEn: "Brag", icon: "👤" },
  ];

  // 임시 게시글 데이터 (나중에 실제 데이터로 교체)
  const mockPosts = [
    {
      id: 317832,
      category: "general",
      title: "수첩수 시작부 살리면서 빌드업해봤는데 평가좀",
      author: "ㅇㅇ",
      authorIp: "58.238",
      date: new Date(),
      views: 15,
      likes: 0,
      comments: 0,
      isPinned: false,
      isBest: false,
    },
    {
      id: 317831,
      category: "general",
      title: "펍건 ㅁㅊ새기 벌써 절반가까이 만들었노",
      author: "ㅇㅇ",
      authorIp: "59.13",
      date: new Date(Date.now() - 60000),
      views: 29,
      likes: 0,
      comments: 0,
      isPinned: false,
      isBest: false,
    },
    {
      id: 317830,
      category: "general",
      title: "골대골 성공했는데 애매하네",
      author: "ㅇㅇ",
      authorIp: null,
      date: new Date(Date.now() - 120000),
      views: 46,
      likes: 0,
      comments: 0,
      isPinned: false,
      isBest: false,
    },
    {
      id: 317829,
      category: "brag",
      title: "비싼거 팔렸냐?",
      author: "ㅇㅇ",
      authorIp: "211.187",
      date: new Date(Date.now() - 180000),
      views: 107,
      likes: 0,
      comments: 2,
      isPinned: false,
      isBest: false,
    },
    {
      id: 317828,
      category: "brag",
      title: "통과의례 늑대 먹었따",
      author: "ㅁㄴ",
      authorIp: "27.124",
      date: new Date(Date.now() - 240000),
      views: 206,
      likes: 0,
      comments: 6,
      isPinned: false,
      isBest: false,
    },
    {
      id: 317827,
      category: "question",
      title: "행님들 ㅅㅂ 사원 이거 수비실 터질수도있는거임??",
      author: "ㅇㅇ",
      authorIp: null,
      date: new Date(Date.now() - 300000),
      views: 100,
      likes: 0,
      comments: 3,
      isPinned: false,
      isBest: false,
    },
    {
      id: 275608,
      category: "info",
      title: "가이드",
      author: "ㅇㅇ",
      authorIp: null,
      date: new Date("2025-10-22"),
      views: 15193,
      likes: 9,
      comments: 5,
      isPinned: true,
      isBest: false,
    },
  ];

  // 날짜 포맷팅
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    } else if (days < 365) {
      const year = date.getFullYear().toString().slice(2);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    } else {
      const year = date.getFullYear().toString().slice(2);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    }
  };

  // 필터링된 게시글
  const filteredPosts = mockPosts.filter((post) => {
    // 탭 필터
    if (activeTab === "notice" && !post.isPinned) return false;

    // 카테고리 필터
    if (selectedCategory !== "all" && post.category !== selectedCategory) return false;

    // 검색 필터 (나중에 구현)
    if (searchQuery) {
      // 검색 로직 추가 예정
    }

    return true;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  return (
    <main className="container">
      <div className="community-page">
        {/* 상단 탭 */}
        <div className="community-tabs">
          <div className="tabs-left">
            <button
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {lang === "ko" ? "전체글" : "All Posts"}
            </button>
            <button
              className={`tab-button ${activeTab === "notice" ? "active" : ""}`}
              onClick={() => setActiveTab("notice")}
            >
              {lang === "ko" ? "공지" : "Notice"}
            </button>
          </div>

          {/* 말머리 필터 - 중앙 배치 */}
          <div className="category-filters-center">
            <div className="category-filters">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-filter ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon && <span className="category-icon">{cat.icon}</span>}
                  <span>{lang === "ko" ? cat.name : cat.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 우측 컨트롤 */}
          <div className="community-controls">
            <select
              className="posts-per-page"
              value={postsPerPage}
              onChange={(e) => {
                setPostsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={20}>20개</option>
              <option value={50}>50개</option>
              <option value={100}>100개</option>
            </select>
            <Link 
              href={`/${gameId}/community/write`} 
              className="tab-button write-button"
              style={{
                backgroundColor: 'var(--poe2-primary, var(--game-primary))',
                borderColor: 'var(--poe2-primary, var(--game-primary))',
                color: 'var(--poe2-secondary, #ffffff)',
                textDecoration: 'none',
                margin: '0',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '4px',
                display: 'inline-block',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
            >
              {lang === "ko" ? "글쓰기" : "Write"}
            </Link>
          </div>
        </div>

        {/* 게시글 테이블 */}
        <div className="posts-table">
          <table>
            <thead>
              <tr>
                <th className="col-number">{lang === "ko" ? "번호" : "No."}</th>
                <th className="col-category">{lang === "ko" ? "말머리" : "Category"}</th>
                <th className="col-title">{lang === "ko" ? "제목" : "Title"}</th>
                <th className="col-author">{lang === "ko" ? "글쓴이" : "Author"}</th>
                <th className="col-date">{lang === "ko" ? "작성일" : "Date"}</th>
                <th className="col-views">{lang === "ko" ? "조회" : "Views"}</th>
                <th className="col-likes">{lang === "ko" ? "추천" : "Likes"}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.map((post) => {
                const category = categories.find((c) => c.id === post.category);
                return (
                  <tr key={post.id} className={post.isPinned ? "pinned" : ""}>
                    <td>{post.isPinned ? "-" : post.id}</td>
                    <td>
                      {post.isPinned && <span className="pin-icon">📌</span>}
                      {category && (
                        <span className="category-badge">
                          {category.icon && <span className="category-icon-small">{category.icon}</span>}
                          {lang === "ko" ? category.name : category.nameEn}
                        </span>
                      )}
                    </td>
                    <td className="title-cell">
                      <Link href={`/${gameId}/community/${post.id}`} className="post-title-link">
                        {post.comments > 0 && (
                          <span className="comment-count">[{post.comments}]</span>
                        )}
                        {post.title}
                      </Link>
                    </td>
                    <td>
                      <span className="author-name">{post.author}</span>
                      {post.authorIp && (
                        <span className="author-ip">({post.authorIp})</span>
                      )}
                    </td>
                    <td>{formatDate(post.date)}</td>
                    <td>{post.views.toLocaleString()}</td>
                    <td>{post.likes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 하단 탭 및 검색 */}
        <div className="bottom-section">
          <div className="bottom-tabs">
            <button
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {lang === "ko" ? "전체글" : "All Posts"}
            </button>
            <button
              className={`tab-button ${activeTab === "notice" ? "active" : ""}`}
              onClick={() => setActiveTab("notice")}
            >
              {lang === "ko" ? "공지" : "Notice"}
            </button>
          </div>

          {/* 검색 - 중앙 배치 */}
          <div className="search-section">
            <select
              className="search-type"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="title-content">{lang === "ko" ? "제목+내용" : "Title+Content"}</option>
              <option value="title">{lang === "ko" ? "제목" : "Title"}</option>
              <option value="content">{lang === "ko" ? "내용" : "Content"}</option>
              <option value="author">{lang === "ko" ? "글쓴이" : "Author"}</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder={lang === "ko" ? "검색어를 입력하세요" : "Enter search term"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </div>

          <Link 
            href={`/${gameId}/community/write`} 
            className="tab-button write-button"
            style={{
              backgroundColor: 'var(--poe2-primary, var(--game-primary))',
              borderColor: 'var(--poe2-primary, var(--game-primary))',
              color: 'var(--poe2-secondary, #ffffff)',
              textDecoration: 'none',
              margin: '0',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '4px',
              display: 'inline-block',
              boxSizing: 'border-box',
              lineHeight: '1.5'
            }}
          >
            {lang === "ko" ? "글쓰기" : "Write"}
          </Link>
        </div>

        {/* 페이지네이션 */}
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          {Array.from({ length: Math.min(15, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-number ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
          <button
            className="page-button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            ▶|
          </button>
          <button className="page-jump-button">
            {lang === "ko" ? "페이지 이동" : "Go to Page"} →
          </button>
        </div>
      </div>

      <style jsx>{`
        .community-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .community-tabs {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
        }

        .tabs-left {
          display: flex;
          gap: 8px;
        }

        .tab-button {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--poe2-primary, var(--game-primary));
          color: var(--poe2-primary, var(--game-primary));
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
          text-decoration: none;
          display: inline-block;
          box-sizing: border-box;
          margin: 0;
          line-height: 1.5;
        }

        button.tab-button {
          margin: 0;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--poe2-primary, var(--game-primary));
          color: var(--poe2-primary, var(--game-primary));
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
          text-decoration: none;
          display: inline-block;
          box-sizing: border-box;
          line-height: 1.5;
        }

        .tab-button:hover {
          background: var(--poe2-primary-hover, var(--game-primary-hover));
        }

        button.tab-button:hover {
          background: var(--poe2-primary-hover, var(--game-primary-hover));
        }

        .tab-button.active {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
        }

        button.tab-button.active {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
          margin: 0;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
          display: inline-block;
          box-sizing: border-box;
          line-height: 1.5;
        }

        a.tab-button {
          text-decoration: none !important;
          border: 1px solid var(--poe2-primary, var(--game-primary)) !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          border-radius: 4px !important;
          display: inline-block !important;
          box-sizing: border-box !important;
        }

        a.tab-button.active {
          background: var(--poe2-primary, var(--game-primary)) !important;
          border-color: var(--poe2-primary, var(--game-primary)) !important;
          color: var(--poe2-secondary, #ffffff) !important;
        }

        a.tab-button:not(.active) {
          background: transparent !important;
          color: var(--poe2-primary, var(--game-primary)) !important;
        }

        a.tab-button:hover {
          opacity: 0.9 !important;
        }

        /* 글쓰기 버튼 - 전체글 버튼(button.tab-button.active)과 완전히 동일한 스타일 */
        .write-button,
        a.write-button,
        a.tab-button.write-button,
        .tab-button.write-button,
        .community-controls a.tab-button.write-button,
        .bottom-section a.tab-button.write-button {
          margin: 0 !important;
          padding: 8px 16px !important;
          background: var(--poe2-primary, var(--game-primary)) !important;
          background-color: var(--poe2-primary, var(--game-primary)) !important;
          border: 1px solid var(--poe2-primary, var(--game-primary)) !important;
          border-color: var(--poe2-primary, var(--game-primary)) !important;
          color: var(--poe2-secondary, #ffffff) !important;
          text-decoration: none !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          border-radius: 4px !important;
          display: inline-block !important;
          box-sizing: border-box !important;
          line-height: 1.5 !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          vertical-align: baseline !important;
          text-align: center !important;
          outline: none !important;
        }

        .write-button:hover,
        a.write-button:hover,
        a.tab-button.write-button:hover,
        .tab-button.write-button:hover,
        .community-controls a.tab-button.write-button:hover,
        .bottom-section a.tab-button.write-button:hover {
          background: var(--poe2-primary, var(--game-primary)) !important;
          background-color: var(--poe2-primary, var(--game-primary)) !important;
          opacity: 0.9 !important;
        }

        .write-button:visited,
        a.write-button:visited,
        a.tab-button.write-button:visited,
        .community-controls a.tab-button.write-button:visited,
        .bottom-section a.tab-button.write-button:visited {
          background: var(--poe2-primary, var(--game-primary)) !important;
          background-color: var(--poe2-primary, var(--game-primary)) !important;
          color: var(--poe2-secondary, #ffffff) !important;
        }

        .write-button:link,
        a.write-button:link,
        a.tab-button.write-button:link,
        .community-controls a.tab-button.write-button:link,
        .bottom-section a.tab-button.write-button:link {
          background: var(--poe2-primary, var(--game-primary)) !important;
          background-color: var(--poe2-primary, var(--game-primary)) !important;
          color: var(--poe2-secondary, #ffffff) !important;
        }

        .category-filters-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .category-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-filter {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .category-filter:hover {
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-primary, var(--game-primary));
        }

        .category-filter.active {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
        }

        .category-icon {
          font-size: 12px;
        }

        .community-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .posts-per-page {
          padding: 6px 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
        }


        .posts-table {
          background: var(--panel);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .posts-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .posts-table thead {
          background: var(--panel2);
          border-bottom: 2px solid var(--border);
        }

        .posts-table th {
          padding: 12px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .posts-table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        .posts-table tbody tr:hover {
          background: var(--panel2);
        }

        .posts-table tbody tr.pinned {
          background: var(--poe2-primary-light, var(--game-primary-hover));
        }

        .col-number {
          width: 80px;
        }

        .col-category {
          width: 100px;
        }

        .col-title {
          min-width: 300px;
        }

        .col-author {
          width: 120px;
        }

        .col-date {
          width: 100px;
        }

        .col-views {
          width: 80px;
        }

        .col-likes {
          width: 80px;
        }

        .posts-table tbody td {
          text-align: center;
        }

        .posts-table tbody td:first-child {
          font-size: 12px;
        }

        .posts-table tbody .title-cell {
          text-align: left !important;
        }

        .posts-table tbody td:nth-child(5) {
          font-size: 12px;
        }

        .pin-icon {
          margin-right: 4px;
        }

        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .category-icon-small {
          font-size: 10px;
        }

        .post-title-link {
          color: var(--text);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .post-title-link:hover {
          color: var(--poe2-primary, var(--game-primary));
        }

        .comment-count {
          color: var(--poe2-primary, var(--game-primary));
          font-weight: 600;
        }

        .author-name {
          color: var(--text);
        }

        .author-ip {
          color: var(--muted);
          font-size: 12px;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 24px;
        }

        .page-button,
        .page-number {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-button:hover:not(:disabled),
        .page-number:hover {
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-primary, var(--game-primary));
        }

        .page-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-number.active {
          background: var(--poe2-primary, var(--game-primary));
          border-color: var(--poe2-primary, var(--game-primary));
          color: var(--poe2-secondary, #ffffff);
          font-weight: 600;
        }

        .page-jump-button {
          padding: 6px 12px;
          background: var(--panel2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          margin-left: 12px;
        }

        .bottom-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          position: relative;
        }

        .bottom-tabs {
          display: flex;
          gap: 8px;
        }

        .search-section {
          display: flex;
          gap: 8px;
          align-items: center;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .search-type {
          padding: 8px 12px;
          background: var(--poe2-primary, var(--game-primary));
          border: none;
          color: var(--poe2-secondary, #ffffff);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .search-input {
          width: 300px;
          padding: 8px 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
        }

        .search-input:focus {
          outline: 1px solid var(--poe2-primary, var(--game-primary));
          outline-offset: -1px;
        }

        .search-button {
          padding: 8px 16px;
          background: var(--poe2-primary, var(--game-primary));
          border: none;
          color: var(--poe2-secondary, #ffffff);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-icon {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .community-tabs {
            flex-direction: column;
            align-items: stretch;
          }

          .category-filters {
            margin-left: 0;
            width: 100%;
          }

          .community-controls {
            margin-left: 0;
            width: 100%;
            justify-content: space-between;
          }

          .posts-table {
            overflow-x: auto;
          }

          .posts-table table {
            min-width: 800px;
          }
        }
      `}</style>
    </main>
  );
}
