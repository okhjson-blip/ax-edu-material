# AX Edu Material

삼성전자 상생아카데미 컨설팅센터용 교육 컨텐츠 사이트입니다.  
홈의 카테고리 카드 → `contents/` HTML 교육 자료를 iframe으로 제공합니다.

- **프레임워크:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **데이터:** DB 없음. `content/registry.json` + `contents/*.html` 파일 기반
- **배포:** Vercel 권장

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 접속 비밀번호 | 미인증 사용자는 `/login`으로 이동. 기본 비밀번호 `ax2026h2` |
| 홈 카드 | `registry.json`의 카테고리를 카드로 표시 |
| 컨텐츠 뷰어 | `/c/[slug]`에서 HTML을 iframe으로 표시 |
| 이미지 배포 | HTML 내 상대 경로 이미지를 `public/contents/` 정적 파일로 제공 |

관리자 UI는 없습니다. 컨텐츠 추가는 로컬에서 파일을 수정한 뒤 Git push로 반영합니다.

---

## 로컬 실행

```bash
copy .env.example .env.local
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속 후 비밀번호를 입력합니다.

### 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `SITE_PASSWORD` | 권장 | 사이트 접속 비밀번호. 미설정 시 `ax2026h2` |
| `SESSION_SECRET` | 선택 | 접속 쿠키 서명용. 미설정 시 `SITE_PASSWORD` 사용 |

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 이미지 동기화(`prebuild`) 후 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run sync:assets` | `contents/*_image` → `public/contents/` 복사 |
| `npm run optimize:images` | 큰 이미지 리사이즈·압축 후 에셋 동기화 |
| `npm run lint` | ESLint |

---

## 디렉터리 구조

```
ax-edu-material/
├── app/
│   ├── page.tsx              # 홈 (카드 목록)
│   ├── login/                # 접속 비밀번호 화면
│   └── c/[slug]/             # 카테고리 뷰어 + raw HTML 라우트
├── content/
│   ├── registry.json         # 카테고리 메타 (슬러그, 제목, 커버, HTML 경로)
│   └── categories/           # 커버 이미지 원본
├── contents/                 # 교육 HTML + 이미지 폴더 (*_image)
├── public/
│   ├── covers/               # 홈 카드용 커버 (배포용)
│   ├── contents/             # HTML 삽입 이미지 (배포용 정적 파일)
│   └── home-bg.jpg           # 홈 배경
├── lib/
│   ├── auth.ts               # 비밀번호·세션 쿠키
│   ├── content.ts            # registry / HTML 읽기, base 경로 주입
│   └── types.ts
├── scripts/
│   ├── sync-content-assets.mjs
│   └── optimize-images.mjs
└── proxy.ts                  # 전역 접속 가드 (Next.js proxy)
```

---

## 컨텐츠 구성

### 등록 목록 (`content/registry.json`)

각 항목 예시:

```json
{
  "slug": "claude",
  "title": "Claude Code",
  "description": "",
  "cover": "cover.png",
  "htmlFile": "contents/Claude_Code.html",
  "showCaption": true
}
```

| 필드 | 설명 |
|------|------|
| `slug` | URL `/c/{slug}` |
| `title` / `description` | 카드 캡션 (`showCaption: false`면 숨김) |
| `cover` | `content/categories/{slug}/` 및 `public/covers/{slug}/` 파일명 |
| `htmlFile` | `contents/` 아래 HTML 경로 |

### 현재 카테고리

| 슬러그 | HTML |
|--------|------|
| `ax-paradigm` | `contents/ax_paradigm.html` |
| `ax-framework` | `contents/ax_framework.html` |
| `vibe-coding` | `contents/vibe_coding.html` |
| `gemini-cursor` | `contents/Gemini_Antigravity_Cursor.html` |
| `chatgpt-codex` | `contents/ChatGPT_Work_Codex.html` |
| `claude` | `contents/Claude_Code.html` |
| `case-study-2026h1` | `contents/case_26h1.html` |

### HTML·이미지 규칙

1. HTML은 `contents/`에 두고 `registry.json`의 `htmlFile`로 연결합니다.
2. 이미지 폴더는 HTML과 같은 상대 경로로 둡니다.  
   예: `G_A_C_image/`, `ChatGPT_Work_Codex_image/`, `Claude_image/`
3. 빌드 시 `sync:assets`가 `public/contents/`로 복사합니다.
4. `/c/[slug]/raw` 응답에 `<base href="/contents/">`를 넣어 상대 경로가 Vercel에서도 동작합니다.

---

## 컨텐츠 추가·수정 절차

1. `contents/`에 HTML(및 필요 시 `*_image` 폴더)을 추가·수정합니다.
2. 커버는 `content/categories/{slug}/cover.png|jpg`에 넣습니다.
3. `content/registry.json`에 항목을 추가하거나 수정합니다.
4. 이미지가 크면 `npm run optimize:images`를 실행합니다.
5. `npm run sync:assets`로 `public/`을 맞춥니다. (`build` 시 `prebuild`로도 실행됨)
6. commit / push → Vercel 배포에 반영됩니다.

프로덕션(Vercel)에서는 파일 시스템 쓰기가 유지되지 않으므로, 컨텐츠 변경은 항상 로컬 + Git으로 합니다.

---

## Vercel 배포

1. GitHub(또는 GitLab)에 저장소를 push합니다.
2. Vercel에서 Import → Framework: **Next.js**.
3. Environment Variables에 등록합니다.
   - `SITE_PASSWORD` = 접속 비밀번호
   - (선택) `SESSION_SECRET` = 쿠키 서명 시크릿
4. Deploy 후 사이트 접속 → 로그인 화면에서 비밀번호 입력.

배포에 반드시 포함해야 하는 경로:

- `contents/**` (HTML)
- `public/contents/**` (본문 이미지)
- `public/covers/**` (카드 커버)
- `content/registry.json`

---

## 접속·보안

- 안내 문구:  
  «해당 사이트는 삼성전자 상생아카데미 컨설팅센터 소속 컨설턴트 및 관련 협력사 임직원만 접속할 수 있습니다»
- 인증 쿠키: `edu_access` (HttpOnly, 7일)
- `/login`과 Next 정적 리소스만 가드 제외

---

## 기술 메모

- Next.js 16에서는 request 가드가 `middleware.ts` 대신 루트 `proxy.ts`의 `proxy()`입니다.
- React Compiler(`reactCompiler: true`)를 사용합니다.
- `outputFileTracingIncludes`로 `contents/*.html`과 `registry.json`을 서버 번들에 포함합니다.
