/**
 * reducer 자가 점검 (의존성 없음).
 *   npm test
 * 순수 함수라 화면 없이 확인할 수 있는 것만 봅니다:
 * 하루 1회 제한 · 코인 중복 지급 · 날짜 되돌림 · 아픔 발생 규칙.
 */
import assert from 'node:assert/strict';

import { createNewSave, gameReducer } from '../node_modules/.cache/woof-check/gameReducer.mjs';

const start = (today = '2026-01-01') => ({
  save: createNewSave(today),
  missedDays: 0,
  celebrations: [],
});

/* 하루 1회 제한 — 같은 보상을 두 번 줘도 호감도는 한 번만 오릅니다 */
{
  let state = start();
  const before = state.save.dogs.dachshund.hearts;
  state = gameReducer(state, { type: 'REWARD', action: 'feed' });
  const once = state.save.dogs.dachshund.hearts;
  state = gameReducer(state, { type: 'REWARD', action: 'feed' });
  assert.equal(state.save.dogs.dachshund.hearts, once, '밥 보상이 두 번 들어갔습니다');
  assert.ok(once > before);
}

/* 코인 — 같은 문제를 다시 맞혀도 더 주지 않습니다 */
{
  let state = start('2026-01-05'); // 월요일: 수업
  state = gameReducer(state, { type: 'SOLVE_QUESTION', index: 0 });
  const coins = state.save.coins;
  assert.ok(coins > 0);
  state = gameReducer(state, { type: 'SOLVE_QUESTION', index: 0 });
  assert.equal(state.save.coins, coins, '같은 문제에 코인이 두 번 들어갔습니다');
}

/* 날짜 되돌림 — 기기 날짜를 과거로 돌려도 새 하루가 되지 않습니다 */
{
  let state = start('2026-01-10');
  state = gameReducer(state, { type: 'REWARD', action: 'feed' });
  const back = gameReducer(state, { type: 'DAY_CHECK', today: '2026-01-09' });
  assert.equal(back.save.today.date, '2026-01-10', '과거 날짜로 새 하루가 생겼습니다');
  assert.equal(back.save.today.done.feed, true, '과거 날짜로 체크판이 초기화됐습니다');
}

/* 아픔 — 시작 후 유예 기간에는 아무도 아프지 않습니다 (SPEC 6-8) */
{
  let state = start('2026-02-01');
  for (const day of ['2026-02-02', '2026-02-03']) {
    state = gameReducer(state, { type: 'DAY_CHECK', today: day });
    const sick = Object.values(state.save.dogs).filter((dog) => dog.sickUntil);
    assert.equal(sick.length, 0, `${day}: 유예 기간에 아팠습니다`);
  }
}

/* 아픔 — 같은 강아지는 7일에 한 번보다 자주 아프지 않고, 다음 날 저절로 낫습니다 */
{
  let state = start('2026-03-01');
  let date = '2026-03-01';
  const sickDates = { dachshund: [], poodle: [] };
  for (let i = 1; i <= 120; i++) {
    date = new Date(Date.UTC(2026, 2, 1 + i)).toISOString().slice(0, 10);
    state = gameReducer(state, { type: 'DAY_CHECK', today: date });
    for (const id of ['dachshund', 'poodle']) {
      const dog = state.save.dogs[id];
      if (dog.sickUntil === date) sickDates[id].push(date);
      // 아픈 날이 아니면 표시가 남아 있으면 안 됩니다 (치료하지 않아도 낫습니다)
      assert.ok(!dog.sickUntil || dog.sickUntil === date, `${id}: 어제 아픔이 남았습니다`);
    }
  }
  for (const id of ['dachshund', 'poodle']) {
    const days = sickDates[id].map((d) => Math.round(Date.parse(d) / 86400000));
    for (let i = 1; i < days.length; i++) {
      assert.ok(days[i] - days[i - 1] >= 7, `${id}: 7일 안에 또 아팠습니다`);
    }
    assert.ok(sickDates[id].length > 0, `${id}: 120일 동안 한 번도 아프지 않았습니다 (확률 10%)`);
    assert.ok(sickDates[id].length < 30, `${id}: 너무 자주 아픕니다 (${sickDates[id].length}일)`);
  }
}

/* 아픔 — 병원에 다녀오면 낫고, 하루 1회 제한도 그대로입니다 */
{
  let state = start('2026-04-01');
  state.save.dogs.dachshund.sickUntil = state.save.today.date;
  state = gameReducer(state, { type: 'REWARD', action: 'hospital' });
  assert.equal(state.save.dogs.dachshund.sickUntil, undefined, '치료했는데 낫지 않았습니다');
  assert.equal(state.save.today.done.hospital, true);
  const hearts = state.save.dogs.dachshund.hearts;
  state = gameReducer(state, { type: 'REWARD', action: 'hospital' });
  assert.equal(state.save.dogs.dachshund.hearts, hearts, '병원 보상이 두 번 들어갔습니다');
}

/* 플레이 시간 — 오늘 칸에 쌓입니다 */
{
  let state = start('2026-05-01');
  state = gameReducer(state, { type: 'ADD_PLAYTIME', seconds: 30 });
  state = gameReducer(state, { type: 'ADD_PLAYTIME', seconds: 30 });
  assert.equal(state.save.playtimeLog['2026-05-01'], 60);
}

console.log('✅ reducer 점검 통과');
