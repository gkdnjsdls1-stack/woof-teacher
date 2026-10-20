# HANDOFF — 지금까지 한 일과 이어서 할 일

작성 시점: **2026-10-20**
작업 환경: Windows 11 / PowerShell / **Node.js 미설치**

## 한 줄 상태

SPEC 12번 **"1단계 MVP"의 코드를 전부 작성했지만, 한 번도 실행하거나 타입 검사를 하지 못했습니다.**
작업하던 PC에 Node.js가 없었고, 사용자가 설치 없이 코드만 받기로 결정했기 때문입니다.

## ⚠️ 이어받으면 가장 먼저 할 일

```bash
npm install
```

```bash
npm run typecheck
```

빌드가 한 번도 돌지 않았으므로 **타입 오류가 남아 있을 가능성이 있습니다.** 위 두 명령으로 먼저 잡아 주세요.
(작성할 때 `noUnusedLocals` / `noUnusedParameters` / `strict` 를 켜 두었고, 사람 눈으로 import·사용처를 한 번 훑어 맞췄지만 컴파일러로 확인한 것은 아닙니다.)

그다음:

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열고 아래 "직접 확인할 것"을 따라가면 됩니다.

## 무엇이 되어 있나 (1단계 MVP)

| 화면 | 파일 | 내용 |
|---|---|---|
| S0 로딩 | [src/screens/LoadingScreen.tsx](src/screens/LoadingScreen.tsx) | 발자국 애니메이션 0.9초 |
| S1 이름 짓기 | [src/screens/NamingScreen.tsx](src/screens/NamingScreen.tsx) | 선물 상자 2개 흔들림 → 탭 → "짠" 등장 → 추천 이름 4개 / 직접 입력(1~6글자, 공백만 불가, 같은 이름 금지) → "○○, △△ 잘 부탁해! 🐾" |
| S2 홈 | [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) | 체크판 8칸, 하트 게이지 2개, 집 2채, 밥·물그릇, 쓰다듬기(보상 없음), "다음에 할 일" 버튼 하나만 반짝, 반김 연출 |
| S3 옷 입히기 | [src/screens/DressScreen.tsx](src/screens/DressScreen.tsx) | 강아지 탭 2개, 슬롯 머리/몸/얼굴, 무료 1벌 착용, 나머지는 🔒+가격 미리보기 |
| S11 목욕 | [src/screens/WashScreen.tsx](src/screens/WashScreen.tsx) | 거품 문지르기(드래그·탭) → 샤워기로 헹구기 → 수건으로 닦기 → 반짝 |
| 재우기 | [src/screens/SleepScreen.tsx](src/screens/SleepScreen.tsx) | 불 끄기 → "쿨쿨 💤" → 화면 어두워짐 |
| S13 밤·내일 예고 | [src/screens/NightScreen.tsx](src/screens/NightScreen.tsx) | 자는 강아지, 예고 카드 3장, "내일 또 만나요 🌙", **종료 버튼 없음** |

- 하루 흐름: 밥(+5) → 물(+3) → 옷(+3) → 씻기(+5) → 재우기(+2) = 하루 18점
- 호감도 시작 30, 최대 100. 꼬리 흔들기는 50점부터 (SPEC 6-1 단계 이벤트 중 50만 구현)
- 같은 날 다시 열면 자는 강아지 화면만 보이고 모든 메뉴·보상이 잠깁니다
- 새 하루: 자정 기준 날짜 변경 시 리셋, 빈 날 하루당 −2(최저 20), 과거 날짜는 무시
- 저장: `localStorage` 키 `dogapp:save:v1`

## 먼저 해둔 밑작업 (화면만 붙이면 되는 것)

- **수업 문제 생성기** — [src/lib/lessons.ts](src/lib/lessons.ts). 요일별 5종(숫자 세기·한글 낱말·짝 맞추기·덧셈뺄셈·시계 보기)을 **순수 함수**로 만들어 두었습니다. 화면 없이 돌아가고, 같은 시드면 같은 문제가 나옵니다.
  ```ts
  const lesson = buildLesson(save.today.lesson.type, save.today.lesson.seed);
  ```
