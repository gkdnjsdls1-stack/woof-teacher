# 그림 (AI) — 현재 상태와 남은 것

45장이 `public/art/` 에 들어가 있습니다. 합쳐 **1.3 MB** (WebP).

```
dog/     10  닥스훈트·푸들 × 기쁨·배고픔·졸림·아픔·자는중
outfit/  12  dx_ 6 · pd_ 6
prop/    13
bg/      10  세로 720×1280
```

원본은 다운로드 폴더에 그대로 있고, `python3 scripts/import-art.py` 로 언제든 다시 만듭니다.
어느 파일이 무엇인지는 `scripts/art-sources.json` 에 있습니다 (Gemini 파일명이 난수라서).

## ⚠ Gemini 투명 배경은 가짜입니다

Gemini 가 주는 "투명 배경" PNG 는 **체크무늬가 픽셀로 그려져** 있습니다 — 알파 채널이 전부
불투명입니다. 그대로 넣으면 배경 위에 회색 격자 네모가 뜹니다.
`scripts/import-art.py` 가 떼어냅니다. 받으신 그대로 다운로드에 두고 알려주세요.

## 남은 것 — 병원 배경 하나 (선택)

`bg/hospital` 만 그림체가 다릅니다. 나머지 9장은 윤곽선 있는 납작한 벡터인데 병원은 윤곽선 없이
부드럽게 렌더링돼 있습니다. 색조는 맞아서 못 쓸 정도는 아닙니다. 다시 뽑으려면 **다른 배경 한 장을
참조 이미지로 첨부**하고 아래로 돌리세요.

```text
A bright, warm animal clinic waiting room, in the exact same art style as the attached
reference background: flat vector illustration with clean visible outlines, soft even
shading, warm pastel palette, children's storybook look. Cosy and reassuring, absolutely
not scary: no syringes, no needles, no medical equipment, no blood. No text, no letters,
no watermark. Empty scene with no characters and no animals anywhere. Large uncluttered
space in the middle and lower half, because buttons and text will be placed on top.
Soft, low contrast. Vertical portrait composition, 9:16.
```

## 흰 배경이 투명 배경보다 낫습니다

속이 비치는 물건(안경알·비누 거품)은 "투명 배경"으로 받으면 체크무늬가 그 색에 물들어 들어가
떼어낼 수 없습니다. **흰 배경으로 받으면 깨끗하게 떨어집니다.** 프롬프트 끝에 넣으세요:

```text
Place the object on a plain solid pure white background. Do NOT make the background
transparent. Do NOT draw a checkerboard pattern.
```

## 그림체 기준

전부 **닥스훈트 5장**에 맞춰져 있습니다. 새로 뽑을 때는 **닥스훈트 그림 한 장을 참조 이미지로
첨부**하고, 프롬프트에 아래를 넣으세요. 안 넣으면 그림체가 갈라집니다
(푸들 1차가 혼자 chibi 스타일로 나왔던 이유 — 2026-10-31).

```text
in the exact same art style as the attached reference image. Match the reference: the
same clean dark brown outline of even medium thickness around the whole silhouette,
the same soft airbrush shading with gentle highlights, the same warm pastel palette.
Do NOT use a chibi big-head style. Do NOT use a flat sticker style.
```

## 화면 연결 — 끝남 (2026-10-31)

45장이 전부 화면에 붙었습니다. 자리 수치는 [src/assets/geometry.ts](../src/assets/geometry.ts) 한 곳에 있고,
주소는 [src/assets/art.ts](../src/assets/art.ts) 의 `art()` · `screenBg()` 가 만듭니다.

| 쓰는 곳 | 어떻게 |
|---|---|
| 강아지 10장 | `Dog.tsx` 가 `<img>` 로 깔고 옷을 겹칩니다. 푸들은 `scale 0.85` — 같은 폭으로 그리면 훨씬 커 보입니다 |
| 옷 12장 | `OUTFIT_PLACEMENT` 의 `{x, y, w}` (강아지 그림 가로·세로의 %). 망토·날개는 `behind: true` |
| 배경 10장 | `screenBg(이름, 'light' \| 'dark' \| 'quiet')` — 화면 root 의 style |
| 소품 11장 | `Props.tsx` 의 `<img>` 한 줄 |

**아직 SVG 인 것** — 그림 한 장으로는 못 그립니다:

- `DogHouse` — 단계가 상자·나무집·2층·성 4개인데 그림은 나무집 한 장뿐입니다. 한 칸만 그림으로 바꾸면
  `HouseScreen` 이 둘을 나란히 보여줘서 그림체가 갈라집니다. **`prop/dog-house.webp` 는 지금 안 씁니다** —
  나머지 세 단계를 같은 그림체로 뽑으면 그때 넷 다 바꾸세요.
- `ClockFace` — 시곗바늘이 문제마다 움직입니다. `prop/clock.webp` 는 테두리뿐이라 안 씁니다.
- `Student` — 그림이 없습니다.
- `Collar` — `prop/leash.webp` 는 **손에 드는 줄**이라 강아지 위에 올리면 공중에 뜬 것처럼 보입니다.
  강아지한테는 목에 두른 띠만 그리고, 줄 그림은 고르는 자리에만 씁니다.

## 수치를 고칠 때

[src/assets/geometry.ts](../src/assets/geometry.ts) 의 숫자만 바꾸고 화면에서 눈으로 봅니다.
`localStorage` 로 옷을 한꺼번에 입혀두면 빠릅니다 (브라우저 콘솔):

```js
const K = 'dogapp:save:v1', s = JSON.parse(localStorage.getItem(K));
s.dogs.dachshund.outfit = { head: 'dx_cap', face: 'dx_sunglasses', body: 'dx_jacket' };
s.dogs.poodle.outfit = { head: 'pd_ribbon', face: 'pd_heartglasses', body: 'pd_dress' };
localStorage.setItem(K, JSON.stringify(s)); location.reload();
```

## 남은 것

- `bg/hospital` 그림체 (위 프롬프트 참고) — 화면에서는 티가 크게 나지 않아 급하지 않습니다.
- 밥·물그릇은 "빈 그릇" 그림이 없어서 색을 빼고 흐리게 처리했습니다. 빈 그릇을 뽑으면 더 또렷해집니다.
- 강아지집 나머지 3단계.
