import { useState } from 'react';

import { Dog, OUTFIT_EMOJI, screenBg } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import {
  DOG_ORDER,
  DOG_PROFILE,
  MILESTONE_KISS,
  OUTFITS,
  SHOP_ENABLED,
  SLOT_LABEL,
} from '../constants';
import { useGame } from '../state/GameContext';
import type { DogId, OutfitSlot } from '../types';

const SLOTS: OutfitSlot[] = ['head', 'body', 'face'];

/** S3 — 옷 입히기. 갈아입기는 자유, 호감도 보상은 하루 첫 1회뿐입니다. */
export function DressScreen({ onBack, onShop }: { onBack: () => void; onShop: () => void }) {
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
    <div className="screen dress" style={screenBg('shop', 'quiet')}>
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
          // 옷가게가 열리기 전에는 살 수 없는 옷을 아예 보여주지 않습니다.
          // 자물쇠 7칸을 늘어놓는 건 아이에게 "나중에"를 일곱 번 약속하는 것과 같습니다.
          // 선물 옷(❤️80)은 지금도 받을 수 있으니 남겨둡니다.
          const items = OUTFITS.filter(
            (o) =>
              o.dog === tab && o.slot === slot && (SHOP_ENABLED || o.source !== 'shop'),
          );
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
                            : `${item.label} — 옷가게에서 뼈다귀 ${item.price}개`
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

      <footer className="dress__footer">
        {/* 옷가게는 3단계에서 열립니다. 열리기 전에는 버튼도 두지 않습니다 (SPEC 1번). */}
        {SHOP_ENABLED && (
          <button type="button" className="home__wardrobe" onClick={onShop}>
            🛍 옷가게 가기
          </button>
        )}
        {!bothDressed && <p className="dress__warning">두 강아지 모두 한 개씩 입혀줄까요?</p>}
        <BigButton onClick={finish} glow={bothDressed} disabled={!bothDressed}>
          ✅ 다 입혔어요
        </BigButton>
      </footer>
    </div>
  );
}
