import { useEffect, useRef, useState } from 'react';

import { Dog, MoonAndStars, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { BARKS, TIMING } from '../constants';
import { useGame } from '../state/GameContext';

/** 재우기 — 불 끄기 버튼 → "쿨쿨 💤" → 화면이 어두워집니다. */
export function SleepScreen({
  onFinished,
  onBack,
}: {
  onFinished: () => void;
  onBack: () => void;
}) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [lightsOut, setLightsOut] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function turnOffLights() {
    if (lightsOut) return;
    setLightsOut(true);
    sound('sleep');
    timer.current = window.setTimeout(() => {
      dispatch({ type: 'REWARD', action: 'sleep' });
      onFinished();
    }, TIMING.lightsOut);
  }

  return (
    <div
      className={lightsOut ? 'screen sleep sleep--dark' : 'screen sleep'}
      style={lightsOut ? undefined : screenBg('night', 'dark')}
    >
      {!lightsOut && <TopBar title="재우기 🌙" onBack={onBack} />}

      <div className="sleep__sky">
        <MoonAndStars size={160} />
      </div>

      <h2 className="sleep__title">
        {lightsOut
          ? '쿨쿨 💤'
          : `${save.dogs.dachshund.name}와 ${save.dogs.poodle.name}가 졸려해요`}
      </h2>

      <div className="sleep__dogs">
        <Dog breed="dachshund" mood={lightsOut ? 'sleeping' : 'sleepy'} size={140} />
        <Dog breed="poodle" mood={lightsOut ? 'sleeping' : 'sleepy'} size={140} />
      </div>

      {lightsOut ? (
        <p className="sleep__bark">{BARKS.sleeping[1]}</p>
      ) : (
        <footer className="sleep__footer">
          <BigButton onClick={turnOffLights} glow>
            💡 불 끄기
          </BigButton>
        </footer>
      )}
    </div>
  );
}
