/**
 * 강아지 그림 — `public/art/dog/*.webp` 를 겹쳐 그립니다.
 *
 * 바깥에서 보는 모양(`DogProps`)은 SVG 플레이스홀더 때와 같습니다.
 * 자리 수치는 전부 `geometry.ts` 에 있습니다 — 이 파일에 좌표를 직접 쓰지 않습니다.
 */

import type { CSSProperties } from 'react';

import { DOG_PROFILE } from '../constants';
import type { DogId, DogMood } from '../types';
import { art } from './art';
import { PALETTE } from './palette';
import {
  CROWN_SPOT,
  DOG_ART,
  GEAR_PLACEMENT,
  OUTFIT_PLACEMENT,
  STAGE_RATIO,
  type Placement,
} from './geometry';

const MOOD_LABEL: Record<DogMood, string> = {
  happy: '기쁜',
  hungry: '배고픈',
  sleepy: '졸린',
  sick: '아픈',
  sleeping: '자는',
};

/** 자리값을 강아지 그림 안의 CSS 위치로 바꿉니다. */
function spot({ x, y, w, rotate }: Placement): CSSProperties {
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    transform: `translate(-50%, -50%)${rotate ? ` rotate(${rotate}deg)` : ''}`,
  };
}

/** 목에 두른 띠. 줄 그림 전체를 올리면 공중에 뜬 것처럼 보여서 띠만 그립니다. */
function Collar({ at }: { at: Placement }) {
  return (
    <svg viewBox="0 0 40 24" style={spot(at)} aria-hidden="true">
      <ellipse cx={20} cy={11} rx={16} ry={9} fill="none" stroke={PALETTE.leash} strokeWidth={7} />
      <circle cx={20} cy={21} r={4} fill={PALETTE.star} stroke={PALETTE.leash} strokeWidth={1.5} />
    </svg>
  );
}

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
  const { aspect, scale } = DOG_ART[breed];
  const gear = GEAR_PLACEMENT[breed];
  const label = `${MOOD_LABEL[mood]} ${DOG_PROFILE[breed].breedLabel}`;

  // 옷은 머리·얼굴·몸 세 칸뿐이라 순서가 고정입니다. 망토·날개만 뒤로 보냅니다.
  const worn = [outfit?.body, outfit?.face, outfit?.head].filter(Boolean) as string[];
  const layer = (id: string) => {
    const place = OUTFIT_PLACEMENT[id];
    if (!place) return null;
    return <img key={id} src={art(`outfit/${id}`)} alt="" style={spot(place)} />;
  };

  return (
    <div
      className={className ? `dog-art ${className}` : 'dog-art'}
      style={{ width: size, height: size * STAGE_RATIO }}
      role="img"
      aria-label={label}
    >
      {/* 강아지 그림 — 바닥을 무대 아래에 맞춥니다 */}
      <div
        className="dog-art__body"
        style={{ width: `${scale * 100}%`, aspectRatio: `1 / ${aspect}` }}
      >
        {worn.filter((id) => OUTFIT_PLACEMENT[id]?.behind).map(layer)}

        <img
          className={tailWag ? 'dog-art__dog dog-art__dog--wag' : 'dog-art__dog'}
          src={art(`dog/${breed}-${mood}`)}
          alt=""
        />

        {worn.filter((id) => !OUTFIT_PLACEMENT[id]?.behind).map(layer)}

        {leash && <Collar at={gear.collar} />}
        {muzzle && <img src={art('prop/muzzle')} alt="" style={spot(gear.muzzle)} />}

        {crown && (
          <svg
            className="crown-float"
            viewBox="0 0 40 30"
            style={spot({ ...CROWN_SPOT[breed], w: CROWN_SPOT[breed].w })}
          >
            <path
              d="M4,24 l0,-16 l8,7 l8,-13 l8,13 l8,-7 l0,16 z"
              fill="#F7D35B"
              stroke="#DFB531"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <circle cx={20} cy={3} r={3} fill="#FF8FB3" />
          </svg>
        )}

        {sparkle && (
          <span className="dog-art__sparkle sparkle-group" aria-hidden="true">
            ✨
          </span>
        )}
      </div>
    </div>
  );
}
