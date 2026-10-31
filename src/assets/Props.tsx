/**
 * 소품 그림.
 *
 * 대부분 `public/art/prop/*.webp` 한 장이라 `<img>` 한 줄입니다.
 * SVG 로 남은 셋은 그림 한 장으로는 못 그리는 것들입니다:
 *   - `DogHouse` 는 단계가 4개(상자·나무집·2층·성)인데 그림은 나무집 한 장뿐
 *   - `ClockFace` 는 시곗바늘이 문제마다 움직임
 *   - `Student` 는 그림이 없음
 */

import { HOUSE_LEVEL_NAMES } from '../constants';
import { art } from './art';
import { PALETTE } from './palette';

/** 그림 한 장짜리 소품 공통 */
function Art({
  name,
  label,
  size,
  style,
  className,
}: {
  name: string;
  label?: string;
  size: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={art(`prop/${name}`)}
      width={size}
      alt={label ?? ''}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      style={style}
    />
  );
}

/* ───────────────────────── 밥·물 ───────────────────────── */

// 비었을 때는 그릇 그림이 따로 없어서 색을 빼고 흐리게 둡니다 ("다 먹었어요" 표시와 짝).
const EMPTY = { filter: 'grayscale(0.7)', opacity: 0.55 };

export function FoodBowl({ filled = true, size = 76 }: { filled?: boolean; size?: number }) {
  return <Art name="food-bowl" label="사료 그릇" size={size} style={filled ? undefined : EMPTY} />;
}

export function WaterBowl({ filled = true, size = 76 }: { filled?: boolean; size?: number }) {
  return <Art name="water-bowl" label="물그릇" size={size} style={filled ? undefined : EMPTY} />;
}

/* ───────────────────────── 그림 한 장 소품 ───────────────────────── */

export function GiftBox({ size = 150 }: { size?: number }) {
  return <Art name="gift-box" label="선물 상자" size={size} />;
}

export function Shower({ size = 64 }: { size?: number }) {
  return <Art name="shower" label="샤워기" size={size} />;
}

export function Towel({ size = 64 }: { size?: number }) {
  return <Art name="towel" label="수건" size={size} />;
}

export function SoapBubble({ size = 28, delay = 0 }: { size?: number; delay?: number }) {
  return <Art name="soap-bubble" size={size} className="bubble" style={{ animationDelay: `${delay}ms` }} />;
}

export function PawPrint({ size = 34 }: { size?: number }) {
  return <Art name="paw-print" size={size} />;
}

export function MoonAndStars({ size = 120 }: { size?: number }) {
  return <Art name="moon-stars" size={size} />;
}

export function Leash({ size = 64 }: { size?: number }) {
  return <Art name="leash" label="목줄" size={size} />;
}

export function Muzzle({ size = 64 }: { size?: number }) {
  return <Art name="muzzle" label="입마개" size={size} />;
}

export function OpenCar({ size = 300 }: { size?: number }) {
  return <Art name="open-car" label="빨간 오픈카" size={size} />;
}

/* ───────────────────────── 강아지집 (단계 4개) ───────────────────────── */

/**
 * 단계가 상자·나무집·2층·성 네 가지인데 AI 그림은 나무집 한 장뿐입니다.
 * 한 칸만 그림으로 바꾸면 같은 화면에서 그림체가 갈라져(`HouseScreen` 은 둘을 나란히 보여줍니다)
 * 네 단계 모두 SVG 로 둡니다. `prop/dog-house.webp` 는 나머지 세 단계가 그려지면 그때 씁니다.
 */
