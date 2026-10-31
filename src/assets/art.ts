/**
 * `public/art/` 그림 파일 주소.
 * base 가 './' 라 하위 경로 배포에서도 열리도록 BASE_URL 을 붙입니다.
 */
export const art = (path: string): string => `${import.meta.env.BASE_URL}art/${path}.webp`;

type Veil = 'light' | 'dark' | 'quiet';

/**
 * 화면 배경 그림. 화면 root 의 style 에 그대로 넣습니다.
 *
 * 위아래에 얇은 막을 한 겹 깝니다 — 체크판·제목·안내 문구가 그림 위에 바로 놓이면
 * 글씨가 묻힙니다. 체크판에 흰 카드를 줄 수는 없으니(누를 수 없는 것은 버튼처럼
 * 그리지 않는다) 배경 쪽을 연하게 합니다. 가운데는 비워 두어 방이 보이게 합니다.
 *
 * `quiet` 는 고를 거리가 빽빽한 화면(옷 입히기·옷가게·강아지집)용입니다 —
 * 그림이 목록과 싸우지 않게 전체를 고르게 덮습니다.
 */
export const screenBg = (name: string, veil: Veil = 'light') => {
  const tint = veil === 'dark' ? '26, 27, 48' : '255, 250, 243';
  const film =
    veil === 'quiet'
      ? `rgba(${tint}, 0.8) 0%, rgba(${tint}, 0.8) 100%`
      : `rgba(${tint}, 0.88) 0%, rgba(${tint}, 0.6) 18%, rgba(${tint}, 0) 38%, ` +
        `rgba(${tint}, 0) 60%, rgba(${tint}, 0.5) 86%, rgba(${tint}, 0.72) 100%`;
  return { backgroundImage: `linear-gradient(180deg, ${film}), url(${art(`bg/${name}`)})` };
};
