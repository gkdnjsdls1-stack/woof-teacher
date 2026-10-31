# HANDOFF — 지금까지 한 일과 이어서 할 일

작성 시점: **2026-10-31**
작업 환경: macOS / bash / Node v24 · npm 11 (최초 작성은 Windows / PowerShell / Node 없음)

## 한 줄 상태

SPEC 12번 **4단계(병원·보호자 설정)까지 구현을 마쳤고, 2026-10-31 에 AI 그림 45장을 화면에 붙였습니다.**
`npm run typecheck` · `npm test` · `npm run build` 통과, 화면 전부를 브라우저에서 눈으로 확인했습니다.
배포는 자동입니다 — **`main` 에 밀어 올리면 Pages 로 나갑니다.** 그림 작업은 아직 커밋 전입니다.

## 무엇이 되어 있나

### 1단계 MVP

| 화면 | 파일 | 내용 |
|---|---|---|
| S0 로딩 | [src/screens/LoadingScreen.tsx](src/screens/LoadingScreen.tsx) | 발자국 애니메이션 0.9초 |
| S1 이름 짓기 | [src/screens/NamingScreen.tsx](src/screens/NamingScreen.tsx) | 선물 상자 2개 → 추천 이름 4개 / 직접 입력(1~6글자) |
| S2 홈 | [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) | 하트 게이지, 집, 밥·물그릇, 쓰다듬기(보상 없음), **할 수 있는 일 버튼 전부**(순서 없음) |
| S3 옷 입히기 | [src/screens/DressScreen.tsx](src/screens/DressScreen.tsx) | 슬롯 머리/몸/얼굴, 무료 1벌, 나머지는 가격표(3단계부터 옷가게로) |
| S11 목욕 | [src/screens/WashScreen.tsx](src/screens/WashScreen.tsx) | 거품 → 헹구기 → 수건 → 반짝 |
| 재우기 | [src/screens/SleepScreen.tsx](src/screens/SleepScreen.tsx) | 불 끄기 → "쿨쿨 💤" |
| S13 밤·내일 예고 | [src/screens/NightScreen.tsx](src/screens/NightScreen.tsx) | 자는 강아지, 예고 카드 3장, **종료 버튼 없음** |
| 축하 연출 | [src/components/CelebrationOverlay.tsx](src/components/CelebrationOverlay.tsx) | 호감도 50·80·100, 두 강아지분이 차례로 |

### 2단계 — 출근 & 수업 (2026-10-21 추가)

| 화면 | 파일 | 내용 |
|---|---|---|
| S5+S6 출근 | [src/screens/CommuteScreen.tsx](src/screens/CommuteScreen.tsx) | 목줄·입마개를 **끌어다(또는 탭해서)** 강아지마다 착용 → 둘 다 채우면 출발 → 빨간 오픈카 12초(탭하면 "빵빵!") → 도착 |
| S7 교실 / 소풍 | [src/screens/LessonScreen.tsx](src/screens/LessonScreen.tsx) | 학생 5명 + 입마개 쓴 강아지. 문제 3개, 정답 시 박수·"월월월!", 오답은 "다시 해볼까?" 후 재시도. 주말은 공원 소풍 |

- 미니게임 5종은 모두 [src/lib/lessons.ts](src/lib/lessons.ts) 가 만들고 화면은 **그리기만** 합니다
  (월 숫자 세기 / 화 한글 낱말 / 수 짝 맞추기 / 목 덧셈·뺄셈 / 금 시계 보기 / 토·일 소풍)
- 코인: 문제당 첫 정답에만 10, 하루 최대 30. 주말 소풍 15. **`SOLVE_QUESTION` 한 경로만 통과합니다.**
- 하루 흐름: 밥(+5) → 물(+3) → 옷(+3) → **출근(+3) → 수업(코인)** → 씻기(+5) → 재우기(+2) = 하루 21점 + 코인 30
- 입마개는 저장하지 않습니다. 집에 돌아오면 저절로 벗겨집니다 (SPEC 6-9).

