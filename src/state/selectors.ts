/**
 * 무엇을 할 수 있는지 판단하는 곳.
 *
 * **순서 잠금은 없습니다** (2026-10-31 에 뺐습니다 — 원래는 SPEC 5-1 의
 * 밥·물·옷 → 출근 → 수업 → 산책 → 씻기 → 재우기 순서를 강제했습니다).
 * 아이가 아무 순서로나 고릅니다. 남은 조건은 둘뿐입니다:
 *   - 하루에 한 번 (`today.done`) — 절대 원칙 3번, 무한 반복 구멍을 막습니다
 *   - 병원은 아픈 날에만 — 순서가 아니라 상태 조건입니다 (SPEC 6-8)
 * 재우기를 하면 하루가 끝납니다. 순서가 아니라 "오늘은 여기까지"라는 뜻입니다.
 */

import { DOG_ORDER } from '../constants';
import type { DogId, RewardAction, SaveData } from '../types';

/** 오늘 아픈 강아지 (SPEC 6-8). 어제 아팠던 표시는 새 하루에 저절로 지워집니다. */
export function sickDogs(save: SaveData): DogId[] {
  return DOG_ORDER.filter((id) => save.dogs[id].sickUntil === save.today.date);
}

export function canDo(save: SaveData, action: RewardAction): boolean {
  // 재우고 나면 오늘은 끝입니다.
  if (save.today.done.sleep) return false;
  // 병원만 조건이 있습니다 — 아픈 강아지가 있을 때만 열립니다.
  if (action === 'hospital') return sickDogs(save).length > 0;
  // 나머지는 아무 때나, 아무 순서로나. 하루 1회 제한은 reducer 가 봅니다.
  return true;
}

/**
 * 이제 남은 일이 재우기뿐인지.
 * 표정·말풍선이 "졸려요"로 바뀌는 기준입니다 — 순서가 자유로워진 뒤로는
 * 목욕이 하루의 끝이 아니라서, 아침에 씻기면 종일 졸린 얼굴이 되곤 했습니다.
 * 병원은 아픈 날에만 생기는 일이라 세지 않습니다.
 */
export function onlySleepLeft(save: SaveData): boolean {
  const done = save.today.done;
  return (Object.keys(done) as RewardAction[])
    .filter((key) => key !== 'sleep' && key !== 'hospital')
    .every((key) => done[key]);
}

/** 오늘 할 일을 다 했는지 (= 강아지들이 잠들었는지) */
export function isDayFinished(save: SaveData): boolean {
  return save.today.done.sleep;
}
