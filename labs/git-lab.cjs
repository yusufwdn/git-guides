#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');

const BASE = {
  'menu.json': '{"kopiSusu":18000}\n',
  'diskon.js': 'const diskon = 0;\n',
  'checkout.js': 'function total(harga, jumlah) { return harga * jumlah; }\n',
  'README.md': '# Kopi Kita\n\nMenu kopi untuk semua.\n',
};
const definitions = {
  worktree: ['Dua folder, dua jalur', 'Buat linked worktree kopi-kita-hotfix pada branch hotfix, commit harga 22000 di sana, dan pertahankan main pada harga 18000.'],
  submodule: ['Pilih versi submodule', 'Perbarui tema ke commit terbaru dari sumber lokal, lalu commit perubahan gitlink pada superproject.'],
  basics: ['Kenali tiga area', 'Amati perbedaan working tree, index, dan HEAD tanpa mengubah isi.'],
  staging: [
    'Commit satu tujuan',
    'Commit harga menu 20000; diskon 10 tetap menjadi perubahan unstaged.',
  ],
  'partial-staging': [
    'Commit satu hunk',
    'Commit perbaikan Math.max pada checkout.js; perubahan pesan tetap unstaged.',
  ],
  branch: [
    'Kerjakan fitur terpisah',
    'Buat fitur-diskon dari main, commit diskon 10, dan pertahankan main pada diskon 0.',
  ],
  'merge-ff': [
    'Merge fast-forward',
    'Majukan main hingga commit fitur tanpa membuat merge commit.',
  ],
  'merge-conflict': [
    'Selesaikan konflik harga',
    'Gabungkan fitur-menu ke main, pilih harga 22000, dan selesaikan merge.',
  ],
  'merge-abort': [
    'Batalkan merge yang belum selesai',
    'Mulai merge fitur-menu, amati konflik, lalu kembali ke keadaan main sebelum merge.',
  ],
  stash: [
    'Stash termasuk file baru',
    'Simpan diskon.js dan catatan.txt dengan -u, lalu pulihkan keduanya.',
  ],
  'stash-index': [
    'Pulihkan staging',
    'Simpan perubahan, lalu gunakan apply --index agar versi staged diskon 5 dan working tree diskon 10 kembali terpisah.',
  ],
  'stash-conflict': [
    'Selesaikan konflik stash',
    'Pop simpanan, pilih diskon 10, add dan commit. Pertahankan entri stash yang gagal di-pop.',
  ],
  'reset-soft': [
    'Reset soft',
    'Kembalikan branch ke commit awal; pertahankan index harga 22000 dan working tree harga 24000.',
  ],
  'reset-mixed': [
    'Reset mixed',
    'Kembalikan branch dan index ke commit awal harga 18000; working tree harus tetap 24000.',
  ],
  'reset-hard': [
    'Reset hard pada repo latihan',
    'Kembalikan branch, index, dan working tree ke commit awal harga 18000. Perubahan lokal latihan akan dibuang.',
  ],
  revert: [
    'Koreksi commit dengan commit baru',
    'Revert harga salah hingga menu kembali 18000, tanpa menghapus commit salah dari riwayat.',
  ],
  reflog: [
    'Temukan commit yang kehilangan branch',
    'Temukan commit fitur dari reflog, lalu buat branch pulih-diskon yang menunjuk commit tersebut.',
  ],
  remote: [
    'Fetch, integrasi, push',
    'Ambil perubahan Rani, fast-forward main lokal, lalu commit README tambahan dan push ke server lokal.',
  ],
  rebase: [
    'Ubah dasar fitur',
    'Rebase fitur-diskon di atas main. Dua perubahan fitur harus tetap ada dengan identitas commit baru.',
  ],
  'cherry-pick': [
    'Ambil satu perbaikan',
    'Terapkan hanya commit perbaikan checkout ke branch rilis; eksperimen menu tidak boleh ikut.',
  ],
  clean: [
    'Preview sebelum menghapus',
    'Pratinjau dengan clean -nd, lalu hapus hanya catatan-sementara.txt. Folder cache yang ignored dan perubahan menu harus tetap ada.',
  ],
  bisect: [
    'Temukan commit penyebab bug',
    'Temukan commit pertama dengan hasil diskon salah. Setelah selesai, buat branch bug-ditemukan pada commit itu dan jalankan bisect reset.',
  ],
  tags: [
    'Tandai edisi rilis',
    'Buat annotated tag v1.0.0 pada commit awal. Commit baru di main tidak boleh memindahkan tag.',
  ],
  sparse: [
    'Fokus pada satu bagian repo',
    'Aktifkan sparse checkout cone untuk folder web. Folder docs tidak ditampilkan, tetapi tetap ada di snapshot Git.',
  ],
  objects: [
    'Baca object dan referensi',
    'Temukan root tree dan blob menu pada HEAD. Tidak ada perubahan repository yang diperlukan.',
  ],
};
const PARTIAL_BASE =
  'function total(harga, jumlah) {\n  return harga * jumlah;\n}\n' +
  Array.from({ length: 12 }, (_, index) => `// Catatan checkout ${index + 1}\n`).join('') +
  '\nconst pesan = "Terima kasih";\n';

