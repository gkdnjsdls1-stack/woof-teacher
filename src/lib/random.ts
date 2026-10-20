/**
 * 날짜를 시드로 쓰는 결정적 난수.
 * 하루 안에서는 같은 결과가 나오므로 새로고침해도 문제가 고정됩니다.
 */

/** 문자열 → 32비트 시드 */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — 작고 충분히 고른 의사난수 생성기 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 배열에서 하나 고르기 */
export function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

/** 매번 달라져도 되는 가벼운 선택 (말풍선 대사 등) */
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length) % arr.length];
}
