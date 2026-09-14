const { test } = require('node:test');
const assert = require('node:assert/strict');
const Session = require('../src/fishing-session');

function fresh() {
  const state = { catches: Array(100).fill({}), settings: { min: 5, max: 20, top: true, paused: false } };
  Session.restoreSession(state);
  return state;
}

test('legacy collections start a new ten-fish round without counting past catches', () => {
  const state = fresh();
  assert.equal(state.settings.restAfter, 10);
  assert.equal(state.sessionCatches, 0);
  for (let i = 0; i < 9; i++) Session.recordCatch(state);
  assert.equal(state.settings.paused, false);
  Session.recordCatch(state);
  assert.equal(state.settings.paused, true);
  assert.equal(state.restReason, 'limit');
});

test('round progress and automatic rest survive a save/reload', () => {
  let state = fresh();
  for (let i = 0; i < 7; i++) Session.recordCatch(state);
  state = JSON.parse(JSON.stringify(state));
  Session.restoreSession(state);
  assert.equal(state.sessionCatches, 7);
  for (let i = 0; i < 3; i++) Session.recordCatch(state);
  state = JSON.parse(JSON.stringify(state));
  Session.restoreSession(state);
  assert.equal(state.settings.paused, true);
  assert.equal(state.restReason, 'limit');
});

test('resume starts a new round with the chosen limit; unrelated settings keep progress', () => {
  const state = fresh();
  Session.recordCatch(state);
  Session.updateSettings(state, { ...state.settings, top: false });
  assert.equal(state.sessionCatches, 1);
  Session.updateSettings(state, { ...state.settings, paused: true });
  assert.equal(state.restReason, null);
  Session.updateSettings(state, { ...state.settings, paused: false, restAfter: 2 });
  assert.equal(state.sessionCatches, 0);
  Session.recordCatch(state);
  assert.equal(state.settings.paused, false);
  Session.recordCatch(state);
  assert.equal(state.settings.paused, true);
  Session.updateSettings(state, { ...state.settings, paused: false });
  assert.equal(state.sessionCatches, 0);
  assert.equal(state.restReason, null);
});

test('lowering the limit below the current round immediately rests; increasing it keeps rest until resumed', () => {
  const state = fresh();
  for (let i = 0; i < 4; i++) Session.recordCatch(state);
  Session.updateSettings(state, { ...state.settings, restAfter: 3 });
  assert.equal(state.settings.paused, true);
  Session.updateSettings(state, { ...state.settings, restAfter: 20 });
  assert.equal(state.settings.paused, true);
  assert.equal(state.sessionCatches, 4);
});

test('invalid limits cannot mutate a round or its settings', () => {
  const state = fresh();
  for (const restAfter of [0, -1, 1.5, NaN, Infinity, '10', Number.MAX_SAFE_INTEGER + 1]) {
    const before = JSON.stringify(state);
    assert.throws(() => Session.updateSettings(state, { ...state.settings, restAfter }));
    assert.equal(JSON.stringify(state), before);
  }
});
