# 들어가기 앞서

본 프로젝트는 “AI가 구현하고 인간이 설계한다”는 아키텍처 철학을 중심으로 구축되었습니다.  
모든 기능은 AI가 자동으로 생성·개선할 수 있도록 모듈화·계약 기반 설계·테스트 우선 구조로 구성되었으며,  
개발자는 문제 해결자가 아니라 **AI 개발 시스템을 설계하고 통제하는 아키텍트 역할**에 집중합니다.  
이를 통해 사람이 타이핑하지 않아도 지속적으로 확장·유지·검증 가능한 **AI-Driven Development Pipeline**을 목표로 합니다.

# GitHub User Search (Next.js · Turbo · pnpm)

GitHub 사용자/조직 검색 UI를 ES2023 + Next.js(App Router) + TypeScript + MUI + Tailwind + Redux Toolkit으로 구현했습니다. SSR로 첫 페이지를 렌더링하고, CSR에서 무한 스크롤을 이어가며, Canvas + WASM 후처리 아바타, 레이트리밋 표시, 정렬/필터 조건을 모두 지원합니다.

## 프로젝트 구조

- `apps/web`: Next.js App Router 앱 (MUI 컴포넌트 + Tailwind 레이아웃, Redux 상태, API 라우트)
- `packages/core`: 검색 쿼리 빌더/정렬/페이징/매핑/레이트리밋 파싱 등의 재사용 로직
- `packages/avatar-wasm`: WAT → WASM 생성 스크립트와 마스크 후처리 헬퍼
- `prompts/used_prompts.md`: 이번 작업의 최초 프롬프트 로그

## 사전 준비 (실행 전 체크리스트)

1. Node.js 18.18+ / 20.x 환경인지 확인
2. `pnpm` 설치 (권장 8.x): `corepack enable` 후 `corepack prepare pnpm@8.15.4 --activate`
3. 리포 클론 후 루트에서 `.env` 생성

   ```bash
   cp .env.example .env
   # .env에 GITHUB_TOKEN=<personal_access_token> 설정 (repo/public scope면 충분)
   # 필요 시 NEXT_PUBLIC_SITE_URL, MOCK_GITHUB(테스트/데모용) 조정
   ```

   - 토큰이 없으면 API 라우트가 에러를 안내하며 동작하지 않습니다.

4. 의존성 설치: `pnpm install` (루트에서 실행)
5. WASM 생성: `pnpm run wasm:build` (dev/build/start 앞에서 자동 실행되지만, 최초 1회 명시 실행 권장)
6. VS Code 사용 시 자동 포맷/ESLint가 동작하려면 권장 확장(Tailwind, ESLint, Prettier)과 체크인된 `.vscode/settings.json`을 그대로 사용
7. 네트워크 차단 환경에서 테스트하려면 `.env`에 `MOCK_GITHUB=1`을 추가해 GitHub 호출을 전부 mock 합니다.

## 실행/명령 모음

- 개발 서버: `pnpm -w run dev` (필요 시 mock 모드: `pnpm -w run dev:mock`)
- 프로덕션 빌드/실행: `pnpm -w run build` → `pnpm -w run start`
- 단위 테스트(Jest): `pnpm -w run test`
  - 패키지별: `pnpm --filter @user-search/core test`, `pnpm --filter web test`
- E2E(Cypress, mock API 사용): `pnpm -w run e2e`
- 정적 분석: `pnpm -w run lint`
- 타입 체크: `pnpm -w run typecheck`
- 전체 검증: `pnpm -w run verify` (lint + typecheck + test)
- “테스트 통과 후에만 실행” 원커맨드:
  - 개발: `pnpm -w run dev:checked` (verify 성공 시 dev)
  - 운영: `pnpm -w run start:checked` (verify 성공 시 start)

## 기능 매핑 (요구사항 8+α)

