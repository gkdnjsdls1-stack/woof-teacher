import { HEARTS_MAX } from '../constants';

/** 강아지 머리 위에 항상 보이는 0~100 하트 게이지 */
export function HeartGauge({ name, hearts }: { name: string; hearts: number }) {
  const percent = Math.max(0, Math.min(100, (hearts / HEARTS_MAX) * 100));
  return (
    <div className="heart-gauge">
      <div className="heart-gauge__name">{name}</div>
      {/* 숫자는 막대 밖에 둡니다 — 막대 위에 얹으면 얼마나 찼는지가 가려집니다. */}
      <div className="heart-gauge__row">
        <div
          className="heart-gauge__bar"
          role="img"
          aria-label={`${name} 호감도 ${hearts}점 / ${HEARTS_MAX}점`}
        >
          <div className="heart-gauge__fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="heart-gauge__value" aria-hidden="true">
          ❤️{hearts}
        </span>
      </div>
    </div>
  );
}
