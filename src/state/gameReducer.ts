/**
 * 게임 상태 (순수 reducer).
 *
 * 절대 원칙 3번을 이 파일 한 곳에서 지킵니다:
 * 보상이 있는 모든 행동은 `today.done[action]` 플래그를 통과해야 하고,
 * 이미 true 면 어떤 경우에도 호감도/코인이 다시 오르지 않습니다.
 */

import {
  COINS_START,
  FREE_OUTFITS,
  GIFT_OUTFITS,
  HEARTS_DECAY_FLOOR,
  HEARTS_DECAY_PER_MISSED_DAY,
  HEARTS_MAX,
  HEARTS_MIN,
  HEARTS_START,
  HEART_GAIN,
  LESSON_BY_WEEKDAY,
  LESSON_QUESTIONS_PER_DAY,
  MILESTONES,
  MILESTONE_KISS,
  OUTFITS,
  SAVE_VERSION,
  WELCOME_BACK_MISSED_DAYS,
} from '../constants';
import { daysBetween, weekdayIndex } from '../lib/date';
import { makeRng, pick, seedFromString } from '../lib/random';
import type { DayDone, DayState, Dog, DogId, OutfitSlot, RewardAction, SaveData } from '../types';
import { canBuyOutfit, houseUpgradeCost, nextHouseLevel, outfitById } from './economy';

/** 아직 보여주지 않은 호감도 단계 축하 연출 (저장하지 않는 일회성 값) */
export interface Celebration {
  dogId: DogId;
  /** 50 = 꼬리 흔들기 / 80 = 뽀뽀 + 선물 옷 / 100 = 왕관 */
  milestone: number;
}

export interface GameState {
  save: SaveData;
  /** 며칠 비웠는지 (0이면 반김 연출 없음) */
  missedDays: number;
  /** 앞에서부터 하나씩 보여주고 DISMISS_CELEBRATION 으로 비웁니다 */
  celebrations: Celebration[];
}

export type GameAction =
  | { type: 'NAME_DOGS'; names: Record<DogId, string> }
  | { type: 'REWARD'; action: RewardAction }
  | { type: 'EQUIP'; dogId: DogId; slot: OutfitSlot; outfitId: string | null }
  | { type: 'BUY_OUTFIT'; dogId: DogId; outfitId: string }
  | { type: 'UPGRADE_HOUSE'; dogId: DogId }
  | { type: 'DAY_CHECK'; today: string }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'DISMISS_CELEBRATION' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'RESET'; today: string };

/* ───────────────────────── 생성 ───────────────────────── */

function createDog(id: DogId): Dog {
  return {
    id,
    name: '',
    hearts: HEARTS_START,
    outfit: {},
    ownedOutfits: [FREE_OUTFITS[id]],
    houseLevel: 0,
    milestones: [],
  };
}

/** 하루 상태를 만듭니다. 수업 종류는 요일로, 문제와 오늘의 옷은 날짜를 시드로 정합니다. */
export function createDayState(date: string): DayState {
  const seed = seedFromString(date);
  const rng = makeRng(seed);
  const buyable = OUTFITS.filter((outfit) => outfit.source === 'shop');
  return {
    date,
    done: {
      feed: false,
      water: false,
      dress: false,
      commute: false,
      lesson: false,
      walk: false,
      wash: false,
      sleep: false,
      groom: false,
      hospital: false,
    },
    lesson: {
      type: LESSON_BY_WEEKDAY[weekdayIndex(date)],
      seed,
      solved: Array.from({ length: LESSON_QUESTIONS_PER_DAY }, () => false),
    },
    todayShopItem: pick(buyable, rng).id,
  };
}

export function createNewSave(today: string): SaveData {
  return {
    version: SAVE_VERSION,
    createdAt: today,
    lastPlayedDate: today,
    coins: COINS_START,
    dogs: { dachshund: createDog('dachshund'), poodle: createDog('poodle') },
    today: createDayState(today),
    playtimeLog: {},
    settings: { muted: false },
  };
}

