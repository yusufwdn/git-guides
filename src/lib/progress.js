const prefix = 'gitguides:';

export function readValue(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(prefix + key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function validIds(value, allowed) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => typeof id === 'string' && allowed.has(id)))]
    : [];
}

export function readProgress(storage, ids) {
  const allowed = new Set(ids);
  const quizzes = readValue(storage, 'quizzes', {});
  const practices = readValue(storage, 'practices', {});
  return {
    version: 1,
    completed: validIds(readValue(storage, 'completed', []), allowed),
    bookmarks: validIds(readValue(storage, 'bookmarks', []), allowed),
    quizzes:
      quizzes && typeof quizzes === 'object' && !Array.isArray(quizzes)
        ? Object.fromEntries(
            Object.entries(quizzes).filter(
              ([key, value]) =>
                allowed.has(key.split(':')[0]) &&
                ['main', 'checkpoint'].includes(key.split(':')[1]) &&
                key.split(':').length === 2 &&
                typeof value === 'boolean',
            ),
          )
        : {},
    practices:
      practices && typeof practices === 'object' && !Array.isArray(practices)
        ? Object.fromEntries(
            Object.entries(practices).filter(
              ([key, value]) =>
                ['stash', 'staging', 'conflict', 'branch'].includes(key) && value === true,
            ),
          )
        : {},
  };
}

export function writeValue(storage, key, value) {
  try {
    storage.setItem(prefix + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function importProgress(storage, value, ids) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.completed) ||
    !Array.isArray(value.bookmarks)
  )
    throw new Error('Pilih berkas progres Git Guides versi 1 yang valid.');
  const memory = { getItem: (key) => JSON.stringify(value[key.slice(prefix.length)] ?? null) };
  const incoming = readProgress(memory, ids);
  const previous = ['completed', 'bookmarks', 'quizzes', 'practices'].map((key) => [
    key,
    storage.getItem(prefix + key),
  ]);
  try {
    for (const key of ['completed', 'bookmarks', 'quizzes', 'practices'])
      storage.setItem(prefix + key, JSON.stringify(incoming[key]));
  } catch {
    for (const [key, old] of previous) {
      try {
        if (old === null) storage.removeItem(prefix + key);
        else storage.setItem(prefix + key, old);
      } catch {}
    }
    throw new Error(
      'Penyimpanan perangkat tidak tersedia. Progres sebelumnya dipertahankan sejauh memungkinkan.',
    );
  }
  return incoming;
}
