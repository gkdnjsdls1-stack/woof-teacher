import { useEffect, useRef, useState } from 'react';

import { Dog, DogHouse, FoodBowl, WaterBowl } from '../assets';
import { BigButton } from '../components/BigButton';
import { CheckBoard } from '../components/CheckBoard';
import { HeartGauge } from '../components/HeartGauge';
import { SpeechBubble } from '../components/SpeechBubble';
import { TopBar } from '../components/TopBar';
import {
  ACTION_LABEL,
  BARKS,
  DOG_ORDER,
  HOUSE_ENABLED,
  MILESTONE_CROWN,
  MILESTONE_TAIL_WAG,
  PICNIC_ACTION_LABEL,
  TIMING,
} from '../constants';
import { pickRandom } from '../lib/random';
import { useGame } from '../state/GameContext';
import { canDo, nextAction, sickDogs } from '../state/selectors';
import type { DogId, DogMood } from '../types';

export type HomeTarget =
  | 'dress'
  | 'commute'
  | 'lesson'
  | 'walk'
  | 'wash'
  | 'sleep'
  | 'groom'
  | 'house'
  | 'hospital'
  | 'settings';

/** S2 — 홈(강아지집). 다음에 할 일 버튼 하나만 크게 반짝입니다. */
export function HomeScreen({ onNavigate }: { onNavigate: (target: HomeTarget) => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const done = save.today.done;
  const next = nextAction(save);
  // 주말에는 수업 대신 소풍이라 버튼 문구만 바뀝니다 (없는 기능을 예고하지 않기 위해).
  const nextLabel =
    next === 'lesson' && save.today.lesson.type === 'picnic'
      ? PICNIC_ACTION_LABEL
      : next && ACTION_LABEL[next];

  const sick = sickDogs(save);
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
    const lines = sick.includes(dogId)
      ? BARKS.sick
      : !done.feed
        ? BARKS.hungry
        : done.wash
          ? BARKS.sleepy
          : BARKS.happy;
    showBubble(dogId, pickRandom(lines));
  }

  /** 밥·물 주기 — 하루 1회. 이미 먹었으면 고개를 돌립니다. */
  function feedOrWater(action: 'feed' | 'water') {
    if (busy) return;
    if (done[action]) {
      sound('bark');
      showBubble(pickRandom(DOG_ORDER), pickRandom(BARKS.refuse));
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

  const baseMood: DogMood = !done.feed ? 'hungry' : done.wash ? 'sleepy' : 'happy';

  return (
    <div className="screen home">
      <TopBar onSettings={() => onNavigate('settings')} />
      <CheckBoard done={done} />

      <div className="home__scene">
        {DOG_ORDER.map((id) => {
          const dog = save.dogs[id];
          return (
            <div className="dog-slot" key={id}>
              <HeartGauge name={dog.name} hearts={dog.hearts} />
              <div className="dog-slot__stage">
                {HOUSE_ENABLED && (
                  <button
                    type="button"
                    className="dog-slot__house"
                    onClick={() => onNavigate('house')}
                    aria-label={`${dog.name}의 집 꾸미기`}
                  >
                    <DogHouse level={dog.houseLevel} size={62} />
                  </button>
                )}
                <button
                  type="button"
                  className="dog-slot__dog"
                  onClick={() => pet(id)}
                  aria-label={`${dog.name} 쓰다듬기`}
                >
                  <Dog
                    breed={id}
                    mood={sick.includes(id) ? 'sick' : baseMood}
                    outfit={dog.outfit}
                    tailWag={dog.hearts >= MILESTONE_TAIL_WAG}
                    crown={dog.hearts >= MILESTONE_CROWN}
                    sparkle={done.wash || done.groom}
                    size={152}
                  />
                </button>
                {/* 아픈 날 표시: 표정만으로는 아이가 알아채기 어려워 콧물을 함께 띄웁니다 (SPEC 6-8). */}
                {sick.includes(id) && (
                  <span className="dog-slot__sick" aria-label={`${dog.name}가 아파요`}>
                    💧
                  </span>
                )}
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
          <FoodBowl filled={!done.feed} size={72} />
          <span className="bowl__label">{done.feed ? '다 먹었어요 ✅' : '밥 주기'}</span>
        </button>
        <button
          type="button"
          className={done.water ? 'bowl bowl--done' : 'bowl'}
          onClick={() => feedOrWater('water')}
          aria-label={done.water ? '물은 다 마셨어요' : '물 주기'}
        >
          <WaterBowl filled={!done.water} size={72} />
          <span className="bowl__label">{done.water ? '다 마셨어요 ✅' : '물 주기'}</span>
        </button>
      </div>

      <footer className="home__next">
        <div className="home__extras">
          {done.dress && (
            <button
              type="button"
              className="home__wardrobe"
              onClick={() => onNavigate('dress')}
              disabled={busy !== null}
            >
              👕 옷 갈아입히기
            </button>
          )}
          {/* 병원은 아픈 날에만 보입니다. 안 데려가도 다음 날 저절로 낫습니다 (벌칙 없음). */}
          {canDo(save, 'hospital') && (
            <button
              type="button"
              className="home__wardrobe home__wardrobe--care"
              onClick={() => onNavigate('hospital')}
              disabled={busy !== null}
            >
              🏥 병원 가기
            </button>
          )}
          {/* 미용실은 체크판 밖의 보너스입니다 — 하루 1번, 학교에 다녀온 뒤에만 보입니다. */}
          {canDo(save, 'groom') && !done.groom && (
            <button
              type="button"
              className="home__wardrobe"
              onClick={() => onNavigate('groom')}
              disabled={busy !== null}
            >
              ✂️ 미용실 가기
            </button>
          )}
        </div>
        <span className="home__next-label">다음에 할 일</span>
        <BigButton onClick={doNext} glow disabled={!next || busy !== null}>
          {nextLabel ?? '오늘은 다 했어요 🌙'}
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
