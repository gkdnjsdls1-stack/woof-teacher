/**
 * 옷 그림 (SVG 레이어).
 * 강아지 그림 위에 겹쳐 그립니다. 좌표는 `geometry.ts` 의 기준점을 씁니다.
 * 나중에 실제 그림(PNG/SVG)으로 교체할 때도 이 파일만 바꾸면 됩니다.
 */

import type { DogId } from '../types';
import { DOG_GEOMETRY } from './geometry';

/** 목록·버튼에 쓰는 아이콘 */
export const OUTFIT_EMOJI: Record<string, string> = {
  dx_bowtie: '👔',
  dx_sunglasses: '🕶️',
  dx_shirt: '👕',
  dx_jacket: '🧥',
  dx_police: '🧢',
  pd_ribbon: '🎀',
  pd_flowerpin: '🌸',
  pd_dress: '👗',
  pd_cape: '🧣',
  pd_crown: '👑',
  // 호감도 80 선물 옷
  dx_hero_cape: '🦸',
  pd_fairy_wings: '🧚',
};

export function OutfitLayer({ id, breed }: { id: string; breed: DogId }) {
  const g = DOG_GEOMETRY[breed];

  switch (id) {
    /* ───── 닥스훈트: 멋진 옷 ───── */
    case 'dx_bowtie': {
      const { x, y } = g.neck;
      return (
        <g>
          <path d={`M${x},${y} l-9,-5 v10 z`} fill="#E0566B" />
          <path d={`M${x},${y} l9,-5 v10 z`} fill="#E0566B" />
          <circle cx={x} cy={y} r={2.8} fill="#B8394C" />
        </g>
      );
    }
    case 'dx_sunglasses': {
      const { x, y } = g.face;
      return (
        <g>
          <line x1={x - 10} y1={y - 1} x2={x + 10} y2={y - 1} stroke="#2E2E38" strokeWidth={2} />
          <circle cx={x - 5} cy={y} r={5.6} fill="#2E2E38" />
          <circle cx={x + 5} cy={y} r={5.6} fill="#2E2E38" />
          <circle cx={x - 6.5} cy={y - 2} r={1.4} fill="#fff" opacity={0.6} />
        </g>
      );
    }
    case 'dx_shirt': {
      const { x, y } = g.body;
      return (
        <g>
          <path
            d={`M${x - 26},${y - 12} q26,-8 52,0 l0,16 q-26,10 -52,0 z`}
            fill="#8FB7E8"
          />
          <g stroke="#6B93C4" strokeWidth={1.4}>
            <line x1={x - 16} y1={y - 13} x2={x - 16} y2={y + 3} />
            <line x1={x} y1={y - 15} x2={x} y2={y + 4} />
            <line x1={x + 16} y1={y - 13} x2={x + 16} y2={y + 3} />
            <line x1={x - 26} y1={y - 5} x2={x + 26} y2={y - 7} />
          </g>
        </g>
      );
    }
    case 'dx_jacket': {
      const { x, y } = g.body;
      return (
        <g>
          <path
            d={`M${x - 26},${y - 13} q26,-9 52,0 l0,18 q-26,10 -52,0 z`}
            fill="#4B4453"
          />
          <path d={`M${x + 20},${y - 13} l8,2 l-2,8 z`} fill="#6E6478" />
          <circle cx={x - 6} cy={y - 4} r={2} fill="#D8CF4C" />
          <circle cx={x + 4} cy={y - 5} r={2} fill="#D8CF4C" />
        </g>
      );
    }
    case 'dx_police': {
      const { x, y } = g.head;
      return (
        <g>
          <path d={`M${x - 14},${y + 2} q14,-14 28,0 z`} fill="#3B5FA8" />
          <rect x={x - 17} y={y + 1} width={34} height={4.5} rx={2.2} fill="#2A4682" />
          <circle cx={x} cy={y - 4} r={2.6} fill="#F2D35B" />
        </g>
      );
    }

    /* ───── 푸들: 귀엽고 예쁜 옷 ───── */
    case 'pd_ribbon': {
      const { x, y } = g.head;
      return (
        <g>
          <ellipse cx={x - 8} cy={y} rx={7} ry={5} fill="#FF9EC4" transform={`rotate(-18 ${x - 8} ${y})`} />
          <ellipse cx={x + 8} cy={y} rx={7} ry={5} fill="#FF9EC4" transform={`rotate(18 ${x + 8} ${y})`} />
          <circle cx={x} cy={y} r={3.4} fill="#F76FA8" />
        </g>
      );
    }
    case 'pd_flowerpin': {
      const { x, y } = g.head;
      return (
        <g transform={`translate(${x + 10},${y + 3})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx={0} cy={-5.5} rx={3.2} ry={5} fill="#FFC2DD" transform={`rotate(${deg})`} />
          ))}
          <circle cx={0} cy={0} r={3} fill="#FFE27A" />
        </g>
      );
    }
    case 'pd_dress': {
      const { x, y } = g.body;
      return (
        <g>
          <path
            d={`M${x - 16},${y - 12} q16,-7 32,0 l8,22 q-24,9 -48,0 z`}
            fill="#F7A8C8"
          />
          <path d={`M${x - 22},${y + 8} q22,7 44,0`} stroke="#FFFFFF" strokeWidth={2.4} fill="none" />
          <circle cx={x} cy={y - 8} r={2.4} fill="#FFFFFF" />
        </g>
      );
    }
    case 'pd_cape': {
      const { x, y } = g.body;
      return (
        <g>
          <path
            d={`M${x + 16},${y - 14} q-24,-4 -44,6 l-4,20 q22,8 44,2 z`}
            fill="#B79BE6"
          />
          <path d={`M${x + 16},${y - 14} q-10,-2 -18,0`} stroke="#8E6FD1" strokeWidth={3} fill="none" />
        </g>
      );
    }
    case 'pd_crown': {
      const { x, y } = g.head;
      return (
        <g>
          <path
            d={`M${x - 13},${y + 4} l0,-9 l6.5,5 l6.5,-10 l6.5,10 l6.5,-5 l0,9 z`}
            fill="#F7D35B"
            stroke="#DFB531"
            strokeWidth={1.2}
          />
          <circle cx={x} cy={y - 7} r={1.8} fill="#FF8FB3" />
        </g>
      );
    }

    /* ───── 호감도 80 선물 옷 ───── */
    case 'dx_hero_cape': {
      const { x, y } = g.body;
      return (
        <g>
          <path
            d={`M${x + 18},${y - 15} q-26,-5 -46,7 l-5,24 q24,9 47,2 z`}
            fill="#E0566B"
          />
          <path
            d={`M${x + 18},${y - 15} q-11,-2 -20,0`}
            stroke="#FFE27A"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${x - 4},${y - 2} l3,-7 l3,7 l7,1 l-5,5 l1.5,7 l-6.5,-4 l-6.5,4 l1.5,-7 l-5,-5 z`}
            fill="#FFE27A"
          />
        </g>
      );
    }
    case 'pd_fairy_wings': {
      const { x, y } = g.body;
      return (
        <g opacity={0.92}>
          <ellipse
            cx={x - 10}
            cy={y - 14}
            rx={9}
            ry={15}
            fill="#CFE8FF"
            stroke="#A9D3F5"
            strokeWidth={1.2}
            transform={`rotate(-24 ${x - 10} ${y - 14})`}
          />
          <ellipse
            cx={x + 8}
            cy={y - 16}
            rx={9}
            ry={15}
            fill="#F6D9FF"
            stroke="#E0B8F0"
            strokeWidth={1.2}
            transform={`rotate(18 ${x + 8} ${y - 16})`}
          />
          <circle cx={x - 1} cy={y - 10} r={2.6} fill="#FFF3C4" />
        </g>
      );
    }

    default:
      return null;
  }
}