- **그림-낱말 데이터 44쌍** — [src/data/words.ts](src/data/words.ts). 2~3글자 낱말만. 낱말을 더 넣으려면 이 배열에만 추가하면 됩니다.
- **코인 경제 규칙** — [src/state/economy.ts](src/state/economy.ts). 옷 구매와 집 업그레이드의 판정이 전부 여기 있고, reducer 와 화면이 **같은 함수**를 씁니다 (`canBuyOutfit` / `canUpgradeHouse` / `houseUpgradeCost` / `coinsToNextHouse`). reducer 에는 `BUY_OUTFIT`·`UPGRADE_HOUSE` 액션이 들어가 있어 코인이 음수가 되거나 같은 옷을 두 번 사는 일이 생기지 않습니다.
- **호감도 단계 이벤트** — 80을 넘으면 선물 옷(닥스훈트 영웅 망토 / 푸들 요정 날개)이 `ownedOutfits` 에 자동으로 들어갑니다. 50·80·100 축하 연출은 `GameState.celebrations` 큐에 쌓이고 `DISMISS_CELEBRATION` 으로 하나씩 비웁니다. **큐를 그려주는 화면만 3단계에서 만들면 됩니다.**
- **PWA** — [public/manifest.webmanifest](public/manifest.webmanifest), [public/icon.svg](public/icon.svg), [public/sw.js](public/sw.js). 홈 화면 추가와 오프라인 캐시가 들어갔습니다. 서비스 워커는 **빌드 결과물에서만** 등록됩니다(개발 중에는 캐시 때문에 수정이 안 보이는 일을 막기 위해).

## 무엇이 없나

- **2단계** — 목줄·입마개, 오픈카 드라이브, 교실 화면, 코인 획득, 주말 소풍 (문제 생성기는 위에 있음)
- **3단계 화면** — 옷가게(S4), 집 업그레이드(S12), 산책(S8), 미용실(S9), 축하 연출 (상태 로직은 위에 있음). 산책·미용실을 넣을 때는 [src/state/selectors.ts](src/state/selectors.ts)의 `canDo()` 에 `walk`·`groom` 순서를 추가하고 체크판의 `stage` 를 `1` 로 바꾸면 홈의 "다음에 할 일"이 이어집니다
- **4단계** — 아픔 이벤트, 병원, 보호자 설정(톱니 3초 길게), 플레이 시간 기록, 배포
- 효과음은 WebAudio로 합성한 임시 소리입니다 (실제 음원 파일 없음). 음소거 버튼은 동작합니다.
- 아이콘은 **SVG 1장 + PNG 2장**(192·512)이 따로 있습니다. 그림을 바꾸려면 [public/icon.svg](public/icon.svg) 와 PNG 두 장을 **같이** 바꿔야 합니다. PNG 를 다시 만드는 방법은 [docs/REVIEW.md](docs/REVIEW.md) 끝에 적어 두었습니다.

데이터 모델([src/types.ts](src/types.ts))과 수치([src/constants.ts](src/constants.ts))는 4단계까지 미리 들어가 있습니다.
코인 비용, 집 업그레이드 가격, 아픔 확률(3일 유예·10%·7일 쿨다운), 요일별 수업 종류, 주말 소풍까지 상수와 타입이 준비돼 있어 **기능만 붙이면 됩니다.**

## 직접 확인할 것 (아직 아무도 못 해봤습니다)

1. 첫 실행 → 이름 짓기 → 하루 한 바퀴를 끝까지 돌리기. 몇 분 걸리는지 재보기 (1단계만이면 3~5분 예상)
2. 재우기까지 끝낸 뒤 **새로고침** → 자는 강아지 화면만 나오는지, 버튼이 다 잠겼는지
3. `?debugDate=` 로 날짜를 **하루** 넘기기 → 체크판이 비워지고 다시 할 수 있는지
4. 날짜를 **3일** 넘기기 → 호감도가 −4 되고 "보고 싶었어 월월! 💕" 반김 연출이 뜨는지
5. 날짜를 **과거로** 돌리기 → 새 하루가 생기지 않는지
6. 폰(360px 폭)에서 버튼이 다 눌리는지, 한글 이름 입력이 폰 키보드로 잘 되는지
7. `npm run build` 결과물에서 `?debugDate` 가 **무시되는지**
8. 빌드한 결과물을 폰에서 열고 **"홈 화면에 추가"** 가 되는지, 아이콘과 이름("월월 선생님")이 제대로 보이는지
9. 한 번 연 뒤 **비행기 모드**에서 다시 열리는지 (서비스 워커 캐시)

