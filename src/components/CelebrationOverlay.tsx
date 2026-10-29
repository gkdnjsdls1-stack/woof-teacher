import { Dog, OUTFIT_EMOJI } from '../assets';
import { BigButton } from '../components/BigButton';
import {
  BARKS,
  GIFT_OUTFITS,
  MILESTONE_CROWN,
  MILESTONE_KISS,
  MILESTONE_TAIL_WAG,
  MILESTONE_TEXT,
} from '../constants';
import { outfitById } from '../state/economy';
import { useGame } from '../state/GameContext';

/**
 * 호감도 단계(50 / 80 / 100) 축하 연출.
 * reducer 가 `celebrations` 큐에 쌓아둔 것을 앞에서부터 한 개씩 보여줍니다.
 * 어느 화면에서 단계를 넘겨도 보이도록 App 에서 화면 위에 덮어 그립니다.
 */
export function CelebrationOverlay() {
  const { state, dispatch, sound } = useGame();
  const next = state.celebrations[0];
  if (!next) return null;

  const dog = state.save.dogs[next.dogId];
  const text = MILESTONE_TEXT[next.milestone];
  if (!text) return null;

  const gift = next.milestone === MILESTONE_KISS ? outfitById(GIFT_OUTFITS[next.dogId]) : undefined;

  return (
    <div className="overlay" role="status">
      <div className="overlay__card celebrate">
        <p className="overlay__title">{text.title.replace('{name}', dog.name)}</p>

        <div className="celebrate__dog">
          <Dog
            breed={next.dogId}
            mood="happy"
            outfit={dog.outfit}
            tailWag={next.milestone >= MILESTONE_TAIL_WAG}
            crown={next.milestone >= MILESTONE_CROWN}
            sparkle
            size={150}
          />
          {next.milestone === MILESTONE_KISS && (
            <span className="celebrate__kiss" aria-hidden="true">
              💕
            </span>
          )}
        </div>

        <p className="celebrate__note">{text.note}</p>

        {gift && (
          <p className="celebrate__gift">
            <span aria-hidden="true">{OUTFIT_EMOJI[gift.id]}</span> {gift.label}
          </p>
        )}

        <p className="celebrate__bark">{BARKS.celebrate[0]}</p>

        <BigButton
          onClick={() => {
            sound('clap');
            dispatch({ type: 'DISMISS_CELEBRATION' });
          }}
          glow
        >
          🎉 좋아!
        </BigButton>
      </div>
    </div>
  );
}
