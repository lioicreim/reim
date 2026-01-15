# 성능 최적화 가이드

이 문서는 REIM 웹사이트의 성능을 최적화하기 위한 가이드입니다.

## 이미 적용된 최적화

### 1. Next.js 정적 빌드
- `output: "export"` 설정으로 정적 HTML 생성
- CDN을 통한 빠른 배포 가능
- 서버 비용 절감

### 2. 이미지 최적화
- **권장사항**: `next/image` 컴포넌트 사용
- 외부 이미지 도메인 (poe2db) 설정 완료
- Lazy loading 자동 적용

### 3. 컴파일 최적화
- 프로덕션 빌드에서 console.log 제거
- 번들 크기 최적화

## Core Web Vitals 개선 방법

### 1. LCP (Largest Contentful Paint) 개선
**목표**: 2.5초 이내

**현재 상황**:
- 주요 콘텐츠: 아이템 필터 리스트, 티어 리스트

**개선 방법**:
```jsx
// ❌ 나쁜 예
<img src="/images/large-image.png" />

// ✅ 좋은 예
import Image from 'next/image';
<Image 
  src="/images/large-image.png" 
  width={1200} 
  height={630}
  priority // 중요한 이미지에는 priority 추가
  alt="설명"
/>
```

### 2. FID (First Input Delay) 개선
**목표**: 100ms 이내

**개선 방법**:
- 무거운 JavaScript 분할 로딩
- React.lazy()와 Suspense 사용
```jsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>로딩 중...</p>,
});
```

### 3. CLS (Cumulative Layout Shift) 개선
**목표**: 0.1 이하

**개선 방법**:
- 이미지에 width/height 명시
- 폰트 로딩 최적화
- 광고 공간 미리 확보

```jsx
// 광고 공간 미리 확보
<div style={{ minHeight: '250px' }}>
  <AdBanner />
</div>
```

## 추가 최적화 권장사항

### 1. 폰트 최적화
```jsx
// app/layout.js
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});
```

### 2. 데이터 로딩 최적화
- localStorage 데이터 lazy loading
- 필요한 데이터만 로드
- useMemo, useCallback 활용

### 3. 번들 크기 최적화
```bash
# 번들 분석
npm run build
npm install -D @next/bundle-analyzer
```

### 4. 캐싱 전략
- 정적 파일: Cache-Control: public, max-age=31536000, immutable
- HTML: Cache-Control: public, max-age=3600, must-revalidate

## 성능 측정 도구

### 1. Lighthouse
```bash
# Chrome DevTools > Lighthouse 탭
# 또는 CLI
npm install -g lighthouse
lighthouse https://reim.kr --view
```

### 2. Web Vitals
```jsx
// app/layout.js에 추가
import { Analytics } from '@vercel/analytics/react';
<Analytics />
```

### 3. Google PageSpeed Insights
https://pagespeed.web.dev/

## 체크리스트

- [ ] 모든 이미지에 width/height 속성 추가
- [ ] 중요한 이미지에 priority 속성 추가
- [ ] 무거운 컴포넌트 동적 import
- [ ] localStorage 데이터 lazy loading
- [ ] 폰트 최적화 (next/font/google 사용)
- [ ] 번들 크기 분석 및 최적화
- [ ] Lighthouse 점수 90점 이상 달성
- [ ] Core Web Vitals 모든 지표 green
- [ ] 모바일 성능 테스트
- [ ] 느린 네트워크 환경 테스트

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
