# TypeScript 학습 플로우

TypeScript 학습 플랜 + 체크박스 플래너. 체크할 때마다 이 저장소에 자동으로 커밋된다.

| 파일 | 역할 |
|------|------|
| `index.html` | 플래너. 템플릿과 로직이 이 한 파일에 있다 |
| `assets/github-sync.js` | GitHub REST API 로 커밋하는 동기화 모듈 |
| `assets/dc-core.js`, `assets/broadsheet.js` | 렌더링 런타임과 디자인 시스템 (수정하지 않음) |
| `progress.json` | 동기화되는 진행 상태 (플래너가 자동 생성) |
| `typescript-study-plan.md` | 플랜 마크다운 (플래너가 자동 생성 — 직접 고치면 덮어써진다) |
| `archive/` | 원본 아티팩트 번들과 손으로 쓴 최초 마크다운 |

## 1. GitHub Pages 켜기

저장소 → **Settings → Pages → Source: Deploy from a branch → main / (root)** → Save.

1~2분 뒤 `https://<사용자명>.github.io/<저장소>/` 에서 열린다.

## 2. 동기화 연결

페이지 상단 **GitHub 연결** 을 누르고 토큰을 넣는다.

토큰은 [Fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) 으로 만든다.

- **Repository access** → Only select repositories → 이 저장소만
- **Permissions** → Repository permissions → **Contents: Read and write**
- 나머지 권한은 주지 않는다

Owner / Repo 는 GitHub Pages 에서 열었다면 URL 을 보고 자동으로 채워진다.

연결하면 체크할 때마다 `progress.json` 과 `typescript-study-plan.md` 가 **한 커밋으로** 올라간다.
연속으로 클릭하면 1.5초 동안 모아서 한 번만 커밋한다.

## 동작 방식

- 진행 상태는 항상 브라우저 localStorage 에 먼저 저장된다. 오프라인이어도 체크는 된다.
- 토큰은 그 브라우저의 localStorage 에만 있다. 저장소에는 올라가지 않고 GitHub 외의 어디로도 전송되지 않는다.
- 페이지를 열 때, 그리고 탭에 다시 돌아올 때 원격을 다시 읽는다. `updatedAt` 이 더 최신인 쪽을 채택한다.
- 다른 기기가 그 사이에 커밋했으면 덮어쓰지 않고 **충돌** 로 표시한다. `다시 불러오기` 로 원격을 받거나 `덮어쓰기` 로 이 브라우저 내용을 밀어넣는다.
- 토큰 없이 열면 공개 저장소의 `progress.json` 을 읽기 전용으로 보여준다.

## 로컬에서 열기

```bash
python3 -m http.server 8000
# http://127.0.0.1:8000/
```

`file://` 로 직접 열어도 동작하지만, 그때는 Owner/Repo 자동 채움이 되지 않으니 직접 입력해야 한다.

## 플랜 내용 고치기

단계·항목·링크는 `index.html` 안 `<script type="text/x-dc">` 의 `STAGES` / `REVIEW` 배열에 있다.
여기를 고치면 화면과 `typescript-study-plan.md` 가 같이 바뀐다.

항목을 추가·삭제하면 체크 ID(`s<단계>-<순번>`)가 밀리므로, 중간에 끼워 넣기보다 뒤에 붙이는 편이 안전하다.
