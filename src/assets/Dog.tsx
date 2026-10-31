/**
 * 강아지 그림 (SVG 플레이스홀더).
 * 나중에 실제 그림으로 교체할 때는 이 파일만 바꾸면 됩니다.
 * 표정: 기쁨 · 배고픔 · 졸림 · 아픔 · 자는 중 / 꼬리 흔들기 애니메이션
 */

import type { ReactNode } from 'react';

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
      // 눈썹은 넣지 않습니다 — 두꺼운 눈썹에 동그란 눈이면 '화난 얼굴'로 읽힙니다.
      return (
        <g>
          <circle cx={x} cy={y} r={3.8} fill={PALETTE.eye} />
          <circle cx={x + 1.4} cy={y - 1.4} r={1.3} fill={PALETTE.shine} />
        </g>
      );
    case 'sleepy':
    case 'sleeping':
      return <path d={`M${x - 3.6},${y - 1} q3.6,3.8 7.2,0`} {...stroke} />;
    case 'sick':
      return <path d={`M${x - 3.6},${y - 1.6} q3.6,3.4 7.2,0`} {...stroke} />;
    case 'happy':
    default:
      // 기쁠 때는 눈을 뜹니다. 감은 눈으로만 그리면 늘 졸려 보입니다.
      return (
        <g>
          <circle cx={x} cy={y} r={4} fill={PALETTE.eye} />
          <circle cx={x + 1.5} cy={y - 1.5} r={1.5} fill={PALETTE.shine} />
          <circle cx={x - 1.4} cy={y + 1.6} r={0.8} fill={PALETTE.shine} opacity={0.7} />
        </g>
      );
  }
}

