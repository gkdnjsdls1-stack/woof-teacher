import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

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
  FEED_ITEMS,
  HOUSE_ACTION_LABEL,
  HOUSE_ENABLED,
  MILESTONE_CROWN,
  MILESTONE_TAIL_WAG,
  PICNIC_ACTION_LABEL,
  STROLL,
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

type FeedAction = (typeof FEED_ITEMS)[number]['action'];

/**
 * 홈에 깔리는 버튼. **순서가 없습니다** — 아무 거나 아무 때나 누릅니다.
 * 밥·물은 그릇에 직접 부어 주므로 여기 없고, 병원은 아픈 날에만 아래에서 붙입니다.
 * 재우기는 하루를 끝내므로 맨 마지막에 둡니다.
 */
const HOME_ACTIONS = ['dress', 'commute', 'lesson', 'walk', 'groom', 'wash', 'sleep'] as const;

/**
 * 끝낸 뒤에도 다시 들어갈 수 있는 행동.
 * 옷 입히기는 **옷가게로 가는 유일한 길**이라 꺼버리면 그날 번 코인을 쓸 데가 없어집니다.
 * 보상은 reducer 가 이미 하루 1회로 막으므로 다시 들어가도 호감도는 오르지 않습니다.
 */
const REOPENABLE: readonly string[] = ['dress'];

/** 홈 강아지 크기. 두 마리가 방 하나를 같이 쓰며 오가므로 조금 작습니다. */
const HOME_DOG_SIZE = 136;

