"use client";

import { useState, useEffect, useMemo } from "react";
import modifiersData from "@/data/modifiers.json";
import modsTiersData from "@/data/mods-tiers.json";
import ModDetailModal from "@/app/components/ModDetailModal";
import ModEditModal from "@/app/components/ModEditModal";

export default function ModifiersPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState("One Handed Sword");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMod, setSelectedMod] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lang, setLang] = useState("ko");

  // 언어 설정 불러오기
  useEffect(() => {
    const savedLang = localStorage.getItem("poe2_lang") || "ko";
    setLang(savedLang);
  }, []);

  // 현재 선택된 서브카테고리의 데이터
  const currentCategoryData = useMemo(() => {
    return modifiersData.modifiers[selectedSubCategory] || { prefixes: [], suffixes: [] };
  }, [selectedSubCategory]);

  const filteredPrefixes = useMemo(() => {
    return currentCategoryData.prefixes.filter(m => 
      !searchQuery || 
      m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.nameKo.includes(searchQuery)
    );
  }, [currentCategoryData, searchQuery]);

  const filteredSuffixes = useMemo(() => {
    return currentCategoryData.suffixes.filter(m => 
      !searchQuery || 
      m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.nameKo.includes(searchQuery)
    );
  }, [currentCategoryData, searchQuery]);

  const handleModClick = (mod) => {
    // mods-tiers.json에서 상세 정보(티어 등) 가져오기
    const detailedMod = modsTiersData.groups[mod.id] || {
      ...mod,
      type: currentCategoryData.prefixes.includes(mod) ? "prefix" : "suffix",
      tiers: []
    };
    setSelectedMod(detailedMod);
    setIsModalOpen(true);
  };

  return (
    <div className="modifiers-container" style={{ minHeight: "100vh", background: "#0a0a0a", color: "#eee" }}>
      
      <div className="modifiers-content" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        <div className="filter-section" style={{ display: "flex", gap: "20px", marginBottom: "30px", background: "#151515", padding: "20px", borderRadius: "8px", border: "1px solid #222", alignItems: "flex-end" }}>
          <div className="filter-group" style={{ flex: "0 0 300px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
              {lang === "ko" ? "아이템 종류" : "Item Category"}
            </label>
            <select 
              value={selectedSubCategory} 
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              style={{
                width: "100%",
                background: "#252525",
                border: "1px solid #333",
                color: "#fff",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {modifiersData.categories.map(cat => (
                <optgroup key={cat.id} label={lang === "ko" ? cat.name : cat.id}>
                  {cat.items.map(item => (
                    <option key={item.id} value={item.id}>{lang === "ko" ? item.name : item.id}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
              {lang === "ko" ? "모드 검색" : "Search Modifiers"}
            </label>
            <input 
              type="text" 
              placeholder={lang === "ko" ? "이름 또는 효과 검색..." : "Search by name or effect..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#252525",
                border: "1px solid #333",
                color: "#fff",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div className="filter-group" style={{ flex: "0 0 100px" }}>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              style={{
                width: "100%",
                background: "#333",
                border: "1px solid #444",
                color: "#fff",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#444"}
              onMouseOut={(e) => e.target.style.background = "#333"}
            >
              {lang === "ko" ? "편집" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mods-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <section className="mods-column">
            <h2 style={{ fontSize: "18px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", color: "#4299e1" }}>
              <span style={{ padding: "2px 6px", background: "rgba(66,153,225,0.1)", border: "1px solid rgba(66,153,225,0.3)", borderRadius: "2px", fontSize: "12px" }}>
                {lang === "ko" ? "접두어" : "PREFIX"}
              </span>
              {lang === "ko" ? "접두어 목록" : "Prefixes"}
            </h2>
            <div className="mods-list" style={{ background: "#111", border: "1px solid #222", borderRadius: "8px" }}>
              {filteredPrefixes.length > 0 ? filteredPrefixes.map(mod => (
                <div 
                  key={mod.id} 
                  className="mod-card" 
                  onClick={() => handleModClick(mod)}
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #1a1a1a",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#fff", marginBottom: "4px" }}>
                    {lang === "ko" ? mod.nameKo : mod.nameEn}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {mod.tags?.map(tag => (
                      <span key={tag} className={`mod-tag tag-${tag}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )) : (
                <div style={{ padding: "30px", textAlign: "center", color: "#555" }}>
                  {lang === "ko" ? "검색 결과가 없습니다." : "No prefixes found."}
                </div>
              )}
            </div>
          </section>

          <section className="mods-column">
            <h2 style={{ fontSize: "18px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", color: "#9f7aea" }}>
              <span style={{ padding: "2px 6px", background: "rgba(159,122,234,0.1)", border: "1px solid rgba(159,122,234,0.3)", borderRadius: "2px", fontSize: "12px" }}>
                {lang === "ko" ? "접미어" : "SUFFIX"}
              </span>
              {lang === "ko" ? "접미어 목록" : "Suffixes"}
            </h2>
            <div className="mods-list" style={{ background: "#111", border: "1px solid #222", borderRadius: "8px" }}>
              {filteredSuffixes.length > 0 ? filteredSuffixes.map(mod => (
                <div 
                  key={mod.id} 
                  className="mod-card" 
                  onClick={() => handleModClick(mod)}
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #1a1a1a",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#fff", marginBottom: "4px" }}>
                    {lang === "ko" ? mod.nameKo : mod.nameEn}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {mod.tags?.map(tag => (
                      <span key={tag} className={`mod-tag tag-${tag}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )) : (
                <div style={{ padding: "30px", textAlign: "center", color: "#555" }}>
                  {lang === "ko" ? "검색 결과가 없습니다." : "No suffixes found."}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ModDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mod={selectedMod}
        lang={lang}
      />

      <ModEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lang={lang}
      />

      <style jsx>{`
        .mod-card:hover {
          background: #1a1a1a;
        }
        .mod-card:last-child {
          border-bottom: none;
        }
        select option {
          background: #1a1a1a;
          color: #eee;
        }
        .mod-tag { font-size: 10px; padding: 1px 6px; border-radius: 2px; }
        .tag-피해 { color: #ff4d4d; background: rgba(255, 77, 77, 0.15); border: 1px solid rgba(255, 77, 77, 0.2); }
        .tag-물리 { color: #d4af37; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.2); }
        .tag-공격 { color: #82ccdd; background: rgba(130, 204, 221, 0.15); border: 1px solid rgba(130, 204, 221, 0.2); }
        .tag-원소 { color: #60a3bc; background: rgba(96, 163, 188, 0.15); border: 1px solid rgba(96, 163, 188, 0.2); }
        .tag-냉기 { color: #70a1ff; background: rgba(112, 161, 255, 0.15); border: 1px solid rgba(112, 161, 255, 0.2); }
        .tag-화염 { color: #e67e22; background: rgba(230, 126, 34, 0.15); border: 1px solid rgba(230, 126, 34, 0.2); }
        .tag-번개 { color: #f1c40f; background: rgba(241, 196, 15, 0.15); border: 1px solid rgba(241, 196, 15, 0.2); }
        .tag-카오스 { color: #9b59b6; background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.2); }
        .tag-속도 { color: #2ecc71; background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.2); }
        .tag-생명력 { color: #e74c3c; background: rgba(231, 76, 60, 0.15); border: 1px solid rgba(231, 76, 60, 0.2); }
        .tag-마나 { color: #3498db; background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.2); }
        .tag-에너지보호막 { color: #ecf0f1; background: rgba(236, 240, 241, 0.15); border: 1px solid rgba(236, 240, 241, 0.2); }
        .tag-능력치 { color: #bdc3c7; background: rgba(189, 195, 199, 0.15); border: 1px solid rgba(189, 195, 199, 0.2); }
        .tag-크리티컬 { color: #e67e22; background: rgba(230, 126, 34, 0.15); border: 1px solid rgba(230, 126, 34, 0.2); }
      `}</style>
    </div>
  );
}