function git(repo, ...args) {
  const hooks = path.join(repo, '.git-guides-empty-hooks');
  return execFileSync(
    'git',
    [
      '-c',
      `core.hooksPath=${hooks}`,
      '-c',
      'commit.gpgsign=false',
      '-c',
      'tag.gpgsign=false',
      '-c',
      'core.autocrlf=false',
      '-c',
      'user.name=Pelajar Kopi Kita',
      '-c',
      'user.email=belajar@example.invalid',
      ...args,
    ],
    { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024 },
  )
    .replace(/\r\n/g, '\n')
    .trimEnd();
}

function write(repo, file, value) {
  const target = path.join(repo, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, 'utf8');
}

function commit(repo, message) {
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
}

function initialize(repo, files = BASE) {
  fs.mkdirSync(repo, { recursive: false });
  git(repo, 'init', '-b', 'main');
  for (const [key, value] of Object.entries(files)) write(repo, key, value);
  git(repo, 'config', 'user.name', 'Pelajar Kopi Kita');
  git(repo, 'config', 'user.email', 'belajar@example.invalid');
  git(repo, 'config', 'commit.gpgsign', 'false');
  git(repo, 'config', 'tag.gpgsign', 'false');
  git(repo, 'config', 'core.autocrlf', 'false');
  git(repo, 'config', 'core.hooksPath', '.git-guides-empty-hooks');
  const first = commit(repo, 'Siapkan Kopi Kita');
  git(repo, 'tag', 'awal');
  return first;
}

