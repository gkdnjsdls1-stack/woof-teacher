/**
 * 강아지 그림 (SVG 플레이스홀더).
 * 나중에 실제 그림으로 교체할 때는 이 파일만 바꾸면 됩니다.
 * 표정: 기쁨 · 배고픔 · 졸림 · 아픔 · 자는 중 / 꼬리 흔들기 애니메이션
 */

import { DOG_PROFILE } from '../constants';
import type { DogId, DogMood } from '../types';
import { DOG_GEOMETRY, DOG_VIEWBOX } from './geometry';
import { OutfitLayer } from './Outfits';
import { PALETTE } from './palette';

/* ───────────────────────── 얼굴 ───────────────────────── */

function Eye({ x, y, mood }: { x: number; y: number; mood: DogMood }) {
  const stroke = { stroke: PALETTE.eye, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const };
  switch (mood) {
    case 'hungry':
      return (
        <g>
          <circle cx={x} cy={y} r={3.6} fill={PALETTE.eye} />
          <circle cx={x + 1.3} cy={y - 1.3} r={1.2} fill="#fff" />
        </g>
      );
    case 'sleepy':
    case 'sleeping':
      return <path d={`M${x - 3.6},${y - 1} q3.6,3.8 7.2,0`} {...stroke} />;
    case 'sick':
      return <path d={`M${x - 3.6},${y - 1.6} q3.6,3.4 7.2,0`} {...stroke} />;
    case 'happy':
    default:
      return <path d={`M${x - 3.6},${y + 1.4} q3.6,-4.6 7.2,0`} {...stroke} />;
  }
}

