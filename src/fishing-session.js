const DEFAULT_REST_AFTER = 10;

function validLimit(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function restIfFull(state) {
  if (!state.settings.paused && state.sessionCatches >= state.settings.restAfter) {
    state.settings.paused = true;
    state.restReason = 'limit';
  }
}

function restoreSession(state) {
  if (!validLimit(state.settings.restAfter)) state.settings.restAfter = DEFAULT_REST_AFTER;
  if (!Number.isSafeInteger(state.sessionCatches) || state.sessionCatches < 0) state.sessionCatches = 0;
  if (!state.settings.paused || state.restReason !== 'limit') state.restReason = null;
  restIfFull(state);
}

function recordCatch(state) {
  state.sessionCatches++;
  restIfFull(state);
}

function updateSettings(state, incoming) {
  const restAfter = incoming.restAfter ?? state.settings.restAfter;
  if (!validLimit(restAfter)) throw Error('自动休息条数须为大于 0 的整数');
  const resumed = state.settings.paused && !incoming.paused;
  if (resumed) {
    state.sessionCatches = 0;
    state.restReason = null;
  }
  state.settings = { min: incoming.min, max: incoming.max, top: !!incoming.top, paused: !!incoming.paused, restAfter };
  restIfFull(state);
  return resumed;
}

module.exports = { DEFAULT_REST_AFTER, restoreSession, recordCatch, updateSettings };
