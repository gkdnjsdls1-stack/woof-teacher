/**
 * 데이터 모델 (SPEC.md 10번)
 * localStorage 한 곳(`dogapp:save:v1`)에만 저장합니다. 서버·로그인·계정 없음.
 */

export type DogId = 'dachshund' | 'poodle';

/** 옷 슬롯: 머리(모자·리본·핀) / 몸(옷) / 얼굴(선글라스 등) */
export type OutfitSlot = 'head' | 'body' | 'face';

/** 강아지 표정/상태 스프라이트 */
export type DogMood = 'happy' | 'hungry' | 'sleepy' | 'sick' | 'sleeping';

export interface Dog {
  id: DogId;
  name: string; // 아이가 지은 이름
  hearts: number; // 0~100
  outfit: { head?: string; body?: string; face?: string };
  ownedOutfits: string[];
  houseLevel: 0 | 1 | 2 | 3; // 박스집, 나무집, 2층 집, 성
  sickUntil?: string; // 'YYYY-MM-DD'
  lastSickDate?: string;
  milestones: number[]; // 달성한 50/80/100
}

/** 오늘의 체크판에 대응하는 하루 진행 상태 */
export interface DayDone {
  feed: boolean;
  water: boolean;
  dress: boolean;
  commute: boolean;
  lesson: boolean;
  walk: boolean;
  wash: boolean;
  sleep: boolean;
  groom: boolean;
  hospital: boolean;
}

export interface DayState {
  date: string; // 'YYYY-MM-DD' (현지)
  done: DayDone;
  lesson: { type: string; seed: number; solved: boolean[] };
  todayShopItem: string;
}

export interface SaveData {
  version: 1;
  createdAt: string;
  lastPlayedDate: string;
  coins: number;
  dogs: Record<DogId, Dog>;
  today: DayState;
  playtimeLog: Record<string, number>; // 날짜 → 초
  settings: { muted: boolean };
}

/** 보상이 있는 행동 키 (하루 1회 제한의 단위) */
export type RewardAction = keyof DayDone;

/**
 * 옷을 어떻게 얻는지
 * - `start` 시작할 때 무료로 받음
 * - `shop`  옷가게에서 코인으로 사는 옷 (3단계)
 * - `gift`  호감도 80을 넘으면 선물로 받는 옷 (코인으로 살 수 없음)
 */
export type OutfitSource = 'start' | 'shop' | 'gift';

/** 옷 정의 (그림은 src/assets/Outfits.tsx 에서 그립니다) */
export interface OutfitDef {
  id: string;
  label: string;
  dog: DogId;
  slot: OutfitSlot;
  source: OutfitSource;
  /** 가게에서 파는 옷만 1 이상입니다. start·gift 는 0 */
  price: number;
}