### 3단계 — 꾸미기 & 성장 (2026-10-22 추가)

| 화면 | 파일 | 내용 |
|---|---|---|
| S4 옷가게 | [src/screens/ShopScreen.tsx](src/screens/ShopScreen.tsx) | 오늘의 새 옷 1벌 + 강아지별 가게 옷. **옷 입히기 화면에서 들어갑니다** |
| S12 집 업그레이드 | [src/screens/HouseScreen.tsx](src/screens/HouseScreen.tsx) | 박스집 → 나무집(60) → 2층 집(120) → 성(200). **홈의 `🏠 강아지집` 버튼**으로 들어갑니다 |
| S8 산책 | [src/screens/WalkScreen.tsx](src/screens/WalkScreen.tsx) | 공원이 흐르다 꽃·나비·공 앞에서 멈춤 → 탭하면 다시 걷기 → 도착(+5) |
| S9 미용실 | [src/screens/GroomScreen.tsx](src/screens/GroomScreen.tsx) | 가위 → 드라이어 → 커튼 "짠!"(+10). **체크판 밖 보너스**, 하루 1번 |

- `CURRENT_STAGE` 를 `3` 으로 올려 `SHOP_ENABLED`·`HOUSE_ENABLED` 와 체크판의 산책 칸이 함께 열렸습니다.
- 하루 흐름: 밥(+5) → 물(+3) → 옷(+3) → 출근(+3) → 수업(코인) → **산책(+5)** → 씻기(+5) → 재우기(+2)
  = 하루 36점 + 코인 30 (미용실까지 하면 46점)
- 옷을 사거나 집을 올리는 규칙은 모두 [economy.ts](src/state/economy.ts) 한 곳을 지나갑니다 — 화면과 reducer 가 같은 함수를 봅니다.

### 4단계 — 병원 & 보호자 설정 (2026-10-29 추가)

| 화면 | 파일 | 내용 |
|---|---|---|
| S10 병원 | [src/screens/HospitalScreen.tsx](src/screens/HospitalScreen.tsx) | 청진기 🩺 → 약 젤리 🍬 → 반창고 🩹 → "다 나았어요!"(+5). **아픈 날에만** 홈에 버튼이 보입니다 |
| S14 보호자 설정 | [src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx) | 톱니바퀴 **3초 길게** + 덧셈 관문 → 플레이 시간 14일 · 이름 변경 · 음소거 · 전체 초기화 |

- **아픔 발생**은 `dayCheck` 의 `rollSickness` 한 곳에서 날짜를 시드로 굴립니다 — 시작 후 3일 유예, 하루 10%, 같은 강아지는 7일에 한 번.
  **치료하지 않아도 다음 날 저절로 낫습니다.** 치료는 `REWARD hospital` 한 경로에서 호감도와 함께 처리합니다.
- **플레이 시간**은 화면이 보이는 동안만 세어 30초마다 쌓습니다(`ADD_PLAYTIME`). 보여주기만 하고 제한은 없습니다.
- **`npm test`** 로 reducer 를 화면 없이 점검합니다 (새 라이브러리 없이 esbuild + node).

## 배포 — 끝났습니다 (2026-10-29)

**주소: https://gkdnjsdls1-stack.github.io/woof-teacher/**

- 저장소를 **공개**로 바꾸고(무료 계정은 비공개 저장소에 Pages 를 못 씁니다), Pages Source 를 **GitHub Actions** 로 설정했습니다.
- 이제 `main` 에 밀어 올릴 때마다 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 이
  `npm ci` → `npm run typecheck` → `npm run build` → Pages 배포를 합니다. PR 은 검사만 합니다.
- 커밋 작성자 이메일은 공개 저장소를 대비해 GitHub noreply 주소로 바꿨습니다 (`git config user.email` 설정 완료).
- 배포본에서 `?debugDate` 가 무시되는 것과 서비스 워커 등록을 확인했습니다.

## 그림 다듬기 (2026-10-29) — 아래 "그림 교체"로 대체됨

