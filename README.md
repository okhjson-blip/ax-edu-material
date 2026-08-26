# AX 교육 컨텐츠 사이트

삼성전자 상생아카데미 컨설팅센터용 교육 자료 웹사이트입니다.  
DB 없이 로컬 HTML·이미지 파일을 카드 형태로 제공합니다.

- **스택**: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- **인증**: 사이트 전체 비밀번호 게이트 (관리자 UI 없음)
- **기본 비밀번호**: `ax2026h2`

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 접속 인증 | 미인증 시 `/login`으로 이동. 안내 문구 + 비밀번호 입력 |
| 홈 카드 그리드 | `content/registry.json` 기준 카테고리 카드 표시 |
| HTML 뷰어 | `/c/[slug]`에서 iframe으로 교육 HTML 표시 |
| 정적 자산 | HTML 내 상대 경로 이미지는 `public/contents/`로 서빙 |

로그인 안내 문구:

> 해당 사이트는 삼성전자 상생아카데미 컨설팅센터 소속 컨설턴트 및 관련 협력사 임직원만 접속할 수 있습니다

인증 성공 시 `edu_access` 쿠키(HttpOnly, 7일)가 발급됩니다.

---

## 로컬 실행

```bash
# Windows
copy .env.example .env.local

npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 비밀번호 `ax2026h2` 입력.

### 프로덕션 모드 (로컬)

```bash
npm run build
npm start
# 또는 포트 지정
npx next start -p 3001
```

---

## 환경 변수

`.env.local` 예시:

```env
SITE_PASSWORD=ax2026h2
# SESSION_SECRET=임의-긴-문자열
```

| 변수 | 필수 | 설명 |
|------|------|------|
| `SITE_PASSWORD` | 선택 | 접속 비밀번호. 미설정 시 코드 기본값 `ax2026h2` |
| `SESSION_SECRET` | 선택 | 세션 토큰 HMAC 키. 미설정 시 `SITE_PASSWORD` 사용 |

---

## 프로젝트 구조

```
ax-edu-merterial/
├── app/
│   ├── page.tsx              # 홈 (카드 그리드)
│   ├── layout.tsx
│   ├── login/                # 접속 비밀번호 화면
│   └── c/[slug]/             # HTML 뷰어 + raw/cover API
├── content/
│   ├── registry.json         # 카테고리 목록 (단일 소스)
│   └── categories/{slug}/    # 커버 이미지 (cover.jpg 등)
├── contents/                 # 교육 HTML 및 HTML 내 이미지 폴더
├── public/
│   ├── home-bg.jpg           # 홈 배경
│   ├── covers/               # 카드 커버 (빌드/동기화본)
│   └── contents/             # HTML용 이미지 (sync 스크립트 결과)
├── lib/
│   ├── auth.ts               # 비밀번호·세션 쿠키
│   ├── content.ts            # registry/HTML/커버 읽기
│   └── types.ts
├── scripts/
│   ├── sync-content-assets.mjs   # contents/*_image → public/contents
│   └── optimize-images.mjs
├── proxy.ts                  # 사이트 전역 접속 인증 (Next.js Proxy)
└── next.config.ts
```

### 주요 라우트

| 경로 | 설명 |
|------|------|
| `/login` | 접속 확인 (인증 불필요) |
| `/` | 홈 카드 목록 |
| `/c/[slug]` | 카테고리 HTML 뷰어 |
| `/c/[slug]/raw` | HTML 원문 응답 |
| `/c/[slug]/cover` | 커버 이미지 응답 |

정적 파일(`/_next/*`, 이미지 확장자 등)은 인증 대상에서 제외됩니다.

---

## 컨텐츠 추가·수정

관리자 화면은 없습니다. 파일을 직접 수정한 뒤 Git에 push합니다.

### 1. HTML 추가

`contents/`에 HTML 파일을 둡니다.  
예: `contents/my_guide.html`

HTML에서 참조하는 이미지 폴더가 있으면 같은 `contents/` 아래에 두고,  
`scripts/sync-content-assets.mjs`의 `IMAGE_DIRS`에 폴더명을 추가합니다.

### 2. 커버 이미지

```
content/categories/{slug}/cover.jpg   # 또는 .png 등
```

필요 시 `public/covers/{slug}/`에도 동일 파일을 맞춰 둡니다.

### 3. 레지스트리 등록

`content/registry.json`에 항목을 추가합니다.

```json
{
  "slug": "my-guide",
  "title": "가이드 제목",
  "description": "카드에 보일 설명",
  "cover": "cover.jpg",
  "htmlFile": "contents/my_guide.html",
  "showCaption": true
}
```

| 필드 | 설명 |
|------|------|
| `slug` | URL용 ID (`/c/my-guide`). 영문 소문자·숫자·하이픈 |
| `title` | 카드·페이지 제목 |
| `description` | 카드 부제 (빈 문자열 가능) |
| `cover` | `content/categories/{slug}/` 안 파일명 |
| `htmlFile` | `contents/` 기준 HTML 경로 |
| `showCaption` | `false`면 카드 위 제목/설명 오버레이 숨김 |

### 4. 반영

```bash
npm run sync:assets   # HTML용 이미지 public 동기화
npm run build         # 배포 전 확인 (prebuild에서 sync 자동 실행)
```

커밋 후 push하면 Vercel 배포에 반영됩니다.

---

## npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 자산 sync 후 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |
| `npm run sync:assets` | `contents/*_image` → `public/contents` |
| `npm run optimize:images` | 이미지 최적화 후 sync |
| `npm run lint` | ESLint |

---

## Vercel 배포

1. GitHub 저장소에 push합니다.
2. Vercel에서 Import → Framework: **Next.js**.
3. (권장) Environment Variables:
   - `SITE_PASSWORD` — 접속 비밀번호
   - `SESSION_SECRET` — 세션 서명용 임의 문자열

배포 환경에서는 파일 시스템이 유지되지 않으므로, **컨텐츠 변경은 로컬에서 파일 수정 → Git push**로만 반영합니다.

---

## 보안 참고

- 비밀번호는 공유용 단순 게이트이며, 계정·역할 기반 인증이 아닙니다.
- 운영에서는 `SITE_PASSWORD` / `SESSION_SECRET`을 환경변수로 관리하세요.
- 비밀번호를 바꾼 뒤에는 기존 `edu_access` 쿠키가 무효화될 수 있도록 `SESSION_SECRET`도 함께 바꾸는 것을 권장합니다.
