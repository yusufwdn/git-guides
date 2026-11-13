export function buildSearchIndex(data) {
  const entries = data.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    kind: 'Materi',
    url: `/belajar/${lesson.id}/`,
    text: [
      lesson.summary,
      lesson.scenario,
      lesson.concept,
      lesson.pitfall,
      lesson.practice,
      ...lesson.commands,
      ...lesson.steps.map((step) => step.command + ' ' + step.explanation),
      lesson.quiz.explanation,
    ].join(' '),
  }));
  entries.push(
    ...data.glossary.map(([title, text]) => ({
      id: title,
      title,
      kind: 'Istilah',
      url: '/glosarium/#' + encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      text,
    })),
  );
  entries.push(
    ...data.problems.map(([title, id]) => ({
      id,
      title,
      kind: 'Masalah',
      url: `/belajar/${id}/`,
      text: title,
    })),
  );
  return entries;
}
