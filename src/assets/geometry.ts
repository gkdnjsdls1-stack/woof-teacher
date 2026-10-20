/** 강아지 그림의 좌표 기준점 — 옷 레이어가 이 값을 씁니다. */

import type { DogId } from '../types';

export interface DogGeometry {
  head: { x: number; y: number }; // 머리 위 (모자·리본·핀)
  face: { x: number; y: number }; // 눈 사이 (선글라스)
  body: { x: number; y: number }; // 몸통 중앙 (옷)
  neck: { x: number; y: number }; // 목 (나비넥타이)
}

export const DOG_VIEWBOX = { width: 120, height: 110 };

export const DOG_GEOMETRY: Record<DogId, DogGeometry> = {
  dachshund: {
    head: { x: 94, y: 33 },
    face: { x: 95, y: 47 },
    body: { x: 56, y: 70 },
    neck: { x: 82, y: 62 },
  },
  poodle: {
    head: { x: 90, y: 19 },
    face: { x: 91, y: 45 },
    body: { x: 56, y: 68 },
    neck: { x: 78, y: 60 },
  },
};
