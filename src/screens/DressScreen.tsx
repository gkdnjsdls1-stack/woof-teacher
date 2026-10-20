import { useState } from 'react';

import { Dog, OUTFIT_EMOJI } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { DOG_ORDER, DOG_PROFILE, MILESTONE_KISS, OUTFITS, SLOT_LABEL } from '../constants';
import { useGame } from '../state/GameContext';
import type { DogId, OutfitSlot } from '../types';

const SLOTS: OutfitSlot[] = ['head', 'body', 'face'];

/** S3 — 옷 입히기. 갈아입기는 자유, 호감도 보상은 하루 첫 1회뿐입니다. */
export function DressScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [tab, setTab] = useState<DogId>('dachshund');
  const dog = save.dogs[tab];

  const bothDressed = DOG_ORDER.every(
    (id) => Object.values(save.dogs[id].outfit).filter(Boolean).length > 0,
  );

  function equip(slot: OutfitSlot, outfitId: string | null) {
    sound('sparkle');
    dispatch({ type: 'EQUIP', dogId: tab, slot, outfitId });
  }

  function finish() {
    // 이미 보상을 받은 날이면 reducer 가 아무 것도 하지 않습니다.
    dispatch({ type: 'REWARD', action: 'dress' });
    sound('bark');
    onBack();
  }

  return (
    <div className="screen dress">
      <TopBar title="옷 입히기 👕" onBack={onBack} />

      <div className="tabs" role="tablist" aria-label="강아지 고르기">
        {DOG_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'tab tab--on' : 'tab'}
            onClick={() => setTab(id)}
          >
            {DOG_PROFILE[id].emoji} {save.dogs[id].name}
          </button>
        ))}
      </div>

      <div className="dress__preview">
        <Dog breed={tab} mood="happy" outfit={dog.outfit} size={170} tailWag />
        <p className="dress__style">{DOG_PROFILE[tab].styleLabel}</p>
      </div>

      <div className="dress__slots">
        {SLOTS.map((slot) => {
          const items = OUTFITS.filter((o) => o.dog === tab && o.slot === slot);
          if (items.length === 0) return null;
          return (
            <section key={slot} className="slot">
              <h3 className="slot__title">{SLOT_LABEL[slot]}</h3>
              <div className="slot__items">
                <button
                  type="button"
                  className={dog.outfit[slot] ? 'item' : 'item item--on'}
                  onClick={() => equip(slot, null)}
                >
                  <span className="item__emoji" aria-hidden="true">
                    🚫
                  </span>
                  <span className="item__label">안 해요</span>
                </button>
                {items.map((item) => {
                  const owned = dog.ownedOutfits.includes(item.id);
                  const on = dog.outfit[slot] === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={['item', on ? 'item--on' : '', owned ? '' : 'item--locked']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => owned && equip(slot, item.id)}
                      disabled={!owned}
                      aria-label={
                        owned
                          ? item.label
                          : item.source === 'gift'
                            ? `${item.label} — 하트 ${MILESTONE_KISS}이 되면 선물로 받아요`
                            : `${item.label} — 아직 없어요. 옷가게는 나중에 열려요`
                      }
                    >
                      <span className="item__emoji" aria-hidden="true">
                        {owned ? OUTFIT_EMOJI[item.id] : '🔒'}
                      </span>
                      <span className="item__label">{item.label}</span>
                      {!owned && (
                        <span className="item__price">
                          {item.source === 'gift' ? `❤️ ${MILESTONE_KISS}` : `🦴 ${item.price}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="dress__hint">옷가게는 다음 단계에서 열려요 🏪</p>

      <footer className="dress__footer">
        {!bothDressed && <p className="dress__warning">두 강아지 모두 한 개씩 입혀줄까요?</p>}
        <BigButton onClick={finish} glow={bothDressed} disabled={!bothDressed}>
          ✅ 다 입혔어요
        </BigButton>
      </footer>
    </div>
  );
}
