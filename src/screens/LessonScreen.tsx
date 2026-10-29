import { useEffect, useMemo, useRef, useState } from 'react';

import { ClockFace, Dog, Student } from '../assets';
import { BigButton } from '../components/BigButton';
import { TopBar } from '../components/TopBar';
import { BARKS, LESSON_LABEL, PICNIC_TAPS, STUDENT_COUNT, TIMING } from '../constants';
import { buildLesson, lessonStepCount, type Lesson, type Question } from '../lib/lessons';
import { lessonCoinsEarned } from '../state/economy';
import { useGame } from '../state/GameContext';

/* ───────────────────────── 교실 뒤편 ───────────────────────── */

/** 학생들 + 입마개를 한 강아지 두 마리 (SPEC 6-9) */
function Classroom({ clap, board }: { clap: boolean; board: string }) {
  return (
    <div className="classroom">
      <div className="classroom__board">{board}</div>
      <div className={clap ? 'classroom__students classroom__students--clap' : 'classroom__students'}>
        {Array.from({ length: STUDENT_COUNT }, (_, i) => (
          <Student key={i} variant={i} size={46} />
        ))}
      </div>
      <div className="classroom__dogs">
        <Dog breed="dachshund" mood="happy" muzzle size={70} tailWag={clap} />
        <Dog breed="poodle" mood="happy" muzzle size={70} tailWag={clap} />
      </div>
    </div>
  );
}

/* ───────────────────────── 문제 한 개 그리기 ─────────────────────────
 * 문제 **생성**은 src/lib/lessons.ts 가 이미 합니다.
 * 여기서는 종류별로 **그리기만** 합니다.
 */

function QuestionBody({ question }: { question: Question }) {
  switch (question.kind) {
    case 'counting':
      return (
        <div className="q-count" aria-label={`${question.emoji} ${question.count}개`}>
          {Array.from({ length: question.count }, (_, i) => (
            <span key={i} className="q-count__item">
              {question.emoji}
            </span>
          ))}
        </div>
      );
    case 'words':
      return <div className="q-word">{question.emoji}</div>;
    case 'math':
      return (
        <div className="q-math">
          {question.a} {question.op} {question.b} = ?
        </div>
      );
    case 'clock':
      // 시계 문제는 지시문에 이미 "○시"가 들어 있고, 보기 자체가 시계 그림입니다.
      return null;
  }
}

function ChoiceButton({
  question,
  choice,
  onPick,
  disabled,
}: {
  question: Question;
  choice: string | number;
  onPick: () => void;
  disabled: boolean;
}) {
  return (
    <button type="button" className="choice" onClick={onPick} disabled={disabled}>
      {question.kind === 'clock' ? (
        <ClockFace hour={Number(choice)} size={84} />
      ) : (
        <span className="choice__text">{choice}</span>
      )}
    </button>
  );
}

/* ───────────────────────── 보기 3개 수업 ───────────────────────── */

function QuizView({
  questions,
  onSolved,
  onFinish,
  solved,
}: {
  questions: Question[];
  solved: boolean[];
  onSolved: (index: number) => void;
  onFinish: () => void;
}) {
  const { sound } = useGame();
  // 새로고침해도 이미 맞힌 문제는 건너뜁니다.
  const [index, setIndex] = useState(() => {
    const first = questions.findIndex((_, i) => !solved[i]);
    return first === -1 ? questions.length : first;
  });
  const [mark, setMark] = useState<'right' | 'wrong' | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (index >= questions.length) onFinish();
  }, [index, questions.length, onFinish]);

  const question = questions[index];
  if (!question) return null;

  function pick(choice: string | number) {
    if (mark) return;
    if (choice === question.answer) {
      sound('clap');
      setMark('right');
      onSolved(index);
      timers.current.push(
        window.setTimeout(() => {
          setMark(null);
          setIndex((i) => i + 1);
        }, TIMING.clap),
      );
    } else {
      sound('bark');
      setMark('wrong');
      timers.current.push(window.setTimeout(() => setMark(null), TIMING.retry));
    }
  }

  return (
    <>
      <Classroom clap={mark === 'right'} board={`${index + 1} / ${questions.length}`} />
      {/* 덧셈·뺄셈은 지시문이 곧 문제라서 큰 식 하나만 보여줍니다 */}
      {question.kind !== 'math' && <h2 className="lesson__prompt">{question.prompt}</h2>}
      <QuestionBody question={question} />

      <div className={question.kind === 'clock' ? 'choices choices--wide' : 'choices'}>
        {question.choices.map((choice) => (
          <ChoiceButton
            key={String(choice)}
            question={question}
            choice={choice}
            onPick={() => pick(choice)}
            disabled={mark !== null}
          />
        ))}
      </div>

      {mark === 'right' && <p className="lesson__mark lesson__mark--right">짝짝짝! 👏 {BARKS.celebrate[0]}</p>}
      {mark === 'wrong' && <p className="lesson__mark lesson__mark--wrong">다시 해볼까? 🐾</p>}
    </>
  );
}

/* ───────────────────────── 짝 맞추기 ───────────────────────── */

