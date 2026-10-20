/**
 * 진행 잠금 규칙 (SPEC 5-1).
 * 1단계에서는 밥·물·옷 → 씻기 → 재우기 순서만 열립니다.
 * 출근·수업·산책·미용실·병원은 2~4단계에서 열립니다.
 */

import { MVP_FLOW } from '../constants';
import type { RewardAction, SaveData } from '../types';

export function canDo(save: SaveData, action: RewardAction): boolean {
  const { done } = save.today;
  // 하루가 끝났으면 (재우기 완료) 아무것도 할 수 없습니다.
  if (done.sleep) return false;
  switch (action) {
    case 'feed':
    case 'water':
    case 'dress':
      return true;
    case 'wash':
      return done.feed && done.water && done.dress;
    case 'sleep':
      return done.wash;
    default:
      return false; // 2~4단계 기능
  }
}

/** 홈에서 크게 반짝일 "다음에 할 일" */
export function nextAction(save: SaveData): RewardAction | null {
  for (const action of MVP_FLOW) {
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
