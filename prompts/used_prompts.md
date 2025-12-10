# Prompt History

## 1

너는 이 레포지토리에서 과제를 “실행 가능한 상태로 완성”시키는 시니어 아키텍트 겸 코딩 에이전트(Codex)다.
목표는 3일 과제 기준으로: 코드가 실제로 실행되고, 요구사항을 누락 없이 충족하며, Jest/Cypress 테스트와 README가 완결된 상태를 만드는 것이다.
질문으로 시간을 쓰지 말고, 합리적인 기본값을 선택해 끝까지 구현해라. (단, 보안/토큰 관련 값은 env로 처리)

[내 현재 상황]

- 이미 GitHub에 레포를 만들고 로컬에 git clone 완료 (현재 폴더가 작업 루트)
- VSCode 확장: Code Spell Checker, Codex(OpenAI), Container Tools, Dev Containers, ESLint, GitHub Copilot Chat, GitLens, JavaScript & TypeScript Nightly, Live Server, Prettier, Prettier ESLint, Tailwind CSS IntelliSense, Tailwind Docs, YAML, GitHub Copilot
  → 따라서 ESLint/Prettier/Tailwind가 “저장 시 자동 정리”로 잘 동작하도록 설정 파일도 함께 구성해라.

[필수 스택/환경]

- pnpm + turbo (monorepo)
- ES2023 + Next.js + TypeScript (Next.js App Router)
- MUI + Tailwind CSS (컴포넌트는 MUI, 레이아웃은 Tailwind)
- Redux Toolkit
- Jest (unit/integration)
- Cypress (E2E)
- Clean Architecture + Modularity
- 실행 불가하면 실격이므로 “정말 실행 가능한 상태”가 우선

[구현해야 할 기능: GitHub Search Users API 기반(REST)]

1. 사용자/조직만 검색(type:user|org)
2. 계정 이름, 성명 또는 메일로 검색(in:login, in:name, in:email + 필요시 fullname 고려)
3. 리포지토리 수로 검색(repos:)
4. 위치별 검색(location:)
5. 사용 언어(language:)
6. 개인 계정 생성 시점(created:)
7. 팔로워 수(followers:)
8. 후원 가능(is:sponsorable)

[추가 요구사항]

- 시스템 연동 다크 모드(prefers-color-scheme)
- 반응형: SM/MD/LG/XL 지원
- 머터리얼 디자인 컬러 팔레트(MUI theme 기반)
- 폰트 폴백: 애플 기본 > Noto (Apple 시스템 폰트 우선, Noto를 fallback으로 로드/적용)
- 정렬 조건: 기본(베스트매치), followers, repositories, joined 지원 + DESC
- 페이징: SSR로 첫 페이지 선 렌더링, 이후 CSR로 무한 스크롤
- 사용자 아바타: HTML5 Canvas + WebAssembly로 렌더링
  - 원격 avatar를 canvas에서 픽셀 처리(getImageData)할 수 있도록 CORS/tainting 이슈를 고려해 “서버 프록시(allowlist)” 라우트도 설계해라(오픈 프록시 금지)
- 모든 GitHub 호출은 서버 라우트에서 Authorization: token 사용
- 레이트리밋 초과 시 재시도 + 남은 쿼터(remaining/resetAt/limit)를 UI에 노출
- README.md에 실행/테스트 방법을 명확히 작성
- 실행 전에 테스트가 통과하면 실행되고, 아니면 에러로 멈추는 명령(스크립트)을 제공
- prompts/used_prompts.md에 “이번 첫 명령 프롬프트(이 텍스트)”를 포함해 프롬프트 기록 파일을 생성

[너에게 요구하는 산출물(모두 구현)]
A) 모노레포 세팅(pnpm-workspace.yaml, turbo.json, root package.json scripts)
B) Next.js App Router 앱: apps/web
C) Clean Architecture + Modularity

- 최소 1개 이상 packages/ 모듈로 core 로직(쿼리 빌더/정렬/페이징/매핑/레이트리밋 파싱)을 분리해서 재사용/테스트 가능하게 구성
  D) 서버 라우트(API 게이트웨이)
