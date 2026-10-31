import { useEffect, useRef, useState } from 'react';

import { Dog, DogHouse, FoodBowl, WaterBowl, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { HeartGauge } from '../components/HeartGauge';
import { SpeechBubble } from '../components/SpeechBubble';
import { TopBar } from '../components/TopBar';
import {
  ACTION_LABEL,
  BARKS,
  DOG_ORDER,
  DRESS_AGAIN_LABEL,
  HOUSE_ACTION_LABEL,
  HOUSE_ENABLED,
  MILESTONE_CROWN,
  MILESTONE_TAIL_WAG,
  PICNIC_ACTION_LABEL,
  TIMING,
} from '../constants';
import { pickRandom } from '../lib/random';
import { useGame } from '../state/GameContext';
import { canDo, onlySleepLeft, sickDogs } from '../state/selectors';
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

/**
 * 홈에 깔리는 버튼. **순서가 없습니다** — 아무 거나 아무 때나 누릅니다.
 * 밥·물은 그릇으로 따로 주므로 여기 없고, 병원은 아픈 날에만 아래에서 붙입니다.
 * 재우기는 하루를 끝내므로 맨 마지막에 둡니다.
 */
const HOME_ACTIONS = ['dress', 'commute', 'lesson', 'walk', 'groom', 'wash', 'sleep'] as const;

/**
 * 끝낸 뒤에도 다시 들어갈 수 있는 행동.
 * 옷 입히기는 **옷가게로 가는 유일한 길**이라 꺼버리면 그날 번 코인을 쓸 데가 없어집니다.
 * 보상은 reducer 가 이미 하루 1회로 막으므로 다시 들어가도 호감도는 오르지 않습니다.
 */
const REOPENABLE: readonly string[] = ['dress'];

/** S2 — 홈(강아지집). 오늘 할 수 있는 일을 전부 버튼으로 깔아둡니다. */
export function HomeScreen({ onNavigate }: { onNavigate: (target: HomeTarget) => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const done = save.today.done;
  const picnic = save.today.lesson.type === 'picnic';

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
        : onlySleepLeft(save)
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

  // 순서가 자유로워진 뒤로는 목욕이 하루의 끝이 아닙니다 —
  // 아침에 씻기면 남은 하루 내내 졸린 얼굴이 되므로 "재우기만 남았을 때"로 봅니다.
  const baseMood: DogMood = !done.feed ? 'hungry' : onlySleepLeft(save) ? 'sleepy' : 'happy';

  return (
    <div className="screen home" style={screenBg('home')}>
      <TopBar onSettings={() => onNavigate('settings')} />

      <div className="home__scene">
        {DOG_ORDER.map((id) => {
          const dog = save.dogs[id];
          return (
            <div className="dog-slot" key={id}>
              <HeartGauge name={dog.name} hearts={dog.hearts} />
              <div className="dog-slot__stage">
                {/* 방 안 장식입니다. 강아지 그림에 가려 누를 수 없으므로
                    집 꾸미기는 아래 버튼 줄의 `강아지집` 으로 들어갑니다. */}
                {HOUSE_ENABLED && (
                  <span className="dog-slot__house" aria-hidden="true">
                    <DogHouse level={dog.houseLevel} size={62} />
                  </span>
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

      <footer className="home__actions">
        {HOME_ACTIONS.map((key) => {
          // 주말에는 수업 대신 소풍입니다 — 없는 기능을 예고하지 않으려고 문구만 바꿉니다.
          const label = key === 'lesson' && picnic ? PICNIC_ACTION_LABEL : ACTION_LABEL[key];
          const finished = done[key];
          const reopen = finished && REOPENABLE.includes(key);
          return (
            <button
              key={key}
              type="button"
              className={finished && !reopen ? 'home__do home__do--done' : 'home__do'}
              onClick={() => onNavigate(key)}
              disabled={(finished && !reopen) || busy !== null}
            >
              {reopen ? DRESS_AGAIN_LABEL : finished ? `${label} ✅` : label}
            </button>
          );
        })}
        {/* 강아지집은 코인을 쓰는 곳이라 하루 제한이 없습니다 (끝나는 행동이 아닙니다). */}
        {HOUSE_ENABLED && (
          <button
            type="button"
            className="home__do"
            onClick={() => onNavigate('house')}
            disabled={busy !== null}
          >
            {HOUSE_ACTION_LABEL}
          </button>
        )}
        {/* 병원은 아픈 날에만 보입니다. 안 데려가도 다음 날 저절로 낫습니다 (벌칙 없음). */}
        {canDo(save, 'hospital') && (
          <button
            type="button"
            className="home__do home__do--care"
            onClick={() => onNavigate('hospital')}
            disabled={busy !== null}
          >
            {ACTION_LABEL.hospital}
          </button>
        )}
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
