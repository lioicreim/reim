# 커뮤니티 기능 강화 로드맵

현재 커뮤니티 페이지는 UI만 구현되어 있고, mock 데이터를 사용하고 있습니다. 실제 커뮤니티 기능을 구현하기 위한 로드맵입니다.

## 현재 상태

### 구현된 기능
- ✅ 커뮤니티 UI (게시글 목록, 말머리, 검색)
- ✅ 게시글 작성 UI (`/poe2/community/write`)
- ✅ 카테고리 필터링 UI
- ✅ 페이지네이션 UI

### 미구현 기능
- ❌ 실제 데이터베이스 연동
- ❌ 사용자 인증 시스템
- ❌ 게시글 CRUD API
- ❌ 댓글 시스템
- ❌ 좋아요/추천 시스템
- ❌ 필터 공유 기능

## Phase 1: 백엔드 인프라 구축

### 1.1 데이터베이스 선택 및 설정

**권장 옵션:**

#### Option A: Supabase (추천)
```bash
npm install @supabase/supabase-js
```

**장점:**
- 무료 티어 제공
- PostgreSQL 기반
- 실시간 기능 내장
- 인증 시스템 내장
- Storage 포함

**설정:**
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### Option B: Firebase
```bash
npm install firebase
```

**장점:**
- Google 생태계
- Firestore (NoSQL)
- 무료 티어
- 인증 시스템 강력

#### Option C: MongoDB Atlas + Next.js API Routes
```bash
npm install mongodb mongoose
```

**장점:**
- 유연한 스키마
- 무료 티어
- 자체 API 구축 가능

### 1.2 데이터베이스 스키마

```sql
-- Supabase/PostgreSQL 예시

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);

-- 게시글 테이블
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_id TEXT NOT NULL, -- 'poe2', 'wow', etc.
  category TEXT NOT NULL, -- 'general', 'question', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_best BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 좋아요 테이블
CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 필터 공유 테이블
CREATE TABLE shared_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  game_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  filter_data JSONB NOT NULL, -- 필터 설정 JSON
  preset TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Phase 2: 사용자 인증 시스템

### 2.1 인증 방법 선택

**Option A: Supabase Auth (추천)**
- 이메일/비밀번호
- 소셜 로그인 (Google, Discord, GitHub)
- Magic Link

**Option B: NextAuth.js**
```bash
npm install next-auth
```

### 2.2 인증 컴포넌트 구현

```jsx
// app/components/AuthProvider.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변화 리스닝
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
```

## Phase 3: 필터 공유 기능

### 3.1 필터 공유 UI

```jsx
// app/components/FilterShareButton.js
export default function FilterShareButton({ filterData, preset }) {
  const { user } = useAuth()
  
  const handleShare = async () => {
    if (!user) {
      // 로그인 모달 표시
      return
    }
    
    const { data, error } = await supabase
      .from('shared_filters')
      .insert({
        user_id: user.id,
        game_id: 'poe2',
        title: '내 필터',
        description: '설명',
        filter_data: filterData,
        preset: preset,
      })
    
    if (error) {
      console.error('Error sharing filter:', error)
      return
    }
    
    // 성공 알림
    alert('필터가 공유되었습니다!')
  }
  
  return (
    <button onClick={handleShare}>필터 공유하기</button>
  )
}
```

### 3.2 공유된 필터 목록 페이지

```jsx
// app/poe2/community/filters/page.js
export default function SharedFiltersPage() {
  const [filters, setFilters] = useState([])
  
  useEffect(() => {
    loadFilters()
  }, [])
  
  const loadFilters = async () => {
    const { data, error } = await supabase
      .from('shared_filters')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setFilters(data)
  }
  
  return (
    <div>
      <h1>공유된 필터</h1>
      {filters.map(filter => (
        <FilterCard key={filter.id} filter={filter} />
      ))}
    </div>
  )
}
```

## Phase 4: 실시간 기능

### 4.1 실시간 댓글
```jsx
// Supabase Realtime 사용
const channel = supabase
  .channel('comments')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'comments' },
    (payload) => {
      // 새 댓글 추가
      setComments([...comments, payload.new])
    }
  )
  .subscribe()
```

### 4.2 온라인 사용자 수
```jsx
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: user.id,
    },
  },
})

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  setOnlineUsers(Object.keys(state).length)
})
```

## Phase 5: 수익화 연동

### 5.1 프리미엄 기능
- 광고 제거
- 무제한 필터 저장
- 커스텀 아바타
- 배지 시스템

### 5.2 결제 시스템
```bash
npm install stripe @stripe/stripe-js
```

## 구현 우선순위

1. **즉시 구현 (Week 1-2)**
   - [ ] Supabase 프로젝트 생성
   - [ ] 기본 스키마 구축
   - [ ] 인증 시스템 구현

2. **단기 구현 (Week 3-4)**
   - [ ] 게시글 CRUD API
   - [ ] 필터 공유 기능
   - [ ] 댓글 시스템

3. **중기 구현 (Month 2-3)**
   - [ ] 실시간 기능
   - [ ] 알림 시스템
   - [ ] 검색 최적화

4. **장기 구현 (Month 4+)**
   - [ ] 프리미엄 기능
   - [ ] 결제 시스템
   - [ ] 관리자 대시보드

## 예상 비용

### Supabase (추천)
- **무료 티어**: 500MB 데이터베이스, 1GB 파일 저장소, 50,000 월간 활성 사용자
- **Pro ($25/월)**: 8GB 데이터베이스, 100GB 저장소, 무제한 API 요청
- **초기에는 무료 티어로 충분**

### Firebase
- **무료 티어**: Firestore 1GB, 10GB 다운로드/월
- **Blaze (사용량 기반)**: $0.18/GB 스토리지

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Next.js + Supabase 튜토리얼](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Firebase 문서](https://firebase.google.com/docs)
- [NextAuth.js 문서](https://next-auth.js.org/)
