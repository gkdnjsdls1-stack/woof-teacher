import { useState } from 'react';

import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import {
  DOG_ORDER,
  DOG_PROFILE,
  GUARDIAN_GATE_MAX,
  GUARDIAN_GATE_MIN,
  NAME_MAX_LENGTH,
  PLAYTIME_LOG_DAYS,
  WEEKDAY_LABEL,
} from '../constants';
import { addDays, getTodayString, weekdayIndex } from '../lib/date';
import { useGame } from '../state/GameContext';
import type { DogId } from '../types';

/** 관문 문제를 한 번 만들어 둡니다 (화면을 열 때마다 새 문제). */
function makeGate() {
  const range = GUARDIAN_GATE_MAX - GUARDIAN_GATE_MIN + 1;
  const a = GUARDIAN_GATE_MIN + Math.floor(Math.random() * range);
  const b = GUARDIAN_GATE_MIN + Math.floor(Math.random() * range);
  return { a, b };
}

function minutesLabel(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? '1분 미만' : `${minutes}분`;
}

/**
 * S14 — 보호자 설정 (숨김).
 * 제한·잠금 기능은 넣지 않습니다. 보여주기만 합니다 (SPEC 9번).
 */
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useGame();
  const save = state.save;
  const [gate] = useState(makeGate);
  const [answer, setAnswer] = useState('');
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [names, setNames] = useState<Record<DogId, string>>({
    dachshund: save.dogs.dachshund.name,
    poodle: save.dogs.poodle.name,
  });
  const [confirmReset, setConfirmReset] = useState(false);

  function checkGate() {
    if (Number(answer) === gate.a + gate.b) {
      setOpen(true);
      return;
    }
    setWrong(true);
    setAnswer('');
  }

  if (!open) {
    return (
      <div className="screen settings">
        <TopBar title="보호자 설정" onBack={onBack} />
        <div className="settings__gate">
          <p className="settings__gate-q">
            {gate.a} + {gate.b} = ?
          </p>
          <input
            className="settings__input"
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setWrong(false);
            }}
            aria-label="덧셈 답"
          />
          {wrong && <p className="settings__warning">답이 달라요. 다시 해보세요.</p>}
          <BigButton onClick={checkGate} disabled={answer === ''} glow={answer !== ''}>
            확인
          </BigButton>
        </div>
      </div>
    );
  }

  // 최근 기록 (오늘부터 거꾸로). 기록이 없는 날은 0분으로 보여줍니다.
  const today = getTodayString();
  const days = Array.from({ length: PLAYTIME_LOG_DAYS }, (_, i) => {
    const date = addDays(today, -i);
    return { date, seconds: save.playtimeLog[date] ?? 0 };
  });

  return (
    <div className="screen settings">
      <TopBar title="보호자 설정" onBack={onBack} />

      <section className="settings__section">
        <h3 className="settings__title">플레이 시간 (최근 {PLAYTIME_LOG_DAYS}일)</h3>
        <p className="settings__note">화면이 켜져 보이는 동안만 잽니다. 제한 기능은 없습니다.</p>
        <ul className="settings__log">
          {days.map(({ date, seconds }) => (
            <li key={date} className="settings__log-row">
              <span>
                {date} ({WEEKDAY_LABEL[weekdayIndex(date)]})
              </span>
              <span className="settings__log-value">
                {seconds === 0 ? '—' : minutesLabel(seconds)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="settings__section">
        <h3 className="settings__title">이름 바꾸기</h3>
        {DOG_ORDER.map((id) => (
          <div className="settings__row" key={id}>
            <label className="settings__label" htmlFor={`name-${id}`}>
              {DOG_PROFILE[id].emoji} {DOG_PROFILE[id].breedLabel}
            </label>
            <input
              id={`name-${id}`}
              className="settings__input"
              value={names[id]}
              maxLength={NAME_MAX_LENGTH}
              onChange={(event) => setNames((prev) => ({ ...prev, [id]: event.target.value }))}
            />
            <button
              type="button"
              className="home__wardrobe"
              onClick={() => dispatch({ type: 'RENAME_DOG', dogId: id, name: names[id] })}
              disabled={!names[id].trim() || names[id] === save.dogs[id].name}
            >
              저장
            </button>
          </div>
        ))}
      </section>

      <section className="settings__section">
        <h3 className="settings__title">소리</h3>
        <button
          type="button"
          className="home__wardrobe"
          onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
        >
          {save.settings.muted ? '🔇 소리 꺼짐 (켜기)' : '🔊 소리 켜짐 (끄기)'}
        </button>
      </section>

      <section className="settings__section">
        <h3 className="settings__title">전체 초기화</h3>
        <p className="settings__note">
          이름·호감도·코인·옷·집이 모두 지워지고 처음부터 시작합니다. 되돌릴 수 없습니다.
        </p>
        {confirmReset ? (
          <div className="settings__row">
            <button
              type="button"
              className="home__wardrobe"
              onClick={() => {
                dispatch({ type: 'RESET', today: getTodayString() });
                onBack();
              }}
            >
              정말 지워요
            </button>
            <button type="button" className="home__wardrobe" onClick={() => setConfirmReset(false)}>
              그만둘래요
            </button>
          </div>
        ) : (
          <button type="button" className="home__wardrobe" onClick={() => setConfirmReset(true)}>
            초기화하기
          </button>
        )}
      </section>

      <footer className="settings__footer">
        <BigButton onClick={onBack}>🏠 나가기</BigButton>
      </footer>
    </div>
  );
}
