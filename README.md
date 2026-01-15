# Reim - 아이템 필터 생성기

Path of Exile 2 및 기타 게임을 위한 아이템 필터 생성 및 관리 도구입니다.

## 주요 기능

- 🎯 **빠른 설정**: 직관적인 UI로 아이템 필터 규칙을 쉽게 설정
- 📊 **티어 리스트**: 화폐, 장비, 유니크 등을 S~E 티어로 분류하여 관리
- 🎨 **커스터마이징**: 색상, 폰트, 효과 등 다양한 스타일 설정
- 💾 **프리셋 관리**: 자주 사용하는 설정을 프리셋으로 저장
- 🔍 **미리보기**: 생성된 필터 코드를 미리 확인

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
app/
  ├── poe2/              # Path of Exile 2 관련 페이지
  │   └── item-filter/   # 아이템 필터 기능
  ├── components/        # 재사용 가능한 컴포넌트
  └── ...

data/                    # 게임 데이터 (화폐, 장비, 번역 등)
lib/                     # 유틸리티 함수
scripts/                 # 데이터 처리 스크립트
```

## 수익화 및 성장 전략

### 💰 수익화

이 프로젝트는 다음과 같은 수익화 방법을 구현하고 있습니다:

1. **Google AdSense** - 광고 수익 (구현 완료)
2. **Google Analytics 4** - 트래픽 분석 (구현 완료)
3. **프리미엄 기능** (향후 계획)
4. **후원 시스템** (향후 계획)

**환경 변수 설정:**
```bash
# .env.local 파일 생성
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 📈 SEO 최적화

- ✅ 메타 태그 최적화 완료
- ✅ 사이트맵 자동 생성 (`/sitemap.xml`)
- ✅ robots.txt 설정 완료
- ✅ Open Graph 태그 설정

### ⚡ 성능 최적화

자세한 내용은 [PERFORMANCE.md](./PERFORMANCE.md) 참조

### 🎮 다중 게임 지원

현재 Path of Exile 2를 지원하며, 다음 게임으로 확장 계획:

- Path of Exile (PoE1) - 우선순위 높음
- World of Warcraft
- Last Epoch
- Once Human

자세한 로드맵은 [MULTI_GAME_ROADMAP.md](./MULTI_GAME_ROADMAP.md) 참조

### 👥 커뮤니티 기능

향후 커뮤니티 기능 강화 계획:

- 필터 공유 시스템
- 사용자 인증
- 댓글 및 좋아요
- 실시간 채팅

자세한 로드맵은 [COMMUNITY_ROADMAP.md](./COMMUNITY_ROADMAP.md) 참조

## 문서

### 기본 문서
- [CHANGELOG.md](./CHANGELOG.md) - 버전별 주요 변경사항
- [WORKLOG.md](./WORKLOG.md) - 일일 작업 로그 (개발자용)

### 전략 문서
- [PERFORMANCE.md](./PERFORMANCE.md) - 성능 최적화 가이드
- [COMMUNITY_ROADMAP.md](./COMMUNITY_ROADMAP.md) - 커뮤니티 기능 로드맵
- [MULTI_GAME_ROADMAP.md](./MULTI_GAME_ROADMAP.md) - 다중 게임 지원 로드맵

## 기술 스택

- [Next.js 14](https://nextjs.org/) - React 프레임워크 (App Router)
- React 18 - UI 라이브러리
- Google AdSense - 광고 시스템
- Google Analytics 4 - 분석 도구

## 배포

### 정적 빌드
```bash
npm run build
```

빌드된 파일은 `out/` 디렉토리에 생성되며, 정적 호스팅 서비스에 배포할 수 있습니다:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 다음 단계

### 즉시 수행
1. **Google AdSense 계정 신청**: https://www.google.com/adsense
2. **Google Analytics 4 설정**: https://analytics.google.com/
3. **.env.local 파일 생성** 및 환경 변수 설정
4. **AdSense 광고 슬롯 ID** 업데이트 (layout.js, AdBanner.js)

### 단기 목표 (1-2개월)
1. PoE1 아이템 필터 생성기 구현
2. 각 게임별 기본 가이드 5-10개 작성
3. SEO 최적화 및 트래픽 모니터링
4. 커뮤니티 베타 테스트

### 중기 목표 (3-6개월)
1. Supabase 연동 및 사용자 인증
2. 필터 공유 시스템 구현
3. Last Epoch 지원
4. 프리미엄 기능 개발

### 장기 목표 (6개월+)
1. 모든 게임 완전 지원
2. 월 방문자 10,000명 달성
3. 월 수익 500만원 달성
4. 모바일 앱 개발 고려

## 트래픽 증대 전략

1. **콘텐츠 마케팅**
   - YouTube 가이드 제작
   - Reddit, Discord 커뮤니티 참여
   - 게임 공식 포럼 활동

2. **SEO 최적화**
   - 키워드 타겟팅 (poe2 filter, wow weakauras 등)
   - 백링크 구축
   - 정기적인 콘텐츠 업데이트

3. **인플루언서 협업**
   - 게임 스트리머에게 필터 제공
   - 스폰서십 제안

## 라이선스

이 프로젝트의 라이선스 정보를 여기에 추가하세요.
