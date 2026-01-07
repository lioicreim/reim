import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 필터 파일 파서
 * RID 기반 규칙을 추출하고 구조화합니다.
 * 베이스 아이템의 경우 조건만 추출하고, BaseType은 사이트 데이터로 대체됩니다.
 */

// 조건 파싱 함수들
function parseCondition(line) {
  const trimmed = line.trim();
  
  // ItemLevel >= 82
  if (trimmed.startsWith('ItemLevel')) {
    const match = trimmed.match(/ItemLevel\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'itemLevel',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // UnidentifiedItemTier >= 5
  if (trimmed.startsWith('UnidentifiedItemTier')) {
    const match = trimmed.match(/UnidentifiedItemTier\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'unidentifiedItemTier',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // Quality >= 28
  if (trimmed.startsWith('Quality')) {
    const match = trimmed.match(/Quality\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'quality',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // Sockets >= 3
  if (trimmed.startsWith('Sockets')) {
    const match = trimmed.match(/Sockets\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'sockets',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // Rarity == Rare
  if (trimmed.startsWith('Rarity')) {
    const match = trimmed.match(/Rarity\s*(==|!=)\s*(\w+)/);
    if (match) {
      return {
        type: 'rarity',
        operator: match[1],
        value: match[2]
      };
    }
  }
  
  // Class == "Bows" "Crossbows" ...
  if (trimmed.startsWith('Class')) {
    const match = trimmed.match(/Class\s*(==|!=)\s*(.+)/);
    if (match) {
      // 따옴표로 감싸진 클래스명들 추출
      const classes = match[2].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
      return {
        type: 'class',
        operator: match[1],
        value: classes.length === 1 ? classes[0] : classes,
        isMultiple: classes.length > 1
      };
    }
    // Class "All" 같은 경우
    const matchAll = trimmed.match(/Class\s+"All"/);
    if (matchAll) {
      return {
        type: 'class',
        operator: '==',
        value: 'All',
        isMultiple: false
      };
    }
  }
  
  // BaseType == "..." (베이스 아이템의 경우 리스트는 추출하되, 나중에 사이트 데이터로 대체)
  if (trimmed.startsWith('BaseType')) {
    const match = trimmed.match(/BaseType\s*(==|!=)\s*(.+)/);
    if (match) {
      // 따옴표로 감싸진 BaseType들 추출
      const baseTypes = match[2].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
      return {
        type: 'baseType',
        operator: match[1],
        value: baseTypes, // 리스트는 보관하되, 베이스 아이템 규칙의 경우 사이트 데이터로 대체됨
        useSiteData: true // 베이스 아이템 규칙임을 표시
      };
    }
  }
  
  // AreaLevel < 65
  if (trimmed.startsWith('AreaLevel')) {
    const match = trimmed.match(/AreaLevel\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'areaLevel',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // StackSize >= 3000
  if (trimmed.startsWith('StackSize')) {
    const match = trimmed.match(/StackSize\s*(>=|<=|==|>|<)\s*(\d+)/);
    if (match) {
      return {
        type: 'stackSize',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  // Corrupted False
  if (trimmed.startsWith('Corrupted')) {
    const match = trimmed.match(/Corrupted\s+(True|False)/);
    if (match) {
      return {
        type: 'corrupted',
        value: match[1] === 'True'
      };
    }
  }
  
  // HasVaalUniqueMod True
  if (trimmed.startsWith('HasVaalUniqueMod')) {
    const match = trimmed.match(/HasVaalUniqueMod\s+(True|False)/);
    if (match) {
      return {
        type: 'hasVaalUniqueMod',
        value: match[1] === 'True'
      };
    }
  }
  
  // IsVaalUnique True
  if (trimmed.startsWith('IsVaalUnique')) {
    const match = trimmed.match(/IsVaalUnique\s+(True|False)/);
    if (match) {
      return {
        type: 'isVaalUnique',
        value: match[1] === 'True'
      };
    }
  }
  
  // Height == 1
  if (trimmed.startsWith('Height')) {
    const match = trimmed.match(/Height\s*(==|!=)\s*(\d+)/);
    if (match) {
      return {
        type: 'height',
        operator: match[1],
        value: parseInt(match[2])
      };
    }
  }
  
  return null;
}

// 스타일 파싱 함수들
function parseStyle(line) {
  const trimmed = line.trim();
  
  // SetFontSize 45
  if (trimmed.startsWith('SetFontSize')) {
    const match = trimmed.match(/SetFontSize\s+(\d+)/);
    if (match) {
      return {
        type: 'fontSize',
        value: parseInt(match[1])
      };
    }
  }
  
  // SetTextColor 255 0 0 255
  if (trimmed.startsWith('SetTextColor')) {
    const match = trimmed.match(/SetTextColor\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?/);
    if (match) {
      return {
        type: 'textColor',
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseInt(match[4]) : 255
      };
    }
  }
  
  // SetBorderColor 255 0 0 255
  if (trimmed.startsWith('SetBorderColor')) {
    const match = trimmed.match(/SetBorderColor\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?/);
    if (match) {
      return {
        type: 'borderColor',
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseInt(match[4]) : 255
      };
    }
  }
  
  // SetBackgroundColor 255 255 255 255
  if (trimmed.startsWith('SetBackgroundColor')) {
    const match = trimmed.match(/SetBackgroundColor\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?/);
    if (match) {
      return {
        type: 'backgroundColor',
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseInt(match[4]) : 255
      };
    }
  }
  
  // PlayEffect Red
  if (trimmed.startsWith('PlayEffect')) {
    const match = trimmed.match(/PlayEffect\s+(\w+)/);
    if (match) {
      return {
        type: 'playEffect',
        value: match[1]
      };
    }
  }
  
  // MinimapIcon 0 Red Star
  if (trimmed.startsWith('MinimapIcon')) {
    const match = trimmed.match(/MinimapIcon\s+(\d+)\s+(\w+)\s+(\w+)/);
    if (match) {
      return {
        type: 'minimapIcon',
        size: parseInt(match[1]),
        color: match[2],
        shape: match[3]
      };
    }
  }
  
  // CustomAlertSound "custom_sound/1_currency_s.mp3" 300
  if (trimmed.startsWith('CustomAlertSound')) {
    const match = trimmed.match(/CustomAlertSound\s+"([^"]+)"\s+(\d+)/);
    if (match) {
      return {
        type: 'customAlertSound',
        file: match[1],
        volume: parseInt(match[2]),
        platform: 'PC'
      };
    }
  }
  
  // PlayAlertSound 6 300
  if (trimmed.startsWith('PlayAlertSound')) {
    const match = trimmed.match(/PlayAlertSound\s+(\d+)\s+(\d+)/);
    if (match) {
      return {
        type: 'playAlertSound',
        slot: parseInt(match[1]),
        volume: parseInt(match[2]),
        platform: 'PS5'
      };
    }
  }
  
  return null;
}

// 필터 파일 파싱
function parseFilterFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const rules = [];
  let currentSection = null;
  let currentRule = null;
  let inRule = false;
  let ruleLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // SECTION 주석 파싱
    const sectionMatch = line.match(/#\s*\[SECTION:\s*(\w+)\]/);
    if (sectionMatch) {
      // 이전 규칙 저장
      if (currentRule && inRule && ruleLines.length > 0) {
        currentRule.conditions = ruleLines
          .map(l => parseCondition(l))
          .filter(c => c !== null);
        currentRule.styles = ruleLines
          .map(l => parseStyle(l))
          .filter(s => s !== null);
        rules.push(currentRule);
      }
      currentSection = sectionMatch[1];
      currentRule = null;
      inRule = false;
      ruleLines = [];
      continue;
    }
    
    // RID 주석 파싱
    const ridMatch = line.match(/#\s*\[RID:\s*([^\]]+)\]/);
    if (ridMatch) {
      // 이전 규칙 저장
      if (currentRule && inRule && ruleLines.length > 0) {
        currentRule.conditions = ruleLines
          .map(l => parseCondition(l))
          .filter(c => c !== null);
        currentRule.styles = ruleLines
          .map(l => parseStyle(l))
          .filter(s => s !== null);
        rules.push(currentRule);
      }
      
      // 새 규칙 시작
      const rids = ridMatch[1].split('][RID:').map(r => r.trim());
      currentRule = {
        rid: rids[0], // 첫 번째 RID가 메인
        allRids: rids, // 모든 RID 보관
        section: currentSection,
        type: null, // 'show' or 'hide'
        conditions: [],
        styles: [],
        comment: null,
        lineNumber: i + 1
      };
      inRule = false;
      ruleLines = [];
      continue;
    }
    
    // Show/Hide 키워드 파싱 (RID 다음에 오는 경우)
    if ((trimmed === 'Show' || trimmed.startsWith('Show #') || trimmed === 'Hide' || trimmed.startsWith('Hide #')) && currentRule) {
      currentRule.type = trimmed.toLowerCase().split(' ')[0];
      inRule = true;
      
      // Show 뒤의 주석 처리
      const commentMatch = trimmed.match(/#\s*(.+)/);
      if (commentMatch && !currentRule.comment) {
        currentRule.comment = commentMatch[1];
      }
      continue;
    }
    
    // 규칙 내부 라인 처리
    if (inRule && currentRule) {
      // 주석 라인 (Show 뒤의 주석)
      if (trimmed.startsWith('#') && !trimmed.includes('[RID:') && !trimmed.includes('[SECTION:')) {
        if (!currentRule.comment) {
          currentRule.comment = trimmed.replace(/^#\s*/, '');
        }
        continue;
      }
      
      // 빈 라인은 무시
      if (trimmed === '') {
        continue;
      }
      
      // 규칙이 끝나는 조건 (다음 RID나 SECTION이 나오거나, 빈 SECTION 구분선)
      if (trimmed.startsWith('#================================') || trimmed.startsWith('#===')) {
        continue;
      }
      
      // 규칙 라인 추가
      ruleLines.push(line);
    }
  }
  
  // 마지막 규칙 저장
  if (currentRule && ruleLines.length > 0) {
    currentRule.conditions = ruleLines
      .map(l => parseCondition(l))
      .filter(c => c !== null);
    currentRule.styles = ruleLines
      .map(l => parseStyle(l))
      .filter(s => s !== null);
    rules.push(currentRule);
  }
  
  return {
    sections: [...new Set(rules.map(r => r.section).filter(s => s))],
    rules: rules
  };
}

// 메인 실행
const filterFilePath = path.join(__dirname, '../input/Reim 1-Starter-PoE2.filter');
const outputPath = path.join(__dirname, '../data/filter-rules.json');

console.log('필터 파일 파싱 중...');
const result = parseFilterFile(filterFilePath);

console.log(`\n파싱 완료:`);
console.log(`- 섹션 수: ${result.sections.length}`);
console.log(`- 규칙 수: ${result.rules.length}`);

// 베이스 아이템 규칙 식별 및 조건만 추출
const gearClasses = ['Bows', 'Crossbows', 'Wands', 'Staves', 'Sceptres', 'Spears', 'Quarterstaves', 
  'Talismans', 'One Hand Maces', 'Two Hand Maces', 'Body Armours', 'Helmets', 
  'Gloves', 'Boots', 'Shields', 'Bucklers', 'Foci', 'Amulets', 'Rings', 'Belts'];

const gearRules = result.rules.filter(rule => {
  // gear_bases 섹션이거나 gear_bases_highlight 섹션인 경우
  if (rule.section === 'gear_bases' || rule.section === 'gear_bases_highlight') {
    return true;
  }
  
  // BaseType이 있고 장비 클래스가 있는 경우
  const hasBaseType = rule.conditions.some(c => c.type === 'baseType');
  const hasGearClass = rule.conditions.some(c => {
    if (c.type === 'class') {
      if (c.value === 'All') return true;
      if (Array.isArray(c.value)) {
        return c.value.some(v => gearClasses.includes(v));
      }
      return gearClasses.includes(c.value);
    }
    return false;
  });
  
  return hasBaseType && hasGearClass;
});

console.log(`- 베이스 아이템 규칙 수: ${gearRules.length}`);

// 베이스 아이템 규칙에서 BaseType 조건 제거 (사이트 데이터로 대체됨)
gearRules.forEach(rule => {
  // BaseType 조건 제거
  rule.conditions = rule.conditions.filter(c => c.type !== 'baseType');
  rule.useSiteData = true; // 사이트 데이터 사용 표시
  rule.isGearRule = true; // 장비 규칙 표시
});

// JSON 저장
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`\n결과 저장: ${outputPath}`);

// 통계 출력
console.log('\n=== 섹션별 규칙 수 ===');
const sectionCounts = {};
result.rules.forEach(rule => {
  if (rule.section) {
    sectionCounts[rule.section] = (sectionCounts[rule.section] || 0) + 1;
  }
});
Object.entries(sectionCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([section, count]) => {
    console.log(`${section}: ${count}개`);
  });
