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
        explanation: 'Branch baru menunjuk A yang sama. Membuat branch belum membuat commit baru.',
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
        command: 'git add jam-buka.txt\ngit commit -m "Tambah jam buka"',
        explanation:
          'Setelah jam-buka.txt dibuat, commit C baru ada di main lokal. Server dan origin/main masih B.',
        repos: [
          { title: 'Laptopmu', ...local('C', 'B', true) },
          { title: 'Server lokal', ...server('B') },
        ],
      },
      {
        title: 'Kirim ke server',
        command: 'git push origin main',
        explanation:
          'Server menerima C, dan catatan origin/main ikut menjadi C setelah push berhasil. Kalau server sudah punya commit lain, push ini ditolak.',
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
    description: 'Contoh pemulihan commit yang masih tersedia. Bukan jaminan pemulihan semua data.',
    frames: [
      {
        title: 'Commit tertinggal setelah reset',
        command: 'git reset --hard HEAD~1\ngit log --oneline -2',
        explanation:
          'Main mundur ke A. Commit B (teh tarik) tidak punya branch lagi, tetapi object-nya masih ada dan jejak HEAD dapat membantu menemukannya.',
        graph: graph([n('A', 140, 110), n('B', 460, 110, ['A'], true)], [ref('main / HEAD', 'A')]),
      },
      {
        title: 'Periksa jejak dan isi',
        command: 'git reflog -3\ngit show HASH',
        explanation:
          'Temukan hash B dari jejak lokal lalu baca isinya. Jangan menganggap entri nomor tertentu selalu benar.',
        graph: graph(
          [n('A', 140, 110), n('B', 460, 110, ['A'])],
          [ref('main / HEAD', 'A'), ref('kandidat yang diperiksa', 'B')],
        ),
      },
      {
        title: 'Pertahankan melalui branch',
        command: 'git branch pulih-teh-tarik HASH',
        explanation:
          'Branch baru menunjuk B, jadi commit itu aman. Setelah itu main bisa dimajukan ke B dengan merge --ff-only.',
        graph: graph(
          [n('A', 140, 110), n('B', 460, 110, ['A'])],
          [ref('main / HEAD', 'A'), ref('pulih-teh-tarik', 'B')],
        ),
      },
    ],
  },
};

