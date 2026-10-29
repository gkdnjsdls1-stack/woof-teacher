/**
 * 진행 잠금 규칙 (SPEC 5-1).
 * 3단계까지: 밥·물·옷 → 출근 → 수업 → 산책 → 씻기 → 재우기.
 * 미용실은 체크판 밖의 보너스로, 학교에 다녀오면 열립니다 (SPEC 5-1).
 * 병원도 체크판 밖이며 아픈 날에만 열립니다 (SPEC 6-8).
 */

import { DAY_FLOW, DOG_ORDER } from '../constants';
import type { DogId, RewardAction, SaveData } from '../types';

/** 오늘 아픈 강아지 (SPEC 6-8). 어제 아팠던 표시는 새 하루에 저절로 지워집니다. */
export function sickDogs(save: SaveData): DogId[] {
  return DOG_ORDER.filter((id) => save.dogs[id].sickUntil === save.today.date);
}

export function canDo(save: SaveData, action: RewardAction): boolean {
  const { done } = save.today;
  // 하루가 끝났으면 (재우기 완료) 아무것도 할 수 없습니다.
  if (done.sleep) return false;
  switch (action) {
    case 'feed':
    case 'water':
    case 'dress':
      return true;
    case 'commute':
      return done.feed && done.water && done.dress;
    case 'lesson':
      return done.commute;
    case 'walk':
      return done.lesson;
    // 미용실은 하루 순서에 끼지 않는 보너스입니다 — 학교에 다녀오면 언제든 열립니다.
    case 'groom':
      return done.lesson;
    // 병원은 **아플 때만, 대신 하루 중 언제든** 열립니다.
    // 아픈 강아지를 보고도 수업까지 기다리게 하면 그 자체가 불안 요소가 됩니다 (절대 원칙 4번).
    case 'hospital':
      return sickDogs(save).length > 0;
    case 'wash':
      return done.walk;
    case 'sleep':
      return done.wash;
    default:
      return false; // 2~4단계 기능
  }
}

/** 홈에서 크게 반짝일 "다음에 할 일" */
export function nextAction(save: SaveData): RewardAction | null {
  for (const action of DAY_FLOW) {
    if (!save.today.done[action] && canDo(save, action)) return action;
  }
  return null;
}

/** 오늘 할 일을 다 했는지 (= 강아지들이 잠들었는지) */
export function isDayFinished(save: SaveData): boolean {
  return save.today.done.sleep;
}

/** 아침 돌봄(밥·물·옷)을 마쳤는지 */
export function isMorningDone(save: SaveData): boolean {
  const { done } = save.today;
  return done.feed && done.water && done.dress;
}
