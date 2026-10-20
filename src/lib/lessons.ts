/**
 * 요일별 수업 문제 생성 (2단계 밑작업).
 *
 * - **순수 함수**입니다. React 나 저장과 전혀 얽혀 있지 않아 화면이 없어도 돌아갑니다.
 * - 같은 `seed` 를 주면 **항상 같은 문제**가 나옵니다. `DayState.lesson.seed` 가 날짜에서
 *   만들어지므로, 하루 안에서는 새로고침해도 문제가 고정됩니다 (SPEC 7번).
 * - 수치는 전부 `src/constants.ts` 에 있습니다.
 *
 * 쓰는 법 (2단계에서 교실 화면을 만들 때)
 * ```ts
 * const lesson = buildLesson(save.today.lesson.type, save.today.lesson.seed);
 * ```
 * 정답 처리는 `DayState.lesson.solved[i]` 가 false 일 때만 코인을 주면 됩니다.
 */

import {
  CHOICES_PER_QUESTION,
  CLOCK_HOUR_MAX,
  CLOCK_HOUR_MIN,
  COUNTING_EMOJIS,
  COUNTING_MAX,
  COUNTING_MIN,
  LESSON_QUESTIONS_PER_DAY,
  MATH_OPERAND_MAX,
  MATH_OPERAND_MIN,
  MATH_RESULT_MAX,
  MATH_RESULT_MIN,
  MEMORY_PAIRS,
} from '../constants';
import { WORD_CARDS, type WordCard } from '../data/words';
import { makeRng } from './random';

/* ───────────────────────── 문제 타입 ───────────────────────── */

export interface CountingQuestion {
  kind: 'counting';
  prompt: string;
  /** 화면에 이 그림을 `count` 개 그립니다 */
  emoji: string;
  count: number;
  choices: number[];
  answer: number;
}

export interface WordQuestion {
  kind: 'words';
  prompt: string;
  emoji: string;
  choices: string[];
  answer: string;
}

export interface MathQuestion {
  kind: 'math';
  prompt: string;
  a: number;
  b: number;
  op: '+' | '-';
  choices: number[];
  answer: number;
}

export interface ClockQuestion {
  kind: 'clock';
  prompt: string;
  /** 정답 시계가 가리키는 시각 (정각) */
  hour: number;
  /** 보기 3개에 그릴 시계들 */
  choices: number[];
  answer: number;
}

export type Question = CountingQuestion | WordQuestion | MathQuestion | ClockQuestion;

/** 짝 맞추기 카드 한 장 */
export interface MemoryCard {
  /** 카드 한 장의 고유 id */
  cardId: string;
  /** 같은 `pairId` 를 가진 두 장이 짝입니다 */
  pairId: string;
  emoji: string;
  word: string;
}

export interface QuizLesson {
  type: 'counting' | 'words' | 'math' | 'clock';
  questions: Question[];
}

export interface MemoryLesson {
  type: 'memory';
  prompt: string;
  cards: MemoryCard[];
  /** 맞춰야 하는 쌍 수 = 완료해야 하는 문제 수 */
  pairCount: number;
}

/** 주말에는 수업이 없습니다 (오픈카 소풍으로 대체) */
export interface PicnicLesson {
  type: 'picnic';
}

export type Lesson = QuizLesson | MemoryLesson | PicnicLesson;

/* ───────────────────────── 도우미 ───────────────────────── */

/** min~max 사이 정수 (양끝 포함) */
function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** 결정적 섞기 (Fisher-Yates) */
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistinct<T>(items: readonly T[], count: number, rng: () => number): T[] {
  return shuffle(items, rng).slice(0, Math.min(count, items.length));
}

/** 정답 1개 + 범위 안의 다른 수 2개를 섞어 보기를 만듭니다 */
function numberChoices(answer: number, min: number, max: number, rng: () => number): number[] {
  const picked = new Set<number>([answer]);
  const span = max - min + 1;
  // 범위가 좁아도 무한 반복에 빠지지 않게 횟수를 제한합니다.
  let guard = span * 4;
  while (picked.size < Math.min(CHOICES_PER_QUESTION, span) && guard-- > 0) {
    picked.add(randInt(rng, min, max));
  }
  return shuffle([...picked], rng);
}

/** 같은 글자 수의 다른 낱말에서 오답을 고릅니다 */
function wordChoices(card: WordCard, rng: () => number): string[] {
  const sameLength = WORD_CARDS.filter(
    (other) => other.id !== card.id && other.word.length === card.word.length,
  );
  const pool = sameLength.length >= CHOICES_PER_QUESTION - 1
    ? sameLength
    : WORD_CARDS.filter((other) => other.id !== card.id);
  const wrong = pickDistinct(pool, CHOICES_PER_QUESTION - 1, rng).map((other) => other.word);
  return shuffle([card.word, ...wrong], rng);
}