- /api/github/search-users : GitHub Search Users 호출(Authorization: token), q/sort/order/page/per_page 처리
- rate limit headers 파싱 → 응답 계약(Response Contract)에 rateLimit 메타 포함
- 재시도 정책:
  _ 429 또는 retry-after 헤더가 있으면 제한된 횟수 내에서 backoff(+jitter)로 재시도
  _ remaining=0 이고 reset이 너무 멀면 무한 대기하지 말고 “rate_limited” 타입으로 응답(remaining/resetAt 노출)
  E) SSR + CSR 경계
- /search 페이지: URL searchParams 기반으로 서버에서 1페이지를 fetch 후 SSR 렌더
- 클라이언트 컴포넌트가 hydration 후 무한 스크롤로 2페이지부터 append
- 중복 append 방지, query/sort 변경 시 state reset 원자성, 오래된 응답이 덮어쓰지 않도록 Abort/requestId 사용
  F) UI
- MUI 컴포넌트로 폼(필터/정렬), 카드/리스트/알림
- Tailwind로 레이아웃/그리드/간격/반응형
- 다크모드: 시스템 연동 + MUI theme palette.mode 반영(SSR mismatch 최소화)
- SM/MD/LG/XL 반응형 레이아웃
- rateLimit 남은 쿼터 UI 표시(Chip/Alert 등)
  G) Avatar Canvas + WASM
- Canvas에 avatar를 렌더 → WASM으로 픽셀 후처리(예: 원형 마스킹/알파 처리 등) 후 표시
- WASM은 빌드/배포가 자동화되도록 구성(예: packages/avatar-wasm + build script로 apps/web/public/wasm/\*.wasm 생성/복사)
- 실패 시 fallback 정책(최소한 깨지지 않게)
  H) 테스트
- Jest(필수): 검색 쿼리 빌더, 정렬 매핑, 페이징/무한스크롤 로직(중복 제거 포함), 데이터 매핑/표시 안전성, SSR/CSR 경계 로직(핵심 규칙 단위로)
- Cypress(필수): 검색→결과 표시→정렬 변경→무한스크롤 동작→다크모드(또는 prefers-color-scheme 시나리오) 검증
- 테스트는 외부 GitHub에 의존하지 않도록(서버 라우트 fetch mock/fixture 또는 cy.intercept)
  I) 문서
- README.md에 다음을 반드시 포함:
  1.  설치/환경변수 설정 방법(GITHUB_TOKEN 등) + .env.example 제공
  2.  개발 실행 명령
  3.  단위 테스트/Jest 실행 명령
  4.  E2E/Cypress 실행 명령
  5.  “테스트 통과 후에만 실행되는” 원커맨드(예: pnpm run dev:checked / start:checked) 설명
  6.  구현 스펙 명세(8개 기능 매핑, 정렬/페이징, SSR/CSR 경계, rate limit 정책)
  7.  MUI + Tailwind 함께 쓸 때 주의할 점(Preflight/우선순위/sx/className 전략 등)
- prompts/used_prompts.md 생성(이번 프롬프트 전문 포함)

[품질 기준]

- 실행 가능: pnpm install 후, 최소한 `pnpm -w run dev`가 동작해야 함(토큰 없으면 친절한 에러 안내)
- `pnpm -w run verify`(lint + typecheck + test) 통과
- Cypress는 `pnpm -w run e2e`로 실행 가능(네트워크 mock 포함)
- 코드에 TODO만 남기지 말고 “작동하는” 형태로 끝까지 완성

[작업 방식(반드시 지켜라)]

1. 먼저 현재 레포 상태를 확인하고(파일 구조/빈 레포 여부), 필요한 scaffold를 생성
2. 모노레포/Next/ESLint/Prettier/Tailwind/MUI/Redux/Jest/Cypress를 한 번에 연결되게 구성
3. 핵심 로직(쿼리 빌더/정렬/페이징/매핑/레이트리밋 파싱)은 packages/로 빼고 테스트를 우선 작성
4. 이후 UI/SSR/CSR/Infinite scroll/Avatar WASM을 구현
5. 마지막에 README와 prompts/used_prompts.md 정리, 스크립트 추가, 실행/테스트 확인

