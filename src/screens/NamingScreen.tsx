import { useState } from 'react';

import { Dog, GiftBox } from '../assets';
import { BigButton } from '../components/BigButton';
import {
  DOG_ORDER,
  DOG_PROFILE,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  SUGGESTED_NAMES,
} from '../constants';
import { useGame } from '../state/GameContext';
import type { DogId } from '../types';

type Phase = 'box' | 'name' | 'greeting';

/** 글자 수 (이모지·한글 조합 안전) */
function charCount(value: string): number {
  return Array.from(value).length;
}

/** S1 — 이름 짓기: 선물 상자 → 짠 등장 → 이름 입력 */
export function NamingScreen({ onDone }: { onDone: () => void }) {
  const { dispatch, sound } = useGame();
  const [index, setIndex] = useState(0); // 0 = 닥스훈트, 1 = 푸들
  const [phase, setPhase] = useState<Phase>('box');
  const [draft, setDraft] = useState('');
  const [warning, setWarning] = useState('');
  const [names, setNames] = useState<Record<DogId, string>>({ dachshund: '', poodle: '' });

  const dogId = DOG_ORDER[index];
  const profile = DOG_PROFILE[dogId];

  function openBox() {
    sound('bark');
    setPhase('name');
  }

  function submit(rawName: string) {
    const name = rawName.trim();
    const length = charCount(name);

    if (length < NAME_MIN_LENGTH) {
      setWarning('이름을 적어줄까요? ✏️');
      return;
    }
    if (length > NAME_MAX_LENGTH) {
      setWarning(`${NAME_MAX_LENGTH}글자까지 쓸 수 있어요 ✏️`);
      return;
    }
    // 두 강아지 이름이 같으면 다시 물어봅니다.
    const other = DOG_ORDER[1 - index];
    if (names[other] && names[other] === name) {
      setWarning('다른 이름을 지어줄까요? 🐾');
      return;
    }

    const nextNames: Record<DogId, string> = { ...names };
    nextNames[dogId] = name;
    setNames(nextNames);
    setWarning('');
    setDraft('');
    sound('sparkle');

    if (index === 0) {
      setIndex(1);
      setPhase('box');
    } else {
      dispatch({ type: 'NAME_DOGS', names: nextNames });
      setPhase('greeting');
    }
  }

  if (phase === 'greeting') {
    return (
      <div className="screen screen--center naming">
        <h2 className="naming__title">
          {names.dachshund}, {names.poodle} 잘 부탁해! 🐾
        </h2>
        <div className="naming__pair">
          <Dog breed="dachshund" mood="happy" size={150} tailWag />
          <Dog breed="poodle" mood="happy" size={150} tailWag />
        </div>
        <BigButton onClick={onDone} glow>
          🌞 첫날 아침 시작
        </BigButton>
      </div>
    );
  }

  if (phase === 'box') {
    return (
      <div className="screen screen--center naming">
        <h2 className="naming__title">
          {index === 0 ? '선물 상자가 흔들려요! 🎁' : '상자가 하나 더 있어요! 🎁'}
        </h2>
        <p className="naming__hint">상자를 콕 눌러보세요</p>
        <div className="naming__boxes">
          <button
            type="button"
            className={index === 0 ? 'gift gift--active' : 'gift gift--quiet'}
            onClick={index === 0 ? openBox : undefined}
            disabled={index !== 0}
            aria-label="첫 번째 선물 상자 열기"
          >
            <GiftBox size={132} color="#9FC6F0" />
            <span className="gift__bark">{index === 0 ? '월월!' : '✅'}</span>
          </button>
          <button
            type="button"
            className={index === 1 ? 'gift gift--active' : 'gift gift--quiet'}
            onClick={index === 1 ? openBox : undefined}
            disabled={index !== 1}
            aria-label="두 번째 선물 상자 열기"
          >
            <GiftBox size={132} color="#F5A3BD" />
            {index === 1 && <span className="gift__bark">월월!</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--center naming">
      <h2 className="naming__title">
        짠! {profile.breedLabel} {profile.gender}예요 {profile.emoji}
      </h2>
      <div className="naming__reveal">
        <Dog breed={dogId} mood="happy" size={170} tailWag />
      </div>
      <p className="naming__hint">이름을 지어줄까요?</p>

      <div className="naming__suggestions">
        {SUGGESTED_NAMES[dogId].map((name) => (
          <button key={name} type="button" className="name-chip" onClick={() => submit(name)}>
            {name}
          </button>
        ))}
      </div>

      <form
        className="naming__form"
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
      >
        <input
          className="naming__input"
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setWarning('');
          }}
          placeholder="직접 쓰기"
          maxLength={NAME_MAX_LENGTH}
          inputMode="text"
          autoComplete="off"
          enterKeyHint="done"
          aria-label="강아지 이름 직접 쓰기"
        />
        <button type="submit" className="naming__submit">
          확인
        </button>
      </form>

      {warning && <p className="naming__warning">{warning}</p>}
    </div>
  );
}
