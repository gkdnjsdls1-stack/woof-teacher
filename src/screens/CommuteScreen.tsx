import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { Dog, Leash, Muzzle, OpenCar, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { BARKS, COMMUTE_GEAR, DOG_ORDER, TIMING, type GearKey } from '../constants';
import { useGame } from '../state/GameContext';
import type { DogId } from '../types';

type Phase = 'gear' | 'drive' | 'arrived';
type Worn = Record<DogId, Record<GearKey, boolean>>;

const NOTHING_WORN: Worn = {
  dachshund: { leash: false, muzzle: false },
  poodle: { leash: false, muzzle: false },
};

function GearIcon({ gear, size }: { gear: GearKey; size: number }) {
  return gear === 'leash' ? <Leash size={size} /> : <Muzzle size={size} />;
}

/**
 * S5+S6 — 출근 준비 → 오픈카 이동.
 * 목줄·입마개를 **강아지에게 끌어다** 채우고(탭해도 채워집니다), 둘 다 채우면 출발합니다.
 * 입마개는 이 화면의 상태일 뿐이라 집에 오면 저절로 벗겨집니다 (SPEC 6-9).
 */
export function CommuteScreen({ onBack, onArrive }: { onBack: () => void; onArrive: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const picnic = save.today.lesson.type === 'picnic';

  const [phase, setPhase] = useState<Phase>('gear');
  const [worn, setWorn] = useState<Worn>(NOTHING_WORN);
  // 끌고 있는 준비물. 판정은 ref 로 합니다 (렌더 사이에 끼어도 어긋나지 않게),
  // state 는 손가락을 따라다니는 그림 위치에만 씁니다.
  const dragging = useRef<GearKey | null>(null);
  const [drag, setDrag] = useState<{ gear: GearKey; x: number; y: number } | null>(null);
  const [honk, setHonk] = useState(false);

  // 강아지 영역 — 드래그를 놓은 자리가 어느 강아지인지 판단합니다.
  const dogBoxes = useRef<Partial<Record<DogId, HTMLDivElement | null>>>({});

  const ready = DOG_ORDER.every((id) => COMMUTE_GEAR.every((g) => worn[id][g.key]));

  function putOn(dogId: DogId, gear: GearKey) {
    if (worn[dogId][gear]) return;
    sound('bark');
    setWorn((prev) => ({ ...prev, [dogId]: { ...prev[dogId], [gear]: true } }));
  }

  function dropAt(gear: GearKey, x: number, y: number) {
    for (const id of DOG_ORDER) {
      const box = dogBoxes.current[id]?.getBoundingClientRect();
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        putOn(id, gear);
        return;
      }
    }
    // 그냥 탭했거나 엉뚱한 곳에 놓았으면 아직 안 한 강아지에게 채웁니다 (아이가 막히지 않게).
    const waiting = DOG_ORDER.find((id) => !worn[id][gear]);
    if (waiting) putOn(waiting, gear);
  }

  function startDrag(gear: GearKey) {
    return (event: ReactPointerEvent) => {
      // 마우스는 캡처해야 버튼 밖으로 나가도 따라옵니다 (터치는 자동으로 잡힙니다).
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* 캡처를 못 해도 드래그는 그대로 진행합니다 */
      }
      dragging.current = gear;
      setDrag({ gear, x: event.clientX, y: event.clientY });
    };
  }

  function moveDrag(event: ReactPointerEvent) {
    setDrag((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
  }

  function endDrag(event: ReactPointerEvent) {
    const gear = dragging.current;
    if (!gear) return;
    dragging.current = null;
    dropAt(gear, event.clientX, event.clientY);
    setDrag(null);
  }

  // 드라이브는 10~15초 뒤 저절로 도착합니다 (아이가 기다리는 동안 빵빵만 누릅니다).
  useEffect(() => {
    if (phase !== 'drive') return;
    const timer = window.setTimeout(() => setPhase('arrived'), TIMING.drive);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // 도착했을 때 한 번만 보상합니다 (reducer 가 하루 1회를 또 막아줍니다).
  useEffect(() => {
    if (phase !== 'arrived') return;
    sound('sparkle');
    dispatch({ type: 'REWARD', action: 'commute' });
  }, [phase, dispatch, sound]);

  if (phase === 'gear') {
    return (
      <div className="screen commute" style={screenBg('commute')}>
        <TopBar title="출근 준비 🚗" onBack={onBack} />
        <h2 className="commute__title">목줄과 입마개를 채워요</h2>

        <div className="commute__dogs">
          {DOG_ORDER.map((id) => {
            const dog = save.dogs[id];
            const done = COMMUTE_GEAR.every((g) => worn[id][g.key]);
            return (
              <div
                key={id}
                className={done ? 'gear-dog gear-dog--ready' : 'gear-dog'}
                ref={(el) => {
                  dogBoxes.current[id] = el;
                }}
              >
                <Dog
                  breed={id}
                  mood="happy"
                  outfit={dog.outfit}
                  leash={worn[id].leash}
                  muzzle={worn[id].muzzle}
                  size={140}
                  tailWag
                />
                <span className="gear-dog__name">
                  {dog.name} {done ? '✅' : ''}
                </span>
                <span className="gear-dog__todo">
                  {COMMUTE_GEAR.filter((g) => !worn[id][g.key])
                    .map((g) => g.label)
                    .join(' · ') || '준비 끝!'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="commute__tray" aria-label="출근 준비물">
          {COMMUTE_GEAR.map((gear) => {
            // 둘 다 채운 준비물은 꺼둡니다 — 눌러도 아무 일이 없으면 아이가 고장으로 봅니다.
            const allOn = DOG_ORDER.every((id) => worn[id][gear.key]);
            return (
              <button
                key={gear.key}
                type="button"
                className={allOn ? 'tray-item tray-item--done' : 'tray-item'}
                disabled={allOn}
                onPointerDown={startDrag(gear.key)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={() => {
                  dragging.current = null;
                  setDrag(null);
                }}
                aria-label={allOn ? `${gear.label} 다 채웠어요` : `${gear.label} 채우기`}
              >
                <GearIcon gear={gear.key} size={52} />
                <span className="tray-item__label">
                  {gear.label} {allOn ? '✅' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* 탭해도 채워지므로(dropAt 참고) 안내에 두 가지를 모두 적습니다. 다 채우면 안내를 치웁니다. */}
        {!ready && <p className="commute__hint">콕 누르거나 강아지에게 끌어다 놓아요</p>}

        <footer className="commute__footer">
          <BigButton
            onClick={() => {
              sound('honk');
              setPhase('drive');
            }}
            glow={ready}
            disabled={!ready}
          >
            {ready ? '🚗 출발!' : '준비물을 채워주세요'}
          </BigButton>
        </footer>

        {/* 끌고 있는 준비물 — 손가락을 따라다닙니다 */}
        {drag && (
          <div className="commute__ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
            <GearIcon gear={drag.gear} size={64} />
          </div>
        )}
      </div>
    );
  }

  if (phase === 'drive') {
    return (
      <div className="screen commute commute--drive" style={screenBg('commute')}>
        <TopBar title={picnic ? '공원 가는 길 🧺' : '학교 가는 길 🚗'} />
        <button
          type="button"
          className="car"
          onClick={() => {
            sound('honk');
            setHonk(true);
            window.setTimeout(() => setHonk(false), TIMING.speechBubble);
          }}
          aria-label="경적 누르기"
        >
          <OpenCar size={320} />
          <span className="car__dogs">
            <Dog breed="dachshund" mood="happy" muzzle size={60} className="car__dog" />
            <Dog breed="poodle" mood="happy" muzzle size={60} className="car__dog" />
          </span>
          {honk && <span className="car__honk">빵빵! 📢</span>}
        </button>

        <p className="commute__hint">자동차를 누르면 빵빵 소리가 나요</p>
      </div>
    );
  }

  return (
    <div className="screen commute commute--arrived" style={screenBg(picnic ? 'walk' : 'lesson')}>
      <TopBar title={picnic ? '공원 도착 🧺' : '학교 도착 🏫'} />
      <h2 className="commute__title">{picnic ? '공원에 도착했어요!' : '학교에 도착했어요!'}</h2>
      <div className="commute__dogs">
        <Dog breed="dachshund" mood="happy" muzzle size={130} tailWag />
        <Dog breed="poodle" mood="happy" muzzle size={130} tailWag />
      </div>
      <p className="commute__bark">{BARKS.happy[0]}</p>
      <footer className="commute__footer">
        <BigButton onClick={onArrive} glow>
          {picnic ? '🧺 소풍 시작하기' : '🏫 교실로 들어가기'}
        </BigButton>
      </footer>
    </div>
  );
}