function MemoryView({
  lesson,
  onSolved,
  onFinish,
}: {
  lesson: Extract<Lesson, { type: 'memory' }>;
  onSolved: (index: number) => void;
  onFinish: () => void;
}) {
  const { sound } = useGame();
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (matched.length >= lesson.pairCount) onFinish();
  }, [matched.length, lesson.pairCount, onFinish]);

  function flip(cardId: string, pairId: string) {
    if (open.length >= 2 || open.includes(cardId) || matched.includes(pairId)) return;
    const next = [...open, cardId];
    setOpen(next);
    if (next.length < 2) return;

    const firstPair = lesson.cards.find((c) => c.cardId === next[0])?.pairId;
    if (firstPair === pairId) {
      sound('clap');
      onSolved(matched.length);
      setMatched((prev) => [...prev, pairId]);
      timers.current.push(window.setTimeout(() => setOpen([]), TIMING.clap));
    } else {
      sound('bark');
      timers.current.push(window.setTimeout(() => setOpen([]), TIMING.retry));
    }
  }

  return (
    <>
      <Classroom
        clap={open.length === 2 && matched.length > 0}
        board={`${matched.length} / ${lesson.pairCount}`}
      />
      <h2 className="lesson__prompt">{lesson.prompt}</h2>

      <div className="cards">
        {lesson.cards.map((card) => {
          const shown = open.includes(card.cardId) || matched.includes(card.pairId);
          return (
            <button
              key={card.cardId}
              type="button"
              className={shown ? 'card card--open' : 'card'}
              onClick={() => flip(card.cardId, card.pairId)}
              aria-label={shown ? card.word : '뒤집힌 카드'}
            >
              {shown ? card.emoji : '🐾'}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ───────────────────────── 주말 소풍 ───────────────────────── */

function PicnicView({ onSolved, onFinish }: { onSolved: (index: number) => void; onFinish: () => void }) {
  const { sound } = useGame();
  const [tapped, setTapped] = useState<number[]>([]);
  const [bark, setBark] = useState<string | null>(null);
  const allTapped = tapped.length >= PICNIC_TAPS.length;

  function tap(index: number, line: string) {
    sound('bark');
    setBark(line);
    if (!tapped.includes(index)) setTapped((prev) => [...prev, index]);
  }

  return (
    <>
      <div className="park">
        <div className="park__dogs">
          <Dog breed="dachshund" mood="happy" leash size={110} tailWag />
          <Dog breed="poodle" mood="happy" leash size={110} tailWag />
        </div>
        {bark && <p className="park__bark">{bark}</p>}
      </div>

      <h2 className="lesson__prompt">공원을 구경해요</h2>
      <div className="park__taps">
        {PICNIC_TAPS.map((item, i) => (
          <button
            key={item.emoji}
            type="button"
            className={tapped.includes(i) ? 'park__tap park__tap--done' : 'park__tap'}
            onClick={() => tap(i, item.bark)}
            aria-label={`${item.emoji} 보기`}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      <footer className="lesson__footer">
        <BigButton
          onClick={() => {
            sound('sparkle');
            onSolved(0);
            onFinish();
          }}
          glow={allTapped}
          disabled={!allTapped}
        >
          {allTapped ? '🧺 피크닉 먹기' : '🌸 꽃·나비·공을 눌러요'}
        </BigButton>
      </footer>
    </>
  );
}

/* ───────────────────────── S7 — 교실 / 소풍 ───────────────────────── */

export function LessonScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, sound } = useGame();
  const save = state.save;
  const { type, seed, solved } = save.today.lesson;

  // 같은 날에는 같은 문제가 나옵니다 (시드가 날짜에서 만들어집니다).
  const lesson = useMemo(() => buildLesson(type, seed), [type, seed]);
  const [finished, setFinished] = useState(() => save.today.done.lesson);

  function finish() {
    if (finished) return;
    sound('sparkle');
    dispatch({ type: 'REWARD', action: 'lesson' });
    setFinished(true);
  }

  const solve = (index: number) => dispatch({ type: 'SOLVE_QUESTION', index });
  const title = LESSON_LABEL[type] ?? '수업';

  if (finished) {
    return (
      <div className="screen lesson lesson--done">
        <TopBar title={title} />
        <h2 className="lesson__prompt">
          {type === 'picnic' ? '소풍 끝! 🧺' : '수업 끝! 🎒'}
        </h2>
        <div className="lesson__dogs">
          <Dog breed="dachshund" mood="happy" size={140} tailWag sparkle />
          <Dog breed="poodle" mood="happy" size={140} tailWag sparkle />
        </div>
        {/* 하루 중 가장 큰 보상 순간이라 평범한 문장 대신 눈에 띄는 뱃지로 보여줍니다. */}
        <p className="lesson__earned">
          <span className="lesson__earned-coin" aria-hidden="true">
            🦴
          </span>
          코인 {lessonCoinsEarned(save)}개를 받았어요!
        </p>
        <p className="lesson__bark">{BARKS.celebrate[0]}</p>
        <footer className="lesson__footer">
          <BigButton onClick={onBack} glow>
            🏠 집으로
          </BigButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="screen lesson">
      <TopBar title={title} onBack={onBack} />
      {lesson.type === 'picnic' ? (
        <PicnicView onSolved={solve} onFinish={finish} />
      ) : lesson.type === 'memory' ? (
        <MemoryView lesson={lesson} onSolved={solve} onFinish={finish} />
      ) : (
        <QuizView
          questions={lesson.questions}
          solved={solved.slice(0, lessonStepCount(lesson))}
          onSolved={solve}
          onFinish={finish}
        />
      )}
    </div>
  );
}
