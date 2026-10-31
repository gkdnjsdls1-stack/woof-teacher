# 파일 지도

폴더 안의 **모든 파일**과 그 역할입니다. 다른 기기에서 처음 열었을 때
무엇부터 보면 되는지, 어디를 고치면 되는지 한눈에 보라고 만든 표입니다.

처음이라면 → [README.md](../README.md) → [HANDOFF.md](../HANDOFF.md) → [CLAUDE.md](../CLAUDE.md) 순서로 보세요.

## 문서

| 파일 | 역할 |
|---|---|
| `README.md` | 실행 방법, 폴더 구조, 문서 지도 |
| `HANDOFF.md` | **지금 상태와 다음에 할 일.** 이어받을 때 가장 먼저 볼 문서 |
| `CLAUDE.md` | 절대 원칙 7가지와 이 저장소의 코드 규칙 |
| `SPEC.md` | 원본 기획 명세 전체 (아이·보호자가 정한 것) — **고치지 않습니다** |
| `docs/DECISIONS.md` | 명세에 없던 판단 51건과 그 이유 |
| `docs/CHECKLIST.md` | SPEC 13번 테스트 항목별 현황 |
| `docs/REVIEW.md` | 코드 검토 기록 — 확인한 것 / 고친 것 / 확인 못 한 것 |
| `docs/NAMING.md` | 앱 이름(월월 선생님 / woof-teacher)과 후보들 |
| `docs/FILES.md` | 이 문서 |

## 설정

| 파일 | 역할 |
|---|---|
| `package.json` | 의존성(react, react-dom)과 npm 명령 4개 |
| `vite.config.ts` | 빌드 설정. `base: './'` (하위 경로 배포 대응), 폰 접속용 `host: true` |
| `tsconfig.json` | 아래 두 설정을 묶는 파일 |
| `tsconfig.app.json` | `src` 용 타입 설정. **strict, noUnusedLocals 켜져 있음** |
| `tsconfig.node.json` | `vite.config.ts` 용 |
| `index.html` | 진입 HTML. 제목·PWA 메타 태그·아이콘 링크 |
| `.gitignore` | node_modules, dist 등 제외 |
| `.gitattributes` | 기기 간 줄바꿈(LF) 통일 |

## 앱 코드 (`src/`)

| 파일 | 역할 |
|---|---|
| `main.tsx` | 진입점. React 띄우기 + 서비스 워커 등록(빌드에서만) |
| `App.tsx` | 화면 전환 (로딩 → 이름 짓기 → 홈/옷/출근/수업/목욕/재우기 → 밤), 축하 연출, 세로 안내, debugDate 표시 |
| `constants.ts` | **★ 모든 수치.** 호감도·코인·가격·확률·연출 시간·목욕 횟수·문제 범위 |
| `types.ts` | 데이터 모델 (SPEC 10번과 동일) |
| `styles.css` | 전체 스타일. 큰 버튼(56px), 큰 글씨(18px), 파스텔, 세로 전용 |

### 상태 (`src/state/`)

| 파일 | 역할 |
|---|---|
| `gameReducer.ts` | **상태 변경이 전부 여기.** 보상은 `REWARD` 하나만 통과(하루 1회 보장), 새 하루 처리, 구매·업그레이드, 호감도 단계 선물 |
| `GameContext.tsx` | reducer 를 화면에 연결, 저장, 자정·복귀 감지, 효과음 |
| `selectors.ts` | 진행 잠금 — 지금 무엇을 할 수 있는지(`canDo`), 다음에 할 일(`nextAction`) |
| `economy.ts` | 코인 규칙 — 수업에서 **얼마를 받는지**(reducer 와 화면이 같은 함수), 살 수 있는지, 집을 올릴 수 있는지 |

### 화면 (`src/screens/`)

| 파일 | 역할 |
|---|---|
| `LoadingScreen.tsx` | S0 발자국 |
| `NamingScreen.tsx` | S1 선물 상자 → 이름 짓기 |
| `HomeScreen.tsx` | S2 홈 — 체크판, 하트, 밥·물그릇, "다음에 할 일" |
| `DressScreen.tsx` | S3 옷 입히기 (→ 옷가게 입구) |
| `ShopScreen.tsx` | S4 옷가게 — 오늘의 새 옷, 코인으로 구매 |
| `CommuteScreen.tsx` | S5+S6 출근 준비(목줄·입마개 드래그) → 오픈카 이동 → 도착 |
| `LessonScreen.tsx` | S7 교실 (문제 5종 그리기) + 주말 소풍. 코인은 여기서만 생깁니다 |
| `WalkScreen.tsx` | S8 산책 — 흐르는 공원, 꽃·나비·공 탭, 끝 지점 도착 |
| `GroomScreen.tsx` | S9 미용실 — 가위 → 드라이어 → 커튼 "짠!" (체크판 밖 보너스) |
| `WashScreen.tsx` | S11 목욕 (거품 → 헹굼 → 수건) |
| `HouseScreen.tsx` | S12 집 업그레이드 (홈의 강아지집을 누르면 들어갑니다) |
| `SleepScreen.tsx` | 재우기 (불 끄기) |
| `HospitalScreen.tsx` | S10 병원 — 청진기 → 약 젤리 → 반창고 (아픈 날에만) |
| `SettingsScreen.tsx` | S14 보호자 설정 (숨김) — 톱니바퀴 3초 + 덧셈 관문 |
| `NightScreen.tsx` | S13 밤 · 내일 예고 |

