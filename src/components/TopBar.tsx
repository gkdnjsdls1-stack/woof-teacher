import { useGame } from '../state/GameContext';

/** 코인 + 음소거. 코인은 2단계(수업)부터 벌 수 있습니다. */
export function TopBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const { state, dispatch } = useGame();
  const muted = state.save.settings.muted;

  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="topbar__back" onClick={onBack} aria-label="집으로 돌아가기">
          🏠
        </button>
      )}
      <span className="topbar__coins" aria-label={`뼈다귀 코인 ${state.save.coins}개`}>
        🦴 {state.save.coins}
      </span>
      {title && <span className="topbar__title">{title}</span>}
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
