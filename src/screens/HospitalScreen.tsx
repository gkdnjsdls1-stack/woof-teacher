import { useState } from 'react';

import { Dog, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { Progress } from '../components/Progress';
import { TopBar } from '../components/TopBar';
import { BARKS, HOSPITAL_STEPS } from '../constants';
import { useGame } from '../state/GameContext';
import { sickDogs } from '../state/selectors';

/**
 * S10 — 병원. 아픈 날에만 열립니다.
 * 청진기 → 약 젤리 → 반창고 → "다 나았어요!"
 * 주사·피·수술 표현은 넣지 않습니다 (SPEC 6-8). 치료는 무료입니다.
 */
export function HospitalScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  // 화면에 들어온 순간의 환자를 기억합니다 (치료가 끝나면 목록이 비기 때문에).
  const [patients] = useState(() => sickDogs(save));
  const [step, setStep] = useState(0);

  const done = step >= HOSPITAL_STEPS.length;
  const current = HOSPITAL_STEPS[Math.min(step, HOSPITAL_STEPS.length - 1)];

  function tap() {
    sound(step === 1 ? 'eat' : 'bubble');
    const next = step + 1;
    if (next >= HOSPITAL_STEPS.length) {
      sound('sparkle');
      dispatch({ type: 'REWARD', action: 'hospital' });
    }
    setStep(next);
  }

  const names = patients.map((id) => save.dogs[id].name).join('와 ');

  return (
    <div className="screen hospital" style={screenBg('hospital')}>
      <TopBar title="병원 🏥" onBack={done ? undefined : onBack} />

      <h2 className="hospital__title">{done ? '다 나았어요! ✨' : current.title}</h2>

      <div className="hospital__bed">
        <div className="hospital__dogs">
          {patients.map((id) => (
            <Dog
              key={id}
              breed={id}
              mood={done ? 'happy' : 'sick'}
              outfit={save.dogs[id].outfit}
              size={130}
              tailWag={done}
              sparkle={done}
            />
          ))}
        </div>
        <p className="park__bark">{done ? BARKS.celebrate[0] : BARKS.sick[0]}</p>
      </div>

      {done ? (
        <footer className="hospital__footer">
          <p className="hospital__done-text">{names}가 건강해졌어요!</p>
          <BigButton onClick={onBack} glow>
            🏠 집으로
          </BigButton>
        </footer>
      ) : (
        <>
          <button
            type="button"
            className="hospital__tool"
            onClick={tap}
            aria-label={current.hint}
          >
            <span className="hospital__tool-emoji" aria-hidden="true">
              {current.emoji}
            </span>
            <span className="hospital__tool-label">{current.hint}</span>
          </button>
          <Progress value={step} target={HOSPITAL_STEPS.length} />
        </>
      )}
    </div>
  );
}