function start(scenario, options = {}) {
  if (!Object.hasOwn(definitions, scenario)) throw new Error(`Skenario tidak dikenal: ${scenario}`);
  const parent = path.resolve(options.directory || path.join(process.cwd(), 'git-labs'));
  fs.mkdirSync(parent, { recursive: true });
  const root = path.join(
    parent,
    `${scenario}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
  );
  fs.mkdirSync(root, { recursive: false });
  const repo = path.join(root, 'kopi-kita'),
    base = initialize(
      repo,
      scenario === 'partial-staging' ? { ...BASE, 'checkout.js': PARTIAL_BASE } : BASE,
    ),
    metadata = { version: 1, scenario, repo: 'kopi-kita', base, expected: {} };
  const update = (file, value) => write(repo, file, value);
  if (['basics', 'staging', 'stash'].includes(scenario)) {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 10;\n');
    if (scenario === 'staging') update('menu.json', '{"kopiSusu":20000}\n');
    if (scenario === 'stash') update('catatan.txt', 'Ide diskon akhir pekan.\n');
  } else if (scenario === 'partial-staging') {
    update(
      'checkout.js',
      PARTIAL_BASE.replace('harga * jumlah', 'harga * Math.max(0, jumlah)').replace(
        'Terima kasih',
        'Pesanan diterima',
      ),
    );
  } else if (scenario === 'revert') {
    update('menu.json', '{"kopiSusu":20000}\n');
    metadata.expected.bad = commit(repo, 'Harga yang perlu dibatalkan');
  } else if (scenario === 'merge-ff') {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 10;\n');
    metadata.expected.feature = commit(repo, 'Tambah diskon');
    git(repo, 'switch', 'main');
  } else if (['merge-conflict', 'merge-abort'].includes(scenario)) {
    git(repo, 'switch', '-c', 'fitur-menu');
    update('menu.json', '{"kopiSusu":22000}\n');
    metadata.expected.feature = commit(repo, 'Harga usulan fitur');
    git(repo, 'switch', 'main');
    update('menu.json', '{"kopiSusu":20000}\n');
    metadata.expected.main = commit(repo, 'Harga dari tim toko');
  } else if (scenario === 'stash-index') {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 5;\n');
    git(repo, 'add', 'diskon.js');
    update('diskon.js', 'const diskon = 10;\n');
  } else if (scenario === 'stash-conflict') {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 10;\n');
    git(repo, 'stash', 'push', '-m', 'WIP diskon');
    metadata.expected.stash = git(repo, 'rev-parse', 'refs/stash');
    update('diskon.js', 'const diskon = 15;\n');
    metadata.expected.main = commit(repo, 'Diskon dari tim');
  } else if (scenario.startsWith('reset-')) {
    update('menu.json', '{"kopiSusu":20000}\n');
    metadata.expected.before = commit(repo, 'Ubah harga menu');
    update('menu.json', '{"kopiSusu":22000}\n');
    git(repo, 'add', 'menu.json');
    update('menu.json', '{"kopiSusu":24000}\n');
  } else if (scenario === 'reflog') {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 10;\n');
    metadata.expected.rescue = commit(repo, 'Diskon yang ingin dipulihkan');
    git(repo, 'switch', 'main');
    git(repo, 'branch', '-D', 'fitur-diskon');
  } else if (scenario === 'remote') {
    const server = path.join(root, 'server.git');
    git(root, 'init', '--bare', '--initial-branch=main', server);
    git(repo, 'remote', 'add', 'origin', server);
    git(repo, 'push', '-u', 'origin', 'main');
    const colleague = path.join(root, 'rani');
    git(root, 'clone', server, colleague);
    write(colleague, 'menu.json', '{"kopiSusu":20000}\n');
    metadata.expected.remote = commit(colleague, 'Harga baru dari Rani');
    git(colleague, 'push', 'origin', 'main');
    metadata.expected.initialTracking = git(repo, 'rev-parse', 'origin/main');
  } else if (scenario === 'rebase') {
    git(repo, 'switch', '-c', 'fitur-diskon');
    update('diskon.js', 'const diskon = 5;\n');
    metadata.expected.oldFirst = commit(repo, 'Diskon awal');
    update('diskon.js', 'const diskon = 10;\n');
    metadata.expected.oldTip = commit(repo, 'Sesuaikan diskon');
    git(repo, 'switch', 'main');
    update('menu.json', '{"kopiSusu":20000}\n');
    metadata.expected.main = commit(repo, 'Harga baru di main');
    git(repo, 'switch', 'fitur-diskon');
  } else if (scenario === 'cherry-pick') {
    git(repo, 'branch', 'rilis');
    git(repo, 'switch', '-c', 'fitur-eksperimen');
    update('menu.json', '{"kopiSusu":25000}\n');
    commit(repo, 'Eksperimen harga');
    update(
      'checkout.js',
      'function total(harga, jumlah) { return harga * Math.max(0, jumlah); }\n',
    );
    metadata.expected.fix = commit(repo, 'Validasi jumlah checkout');
    git(repo, 'switch', 'rilis');
  } else if (scenario === 'clean') {
    update('.gitignore', 'cache/\n');
    metadata.base = commit(repo, 'Abaikan cache lokal');
    update('catatan-sementara.txt', 'Boleh dihapus.\n');
    update('cache/data.txt', 'Cache harus tetap ada.\n');
    update('menu.json', '{"kopiSusu":20000}\n');
  } else if (scenario === 'bisect') {
    for (let i = 1; i <= 6; i++) {
      update('README.md', `# Kopi Kita\n\nLangkah ${i}.\n`);
      if (i === 3) update('diskon.js', 'const diskon = -10;\n');
      const id = commit(repo, `Perubahan ${i}`);
      if (i === 3) metadata.expected.bad = id;
    }
  } else if (scenario === 'submodule') {
    const theme = path.join(root, 'tema-source');
    initialize(theme, { 'tema.css': 'body { color: black; }\n' });
    metadata.expected.first = git(theme, 'rev-parse', 'HEAD');
    git(repo, '-c', 'protocol.file.allow=always', 'submodule', 'add', theme, 'tema');
    metadata.base = commit(repo, 'Pilih tema awal');
    write(theme, 'tema.css', 'body { color: orange; }\n');
    metadata.expected.latest = commit(theme, 'Tema orange');
  } else if (scenario === 'sparse') {
    update('web/index.html', '<h1>Kopi Kita</h1>\n');
    update('docs/panduan.md', '# Panduan tim\n');
    metadata.base = commit(repo, 'Pisahkan web dan dokumen');
  }
  fs.writeFileSync(path.join(root, 'lab.json'), JSON.stringify(metadata, null, 2));
  return { root, repo, metadata, title: definitions[scenario][0], goal: definitions[scenario][1] };
}

