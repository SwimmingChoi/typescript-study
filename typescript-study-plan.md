# TypeScript 학습 플로우

<!-- 이 파일은 planner(index.html)가 자동으로 생성합니다. 직접 수정하면 다음 동기화 때 덮어써집니다. -->

진행률 **0%** (0 / 31) · 최종 갱신 2026-08-31T08:06:22.723030Z

## 목표
- 에이전트(클로드코드)가 짠 TS 코드를 **읽고, 이상한 곳을 잡아내고, 방향을 지시**할 수 있는 수준
- 깊은 전문가가 아니라 **검증자·설계자** 역할에 필요한 만큼만
- 최종 산출물: 직접 짠 **MCP 서버 1개**

## 전제
- Python 가능 → 프로그래밍 입문 내용은 생략
- 주 3~4회, 회당 30~60분 기준 (총 5~6주)
- 각 단계 끝에 클로드코드로 "적용 과제" 수행

---

## 0단계 — 환경 세팅 (1일)
- [ ] Node.js LTS 설치, node -v / npm -v 확인
- [ ] VS Code + 확장: ESLint, Prettier
- [ ] 연습용 폴더 만들고 npm init -y → npm i -D typescript tsx → npx tsc --init
- [ ] hello.ts 작성 후 npx tsx hello.ts 실행되는지 확인
- 적용 과제: 클로드코드한테 "이 tsconfig.json 옵션들 중 초보가 알아야 할 5개만 설명해줘"

참고 링크
- [Node.js 다운로드 (LTS)](https://nodejs.org/ko/download)
- [tsconfig 옵션 레퍼런스](https://www.typescriptlang.org/tsconfig/)

## 1단계 — JS 핵심만 (1주)
교재: ko.javascript.info "코어 자바스크립트" 파트

- [ ] 변수(let/const), 함수, 화살표 함수
- [ ] 객체·배열, 구조 분해, 스프레드
- [ ] this, 클로저 (파이썬과 다른 점 위주로)
- [ ] 프라미스, async/await, 이벤트 루프 ← **가장 중요**
- [ ] 모듈 (import/export)
- 파이썬 대응표 만들기: 리스트 컴프리헨션 ↔ map/filter, dict ↔ 객체/Map, with ↔ 없음 등
- 적용 과제: 파이썬으로 짜본 작은 스크립트 하나를 JS로 옮기기

참고 링크
- [코어 자바스크립트 (ko.javascript.info)](https://ko.javascript.info/js)
- [프라미스와 async/await 챕터](https://ko.javascript.info/async)
- [이벤트 루프](https://ko.javascript.info/event-loop)

## 2단계 — TS 타입 기초 (1.5주)
교재: TypeScript 공식 핸드북 + Total TypeScript "Beginner's TypeScript"

- [ ] Everyday Types: 기본 타입, 배열, any vs unknown, 유니온, 타입 별칭 vs 인터페이스
- [ ] Narrowing: typeof, in, 판별 유니온(discriminated union)
- [ ] 함수 타입, 옵셔널/기본값, 오버로드 (읽을 줄만)
- [ ] Object Types: readonly, 인덱스 시그니처
- [ ] strict 모드에서 에러 나는 이유 이해하기
- 적용 과제: 1단계 스크립트에 타입 붙이기 → 클로드코드한테 리뷰 요청

참고 링크
- [공식 핸드북 — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [공식 핸드북 — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [핸드북 한국어 번역](https://typescript-kr.github.io/)
- [Total TypeScript — Beginner's TypeScript (무료)](https://www.totaltypescript.com/tutorials/beginners-typescript)

## 3단계 — 제네릭 · 유틸리티 · 모듈 (1주)
- [ ] 제네릭 함수/타입, 제약(extends)
- [ ] 유틸리티 타입: Partial, Pick, Omit, Record, ReturnType
- [ ] keyof, typeof, 조건부 타입 (읽을 줄만)
- [ ] 외부 라이브러리 타입 읽기 (node_modules/@types, .d.ts)
- [ ] zod로 런타임 검증 + 타입 추론 (z.infer)
- 적용 과제: 클로드코드가 짠 코드에서 제네릭 쓰인 부분 3곳 찾아 설명 요청 → 내가 다시 설명

참고 링크
- [핸드북 — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [핸드북 — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [zod 공식 문서](https://zod.dev/)

## 4단계 — 미니 프로젝트: MCP 서버 (1주)
- [ ] @modelcontextprotocol/sdk로 도구 1개짜리 서버 뼈대 만들기
- [ ] 도구 입력 스키마를 zod로 정의
- [ ] 클로드코드/데스크톱에 연결해서 실제 호출 확인
- [ ] 도구 2~3개로 확장 (예: 파일 검색, 간단한 계산, 외부 API 호출)
- 규칙: 뼈대는 클로드코드가 짜고, 도구 하나는 반드시 내가 직접 작성
- 적용 과제: 완성 후 클로드코드한테 "이 코드의 문제점 3개" 요청 → 동의/반박 판단해보기

참고 링크
- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [TypeScript SDK (GitHub)](https://github.com/modelcontextprotocol/typescript-sdk)
- [서버 만들기 퀵스타트](https://modelcontextprotocol.io/quickstart/server)

## 5단계 — 좋은 TS 기준 잡기 (이후 계속)
교재: 『이펙티브 타입스크립트』 (하루 1~2항목)

- [ ] any 남발 줄이기, 타입 단언(as) 최소화
- [ ] 타입과 값의 구분, 타입 좁히기 습관
- [ ] 에이전트 코드 리뷰 체크리스트 만들기
- 적용 과제: 회사 프로젝트에서 TS로 붙일 만한 부분 하나 골라 설계 초안 작성

참고 링크
- [Effective TypeScript 저자 블로그](https://effectivetypescript.com/)

---

## 학습 방식 규칙
1. 개념 하나 읽으면 → 클로드코드한테 그 개념으로 작은 코드 요청 → 한 줄씩 설명 요청 → **내 말로 다시 설명**
2. 모르는 에러 메시지는 바로 검색하지 말고, 먼저 클로드에 "이 에러가 왜 나는지 힌트만" 요청
3. 완성보다 **읽기 능력** 우선. 한 주에 하나는 남이 짠(에이전트가 짠) 코드 리뷰
4. 막히면 파이썬으로 먼저 짜보고 옮기기

## 에이전트 코드 리뷰 체크리스트 (계속 업데이트)
- [ ] any / as / ! 가 왜 쓰였는지 설명 가능한가
- [ ] async 함수에 await 빠진 곳은 없는가
- [ ] 외부 입력(API, 파일)에 런타임 검증이 있는가
- [ ] 에러 처리 없이 삼켜지는 promise가 있는가
- [ ] 함수 하나가 너무 많은 일을 하지 않는가

---

## 진행 로그
| 날짜 | 한 것 | 막힌 것 / 메모 |
|------|-------|----------------|
| | | |

## 질문 모음 (다음 세션에 물어볼 것)
-
