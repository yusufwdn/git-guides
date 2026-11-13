const { test } = require('node:test');
const assert = require('node:assert/strict');

// Modul pemeriksa ditulis sebagai ES module karena dipakai scripts/check.mjs.
const load = () => import('../scripts/curriculum-order.mjs');

// Membuat materi tiruan minimal untuk pengujian. Input: id, isi field commands,
// command langkah, dan command verifikasi (opsional).
const lesson = (id, commands, stepCommand, verificationCommand) => ({
  id,
  commands,
  steps: [{ command: stepCommand }],
  verification: verificationCommand ? { command: verificationCommand } : undefined,
});

test('nama subcommand diambil per baris dan path .git tidak terbaca sebagai command', async () => {
  const { gitSubcommands } = await load();
  assert.deepEqual(gitSubcommands('cd ../kopi-kita\ngit log --oneline -1\ngit status'), [
    'log',
    'status',
  ]);
  assert.deepEqual(gitSubcommands('git clone kopi-kita-server.git kopi-kita-rani'), ['clone']);
  assert.deepEqual(gitSubcommands('# git push dulu\ngit fetch origin'), ['fetch']);
});

test('command di langkah sebelum materi pengajarnya dilaporkan', async () => {
  const { usedBeforeTaught } = await load();
  const lessons = [
    lesson('awal', ['git init'], 'git init -b main\ngit log --oneline'),
    lesson('riwayat', ['git log'], 'git log --oneline'),
  ];
  assert.deepEqual(usedBeforeTaught(lessons), [
    { lesson: 'awal', command: 'git log', taughtIn: 'riwayat' },
  ]);
});

test('verifikasi ikut diperiksa, sedangkan flag lain dari command yang sama tidak', async () => {
  const { usedBeforeTaught } = await load();
  const lessons = [
    lesson('branch', ['git branch'], 'git branch', 'git cat-file -t HEAD'),
    lesson('tracking', ['git branch -vv'], 'git branch -vv'),
    lesson('objects', ['git cat-file'], 'git cat-file -p HEAD'),
  ];
  assert.deepEqual(usedBeforeTaught(lessons), [
    { lesson: 'branch', command: 'git cat-file', taughtIn: 'objects' },
  ]);
});

test('command yang tidak tercantum di commands mana pun dianggap dikenalkan di tempat', async () => {
  const { usedBeforeTaught } = await load();
  const lessons = [lesson('terminal', ['git help'], 'git rev-parse --show-toplevel')];
  assert.deepEqual(usedBeforeTaught(lessons), []);
});
