/** 소품·배경 그림 (SVG 플레이스홀더) */

import { HOUSE_LEVEL_NAMES } from '../constants';
import { PALETTE } from './palette';

/* ───────────────────────── 사료 그릇 ───────────────────────── */

export function FoodBowl({ filled = true, size = 76 }: { filled?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 80 60" width={size} height={(size * 60) / 80} role="img" aria-label="사료 그릇">
      {filled && (
        <g>
          <ellipse cx={40} cy={30} rx={24} ry={10} fill={PALETTE.food} />
          <circle cx={30} cy={27} r={4} fill="#B07C4A" />
          <circle cx={42} cy={25} r={4.5} fill="#B07C4A" />
          <circle cx={52} cy={28} r={3.6} fill="#B07C4A" />
        </g>
      )}
      <path d="M10,30 q30,18 60,0 l-6,18 q-24,10 -48,0 z" fill={PALETTE.bowl} />
      <ellipse cx={40} cy={30} rx={30} ry={11} fill="none" stroke={PALETTE.bowlDark} strokeWidth={4} />
    </svg>
  );
}

/* ───────────────────────── 물그릇 ───────────────────────── */

export function WaterBowl({ filled = true, size = 76 }: { filled?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 80 60" width={size} height={(size * 60) / 80} role="img" aria-label="물그릇">
      {filled && (
        <g>
          <ellipse cx={40} cy={31} rx={25} ry={10} fill={PALETTE.water} />
          <ellipse cx={33} cy={28} rx={5} ry={2} fill="#FFFFFF" opacity={0.7} />
        </g>
      )}
      <path d="M10,30 q30,18 60,0 l-6,18 q-24,10 -48,0 z" fill={PALETTE.bowlWater} />
      <ellipse cx={40} cy={30} rx={30} ry={11} fill="none" stroke={PALETTE.bowlWaterDark} strokeWidth={4} />
    </svg>
  );
}

/* ───────────────────────── 강아지집 (4단계) ───────────────────────── */