/** S2 — 홈(방). 강아지가 돌아다니고, 오늘 할 수 있는 일이 전부 버튼으로 깔려 있습니다. */
export function HomeScreen({ onNavigate }: { onNavigate: (target: HomeTarget) => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const done = save.today.done;
  const picnic = save.today.lesson.type === 'picnic';

  const sick = sickDogs(save);
  const [bubble, setBubble] = useState<{ dogId: DogId; text: string } | null>(null);
  const [busy, setBusy] = useState<null | FeedAction>(null);
  const timers = useRef<number[]>([]);

  // 끌고 있는 먹이. 판정은 ref 로, 손가락을 따라다니는 그림만 state 로 둡니다
  // (출근 준비 화면과 같은 방식 — CommuteScreen.tsx).
  const dragging = useRef<FeedAction | null>(null);
  const [drag, setDrag] = useState<{ action: FeedAction; x: number; y: number } | null>(null);

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

  /** 그릇에 붓기 — 하루 1회. 이미 먹었으면 고개를 돌립니다. */
  function pour(action: FeedAction) {
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

  /* ── 먹이를 그릇으로 끌어다 놓기. 탭해도 부어집니다 (끌기는 보조 수단) ── */

  function startDrag(action: FeedAction) {
    return (event: ReactPointerEvent) => {
      // 마우스는 캡처해야 버튼 밖으로 나가도 따라옵니다 (터치는 자동으로 잡힙니다).
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* 캡처를 못 해도 끌기는 그대로 진행합니다 */
      }
      dragging.current = action;
      setDrag({ action, x: event.clientX, y: event.clientY });
    };
  }

  function endDrag() {
    const action = dragging.current;
    if (!action) return;
    dragging.current = null;
    setDrag(null);
    // 그릇 밖에 놓았어도, 그냥 탭했어도 부어 줍니다 — 아이가 막히지 않게.
    pour(action);
  }

  // 순서가 자유로워진 뒤로는 목욕이 하루의 끝이 아닙니다 —
  // 아침에 씻기면 남은 하루 내내 졸린 얼굴이 되므로 "재우기만 남았을 때"로 봅니다.
  const baseMood: DogMood = !done.feed ? 'hungry' : onlySleepLeft(save) ? 'sleepy' : 'happy';
  const eating = FEED_ITEMS.find((item) => item.action === busy);

  return (
    <div className="screen home" style={screenBg('home')}>
      <TopBar onSettings={() => onNavigate('settings')} />

      <div className="home__scene">
        {/* 하트 게이지는 강아지를 따라다니지 않고 방 위쪽(벽·창문 자리)에 붙여 둡니다 —
            강아지가 돌아다니므로 머리 위에 두면 글씨가 춤추고, 따로 한 줄을 내주면
            짧은 화면에서 버튼 줄이 밀립니다. */}
        <div className="home__hearts">
          {DOG_ORDER.map((id) => (
            <HeartGauge key={id} name={save.dogs[id].name} hearts={save.dogs[id].hearts} />
          ))}
        </div>

        {/* 방 안 장식입니다 (돌아다니는 강아지가 가립니다).
            집 꾸미기는 아래 버튼 줄의 `강아지집` 으로 들어갑니다. */}
        {HOUSE_ENABLED && (
          <div className="home__decor" aria-hidden="true">
            {DOG_ORDER.map((id) => (
              <DogHouse key={id} level={save.dogs[id].houseLevel} size={58} />
            ))}
          </div>
        )}

        {DOG_ORDER.map((id, index) => {
          const dog = save.dogs[id];
          // 왼쪽 강아지는 오른쪽으로, 오른쪽 강아지는 왼쪽으로 오갑니다.
          // 왕복 시간이 서로 달라 둘이 나란히 행진하지 않습니다.
          const toLeft = index > 0;
          const walk: CSSProperties = {
            [toLeft ? 'right' : 'left']: 0,
            '--leg': `${STROLL.legMs[id]}ms`,
            '--walk': `${toLeft ? -STROLL.range : STROLL.range}px`,
            '--bob': `${STROLL.bob}px`,
            '--bob-ms': `${STROLL.bobMs}ms`,
            // 왼쪽으로 먼저 걷는 강아지는 처음부터 왼쪽을 봐야 합니다 (뒷걸음 방지).
            '--face-delay': toLeft ? `${-STROLL.legMs[id]}ms` : '0ms',
          } as CSSProperties;
          return (
            <div
              key={id}
              className={busy ? 'home__walker home__walker--still' : 'home__walker'}
              style={walk}
            >
              <button
                type="button"
                className="home__dog"
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
                  size={HOME_DOG_SIZE}
                />
              </button>
              {/* 아픈 날 표시: 표정만으로는 아이가 알아채기 어려워 콧물을 함께 띄웁니다 (SPEC 6-8). */}
              {sick.includes(id) && (
                <span className="home__sick" aria-label={`${dog.name}가 아파요`}>
                  💧
                </span>
              )}
              {/* 먹는 동안에는 두 마리 다 "냠냠" — 아이가 부은 결과가 강아지 쪽에서 보이게 */}
              {eating ? (
                <SpeechBubble text={eating.eating} />
              ) : (
                bubble?.dogId === id && <SpeechBubble text={bubble.text} />
              )}
            </div>
          );
        })}
      </div>

      {/* 밥·물: 먹이를 그릇에 **끌어다 부어** 줍니다 (탭해도 됩니다) */}
      <div className="home__bowls">
        {FEED_ITEMS.map((item) => {
          const finished = done[item.action];
          const pouring = busy === item.action;
          // 다 먹은 그릇도 눌러는 집니다 — 아이가 또 주려고 할 때 "월월 🙅" 로 답합니다
          // (보상은 없습니다. 쓰다듬기와 같은 반응뿐입니다.)
          if (finished) {
            return (
              <button
                key={item.action}
                type="button"
                className="bowl bowl--done"
                onClick={() => pour(item.action)}
                aria-label={item.done}
              >
                {/* 다 먹었으니 그릇은 비어 있습니다 */}
                {item.action === 'feed' ? (
                  <FoodBowl filled={false} size={40} />
                ) : (
                  <WaterBowl filled={false} size={40} />
                )}
                <span className="bowl__label">{item.done}</span>
              </button>
            );
          }
          return (
            <div key={item.action} className="bowl">
              <button
                type="button"
                className="bowl__scoop"
                onPointerDown={startDrag(item.action)}
                onPointerMove={(event) =>
                  setDrag((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev))
                }
                onPointerUp={endDrag}
                onPointerCancel={() => {
                  dragging.current = null;
                  setDrag(null);
                }}
                disabled={busy !== null}
                aria-label={`${item.label} 부어 주기`}
              >
                <span className="bowl__scoop-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="bowl__scoop-label">{item.label}</span>
              </button>
              {/* 어디로 가져가야 하는지 화살표로 보여줍니다 (글씨를 늘리지 않고) */}
              <span className="bowl__arrow" aria-hidden="true">
                →
              </span>
              {item.action === 'feed' ? (
                <FoodBowl filled={pouring} size={56} />
              ) : (
                <WaterBowl filled={pouring} size={56} />
              )}
              <span className="bowl__label">
                {pouring ? item.eating : ACTION_LABEL[item.action]}
              </span>
            </div>
          );
        })}
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

      {/* 끌고 있는 먹이 — 손가락을 따라다닙니다 */}
      {drag && (
        <div className="home__ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {FEED_ITEMS.find((item) => item.action === drag.action)?.emoji}
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
