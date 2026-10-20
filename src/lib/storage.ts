/** localStorage 한 곳에만 저장합니다. 서버·로그인·계정 없음. */

import { SAVE_KEY, SAVE_VERSION } from '../constants';
import type { SaveData } from '../types';

/** 강아지 하나가 쓸 수 있는 모양인지 (배열 칸이 비어 있으면 화면이 깨집니다) */
function looksLikeDog(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const dog = value as Record<string, unknown>;
  return (
    typeof dog.name === 'string' &&
    typeof dog.hearts === 'number' &&
    typeof dog.houseLevel === 'number' &&
    typeof dog.outfit === 'object' &&
    dog.outfit !== null &&
    Array.isArray(dog.ownedOutfits) &&
    Array.isArray(dog.milestones)
  );
}

function looksLikeSave(value: unknown): value is SaveData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<SaveData>;
  return (
    v.version === SAVE_VERSION &&
    typeof v.coins === 'number' &&
    typeof v.lastPlayedDate === 'string' &&
    !!v.dogs &&
    looksLikeDog(v.dogs.dachshund) &&
    looksLikeDog(v.dogs.poodle) &&
    !!v.today &&
    typeof v.today.date === 'string' &&
    !!v.today.done &&
    !!v.today.lesson &&
    Array.isArray(v.today.lesson.solved) &&
    !!v.settings &&
    typeof v.settings.muted === 'boolean' &&
    !!v.playtimeLog
  );
}

export function loadSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!looksLikeSave(parsed)) return null;
    return parsed;
  } catch {
    // 저장이 깨졌거나 localStorage 를 못 쓰는 환경 → 새로 시작합니다.
    return null;
  }
}

export function writeSave(save: SaveData): void {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // 저장 실패는 조용히 넘깁니다 (아이에게 오류를 보여주지 않습니다).
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* 무시 */
  }
}
