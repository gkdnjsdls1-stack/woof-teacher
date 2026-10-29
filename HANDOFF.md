# HANDOFF — 지금까지 한 일과 이어서 할 일

작성 시점: **2026-10-29**
작업 환경: macOS / bash / Node v24 · npm 11 (최초 작성은 Windows / PowerShell / Node 없음)

## 한 줄 상태

SPEC 12번 **4단계(병원·보호자 설정)까지 구현을 마쳤습니다. 화면 전부와 reducer 자가 점검을 돌려 확인했습니다.**
`npm run typecheck` · `npm test` · `npm run build` 통과.
**남은 것은 배포 한 가지** — 워크플로 파일은 만들어 두었고, GitHub 에서 Pages 를 한 번 켜 주면 됩니다 (아래).

## 무엇이 되어 있나

### 1단계 MVP

| 화면 | 파일 | 내용 |
|---|---|---|
| S0 로딩 | [src/screens/LoadingScreen.tsx](src/screens/LoadingScreen.tsx) | 발자국 애니메이션 0.9초 |
| S1 이름 짓기 | [src/screens/NamingScreen.tsx](src/screens/NamingScreen.tsx) | 선물 상자 2개 → 추천 이름 4개 / 직접 입력(1~6글자) |
| S2 홈 | [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) | 체크판 8칸, 하트 게이지, 집, 밥·물그릇, 쓰다듬기(보상 없음), "다음에 할 일" 하나만 반짝 |
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
| S12 집 업그레이드 | [src/screens/HouseScreen.tsx](src/screens/HouseScreen.tsx) | 박스집 → 나무집(60) → 2층 집(120) → 성(200). **홈의 강아지집을 누르면** 들어갑니다 |
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

## 남은 것 — 배포 (사람이 한 번 해야 하는 일)

1. 이 작업 내용을 커밋하고 `main` 에 밀어 올립니다 (아직 안 했습니다 — 커밋은 `aca7889` 하나뿐입니다)
2. GitHub 저장소 → **Settings → Pages → Source 를 "GitHub Actions"** 로 바꿉니다 (한 번만)
3. 그러면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 이 밀어 올릴 때마다
   `npm ci` → `npm run typecheck` → `npm run build` → Pages 배포를 합니다.
   주소는 `https://gkdnjsdls1-stack.github.io/woof-teacher/` 가 됩니다
4. `vite.config.ts` 의 `base: './'` 라 하위 경로에서도 그대로 열립니다 — 고칠 것 없습니다

> **옷 목록은 2026-10-21 에 확정했습니다** — 강아지마다 머리 2 · 몸 2 · 얼굴 1, 가격 20/20/30/40.
> 아이가 이름이나 색을 바꾸는 건 괜찮지만 **슬롯 구성과 가격은 그대로 두세요** ([docs/DECISIONS.md](docs/DECISIONS.md) 64~67번).

## 직접 확인해야 할 것 (아직 못 한 것)

1. **하루 전체 플레이 시간 재기** — 1단계만일 때 약 3분. 3단계까지 붙은 지금 처음부터 끝까지 다시 재야 합니다 (목표 10~15분)
2. 폰(360px 폭) 실기기 — **출근 준비의 터치 드래그**, 목욕 드래그, 한글 이름 입력(IME)
   (3단계 화면은 375px 폭에서 글씨 18px·탭 56px 을 측정으로 확인했습니다)
3. `npm run build` 결과물에서 `?debugDate` 가 무시되는지
4. 빌드 결과물을 폰에서 "홈 화면에 추가" → 아이콘·이름, 비행기 모드에서 다시 열리는지

항목별 상태는 [docs/CHECKLIST.md](docs/CHECKLIST.md) 에 표로 있습니다.

## 생각만 해보고 아직 안 한 것

| 안 한 것 | 하면 좋은 때 |
|---|---|
| **아이에게 보여줄 질문지** — 추천 이름, 그림 방향 (옷 목록은 확정됨) | 아무 때나 |
| **실제 그림** — 지금은 SVG 플레이스홀더입니다 ([TBD] 2번) | 아이와 정한 뒤 |
| **화면 테스트** — reducer 는 `npm test` 로 보지만 화면은 사람 눈으로만 봤습니다 | 손볼 일이 잦아지면 |

## 참고 문서

- [docs/FILES.md](docs/FILES.md) — **파일 전체 지도**
- [SPEC.md](SPEC.md) — 원본 기획 명세
- [CLAUDE.md](CLAUDE.md) — 절대 원칙과 코드 규칙
- [docs/DECISIONS.md](docs/DECISIONS.md) — 구현하면서 내린 판단과 이유
- [docs/CHECKLIST.md](docs/CHECKLIST.md) — SPEC 13번 체크리스트 현황
- [docs/REVIEW.md](docs/REVIEW.md) — 코드 검토 기록
- [README.md](README.md) — 실행 방법과 폴더 구조
