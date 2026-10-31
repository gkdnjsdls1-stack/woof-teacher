/**
 * 그림 좌표 — AI 그림(`public/art/`) 기준.
 *
 * 강아지는 `무대(stage)` 라는 네모 안에 바닥을 맞춰 깔립니다.
 * 옷·목줄·입마개 좌표는 **강아지 그림 자체의 가로·세로를 100 으로 본 비율**입니다.
 * (무대 기준이 아닙니다 — 강아지 크기가 바뀌어도 옷이 따라가도록.)
 *
 * 숫자를 고칠 때는 `?art=1` 로 띄우면 기준선이 보입니다 (개발 모드 전용).
 */

import type { DogId } from '../types';

/** 무대 세로 = 가로 × 이 값. 닥스훈트(납작)와 푸들(길쭉)이 같은 바닥에 서게 합니다. */
export const STAGE_RATIO = 0.85;

/** 강아지 그림의 원본 비율(세로/가로)과 무대 가로를 차지하는 비율. */
export const DOG_ART: Record<DogId, { aspect: number; scale: number }> = {
  // 480×350 — 길고 낮습니다. 무대 가로를 다 씁니다.
  dachshund: { aspect: 350 / 480, scale: 1 },
  // 478×480 — 거의 정사각이라 같은 폭으로 그리면 훨씬 커 보입니다. 줄여서 키를 맞춥니다.
  poodle: { aspect: 480 / 478, scale: 0.85 },
};

export interface Placement {
  /** 그림 중심 (강아지 그림 가로·세로의 %) */
  x: number;
  y: number;
  /** 가로 크기 (강아지 그림 가로의 %) */
  w: number;
  rotate?: number;
  /** 강아지 뒤에 깝니다 (망토·날개는 등에 걸리므로 앞에 두면 몸을 가립니다) */
  behind?: boolean;
}

/** 옷 — id 는 `constants.ts` 의 `OUTFITS` 와 `public/art/outfit/` 파일명과 같습니다. */
export const OUTFIT_PLACEMENT: Record<string, Placement> = {
  // 닥스훈트
  dx_cap: { x: 78, y: 0, w: 32 },
  dx_police: { x: 78, y: -4, w: 34 },
  dx_sunglasses: { x: 80, y: 19, w: 26 },
  dx_bowtie: { x: 68, y: 43, w: 20 },
  dx_jacket: { x: 44, y: 48, w: 48 },
  dx_hero_cape: { x: 26, y: 34, w: 50, behind: true },
  // 푸들
  pd_ribbon: { x: 58, y: 6, w: 26 },
  pd_flowerpin: { x: 70, y: 14, w: 26 },
  pd_heartglasses: { x: 73, y: 33, w: 26 },
  pd_dress: { x: 43, y: 68, w: 50 },
  pd_cape: { x: 36, y: 56, w: 48, behind: true },
  pd_fairy_wings: { x: 38, y: 40, w: 42, behind: true },
};

/**
 * 목줄·입마개 (2단계).
 *
 * `목줄` 그림(`prop/leash`)은 손에 드는 줄이라 강아지 위에 올리면 떠 보입니다.
 * 그래서 강아지한테는 목에 두른 띠만 그리고, 줄 그림은 고르는 자리에만 씁니다.
 */
export const GEAR_PLACEMENT: Record<DogId, { collar: Placement; muzzle: Placement }> = {
  dachshund: {
    collar: { x: 63, y: 48, w: 18 },
    muzzle: { x: 90, y: 34, w: 21 },
  },
  poodle: {
    collar: { x: 61, y: 50, w: 18 },
    muzzle: { x: 85, y: 43, w: 21 },
  },
};

/** 호감도 100 왕관이 뜨는 자리. 모자와 겹치지 않게 그 위로 띄웁니다. */
export const CROWN_SPOT: Record<DogId, { x: number; y: number; w: number }> = {
  dachshund: { x: 78, y: -18, w: 24 },
  poodle: { x: 54, y: -9, w: 24 },
};