1. 사용자/조직 검색: `type:user|org` qualifier
2. 계정/성명/메일 검색: `in:login,name,email` 선택 토글
3. 리포지토리 수 필터: `repos:` + 비교 연산자(>= 기본)
4. 위치 필터: `location:`
5. 사용 언어: `language:`
6. 생성 시점: `created:` (날짜 비교)
7. 팔로워 수: `followers:` (비교 연산자)
8. 후원 가능: `is:sponsorable`
9. 정렬: 기본(best match), followers, repositories, joined + DESC
10. 페이징: SSR로 1페이지, CSR 무한 스크롤(중복 방지, requestId로 오래된 응답 무시)
11. 다크 모드: `prefers-color-scheme` 기반, MUI Theme mode 동기화
12. 아바타 Canvas + WASM 후처리 + 서버 프록시(allowlist: `avatars.githubusercontent.com`)로 CORS/taint 회피
13. 레이트리밋: `X-RateLimit-*` 파싱, 남은 쿼터/리셋 시각 UI 노출, 429/retry-after 시 백오프 재시도, reset이 멀면 `rate_limited` 응답

## 아키텍처 & 모듈러리티

- API 게이트웨이: `apps/web/app/api/github/search-users/route.ts`
  - GitHub Search Users REST 호출, Authorization: token 적용
  - 429/retry-after 백오프 + rate limit 메타 포함
  - `MOCK_GITHUB=1`일 때는 고정 샘플로 응답(테스트/데모용)
- 아바타 프록시: `apps/web/app/api/avatar-proxy/route.ts` (allowlist 기반, 오픈 프록시 금지)
- Core 로직: `packages/core`
  - `buildSearchQuery`, `buildSearchParams`, 정렬 매핑, `dedupeUsersByLogin`, `mapSearchResponse`, `parseRateLimit`, `computeBackoffMs`
- WASM 빌드: `packages/avatar-wasm/scripts/build-wasm.js` (WAT→WASM), `applyCircularMask` 헬퍼로 Canvas pixel 후처리
- 상태관리: Redux Toolkit slice (`apps/web/features/search/searchSlice.ts`)로 SSR 하이드레이션 + CSR 무한 스크롤/요청 식별

## SSR/CSR 경계

- `/search` 페이지는 `searchParams` 기반으로 서버에서 1페이지 fetch 후 렌더
- 클라이언트 하이드레이션 이후 IntersectionObserver로 2페이지부터 append
- Redux slice가 `requestId`로 오래된 응답을 무시하고, dedupe로 중복 append 차단
- 쿼리/정렬 변경 시 URL push → 서버 재렌더 → 클라이언트 하이드레이트

## 테스트 전략

- Jest (단위/통합)
  - `packages/core`: 쿼리 빌더, 페이징/중복 제거, 레이트리밋 파서
  - `apps/web`: SSR 하이드레이션 + 무한 스크롤 상태 전이 검증
- Cypress (E2E, `MOCK_GITHUB=1`)
  - 검색 → 결과 노출 → 정렬 변경 → 무한 스크롤 추가 로드 → 다크 모드 배경 확인
  - 외부 GitHub에 의존하지 않고 앱 자체 API(mock)만 사용

## MUI + Tailwind 병행 시 주의점

- Tailwind는 레이아웃/간격, MUI는 폼·카드·피드백 컴포넌트 중심으로 사용
- `CssBaseline`을 활성화하고 Tailwind `preflight`를 그대로 사용 (중복 리셋 최소화)
- 스타일 충돌 시: 레이아웃은 `className`(Tailwind), 컴포넌트 세부 스타일은 `sx` 또는 MUI theme override로 분리
- `darkMode: "media"` 설정으로 시스템 다크 모드와 Tailwind `dark:` 변수를 일치

## 주요 경로

- 페이지: `apps/web/app/search/page.tsx`
- 클라이언트 UI: `apps/web/app/search/search-client.tsx`, `apps/web/components/*`
- Redux slice: `apps/web/features/search/searchSlice.ts`
- API: `apps/web/app/api/github/search-users/route.ts`, `apps/web/app/api/avatar-proxy/route.ts`
- Core: `packages/core/src/*`
- WASM: `packages/avatar-wasm/*` → 출력 `apps/web/public/wasm/avatar_mask.wasm`
- 프롬프트 로그: `prompts/used_prompts.md`

## 추가 메모

- GitHub 호출 전에는 반드시 `.env`에 `GITHUB_TOKEN`을 넣으세요.
- WASM 파일은 `predev/prebuild` 훅으로 자동 생성되지만, 필요 시 `pnpm run wasm:build`로 수동 생성 가능합니다.
- CI나 로컬에서 빠른 검증: `pnpm -w run verify`