export function DogHouse({ level = 0, size = 90 }: { level?: 0 | 1 | 2 | 3; size?: number }) {
  const line = '#8A6A47';
  const ink = { stroke: line, strokeWidth: 3, strokeLinejoin: 'round' as const };
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${HOUSE_LEVEL_NAMES[level]}`}
    >
      <ellipse cx={50} cy={94} rx={34} ry={5} fill={PALETTE.shadow} opacity={0.25} />

      {level === 0 && (
        <g {...ink}>
          {/* 박스집 — 테이프와 접힌 뚜껑으로 '종이 상자'인 걸 알아보게 합니다 */}
          <rect x={18} y={48} width={64} height={44} rx={4} fill={PALETTE.box} />
          <path d="M18,48 h64 l-6,-9 h-52 z" fill="#C4A478" />
          {/* 접힌 자국은 문 위에서 끝냅니다 (문을 가로지르면 금 간 것처럼 보입니다) */}
          <path d="M50,48 v10" stroke="#B89A72" strokeWidth={2} />
          <path d="M28,58 h20" stroke="#E6D3B4" strokeWidth={4} strokeLinecap="round" />
          <circle cx={50} cy={74} r={13} fill="#8E7254" />
        </g>
      )}

      {level === 1 && (
        <g {...ink}>
          {/* 나무집 — 판자 결을 그어 나무로 보이게 */}
          <rect x={16} y={50} width={68} height={42} rx={4} fill={PALETTE.wood} />
          <path d="M22,58 h56 M22,68 h56 M22,78 h56" stroke={PALETTE.woodDark} strokeWidth={1.6} opacity={0.5} />
          <path d="M50,22 L92,52 H8 Z" fill={PALETTE.roof} />
          <circle cx={50} cy={74} r={14} fill={PALETTE.woodDark} />
          <rect x={45} y={36} width={10} height={10} rx={2} fill="#FFF3C4" />
        </g>
      )}

      {level === 2 && (
        <g {...ink}>
          {/* 2층 집 — 아래층·위층·지붕을 또렷이 나눕니다 */}
          <rect x={16} y={56} width={68} height={36} rx={4} fill={PALETTE.wood} />
          <rect x={22} y={30} width={56} height={26} rx={4} fill="#DCB68A" />
          <path d="M50,8 L88,32 H12 Z" fill={PALETTE.roof} />
          <circle cx={50} cy={76} r={12} fill={PALETTE.woodDark} />
          <rect x={31} y={37} width={11} height={11} rx={2} fill="#FFF3C4" />
          <rect x={58} y={37} width={11} height={11} rx={2} fill="#FFF3C4" />
          <path d="M36.5,37 v11 M31,42.5 h11 M63.5,37 v11 M58,42.5 h11" stroke={line} strokeWidth={1.4} />
        </g>
      )}

      {level === 3 && (
        <g stroke="#7E63AE" strokeWidth={3} strokeLinejoin="round">
          {/* 성 — 톱니 성벽과 깃발로 '성'인 걸 한눈에 */}
          <rect x={14} y={48} width={72} height={44} rx={3} fill="#E8E2F2" />
          <rect x={8} y={34} width={17} height={58} rx={3} fill="#D8D0EA" />
          <rect x={75} y={34} width={17} height={58} rx={3} fill="#D8D0EA" />
          <path d="M8,34 h17 v-6 h-5 v-4 h-7 v4 h-5 z" fill="#D8D0EA" />
          <path d="M75,34 h17 v-6 h-5 v-4 h-7 v4 h-5 z" fill="#D8D0EA" />
          <path d="M34,48 L50,24 L66,48 Z" fill="#9A7FD1" />
          <path d="M38,92 v-22 a12,12 0 0 1 24,0 v22 z" fill="#8E6FC4" />
          <path d="M50,24 v-12" strokeWidth={2} />
          <path d="M50,12 l12,4 l-12,4 z" fill={PALETTE.star} strokeWidth={1.5} />
        </g>
      )}
    </svg>
  );
}

/* ───────────────────────── 교실 ───────────────────────── */

export function Student({ size = 56, variant = 0 }: { size?: number; variant?: number }) {
  const shirts = ['#FFB4C4', '#A9D8F0', '#FFD98A', '#BEE3C2', '#D6C4F0', '#FFC2A1'];
  const hairs = ['#3C2B22', '#5A3B2A', '#2E2622'];
  return (
    <svg viewBox="0 0 40 50" width={size} height={(size * 50) / 40} aria-hidden="true">
      <path d="M8,50 v-14 a12,12 0 0 1 24,0 v14 z" fill={shirts[variant % shirts.length]} />
      <circle cx={20} cy={20} r={12} fill="#FBE0C8" />
      <path d="M8,18 a12,12 0 0 1 24,0 q-12,-7 -24,0 z" fill={hairs[variant % hairs.length]} />
      <circle cx={15} cy={21} r={1.8} fill={PALETTE.eye} />
      <circle cx={25} cy={21} r={1.8} fill={PALETTE.eye} />
      <path d="M17,26 q3,3 6,0" fill="none" stroke={PALETTE.nose} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

/** 시계 보기 문제용 시계 (정각만) */
export function ClockFace({ hour, size = 92 }: { hour: number; size?: number }) {
  // 12시가 위, 시계 방향. 정각이므로 분침은 항상 12시를 가리킵니다.
  const angle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
  const hx = 50 + Math.cos(angle) * 24;
  const hy = 50 + Math.sin(angle) * 24;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${hour}시 시계`}>
      <circle cx={50} cy={50} r={46} fill="#FFFDF5" stroke={PALETTE.woodDark} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return (
          <circle
            key={i}
            cx={50 + Math.cos(a) * 38}
            cy={50 + Math.sin(a) * 38}
            r={i % 3 === 0 ? 3 : 2}
            fill="#4A3A32"
          />
        );
      })}
      <line x1={50} y1={50} x2={50} y2={18} stroke="#4A3A32" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={50} y1={50} x2={hx} y2={hy} stroke="#4A3A32" strokeWidth={6} strokeLinecap="round" />
      <circle cx={50} cy={50} r={4} fill={PALETTE.nose} />
    </svg>
  );
}
