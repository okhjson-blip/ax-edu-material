# 교육 컨텐츠 사이트

카테고리 카드 → 로컬 HTML 페이지. DB 없이 `content/` 파일을 사용합니다.

## 로컬 실행

```bash
copy .env.example .env.local
npm install
npm run dev
```

`.env.local`의 `ADMIN_PASSWORD`를 설정한 뒤 http://localhost:3000 과 `/admin` 을 확인합니다.

## 컨텐츠 추가

1. `npm run dev`로 관리자에 로그인합니다.
2. HTML·커버를 등록하면 `content/categories/{slug}/` 와 `content/registry.json`이 갱신됩니다.
3. GitHub에 commit/push하면 Vercel 배포에 반영됩니다.

배포 환경에서는 파일 쓰기가 유지되지 않으므로, 저장은 로컬에서만 하세요.

## Vercel

1. GitHub 저장소에 push합니다.
2. Vercel에서 Import 후 Framework: Next.js.
3. Environment Variable에 `ADMIN_PASSWORD`를 등록합니다.
