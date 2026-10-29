import { useRef } from 'react';

import { COINS_ENABLED, GUARDIAN_LONG_PRESS_MS } from '../constants';
import { useGame } from '../state/GameContext';

/** 코인 + 음소거. 코인은 2단계(수업)부터 벌 수 있어, 그 전에는 코인을 숨깁니다. */
export function TopBar({
  title,
  onBack,
  onSettings,
}: {
  title?: string;
  onBack?: () => void;
  /** 주면 톱니바퀴가 보입니다. **3초 길게** 눌러야 열립니다 (홈에서만 씁니다). */
  onSettings?: () => void;
}) {
  const { state, dispatch } = useGame();
  const muted = state.save.settings.muted;
  const hold = useRef<number | null>(null);

  function holdStart() {
    if (!onSettings) return;
    hold.current = window.setTimeout(onSettings, GUARDIAN_LONG_PRESS_MS);
  }

  function holdEnd() {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  }

  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="topbar__back" onClick={onBack} aria-label="집으로 돌아가기">
          🏠
        </button>
      )}
      {COINS_ENABLED && (
        <span className="topbar__coins" aria-label={`뼈다귀 코인 ${state.save.coins}개`}>
          🦴 {state.save.coins}
        </span>
      )}
      {title && <span className="topbar__title">{title}</span>}
      {onSettings && (
        <button
          type="button"
          className="topbar__gear"
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerLeave={holdEnd}
          onPointerCancel={holdEnd}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="보호자 설정 (길게 누르기)"
        >
          ⚙️
        </button>
      )}
      <button
        type="button"
        className="topbar__mute"
        onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
        aria-label={muted ? '소리 켜기' : '소리 끄기'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </header>
  );
}
