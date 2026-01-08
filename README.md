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

## 문서

- [CHANGELOG.md](./CHANGELOG.md) - 버전별 주요 변경사항
- [WORKLOG.md](./WORKLOG.md) - 일일 작업 로그 (개발자용)

## 기술 스택

- [Next.js](https://nextjs.org/) - React 프레임워크
- React - UI 라이브러리

## 라이선스

이 프로젝트의 라이선스 정보를 여기에 추가하세요.