function Mouth({ x, y, mood }: { x: number; y: number; mood: DogMood }) {
  switch (mood) {
    case 'hungry':
      return (
        <g>
          <path
            d={`M${x - 6},${y - 0.5} q6,9.5 12,0 z`}
            fill={PALETTE.nose}
            stroke={PALETTE.nose}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <path d={`M${x - 3.2},${y + 3.4} q3.2,5.2 6.4,0 z`} fill={PALETTE.tongue} />
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

/* ───────────────────────── 그리기 도우미 ───────────────────────── */

/**
 * 털 음영 — 덧그린 타원은 몸 위에 '띠'처럼 보여서, 모양 자체를 그라데이션으로 칠합니다.
 * 같은 id 가 한 화면에 여러 번 나와도 내용이 같아 문제 없습니다.
 */
function FurGradients() {
  return (
    <defs>
      <radialGradient id="furDx" cx="40%" cy="28%" r="78%">
        <stop offset="0%" stopColor="#D9975C" />
        <stop offset="100%" stopColor={PALETTE.dxBody} />
      </radialGradient>
      <radialGradient id="furPd" cx="40%" cy="26%" r="80%">
        <stop offset="0%" stopColor="#FFF6E8" />
        <stop offset="100%" stopColor={PALETTE.pdBody} />
      </radialGradient>
    </defs>
  );
}

/**
 * 같은 모양을 두 번 그려 **바깥 테두리만** 남깁니다.
 * 뒤 겹에 굵은 선을 깔고 앞 겹으로 덮으면, 몸통·머리가 겹치는 안쪽 선이 지워집니다.
 * (모양마다 선을 주면 배 위로 다리 선이 지나가 지저분해집니다.)
 */
function Inked({ line, width = 5, children }: { line: string; width?: number; children: ReactNode }) {
  return (
    <>
      <g stroke={line} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
      <g>{children}</g>
    </>
  );
}

/** 바닥 그림자 — 바닥에 붙어 선 느낌을 줍니다 (어느 배경에서도 어울리게 옅게). */
function GroundShadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.17} fill={PALETTE.shadow} opacity={0.22} />;
}

/** 발 — 네모난 다리 끝에 발바닥을 붙입니다. */
function Paw({ x, y, w, fill }: { x: number; y: number; w: number; fill: string }) {
  return <ellipse cx={x + w / 2} cy={y} rx={w * 0.62} ry={w * 0.42} fill={fill} />;
}

/* ───────────────────────── 닥스훈트 ───────────────────────── */

function DachshundBase({ mood, tailWag }: { mood: DogMood; tailWag: boolean }) {
  const lying = mood === 'sleeping';
  const legTop = lying ? 80 : 76;
  const legH = lying ? 12 : 18;
  const footY = legTop + legH;

  /** 윤곽선 겹과 색칠 겹이 **같은 모양**을 써야 테두리가 어긋나지 않습니다. */
  const shapes = (
    <>
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

      {/* 뒤쪽 다리 (그늘진 색으로 깊이를 냅니다) */}
      {[30, 65].map((x) => (
        <g key={`back-${x}`}>
          <rect x={x} y={legTop} width={9} height={legH} rx={4.5} fill={PALETTE.dxShade} />
          <Paw x={x} y={footY} w={9} fill={PALETTE.dxShade} />
        </g>
      ))}

      {/* 몸통 (닥스훈트는 길쭉합니다) */}
      <ellipse cx={56} cy={70} rx={35} ry={15} fill="url(#furDx)" />

      {/* 앞쪽 다리 */}
      {[45, 79].map((x) => (
        <g key={`front-${x}`}>
          <rect x={x} y={legTop} width={9} height={legH} rx={4.5} fill={PALETTE.dxDark} />
          <Paw x={x} y={footY} w={9} fill={PALETTE.dxDark} />
        </g>
      ))}

      {/* 귀 (뒤쪽) — 닥스훈트는 귀가 길어야 닥스훈트로 보입니다 */}
      <path d="M80,36 C64,39 60,62 68,78 C78,77 81,56 83,41 Z" fill={PALETTE.dxLine} />

      {/* 머리 · 주둥이 — 좌표는 geometry.ts 기준점과 맞물려 있어 바꾸지 않습니다 */}
      <circle cx={94} cy={50} r={17} fill="url(#furDx)" />
      <ellipse cx={106} cy={57} rx={11} ry={7.5} fill={PALETTE.dxSnout} />

      {/* 귀 (앞쪽) */}
      <path d="M83,35 C69,39 65,63 73,80 C83,78 86,55 87,40 Z" fill={PALETTE.dxEar} />
    </>
  );

  return (
    <g>
      {!lying && <GroundShadow cx={58} cy={95} rx={34} />}
      <Inked line={PALETTE.dxLine}>{shapes}</Inked>

      <ellipse cx={114} cy={54} rx={3.6} ry={3} fill={PALETTE.nose} />
      <ellipse cx={88} cy={57} rx={4} ry={2.8} fill={PALETTE.cheek} opacity={0.6} />

      <Eye x={90} y={47} mood={mood} />
      <Eye x={100} y={47} mood={mood} />
      <Mouth x={104} y={61} mood={mood} />
    </g>
  );
}

/* ───────────────────────── 푸들 ───────────────────────── */

function PoodleBase({ mood, tailWag }: { mood: DogMood; tailWag: boolean }) {
  const lying = mood === 'sleeping';
  const legTop = lying ? 80 : 76;
  const legH = lying ? 12 : 18;
  const footY = legTop + legH;

  /** 곱슬 덩어리 — 윤곽선 겹과 색칠 겹, 그리고 곱슬 결에 모두 같은 좌표를 씁니다. */
  const curls: [number, number, number][] = [
    [36, 60, 8],
    [46, 54, 8],
    [58, 52, 8],
    [70, 58, 8],
    [76, 68, 8],
  ];

  const shapes = (
    <>
      {/* 꼬리 (폼폼) */}
      <g
        className={tailWag && !lying ? 'dog-tail dog-tail--wag' : 'dog-tail'}
        style={{ transformOrigin: '34px 62px' }}
      >
        <path
          d="M34,62 C30,57 29,52 29,49"
          stroke={PALETTE.pdDark}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={28} cy={46} r={8.5} fill="url(#furPd)" />
      </g>

      {/* 뒤쪽 다리 */}
      {[38, 66].map((x) => (
        <g key={`back-${x}`}>
          <rect x={x} y={legTop} width={8} height={legH} rx={4} fill={PALETTE.pdShade} />
          <Paw x={x} y={footY} w={8} fill={PALETTE.pdShade} />
        </g>
      ))}

      {/* 몸통 + 곱슬 털 */}
      <ellipse cx={56} cy={68} rx={28} ry={19} fill="url(#furPd)" />
      {curls.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#furPd)" />
      ))}

      {/* 앞쪽 다리 */}
      {[50, 78].map((x) => (
        <g key={`front-${x}`}>
          <rect x={x} y={legTop} width={8} height={legH} rx={4} fill={PALETTE.pdDark} />
          <Paw x={x} y={footY} w={8} fill={PALETTE.pdDark} />
        </g>
      ))}

      {/* 귀 (폭신하게 늘어뜨립니다) */}
      <ellipse cx={76} cy={56} rx={10.5} ry={13} fill={PALETTE.pdDark} />

      {/* 머리 · 머리 위 곱슬 · 주둥이 — geometry.ts 기준점과 맞물린 좌표입니다 */}
      <circle cx={90} cy={46} r={16} fill="url(#furPd)" />
      <circle cx={90} cy={29} r={11} fill="url(#furPd)" />
      <circle cx={80} cy={34} r={7} fill="url(#furPd)" />
      <circle cx={100} cy={34} r={7} fill="url(#furPd)" />
      <ellipse cx={101} cy={53} rx={9} ry={6.5} fill={PALETTE.pdSnout} />
    </>
  );

  return (
    <g>
      {!lying && <GroundShadow cx={58} cy={95} rx={30} />}
      <Inked line={PALETTE.pdLine} width={4}>
        {shapes}
      </Inked>

      {/* 곱슬 결 — 윤곽선 겹이 앞 겹에 덮이므로, 털 느낌은 여기서 따로 그립니다 */}
      <g fill="none" stroke={PALETTE.pdLine} strokeWidth={1.4} strokeLinecap="round" opacity={0.55}>
        {curls.map(([cx, cy, r]) => (
          <path key={`curl-${cx}-${cy}`} d={`M${cx - r * 0.7},${cy + r * 0.2} a${r * 0.8},${r * 0.8} 0 0 1 ${r * 1.4},0`} />
        ))}
        <path d={`M${83},${30} a9,9 0 0 1 14,0`} />
      </g>

      <ellipse cx={108} cy={51} rx={3.2} ry={2.7} fill={PALETTE.nose} />
      <ellipse cx={86} cy={54} rx={4} ry={2.8} fill={PALETTE.cheek} opacity={0.75} />

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
      <FurGradients />

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
