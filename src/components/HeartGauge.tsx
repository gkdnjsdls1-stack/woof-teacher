import { HEARTS_MAX } from '../constants';

/** 강아지 머리 위에 항상 보이는 0~100 하트 게이지 */
export function HeartGauge({ name, hearts }: { name: string; hearts: number }) {
  const percent = Math.max(0, Math.min(100, (hearts / HEARTS_MAX) * 100));
  return (
    <div className="heart-gauge">
      <div className="heart-gauge__name">{name}</div>
      <div
        className="heart-gauge__bar"
        role="img"
        aria-label={`${name} 호감도 ${hearts}점 / ${HEARTS_MAX}점`}
      >
        <div className="heart-gauge__fill" style={{ width: `${percent}%` }} />
        <span className="heart-gauge__value">❤️ {hearts}</span>
      </div>
    </div>
  );
}