export function DogHouse({ level = 0, size = 90 }: { level?: 0 | 1 | 2 | 3; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${HOUSE_LEVEL_NAMES[level]}`}
    >
      {level === 0 && (
        <g>
          <rect x={18} y={48} width={64} height={44} rx={4} fill={PALETTE.box} />
          <path d="M18,48 h64 l-6,-8 h-52 z" fill="#C4A478" />
          <ellipse cx={50} cy={92} rx={20} ry={6} fill="#00000014" />
          <circle cx={50} cy={72} r={13} fill="#A98862" />
        </g>
      )}
      {level === 1 && (
        <g>
          <rect x={16} y={50} width={68} height={42} rx={4} fill={PALETTE.wood} />
          <path d="M50,24 L90,52 H10 Z" fill={PALETTE.roof} />
          <circle cx={50} cy={74} r={14} fill={PALETTE.woodDark} />
          <rect x={46} y={40} width={8} height={8} rx={2} fill="#FFF3C4" />
        </g>
      )}
      {level === 2 && (
        <g>
          <rect x={16} y={56} width={68} height={36} rx={4} fill={PALETTE.wood} />
          <rect x={22} y={30} width={56} height={26} rx={4} fill="#DCB68A" />
          <path d="M50,10 L86,32 H14 Z" fill={PALETTE.roof} />
          <circle cx={50} cy={76} r={12} fill={PALETTE.woodDark} />
          <rect x={32} y={38} width={10} height={10} rx={2} fill="#FFF3C4" />
          <rect x={58} y={38} width={10} height={10} rx={2} fill="#FFF3C4" />
        </g>
      )}
      {level === 3 && (
        <g>
          <rect x={14} y={48} width={72} height={44} rx={3} fill="#E8E2F2" />
          <rect x={10} y={34} width={16} height={58} rx={3} fill="#D8D0EA" />
          <rect x={74} y={34} width={16} height={58} rx={3} fill="#D8D0EA" />
          <path d="M18,34 L26,18 L34,34 Z" fill="#9A7FD1" />
          <path d="M66,34 L74,18 L82,34 Z" fill="#9A7FD1" />
          <path d="M34,48 L50,26 L66,48 Z" fill="#9A7FD1" />
          <path d="M38,92 v-22 a12,12 0 0 1 24,0 v22 z" fill="#8E6FC4" />
          <circle cx={50} cy={40} r={3} fill={PALETTE.star} />
        </g>
      )}
    </svg>
  );
}

/* ───────────────────────── 선물 상자 (이름 짓기) ───────────────────────── */

export function GiftBox({ size = 150, color = '#F5A3BD' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="선물 상자">
      <rect x={14} y={38} width={72} height={52} rx={6} fill={color} />
      <rect x={10} y={26} width={80} height={16} rx={6} fill="#FFFFFF" opacity={0.35} />
      <rect x={10} y={26} width={80} height={16} rx={6} fill={color} />
      <rect x={43} y={26} width={14} height={64} fill="#FFF0F5" opacity={0.85} />
      <ellipse cx={38} cy={22} rx={12} ry={9} fill="#FFF0F5" />
      <ellipse cx={62} cy={22} rx={12} ry={9} fill="#FFF0F5" />
      <circle cx={50} cy={23} r={5} fill="#FFFFFF" />
    </svg>
  );
}

/* ───────────────────────── 목욕 소품 ───────────────────────── */

export function Shower({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} role="img" aria-label="샤워기">
      <rect x={26} y={6} width={8} height={18} rx={4} fill="#9FB6C6" />
      <path d="M14,24 h32 l-4,10 h-24 z" fill="#BFD4E0" />
      {[20, 30, 40].map((x) => (
        <line key={x} x1={x} y1={36} x2={x} y2={52} stroke={PALETTE.water} strokeWidth={3} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Towel({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} role="img" aria-label="수건">
      <rect x={8} y={14} width={44} height={32} rx={6} fill={PALETTE.towel} />
      <rect x={8} y={22} width={44} height={5} fill="#FFC673" />
      <rect x={8} y={34} width={44} height={5} fill="#FFC673" />
    </svg>
  );
}

export function SoapBubble({ size = 28, delay = 0 }: { size?: number; delay?: number }) {
  return (
    <svg
      viewBox="0 0 30 30"
      width={size}
      height={size}
      className="bubble"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <circle cx={15} cy={15} r={13} fill={PALETTE.soap} opacity={0.9} />
      <circle cx={10} cy={11} r={4} fill="#FFFFFF" opacity={0.9} />
    </svg>
  );
}

/* ───────────────────────── 발자국 (로딩) ───────────────────────── */

export function PawPrint({ size = 34, color = '#D9A46B' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <ellipse cx={20} cy={26} rx={11} ry={9} fill={color} />
      <circle cx={10} cy={14} r={4.4} fill={color} />
      <circle cx={18} cy={10} r={4.4} fill={color} />
      <circle cx={27} cy={12} r={4.4} fill={color} />
      <circle cx={33} cy={20} r={4} fill={color} />
    </svg>
  );
}

/* ───────────────────────── 밤 하늘 ───────────────────────── */

export function MoonAndStars({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={(size * 80) / 120} aria-hidden="true">
      <path d="M86,14 a20,20 0 1 0 18,30 a16,16 0 1 1 -18,-30 z" fill="#FFEFA8" />
      {[
        [18, 20, 3],
        [40, 12, 2.2],
        [30, 46, 2.6],
        [58, 30, 2],
        [12, 58, 2.4],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#FFF8D8" className="twinkle" style={{ animationDelay: `${i * 300}ms` }} />
      ))}
    </svg>
  );
}

/* ───────────────────── 출근 소품 (2단계) ─────────────────────
 * 목줄·입마개는 **아이템 쟁반에 놓이는 그림**입니다.
 * 강아지가 착용한 모습은 Dog 의 leash·muzzle 프롭이 그립니다.
 */

export function Leash({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} role="img" aria-label="목줄">
      <circle cx={22} cy={34} r={14} fill="none" stroke={PALETTE.leash} strokeWidth={7} />
      <circle cx={22} cy={48} r={3.4} fill={PALETTE.star} />
      <path d="M33,26 q14,-10 20,2" fill="none" stroke={PALETTE.leash} strokeWidth={5} strokeLinecap="round" />
      <circle cx={52} cy={30} r={5} fill="none" stroke={PALETTE.leash} strokeWidth={4} />
    </svg>
  );
}

export function Muzzle({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} role="img" aria-label="입마개">
      <path d="M14,24 q16,-8 32,0 l-4,16 q-12,6 -24,0 z" fill={PALETTE.muzzle} />
      <path d="M14,30 h32 M22,24 v16 M30,22 v19 M38,24 v16" stroke="#A8977F" strokeWidth={2.4} fill="none" />
      <path d="M12,26 q-6,8 2,16" fill="none" stroke="#A8977F" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** 빨간 오픈카 (뒷자리에 강아지가 탑니다 — 강아지는 화면에서 겹쳐 그립니다) */
export function OpenCar({ size = 300 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 110" width={size} height={(size * 110) / 200} role="img" aria-label="빨간 오픈카">
      {/* 몸체 */}
      <path d="M12,74 q4,-22 24,-24 l20,-14 q22,-6 44,0 l16,14 q28,2 32,24 z" fill={PALETTE.car} />
      {/* 앞유리 */}
      <path d="M60,36 q18,-5 36,0 l12,12 h-60 z" fill="#CDE9F7" opacity={0.95} />
      {/* 뒷자리 */}
      <rect x={104} y={46} width={46} height={10} rx={4} fill={PALETTE.carSeat} />
      <rect x={12} y={70} width={176} height={10} rx={5} fill={PALETTE.carDark} />
      {/* 바퀴 */}
      {[52, 150].map((cx) => (
        <g key={cx} className="car__wheel">
          <circle cx={cx} cy={84} r={16} fill="#3C3A3A" />
          <circle cx={cx} cy={84} r={6} fill="#D8D8D8" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────── 교실 소품 (2단계) ───────────────────── */

/** 1학년 학생 (색만 다른 플레이스홀더) */
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
