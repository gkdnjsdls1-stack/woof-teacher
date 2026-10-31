import { useCallback, useEffect, useState } from 'react';

import { Dog, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { Progress } from '../components/Progress';
import { TopBar } from '../components/TopBar';
import { PICNIC_TAPS, WALK_SEGMENT_MS } from '../constants';
import { useGame } from '../state/GameContext';

type Phase = 'walk' | 'spot' | 'done';

/** 구간 수 = 탭거리 3곳 + 마지막 구간 하나 (끝이 있는 구조 — SPEC 6-10) */
const SPOTS = PICNIC_TAPS.length;

/**
 * S8 — 산책. 공원이 옆으로 흘러가고, 꽃·나비·공 앞에서 멈춥니다.
 * 탭하면 다시 걷고, 끝 지점에 닿으면 산책이 끝납니다.
 * 기다리기 싫으면 공원을 탭해서 바로 다음 지점까지 갈 수 있습니다.
 */
export function WalkScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [passed, setPassed] = useState(0);
  const [phase, setPhase] = useState<Phase>('walk');
  const [bark, setBark] = useState<string | null>(null);

  /** 한 구간 걷기 끝 — 탭거리가 남았으면 멈추고, 없으면 도착입니다. */
  const advance = useCallback(() => {
    if (passed < SPOTS) {
      setPhase('spot');
      return;
    }
    sound('sparkle');
    dispatch({ type: 'REWARD', action: 'walk' });
    setPhase('done');
  }, [passed, dispatch, sound]);

  useEffect(() => {
    if (phase !== 'walk') return;
    const timer = window.setTimeout(advance, WALK_SEGMENT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, advance]);

  function tapSpot() {
    const spot = PICNIC_TAPS[passed];
    sound('bark');
    setBark(spot.bark);
    setPassed((p) => p + 1);
    setPhase('walk');
  }

  const walking = phase === 'walk';

  return (
    <div className="screen walk" style={screenBg('walk')}>
      <TopBar title="산책 🌳" onBack={phase === 'done' ? undefined : onBack} />

      <div
        className={walking ? 'park park--walking' : 'park'}
        onClick={walking ? advance : undefined}
        role={walking ? 'button' : undefined}
        aria-label={walking ? '공원을 눌러 다음 지점으로' : undefined}
      >
        <div className="park__dogs">
          <Dog
            breed="dachshund"
            mood="happy"
            outfit={save.dogs.dachshund.outfit}
            leash
            size={110}
            tailWag
            sparkle={phase === 'done'}
          />
          <Dog
            breed="poodle"
            mood="happy"
            outfit={save.dogs.poodle.outfit}
            leash
            size={110}
            tailWag
            sparkle={phase === 'done'}
          />
        </div>
        {bark && <p className="park__bark">{bark}</p>}
      </div>

      {phase === 'spot' && (
        <>
          <h2 className="walk__title">무엇이 있을까요?</h2>
          <div className="park__taps">
            <button
              type="button"
              className="park__tap"
              onClick={tapSpot}
              aria-label={`${PICNIC_TAPS[passed].emoji} 보기`}
            >
              {PICNIC_TAPS[passed].emoji}
            </button>
          </div>
        </>
      )}

      {phase === 'walk' && (
        <>
          <h2 className="walk__title">산책하는 중이에요 🐾</h2>
          <p className="walk__hint">공원을 콕 누르면 더 빨리 가요</p>
        </>
      )}

      {phase !== 'done' ? (
        <Progress value={passed} target={SPOTS + 1} />
      ) : (
        <footer className="walk__footer">
          <p className="walk__done-text">
            {save.dogs.dachshund.name}와 {save.dogs.poodle.name}가 산책을 다 했어요!
          </p>
          <BigButton onClick={onBack} glow>
            🏠 집으로
          </BigButton>
        </footer>
      )}
    </div>
  );
}
