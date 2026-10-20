# 코드 검토 기록 (2026-10-20)

Node.js 가 없는 환경이라 **컴파일러 대신 사람 눈으로** 전체를 훑은 기록입니다.
`npm run typecheck` 를 대신하지는 못하지만, 어디를 어떻게 확인했는지 남겨 두면
다른 기기에서 오류가 났을 때 중복으로 찾지 않아도 됩니다.

## 무엇을 확인했나

| 확인한 것 | 방법 | 결과 |
|---|---|---|
| import 한 이름이 전부 실제로 export 되어 있는지 | `src` 전체의 import 문과 export 문 대조 | 이상 없음 |
| 쓰지 않는 import·변수 (`noUnusedLocals` 로 빌드가 깨짐) | 파일별로 import 목록과 사용처 대조 | 이상 없음 |
| `React.` 네임스페이스 사용 (import 없이 쓰면 오류) | 전체 검색 | 없음 (`type ReactNode`, `type PointerEvent` 로 가져다 씀) |
| `any` / `@ts-ignore` 로 덮은 곳 | 전체 검색 | 없음 |
| JSX 의 className 이 CSS 에 있는지 | className 목록과 `styles.css` 선택자 대조 | 전부 있음 (`.slot`, `.wash__tub--rinse/done` 은 규칙이 없지만 스타일이 필요 없는 칸) |
| 절대 원칙 3번 (반복 보상 차단) | 보상 경로를 따라가며 확인 | reducer 의 `REWARD` 한 곳만 통과. 빠른 연속 탭으로 중복 지급이 안 되는 것도 확인 |
| 코인이 음수가 되는 경로 | `BUY_OUTFIT`·`UPGRADE_HOUSE` 가드 확인 | `economy.ts` 판정을 통과해야만 깎임 |
| 날짜 되돌림·자정 처리 | `dayCheck` 와 `GameContext` 의 이벤트 확인 | `today.date`·`lastPlayedDate` 둘 다 비교, `visibilitychange`+`focus`+30초 확인 |

## 고친 것

| 파일 | 내용 | 왜 |
|---|---|---|
| [src/lib/storage.ts](../src/lib/storage.ts) | 저장 검사를 강화 — 강아지의 `ownedOutfits`·`milestones` 배열, `today.lesson.solved`, `settings.muted`, `playtimeLog` 까지 확인 | 예전 저장이나 깨진 저장이 들어오면 `settings.muted` 를 읽다가 **흰 화면**이 될 수 있었습니다. 이제는 모양이 안 맞으면 조용히 새로 시작합니다 |
| [src/screens/NamingScreen.tsx](../src/screens/NamingScreen.tsx) | `{ ...names, [dogId]: name }` → 복사한 뒤 대입하는 방식으로 | 키가 유니언 타입인 계산된 속성은 타입이 느슨해질 수 있어, reducer 에서 쓴 안전한 방식으로 통일했습니다 |
| [src/screens/NightScreen.tsx](../src/screens/NightScreen.tsx) | 예고 카드의 React key 를 문자열 → 인덱스로, 주석의 "2장"을 "3장"으로 | 예고 문구를 나중에 늘렸을 때 같은 문장이 두 장 나오면 key 가 겹칩니다 |
| [src/screens/HomeScreen.tsx](../src/screens/HomeScreen.tsx) | 물그릇 읽어주기 문구 "다 먹었어요" → "다 마셨어요" | 화면 글자와 읽어주는 글자가 달랐습니다 |
| [package.json](../package.json) | `engines.node: ">=18"` 추가 | 다른 기기에서 받을 때 필요한 Node 버전이 파일에 적혀 있도록 |
| [public/](../public) · [index.html](../index.html) | **아이폰용 PNG 아이콘 추가** (`icon-192.png`, `icon-512.png`) 후 manifest 와 `apple-touch-icon` 연결 | 아이폰 홈 화면 아이콘은 PNG 만 받습니다. 빠진 항목으로 남겨뒀던 것을 채웠습니다 |

### 아이콘 PNG 를 다시 만드는 법

그림을 바꾸면 [public/icon.svg](../public/icon.svg) 와 PNG 두 장이 따로 놀게 됩니다. 두 가지 방법이 있습니다.

1. **Node 가 있는 기기에서** — `sharp` 나 온라인 SVG→PNG 변환기로 `icon.svg` 를 192·512 로 내보내 같은 이름으로 덮어씁니다. (가장 간단)
2. **Node 없이 Windows 에서** — 이번에 쓴 방법입니다. `System.Drawing`(GDI+) 으로 SVG 와 **같은 좌표**를 다시 그려 PNG 로 저장했습니다. 그리는 코드는 PNG 안에 들어 있지 않으므로, 이 방법을 또 쓰려면 `icon.svg` 의 도형 좌표를 보고 다시 작성해야 합니다.

> 지금 PNG 는 SVG 와 같은 좌표·같은 색으로 그렸고, 가운데 80% 안전 영역 안에 있어 안드로이드가 원형으로 잘라도 귀가 잘리지 않습니다.

## 일부러 그렇게 둔 것

- **목욕 화면에서는 강아지가 옷을 벗고 있습니다.** `WashScreen` 은 `outfit` 을 넘기지 않습니다. 씻을 때 옷을 벗는 게 자연스럽고, 끝나면 홈에서 다시 입은 모습이 보입니다.
- **밥·물그릇은 "먹기 전"에도 빈 그릇**입니다. 아이가 그릇을 눌러 밥을 주는 흐름이라, 먹은 뒤에는 ✅ 와 "다 먹었어요" 로 바뀝니다.
- **코인 숫자가 항상 0**입니다. 코인을 버는 수업이 2단계라서 그렇습니다. 쓰는 쪽(구매·업그레이드)은 이미 준비돼 있습니다.
- **화면마다 🏠 돌아가기 버튼**이 있습니다. 명세에는 없지만 아이가 화면에 갇히지 않게 넣었고, 보상 없이 나가므로 진행 잠금은 그대로입니다.

## 사람 눈으로는 확인할 수 없는 것 (다른 기기에서 꼭)

1. `npm install` → `npm run typecheck` → `npm run build`
2. 하루 한 바퀴 실제 플레이 (몇 분 걸리는지 재기)
3. `?debugDate=` 로 하루 넘기기 / 3일 넘기기 / 과거로 돌리기
4. 폰 360px 폭에서 버튼·한글 이름 입력
5. 빌드 결과물에서 `?debugDate` 가 무시되는지
6. 폰에서 "홈 화면에 추가", 비행기 모드에서 다시 열리는지

항목별 현황은 [CHECKLIST.md](CHECKLIST.md) 에 있습니다.
