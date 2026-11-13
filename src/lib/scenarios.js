import Sim from './simulator.js';
export const scenarioInfo = {
  branch: {
    title: 'Rekam pekerjaan pada branch baru, pertahankan main.',
    description:
      'diskon.js sudah diedit menjadi 10%. Buat branch hotfix dari posisi sekarang, add diskon.js, lalu commit. Main harus tetap menyimpan diskon 0%.',
    suggestions: [
      'git status',
      'git switch -c hotfix',
      'git add diskon.js',
      'git commit -m "Diskon hotfix"',
      'git log --oneline',
      'git switch main',
    ],
    isComplete: (state) =>
      state.branch === 'hotfix' &&
      Sim.head(state).files['diskon.js'] === 'const diskon = 10;' &&
      state.refs.main !== state.refs.hotfix &&
      state.commits.find((commit) => commit.id === state.refs.main).files['diskon.js'] ===
        'const diskon = 0;',
  },
  stash: {
    title: 'Simpan pekerjaan diskon, termasuk file baru.',
    description:
      'diskon.js berubah dan catatan.txt masih untracked. Simpan keduanya, pastikan pekerjaan bersih, lalu pulihkan. Petunjuk: perhatikan opsi -u.',
    suggestions: [
      'git status',
      'git diff',
      'git stash push -u -m "WIP diskon"',
      'git stash list',
      'git stash pop',
    ],
    isComplete: (state) =>
      state.stashes.length === 0 &&
      state.working['diskon.js'] === 'const diskon = 10;' &&
      state.working['catatan.txt'] === 'Ide: diskon akhir pekan',
  },
  staging: {
    title: 'Commit koreksi menu, sisakan pekerjaan diskon.',
    description:
      'menu.json dan diskon.js sama-sama berubah. Buat commit untuk menu saja. Perubahan diskon harus tetap belum di-commit.',
    suggestions: [
      'git status',
      'git add menu.json',
      'git diff --staged',
      'git commit -m "Perbaiki harga menu"',
      'git log --oneline',
    ],
    isComplete: (state) =>
      Sim.head(state).files['menu.json'] === '{"kopiSusu": 20000}' &&
      Sim.head(state).files['diskon.js'] === 'const diskon = 0;' &&
      state.working['diskon.js'] === 'const diskon = 10;',
  },
  conflict: {
    title: 'Pulihkan stash yang bentrok tanpa membuang simpanannya.',
    description:
      'Repo sudah memiliki diskon 15%, sedangkan stash menyimpan 10%. Coba pop, selesaikan file menjadi 10%, lalu add dan commit. Periksa bahwa stash tetap ada setelah konflik.',
    suggestions: [
      'git stash list',
      'git stash pop',
      'git status',
      'git add diskon.js',
      'git commit -m "Selesaikan diskon"',
    ],
    isComplete: (state) =>
      !state.conflicts.length &&
      Sim.head(state).files['diskon.js'] === 'const diskon = 10;' &&
      state.stashes.length === 1,
  },
};
