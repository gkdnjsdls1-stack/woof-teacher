import { useState } from 'react';

import { Dog, DogHouse } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { BARKS, DOG_ORDER } from '../constants';
import {
  canUpgradeHouse,
  coinsToNextHouse,
  houseLevelName,
  houseUpgradeCost,
  nextHouseLevel,
} from '../state/economy';
import { useGame } from '../state/GameContext';
import type { DogId } from '../types';

/**
 * S12 — 집 업그레이드. 강아지마다 집이 따로 있습니다 (박스집 → 나무집 → 2층 집 → 성).
 * 비용과 가능 여부는 economy.ts 에서만 판단합니다.
 */
export function HouseScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const [celebrate, setCelebrate] = useState<DogId | null>(null);

  function upgrade(dogId: DogId) {
    if (!canUpgradeHouse(save, dogId)) return;
    sound('sparkle');
    dispatch({ type: 'UPGRADE_HOUSE', dogId });
    setCelebrate(dogId);
  }

  return (
    <div className="screen house">
      <TopBar title="강아지집 🏠" onBack={onBack} />

      <div className="house__list">
        {DOG_ORDER.map((id) => {
          const dog = save.dogs[id];
          const next = nextHouseLevel(save, id);
          const cost = houseUpgradeCost(save, id);
          const left = coinsToNextHouse(save, id);
          const can = canUpgradeHouse(save, id);
          return (
            <section className="house-card" key={id}>
              <DogHouse level={dog.houseLevel} size={96} />
              <p className="house-card__name">
                {dog.name}의 {houseLevelName(dog.houseLevel)}
              </p>
              {next === null || cost === null ? (
                <p className="house-card__max">제일 멋진 성이에요 👑</p>
              ) : (
                <>
                  <p className="house-card__next">
                    다음은 {houseLevelName(next)} · 🦴 {cost}
                  </p>
                  <BigButton
                    onClick={() => upgrade(id)}
                    glow={can}
                    disabled={!can}
                    variant="soft"
                  >
                    {can ? `🔨 ${houseLevelName(next)}으로` : `🦴 ${left}개 더 모아요`}
                  </BigButton>
                </>
              )}
            </section>
          );
        })}
      </div>

      <footer className="house__footer">
        <BigButton onClick={onBack}>🏠 집으로</BigButton>
      </footer>

      {/* 업그레이드 축하 — 반짝 + "월월월!" (SPEC 6-4) */}
      {celebrate && (
        <div className="overlay" role="status">
          <div className="overlay__card">
            <p className="overlay__title">
              {save.dogs[celebrate].name}의 {houseLevelName(save.dogs[celebrate].houseLevel)}!
            </p>
            <DogHouse level={save.dogs[celebrate].houseLevel} size={130} />
            <div className="overlay__dogs">
              <Dog
                breed={celebrate}
                mood="happy"
                outfit={save.dogs[celebrate].outfit}
                size={120}
                tailWag
                sparkle
              />
            </div>
            <p className="overlay__bark">{BARKS.celebrate[0]}</p>
            <BigButton
              onClick={() => {
                sound('bark');
                setCelebrate(null);
              }}
            >
              🐾 좋아!
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
