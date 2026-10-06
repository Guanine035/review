const KEYS = {
  progress: 'mth2168.progress.v1',
  wrong: 'mth2168.wrong.v1',
  settings: 'mth2168.settings.v1'
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be unavailable in private browsing; the app still works for the session.
  }
}

export const store = {
  KEYS,
  progress() {
    return read(KEYS.progress, {});
  },
  recordAttempt(unitId, correct) {
    const data = this.progress();
    const item = data[unitId] || { correct: 0, total: 0 };
    item.total += 1;
    if (correct) item.correct += 1;
    data[unitId] = item;
    write(KEYS.progress, data);
    return data;
  },
  resetProgress() {
    write(KEYS.progress, {});
  },
  wrong() {
    return read(KEYS.wrong, []);
  },
  addWrong(question, note = '') {
    const list = this.wrong();
    const existing = list.find((item) => item.id === question.id);
    if (existing) {
      existing.attempts = (existing.attempts || 1) + 1;
      existing.at = Date.now();
      existing.note = note || existing.note || '';
    } else {
      list.unshift({
        id: question.id,
        unitId: question.unitId,
        kind: question.kind,
        prompt: question.prompt,
        choices: question.choices || null,
        answer: question.answer,
        accept: question.accept || null,
        solutionSteps: question.solutionSteps || [],
        rubric: question.rubric || null,
        marks: question.marks || 2,
        attempts: 1,
        at: Date.now(),
        note
      });
    }
    write(KEYS.wrong, list.slice(0, 200));
  },
  removeWrong(id) {
    write(KEYS.wrong, this.wrong().filter((item) => item.id !== id));
  },
  clearWrong() {
    write(KEYS.wrong, []);
  },
  settings() {
    return read(KEYS.settings, { unitId: 'sets', level: 2, mode: 'mixed' });
  },
  saveSettings(patch) {
    const next = { ...this.settings(), ...patch };
    write(KEYS.settings, next);
    return next;
  }
};
