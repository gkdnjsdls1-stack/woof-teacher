# tools — 앱에 들어가지 않는 보조 도구

여기 있는 파일은 **앱 코드가 아닙니다.** 빌드에도 포함되지 않습니다(`src` 밖이라 `tsc` 가 보지 않습니다).

## WoofIcon.cs — 홈 화면 아이콘 PNG 만들기

`public/icon.svg` 와 **같은 좌표·같은 색**으로 아이콘을 다시 그려
`public/icon-192.png`, `public/icon-512.png` 를 만듭니다.

아이폰 홈 화면 아이콘은 PNG 만 받기 때문에 PNG 가 따로 필요합니다.
**그림을 바꾸면 SVG 와 PNG 가 따로 놀게 되므로, 둘을 같이 고쳐야 합니다.**

### 쓰는 법 (Windows, Node 없이)

프로젝트 폴더에서 PowerShell 로:

```powershell
Add-Type -Path .\tools\WoofIcon.cs -ReferencedAssemblies System.Drawing
[WoofIcon]::Make("$PWD\public")
```

`.NET Framework` 의 GDI+ 를 쓰므로 Windows 에서는 아무것도 설치하지 않아도 됩니다.
(같은 PowerShell 세션에서 두 번 `Add-Type` 하면 "이미 있는 타입" 오류가 납니다. 새 창에서 다시 실행하세요.)

### 맥·리눅스거나 Node 가 있다면

이 파일을 쓸 필요 없이, `icon.svg` 를 192·512 PNG 로 내보내 같은 이름으로 덮어쓰면 됩니다.
(`sharp`, `resvg`, 온라인 SVG→PNG 변환기 등 무엇이든 괜찮습니다.)

### 좌표를 바꿀 때

`icon.svg` 와 `WoofIcon.cs` 는 같은 도형을 두 가지 방식으로 적어 둔 것입니다.

| SVG | C# |
|---|---|
| `<circle cx cy r>` | `FillEllipse(brush, cx-r, cy-r, 2r, 2r)` |
| `<ellipse cx cy rx ry>` | `FillEllipse(brush, cx-rx, cy-ry, 2rx, 2ry)` |
| `q` (2차 베지에) | `Quad(...)` 가 3차로 바꿔 그립니다 |
| 위로 휜 눈 `q20,-26 40,0` | `DrawArc(pen, x, y-13, 40, 26, 180, 180)` |

아이콘 그림은 **가운데 80% 안**에 있어야 합니다. 안드로이드가 아이콘을 원형·물방울 모양으로 잘라도
귀가 잘리지 않게 하기 위해서입니다 (maskable 안전 영역).