당시 방식: SVG 를 다듬는 쪽 (2026-10-31 에 뒤집었습니다 — [docs/DECISIONS.md](docs/DECISIONS.md) 92번).

- 강아지: 바깥 윤곽선(`Inked` — 같은 모양 두 겹) · 털 그라데이션 · 바닥 그림자 · 발바닥
- 닥스훈트는 **귀를 길게**, 푸들은 귀를 늘어뜨리고 꼬리 폼폼을 몸에 붙였습니다
- 표정: **기쁠 때 눈을 뜨고**(전에는 늘 감은 눈이라 졸려 보였습니다), 배고픔의 눈썹은 뺐습니다(화나 보였습니다)
- 강아지집 4단계도 같은 그림체로 (박스집 테이프 / 나무 판자결 / 2층 창틀 / 성 깃발·톱니 성벽)
- **`geometry.ts` 기준점은 건드리지 않았습니다** — 옷 10벌·목줄·입마개·왕관이 전부 거기 붙어 있어서,
  브라우저에서 옷 3종·목줄·입마개를 입혀 어긋나지 않는 것을 확인했습니다
- 표정 5종 × 2마리를 한 화면에 모아 눈으로 확인했습니다

## 그림 교체 — AI 그림 45장 (2026-10-31)

**SVG 플레이스홀더가 사라졌습니다.** 그림은 `public/art/` 에, 어떻게 뽑았는지는 [docs/ART.md](docs/ART.md) 에 있습니다.

- 강아지 10 · 옷 12 · 배경 10 · 소품 11장을 붙였습니다. 합쳐 1.3 MB (WebP)
- 자리 수치는 [src/assets/geometry.ts](src/assets/geometry.ts) 표 하나 — **강아지 그림 가로·세로를 100 으로 본 비율**
- 주소는 [src/assets/art.ts](src/assets/art.ts) 의 `art()` · `screenBg()` 한 곳에서 만듭니다
- `Outfits.tsx` 200줄 · `Dog.tsx` 455→130줄로 줄었습니다
- **아직 SVG**: 강아지집 4단계 · 시계 바늘 · 학생 (그림 한 장으로는 못 그리는 것들)
- 덤으로 고침: 밤 화면 코인 숫자가 흰 알약 위 흰 글씨였던 것, 출근 화면의 회색 길 띠 삭제, 소풍날 배경을 공원으로

## 순서 강제 제거 (2026-10-31)

**체크판 8칸 · "다음에 할 일" 버튼 · 홈의 흰 패널을 지웠습니다.** 홈에 행동 버튼이 전부 깔려 있고
아이가 아무 순서로나 누릅니다 ([docs/DECISIONS.md](docs/DECISIONS.md) 99~104번).

- `canDo()` 에 남은 조건: **재우면 하루 끝**, **병원은 아픈 날만**. 그 외에는 전부 열려 있습니다
- **하루 1회 제한은 그대로** — 끝낸 버튼은 ✅ 로 바뀌고 꺼집니다 (절대 원칙 3번).
  단 **옷 입히기만 예외**로 다시 열립니다 (옷가게로 가는 유일한 길 — 아래 검토 참고)
- `DAY_FLOW` · `CHECKBOARD` 상수와 `CheckBoard.tsx` · `nextAction()` · `isMorningDone()` 삭제
- 밤 화면 문구를 "오늘 할 일을 다 했어요!" → "강아지들이 잠들었어요 🌙" 로 — 아무것도 안 하고 재우면 거짓이 됩니다
- **하루 길이 설계가 흔들립니다** — 순서가 없으니 아이가 어디까지 했는지 스스로 못 볼 수 있습니다. 플레이 시간 측정이 더 급해졌습니다

## 사용자 경험 검토 (2026-10-31)

브라우저에서 **하루를 처음부터 끝까지** 돌려보고(375×812 · 375×667) 고친 것들입니다
([docs/DECISIONS.md](docs/DECISIONS.md) 105~115번).