항목별 상태는 [docs/CHECKLIST.md](docs/CHECKLIST.md)에 표로 정리해 두었습니다.

## 다음 단계 작업 순서 제안 (2단계 — 출근 & 수업)

SPEC 7번·12번 2단계 기준입니다.

1. **출근 준비 화면(S5)** — 목줄·입마개를 강아지에게 드래그해 착용, 둘 다 착용해야 출발 버튼 활성
2. **오픈카 이동(S6)** — 빨간 오픈카, 뒷자리 강아지 2마리, 귀 펄럭, 탭하면 "빵빵!"(보상 없음), 10~15초
3. **교실(S7)** — 1학년 학생 4~6명, 문제 3개, 정답 시 박수 + 강아지 "월월!", 오답은 "다시 해볼까?" 후 재시도
4. **미니게임 5종 화면** — 문제 생성은 [src/lib/lessons.ts](src/lib/lessons.ts)의 `buildLesson()`이 이미 해줍니다. 남은 일은 `Question` 종류별 **그리기**뿐입니다 (숫자 세기: 그림을 `count`개 나열 / 낱말: 이모지 1개 + 보기 3개 / 짝 맞추기: 카드 6장 뒤집기 / 덧셈뺄셈: 식 + 보기 3개 / 시계: `choices`의 시각으로 시계 3개 그리기)
5. **코인** — 문제당 첫 정답에만 10코인, 하루 최대 30. `solved: boolean[]` 로 중복 지급 차단. **반드시 reducer의 `REWARD` 경로를 쓸 것** (코인 지급 액션을 새로 만들더라도 "이미 받았으면 즉시 반환"을 같은 방식으로 지킬 것)
6. **주말 소풍** — 토·일은 수업 대신 소풍, 15코인. `buildLesson`이 주말에는 `{ type: 'picnic' }` 을 돌려줍니다

구현할 때 체크판의 `commute`·`lesson` 칸 `stage: 2` 를 `1` 로 바꾸고, `MVP_FLOW` 와 `canDo()` 에 순서를 넣으면 홈의 "다음에 할 일"이 자동으로 이어집니다.

## 생각만 해보고 아직 안 한 것

나중에 "이건 왜 안 했지?" 하지 않도록, 검토했지만 손대지 않은 것을 적어 둡니다.

| 안 한 것 | 하면 좋은 때 |
|---|---|
| **GitHub Actions 로 빌드 검증** — 워크플로 하나를 넣어두면 밀어 올릴 때마다 클라우드에서 `npm ci`·타입 검사·빌드가 돌아 **Node 설치 없이** 통과 여부를 알 수 있습니다. 배포(GitHub Pages)까지 같이 묶을 수 있습니다 | 저장소를 만든 뒤 |
| **아이에게 보여줄 질문지** — [TBD] 세 가지(옷 목록 5+5, 추천 이름, 그림 방향)를 아이가 고르기 쉽게 그림·보기 중심으로 만드는 것 | 2~3단계 들어가기 전 (옷 목록이 그때 필요합니다) |
| **테스트 코드** — reducer 는 순수 함수라 테스트하기 좋습니다 (하루 1회 제한, 날짜 되돌림, 코인 음수 방지) | Node 가 있는 기기에서 |
| **보호자 설정·플레이 시간 기록** | 4단계 |

## 참고 문서

- [docs/FILES.md](docs/FILES.md) — **파일 전체 지도.** 어떤 파일이 무슨 역할인지 한 표에

- [SPEC.md](SPEC.md) — 원본 기획 명세 (전체)
- [CLAUDE.md](CLAUDE.md) — 지켜야 할 원칙과 코드 규칙
- [docs/DECISIONS.md](docs/DECISIONS.md) — 구현하면서 내린 판단과 그 이유
- [docs/REVIEW.md](docs/REVIEW.md) — 코드 검토 기록 (사람 눈으로 확인한 것 / 고친 것 / 확인 못 한 것)
- [docs/CHECKLIST.md](docs/CHECKLIST.md) — SPEC 13번 테스트 체크리스트 현황
- [docs/NAMING.md](docs/NAMING.md) — 앱 이름 후보 (아직 미확정)
- [README.md](README.md) — 실행 방법과 폴더 구조
