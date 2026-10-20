import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { Dog, Shower, SoapBubble, Towel } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import {
  BARKS,
  WASH_RINSE_TARGET,
  WASH_SCRUB_TARGET,
  WASH_TOWEL_TARGET,
} from '../constants';
import { useGame } from '../state/GameContext';

type Step = 'scrub' | 'rinse' | 'towel' | 'done';

/** 드래그(또는 탭) 횟수를 세는 작은 도우미 — 문지르기/닦기에 씁니다. */
function useRubCounter(onTick: () => void) {
  const active = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown: (event: ReactPointerEvent) => {
      active.current = true;
      last.current = { x: event.clientX, y: event.clientY };
      onTick(); // 탭만 해도 조금씩 진행되게 (초2 눈높이)
    },
    onPointerMove: (event: ReactPointerEvent) => {
      if (!active.current) return;
      const prev = last.current;
      if (!prev) {
        last.current = { x: event.clientX, y: event.clientY };
        return;
      }
      const distance = Math.hypot(event.clientX - prev.x, event.clientY - prev.y);
      if (distance < 18) return;
      last.current = { x: event.clientX, y: event.clientY };
      onTick();
    },
    onPointerUp: () => {
      active.current = false;
      last.current = null;
    },
    onPointerLeave: () => {
      active.current = false;
      last.current = null;
    },
  };
}

function Progress({ value, target }: { value: number; target: number }) {
  const percent = Math.min(100, (value / target) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value}>
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

/** S11 — 목욕: 거품 문지르기 → 물로 헹구기 → 수건으로 닦기 */
export function WashScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [step, setStep] = useState<Step>('scrub');
  const [count, setCount] = useState(0);

  const target =
    step === 'scrub' ? WASH_SCRUB_TARGET : step === 'towel' ? WASH_TOWEL_TARGET : WASH_RINSE_TARGET;

  const tick = () => setCount((c) => c + 1);
  const rub = useRubCounter(tick);
  const rubbing = step === 'scrub' || step === 'towel';

  // 소리는 몇 번에 한 번만 (귀 안 아프게)
  useEffect(() => {
    if (count === 0 || step === 'done') return;
    if (count % 4 === 0) sound(step === 'scrub' ? 'bubble' : step === 'towel' ? 'bark' : 'water');
  }, [count, step, sound]);

  // 단계 넘기기
  useEffect(() => {
    if (step === 'done' || count < target) return;
    setCount(0);
    if (step === 'scrub') {
      sound('water');
      setStep('rinse');
    } else if (step === 'rinse') {
      sound('bubble');
      setStep('towel');
    } else {
      sound('sparkle');
      dispatch({ type: 'REWARD', action: 'wash' });
      setStep('done');
    }
  }, [count, target, step, dispatch, sound]);

  const title =
    step === 'scrub'
      ? '거품으로 문질러요 🫧'
      : step === 'rinse'
        ? '물로 헹궈요 🚿'
        : step === 'towel'
          ? '수건으로 닦아요 🧺'
          : '반짝반짝! ✨';

  return (
    <div className="screen wash">
      <TopBar title="목욕 🛁" onBack={step === 'done' ? undefined : onBack} />
      <h2 className="wash__title">{title}</h2>

      <div
        className={`wash__tub wash__tub--${step}`}
        onPointerDown={rubbing ? rub.onPointerDown : undefined}
        onPointerMove={rubbing ? rub.onPointerMove : undefined}
        onPointerUp={rubbing ? rub.onPointerUp : undefined}
        onPointerLeave={rubbing ? rub.onPointerLeave : undefined}
      >
        <div className="wash__dogs">
          <Dog breed="dachshund" mood="happy" size={132} sparkle={step === 'done'} tailWag />
          <Dog breed="poodle" mood="happy" size={132} sparkle={step === 'done'} tailWag />
        </div>

        {step === 'scrub' && (
          <div className="wash__bubbles" aria-hidden="true">
            {Array.from({ length: Math.min(10, count) }, (_, i) => (
              <SoapBubble key={i} size={26 + (i % 3) * 8} delay={i * 120} />
            ))}
          </div>
        )}

        {step === 'towel' && (
          <div className="wash__towel" aria-hidden="true">
            <Towel size={64} />
          </div>
        )}

        {step === 'done' && <p className="wash__bark">{BARKS.wash[0]}</p>}
      </div>

      {step === 'rinse' && (
        <button type="button" className="wash__shower" onClick={tick} aria-label="샤워기로 헹구기">
          <Shower size={86} />
          <span>콕콕 눌러요</span>
        </button>
      )}

      {step !== 'done' ? (
        <>
          <Progress value={count} target={target} />
          <p className="wash__hint">
            {step === 'rinse' ? '샤워기를 눌러주세요' : '강아지를 쓱쓱 문질러주세요'}
          </p>
        </>
      ) : (
        <footer className="wash__footer">
          <p className="wash__done-text">
            {save.dogs.dachshund.name}와 {save.dogs.poodle.name}가 깨끗해졌어요!
          </p>
          <BigButton onClick={onBack} glow>
            🏠 집으로
          </BigButton>
        </footer>
      )}
    </div>
  );
}
