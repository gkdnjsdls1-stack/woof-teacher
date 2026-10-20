/**
 * 날짜 유틸 — "현실의 하루 = 게임의 하루"
 * 모든 날짜는 기기의 **현지 시간** 기준 'YYYY-MM-DD' 문자열입니다.
 *
 * 개발용: ?debugDate=2026-10-21 로 날짜를 강제할 수 있습니다.
 * → `import.meta.env.DEV` 가 true 인 개발 모드에서만 동작하고,
 *   `npm run build` 로 만든 결과물에서는 완전히 무시됩니다.
 */

const DEBUG_DATE_PARAM = 'debugDate';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Date → 'YYYY-MM-DD' (현지 기준) */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 'YYYY-MM-DD' → 현지 자정 Date */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 개발 모드에서만 유효한 강제 날짜. 그 외에는 항상 null */
export function getDebugDate(): string | null {
  if (!import.meta.env.DEV) return null;
  try {
    const raw = new URLSearchParams(window.location.search).get(DEBUG_DATE_PARAM);
    if (!raw || !DATE_RE.test(raw)) return null;
    // 2026-02-31 처럼 말이 안 되는 날짜는 거릅니다.
    const d = parseLocalDate(raw);
    return formatLocalDate(d) === raw ? raw : null;
  } catch {
    return null;
  }
}

/** 오늘 날짜 (개발 모드에서 ?debugDate 가 있으면 그 값) */
export function getTodayString(): string {
  return getDebugDate() ?? formatLocalDate(new Date());
}

/** 날짜 문자열에 일수 더하기 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/** b - a (일수). 서머타임 영향을 피하려고 정오 기준으로 계산합니다. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ms = Date.UTC(by, bm - 1, bd, 12) - Date.UTC(ay, am - 1, ad, 12);
  return Math.round(ms / 86_400_000);
}

/** 0=일요일 … 6=토요일 */
export function weekdayIndex(dateStr: string): number {
  return parseLocalDate(dateStr).getDay();
}

export function isWeekend(dateStr: string): boolean {
  const w = weekdayIndex(dateStr);
  return w === 0 || w === 6;
}