/** 이름 짓기를 마쳤는지 */
export function isNamed(save: SaveData): boolean {
  return save.dogs.dachshund.name.length > 0 && save.dogs.poodle.name.length > 0;
}

/* ───────────────────────── 도우미 ───────────────────────── */

function clampHearts(value: number): number {
  return Math.max(HEARTS_MIN, Math.min(HEARTS_MAX, Math.round(value)));
}

/**
 * 호감도 단계(50/80/100)를 **새로** 넘었을 때의 처리.
 * 이미 `milestones` 에 적혀 있으면 아무 일도 하지 않으므로 선물은 한 번만 받습니다.
 */
function applyMilestones(dog: Dog): { dog: Dog; reached: number[] } {
  const reached = MILESTONES.filter((m) => dog.hearts >= m && !dog.milestones.includes(m));
  if (reached.length === 0) return { dog, reached };

  let next: Dog = { ...dog, milestones: [...dog.milestones, ...reached].sort((a, b) => a - b) };

  // 80: 특별 옷 1벌을 선물합니다 (SPEC 6-1)
  if (reached.includes(MILESTONE_KISS)) {
    const gift = GIFT_OUTFITS[dog.id];
    if (gift && !next.ownedOutfits.includes(gift)) {
      next = { ...next, ownedOutfits: [...next.ownedOutfits, gift] };
    }
  }

  return { dog: next, reached };
}

function addHeartsToAll(
  dogs: Record<DogId, Dog>,
  amount: number,
): { dogs: Record<DogId, Dog>; celebrations: Celebration[] } {
  if (amount === 0) return { dogs, celebrations: [] };
  const next = {} as Record<DogId, Dog>;
  const celebrations: Celebration[] = [];
  for (const id of Object.keys(dogs) as DogId[]) {
    const raised = { ...dogs[id], hearts: clampHearts(dogs[id].hearts + amount) };
    const { dog, reached } = applyMilestones(raised);
    next[id] = dog;
    for (const milestone of reached) celebrations.push({ dogId: id, milestone });
  }
  return { dogs: next, celebrations };
}

/** 안 들어온 날 하루당 −2, 단 최저 20 아래로는 내려가지 않습니다. */
function decayHearts(dogs: Record<DogId, Dog>, missedDays: number): Record<DogId, Dog> {
  if (missedDays <= 0) return dogs;
  const drop = missedDays * HEARTS_DECAY_PER_MISSED_DAY;
  const next = {} as Record<DogId, Dog>;
  for (const id of Object.keys(dogs) as DogId[]) {
    const dog = dogs[id];
    // 이미 바닥(20) 이하면 더 내리지 않습니다.
    const hearts = dog.hearts <= HEARTS_DECAY_FLOOR
      ? dog.hearts
      : Math.max(HEARTS_DECAY_FLOOR, dog.hearts - drop);
    next[id] = { ...dog, hearts };
  }
  return next;
}

/* ───────────────────────── 새 하루 ───────────────────────── */

function dayCheck(state: GameState, today: string): GameState {
  const { save } = state;
  if (today === save.today.date) return state;

  // 기기 날짜를 과거로 돌린 경우에는 새 하루로 인정하지 않습니다.
  if (daysBetween(save.today.date, today) < 0) return state;
  if (daysBetween(save.lastPlayedDate, today) < 0) return state;

  // 비운 날 수 (어제 플레이하고 오늘 다시 왔으면 0)
  const missedDays = Math.max(0, daysBetween(save.today.date, today) - 1);

  return {
    save: {
      ...save,
      dogs: decayHearts(save.dogs, missedDays),
      today: createDayState(today),
      lastPlayedDate: today,
      // 아픔 발생 판정과 "오늘의 새 옷" 알림은 4단계·3단계에서 여기에 붙습니다.
    },
    missedDays: missedDays >= WELCOME_BACK_MISSED_DAYS ? missedDays : 0,
    // 어제 못 보여준 축하 연출은 하루가 바뀌면 흘려보냅니다.
    celebrations: [],
  };
}

