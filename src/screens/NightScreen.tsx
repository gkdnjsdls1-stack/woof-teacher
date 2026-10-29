import { useEffect, useMemo, useRef, useState } from 'react';

import { Dog, MoonAndStars } from '../assets';
import { SpeechBubble } from '../components/SpeechBubble';
import {
  BARKS,
  DOG_ORDER,
  LESSON_BY_WEEKDAY,
  TIMING,
  TOMORROW_PREVIEWS,
  TOMORROW_WEEKDAY_PREVIEWS,
  TOMORROW_WEEKEND_PREVIEWS,
  WEEKDAY_LABEL,
} from '../constants';
import { addDays, weekdayIndex } from '../lib/date';
import { makeRng, pickRandom, seedFromString } from '../lib/random';
import { useGame } from '../state/GameContext';
import type { DogId, SaveData } from '../types';

/**
 * 내일 예고 카드 3장 — 요일 안내 1장 + 할 일 예고 2장.
 * 내일 날짜를 시드로 쓰므로 같은 날에는 몇 번 봐도 같은 카드가 나옵니다.
 */
function buildPreviews(save: SaveData): string[] {
  const tomorrow = addDays(save.today.date, 1);
  const rng = makeRng(seedFromString(tomorrow));
  // 주말에는 출근·수업이 없으므로 그 예고를 섞지 않습니다 (거짓 예고 금지 — SPEC 1번).
  const pool =
    LESSON_BY_WEEKDAY[weekdayIndex(tomorrow)] === 'picnic'
      ? [...TOMORROW_PREVIEWS, ...TOMORROW_WEEKEND_PREVIEWS]
      : [...TOMORROW_PREVIEWS, ...TOMORROW_WEEKDAY_PREVIEWS];
  const indexes = pool.map((_, i) => i);
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  const names = DOG_ORDER.map((id) => save.dogs[id].name);
  const cards = indexes.slice(0, 2).map((i) => {
    const name = names[Math.floor(rng() * names.length) % names.length];
    return pool[i].replace('{name}', name);
  });
  cards.unshift(`내일은 ${WEEKDAY_LABEL[weekdayIndex(tomorrow)]}요일이에요 🗓️`);
  return cards;
}

/**
 * S13 — 밤 / 내일 예고.
 * 종료 버튼은 두지 않습니다. 할 일이 없어졌으니 아이가 스스로 끄게 합니다.
 * 같은 날 다시 열면 자는 강아지 화면만 보이고 메뉴는 모두 잠깁니다.
 */
export function NightScreen({ justFinished }: { justFinished: boolean }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const previews = useMemo(() => buildPreviews(save), [save]);
  const [bubble, setBubble] = useState<{ dogId: DogId; text: string } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  /** 쓰다듬으면 "음냐…월" 반응만 있고 보상은 없습니다. */
  function pet(dogId: DogId) {
    sound('bark');
    setBubble({ dogId, text: pickRandom(BARKS.sleeping) });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBubble(null), TIMING.speechBubble);
  }

  return (
    <div className="screen night">
      <button
        type="button"
        className="night__mute"
        onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
        aria-label={save.settings.muted ? '소리 켜기' : '소리 끄기'}
      >
        {save.settings.muted ? '🔇' : '🔊'}
      </button>

      <div className="night__sky">
        <MoonAndStars size={190} />
      </div>

      <div className="night__dogs">
        {DOG_ORDER.map((id) => (
          <div className="night__dog" key={id}>
            <button
              type="button"
              className="night__dog-button"
              onClick={() => pet(id)}
              aria-label={`${save.dogs[id].name} 쓰다듬기`}
            >
              <Dog breed={id} mood="sleeping" outfit={save.dogs[id].outfit} size={130} />
            </button>
            <span className="night__zzz" aria-hidden="true">
              💤
            </span>
            {bubble?.dogId === id && <SpeechBubble text={bubble.text} />}
          </div>
        ))}
      </div>

      {justFinished ? (
        <>
          <h2 className="night__title">오늘 할 일을 다 했어요!</h2>
          <ul className="night__previews">
            {previews.map((text, i) => (
              <li key={i} className="night__card">
                {text}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2 className="night__title">오늘은 다 했어요. 쿨쿨 💤</h2>
      )}

      <p className="night__bye">내일 또 만나요 🌙</p>
    </div>
  );
}