/* ───────────────────────── 생성 ───────────────────────── */

function buildCounting(rng: () => number): CountingQuestion[] {
  return Array.from({ length: LESSON_QUESTIONS_PER_DAY }, () => {
    const emoji = COUNTING_EMOJIS[randInt(rng, 0, COUNTING_EMOJIS.length - 1)];
    const count = randInt(rng, COUNTING_MIN, COUNTING_MAX);
    return {
      kind: 'counting' as const,
      prompt: `${emoji} 가 몇 개일까요?`,
      emoji,
      count,
      choices: numberChoices(count, COUNTING_MIN, COUNTING_MAX, rng),
      answer: count,
    };
  });
}

function buildWords(rng: () => number): WordQuestion[] {
  const cards = pickDistinct(WORD_CARDS, LESSON_QUESTIONS_PER_DAY, rng);
  return cards.map((card) => ({
    kind: 'words' as const,
    prompt: '이 그림은 무엇일까요?',
    emoji: card.emoji,
    choices: wordChoices(card, rng),
    answer: card.word,
  }));
}

function buildMath(rng: () => number): MathQuestion[] {
  return Array.from({ length: LESSON_QUESTIONS_PER_DAY }, () => {
    const plus = rng() < 0.5;
    let a: number;
    let b: number;
    if (plus) {
      // 결과가 10을 넘지 않게 a 를 먼저 고르고 b 범위를 줄입니다.
      a = randInt(rng, MATH_OPERAND_MIN, Math.min(MATH_OPERAND_MAX, MATH_RESULT_MAX - 1));
      b = randInt(rng, MATH_OPERAND_MIN, Math.min(MATH_OPERAND_MAX, MATH_RESULT_MAX - a));
    } else {
      // 결과가 0 미만이 되지 않게 b <= a 로 뽑습니다.
      a = randInt(rng, MATH_OPERAND_MIN + 1, MATH_OPERAND_MAX);
      b = randInt(rng, MATH_OPERAND_MIN, a);
    }
    const answer = plus ? a + b : a - b;
    return {
      kind: 'math' as const,
      prompt: `${a} ${plus ? '+' : '-'} ${b} = ?`,
      a,
      b,
      op: plus ? ('+' as const) : ('-' as const),
      choices: numberChoices(answer, MATH_RESULT_MIN, MATH_RESULT_MAX, rng),
      answer,
    };
  });
}

function buildClock(rng: () => number): ClockQuestion[] {
  return Array.from({ length: LESSON_QUESTIONS_PER_DAY }, () => {
    const hour = randInt(rng, CLOCK_HOUR_MIN, CLOCK_HOUR_MAX);
    return {
      kind: 'clock' as const,
      prompt: `"${hour}시"는 어느 시계일까요?`,
      hour,
      choices: numberChoices(hour, CLOCK_HOUR_MIN, CLOCK_HOUR_MAX, rng),
      answer: hour,
    };
  });
}

function buildMemory(rng: () => number): MemoryLesson {
  const pairs = pickDistinct(WORD_CARDS, MEMORY_PAIRS, rng);
  const cards: MemoryCard[] = pairs.flatMap((card) => [
    { cardId: `${card.id}-a`, pairId: card.id, emoji: card.emoji, word: card.word },
    { cardId: `${card.id}-b`, pairId: card.id, emoji: card.emoji, word: card.word },
  ]);
  return {
    type: 'memory',
    prompt: '같은 그림을 찾아주세요',
    cards: shuffle(cards, rng),
    pairCount: pairs.length,
  };
}

/**
 * 수업 하나를 만듭니다.
 * @param type `DayState.lesson.type` (요일에서 정해짐)
 * @param seed `DayState.lesson.seed` (날짜에서 정해짐)
 */
export function buildLesson(type: string, seed: number): Lesson {
  const rng = makeRng(seed);
  switch (type) {
    case 'counting':
      return { type: 'counting', questions: buildCounting(rng) };
    case 'words':
      return { type: 'words', questions: buildWords(rng) };
    case 'math':
      return { type: 'math', questions: buildMath(rng) };
    case 'clock':
      return { type: 'clock', questions: buildClock(rng) };
    case 'memory':
      return buildMemory(rng);
    default:
      // 주말(picnic) 과 알 수 없는 값은 수업 없음으로 둡니다.
      return { type: 'picnic' };
  }
}

/** 이 수업에서 완료해야 하는 문제 수 (코인 지급 칸 수) */
export function lessonStepCount(lesson: Lesson): number {
  if (lesson.type === 'picnic') return 0;
  if (lesson.type === 'memory') return lesson.pairCount;
  return lesson.questions.length;
}
