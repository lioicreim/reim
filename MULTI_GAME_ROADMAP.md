# 다중 게임 지원 확대 로드맵

REIM을 Path of Exile 2 중심에서 다중 게임 플랫폼으로 확장하기 위한 로드맵입니다.

## 현재 지원 게임

### 완전 지원
- ✅ **Path of Exile 2** - 아이템 필터 생성기, 티어 리스트, 커뮤니티

### 기본 페이지만 존재
- 🟡 **Path of Exile** (`/poe1`)
- 🟡 **World of Warcraft** (`/wow`)
- 🟡 **Last Epoch** (`/last-epoch`)
- 🟡 **Once Human** (`/once-human`)
- 🟡 **Fellowship** (`/fellowship`)

## Path of Exile (PoE1) 지원 확대

### Phase 1: 아이템 필터 생성기 (Priority: High)

PoE2의 필터 생성기를 PoE1에도 적용하되, 차이점 반영:

**PoE1 vs PoE2 차이점:**
- 화폐 아이템 목록 다름
- 베이스 아이템 목록 다름
- 필터 문법은 거의 동일
- Rune 시스템 없음 (PoE2 전용)

**구현 방법:**
```javascript
// data/poe1-currency.json 생성
// data/poe1-bases.json 생성
// lib/filter-generator.js에 버전 파라미터 추가

export function generateFilterCode(options, version = 'poe2') {
  if (version === 'poe1') {
    // PoE1 전용 로직
  } else {
    // PoE2 로직
  }
}
```

**필요한 데이터:**
- PoE1 화폐 아이템 목록
- PoE1 베이스 아이템 목록
- PoE1 티어 리스트
- PoE1 유니크 아이템 목록

### Phase 2: 가이드 및 빌드 (Priority: Medium)

- 인기 빌드 가이드
- 레벨링 가이드
- 메카닉 설명
- 시즌별 리그 정보

### Phase 3: 커뮤니티 (Priority: High)

- PoE1 전용 게시판
- 필터 공유
- 빌드 공유

## World of Warcraft 지원

### Phase 1: WeakAuras 관리 (Priority: High)

WoW의 "아이템 필터"에 해당하는 것이 WeakAuras:

**기능:**
- WeakAuras 템플릿 제공
- 클래스별 WeakAuras
- 레이드/던전별 WeakAuras
- WeakAuras 공유 커뮤니티

**기술 스택:**
- WeakAuras 문법 파서
- 템플릿 생성기
- 미리보기 기능

### Phase 2: 애드온 관리 (Priority: Medium)

- 추천 애드온 목록
- 설정 가이드
- 업데이트 알림

### Phase 3: 가이드 (Priority: High)

- 클래스별 가이드
- 레이드 공략
- M+ 공략
- PvP 가이드

### Phase 4: 커뮤니티 (Priority: Medium)

- WoW 전용 게시판
- 길드 모집
- 파티 모집

## Last Epoch 지원

### Phase 1: 아이템 필터 (Priority: High)

Last Epoch도 아이템 필터 시스템 존재:

**Last Epoch 필터 특징:**
- XML 기반 필터
- PoE와 유사하지만 문법 다름
- 색상, 사운드, 아이콘 커스터마이징

**구현:**
```javascript
// lib/last-epoch-filter-generator.js
export function generateLastEpochFilter(options) {
  // XML 형식으로 필터 생성
  return `<?xml version="1.0"?>
<ItemFilterList>
  <Filter>
    ...
  </Filter>
</ItemFilterList>`
}
```

### Phase 2: 빌드 플래너 (Priority: Medium)

- 스킬 트리 시뮬레이터
- 장비 계산기
- DPS 계산기

### Phase 3: 가이드 (Priority: High)

- 클래스별 빌드 가이드
- 레벨링 가이드
- 엔드게임 가이드

## Once Human 지원

### Phase 1: 베이스 빌딩 가이드 (Priority: High)

Once Human은 서바이벌 게임:

**기능:**
- 베이스 설계 도구
- 자원 계산기
- 제작 가이드

### Phase 2: 장비 가이드 (Priority: Medium)

- 무기 티어 리스트
- 방어구 가이드
- 제작 레시피

### Phase 3: 서버 및 커뮤니티 (Priority: High)

- 서버 목록
- 길드 모집
- 트레이딩

## 구현 우선순위 (트래픽 증대 관점)