/* ───────────────────────── reducer ───────────────────────── */

export function gameReducer(state: GameState, action: GameAction): GameState {
  const { save } = state;

  switch (action.type) {
    case 'NAME_DOGS': {
      if (isNamed(save)) return state; // 이름은 한 번만 (변경은 보호자 설정에서)
      return {
        ...state,
        save: {
          ...save,
          dogs: {
            dachshund: { ...save.dogs.dachshund, name: action.names.dachshund },
            poodle: { ...save.dogs.poodle, name: action.names.poodle },
          },
        },
      };
    }

    case 'REWARD': {
      // ★ 하루 1회 제한: 이미 한 행동이면 아무 보상도 없습니다.
      if (save.today.done[action.action]) return state;
      const done: DayDone = { ...save.today.done };
      done[action.action] = true;
      const { dogs, celebrations } = addHeartsToAll(save.dogs, HEART_GAIN[action.action]);
      return {
        ...state,
        save: { ...save, dogs, today: { ...save.today, done } },
        celebrations: [...state.celebrations, ...celebrations],
      };
    }

    case 'EQUIP': {
      const dog = save.dogs[action.dogId];
      // 가지고 있는 옷만 입을 수 있습니다.
      if (action.outfitId && !dog.ownedOutfits.includes(action.outfitId)) return state;
      const outfit = { ...dog.outfit };
      if (action.outfitId) outfit[action.slot] = action.outfitId;
      else delete outfit[action.slot];
      return {
        ...state,
        save: {
          ...save,
          dogs: { ...save.dogs, [action.dogId]: { ...dog, outfit } },
        },
      };
    }

    case 'BUY_OUTFIT': {
      // 옷가게 (3단계). 규칙은 economy.ts 의 canBuyOutfit 한 곳에 있습니다.
      // (가게 옷만 / 그 강아지 것만 / 아직 없을 때만 / 코인 충분할 때만)
      const outfit = outfitById(action.outfitId);
      if (!outfit || !canBuyOutfit(save, action.dogId, outfit.id)) return state;
      const dog = save.dogs[action.dogId];
      return {
        ...state,
        save: {
          ...save,
          coins: save.coins - outfit.price,
          dogs: {
            ...save.dogs,
            [action.dogId]: { ...dog, ownedOutfits: [...dog.ownedOutfits, outfit.id] },
          },
        },
      };
    }

    case 'UPGRADE_HOUSE': {
      // 강아지집 업그레이드 (3단계). 성이 마지막 단계라 그다음은 없습니다.
      const level = nextHouseLevel(save, action.dogId);
      const cost = houseUpgradeCost(save, action.dogId);
      if (level === null || cost === null || save.coins < cost) return state;
      const dog = save.dogs[action.dogId];
      return {
        ...state,
        save: {
          ...save,
          coins: save.coins - cost,
          dogs: {
            ...save.dogs,
            [action.dogId]: { ...dog, houseLevel: level },
          },
        },
      };
    }

    case 'DAY_CHECK':
      return dayCheck(state, action.today);

    case 'DISMISS_WELCOME':
      return state.missedDays === 0 ? state : { ...state, missedDays: 0 };

    case 'DISMISS_CELEBRATION':
      // 앞에서부터 한 개씩 보여주고 비웁니다.
      return state.celebrations.length === 0
        ? state
        : { ...state, celebrations: state.celebrations.slice(1) };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        save: { ...save, settings: { ...save.settings, muted: !save.settings.muted } },
      };

    case 'RESET':
      return { save: createNewSave(action.today), missedDays: 0, celebrations: [] };

    default:
      return state;
  }
}