const areas = (title, description, frames) => ({ title, description, frames });
Object.assign(scenarios, {
  'partial-staging': areas(
    'Dua hunk, satu tujuan commit.',
    'diskon.js berisi keputusan diskon 12 dan percobaan diskon member 7 yang belum disetujui.',
    [
      {
        title: 'Dua edit',
        command: 'git diff -- diskon.js',
        explanation:
          'Working tree memuat dua perubahan dengan tujuan berbeda. Index masih sama dengan HEAD.',
        areas: [
          ['HEAD', 'diskon 15; diskonMember 5'],
          ['Index', 'diskon 15; diskonMember 5'],
          ['Working tree', 'diskon 12; diskonMember 7'],
        ],
      },
      {
        title: 'Pilih satu hunk',
        command: 'git add -p diskon.js',
        explanation:
          'Jawab s untuk memecah hunk, y untuk baris diskon, dan n untuk baris diskonMember. Hanya perubahan diskon yang masuk index.',
        areas: [
          ['HEAD', 'diskon 15; diskonMember 5'],
          ['Index', 'diskon 12; diskonMember 5'],
          ['Working tree', 'diskon 12; diskonMember 7'],
        ],
      },
      {
        title: 'Commit terarah',
        command: 'git commit -m "Turunkan diskon jadi 12 persen"\ngit diff',
        explanation:
          'HEAD mengikuti index: diskon 12 direkam. Percobaan diskonMember 7 tetap di working tree dan belum di-commit.',
        areas: [
          ['HEAD baru', 'diskon 12; diskonMember 5'],
          ['Index', 'Sama dengan HEAD baru'],
          ['Working tree', 'diskonMember 7 masih belum di-add'],
        ],
      },
    ],
  ),
  bisect: areas(
    'Persempit lokasi perubahan diskon.',
    'Good berarti diskon.js masih berisi diskon 10. Bad berarti nilainya sudah lain.',
    [
      {
        title: 'Tentukan batas',
        command: 'git bisect start\ngit bisect bad\ngit bisect good HASH',
        explanation:
          'Atur diskon 10 persen sudah pasti baik, dan HEAD sudah pasti buruk. Git memilih kandidat di tengah kedua batas.',
        areas: [
          ['Batas baik', 'Atur diskon 10 persen'],
          ['Kandidat', 'Commit di antara kedua batas'],
          ['Batas buruk', 'HEAD · diskon 15'],
        ],
      },
      {
        title: 'Nilai kandidat',
        command: 'git bisect bad',
        explanation:
          'Kandidat pertama, Naikkan diskon jadi 20 persen, berisi diskon 20. Commit itu buruk, jadi commit sesudahnya nggak perlu diuji lagi.',
        areas: [
          ['Tetap baik', 'Atur diskon 10 persen'],
          ['Masih mungkin', 'Commit sebelum Naikkan diskon jadi 20 persen'],
          ['Tidak perlu diuji lagi', 'Naikkan diskon jadi 20 persen dan sesudahnya'],
        ],
      },
      {
        title: 'Catat temuan',
        command: 'git bisect reset',
        explanation:
          'Git mengumumkan Diskon akhir pekan 15 persen sebagai commit buruk pertama. Catat hash-nya, lalu tutup bisect supaya kembali ke main.',
        areas: [
          ['Hasil', 'Diskon akhir pekan 15 persen'],
          ['Perubahan', 'Diskon 10 diganti 15'],
          ['Selesai', 'Kembali ke main'],
        ],
      },
    ],
  ),
  'cherry-pick': areas(
    'Satu commit dipilih dari jalur lain.',
    'diskon-member berisi fitur member dan keputusan diskon 15. main cuma butuh yang kedua.',
    [
      {
        title: 'Pilih sumber',
        command: 'git log --oneline main..diskon-member',
        explanation:
          'Turunkan diskon jadi 15 persen dibutuhkan sekarang. Tambah diskon member belum siap dirilis.',
        areas: [
          ['Sumber', 'diskon-member: fitur member → diskon 15'],
          ['Penerima', 'main'],
          ['Yang dipilih', 'Turunkan diskon jadi 15 persen'],
        ],
      },
      {
        title: 'Terapkan perubahan',
        command: 'git switch main\ngit cherry-pick HASH',
        explanation:
          'Git menerapkan perubahan commit itu di atas main dan membuat commit baru dengan pesan yang sama.',
        areas: [
          ['Sumber tetap', 'diskon-member nggak berubah'],
          ['main', 'Commit baru: diskon 15'],
          ['Fitur member', 'Nggak ikut'],
        ],
      },
      {
        title: 'Buktikan isi',
        command: 'git show HEAD:diskon.js',
        explanation:
          'diskon.js di main berisi diskon 15 tanpa baris diskonMember. Hash commit baru berbeda dari sumbernya karena parent-nya berbeda.',
        areas: [
          ['diskon.js di main', 'const diskon = 15;'],
          ['diskonMember', 'Nggak ada di main'],
          ['Riwayat', 'Commit sumber tetap di diskon-member'],
        ],
      },
    ],
  ),
  worktree: areas(
    'Satu repository, dua ruang kerja.',
    'Linked worktree berbagi penyimpanan object dan refs, dengan index serta HEAD masing-masing.',
    [
      {
        title: 'Folder utama sedang dipakai',
        command: 'git status --short',
        explanation:
          'main di kopi-kita masih berisi percobaan diskonMember 7 yang belum di-commit.',
        areas: [
          ['kopi-kita', 'HEAD → main; diskon.js sedang diedit'],
          ['Index utama', 'Milik folder kopi-kita'],
          ['Object bersama', 'Commit A di ujung main'],
        ],
      },
      {
        title: 'Folder kedua',
        command: 'git worktree add -b perbaiki-jam ../kopi-kita-jam main',
        explanation:
          'Folder saudara baru memakai branch perbaiki-jam dari commit A. Editan diskon.js di folder utama nggak ikut terbawa.',
        areas: [
          ['kopi-kita', 'main → A; diskon.js tetap diedit'],
          ['kopi-kita-jam', 'perbaiki-jam → A; index terpisah'],
          ['Object bersama', 'A dipakai kedua worktree'],
        ],
      },
      {
        title: 'Commit di folder kedua',
        command: 'git add jam-buka.txt\ngit commit -m "Tambah jam buka hari Minggu"',
        explanation:
          'Commit dari kopi-kita-jam memajukan perbaiki-jam ke B. main dan editan di folder utama nggak berubah.',
        areas: [
          ['Folder utama', 'main → A; diskon.js tetap diedit'],
          ['Folder kedua', 'perbaiki-jam → B'],
          ['Object bersama', 'A dan B bisa dibaca dari kedua folder'],
        ],
      },
    ],
  ),
  tag: areas('Tag tetap, branch dapat maju.', 'Annotated tag v1.0.0 menunjuk commit rilis A.', [
    {
      title: 'Tandai rilis',
      command: 'git tag -a v1.0.0 -m "Rilis pertama menu Kopi Kita"',
      explanation:
        'Annotated tag menyimpan nama pembuat, tanggal, dan pesan, lalu menunjuk commit yang sedang aktif. Tag nggak ikut bergerak saat main maju.',
      areas: [
        ['main', 'A'],
        ['v1.0.0', 'Object tag → A'],
        ['Working tree', 'Snapshot A'],
      ],
    },
    {
      title: 'Main berkembang',
      command: 'git merge --no-edit diskon-member',
      explanation:
        'Setelah diskon-member digabung, main maju ke B. Tag v1.0.0 tetap menunjuk A, jadi isi rilis pertama selalu bisa dibuka lagi.',
      areas: [
        ['main', 'B, keturunan A'],
        ['v1.0.0', 'Tetap menunjuk A'],
        ['Rilis berikutnya', 'Butuh tag baru, misalnya v1.1.0'],
      ],
    },
  ]),
  'force-lease': areas(
    'Lease memeriksa posisi remote yang diharapkan.',
    'Gunakan hanya ketika penulisan ulang branch sudah disepakati dengan tim.',
    [
      {
        title: 'Posisi yang diketahui',
        command: 'git commit --amend -m "Tambah singkong goreng"',
        explanation:
          'origin/menu-sore mencatat R, commit yang terakhir kamu push. Amend membuat L′ yang bukan lanjutan R.',
        areas: [
          ['Catatan origin/menu-sore', 'R'],
          ['Lokal setelah amend', 'L′'],
          ['Yang harus disepakati', 'Branch ini boleh ditulis ulang'],
        ],
      },
      {
        title: 'Remote berubah',
        command: 'git push --force-with-lease',
        explanation:
          'Lease mengharapkan server masih di R, tetapi Rani sudah menambah S (kopi tubruk). Push ditolak dengan stale info.',
        areas: [
          ['Ekspektasi lease', 'R'],
          ['Posisi server', 'S dari Rani'],
          ['Hasil', 'Ditolak; commit Rani aman'],
        ],
      },
      {
        title: 'Periksa ulang',
        command: 'git fetch origin\ngit log --oneline --graph -4 menu-sore origin/menu-sore',
        explanation:
          'Fetch memperbarui catatan menjadi S. Setelah itu lease akan lolos lagi, jadi tinjau commit Rani dulu sebelum memutuskan menimpa atau mengikuti server.',
        areas: [
          ['Catatan lokal', 'Sekarang mengetahui S'],
          ['Tanggung jawab', 'Tinjau isi dan sepakati integrasi'],
          ['Lease', 'Pemeriksaan posisi, bukan jaminan kualitas'],
        ],
      },
    ],
  ),
  submodule: areas(
    'Repo desain dan pilihan versinya.',
    'kopi-kita menyimpan gitlink ke satu commit, sedangkan kopi-kita-desain menyimpan file dan riwayatnya sendiri.',
    [
      {
        title: 'Desain awal',
        command: 'git submodule status',
        explanation:
          'kopi-kita memilih D1. Repo kopi-kita-desain lalu mendapat D2 yang belum dipilih kopi-kita.',
        areas: [
          ['kopi-kita', 'Gitlink desain → D1'],
          ['Folder desain', 'HEAD → D1'],
          ['kopi-kita-desain', 'main → D2'],
        ],
      },
      {
        title: 'Ambil versi baru',
        command: 'cd desain\ngit pull',
        explanation:
          'Folder desain sekarang memakai D2, tapi commit kopi-kita masih memilih D1. git status di kopi-kita menampilkan M desain.',
        areas: [
          ['kopi-kita HEAD', 'Masih D1'],
          ['Folder desain', 'Sekarang D2'],
          ['Perubahan lokal', 'Gitlink belum di-commit'],
        ],
      },
      {
        title: 'Rekam pilihan',
        command: 'git add desain\ngit commit -m "Perbarui submodule desain"',
        explanation:
          'Commit baru di kopi-kita memilih D2. Rekan butuh commit kopi-kita ini dan akses ke commit D2 di repo desain.',
        areas: [
          ['kopi-kita baru', 'Gitlink → D2'],
          ['Repo desain', 'Tetap menyimpan D2'],
          ['Dua repository', 'Isi desain dan pilihan versinya dicatat terpisah'],
        ],
      },
    ],
  ),
  'git-lfs': areas(
    'Pointer Git dan object LFS saling melengkapi.',
    'Praktik ini membutuhkan Git LFS. Git for Windows sudah menyertakannya.',
    [
      {
        title: 'Aturan pola',
        command: 'git lfs track "*.psd"\ngit add .gitattributes',
        explanation:
          'Track menuliskan aturan pola di .gitattributes. File yang sudah ada di riwayat nggak otomatis dipindahkan.',
        areas: [
          ['.gitattributes', 'Pola *.psd memakai filter LFS'],
          ['Git', 'Menyimpan pointer untuk file yang cocok'],
          ['LFS', 'Menyimpan isi file besar'],
        ],
      },
      {
        title: 'Commit file besar',
        command: 'git add logo.psd\ngit commit -m "Tambah logo kedai"\ngit lfs ls-files',
        explanation:
          'Snapshot Git berisi pointer kecil. Isi logo.psd disimpan sebagai object LFS dan ikut terkirim saat push.',
        areas: [
          ['Snapshot', 'Pointer: oid sha256 dan ukuran'],
          ['Penyimpanan LFS', 'Isi logo.psd'],
          ['Working tree', 'Isi asli logo.psd'],
        ],
      },
    ],
  ),
  signing: areas(
    'Data, tanda tangan, dan kepercayaan kunci.',
    'Signature memeriksa hubungan data dan kunci sesuai mekanisme signing.',
    [
      {
        title: 'Tag tanpa tanda tangan',
        command: 'git tag -v v1.0.0',
        explanation:
          'v1.0.0 dibuat tanpa tanda tangan, jadi Git menampilkan isi tag lalu berhenti dengan error: no signature found. Nama tagger saja nggak membuktikan siapa pembuatnya.',
        areas: [
          ['Data', 'Tag v1.0.0'],
          ['Tanda tangan', 'Nggak ada'],
          ['Hasil', 'error: no signature found'],
        ],
      },
      {
        title: 'Verifikasi tag bertanda tangan',
        command: 'git tag -v NAMA_TAG',
        explanation:
          'Tag yang dibuat dengan git tag -s bisa diverifikasi dengan kunci publik pembuatnya. Signature valid nggak membuktikan kodenya bebas bug.',
        areas: [
          ['Yang diperiksa', 'Hubungan data dan kunci'],
          ['Yang masih dinilai', 'Kepercayaan pada pemilik kunci'],
          ['Kualitas kode', 'Tetap perlu review dan pengujian'],
        ],
      },
    ],
  ),
});

function forLesson(lesson) {
  const specific = {
    'partial-staging': 'partial-staging',
    bisect: 'bisect',
    'bisect-run': 'bisect',
    'cherry-pick': 'cherry-pick',
    worktree: 'worktree',
    tag: 'tag',
    'catatan-rilis': 'tag',
    'force-lease': 'force-lease',
    submodule: 'submodule',
    'git-lfs': 'git-lfs',
    signing: 'signing',
  };
  if (specific[lesson.id]) return specific[lesson.id];
  if (lesson.id === 'fast-forward') return 'merge-ff';
  if (lesson.id === 'merge') return 'merge';
  if (['branch', 'kelola-branch'].includes(lesson.id)) return 'branch';
  if (lesson.id === 'rebase-dasar') return 'rebase';
  if (lesson.id === 'reset-modes') return 'reset';
  if (lesson.visual === 'remote') return 'remote';
  if (lesson.visual === 'recovery') return 'recovery';
  return null;
}

export default { scenarios, forLesson };
