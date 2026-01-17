'use client';

import { useState, useEffect } from 'react';

export default function ModsManagementPage() {
  const [activeTab, setActiveTab] = useState('database'); // database, presets, generator
  const [modsDatabase, setModsDatabase] = useState([]);
  const [modPresets, setModPresets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, prefix, suffix
  const [filterItemClass, setFilterItemClass] = useState('all');

  // 데이터 로드
  useEffect(() => {
    loadModsData();
    loadPresetsData();
  }, []);

  const loadModsData = async () => {
    try {
      const response = await fetch('/data/poe2-mods-database.json');
      if (!response.ok) {
        console.warn('Mods database not found, starting with empty data');
        setModsDatabase([]);
        return;
      }
      const data = await response.json();
      setModsDatabase(data.mods || []);
    } catch (error) {
      console.error('Failed to load mods database:', error);
      setModsDatabase([]);
    }
  };

  const loadPresetsData = async () => {
    try {
      const response = await fetch('/data/item-mod-presets.json');
      if (!response.ok) {
        console.warn('Mod presets not found, starting with empty data');
        setModPresets([]);
        return;
      }
      const data = await response.json();
      setModPresets(data.modPresets || []);
    } catch (error) {
      console.error('Failed to load mod presets:', error);
      setModPresets([]);
    }
  };

  // 모드 검색 및 필터링
  const filteredMods = modsDatabase.filter((mod) => {
    const matchesSearch = 
      mod.nameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || mod.type === filterType;
    
    const matchesItemClass = 
      filterItemClass === 'all' || 
      mod.itemClasses.includes(filterItemClass);
    
    return matchesSearch && matchesType && matchesItemClass;
  });

  return (
    <div className="mods-management-container">
      <div className="content-inner">
        {/* 헤더 섹션 */}
        <div className="page-header">
          <h1 className="page-title">모드 관리</h1>
          <p className="page-description">
            아이템의 모드(HasExplicitMod) 정보를 관리하고 필터 코드를 생성합니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('database')}
            className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
          >
            📚 모드 데이터베이스
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`tab-button ${activeTab === 'presets' ? 'active' : ''}`}
          >
            ⚙️ 모드 프리셋 관리
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
          >
            🔧 필터 코드 생성
          </button>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className="tab-content">
          {activeTab === 'database' && (
            <ModsDatabaseTab
              mods={filteredMods}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              filterItemClass={filterItemClass}
              setFilterItemClass={setFilterItemClass}
            />
          )}

          {activeTab === 'presets' && (
            <ModPresetsTab
              presets={modPresets}
              setPresets={setModPresets}
              modsDatabase={modsDatabase}
            />
          )}

          {activeTab === 'generator' && (
            <FilterGeneratorTab presets={modPresets} />
          )}
        </div>
      </div>

      <style jsx>{`
        .mods-management-container {
          min-h: 100vh;
          background: #0a0a0a;
          color: var(--text);
          padding: 24px;
        }

        .content-inner {
          max-width: 1300px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .page-description {
          color: var(--muted);
          font-size: 14px;
        }

        .tabs-container {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }

        .tab-button {
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          color: var(--muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          bottom: -1px;
        }

        .tab-button:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
        }

        .tab-button.active {
          color: var(--game-primary);
          border-bottom-color: var(--game-primary);
        }

        .tab-content {
          background: #111111;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

// 모드 데이터베이스 탭
function ModsDatabaseTab({ mods, searchQuery, setSearchQuery, filterItemClass, setFilterItemClass }) {
  // 타입별로 모드 그룹화
  const prefixMods = mods.filter(m => m.type === 'prefix');
  const suffixMods = mods.filter(m => m.type === 'suffix');

  // 모드 그룹화 로직 (이름 기준)
  const groupMods = (modsList) => {
    const groups = {};
    modsList.forEach(mod => {
      const key = mod.groupId || mod.nameKo;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          nameKo: mod.nameKo,
          nameEn: mod.nameEn,
          type: mod.type,
          tags: mod.tags || [],
          tiers: []
        };
      }
      groups[key].tiers.push(mod);
    });
    
    // 티어 순 정렬 및 요약 정보 계산
    return Object.values(groups).map(group => {
      group.tiers.sort((a, b) => (b.tier || 0) - (a.tier || 0)); // T9 -> T1 순(Poe2DB 스타일)
      group.maxLevel = Math.max(...group.tiers.map(t => t.minLevel || 0));
      group.totalWeight = group.tiers.reduce((acc, t) => acc + (t.weight || 0), 0);
      return group;
    });
  };

  const groupedPrefix = groupMods(prefixMods);
  const groupedSuffix = groupMods(suffixMods);
  
  // 상세 모달 상태
  const [selectedMod, setSelectedMod] = useState(null);

  // 섹션 펼침/접힘 상태
  const [expandedSections, setExpandedSections] = useState({
    prefix: true,
    suffix: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="mods-database-tab">
      {/* 검색 및 필터 영역 */}
      <div className="filter-area">
        <div className="filter-row">
          {/* 아이템 종류 드롭다운 */}
          <div className="control-group">
            <label className="control-label">아이템 종류</label>
            <select
              value={filterItemClass}
              onChange={(e) => setFilterItemClass(e.target.value)}
              className="control-select"
            >
              <option value="all">전체 아이템</option>
              <optgroup label="무기 (Weapons)">
                <option value="Bows">활 (Bows)</option>
                <option value="Crossbows">석궁 (Crossbows)</option>
                <option value="One Hand Maces">한손 철퇴 (One Hand Maces)</option>
                <option value="Two Hand Maces">양손 철퇴 (Two Hand Maces)</option>
                <option value="Spears">창 (Spears)</option>
              </optgroup>
              <optgroup label="방어구 (Armours)">
                <option value="Body Armours">갑옷 (Body Armours)</option>
                <option value="Helmets">투구 (Helmets)</option>
                <option value="Gloves">장갑 (Gloves)</option>
                <option value="Boots">장화 (Boots)</option>
                <option value="Shields">방패 (Shields)</option>
              </optgroup>
              <optgroup label="악세서리 (Accessories)">
                <option value="Belts">벨트 (Belts)</option>
                <option value="Amulets">목걸이 (Amulets)</option>
                <option value="Rings">반지 (Rings)</option>
              </optgroup>
            </select>
          </div>

          {/* 검색창 */}
          <div className="control-group flex-1">
            <label className="control-label">모드 검색</label>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="모드 이름 또는 옵션 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="control-input"
              />
            </div>
          </div>

          {/* 데스크탑 버튼 그룹 */}
          <div className="button-group">
            <button className="action-button blue">
              <span>⬇️</span> 데이터 동기화
            </button>
            <button className="action-button green">
              <span>➕</span> 모드 추가
            </button>
          </div>
        </div>
      </div>

      {/* 통계 바 */}
      <div className="stats-bar">
        <div className="stats-info">
          <span>검색 결과: <strong>{mods.length}</strong></span>
          <span className="divider"></span>
          <span className="prefix-count">접두어: {prefixMods.length}</span>
          <span className="suffix-count">접미어: {suffixMods.length}</span>
        </div>
        <div className="stats-hint">
          * 모드 티어를 드래그하여 조정할 수 있습니다 (준비 중)
        </div>
      </div>

      {/* 모드 리스트 (2열 레이아웃) */}
      <div className="mod-list-grid">
        {mods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>검색 결과가 없습니다.</p>
            <span>다른 필터나 검색어를 시도해 보세요.</span>
          </div>
        ) : (
          <>
            {/* 접두어 컬럼 */}
            <div className={`mod-column ${!expandedSections.prefix ? 'collapsed' : ''}`}>
              <div className="column-header prefix" onClick={() => toggleSection('prefix')}>
                <div className="header-left">
                  <span className="toggle-arrow">{expandedSections.prefix ? '▼' : '▶'}</span>
                  <h3>접두어 (Prefix)</h3>
                  <span className="badge green">{groupedPrefix.length}</span>
                </div>
              </div>
              {expandedSections.prefix && (
                <div className="column-content custom-scrollbar">
                  {groupedPrefix.map((group, index) => (
                    <ModItemGroup key={`${group.id}-${index}`} group={group} onOpenDetail={setSelectedMod} />
                  ))}
                </div>
              )}
            </div>

            {/* 접미어 컬럼 */}
            <div className={`mod-column ${!expandedSections.suffix ? 'collapsed' : ''}`}>
              <div className="column-header suffix" onClick={() => toggleSection('suffix')}>
                <div className="header-left">
                  <span className="toggle-arrow">{expandedSections.suffix ? '▼' : '▶'}</span>
                  <h3>접미어 (Suffix)</h3>
                  <span className="badge orange">{groupedSuffix.length}</span>
                </div>
              </div>
              {expandedSections.suffix && (
                <div className="column-content custom-scrollbar">
                  {groupedSuffix.map((group, index) => (
                    <ModItemGroup key={`${group.id}-${index}`} group={group} onOpenDetail={setSelectedMod} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedMod && (
        <ModDetailModal 
          group={selectedMod} 
          onClose={() => setSelectedMod(null)} 
        />
      )}

      <style jsx>{`
        .mods-database-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filter-area {
          background: #1a1a1a;
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 4px;
        }

        .filter-row {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .flex-1 { flex: 1; }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          margin-left: 2px;
        }

        .control-select, .control-input {
          height: 42px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0 12px;
          font-size: 14px;
          border-radius: 0;
          outline: none;
          transition: border-color 0.2s;
        }

        .control-select:focus, .control-input:focus {
          border-color: var(--game-primary);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--muted);
          font-size: 14px;
        }

        .search-input-wrapper .control-input {
          padding-left: 36px;
          width: 100%;
        }

        .button-group {
          display: flex;
          gap: 8px;
        }

        .action-button {
          height: 42px;
          padding: 0 20px;
          border: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-button.blue { background: #3e63dd; }
        .action-button.green { background: #22863a; }
        
        .action-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .stats-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--muted);
        }

        .stats-info strong { color: var(--text); }

        .divider {
          width: 1px;
          height: 12px;
          background: var(--border);
        }

        .prefix-count { color: #4ade80; }
        .suffix-count { color: #fb923c; }

        .stats-hint {
          font-size: 12px;
          color: var(--muted);
          font-style: italic;
        }

        .mod-list-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          min-height: 500px;
        }

        @media (max-width: 1024px) {
          .mod-list-grid {
            grid-template-columns: 1fr;
          }
        }

        .mod-column {
          display: flex;
          flex-direction: column;
          background: #161616;
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .column-header {
          padding: 14px 16px;
          background: #222;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.2s;
        }

        .column-header:hover { background: #2a2a2a; }

        .column-header.prefix { border-left: 4px solid #22863a; }
        .column-header.suffix { border-left: 4px solid #cb772f; }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-arrow {
          font-size: 10px;
          color: var(--muted);
          width: 12px;
        }

        .header-left h3 {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .badge {
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 4px;
        }

        .badge.green { background: rgba(34, 134, 58, 0.2); color: #4ade80; }
        .badge.orange { background: rgba(203, 119, 47, 0.2); color: #fb923c; }

        .column-content {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 800px;
          overflow-y: auto;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 0;
          color: var(--muted);
          background: #1a1a1a;
          border: 1px dashed var(--border);
        }

        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.2; }
        .empty-state p { font-size: 18px; font-weight: 600; color: var(--text); margin: 0; }
        .empty-state span { font-size: 14px; margin-top: 8px; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
}

// 그룹화된 모드 아이템 컴포넌트
function ModItemGroup({ group, onOpenDetail }) {
  const topTier = group.tiers[0]; // 가장 높은 티어 (T1 등)
  
  return (
    <div className="mod-item-group" onClick={() => onOpenDetail(group)}>
      <div className="mod-item-inner">
        {/* 모드 요약 정보 */}
        <div className="mod-details">
          <div className="mod-header">
            <span className="name-ko">{group.nameKo}</span>
            <div className="tags-row">
              {group.tags.map((tag, i) => (
                <span key={i} className={`tag-badge ${tag.replace(' ', '_')}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="mod-desc-preview">
            {topTier.description.replace(/\(.*\)/, '#~#')}
          </div>
        </div>

        {/* 우측 지표 뱃지 (Poe2DB 스타일) */}
        <div className="mod-stats">
          <div className="stat-badge tier-count">{group.tiers.length}</div>
          <div className="stat-badge max-level">{group.maxLevel}</div>
          <div className="stat-badge weight-total">{group.totalWeight}</div>
        </div>
      </div>

      <style jsx>{`
        .mod-item-group {
          background: #1a1a1a;
          border: 1px solid var(--border);
          transition: all 0.2s;
          cursor: pointer;
        }

        .mod-item-group:hover {
          background: #222;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .mod-item-inner {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mod-details {
          flex: 1;
          min-width: 0;
        }

        .mod-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .name-ko {
          font-size: 14px;
          font-weight: 600;
          color: #a6c0fe; /* Poe2DB 파란색 텍스트 느낌 */
        }

        .tags-row {
          display: flex;
          gap: 4px;
        }

        .tag-badge {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 700;
        }

        /* 속성별 태그 색상 */
        .tag-badge.물리 { background: #e54d2e; color: white; }
        .tag-badge.화염 { background: #ff4500; color: white; }
        .tag-badge.냉기 { background: #3e63dd; color: white; }
        .tag-badge.번개 { background: #ffd700; color: #000; }
        .tag-badge.카오스 { background: #d02090; color: white; }
        .tag-badge.공격 { background: #7c4dff; color: white; }
        .tag-badge.생명력 { background: #ff1493; color: white; }
        .tag-badge.마나 { background: #1e90ff; color: white; }
        .tag-badge.에너지_보호막 { background: #f0f8ff; color: #333; }
        .tag-badge.저항 { background: #4682b4; color: white; }
        .tag-badge.그외, .tag-badge.gray { background: #333; color: #aaa; }

        .mod-desc-preview {
          font-size: 13px;
          color: #bdbdbd;
        }

        .mod-stats {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .stat-badge {
          min-width: 24px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          border-radius: 10px;
          padding: 0 6px;
        }

        .stat-badge.tier-count { background: #22863a; color: #ffffff; }
        .stat-badge.max-level { background: #555; color: #ffffff; }
        .stat-badge.weight-total { background: #e54d2e; color: #ffffff; }
      `}</style>
    </div>
  );
}

// 모드 상세 정보 모달 (Poe2DB 스타일)
function ModDetailModal({ group, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{group.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <table className="tier-table">
            <thead>
              <tr>
                <th>등급</th>
                <th>이름</th>
                <th>iLv</th>
                <th>수치 범위</th>
                <th>태그</th>
                <th>가중치</th>
                <th width="40"></th>
              </tr>
            </thead>
            <tbody>
              {group.tiers.map((tier, idx) => (
                <tr key={idx} className={`tier-row T${tier.tier}`}>
                  <td className="col-tier">T{tier.tier}</td>
                  <td className="col-name">{tier.tierName || '-'}</td>
                  <td className="col-level">{tier.minLevel}</td>
                  <td className="col-values">{tier.values}</td>
                  <td className="col-tags">
                    {tier.tags?.map((tag, i) => (
                      <span key={i} className={`mini-tag ${tag.replace(' ', '_')}`}>
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="col-weight">
                    <span className="weight-badge">{tier.weight || 1000}</span>
                    <button className="info-btn">i</button>
                  </td>
                  <td>
                    <button className="add-btn">+</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="modal-footer">
            <div className="footer-summary">
              <span className="icon">➡️</span>
              <span className="summary-text">{group.nameKo}</span>
            </div>
            <button className="btn-close-action" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content {
          background: #1e1e1e;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 4px;
          border: 1px solid #333;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .modal-header {
          padding: 12px 16px;
          background: #2a2a2a;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #fb923c; /* 주황색 강조 */
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
        }

        .modal-body {
          padding: 0;
        }

        .tier-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .tier-table th {
          text-align: left;
          padding: 10px 16px;
          background: #161616;
          color: #888;
          font-weight: 500;
          border-bottom: 1px solid #333;
        }

        .tier-row {
          border-bottom: 1px solid #2a2a2a;
          transition: background 0.1s;
        }

        .tier-row:hover { background: #252525; }

        .tier-row td {
          padding: 10px 16px;
          color: #eee;
        }

        .col-tier { font-weight: 800; color: #fff; width: 50px; }
        .col-name { color: #aaa; width: 100px; }
        .col-level { font-weight: 800; width: 50px; text-align: center; }
        .col-values { color: #eee; }
        
        .mini-tag {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          margin-right: 4px;
          font-weight: 700;
        }
        
        .mini-tag.물리 { background: #e54d2e; color: white; }
        .mini-tag.화염 { background: #ff4500; color: white; }
        .mini-tag.냉기 { background: #3e63dd; color: white; }
        .mini-tag.번개 { background: #ffd700; color: #000; }
        .mini-tag.카오스 { background: #d02090; color: white; }
        .mini-tag.공격 { background: #7c4dff; color: white; }
        .mini-tag.생명력 { background: #ff1493; color: white; }
        .mini-tag.마나 { background: #1e90ff; color: white; }
        .mini-tag.에너지_보호막 { background: #f0f8ff; color: #333; }
        .mini-tag.저항 { background: #4682b4; color: white; }
        .mini-tag.그외, .mini-tag.gray { background: #333; color: #888; }

        .col-weight {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
          width: 120px;
        }

        .weight-badge {
          background: #e54d2e;
          color: white;
          padding: 1px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
        }

        .info-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          color: black;
          border: none;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-btn {
          width: 24px;
          height: 24px;
          background: #22863a;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 900;
          cursor: pointer;
        }

        .modal-footer {
          padding: 12px 16px;
          background: #252525;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-summary {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-text {
          font-size: 15px;
          font-weight: 600;
          color: #eee;
        }

        .btn-close-action {
          padding: 6px 16px;
          background: #333;
          border: 1px solid #444;
          color: #eee;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        
        .btn-close-action:hover { background: #444; }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>
    </div>
  );
}

// 모드 프리셋 탭
function ModPresetsTab({ presets, setPresets, modsDatabase }) {
  return (
    <div className="mod-presets-tab">
      <div className="tab-header">
        <h2 className="tab-title">모드 프리셋 관리</h2>
        <button className="action-button green">
          <span>➕</span> 새 모드 프리셋 생성
        </button>
      </div>

      {presets.length === 0 ? (
        <div className="empty-state">
          <p>모드 프리셋이 없습니다.</p>
          <span>새 모드 프리셋을 생성하여 시작하세요.</span>
        </div>
      ) : (
        <div className="presets-list">
          {presets.map((preset) => (
            <div key={preset.id} className="preset-card">
              <div className="preset-header">
                <div className="preset-title-group">
                  <h3 className="preset-name">{preset.nameKo}</h3>
                  <p className="preset-desc">{preset.description}</p>
                </div>
                <div className="preset-actions">
                  <button className="text-btn edit">편집</button>
                  <button className="text-btn delete">삭제</button>
                </div>
              </div>

              <div className="preset-details-grid">
                <div className="detail-section">
                  <label>아이템 클래스 ({preset.itemClasses.length})</label>
                  <div className="tag-list">
                    {preset.itemClasses.map((cls, i) => (
                      <span key={i} className="badge blue">{cls}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <label>BaseType ({preset.baseTypes.length})</label>
                  <div className="status-text">
                    {preset.baseTypes.length > 0 ? `${preset.baseTypes.length}개 설정됨` : '모든 BaseType'}
                  </div>
                </div>
              </div>

              <div className="mod-groups-section">
                <label>모드 그룹</label>
                <div className="groups-container">
                  {Object.entries(preset.modGroups).map(([key, group]) => (
                    <div key={key} className="mod-group-box">
                      <div className="group-label">{group.label}</div>
                      <div className="mod-tag-list">
                        {group.mods.map((mod, i) => (
                          <span key={i} className="mod-tag">{mod}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .mod-presets-tab { display: flex; flex-direction: column; gap: 24px; }
        .tab-header { display: flex; justify-content: space-between; align-items: center; }
        .tab-title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; }
        
        .presets-list { display: flex; flex-direction: column; gap: 16px; }
        .preset-card {
          background: #1a1a1a;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 24px;
        }

        .preset-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .preset-name { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0; }
        .preset-desc { font-size: 14px; color: var(--muted); margin: 0; }

        .preset-actions { display: flex; gap: 8px; }
        .text-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .text-btn:hover { background: rgba(255, 255, 255, 0.05); color: #ffffff; }
        .text-btn.delete:hover { border-color: #ff4757; color: #ff4757; }

        .preset-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .detail-section label { display: block; font-size: 13px; font-weight: 700; color: #555; margin-bottom: 12px; text-transform: uppercase; }
        
        .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .badge { padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 4px; }
        .badge.blue { background: rgba(62, 99, 221, 0.15); color: #70b1ff; border: 1px solid rgba(62, 99, 221, 0.3); }

        .status-text { color: var(--text); font-size: 14px; padding: 4px 0; }

        .mod-groups-section label { display: block; font-size: 13px; font-weight: 700; color: #555; margin-bottom: 12px; text-transform: uppercase; }
        .groups-container { display: flex; flex-direction: column; gap: 12px; }
        
        .mod-group-box { background: #111; border: 1px solid var(--border); padding: 12px; border-radius: 4px; }
        .group-label { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
        .mod-tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .mod-tag { background: #0a0a0a; border: 1px solid #333; color: #888; padding: 3px 8px; font-size: 12px; font-family: monospace; }

        .empty-state { text-align: center; padding: 60px 0; border: 1px dashed var(--border); color: var(--muted); }
        .empty-state p { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; }
        .empty-state span { font-size: 13px; margin-top: 8px; display: block; }
      `}</style>
    </div>
  );
}

// 필터 코드 생성 탭
function FilterGeneratorTab({ presets }) {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateFilterCode = () => {
    if (!selectedPreset) return;

    const preset = presets.find(p => p.id === selectedPreset);
    if (!preset) return;

    let code = `# ${preset.nameKo}\n`;
    code += `# [Generated from mod preset: ${preset.id}]\n\n`;

    preset.filterRules.forEach(rule => {
      code += `Show # ${rule.nameKo || rule.label}\n`;
      code += `  Identified True\n`;
      code += `  Corrupted False\n`;
      
      if (preset.itemClasses.length > 0) {
        code += `  Class == ${preset.itemClasses.map(c => `"${c}"`).join(' ')}\n`;
      }

      if (preset.baseTypes.length > 0) {
        code += `  BaseType == ${preset.baseTypes.map(b => `"${b}"`).join(' ')}\n`;
      }

      rule.conditions.forEach(condition => {
        const mods = [];
        if (condition.modGroup) {
          const group = preset.modGroups[condition.modGroup];
          if (group) mods.push(...group.mods);
        } else if (condition.modGroups) {
          condition.modGroups.forEach(groupKey => {
            const group = preset.modGroups[groupKey];
            if (group) mods.push(...group.mods);
          });
        }

        if (mods.length > 0) {
          code += `  HasExplicitMod ${condition.operator} ${condition.count} ${mods.map(m => `"${m}"`).join(' ')}\n`;
        }
      });

      if (rule.style) {
        if (rule.style.playEffect) code += `  PlayEffect ${rule.style.playEffect}\n`;
        if (rule.style.minimapIcon) {
          const { size, color, shape } = rule.style.minimapIcon;
          code += `  MinimapIcon ${size} ${color} ${shape}\n`;
        }
        if (rule.style.alertSound) code += `  PlayAlertSound ${rule.style.alertSound} ${rule.style.volume || 300}\n`;
      }
      code += '\n';
    });

    setGeneratedCode(code);
  };

  return (
    <div className="filter-generator-tab">
      <div className="generator-controls">
        <label className="generator-label">모드 프리셋 선택</label>
        <div className="controls-row">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="control-select flex-1"
          >
            <option value="">선택하세요...</option>
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>{preset.nameKo}</option>
            ))}
          </select>
          <button
            onClick={generateFilterCode}
            disabled={!selectedPreset}
            className="action-button blue"
          >
            필터 코드 생성
          </button>
        </div>
      </div>

      {generatedCode && (
        <div className="output-section">
          <div className="output-header">
            <h3 className="output-title">생성된 필터 코드</h3>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="action-button green compact"
            >
              📋 복사
            </button>
          </div>
          
          <div className="code-viewer custom-scrollbar">
            <pre>{generatedCode}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-generator-tab { display: flex; flex-direction: column; gap: 32px; }
        
        .generator-controls { background: #1a1a1a; border: 1px solid var(--border); padding: 24px; border-radius: 4px; }
        .generator-label { display: block; font-size: 14px; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
        .controls-row { display: flex; gap: 12px; }
        
        .output-section { display: flex; flex-direction: column; gap: 16px; }
        .output-header { display: flex; justify-content: space-between; align-items: center; }
        .output-title { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0; }
        
        .action-button.compact { height: 36px; padding: 0 16px; font-size: 13px; }

        .code-viewer {
          background: #050505;
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 4px;
          max-height: 600px;
          overflow: auto;
        }

        .code-viewer pre {
          margin: 0;
          color: #d1d1d1;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