function locate(directory) {
  let current = path.resolve(directory);
  for (let i = 0; i < 4; i++) {
    const manifest = path.join(current, 'lab.json');
    if (fs.existsSync(manifest)) {
      const metadata = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      if (
        metadata.version !== 1 ||
        metadata.repo !== 'kopi-kita' ||
        !Object.hasOwn(definitions, metadata.scenario)
      )
        throw new Error('Metadata latihan tidak valid.');
      const repo = path.join(current, metadata.repo);
      if (fs.realpathSync(repo) !== path.resolve(repo))
        throw new Error('Folder repo latihan tidak boleh berupa symlink.');
      return { root: current, repo, metadata };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(
    'lab.json tidak ditemukan. Jalankan check dari repo latihan atau berikan path folder latihan.',
  );
}

function check(directory) {
  const { root, repo, metadata: m } = locate(directory),
    items = [];
  const q = (...args) => {
    try {
      return git(repo, ...args);
    } catch {
      return null;
    }
  };
  const read = (file) => {
    try {
      return fs.readFileSync(path.join(repo, file), 'utf8').trim();
    } catch {
      return null;
    }
  };
  const add = (label, passed, actual = '') => items.push({ label, passed: !!passed, actual });
  const head = q('rev-parse', 'HEAD'),
    staged = q('diff', '--cached', '--name-only'),
    working = q('diff', '--name-only'),
    scenario = m.scenario;
  if (scenario === 'basics') {
    add(
      'HEAD dan index masih berisi diskon 0',
      q('show', 'HEAD:diskon.js') === 'const diskon = 0;' &&
        q('show', ':diskon.js') === 'const diskon = 0;',
    );
    add('Working tree berisi diskon 10', read('diskon.js') === 'const diskon = 10;');
  }
  if (scenario === 'staging') {
    add('Commit merekam harga 20000', q('show', 'HEAD:menu.json') === '{"kopiSusu":20000}');
    add('Commit tidak membawa diskon', q('show', 'HEAD:diskon.js') === 'const diskon = 0;');
    add(
      'Diskon 10 tetap unstaged',
      read('diskon.js') === 'const diskon = 10;' && working === 'diskon.js' && staged === '',
    );
  }
  if (scenario === 'partial-staging') {
    add(
      'HEAD merekam perbaikan perhitungan',
      q('show', 'HEAD:checkout.js')?.includes('Math.max(0, jumlah)'),
    );
    add(
      'HEAD belum membawa pesan percobaan',
      q('show', 'HEAD:checkout.js')?.includes('Terima kasih'),
    );
    add(
      'Working tree mempertahankan pesan baru',
      read('checkout.js')?.includes('Pesanan diterima'),
    );
    add('Pesan tersisa sebagai edit unstaged', working === 'checkout.js' && staged === '');
  }
  if (scenario === 'branch') {
    add(
      'Branch fitur-diskon tersedia dengan diskon 10',
      q('show', 'fitur-diskon:diskon.js') === 'const diskon = 10;',
    );
    add('Main tetap pada snapshot awal', q('rev-parse', 'main') === m.base);
  }
  if (scenario === 'merge-ff') {
    add('Main maju ke commit fitur yang sama', q('rev-parse', 'main') === m.expected.feature);
    add('Tidak membuat commit merge baru', q('rev-list', '--count', 'main') === '2');
  }
  if (scenario === 'merge-conflict') {
    add(
      'Main mempunyai merge commit dengan dua parent',
      q('rev-list', '--parents', '-n', '1', 'main')?.split(' ').length === 3,
    );
    add('Harga akhir 22000', q('show', 'main:menu.json') === '{"kopiSusu":22000}');
    add(
      'Tidak ada konflik atau perubahan tersisa',
      q('status', '--porcelain') === '' && !fs.existsSync(path.join(repo, '.git', 'MERGE_HEAD')),
    );
  }
  if (scenario === 'merge-abort') {
    add('Main kembali ke commit sebelum merge', head === m.expected.main);
    add('Working tree dan index bersih', q('status', '--porcelain') === '');
    add('Tidak ada merge berjalan', !fs.existsSync(path.join(repo, '.git', 'MERGE_HEAD')));
  }
  if (scenario === 'stash') {
    add('Diskon 10 kembali', read('diskon.js') === 'const diskon = 10;');
    add('Catatan untracked kembali', read('catatan.txt') === 'Ide diskon akhir pekan.');
    add('Daftar stash kosong sesudah pop', q('stash', 'list') === '');
    add('HEAD tidak berubah', head === m.base);
  }
  if (scenario === 'stash-index') {
    add('Index memuat diskon 5', q('show', ':diskon.js') === 'const diskon = 5;');
    add('Working tree memuat diskon 10', read('diskon.js') === 'const diskon = 10;');
    add('Apply mempertahankan entri stash', !!q('stash', 'list'));
  }
  if (scenario === 'stash-conflict') {
    add(
      'Commit memuat hasil diskon 10',
      q('show', 'HEAD:diskon.js') === 'const diskon = 10;' && head !== m.expected.main,
    );
    add('Entri konflik tetap disimpan', q('rev-parse', 'refs/stash') === m.expected.stash);
    add('Tidak ada unmerged entry', q('ls-files', '-u') === '');
  }
  if (scenario.startsWith('reset-')) {
    const mode = scenario.slice(6);
    add('Branch menunjuk commit awal', head === m.base);
    add(
      'Isi index sesuai mode',
      q('show', ':menu.json') === (mode === 'soft' ? '{"kopiSusu":22000}' : '{"kopiSusu":18000}'),
    );
    add(
      'Isi working tree sesuai mode',
      read('menu.json') === (mode === 'hard' ? '{"kopiSusu":18000}' : '{"kopiSusu":24000}'),
    );
  }
  if (scenario === 'revert') {
    add(
      'Harga kembali 18000 pada commit baru',
      q('show', 'HEAD:menu.json') === '{"kopiSusu":18000}' && head !== m.base,
    );
    add(
      'Commit yang dibatalkan tetap ancestor',
      q('merge-base', '--is-ancestor', m.expected.bad, 'HEAD') === '',
    );
    add('Koreksi tidak meninggalkan edit lokal', q('status', '--porcelain') === '');
  }
  if (scenario === 'reflog')
    add(
      'Branch pulih-diskon menunjuk commit yang dicari',
      q('rev-parse', 'pulih-diskon') === m.expected.rescue,
    );
  if (scenario === 'remote') {
    const server = path.join(root, 'server.git');
    const remoteHead = git(server, 'rev-parse', 'main');
    add(
      'Main lokal mencakup perubahan Rani',
      q('merge-base', '--is-ancestor', m.expected.remote, 'main') === '',
    );
    add('Harga terbaru ada di main', q('show', 'main:menu.json') === '{"kopiSusu":20000}');
    add('Ada commit lokal tambahan setelah Rani', q('rev-parse', 'main') !== m.expected.remote);
    add('Main lokal dan server sama', q('rev-parse', 'main') === remoteHead);
    add(
      'README berubah pada commit lokal',
      q('diff', '--name-only', m.expected.remote, 'main')?.split('\n').includes('README.md'),
    );
  }
  if (scenario === 'rebase') {
    add(
      'Main menjadi ancestor fitur',
      q('merge-base', '--is-ancestor', m.expected.main, 'fitur-diskon') === '',
    );
    add('Dua commit fitur diputar ulang', q('rev-list', '--count', 'main..fitur-diskon') === '2');
    add('Identitas commit fitur berubah', q('rev-parse', 'fitur-diskon') !== m.expected.oldTip);
    add(
      'Hasil diskon dan menu sama-sama ada',
      q('show', 'fitur-diskon:diskon.js') === 'const diskon = 10;' &&
        q('show', 'fitur-diskon:menu.json') === '{"kopiSusu":20000}',
    );
  }
  if (scenario === 'cherry-pick') {
    add(
      'Rilis berisi perbaikan checkout',
      q('show', 'rilis:checkout.js')?.includes('Math.max(0, jumlah)'),
    );
    add('Eksperimen harga tidak ikut', q('show', 'rilis:menu.json') === '{"kopiSusu":18000}');
    add('Commit baru berbeda dari sumber', q('rev-parse', 'rilis') !== m.expected.fix);
  }
  if (scenario === 'clean') {
    add('Catatan sementara dihapus', !fs.existsSync(path.join(repo, 'catatan-sementara.txt')));
    add('File ignored tetap ada', read('cache/data.txt') === 'Cache harus tetap ada.');
    add('Edit tracked tetap ada', read('menu.json') === '{"kopiSusu":20000}');
  }
  if (scenario === 'bisect') {
    add(
      'Branch bug-ditemukan menunjuk commit pertama yang buruk',
      q('rev-parse', 'bug-ditemukan') === m.expected.bad,
    );
    add('Proses bisect sudah ditutup', !fs.existsSync(path.join(repo, '.git', 'BISECT_START')));
  }
  if (scenario === 'tags') {
    add('v1.0.0 adalah annotated tag', q('cat-file', '-t', 'v1.0.0') === 'tag');
    add('Tag tetap menunjuk commit awal', q('rev-parse', 'v1.0.0^{}') === m.base);
    add('Main sudah mempunyai commit baru', q('rev-parse', 'main') !== m.base);
  }
  if (scenario === 'sparse') {
    add('Sparse checkout cone memilih web', q('sparse-checkout', 'list') === 'web');
    add('File web tersedia', fs.existsSync(path.join(repo, 'web', 'index.html')));
    add(
      'Dokumen tidak tampil di working tree',
      !fs.existsSync(path.join(repo, 'docs', 'panduan.md')),
    );
    add('Dokumen tetap ada di snapshot', q('show', 'HEAD:docs/panduan.md') === '# Panduan tim');
  }
  if (scenario === 'objects') {
    add('Tidak ada perubahan repository', q('status', '--porcelain') === '');
    add('Root tree dapat dibaca', q('cat-file', '-t', 'HEAD^{tree}') === 'tree');
    add('Blob menu dapat dibaca', q('cat-file', '-t', 'HEAD:menu.json') === 'blob');
  }
  if (scenario === 'worktree') {
    const linked = path.join(root, 'kopi-kita-hotfix');
    const registered = q('worktree', 'list', '--porcelain') || '';
    add('Worktree hotfix terdaftar', registered.includes('refs/heads/hotfix') && fs.existsSync(linked));
    add('Main tidak berubah', q('rev-parse', 'main') === m.base);
    add('Hotfix merekam harga 22000', q('show', 'hotfix:menu.json') === '{"kopiSusu":22000}');
    add('Working tree utama tetap harga awal', read('menu.json') === '{"kopiSusu":18000}');
  }
  if (scenario === 'submodule') {
    add('Superproject merekam gitlink terbaru', q('rev-parse', 'HEAD:tema') === m.expected.latest);
    add('Perubahan gitlink sudah di-commit', head !== m.base && q('status', '--porcelain') === '');
    const config = q('show', 'HEAD:.gitmodules');
    add('Konfigurasi submodule tetap tersedia', config?.includes('path = tema'));
  }
  return {
    scenario,
    items,
    ok: items.length > 0 && items.every((item) => item.passed),
    note: 'Pemeriksaan menilai keadaan akhir. Perintah observasi seperti status, fetch inspection, dan preview tetap perlu kamu jalankan sendiri.',
  };
}

function main(args) {
  if (args[0] === 'list' || !args.length) {
    console.log(
      'Kopi Kita — latihan Git lokal\n\n' +
        Object.entries(definitions)
          .map(([id, [title]]) => `${id.padEnd(18)} ${title}`)
          .join('\n') +
        '\n\nMulai: node git-lab.cjs start staging\nPeriksa: node git-lab.cjs check PATH_LATIHAN',
    );
    return;
  }
  if (args[0] === 'start') {
    const result = start(args[1], { directory: args[2] });
    console.log(
      `${result.title}\n${result.goal}\n\nMasuk ke repo:\ncd "${result.repo}"\n\nSetelah latihan, periksa hasil:\nnode "${__filename}" check "${result.root}"\n\nTidak ada folder lama yang dihapus. Identitas Git latihan hanya dikonfigurasi pada repo latihan.`,
    );
    return;
  }
  if (args[0] === 'check') {
    const result = check(args[1] || process.cwd());
    console.log(
      result.items.map((item) => `${item.passed ? 'OK' : 'BELUM'}  ${item.label}`).join('\n') +
        '\n\n' +
        result.note,
    );
    process.exitCode = result.ok ? 0 : 1;
    return;
  }
  throw new Error('Gunakan list, start SKENARIO, atau check PATH_LATIHAN.');
}

module.exports = { definitions, BASE, start, check, git, write, locate };
if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.stderr?.toString().trim() || error.message);
    process.exitCode = 1;
  }
}
