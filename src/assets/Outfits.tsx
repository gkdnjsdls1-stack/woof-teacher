/**
 * 옷 — 그림은 `public/art/outfit/<id>.webp`, 입히는 자리는 `geometry.ts` 의
 * `OUTFIT_PLACEMENT`, 겹쳐 그리는 건 `Dog.tsx` 가 합니다.
 * 여기 남은 건 목록·버튼에 쓰는 아이콘뿐입니다.
 */

export const OUTFIT_EMOJI: Record<string, string> = {
  dx_bowtie: '👔',
  dx_sunglasses: '🕶️',
  dx_cap: '🧢',
  dx_police: '👮',
  dx_jacket: '🧥',
  pd_ribbon: '🎀',
  pd_heartglasses: '💖',
  pd_flowerpin: '🌸',
  pd_dress: '👗',
  pd_cape: '🧣',
  // 호감도 80 선물 옷
  dx_hero_cape: '🦸',
  pd_fairy_wings: '🧚',
};
