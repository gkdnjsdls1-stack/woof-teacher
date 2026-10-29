import { CHECKBOARD, CURRENT_STAGE } from '../constants';
import type { DayDone } from '../types';

/** 오늘의 체크판 (8칸) — 홈 화면 상단에 항상 보입니다. */
export function CheckBoard({ done }: { done: DayDone }) {
  return (
    <ul className="checkboard" aria-label="오늘의 체크판">
      {CHECKBOARD.map((cell) => {
        const isDone = done[cell.key];
        // 아직 안 열린 단계의 칸은 자물쇠로 보여줍니다 (아이가 흐름을 미리 볼 수 있게).
        const locked = cell.stage > CURRENT_STAGE;
        return (
          <li
            key={cell.key}
            className={[
              'checkboard__cell',
              isDone ? 'checkboard__cell--done' : '',
              locked ? 'checkboard__cell--locked' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="checkboard__emoji" aria-hidden="true">
              {locked ? '🔒' : isDone ? '✅' : cell.emoji}
            </span>
            <span className="checkboard__label">{cell.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
