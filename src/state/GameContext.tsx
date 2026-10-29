import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { TIMING } from '../constants';
import { getTodayString } from '../lib/date';
import { playSound, setMuted, type SoundName } from '../lib/sound';
import { loadSave, writeSave } from '../lib/storage';
import { createNewSave, gameReducer, type GameAction, type GameState } from './gameReducer';

interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  /** 음소거 설정을 반영해 효과음을 재생합니다. */
  sound: (name: SoundName) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function initGame(): GameState {
  const today = getTodayString();
  const loaded = loadSave();
  const base: GameState = loaded
    ? { save: loaded, missedDays: 0, celebrations: [] }
    : { save: createNewSave(today), missedDays: 0, celebrations: [] };
  // 저장된 날짜와 오늘을 비교해 새 하루 처리를 먼저 끝냅니다.
  return gameReducer(base, { type: 'DAY_CHECK', today });
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, initGame);

  // 저장: 상태가 바뀔 때마다 localStorage 한 곳에 씁니다.
  useEffect(() => {
    writeSave(state.save);
  }, [state.save]);

  // 음소거 설정을 효과음 모듈에 반영합니다.
  useEffect(() => {
    setMuted(state.save.settings.muted);
  }, [state.save.settings.muted]);

  /**
   * 플레이 시간: **화면에 보이는 동안만** 셉니다 (SPEC 9번).
   * 켜 놓고 자리를 비운 시간이 기록에 섞이면 보호자가 보는 숫자가 거짓이 됩니다.
   */
  const visibleSince = useRef<number | null>(null);

  // 새 하루 확인 + 플레이 시간 적립: 포그라운드 복귀 · 주기적 확인(자정을 넘겨 켜둔 경우).
  useEffect(() => {
    const check = () => dispatch({ type: 'DAY_CHECK', today: getTodayString() });
    const flush = () => {
      if (visibleSince.current === null) return;
      const now = Date.now();
      const seconds = Math.round((now - visibleSince.current) / 1000);
      visibleSince.current = now;
      if (seconds > 0) dispatch({ type: 'ADD_PLAYTIME', seconds });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        visibleSince.current = Date.now();
        check();
      } else {
        flush();
        visibleSince.current = null;
      }
    };
    if (document.visibilityState === 'visible') visibleSince.current = Date.now();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    window.addEventListener('pagehide', flush);
    const timer = window.setInterval(() => {
      flush();
      check();
    }, TIMING.dayCheckInterval);
    return () => {
      flush();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
      window.removeEventListener('pagehide', flush);
      window.clearInterval(timer);
    };
  }, []);

  const sound = useCallback(
    (name: SoundName) => {
      if (state.save.settings.muted) return;
      playSound(name);
    },
    [state.save.settings.muted],
  );

  const value = useMemo<GameContextValue>(() => ({ state, dispatch, sound }), [state, sound]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame 은 GameProvider 안에서만 쓸 수 있습니다.');
  return ctx;
}
