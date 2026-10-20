import { useEffect, useRef, useState } from 'react';

import { Dog, DogHouse, FoodBowl, WaterBowl } from '../assets';
import { BigButton } from '../components/BigButton';
import { CheckBoard } from '../components/CheckBoard';
import { HeartGauge } from '../components/HeartGauge';
import { SpeechBubble } from '../components/SpeechBubble';
import { TopBar } from '../components/TopBar';
import { ACTION_LABEL, BARKS, DOG_ORDER, MILESTONE_TAIL_WAG, TIMING } from '../constants';
import { pickRandom } from '../lib/random';
import { useGame } from '../state/GameContext';
import { nextAction } from '../state/selectors';
import type { DogId, DogMood } from '../types';

export type HomeTarget = 'dress' | 'wash' | 'sleep';

/** S2 — 홈(강아지집). 다음에 할 일 버튼 하나만 크게 반짝입니다. */
export function HomeScreen({ onNavigate }: { onNavigate: (target: HomeTarget) => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const done = save.today.done;
  const next = nextAction(save);

  const [bubble, setBubble] = useState<{ dogId: DogId; text: string } | null>(null);
  const [busy, setBusy] = useState<null | 'feed' | 'water'>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function showBubble(dogId: DogId, text: string) {
    setBubble({ dogId, text });
    later(() => setBubble(null), TIMING.speechBubble);
  }

  /** 쓰다듬기: 반응만 있고 보상은 없습니다 (무제한 허용). */
  function pet(dogId: DogId) {
    if (busy) return;
    sound('bark');
    const lines = !done.feed ? BARKS.hungry : done.wash ? BARKS.sleepy : BARKS.happy;
    showBubble(dogId, pickRandom(lines));
  }

  /** 밥·물 주기 — 하루 1회. 이미 먹었으면 고개를 돌립니다. */
  function feedOrWater(action: 'feed' | 'water') {
    if (busy) return;
    if (done[action]) {
      sound('bark');
      showBubble('dachshund', pickRandom(BARKS.refuse));
      return;
    }
    setBusy(action);
    sound(action === 'feed' ? 'eat' : 'water');
    later(() => {
      dispatch({ type: 'REWARD', action });
      setBusy(null);
      sound('bark');
    }, TIMING.eating);
  }

  function doNext() {
    if (!next) return;
    if (next === 'feed' || next === 'water') feedOrWater(next);
    else onNavigate(next as HomeTarget);
  }

  const mood: DogMood = !done.feed ? 'hungry' : done.wash ? 'sleepy' : 'happy';

  return (
    <div className="screen home">
      <TopBar />
      <CheckBoard done={done} />

      <div className="home__scene">
        {DOG_ORDER.map((id) => {
          const dog = save.dogs[id];
          return (
            <div className="dog-slot" key={id}>
              <HeartGauge name={dog.name} hearts={dog.hearts} />
              <div className="dog-slot__stage">
                <span className="dog-slot__house">
                  <DogHouse level={dog.houseLevel} size={78} />
                </span>
                <button
                  type="button"
                  className="dog-slot__dog"
                  onClick={() => pet(id)}
                  aria-label={`${dog.name} 쓰다듬기`}
                >
                  <Dog
                    breed={id}
                    mood={mood}
                    outfit={dog.outfit}
                    tailWag={dog.hearts >= MILESTONE_TAIL_WAG}
                    sparkle={done.wash}
                    size={152}
                  />
                </button>
                {bubble?.dogId === id && <SpeechBubble text={bubble.text} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="home__bowls">
        <button
          type="button"
          className={done.feed ? 'bowl bowl--done' : 'bowl'}
          onClick={() => feedOrWater('feed')}
          aria-label={done.feed ? '밥은 다 먹었어요' : '밥 주기'}
        >
          <FoodBowl filled={false} size={72} />
          <span className="bowl__label">{done.feed ? '다 먹었어요 ✅' : '밥 주기'}</span>
        </button>
        <button
          type="button"
          className={done.water ? 'bowl bowl--done' : 'bowl'}
          onClick={() => feedOrWater('water')}
          aria-label={done.water ? '물은 다 마셨어요' : '물 주기'}
        >
          <WaterBowl filled={false} size={72} />
          <span className="bowl__label">{done.water ? '다 마셨어요 ✅' : '물 주기'}</span>
        </button>
      </div>

      <footer className="home__next">
        <span className="home__next-label">다음에 할 일</span>
        <BigButton onClick={doNext} glow disabled={!next || busy !== null}>
          {next ? ACTION_LABEL[next] : '오늘은 다 했어요 🌙'}
        </BigButton>
      </footer>

      {/* 밥·물 먹는 애니메이션 */}
      {busy && (
        <div className="overlay" role="status">
          <div className="overlay__card">
            <p className="overlay__title">{busy === 'feed' ? '냠냠 🍖' : '꿀꺽 💧'}</p>
            <div className="overlay__dogs">
              <Dog breed="dachshund" mood="happy" outfit={save.dogs.dachshund.outfit} size={120} tailWag />
              <Dog breed="poodle" mood="happy" outfit={save.dogs.poodle.outfit} size={120} tailWag />
            </div>
            <div className="overlay__bowl">
              {busy === 'feed' ? <FoodBowl size={88} /> : <WaterBowl size={88} />}
            </div>
            <p className="overlay__bark">월월!</p>
          </div>
        </div>
      )}

      {/* 오랜만에 접속했을 때 반김 연출 (벌칙 느낌 없게) */}
      {state.missedDays > 0 && (
        <div className="overlay">
          <div className="overlay__card">
            <p className="overlay__title">{BARKS.welcome[0]}</p>
            <div className="overlay__dogs">
              <Dog breed="dachshund" mood="happy" outfit={save.dogs.dachshund.outfit} size={120} tailWag />
              <Dog breed="poodle" mood="happy" outfit={save.dogs.poodle.outfit} size={120} tailWag />
            </div>
            <BigButton
              onClick={() => {
                sound('bark');
                dispatch({ type: 'DISMISS_WELCOME' });
              }}
            >
              🐾 반가워!
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
