import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { usedBeforeTaught } from './curriculum-order.mjs';
const require = createRequire(import.meta.url);
for (const file of [
  'assets/content.js',
  'assets/visuals.js',
  'assets/simulator.js',
  'assets/pages.js',
  'assets/routes.js',
  'src/lib/progress.js',
  'src/lib/simulator.js',
  'src/renderers/index.js',
  'scripts/prepare-assets.mjs',
  'labs/git-lab.cjs',
])
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
const { chapters, lessons, labs } = require('../assets/content.js');
assert.equal(chapters.length, 16);
assert(lessons.length >= 60 && lessons.length <= 80);
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length);
for (const chapter of chapters)
  assert(
    lessons.filter((lesson) => lesson.chapter === chapter.id).length >= 3,
    `Bab ${chapter.id} harus mempunyai setidaknya tiga materi.`,
  );
for (const lesson of lessons) {
  for (const key of [
    'title',
    'summary',
    'scenario',
    'concept',
    'analogy',
    'result',
    'pitfall',
    'practice',
  ])
    assert(lesson[key]?.length > 20, `${lesson.id}: ${key} belum lengkap.`);
  assert(lesson.steps.length >= 2);
  assert(lesson.commands.length);
  assert(lesson.quiz.options[lesson.quiz.answer]);
  for (const step of lesson.steps) assert(step.command && step.explanation.length > 20);
  assert(lesson.initialState?.length > 40, `${lesson.id}: kondisi awal belum dijelaskan.`);
  if (lesson.lab) assert(labs[lesson.lab], `${lesson.id}: latihan pendamping tidak ditemukan.`);
  for (const id of lesson.prerequisites)
    assert(
      lessons.findIndex((item) => item.id === id) < lessons.indexOf(lesson) &&
        lessons.some((item) => item.id === id),
      `${lesson.id}: prasyarat tidak valid.`,
    );
  assert(
    lesson.sources.length && lesson.sources.every((source) => source.url.startsWith('https://')),
  );
}
const orderProblems = usedBeforeTaught(lessons);
assert.equal(
  orderProblems.length,
  0,
  'Command dipakai sebelum diajarkan:\n' +
    orderProblems
      .map((p) => `- ${p.lesson}: ${p.command} baru diajarkan di ${p.taughtIn}`)
      .join('\n'),
);
for (const [id, lab] of Object.entries(labs))
  assert(
    lab.solution && lab.hints.length && lessons.some((lesson) => lesson.id === lab.lesson),
    `${id}: pembahasan latihan belum lengkap.`,
  );
console.log(
  `Pemeriksaan selesai: 16 bab, ${lessons.length} materi, ${Object.keys(labs).length} latihan terminal; kondisi awal, prasyarat, sumber, dan urutan command valid.`,
);
