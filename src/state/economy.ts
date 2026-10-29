/**
 * 코인 규칙 (2단계 벌기 — 3단계 쓰기: 옷가게 · 강아지집 업그레이드).
 *
 * 규칙은 **이 파일 한 곳에만** 둡니다.
 * reducer 가 실제로 코인을 깎을 때도 여기 함수로 먼저 확인하고,
 * 화면은 같은 함수로 버튼을 켤지 말지 정합니다. 둘이 어긋날 일이 없습니다.
 *
 * 순수 함수이므로 화면 없이도 돌아갑니다.
 */

import {
  COINS_WEEKEND_PICNIC,
  COIN_PER_LESSON_QUESTION,
  HOUSE_LEVEL_NAMES,
  HOUSE_MAX_LEVEL,
  HOUSE_UPGRADE_COSTS,
  OUTFITS,
} from '../constants';
import type { DogId, OutfitDef, SaveData } from '../types';

/* ─────────────────── 코인 벌기 (2단계 수업) ───────────────────
 * reducer 가 지급할 때와 화면이 "얼마 받았어요"를 보여줄 때
 * **같은 함수**를 씁니다.
 */

/** 문제 하나(또는 소풍 한 번)에 받는 코인 */
export function lessonCoinGain(lessonType: string): number {
  return lessonType === 'picnic' ? COINS_WEEKEND_PICNIC : COIN_PER_LESSON_QUESTION;
}

/** 오늘 수업에서 이미 받은 코인 합계 */
export function lessonCoinsEarned(save: SaveData): number {
  const { type, solved } = save.today.lesson;
  return solved.filter(Boolean).length * lessonCoinGain(type);
}

/* ───────────────────────── 옷 ───────────────────────── */

export function outfitById(id: string): OutfitDef | undefined {
  return OUTFITS.find((outfit) => outfit.id === id);
}

/** 그 강아지가 가진 옷인지 */
export function isOwned(save: SaveData, dogId: DogId, outfitId: string): boolean {
  return save.dogs[dogId].ownedOutfits.includes(outfitId);
}

/** 옷가게에 걸리는 옷 목록 (그 강아지 것만) */
export function shopOutfits(dogId: DogId): OutfitDef[] {
  return OUTFITS.filter((outfit) => outfit.dog === dogId && outfit.source === 'shop');
}

/** 지금 살 수 있는지 — 가게 옷 / 자기 옷 / 아직 없음 / 코인 충분 */
export function canBuyOutfit(save: SaveData, dogId: DogId, outfitId: string): boolean {
  const outfit = outfitById(outfitId);
  if (!outfit) return false;
  if (outfit.source !== 'shop') return false; // 선물 옷은 코인으로 살 수 없습니다
  if (outfit.dog !== dogId) return false;
  if (isOwned(save, dogId, outfitId)) return false;
  return save.coins >= outfit.price;
}

/** 오늘의 새 옷 (날마다 바뀜 — `DayState.todayShopItem`) */
export function todayShopOutfit(save: SaveData): OutfitDef | undefined {
  return outfitById(save.today.todayShopItem);
}

/* ───────────────────────── 강아지집 ───────────────────────── */

export function houseLevelName(level: number): string {
  return HOUSE_LEVEL_NAMES[level] ?? HOUSE_LEVEL_NAMES[0];
}

/** 다음 단계 (성이면 null) */
export function nextHouseLevel(save: SaveData, dogId: DogId): 1 | 2 | 3 | null {
  const level = save.dogs[dogId].houseLevel + 1;
  if (level > HOUSE_MAX_LEVEL) return null;
  return level as 1 | 2 | 3;
}

/** 다음 단계로 올리는 비용 (성이면 null) */
export function houseUpgradeCost(save: SaveData, dogId: DogId): number | null {
  const level = nextHouseLevel(save, dogId);
  return level === null ? null : HOUSE_UPGRADE_COSTS[level];
}

export function canUpgradeHouse(save: SaveData, dogId: DogId): boolean {
  const cost = houseUpgradeCost(save, dogId);
  return cost !== null && save.coins >= cost;
}

/**
 * 다음 집까지 남은 코인 (내일 예고에 쓰는 "나무집까지 코인 20개 남았어요!").
 * 성이면 null, 이미 충분하면 0.
 */
export function coinsToNextHouse(save: SaveData, dogId: DogId): number | null {
  const cost = houseUpgradeCost(save, dogId);
  return cost === null ? null : Math.max(0, cost - save.coins);
}

/** 두 집을 모두 성으로 만드는 데 드는 총 코인 (장기 목표 안내용) */
export function totalCoinsForBothCastles(): number {
  const perHouse = HOUSE_UPGRADE_COSTS.reduce<number>((sum, cost) => sum + cost, 0);
  return perHouse * 2;
}
