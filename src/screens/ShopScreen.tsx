import { useState } from 'react';

import { Dog, OUTFIT_EMOJI } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { BARKS, DOG_ORDER, DOG_PROFILE, SLOT_LABEL } from '../constants';
import { canBuyOutfit, isOwned, shopOutfits, todayShopOutfit } from '../state/economy';
import { useGame } from '../state/GameContext';
import type { DogId } from '../types';

/**
 * S4 — 옷가게. 코인으로 옷을 삽니다 (입히기는 S3 옷 입히기에서).
 * 살 수 있는지는 economy.ts 의 `canBuyOutfit` 한 곳에서만 판단합니다 —
 * 버튼이 켜졌는데 실제로는 안 되는 일이 생기지 않게.
 */
export function ShopScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [tab, setTab] = useState<DogId>('dachshund');
  const [bought, setBought] = useState<string | null>(null);
  const todayItem = todayShopOutfit(save);

  function buy(outfitId: string) {
    if (!canBuyOutfit(save, tab, outfitId)) return;
    sound('sparkle');
    dispatch({ type: 'BUY_OUTFIT', dogId: tab, outfitId });
    setBought(outfitId);
  }

  const items = shopOutfits(tab);

  return (
    <div className="screen shop">
      <TopBar title="옷가게 🛍" onBack={onBack} />

      {todayItem && (
        <section className="shop__today">
          <span className="shop__today-tag">오늘의 새 옷</span>
          <span className="shop__today-emoji" aria-hidden="true">
            {OUTFIT_EMOJI[todayItem.id]}
          </span>
          <span className="shop__today-label">
            {save.dogs[todayItem.dog].name}의 {todayItem.label}
          </span>
        </section>
      )}

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

      <div className="shop__items">
        {items.map((item) => {
          const owned = isOwned(save, tab, item.id);
          const canBuy = canBuyOutfit(save, tab, item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={['item', owned ? 'item--on' : '', canBuy ? 'item--buy' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => buy(item.id)}
              disabled={!canBuy}
              aria-label={
                owned
                  ? `${item.label} — 이미 있어요`
                  : canBuy
                    ? `${item.label} 사기 — 뼈다귀 ${item.price}개`
                    : `${item.label} — 뼈다귀 ${item.price}개가 필요해요`
              }
            >
              <span className="item__emoji" aria-hidden="true">
                {OUTFIT_EMOJI[item.id]}
              </span>
              <span className="item__label">
                {SLOT_LABEL[item.slot]} · {item.label}
              </span>
              <span className="item__price">{owned ? '있어요 ✅' : `🦴 ${item.price}`}</span>
            </button>
          );
        })}
      </div>

      <footer className="shop__footer">
        <p className="shop__hint">
          {bought ? `${BARKS.celebrate[0]} 새 옷이 생겼어요 🎁` : '뼈다귀로 옷을 살 수 있어요'}
        </p>
        <BigButton onClick={onBack} glow={bought !== null}>
          👕 옷 입히러 가기
        </BigButton>
      </footer>

      <div className="shop__dog" aria-hidden="true">
        <Dog breed={tab} mood="happy" outfit={save.dogs[tab].outfit} size={110} tailWag />
      </div>
    </div>
  );
}