### 단기 (1-2개월)
1. **PoE1 아이템 필터** (PoE2 코드 재사용 가능, 트래픽 증대 효과 큼)
   - PoE1 데이터 수집
   - 필터 생성기 적용
   - SEO 최적화

2. **모든 게임 가이드 섹션** (콘텐츠 작성 쉬움, SEO 효과 큼)
   - 기본 가이드 템플릿 작성
   - 각 게임별 5-10개 가이드 작성

### 중기 (3-6개월)
3. **Last Epoch 아이템 필터**
   - 새로운 필터 생성기 구현
   - 커뮤니티 구축

4. **WoW WeakAuras 관리**
   - WeakAuras 파서 구현
   - 템플릿 제공

### 장기 (6개월+)
5. **Once Human 도구**
   - 게임 특화 기능 개발

6. **모든 게임 커뮤니티 활성화**
   - 게시판 통합
   - 크로스 게임 기능

## 트래픽 증대 전략

### 1. SEO 키워드 타겟팅

**PoE1:**
- "path of exile item filter"
- "poe loot filter generator"
- "poe filter maker"

**WoW:**
- "wow weakauras"
- "world of warcraft addons"
- "wow m+ guide"

**Last Epoch:**
- "last epoch loot filter"
- "last epoch build guide"
- "last epoch filter maker"

**Once Human:**
- "once human guide"
- "once human base building"
- "once human crafting guide"

### 2. 콘텐츠 마케팅

각 게임별:
- YouTube 가이드 제작
- Reddit 커뮤니티 참여
- Discord 서버 운영
- 게임 공식 포럼 참여

### 3. 인플루언서 협업

- 각 게임 스트리머와 협업
- 필터/도구 무료 제공
- 스폰서십 고려

## 데이터 수집 방법

### PoE1
- [poe.ninja](https://poe.ninja/) API
- [pathofexile.com](https://www.pathofexile.com/trade) 공식 트레이드 API
- Community 데이터 크롤링

### WoW
- [Wowhead](https://www.wowhead.com/) API
- [Raider.IO](https://raider.io/) API
- Blizzard API

### Last Epoch
- [Last Epoch Tools](https://www.lastepochtools.com/)
- Community 데이터

### Once Human
- 게임 데이터 추출 (합법적인 방법)
- Community 데이터

## 기술적 고려사항

### 1. 코드 재사용
```javascript
// lib/filter-generator/index.js
export function generateFilter(game, options) {
  switch(game) {
    case 'poe2':
      return generatePoE2Filter(options)
    case 'poe1':
      return generatePoE1Filter(options)
    case 'last-epoch':
      return generateLastEpochFilter(options)
    default:
      throw new Error(`Unsupported game: ${game}`)
  }
}
```

### 2. 게임별 데이터 관리
```
data/
  poe2/
    currency.json
    bases.json
    tiers.json
  poe1/
    currency.json
    bases.json
    tiers.json
  wow/
    weakauras.json
    addons.json
  last-epoch/
    filters.json
    items.json
  once-human/
    items.json
    recipes.json
```

### 3. URL 구조
```
/poe2/item-filter - PoE2 필터
/poe1/item-filter - PoE1 필터
/wow/weakauras - WoW WeakAuras
/last-epoch/item-filter - Last Epoch 필터
/once-human/guides - Once Human 가이드
```

## 예상 효과

### 트래픽 증대
- PoE1 지원: +50% 트래픽 (PoE1 유저 > PoE2 유저)
- WoW 지원: +100% 트래픽 (WoW는 매우 큰 커뮤니티)
- Last Epoch: +30% 트래픽
- Once Human: +20% 트래픽

### 수익 증대
- 광고 노출 증가
- 더 다양한 사용자층
- 크로스 게임 시너지

## 다음 단계

1. **즉시 시작**
   - [ ] PoE1 데이터 수집 스크립트 작성
   - [ ] PoE1 필터 생성기 구현
   - [ ] 각 게임별 기본 가이드 5개씩 작성

2. **1개월 내**
   - [ ] PoE1 페이지 완성
   - [ ] 모든 게임 가이드 섹션 오픈
   - [ ] SEO 최적화

3. **3개월 내**
   - [ ] Last Epoch 필터 생성기
   - [ ] WoW WeakAuras 기본 기능
   - [ ] 커뮤니티 활성화
