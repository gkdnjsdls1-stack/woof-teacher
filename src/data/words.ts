/**
 * 화요일 "한글 낱말" 수업과 수요일 "짝 맞추기" 수업에 쓰는 그림-낱말 쌍.
 *
 * 규칙
 * - 1학년이 읽고 쓸 수 있는 **2~3글자** 낱말만 씁니다 (SPEC 7번).
 * - 그림은 이모지 하나로 또렷하게 보이는 것만 골랐습니다.
 * - 오답 보기는 **같은 글자 수**의 다른 낱말에서 고릅니다 (src/lib/lessons.ts).
 * - 낱말을 더 넣고 싶으면 이 배열에만 추가하면 됩니다.
 */

export interface WordCard {
  /** 고유 id (짝 맞추기 카드 구분용) */
  id: string;
  /** 그림 */
  emoji: string;
  /** 정답 낱말 */
  word: string;
}

export const WORD_CARDS: WordCard[] = [
  // 과일·먹을 것
  { id: 'apple', emoji: '🍎', word: '사과' },
  { id: 'strawberry', emoji: '🍓', word: '딸기' },
  { id: 'grape', emoji: '🍇', word: '포도' },
  { id: 'watermelon', emoji: '🍉', word: '수박' },
  { id: 'banana', emoji: '🍌', word: '바나나' },
  { id: 'corn', emoji: '🌽', word: '옥수수' },
  { id: 'carrot', emoji: '🥕', word: '당근' },
  { id: 'milk', emoji: '🥛', word: '우유' },
  { id: 'cheese', emoji: '🧀', word: '치즈' },
  { id: 'cookie', emoji: '🍪', word: '과자' },
  { id: 'cake', emoji: '🍰', word: '케이크' },
  { id: 'egg', emoji: '🥚', word: '달걀' },

  // 동물
  { id: 'rabbit', emoji: '🐰', word: '토끼' },
  { id: 'lion', emoji: '🦁', word: '사자' },
  { id: 'pig', emoji: '🐷', word: '돼지' },
  { id: 'penguin', emoji: '🐧', word: '펭귄' },
  { id: 'butterfly', emoji: '🦋', word: '나비' },
  { id: 'tiger', emoji: '🐯', word: '호랑이' },
  { id: 'elephant', emoji: '🐘', word: '코끼리' },
  { id: 'frog', emoji: '🐸', word: '개구리' },
  { id: 'fish', emoji: '🐟', word: '물고기' },
  { id: 'turtle', emoji: '🐢', word: '거북이' },
  { id: 'dog', emoji: '🐶', word: '강아지' },
  { id: 'cat', emoji: '🐱', word: '고양이' },

  // 자연
  { id: 'cloud', emoji: '☁️', word: '구름' },
  { id: 'rainbow', emoji: '🌈', word: '무지개' },
  { id: 'tulip', emoji: '🌷', word: '튤립' },

  // 물건
  { id: 'umbrella', emoji: '☂️', word: '우산' },
  { id: 'hat', emoji: '🧢', word: '모자' },
  { id: 'bag', emoji: '🎒', word: '가방' },
  { id: 'clock', emoji: '⏰', word: '시계' },
  { id: 'pencil', emoji: '✏️', word: '연필' },
  { id: 'scissors', emoji: '✂️', word: '가위' },
  { id: 'balloon', emoji: '🎈', word: '풍선' },
  { id: 'gift', emoji: '🎁', word: '선물' },
  { id: 'socks', emoji: '🧦', word: '양말' },
  { id: 'gloves', emoji: '🧤', word: '장갑' },
  { id: 'piano', emoji: '🎹', word: '피아노' },
  { id: 'sneakers', emoji: '👟', word: '운동화' },

  // 타는 것
  { id: 'bus', emoji: '🚌', word: '버스' },
  { id: 'train', emoji: '🚂', word: '기차' },
  { id: 'car', emoji: '🚗', word: '자동차' },
  { id: 'bike', emoji: '🚲', word: '자전거' },
  { id: 'plane', emoji: '✈️', word: '비행기' },
];