막혀 있던 것:
- **번 코인을 쓸 수 없었다** — 옷 입히기를 끝내면 버튼이 꺼지는데, 그게 옷가게로 가는 유일한 길이었다.
  강아지집은 강아지 그림 **뒤에** 깔려 있어 거의 안 보이고 눌리지도 않았다.
  → 옷 입히기는 ✅ 뒤에도 열리고(`👕 옷 갈아입히기`), 홈에 `🏠 강아지집` 버튼을 넣었다.
- **옷 목록 첫 칸(머리)에 스크롤로도 닿지 않았다** (`justify-content:center` + overflow).
- **"다 입혔어요" 버튼이 화면 밖**에 있었다 (`min-height:0` 누락).
- 세로 667px 폰에서 **아픈 날 병원 버튼이 화면 밖**으로 밀렸다.

보기 이상하던 것:
- 미용실에서 **손질하는 내내 커튼에 강아지가 가려졌다** → 커튼은 "짠!" 순간에만.
- 목욕에서 강아지가 **그려진 욕조 밖**에 서 있었다 (파란 카드가 욕조처럼 보였다) → 욕조 안으로.
- 밤 화면 제목이 창틀 그림에 묻혀 거의 안 보였다 / 달리는 중 안내도 도로에 묻혔다 → 글씨 뒤 막.
- 아침에 씻기면 **하루 종일 졸린 표정**이었다 → "재우기만 남았을 때"로 (`onlySleepLeft`).
- 미용실 버튼만 끝나면 사라졌다 → 다른 버튼처럼 ✅.
- "나무집으 / 로" 처럼 낱말이 잘렸다 → `word-break: keep-all` 을 body 로.

## 직접 확인해야 할 것 (아직 못 한 것)

1. **하루 전체 플레이 시간 재기** — 1단계만일 때 약 3분. 3단계까지 붙은 지금 처음부터 끝까지 다시 재야 합니다 (목표 10~15분)
2. 폰(360px 폭) 실기기 — **출근 준비의 터치 드래그**, 목욕 드래그, 한글 이름 입력(IME)
   (3단계 화면은 375px 폭에서 글씨 18px·탭 56px 을 측정으로 확인했습니다)
3. `npm run build` 결과물에서 `?debugDate` 가 무시되는지
4. 빌드 결과물을 폰에서 "홈 화면에 추가" → 아이콘·이름, 비행기 모드에서 다시 열리는지
5. **그림 45장이 폰에서 얼마나 느린지** — 첫 방문에 1.3 MB 를 받습니다 (서비스 워커가 그때그때 캐시합니다)

항목별 상태는 [docs/CHECKLIST.md](docs/CHECKLIST.md) 에 표로 있습니다.

## 생각만 해보고 아직 안 한 것

| 안 한 것 | 하면 좋은 때 |
|---|---|
| **아이에게 보여줄 질문지** — 추천 이름 (옷 목록·그림 방향은 확정됨) | 아무 때나 |
| **빈 밥·물그릇 그림** — 지금은 색만 빼고 흐리게 처리 | 아무 때나 |
| **강아지집 3단계 그림** — 나머지가 나오면 네 단계를 한꺼번에 교체 | 아무 때나 |
| **화면 테스트** — reducer 는 `npm test` 로 보지만 화면은 사람 눈으로만 봤습니다 | 손볼 일이 잦아지면 |

## 참고 문서

- [docs/FILES.md](docs/FILES.md) — **파일 전체 지도**
- [SPEC.md](SPEC.md) — 원본 기획 명세
- [CLAUDE.md](CLAUDE.md) — 절대 원칙과 코드 규칙
- [docs/DECISIONS.md](docs/DECISIONS.md) — 구현하면서 내린 판단과 이유
- [docs/CHECKLIST.md](docs/CHECKLIST.md) — SPEC 13번 체크리스트 현황
- [docs/REVIEW.md](docs/REVIEW.md) — 코드 검토 기록
- [README.md](README.md) — 실행 방법과 폴더 구조