### 부품 (`src/components/`)

| 파일 | 역할 |
|---|---|
| `BigButton.tsx` | 큰 버튼 (56px 이상) |
| `CelebrationOverlay.tsx` | 호감도 50·80·100 축하 연출 (큐를 하나씩 비움) |
| `CheckBoard.tsx` | 오늘의 체크판 8칸 |
| `HeartGauge.tsx` | 하트 게이지 |
| `SpeechBubble.tsx` | 말풍선 ("월월" 계열만) |
| `TopBar.tsx` | 코인 · 제목 · 음소거 · 집으로 |

### 그림 (`src/assets/` + `public/art/`) — 화면은 **이 폴더에서만** 그림을 가져옵니다

그림 파일 45장은 `public/art/` 에 있습니다 (`dog/` 10 · `outfit/` 12 · `bg/` 10 · `prop/` 13).
어떻게 뽑았고 무엇이 남았는지는 [ART.md](ART.md).

| 파일 | 역할 |
|---|---|
| `index.ts` | 화면이 가져다 쓰는 입구 |
| `art.ts` | 그림 주소를 만드는 `art()` · 화면 배경 `screenBg()` — **경로는 여기서만** |
| `Dog.tsx` | 강아지 그림을 깔고 옷 · 목줄 · 입마개 · 왕관을 겹칩니다 |
| `geometry.ts` | **자리 수치 전부** — 강아지 크기, 옷 12벌, 목줄·입마개, 왕관 (강아지 그림 가로·세로의 %) |
| `Outfits.tsx` | 목록·버튼용 이모지만 (옷 그림은 `public/art/outfit/`) |
| `Props.tsx` | 소품 11개는 `<img>` 한 줄. **SVG 로 남은 것: 집 4단계 · 시계 · 학생** |
| `palette.ts` | 색상 (남은 SVG 와 UI 가 씁니다) |

### 도움 함수 (`src/lib/`)

| 파일 | 역할 |
|---|---|
| `date.ts` | 현지 날짜, 날짜 계산, **`?debugDate` (개발 모드 전용)** |
| `storage.ts` | localStorage 읽기·쓰기 + 깨진 저장 걸러내기 |
| `sound.ts` | 효과음 (음원 파일 없이 WebAudio 로 합성) |
| `random.ts` | 날짜를 시드로 쓰는 결정적 난수 |
| `lessons.ts` | **수업 문제 생성 5종.** `LessonScreen` 이 그립니다 |

### 데이터 (`src/data/`)

| 파일 | 역할 |
|---|---|
| `words.ts` | 그림-낱말 44쌍 (2~3글자). 낱말을 늘리려면 여기만 |

## 배포 파일 (`public/`) — 빌드 결과물 루트로 그대로 복사됩니다

| 파일 | 역할 |
|---|---|
| `icon.svg` | 홈 화면 아이콘 (원본) |
| `icon-192.png` `icon-512.png` | 같은 그림의 PNG. 아이폰은 PNG 만 받습니다 |
| `manifest.webmanifest` | PWA 설정 (월월 선생님 / 월월, 세로 고정) |
| `sw.js` | 서비스 워커 — 오프라인 캐시 (빌드에서만 등록) |

## 보조 도구 (`tools/`) — 앱에 들어가지 않습니다

| 파일 | 역할 |
|---|---|
| `WoofIcon.cs` | 아이콘 PNG 를 다시 만드는 코드 (Windows, Node 불필요) |
| `README.md` | 쓰는 법과 좌표 대응표 |

## 폴더에 **없는** 것

| 없는 것 | 왜 |
|---|---|
| `node_modules/` | `npm install` 이 만듭니다 |
| `dist/` | `npm run build` 가 만듭니다 |
| 테스트 코드 | 아직 없습니다 |
| 3~4단계 화면 | 옷가게·집·산책·미용실·병원은 아직 없습니다 ([HANDOFF.md](../HANDOFF.md) 참고) |
