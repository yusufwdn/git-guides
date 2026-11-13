// Pemeriksaan urutan kurikulum: command Git yang dijalankan pembaca tidak boleh muncul
// sebelum materi yang mengajarkannya. Aturan lengkapnya ada di docs/kurikulum.md.
//
// Yang diperiksa hanya teks yang benar-benar dijalankan pembaca: command di setiap langkah
// dan di verifikasi. Penyebutan di teks penjelasan (konsep, pitfall, dan lainnya) diperiksa
// manual, karena penyebutan maju seperti "dibahas di bab 11" memang diperbolehkan.

// Mengambil nama subcommand Git dari satu blok command (boleh berisi beberapa baris).
// Dipanggil dari usedBeforeTaught() untuk langkah, verifikasi, dan field commands.
// Input: string seperti 'cd ../kopi-kita\ngit log --oneline -1'. Output: ['log'].
// Baris komentar (diawali #) dilewati. Pola mewajibkan spasi atau awal baris sebelum "git",
// supaya path seperti "kopi-kita-server.git kopi-kita-rani" tidak terbaca sebagai command.
export function gitSubcommands(block) {
  const names = [];
  for (const line of String(block).split('\n')) {
    if (line.trim().startsWith('#')) continue;
    for (const match of line.matchAll(/(?:^|[\s;|&(])git\s+([a-z][a-z-]*)/g)) names.push(match[1]);
  }
  return names;
}

// Mencari command yang dipakai di langkah atau verifikasi sebelum materi yang mengajarkannya.
// Dipanggil dari scripts/check.mjs dan tests/curriculum-order.test.cjs.
// Input: daftar materi yang sudah terurut menurut field order.
// Output: array { lesson, command, taughtIn }, kosong kalau urutannya benar.
// Sebuah command dianggap diajarkan di materi pertama yang mencantumkannya di field commands.
// Command yang tidak pernah tercantum di commands (misalnya rev-parse untuk pengecekan)
// dianggap dikenalkan di tempat ia dipakai, sehingga tidak dilaporkan.
export function usedBeforeTaught(lessons) {
  const taughtAt = new Map();
  lessons.forEach((lesson, index) => {
    for (const name of lesson.commands.flatMap(gitSubcommands))
      if (!taughtAt.has(name)) taughtAt.set(name, index);
  });

  const problems = [];
  lessons.forEach((lesson, index) => {
    const blocks = [...lesson.steps.map((step) => step.command), lesson.verification?.command];
    const used = new Set(blocks.filter(Boolean).flatMap(gitSubcommands));
    for (const name of used) {
      const taughtIndex = taughtAt.get(name);
      if (taughtIndex !== undefined && taughtIndex > index)
        problems.push({
          lesson: lesson.id,
          command: `git ${name}`,
          taughtIn: lessons[taughtIndex].id,
        });
    }
  });
  return problems;
}
