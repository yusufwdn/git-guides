const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readProgress, importProgress } = require('../src/lib/progress.js');
const ids = ['stash', 'branch'];
const memory = (initial) => {
  const values = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

test('data lama dengan JSON rusak atau tipe salah dipulihkan tanpa mematikan aplikasi', () => {
  for (const value of ['broken', '{}', 'false', '"stash"', '17', 'null']) {
    const result = readProgress(
      memory({ 'gitguides:completed': value, 'gitguides:bookmarks': value }),
      ids,
    );
    assert.deepEqual(result.completed, []);
    assert.deepEqual(result.bookmarks, []);
  }
  assert.deepEqual(
    readProgress(memory({ 'gitguides:completed': '["stash","stash","unknown",5]' }), ids).completed,
    ['stash'],
  );
});

test('impor hanya menerima format didukung dan ID dikenal; progres lama tetap kompatibel', () => {
  const store = memory({ 'gitguides:completed': '["branch"]' });
  assert.deepEqual(readProgress(store, ids).completed, ['branch']);
  assert.throws(() => importProgress(store, { version: 99, completed: [], bookmarks: [] }, ids));
  assert.deepEqual(readProgress(store, ids).completed, ['branch']);
  importProgress(
    store,
    {
      version: 1,
      completed: ['stash', 'not-real'],
      bookmarks: ['branch'],
      quizzes: { 'stash:main': true, 'not-real:main': true },
      practices: { stash: true },
    },
    ids,
  );
  const restored = readProgress(store, ids);
  assert.deepEqual(restored.completed, ['stash']);
  assert.deepEqual(restored.bookmarks, ['branch']);
  assert.deepEqual(restored.quizzes, { 'stash:main': true });
});

test('storage tidak tersedia dan kegagalan impor ditangani', () => {
  const unavailable = {
    getItem() {
      throw new Error('Denied');
    },
    setItem() {
      throw new Error('Denied');
    },
  };
  assert.deepEqual(readProgress(unavailable, ids).completed, []);
  const store = memory({ 'gitguides:completed': '["branch"]' });
  const original = store.setItem;
  store.setItem = (key, value) => {
    if (key === 'gitguides:quizzes') throw new Error('Quota');
    return original(key, value);
  };
  assert.throws(() =>
    importProgress(store, { version: 1, completed: ['stash'], bookmarks: [] }, ids),
  );
  assert.deepEqual(readProgress(store, ids).completed, ['branch']);
});
