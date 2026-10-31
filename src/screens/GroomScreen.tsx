import { useEffect, useState } from 'react';

import { Dog, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { Progress } from '../components/Progress';
import { TopBar } from '../components/TopBar';
import { BARKS, GROOM_DRY_TARGET, GROOM_SNIP_TARGET, TIMING } from '../constants';
import { useGame } from '../state/GameContext';

type Step = 'snip' | 'dry' | 'reveal' | 'done';

/**
 * S9 — 미용실. 가위로 다듬기 → 드라이어 → 커튼이 열리며 "짠!"
 * 두 마리를 한 번에 손질합니다 — 보상(`REWARD groom`)이 두 마리에게 함께 가므로
 * 강아지를 고르는 단계를 두면 고르는 재미 없이 탭만 늘어납니다.
 */
export function GroomScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [step, setStep] = useState<Step>('snip');
  const [count, setCount] = useState(0);

  const target = step === 'snip' ? GROOM_SNIP_TARGET : GROOM_DRY_TARGET;

  function tap() {
    sound(step === 'snip' ? 'bubble' : 'water');
    const next = count + 1;
    if (next < target) {
      setCount(next);
      return;
    }
    setCount(0);
    setStep(step === 'snip' ? 'dry' : 'reveal');
  }

  // 커튼이 열리는 동안 보상을 넣습니다 (이미 한 날이면 reducer 가 그냥 넘깁니다).
  useEffect(() => {
    if (step !== 'reveal') return;
    const timer = window.setTimeout(() => {
      sound('sparkle');
      dispatch({ type: 'REWARD', action: 'groom' });
      setStep('done');
    }, TIMING.groomCurtain);
    return () => window.clearTimeout(timer);
  }, [step, dispatch, sound]);

  const opened = step === 'reveal' || step === 'done';

  return (
    <div className="screen groom" style={screenBg('groom')}>
      <TopBar title="미용실 ✂️" onBack={opened ? undefined : onBack} />

      <h2 className="groom__title">
        {step === 'snip'
          ? '털을 다듬어요 ✂️'
          : step === 'dry'
            ? '드라이어로 말려요 💨'
            : '짠! ✨'}
      </h2>

      <div className="groom__mirror">
        <div className="groom__dogs">
          <Dog
            breed="dachshund"
            mood="happy"
            outfit={save.dogs.dachshund.outfit}
            size={126}
            tailWag
            sparkle={step === 'done'}
          />
          <Dog
            breed="poodle"
            mood="happy"
            outfit={save.dogs.poodle.outfit}
            size={126}
            tailWag
            sparkle={step === 'done'}
          />
        </div>
        <div
          className={opened ? 'groom__curtain groom__curtain--open' : 'groom__curtain'}
          aria-hidden="true"
        >
          <span className="groom__curtain-left" />
          <span className="groom__curtain-right" />
        </div>
        {step === 'done' && <p className="park__bark">{BARKS.celebrate[0]}</p>}
      </div>

      {opened ? (
        <footer className="groom__footer">
          <p className="groom__done-text">
            {save.dogs.dachshund.name}와 {save.dogs.poodle.name}가 예뻐졌어요!
          </p>
          <BigButton onClick={onBack} glow={step === 'done'} disabled={step !== 'done'}>
            🏠 집으로
          </BigButton>
        </footer>
      ) : (
        <>
          <button
            type="button"
            className="groom__tool"
            onClick={tap}
            aria-label={step === 'snip' ? '가위로 다듬기' : '드라이어로 말리기'}
          >
            {step === 'snip' ? '✂️' : '💨'}
            <span className="groom__tool-label">콕콕 눌러요</span>
          </button>
          <Progress value={count} target={target} />
        </>
      )}
    </div>
  );
}
