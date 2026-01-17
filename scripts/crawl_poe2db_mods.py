"""
POE2DB.TW 모드 크롤링 스크립트
https://poe2db.tw/kr/Modifiers 에서 모드 정보를 크롤링하여 JSON 파일로 저장합니다.

사용법:
    python scripts/crawl_poe2db_mods.py

출력:
    data/poe2-mods-database.json
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import re

class POE2DBModCrawler:
    def __init__(self):
        self.base_url = "https://poe2db.tw"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.mods_data = []
        
    def fetch_page(self, url):
        """페이지 HTML을 가져옵니다."""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            time.sleep(1)  # 서버 부하 방지
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def parse_modifier_table(self, html, item_class=None):
        """모드 테이블을 파싱합니다."""
        soup = BeautifulSoup(html, 'html.parser')
        
        current_mod_type = "prefix"
        
        # 전체 테이블 순회
        tables = soup.find_all('table')
        for table in tables:
            # 테이블 이전에 접미어 선언이 있는지 확인
            prev = table.find_previous(['h1', 'h2', 'h3', 'h4', 'th', 'td'])
            if prev:
                txt = prev.get_text().lower()
                if "suffix" in txt or "접미어" in txt:
                    current_mod_type = "suffix"
                elif "prefix" in txt or "접두어" in txt:
                    current_mod_type = "prefix"

            rows = table.find_all('tr')
            table_group_name_ko = ""
            table_group_name_en = ""

            for row in rows:
                cols = row.find_all(['td', 'th'])
                if not cols: continue
                
                raw_text = row.get_text()
                
                # 타입 감지 (행 내부)
                if "접미어" in raw_text or "Suffix" in raw_text:
                    current_mod_type = "suffix"
                    table_group_name_ko = ""
                    continue
                if "접두어" in raw_text or "Prefix" in raw_text:
                    current_mod_type = "prefix"
                    table_group_name_ko = ""
                    continue

                if len(cols) < 2 or len(raw_text) > 2000: continue
                
                # 헤더/가중치 설명 로우 제외
                if any(k in raw_text for k in ["아이템 레벨", "weight", "지역", "Weights"]):
                    # 여기서 그룹 이름 추출 시도 (가중치 행인 경우 보통 이름이 앞에 옴)
                    if len(cols) >= 2:
                        name_cell = cols[0]
                        table_group_name_ko = name_cell.get_text(strip=True)
                        link = name_cell.find('a')
                        table_group_name_en = link.get('title', table_group_name_ko) if link else table_group_name_ko
                    continue

                try:
                    # 데이터 로우 분석
                    name_cell = None
                    level_cell = None
                    values_cell = None
                    tier_num = 3
                    
                    # 수치가 포함된 셀 찾기 (보통 레벨/수치는 숫자를 포함)
                    numeric_cols = []
                    for i, c in enumerate(cols):
                        if re.search(r'\d+', c.get_text()):
                            numeric_cols.append(i)
                    
                    if not numeric_cols and len(cols) == 2:
                        # 숫자가 없는 2열은 그룹 헤더일 가능성이 높음
                        table_group_name_ko = cols[0].get_text(strip=True)
                        link = cols[0].find('a')
                        table_group_name_en = link.get('title', table_group_name_ko) if link else table_group_name_ko
                        continue

                    # 티어, 레벨, 값 추출 (가장 일반적인 순서)
                    if len(numeric_cols) >= 2:
                        # [티어?, 레벨, 값]
                        col0 = cols[0].get_text(strip=True)
                        if col0.isdigit() and len(cols) >= 3:
                            tier_num = int(col0)
                            level_cell = cols[1]
                            values_cell = cols[2]
                        else:
                            level_cell = cols[0]
                            values_cell = cols[1]
                    else:
                        continue

                    if not level_cell or not values_cell: continue

                    # 레벨 정제
                    level_text = level_cell.get_text(strip=True)
                    level_match = re.search(r'\d+', level_text)
                    if not level_match: continue
                    min_level = int(level_match.group())
                    
                    # 값 정제
                    values = values_cell.get_text(strip=True)
                    if not values or len(values) > 500: continue

                    # 이름 결정
                    # 1. 특정 이름 셀이 있는가? (보통 크롤러가 name_cell을 못찾은 상태)
                    name_ko = table_group_name_ko or values.split('\n')[0]
                    name_en = table_group_name_en or name_ko
                    
                    # 강력한 노이즈 필터링 (스킬 젬 및 시스템 텍스트 차단)
                    if len(re.findall(r'\(\d+\)', name_ko)) >= 2: continue
                    if len(name_ko) > 60: continue
                    forbidden_keywords = [
                        " 소환", " 보조", "의 전령", " 젬", 
                        "Item", "Jewel", "SanctumRelic", "Mod", "ItemClasses", "Pre/Suf"
                    ]
                    if any(k in name_ko for k in forbidden_keywords): continue
                    
                    # 이름 정제 - 안전하고 정갈하게
                    name_ko = name_ko.strip()
                    # 앞뒤의 무의미한 숫자 및 언더바 제거 (Wide 레이아웃 잔재)
                    name_ko = name_ko.lstrip('0123456789_ ')
                    name_ko = name_ko.rstrip('0123456789_ ')
                    # 기호 정제 (괄호 등)
                    name_ko = re.sub(r'\(.*?\)', '', name_ko).strip()
                    name_ko = re.sub(r'[^\w가-힣%]+$', '', name_ko).strip()
                    
                    # 헤더 잔재 제거 (핵심어 제외)
                    name_ko = re.sub(r'(아이템 레벨|지역|Weight|GlobalWeight)', '', name_ko).strip()
                    
                    if not name_ko or len(name_ko) < 2: 
                        # 만약 너무 많이 지워졌다면 values에서 첫 부분 추출
                        clean_val = re.sub(r'\(.*?\)', '', values).split('%')[0].split('+')[0].strip()
                        name_ko = re.sub(r'[^a-zA-Z가-힣\s]', '', clean_val).strip()
                    
                    if not name_ko: continue

                    name_en = name_en.strip()
                    name_en = name_en.lstrip('0123456789_ ')
                    name_en = name_en.rstrip('0123456789_ ')
                    name_en = re.sub(r'\(.*?\)', '', name_en).strip()
                    name_en = re.sub(r'(아이템 레벨|지역|Weight|GlobalWeight)', '', name_en).strip()

                    mod_type = current_mod_type
                    if name_ko.endswith('의') and mod_type == "prefix":
                        mod_type = "suffix"
                        
                    mod_data = {
                        "id": self.generate_mod_id(f"{name_en}_{min_level}_{mod_type}"),
                        "groupId": re.sub(r'[^a-zA-Z가-힣\s]', '', name_ko).strip().replace(" ", "_"),
                        "nameKo": name_ko,
                        "nameEn": name_en,
                        "type": mod_type,
                        "description": values,
                        "tier": tier_num,
                        "itemClasses": [item_class] if item_class else [],
                        "tags": self.extract_tags(values + " " + name_ko),
                        "minLevel": min_level,
                        "values": values
                    }
                    
                    if not any(m['id'] == mod_data['id'] for m in self.mods_data):
                        self.mods_data.append(mod_data)
                        
                except Exception:
                    continue
    
    def generate_mod_id(self, name_en):
        """모드 ID 생성 (영문명 기반)"""
        # 특수문자 제거 및 소문자로 변환
        mod_id = re.sub(r'[^a-zA-Z0-9_]', '_', name_en.lower())
        return mod_id.strip('_')
    
    def extract_tags(self, description):
        """설명에서 태그 추출"""
        tags = []
        
        tag_keywords = {
            "물리": ["물리", "Physical"],
            "화염": ["화염", "Fire"],
            "냉기": ["냉기", "Cold"],
            "번개": ["번개", "Lightning"],
            "카오스": ["카오스", "Chaos"],
            "원소": ["원소", "Elemental"],
            "공격": ["공격", "Attack"],
            "주문": ["주문", "Spell", "Cast"],
            "방어": ["방어", "Armour", "Evasion", "Shield"],
            "생명력": ["생명력", "Life"],
            "마나": ["마나", "Mana"],
            "에너지_보호막": ["에너지 보호막", "Energy Shield"],
            "저항": ["저항", "Resistance"],
            "속도": ["속도", "Speed", "Haste"],
            "치명타": ["치명타", "Critical"],
            "정확도": ["정확도", "Accuracy"],
            "능력치": ["힘", "민첩", "지능", "능력치", "Attribute"],
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in description for keyword in keywords):
                tags.append(tag)
        
        return tags
    
    def infer_tier(self, name_ko, name_en):
        """모드 이름에서 티어 추론"""
        # 고급 모드 이름들
        tier1_keywords = ["Dictator's", "Emperor's", "Tyrannical", "독재자", "황제"]
        tier2_keywords = ["Conqueror's", "Merciless", "정복자"]
        
        name_combined = f"{name_ko} {name_en}"
        
        for keyword in tier1_keywords:
            if keyword in name_combined:
                return 1
        
        for keyword in tier2_keywords:
            if keyword in name_combined:
                return 2
        
        return 3  # 기본 티어
    
    def crawl_all_item_classes(self):
        """모든 아이템 클래스의 모드를 크롤링합니다."""
        # 주요 아이템 클래스 목록
        item_classes = {
            "Bows": "kr/Bows#ModifiersCalc",
            "Crossbows": "kr/Crossbows#ModifiersCalc",
            "One Hand Maces": "kr/One_Hand_Maces#ModifiersCalc",
            "Two Hand Maces": "kr/Two_Hand_Maces#ModifiersCalc",
            "Spears": "kr/Spears#ModifiersCalc",
            "Body Armours": "kr/Body_Armours#ModifiersCalc",
            "Helmets": "kr/Helmets#ModifiersCalc",
            "Gloves": "kr/Gloves#ModifiersCalc",
            "Boots": "kr/Boots#ModifiersCalc",
            "Shields": "kr/Shields#ModifiersCalc",
            "Amulets": "kr/Amulets#ModifiersCalc",
            "Rings": "kr/Rings#ModifiersCalc",
            "Belts": "kr/Belts#ModifiersCalc",
            "Corrupted": "kr/Corrupted",
            "Essence": "kr/Essence",
            "Augment": "kr/Augment"
        }
        
        total = len(item_classes)
        for idx, (class_name, path) in enumerate(item_classes.items(), 1):
            print(f"[{idx}/{total}] Crawling {class_name}...")
            url = f"{self.base_url}/{path}"
            html = self.fetch_page(url)
            
            if html:
                self.parse_modifier_table(html, class_name)
                print(f"  ✓ Found {len(self.mods_data)} mods so far")
    
    def remove_duplicates(self):
        """중복 모드 제거 및 아이템 클래스 통합"""
        seen = {}
        unique_mods = []
        
        for mod in self.mods_data:
            # ID(이름+레벨+타입) 기준으로 중복 체크
            key = mod['id']
            if key not in seen:
                seen[key] = len(unique_mods)
                unique_mods.append(mod)
            else:
                # 이미 존재하는 모드면 itemClasses 만 병합
                existing_idx = seen[key]
                for item_class in mod['itemClasses']:
                    if item_class not in unique_mods[existing_idx]['itemClasses']:
                        unique_mods[existing_idx]['itemClasses'].append(item_class)
        
        self.mods_data = unique_mods
        print(f"Merged duplicates: {len(self.mods_data)} mods remaining")
    
    def save_to_json(self, output_path):
        """JSON 파일로 저장"""
        output = {
            "lastUpdated": datetime.now().isoformat(),
            "source": "poe2db.tw",
            "totalMods": len(self.mods_data),
            "mods": self.mods_data
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Saved {len(self.mods_data)} mods to {output_path}")


def main():
    print("=== POE2DB Mod Crawler ===\n")
    
    crawler = POE2DBModCrawler()
    
    # 모든 아이템 클래스 크롤링
    crawler.crawl_all_item_classes()
    
    # 중복 제거
    crawler.remove_duplicates()
    
    # JSON 저장
    output_path = "data/poe2-mods-database.json"
    crawler.save_to_json(output_path)
    
    print("\n=== Crawling Complete! ===")
    print(f"Total mods collected: {len(crawler.mods_data)}")


if __name__ == "__main__":
    main()
