"use client";

import { useState, useEffect } from "react";
import modifiersData from "@/data/modifiers.json";

/**
 * 모드 편집 및 추가를 위한 모달 컨포넌트
 */
export default function ModEditModal({
  isOpen = false,
  onClose,
  lang = "ko",
}) {
  const [activeTab, setActiveTab] = useState("edit"); // edit, categories
  
  // 폼 상태
  const [formData, setFormData] = useState({
    mainCategory: "weapons",
    isNewMainCategory: false,
    newMainCategory: "",
    subCategory: "One Handed Sword",
    isNewSubCategory: false,
    newSubCategory: "",
    modName: "",
    isNewMod: false,
    newModName: "",
    tier: "1",
    tierNameKo: "", 
    tierNameEn: "", 
    tags: [], 
    minLevel: 1,
    description: "",
    weight: 100
  });

  // 신규 추가된 항목들 임시 보관 (세션 동안 유지)
  const [customMainCategories, setCustomMainCategories] = useState([]); // [{id, name}]
  const [customSubCategories, setCustomSubCategories] = useState({}); // { mainCatId: [{id, name}] }
  const [customMods, setCustomMods] = useState({}); // { subCatId: [{id, nameKo, nameEn}] }

  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState("#d4af37");

  if (!isOpen) return null;

  const mainCategories = [
    ...(modifiersData.categories || []),
    ...customMainCategories
  ];
  
  // 합쳐진 2차 카테고리 목록 (기본 + 커스텀)
  const currentSubCategories = [
    ...(mainCategories.find(c => c.id === formData.mainCategory)?.items || []),
    ...(customSubCategories[formData.mainCategory] || [])
  ];
  
  // 합쳐진 모드 목록 (기본 + 커스텀)
  const existingMods = [
    ...(modifiersData.modifiers[formData.subCategory]?.prefixes || []),
    ...(modifiersData.modifiers[formData.subCategory]?.suffixes || []),
    ...(customMods[formData.subCategory] || [])
  ];

  // 신규 1차 카테고리 적용
  const handleApplyNewMainCategory = () => {
    if (!formData.newMainCategory.trim()) return;
    
    const newId = formData.newMainCategory.trim();
    const newItem = { id: newId, name: newId, items: [] };
    
    setCustomMainCategories(prev => [...prev, newItem]);
    
    setFormData(prev => ({
      ...prev,
      mainCategory: newId,
      isNewMainCategory: false,
      newMainCategory: ""
    }));
  };

  // 신규 2차 카테고리 적용
  const handleApplyNewSubCategory = () => {
    if (!formData.newSubCategory.trim()) return;
    
    const newId = formData.newSubCategory.trim();
    const newItem = { id: newId, name: newId };
    
    setCustomSubCategories(prev => ({
      ...prev,
      [formData.mainCategory]: [...(prev[formData.mainCategory] || []), newItem]
    }));
    
    setFormData(prev => ({
      ...prev,
      subCategory: newId,
      isNewSubCategory: false,
      newSubCategory: ""
    }));
  };

  // 신규 모드 이름 적용
  const handleApplyNewMod = () => {
    if (!formData.newModName.trim()) return;
    
    const newName = formData.newModName.trim();
    const newMod = { id: `custom_${Date.now()}`, nameKo: newName, nameEn: newName };
    
    setCustomMods(prev => ({
      ...prev,
      [formData.subCategory]: [...(prev[formData.subCategory] || []), newMod]
    }));
    
    setFormData(prev => ({
      ...prev,
      modName: newMod.id,
      isNewMod: false,
      newModName: ""
    }));
  };

  // 커스텀 항목 삭제
  const handleRemoveCustomItem = (type, mainId, subId, itemId) => {
    if (type === "maincategory") {
      setCustomMainCategories(prev => prev.filter(cat => cat.id !== itemId));
      if (formData.mainCategory === itemId) {
        setFormData(prev => ({ ...prev, mainCategory: modifiersData.categories[0]?.id || "" }));
      }
    } else if (type === "subcategory") {
      setCustomSubCategories(prev => ({
        ...prev,
        [mainId]: prev[mainId].filter(item => item.id !== itemId)
      }));
      if (formData.subCategory === itemId) {
        setFormData(prev => ({ ...prev, subCategory: mainCategories.find(c => c.id === mainId)?.items[0]?.id || "" }));
      }
    } else {
      setCustomMods(prev => ({
        ...prev,
        [subId]: prev[subId].filter(item => item.id !== itemId)
      }));
      if (formData.modName === itemId) {
        setFormData(prev => ({ ...prev, modName: "" }));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.find(t => t.name === tagInput.trim())) {
      if (formData.tags.length >= 5) {
        alert("태그는 최대 5개까지 설정 가능합니다.");
        return;
      }
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, { name: tagInput.trim(), color: tagColor }]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagName) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.name !== tagName)
    }));
  };

  const handleSave = () => {
    // 실제 저장 로직 (나중에 구현)
    alert("저장 기능은 현재 준비 중입니다.");
    onClose();
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3 className="edit-modal-title">
            {lang === "ko" ? "모드 관리 및 편집" : "Modifier Management"}
          </h3>
          <button className="edit-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="edit-modal-tabs">
          <button 
            className={`tab-button ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            {lang === "ko" ? "모드 편집/추가" : "Add/Edit Mod"}
          </button>
          <button 
            className={`tab-button ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            {lang === "ko" ? "카테고리 관리" : "Manage Categories"}
          </button>
        </div>

        <div className="edit-modal-content">
          {activeTab === "edit" ? (
            <div className="form-grid">
              {/* 1차/2차 카테고리 한 줄 배치 (너비 최적화) */}
              <div className="form-group full-width">
                <div className="category-row">
                  <div className="cat-main-box">
                    <label className="modal-label">1차 카테고리</label>
                    <div className="input-with-toggle">
                      {!formData.isNewMainCategory ? (
                        <select 
                          className="modal-select w-full"
                          value={formData.mainCategory}
                          onChange={(e) => setFormData({...formData, mainCategory: e.target.value})}
                        >
                          {mainCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name || cat.id}
                              {customMainCategories.find(c => c.id === cat.id) ? " (신규)" : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                          <input 
                            type="text" 
                            className="modal-input w-full"
                            placeholder="신규" 
                            value={formData.newMainCategory}
                            onChange={(e) => setFormData({...formData, newMainCategory: e.target.value})}
                          />
                          <button className="apply-btn" onClick={handleApplyNewMainCategory}>적용</button>
                        </div>
                      )}
                      <button 
                        className="toggle-button"
                        onClick={() => setFormData({...formData, isNewMainCategory: !formData.isNewMainCategory})}
                      >
                        {formData.isNewMainCategory ? "취소" : "신규"}
                      </button>
                    </div>
                  </div>

                  <div className="cat-sub-box">
                    <label className="modal-label">2차 카테고리 (아이템 종류)</label>
                    <div className="input-with-toggle">
                      {!formData.isNewSubCategory ? (
                        <select 
                          className="modal-select w-full"
                          value={formData.subCategory}
                          onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                        >
                          {currentSubCategories.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name || item.id}
                              {customSubCategories[formData.mainCategory]?.find(c => c.id === item.id) ? " (신규)" : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                          <input 
                            type="text" 
                            className="modal-input w-full"
                            placeholder="신규 입력" 
                            value={formData.newSubCategory}
                            onChange={(e) => setFormData({...formData, newSubCategory: e.target.value})}
                          />
                          <button className="apply-btn" onClick={handleApplyNewSubCategory}>적용</button>
                        </div>
                      )}
                      <button 
                        className="toggle-button"
                        onClick={() => setFormData({...formData, isNewSubCategory: !formData.isNewSubCategory})}
                      >
                        {formData.isNewSubCategory ? "취소" : "신규"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모드 이름 (600px 모달에 맞춰 너비 조정) */}
              <div className="form-group full-width" style={{ maxWidth: "450px" }}>
                <label className="modal-label">모드 이름</label>
                <div className="input-with-toggle">
                  {!formData.isNewMod ? (
                    <select 
                      className="modal-select w-full"
                      value={formData.modName}
                      onChange={(e) => setFormData({...formData, modName: e.target.value})}
                    >
                      <option value="">모드 선택...</option>
                      {existingMods.map(mod => (
                        <option key={mod.id} value={mod.id}>
                          {mod.nameKo} ({mod.nameEn})
                          {customMods[formData.subCategory]?.find(m => m.id === mod.id) ? " (신규)" : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                      <input 
                        type="text" 
                        className="modal-input w-full"
                        placeholder="신규 모드 이름" 
                        value={formData.newModName}
                        onChange={(e) => setFormData({...formData, newModName: e.target.value})}
                      />
                      <button className="apply-btn" onClick={handleApplyNewMod}>적용</button>
                    </div>
                  )}
                  <button 
                    className="toggle-button"
                    onClick={() => setFormData({...formData, isNewMod: !formData.isNewMod})}
                  >
                    {formData.isNewMod ? "취소" : "신규"}
                  </button>
                </div>
              </div>

              {/* 컴팩트 등급/레벨 정보 줄 - 600px 환경에 맞춰 최적화 */}
              <div className="form-row-compact full-width">
                <div className="compact-item-tier">
                  <label className="modal-label">등급</label>
                  <select className="modal-select w-full" value={formData.tier} onChange={(e) => setFormData({...formData, tier: e.target.value})}>
                    {[1,2,3,4,5,6,7,8,9,10].map(t => <option key={t} value={t}>T{t}</option>)}
                    <option value="custom">기타</option>
                  </select>
                </div>
                <div className="compact-item-auto">
                  <label className="modal-label">등급 명칭 (한글)</label>
                  <input 
                    type="text" 
                    className="modal-input w-full"
                    placeholder="예: 빛을 뿜는" 
                    value={formData.tierNameKo}
                    onChange={(e) => setFormData({...formData, tierNameKo: e.target.value})}
                  />
                </div>
                <div className="compact-item-auto">
                  <label className="modal-label">등급 명칭 (영문)</label>
                  <input 
                    type="text" 
                    className="modal-input w-full"
                    placeholder="예: Crystalising" 
                    value={formData.tierNameEn}
                    onChange={(e) => setFormData({...formData, tierNameEn: e.target.value})}
                  />
                </div>
                <div className="compact-item-small">
                  <label className="modal-label">최소 레벨</label>
                  <input 
                    type="number" 
                    className="modal-input w-full"
                    min="0"
                    value={formData.minLevel}
                    onChange={(e) => setFormData({...formData, minLevel: Math.max(0, parseInt(e.target.value) || 0)})}
                  />
                </div>
                <div className="compact-item-small">
                  <label className="modal-label">가중치</label>
                  <input 
                    type="number" 
                    className="modal-input w-full"
                    min="0"
                    max="10000"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Math.min(10000, Math.max(0, parseInt(e.target.value) || 0))})}
                  />
                </div>
              </div>

              {/* 태그 UI 개선 */}
              <div className="form-group full-width">
                <label className="modal-label">속성 태그 (최대 5개)</label>
                <div className="tag-management-row">
                  <div className="tag-input-group">
                    <input 
                      type="text" 
                      className="tag-input-small modal-input"
                      placeholder="태그" 
                      maxLength="10"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                    <input 
                      type="color" 
                      className="color-picker-small"
                      value={tagColor} 
                      onChange={(e) => setTagColor(e.target.value)}
                    />
                    <button className="add-tag-btn-small" onClick={handleAddTag}>+</button>
                  </div>
                   <div className="tag-display-area">
                    {formData.tags.map(tag => (
                      <span key={tag.name} className="tag-pill-slim" style={{ color: tag.color, borderLeft: `3px solid ${tag.color}` }}>
                        {tag.name} <button onClick={() => handleRemoveTag(tag.name)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="modal-label">모드 설명 / 수치 범위</label>
                <textarea 
                  className="modal-textarea w-full"
                  rows="3" 
                  placeholder="예: 물리 피해 (10–15)~(20–25) 추가" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="category-management">
              <div className="management-header">
                <h4>신규 추가된 항목 관리</h4>
              </div>

              <div className="custom-items-section">
                <h5>1차 카테고리 (신규)</h5>
                <div className="category-list">
                  {customMainCategories.map(cat => (
                    <div key={cat.id} className="category-item">
                      <div className="cat-info">
                        <span className="cat-name">{cat.name}</span>
                      </div>
                      <button className="delete-icon-btn" onClick={() => handleRemoveCustomItem("maincategory", null, null, cat.id)}>삭제</button>
                    </div>
                  ))}
                  {customMainCategories.length === 0 && <p className="no-data">추가된 신규 1차 카테고리가 없습니다.</p>}
                </div>
              </div>
              
              <div className="custom-items-section" style={{ marginTop: "20px" }}>
                <h5>2차 카테고리 (신규)</h5>
                <div className="category-list">
                  {Object.entries(customSubCategories).map(([mainId, items]) => 
                    items.map(item => (
                      <div key={`${mainId}_${item.id}`} className="category-item">
                        <div className="cat-info">
                          <span className="cat-id">[{mainId}]</span>
                          <span className="cat-name">{item.name}</span>
                        </div>
                        <button className="delete-icon-btn" onClick={() => handleRemoveCustomItem("subcategory", mainId, null, item.id)}>삭제</button>
                      </div>
                    ))
                  )}
                  {Object.values(customSubCategories).flat().length === 0 && <p className="no-data">추가된 신규 카테고리가 없습니다.</p>}
                </div>
              </div>

              <div className="custom-items-section" style={{ marginTop: "20px" }}>
                <h5>모드 이름 (신규)</h5>
                <div className="category-list">
                  {Object.entries(customMods).map(([subId, mods]) => 
                    mods.map(mod => (
                      <div key={mod.id} className="category-item">
                        <div className="cat-info">
                          <span className="cat-id">[{subId}]</span>
                          <span className="cat-name">{mod.nameKo}</span>
                        </div>
                        <button className="delete-icon-btn" onClick={() => handleRemoveCustomItem("mod", null, subId, mod.id)}>삭제</button>
                      </div>
                    ))
                  )}
                  {Object.values(customMods).flat().length === 0 && <p className="no-data">추가된 신규 모드 이름이 없습니다.</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="edit-modal-footer">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="save-button" onClick={handleSave}>설정 저장</button>
        </div>
      </div>

      <style jsx>{`
        .edit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .edit-modal {
          background: #111;
          border: 1px solid #333;
          width: 95%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
          border-radius: 0;
          overflow: hidden;
        }

        .edit-modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a1a;
        }

        .edit-modal-title {
          margin: 0;
          font-size: 16px;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .edit-modal-close {
          background: none;
          border: none;
          color: #666;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }

        .edit-modal-tabs {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid #222;
          background: #151515;
        }

        .tab-button {
          padding: 12px 20px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          position: relative;
          transition: color 0.2s;
        }

        .tab-button.active {
          color: #a3ff12;
        }

        .tab-button.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #a3ff12;
        }

        .edit-modal-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          background: #0d0d0d;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .category-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          width: 100%;
        }

        .cat-main-box {
          flex: 0 0 160px;
        }

        .cat-sub-box {
          flex: 1;
          min-width: 0;
        }

        .form-row-compact {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          width: 100%;
        }

        .compact-item-tier {
          flex: 0 0 75px;
        }

        .compact-item-auto {
          flex: 1;
          min-width: 0;
        }

        .compact-item-small {
          flex: 0 0 65px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          width: 100%;
        }

        .modal-label {
          font-size: 10px;
          color: #666;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .modal-input, 
        .modal-select, 
        .modal-textarea {
          background: #1a1a1a;
          border: 1px solid #333;
          color: #eee;
          padding: 10px;
          border-radius: 0;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .w-full {
          width: 100%;
        }

        .modal-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 24px;
        }

        .modal-input:focus, 
        .modal-select:focus, 
        .modal-textarea:focus {
          border-color: #555;
        }

        .input-with-toggle {
          display: flex;
          gap: 6px;
          width: 100%;
          min-width: 0;
        }

        .input-with-toggle input,
        .input-with-toggle select {
          flex: 1;
          min-width: 0;
        }

        .toggle-button {
          padding: 0 10px;
          background: #252525;
          border: 1px solid #333;
          color: #777;
          border-radius: 0;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
        }

        .toggle-button:hover {
          background: #333;
          color: #eee;
        }

        .tag-management-row {
          display: flex;
          gap: 15px;
          background: #151515;
          padding: 12px;
          border-radius: 0;
          border: 1px solid #222;
          align-items: center;
        }

        .tag-input-group {
          display: flex;
          gap: 6px;
          flex: 0 0 180px;
        }

        .tag-input-small {
          width: 80px !important;
          padding: 8px !important;
        }

        .color-picker-small {
          width: 35px !important;
          padding: 0 !important;
          height: 35px;
          cursor: pointer;
          border: none !important;
          background: none !important;
        }

        .add-tag-btn-small {
          background: #333;
          color: #eee;
          border: 1px solid #444;
          width: 35px;
          height: 35px;
          border-radius: 0;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tag-display-area {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          flex: 1;
        }

        .tag-pill-slim {
          background: #222;
          color: #ccc;
          padding: 4px 8px;
          border-radius: 0;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tag-pill-slim button {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .tag-pill-slim button:hover {
          color: #ff4d4d;
        }

        .category-management {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .management-header h4 {
          margin: 0;
          color: #eee;
          font-size: 15px;
        }

        .add-btn {
          background: #a3ff12;
          color: #000;
          border: none;
          padding: 6px 14px;
          border-radius: 0;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .no-data {
          font-size: 12px;
          color: #444;
          text-align: center;
          padding: 20px 0;
        }

        .custom-items-section h5 {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #a3ff12;
          font-weight: 700;
        }

        .apply-btn {
          background: #333;
          color: #a3ff12;
          border: 1px solid #444;
          padding: 0 12px;
          border-radius: 0;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .apply-btn:hover {
          background: #444;
        }

        .cat-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .cat-id {
          font-size: 10px;
          color: #555;
          text-transform: uppercase;
          font-weight: 800;
        }

        .cat-name {
          color: #ccc;
          font-size: 13px;
          font-weight: 600;
        }

        .cat-actions {
          display: flex;
          gap: 6px;
        }

        .edit-icon-btn, .delete-icon-btn {
          background: #252525;
          border: 1px solid #333;
          color: #666;
          padding: 4px 8px;
          border-radius: 0;
          font-size: 10px;
          cursor: pointer;
        }

        .edit-icon-btn:hover { color: #eee; }
        .delete-icon-btn:hover { color: #ff4d4d; border-color: #ff4d4d; }

        .edit-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #222;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #1a1a1a;
        }

        .cancel-button {
          background: none;
          border: 1px solid #333;
          color: #666;
          padding: 10px 24px;
          border-radius: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .save-button {
          background: #a3ff12;
          color: #000;
          border: none;
          padding: 10px 24px;
          border-radius: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
