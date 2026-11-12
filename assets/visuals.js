(function (root) {
  'use strict';
  const n = (id, x, y, parents = [], retired = false) => ({ id, x, y, parents, retired });
  const ref = (name, node) => ({ name, node });
  const graph = (nodes, refs) => ({ nodes, refs });
  const mergeBefore = graph(
    [n('A', 65, 90), n('B', 225, 90, ['A']), n('D', 390, 90, ['B']), n('C', 390, 190, ['B'])],
    [ref('main / HEAD', 'D'), ref('fitur', 'C')],
  );
  const ffBefore = graph(
    [n('A', 150, 110), n('B', 430, 110, ['A'])],
    [ref('main / HEAD', 'A'), ref('fitur-diskon', 'B')],
  );
  const rebaseNodes = [
    n('A', 65, 80),
    n('B', 230, 80, ['A']),
    n('C', 230, 190, ['A']),
    n('D', 390, 190, ['C']),
  ];
  const local = (tip, tracking, extra = false) =>
    graph(
      [
        n('A', 90, 105),
        ...(tracking !== 'A' || tip !== 'A' ? [n('B', 300, 105, ['A'])] : []),
        ...(extra ? [n('C', 510, 105, ['B'])] : []),
      ],
      [ref('main / HEAD', tip), ref('origin/main', tracking)],
    );
  const server = (tip) =>
    graph(
      [n('A', 90, 105), n('B', 300, 105, ['A']), ...(tip === 'C' ? [n('C', 510, 105, ['B'])] : [])],
      [ref('main server', tip)],
    );
  const scenarios = {
    branch: {
      title: 'Label branch mengikuti pekerjaan yang aktif.',
      description: 'Satu dasar, lalu satu commit fitur. Main tidak ikut bergerak.',
      frames: [
        {
          title: 'Mulai dari main',
          command: 'git log --oneline --decorate',
          explanation: 'Main dan HEAD berada di A. Belum ada branch fitur.',
          graph: graph([n('A', 260, 110)], [ref('main / HEAD', 'A')]),
        },
        {
          title: 'Beri nama jalur baru',
          command: 'git switch -c fitur-diskon',
          explanation:
            'Branch baru menunjuk A yang sama. Membuat branch belum membuat commit baru.',
          graph: graph([n('A', 260, 110)], [ref('main', 'A'), ref('fitur-diskon / HEAD', 'A')]),
        },
        {
          title: 'Rekam perubahan fitur',
          command: 'git add diskon.js\ngit commit -m "Tambah diskon"',
          explanation: 'Setelah file diedit dan direkam, fitur bergerak ke B. Main tetap di A.',
          graph: graph(
            [n('A', 140, 110), n('B', 450, 110, ['A'])],
            [ref('main', 'A'), ref('fitur-diskon / HEAD', 'B')],
          ),
        },
      ],
    },
    'merge-ff': {
      title: 'Fast-forward hanya memajukan referensi.',
      description: 'Main adalah ancestor fitur. Tidak ada object merge commit baru.',
      frames: [
        {
          title: 'Main masih di A',
          command: 'git switch main\ngit log --graph --oneline --all',
          explanation: 'Fitur punya B dengan parent A. Main belum memiliki jalur yang berbeda.',
          graph: ffBefore,
        },
        {
          title: 'Main maju ke B',
          command: 'git merge --ff-only fitur-diskon',
          explanation:
            'Main dan fitur menunjuk commit B yang sama. Isi working tree dan index main mengikuti snapshot B.',
          graph: graph(ffBefore.nodes, [ref('main / HEAD', 'B'), ref('fitur-diskon', 'B')]),
        },
      ],
    },
    merge: {
      title: 'Dua jalur bertemu dalam satu commit.',
      description: 'Contoh merge divergen yang berhasil setelah integrasi diselesaikan.',
      frames: [
        {
          title: 'Riwayat berpisah',
          command: 'git switch main\ngit log --graph --oneline --all',
          explanation: 'C dan D sama-sama berangkat dari B. Main berada di D, fitur di C.',
          graph: mergeBefore,
        },
        {
          title: 'Buat titik pertemuan',
          command: 'git merge fitur',
          explanation:
            'M mempunyai parent D dan C. Jika ada konflik, M baru dibuat setelah isi diselesaikan dan proses merge diteruskan.',
          graph: graph(
            [...mergeBefore.nodes, n('M', 585, 90, ['D', 'C'])],
            [ref('main / HEAD', 'M'), ref('fitur', 'C')],
          ),
        },
      ],
    },
    rebase: {
      title: 'Perubahan fitur diputar ulang pada dasar baru.',
      description:
        'Commit lama digambar pudar untuk menunjukkan jalur sebelumnya, bukan pemusnahan object.',
      frames: [
        {
          title: 'Main dan fitur divergen',
          command: 'git log --graph --oneline --all',
          explanation: 'Main punya B. Fitur punya C lalu D yang berangkat dari A.',
          graph: graph(rebaseNodes, [ref('main', 'B'), ref('fitur-diskon / HEAD', 'D')]),
        },
        {
          title: 'Gunakan main sebagai dasar',
          command: 'git switch fitur-diskon\ngit rebase main',
          explanation:
            'C′ dan D′ mempertahankan maksud perubahan dengan parent baru. Main tetap B. Object lama dapat masih tersedia melalui reflog sampai aturan retensi/pemangkasan berlaku.',
          graph: graph(
            [
              n('A', 65, 80),
              n('B', 230, 80, ['A']),
              n('C', 230, 190, ['A'], true),
              n('D', 390, 190, ['C'], true),
              n('C′', 405, 80, ['B']),
              n('D′', 590, 80, ['C′']),
            ],
            [ref('main', 'B'), ref('fitur-diskon / HEAD', 'D′')],
          ),
        },
      ],
    },
    remote: {
      title: 'Fetch, integrasi, dan push adalah langkah terpisah.',
      description:
        'Dua repository dalam latihan remote lokal. Huruf mewakili commit yang sama di kedua tempat.',
      frames: [
        {
          title: 'Server sudah maju',
          command: 'git branch -vv',
          explanation:
            'Laptop baru tahu A. Server sudah mempunyai B dari Rani. origin/main adalah catatan lokal lama.',
          repos: [
            { title: 'Laptopmu', ...local('A', 'A') },
            { title: 'Server lokal', ...server('B') },
          ],
        },
        {
          title: 'Ambil kabar',
          command: 'git fetch origin',
          explanation:
            'Object B dan catatan origin/main tersedia di laptop. Branch main dan file kerjamu masih A.',
          repos: [
            { title: 'Laptopmu', ...local('A', 'B') },
            { title: 'Server lokal', ...server('B') },
          ],
        },
        {
          title: 'Integrasikan kabar',
          command: 'git merge --ff-only origin/main',
          explanation: 'Main lokal maju ke B. Working tree dan index mengikuti snapshot B.',
          repos: [
            { title: 'Laptopmu', ...local('B', 'B') },
            { title: 'Server lokal', ...server('B') },
          ],
        },
        {
          title: 'Rekam pekerjaan lokal',
          command: 'git add README.md\ngit commit -m "Perbarui panduan"',
          explanation:
            'Setelah README diedit, commit C baru ada di main lokal. Server dan origin/main masih B.',
          repos: [
            { title: 'Laptopmu', ...local('C', 'B', true) },
            { title: 'Server lokal', ...server('B') },
          ],
        },
        {
          title: 'Kirim ke server',
          command: 'git push origin main',
          explanation:
            'Server menerima C. Dalam konfigurasi latihan ini, catatan origin/main juga menjadi C setelah push berhasil.',
          repos: [
            { title: 'Laptopmu', ...local('C', 'C', true) },
            { title: 'Server lokal', ...server('C') },
          ],
        },
      ],
    },
    reset: {
      title: 'Bandingkan mode dari keadaan awal yang sama.',
      description:
        'Setiap pilihan dimulai dari HEAD B, index 22000, dan working tree 24000. A adalah tag awal dengan harga 18000.',
      frames: [
        {
          title: 'Keadaan sebelum reset',
          command: 'git show HEAD:menu.json\ngit show :menu.json',
          explanation: 'HEAD, index, dan working tree sengaja mempunyai tiga nilai berbeda.',
          areas: [
            ['HEAD / branch', 'B · harga 20000'],
            ['Index', 'Harga 22000'],
            ['Working tree', 'Harga 24000'],
          ],
        },
        {
          title: 'Soft',
          command: 'git reset --soft awal',
          explanation: 'Hanya branch pindah ke A. Index dan working tree tetap.',
          areas: [
            ['HEAD / branch', 'A · harga 18000'],
            ['Index', 'Harga 22000'],
            ['Working tree', 'Harga 24000'],
          ],
        },
        {
          title: 'Mixed',
          command: 'git reset --mixed awal',
          explanation: 'Branch dan index kembali ke A. Working tree mempertahankan edit 24000.',
          areas: [
            ['HEAD / branch', 'A · harga 18000'],
            ['Index', 'Harga 18000'],
            ['Working tree', 'Harga 24000'],
          ],
        },
        {
          title: 'Hard',
          command: 'git reset --hard awal',
          explanation:
            'Branch, index, dan working tree kembali ke A. Perubahan contoh yang belum direkam dibuang.',
          areas: [
            ['HEAD / branch', 'A · harga 18000'],
            ['Index', 'Harga 18000'],
            ['Working tree', 'Harga 18000'],
          ],
        },
      ],
    },
    recovery: {
      title: 'Pasang nama baru pada commit yang ditemukan.',
      description:
        'Contoh pemulihan commit yang masih tersedia. Bukan jaminan pemulihan semua data.',
      frames: [
        {
          title: 'Referensi fitur sudah dihapus',
          command: 'git log --oneline --all',
          explanation:
            'Main masih A. B tidak punya branch pada contoh ini, tetapi object-nya masih ada dan jejak HEAD dapat membantu menemukannya.',
          graph: graph(
            [n('A', 140, 110), n('B', 460, 110, ['A'], true)],
            [ref('main / HEAD', 'A')],
          ),
        },
        {
          title: 'Periksa jejak dan isi',
          command: 'git reflog --all\ngit show HASH_KANDIDAT',
          explanation:
            'Temukan hash B dari jejak lokal lalu baca isinya. Jangan menganggap entri nomor tertentu selalu benar.',
          graph: graph(
            [n('A', 140, 110), n('B', 460, 110, ['A'])],
            [ref('main / HEAD', 'A'), ref('kandidat yang diperiksa', 'B')],
          ),
        },
        {
          title: 'Pertahankan melalui branch',
          command: 'git branch pulih-diskon HASH_KANDIDAT',
          explanation:
            'Branch baru menunjuk B. Working tree main tidak perlu ditimpa untuk mempertahankan jalur itu.',
          graph: graph(
            [n('A', 140, 110), n('B', 460, 110, ['A'])],
            [ref('main / HEAD', 'A'), ref('pulih-diskon', 'B')],
          ),
        },
      ],
    },
  };

  function forLesson(lesson) {
    if (lesson.id === 'fast-forward') return 'merge-ff';
    if (lesson.id === 'merge') return 'merge';
    if (['branch', 'kelola-branch'].includes(lesson.id)) return 'branch';
    if (['amend-rebase', 'rebase-dasar'].includes(lesson.id)) return 'rebase';
    if (['reset-revert', 'reset-modes'].includes(lesson.id)) return 'reset';
    if (lesson.visual === 'remote') return 'remote';
    if (lesson.visual === 'recovery') return 'recovery';
    return null;
  }

  const api = { scenarios, forLesson };
  root.GitGuidesVisuals = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