function Mouth({ x, y, mood }: { x: number; y: number; mood: DogMood }) {
  switch (mood) {
    case 'hungry':
      return (
        <g>
          <path
            d={`M${x - 5},${y} q5,7 10,0 z`}
            fill={PALETTE.nose}
            stroke={PALETTE.nose}
            strokeWidth={1}
          />
          <path d={`M${x - 2.5},${y + 3} q2.5,4 5,0 z`} fill={PALETTE.tongue} />
        </g>
      );
    case 'sleepy':
      return (
        <path
          d={`M${x - 3},${y + 1} q3,2.6 6,0`}
          stroke={PALETTE.nose}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'sick':
      return (
        <path
          d={`M${x - 3.5},${y + 3} q3.5,-3 7,0`}
          stroke={PALETTE.nose}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'sleeping':
      return (
        <path
          d={`M${x - 4},${y} q2,2.6 4,0 q2,2.6 4,0`}
          stroke={PALETTE.nose}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'happy':
    default:
      return (
        <g>
          <path
            d={`M${x - 5},${y - 1} q5,6 10,0`}
            stroke={PALETTE.nose}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
          <path d={`M${x - 1},${y + 2.6} q2.6,4.4 5.2,0 z`} fill={PALETTE.tongue} />
        </g>
      );
  }
}

/* ───────────────────────── 닥스훈트 ───────────────────────── */

function DachshundBase({ mood, tailWag }: { mood: DogMood; tailWag: boolean }) {
  const lying = mood === 'sleeping';
  return (
    <g>
      {/* 꼬리 */}
      <g
        className={tailWag && !lying ? 'dog-tail dog-tail--wag' : 'dog-tail'}
        style={{ transformOrigin: '22px 64px' }}
      >
        <path
          d="M22,64 C12,58 10,46 16,38"
          stroke={PALETTE.dxDark}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 다리 */}
      {[30, 45, 65, 79].map((x) => (
        <rect key={x} x={x} y={lying ? 80 : 76} width={9} height={lying ? 12 : 18} rx={4.5} fill={PALETTE.dxDark} />
      ))}

      {/* 몸통 (닥스훈트는 길쭉합니다) */}
      <ellipse cx={56} cy={70} rx={35} ry={15} fill={PALETTE.dxBody} />

      {/* 귀 (뒤쪽) */}
      <path d="M88,38 C76,40 74,60 81,70 C88,70 90,54 91,42 Z" fill={PALETTE.dxEar} />

      {/* 머리 */}
      <circle cx={94} cy={50} r={17} fill={PALETTE.dxBody} />
      <ellipse cx={106} cy={57} rx={11} ry={7.5} fill={PALETTE.dxSnout} />
      <ellipse cx={114} cy={54} rx={3.6} ry={3} fill={PALETTE.nose} />
      <ellipse cx={88} cy={56} rx={3.4} ry={2.4} fill={PALETTE.cheek} opacity={0.6} />

      {/* 귀 (앞쪽) */}
      <path d="M92,37 C82,40 80,60 87,71 C94,70 96,53 96,41 Z" fill={PALETTE.dxEar} />

      <Eye x={90} y={47} mood={mood} />
      <Eye x={100} y={47} mood={mood} />
      <Mouth x={104} y={61} mood={mood} />
    </g>
  );
}

/* ───────────────────────── 푸들 ───────────────────────── */

function PoodleBase({ mood, tailWag }: { mood: DogMood; tailWag: boolean }) {
  const lying = mood === 'sleeping';
  return (
    <g>
      {/* 꼬리 (폼폼) */}
      <g
        className={tailWag && !lying ? 'dog-tail dog-tail--wag' : 'dog-tail'}
        style={{ transformOrigin: '34px 62px' }}
      >
        <path
          d="M34,62 C28,58 26,52 27,48"
          stroke={PALETTE.pdDark}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={26} cy={45} r={8} fill={PALETTE.pdBody} />
      </g>

      {/* 다리 */}
      {[38, 50, 66, 78].map((x) => (
        <rect key={x} x={x} y={lying ? 80 : 76} width={8} height={lying ? 12 : 18} rx={4} fill={PALETTE.pdDark} />
      ))}

      {/* 몸통 + 곱슬 털 */}
      <ellipse cx={56} cy={68} rx={28} ry={19} fill={PALETTE.pdBody} />
      {[
        [36, 60],
        [46, 54],
        [58, 52],
        [70, 58],
        [76, 68],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={8} fill={PALETTE.pdBody} />
      ))}

      {/* 귀 (폭신) */}
      <circle cx={75} cy={52} r={10.5} fill={PALETTE.pdDark} />

      {/* 머리 */}
      <circle cx={90} cy={46} r={16} fill={PALETTE.pdBody} />
      {/* 머리 위 곱슬 */}
      <circle cx={90} cy={29} r={11} fill={PALETTE.pdBody} />
      <circle cx={80} cy={34} r={7} fill={PALETTE.pdBody} />
      <circle cx={100} cy={34} r={7} fill={PALETTE.pdBody} />

      <ellipse cx={101} cy={53} rx={9} ry={6.5} fill={PALETTE.pdSnout} />
      <ellipse cx={108} cy={51} rx={3.2} ry={2.7} fill={PALETTE.nose} />
      <ellipse cx={86} cy={53} rx={3.4} ry={2.4} fill={PALETTE.cheek} opacity={0.75} />

      <Eye x={87} y={45} mood={mood} />
      <Eye x={96} y={45} mood={mood} />
      <Mouth x={100} y={57} mood={mood} />
    </g>
  );
}

/** 호감도 100 왕관 — 머리 위에 살짝 띄워 그립니다 (모자와 겹치지 않게) */
function MilestoneCrown({ breed }: { breed: DogId }) {
  const { x, y } = DOG_GEOMETRY[breed].head;
  const top = y - 12;
  return (
    <g className="crown-float">
      <path
        d={`M${x - 11},${top + 4} l0,-8 l5.5,4.5 l5.5,-8.5 l5.5,8.5 l5.5,-4.5 l0,8 z`}
        fill="#F7D35B"
        stroke="#DFB531"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <circle cx={x} cy={top - 6} r={1.8} fill="#FF8FB3" />
    </g>
  );
}

/** 목줄 — 목 기준점에 걸고 끈을 아래로 늘어뜨립니다 (2단계) */
function LeashLayer({ breed }: { breed: DogId }) {
  const { x, y } = DOG_GEOMETRY[breed].neck;
  return (
    <g aria-hidden="true">
      <ellipse cx={x} cy={y} rx={10} ry={4.4} fill="none" stroke={PALETTE.leash} strokeWidth={4} />
      <circle cx={x} cy={y + 4} r={2} fill={PALETTE.star} />
      <path d={`M${x - 8},${y + 2} q-14,10 -22,4`} fill="none" stroke={PALETTE.leash} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** 입마개 — 주둥이 타원에 맞춰 살짝만 덮습니다. 눈과 코는 가리지 않습니다 (무섭지 않게) */
function MuzzleLayer({ breed }: { breed: DogId }) {
  const { x, y, rx, ry } = DOG_GEOMETRY[breed].snout;
  return (
    <g aria-hidden="true" opacity={0.65}>
      <ellipse cx={x} cy={y + 1} rx={rx} ry={ry} fill={PALETTE.muzzle} />
      <path
        d={`M${x - rx},${y + 1} h${rx * 2} M${x - rx * 0.4},${y + 1 - ry} v${ry * 2} M${x + rx * 0.4},${y + 1 - ry} v${ry * 2}`}
        stroke="#9C8B74"
        strokeWidth={1.2}
        fill="none"
      />
      <path
        d={`M${x - rx},${y + 1} q${-rx * 0.7},${ry} ${-rx * 0.2},${ry * 1.8}`}
        fill="none"
        stroke="#9C8B74"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
}

/* ───────────────────────── 공개 컴포넌트 ───────────────────────── */

export interface DogProps {
  breed: DogId;
  mood?: DogMood;
  outfit?: { head?: string; body?: string; face?: string };
  /** 호감도 50 이상에서 해금되는 꼬리 흔들기 */
  tailWag?: boolean;
  /** 씻긴 뒤 반짝반짝 */
  sparkle?: boolean;
  /** 호감도 100에서 머리 위에 뜨는 왕관 */
  crown?: boolean;
  /** 출근·산책 때 목에 걸리는 목줄 (2단계) */
  leash?: boolean;
  /** 출근·교실에서 쓰는 입마개 (2단계). 집에 오면 벗습니다 */
  muzzle?: boolean;
  size?: number;
  className?: string;
}

const MOOD_LABEL: Record<DogMood, string> = {
  happy: '기쁜',
  hungry: '배고픈',
  sleepy: '졸린',
  sick: '아픈',
  sleeping: '자는',
};

export function Dog({
  breed,
  mood = 'happy',
  outfit,
  tailWag = false,
  sparkle = false,
  crown = false,
  leash = false,
  muzzle = false,
  size = 170,
  className,
}: DogProps) {
  const label = `${MOOD_LABEL[mood]} ${DOG_PROFILE[breed].breedLabel}`;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${DOG_VIEWBOX.width} ${DOG_VIEWBOX.height}`}
      width={size}
      height={(size * DOG_VIEWBOX.height) / DOG_VIEWBOX.width}
      role="img"
      aria-label={label}
    >
      {breed === 'dachshund' ? (
        <DachshundBase mood={mood} tailWag={tailWag} />
      ) : (
        <PoodleBase mood={mood} tailWag={tailWag} />
      )}

      {/* 옷은 레이어로 겹쳐 입습니다 */}
      {outfit?.body && <OutfitLayer id={outfit.body} breed={breed} />}
      {outfit?.face && <OutfitLayer id={outfit.face} breed={breed} />}
      {outfit?.head && <OutfitLayer id={outfit.head} breed={breed} />}

      {leash && <LeashLayer breed={breed} />}
      {muzzle && <MuzzleLayer breed={breed} />}

      {crown && <MilestoneCrown breed={breed} />}

      {sparkle && (
        <g className="sparkle-group">
          <text x={24} y={28} fontSize={16}>
            ✨
          </text>
          <text x={100} y={20} fontSize={14}>
            ✨
          </text>
          <text x={62} y={38} fontSize={12}>
            ✨
          </text>
        </g>
      )}
    </svg>
  );
}