지금부터 위 요구사항을 만족하는 전체 코드를 생성/수정해라.
최종적으로는:

- 필요한 파일을 모두 생성하고,
- package scripts(turbo 포함)와 README 명령이 일치하며,
- verify/dev/e2e가 실행 가능한 상태가 되게 만들어라.

## 2

이 프로젝트를 실행하기 전에 설정되어야 하는 모든 부분들은 README.md에 정리해줘

## 3

@webassemblyjs/wast-parser와 @webassemblyjs/wasm-gen의 기능, 특징을 npmjs 사이트와 거기에 올라와 있는 github를 기준으로 설명해주고 moduleToBinary가 사용될 수 있는지 알려줘

## 4

그렇다면, packages\avatar-wasm\scripts\build-wasm.js에서 아래와 같은 에러가 발생하고 있으면 환경설정부터 문제가 있었다고 판단하는게 맞을까?

user-search-nextjs-turbo@ wasm:build C:\Users\User\Desktop\projects\github_public\user-search-nextjs-turbo
pnpm --filter @user-search/avatar-wasm build

@user-search/avatar-wasm@0.0.0 build C:\Users\User\Desktop\projects\github_public\user-search-nextjs-turbo\packages\avatar-wasm
node scripts/build-wasm.js

file:///C:/Users/User/Desktop/projects/github_public/user-search-nextjs-turbo/packages/avatar-wasm/scripts/build-wasm.js:5
import { moduleToBinary } from "@webassemblyjs/wasm-gen";
^^^^^^^^^^^^^^
SyntaxError: Named export 'moduleToBinary' not found. The requested module '@webassemblyjs/wasm-gen' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from '@webassemblyjs/wasm-gen';
const { moduleToBinary } = pkg;

## 5

이 소스를 구조 분해해줘 (build-wasm.js 내용 전문)

## 6

pnpm run wasm:build … TypeError: moduleToBinary is not a function … 이걸 수정해줘

## 7

apps\web\app\api\github\search-users\route.ts에서 process.env.GITHUB_TOKEN가 undefined야 로컬에 .env 파일은 GITHUB_TOKEN은 있는 상황인데 왜 환경변수를 못 불러오는거지?

## 8

UI적인 부분에서 가독성이 떨어지는 것 같아 apps\web\app\search\search-client.tsx 하위 컴포넌트들을 기능별로 나눠서 보더와 패딩을 추가해줘

## 9

apps\web\components\SearchForm.tsx에서도 항목 입력 부분 별로 구분할 수 있게 보더와 패딩을 추가해줘

## 10

FormControl와 TextField, 별로도 구분할 수 있게 해줘

## 11

TextField와 Select 에도 보더 넣어줘

## 12

ChunkLoadError: Loading chunk app/layout failed. (timeout: http://localhost:3000/\_next/static/chunks/app/layout.js) 에러가 계속 발생하는데 next@canary 문제일까?

## 13

TextField안에서 input이 80%는 차지 할 수 있도록 inputBorderSx를 수정해줘

## 14

@user-search/core:test에서 ESM/매처 오류 해결 요청, ts-jest/tsconfig 정리, 중복 테스트 파일 제거 등 빌드/테스트 안정화 요청

## 15

@webassemblyjs/wasm-gen 모듈ToBinary 에러 및 build-wasm.js 수정, wabt 대체 등

## 16

lint/typecheck/test 실패 시 수정 (NumericComparator, any 제거, ImageData 폴리필 등) 및 E2E 포트/설정 교정, invalid hook call, Cypress 스펙 경로 문제 등

## 17

E2E 지속 실패 대응: Cypress 캐시 삭제/재설치, turbo 데몬 종료 후 node_modules/.next 강제 삭제 및 재설치. 정렬 드롭다운 data-cy/testid 추가 후에도 불안정하여 테스트를 쿼리 파라미터 기반으로 단순화. 최종 lint/typecheck/test 통과 확인.
