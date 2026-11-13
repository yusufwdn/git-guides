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
        title: 'Referensi fitur sudah dihapus',
        command: 'git log --oneline --all',
        explanation:
          'Main masih A. B tidak punya branch pada contoh ini, tetapi object-nya masih ada dan jejak HEAD dapat membantu menemukannya.',
        graph: graph([n('A', 140, 110), n('B', 460, 110, ['A'], true)], [ref('main / HEAD', 'A')]),
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

const areas = (title, description, frames) => ({ title, description, frames });
Object.assign(scenarios, {
  'partial-staging': areas(
    'Dua hunk, satu tujuan commit.',
    'File checkout.js mempunyai perubahan perhitungan dan pesan yang terpisah.',
    [
      {
        title: 'Dua edit',
        command: 'git diff -- checkout.js',
        explanation:
          'Working tree memuat validasi jumlah dan pesan baru. Index masih sama dengan HEAD.',
        areas: [
          ['HEAD', 'harga × jumlah; pesan Terima kasih'],
          ['Index', 'harga × jumlah; pesan Terima kasih'],
          ['Working tree', 'harga × Math.max(0, jumlah); pesan Pesanan diterima'],
        ],
      },
      {
        title: 'Pilih satu hunk',
        command: 'git add -p checkout.js',
        explanation:
          'Pilih y untuk validasi jumlah, n untuk pesan. Hanya patch perhitungan disalin ke index.',
        areas: [
          ['HEAD', 'Perhitungan lama; pesan lama'],
          ['Index', 'Validasi jumlah; pesan Terima kasih'],
          ['Working tree', 'Validasi jumlah; pesan Pesanan diterima'],
        ],
      },
      {
        title: 'Commit terarah',
        command: 'git commit -m "Validasi jumlah checkout"\ngit diff',
        explanation:
          'HEAD mengikuti index: validasi jumlah direkam. Perubahan pesan tetap berada di working tree dan belum di-commit.',
        areas: [
          ['HEAD baru', 'Validasi jumlah; pesan Terima kasih'],
          ['Index', 'Sama dengan HEAD baru'],
          ['Working tree', 'Pesan Pesanan diterima masih unstaged'],
        ],
      },
    ],
  ),
  bisect: areas(
    'Persempit lokasi awal bug.',
    'Good dan bad berasal dari pengujian yang dapat diulang, bukan perkiraan.',
    [
      {
        title: 'Tentukan batas',
        command: 'git bisect start\ngit bisect bad\ngit bisect good awal',
        explanation:
          'Versi awal sudah diuji baik; HEAD diuji buruk. Git memilih kandidat di antara dua batas tersebut.',
        areas: [
          ['Batas baik', 'A · diskon tidak negatif'],
          ['Kandidat', 'B C D E F'],
          ['Batas buruk', 'G · diskon negatif'],
        ],
      },
      {
        title: 'Uji kandidat',
        command: 'git show HEAD:diskon.js\ngit bisect bad',
        explanation:
          'Contoh: kandidat D terbukti buruk. Git mempersempit pencarian ke perubahan setelah A sampai D.',
        areas: [
          ['Tetap baik', 'A'],
          ['Masih mungkin', 'B C D'],
          ['Tidak perlu diuji lagi', 'E F G untuk mencari awal bug'],
        ],
      },
      {
        title: 'Catat temuan',
        command: 'git branch bug-ditemukan HASH_BURUK_PERTAMA\ngit bisect reset',
        explanation:
          'Catat hash yang diumumkan Git sebagai bad pertama. HEAD saat pengumuman belum tentu hash itu. Tutup proses bisect setelah menyimpan temuan.',
        areas: [
          ['Hasil diagnosis', 'Commit C pertama yang buruk pada contoh'],
          ['Branch temuan', 'bug-ditemukan → C'],
          ['Selesai', 'Kembali ke branch sebelum bisect'],
        ],
      },
    ],
  ),
  'cherry-pick': areas(
    'Satu patch dipilih dari jalur lain.',
    'Eksperimen harga dan perbaikan checkout berada pada commit yang berbeda.',
    [
      {
        title: 'Pilih sumber',
        command: 'git log --oneline fitur-eksperimen\ngit show HASH_PERBAIKAN',
        explanation:
          'Commit sumber memperbaiki checkout. Commit eksperimen harga sebelumnya tidak diminta pada branch rilis.',
        areas: [
          ['Sumber', 'A → eksperimen harga → perbaikan checkout'],
          ['Penerima', 'rilis → A'],
          ['Yang dipilih', 'Patch perbaikan checkout'],
        ],
      },
      {
        title: 'Terapkan patch',
        command: 'git switch rilis\ngit cherry-pick HASH_PERBAIKAN',
        explanation:
          'Git menerapkan perubahan commit sumber pada parent rilis dan membuat commit hasil yang baru.',
        areas: [
          ['Sumber tetap', 'Jalur eksperimen tidak berpindah'],
          ['Rilis', 'A → perbaikan baru'],
          ['Menu rilis', 'Tetap 18000'],
        ],
      },
      {
        title: 'Buktikan isi',
        command: 'git show HEAD:checkout.js\ngit show HEAD:menu.json',
        explanation:
          'Rilis mempunyai validasi Math.max, sedangkan harga eksperimen tidak ikut. Identitas commit hasil dapat berbeda dari sumbernya.',
        areas: [
          ['Checkout rilis', 'Validasi jumlah tersedia'],
          ['Menu rilis', 'Eksperimen harga tidak ikut'],
          ['Riwayat', 'Commit sumber tetap di jalur semula'],
        ],
      },
    ],
  ),
  worktree: areas(
    'Satu repository, dua ruang kerja.',
    'Linked worktree berbagi penyimpanan object dan refs, dengan index serta HEAD masing-masing.',
    [
      {
        title: 'Folder utama',
        command: 'git worktree list',
        explanation: 'Mulai dari main yang bersih dengan menu harga 18000.',
        areas: [
          ['kopi-kita', 'HEAD → main; menu 18000'],
          ['Index utama', 'Menu 18000'],
          ['Object bersama', 'Commit awal A'],
        ],
      },
      {
        title: 'Folder hotfix',
        command: 'git worktree add -b hotfix ../kopi-kita-hotfix awal',
        explanation:
          'Folder saudara baru memakai branch hotfix. Membuat worktree belum membuat commit hotfix.',
        areas: [
          ['kopi-kita', 'main → A'],
          ['kopi-kita-hotfix', 'hotfix → A; index terpisah'],
          ['Object bersama', 'A dipakai kedua worktree'],
        ],
      },
      {
        title: 'Commit di hotfix',
        command:
          'git -C ../kopi-kita-hotfix add menu.json\ngit -C ../kopi-kita-hotfix commit -m "Hotfix harga"',
        explanation:
          'Setelah menu di folder hotfix diedit menjadi 22000, commit memajukan hotfix. Main dan file kerja pada folder utama tetap 18000.',
        areas: [
          ['Folder utama', 'main → A; menu 18000'],
          ['Folder hotfix', 'hotfix → B; menu 22000'],
          ['Object bersama', 'A dan B dapat dibaca dari kedua folder'],
        ],
      },
    ],
  ),
  tag: areas('Tag tetap, branch dapat maju.', 'Contoh annotated tag menunjuk commit rilis A.', [
    {
      title: 'Tandai rilis',
      command: 'git tag -a v1.0.0 awal -m "Rilis pertama"',
      explanation:
        'Annotated tag menyimpan metadata tag dan menunjuk commit awal. Penunjuk rilis tidak mengikuti setiap commit main.',
      areas: [
        ['main', 'A'],
        ['v1.0.0', 'Object tag → A'],
        ['Working tree', 'Snapshot A'],
      ],
    },
    {
      title: 'Main berkembang',
      command: 'git add README.md\ngit commit -m "Perbarui panduan"',
      explanation:
        'Setelah README diedit dan di-commit, main maju ke B. Tag v1.0.0 tetap memilih A.',
      areas: [
        ['main', 'B dengan parent A'],
        ['v1.0.0', 'Tetap memilih A'],
        ['Rilis berikutnya', 'Perlu tag baru yang dipilih sendiri'],
      ],
    },
  ]),
  'force-lease': areas(
    'Lease memeriksa posisi remote yang diharapkan.',
    'Gunakan hanya ketika penulisan ulang branch sudah disepakati dengan tim.',
    [
      {
        title: 'Posisi yang diketahui',
        command: 'git fetch origin\ngit log --graph --oneline --all',
        explanation:
          'Misalkan branch remote tercatat di R. Kamu meninjau pekerjaan bersama sebelum menulis ulang commit lokal.',
        areas: [
          ['Remote diketahui', 'R'],
          ['Lokal setelah rebase', 'L′'],
          ['Yang harus disepakati', 'Riwayat branch ini boleh ditulis ulang'],
        ],
      },
      {
        title: 'Remote berubah',
        command: 'git push --force-with-lease origin fitur',
        explanation:
          'Jika lease mengharapkan R tetapi server sudah di S, push ditolak. Ini melindungi dari perubahan remote yang tidak sesuai ekspektasi lease.',
        areas: [
          ['Ekspektasi lease', 'R'],
          ['Posisi server', 'S dari rekan'],
          ['Hasil', 'Ditolak; tinjau S dan koordinasikan'],
        ],
      },
      {
        title: 'Periksa ulang',
        command: 'git fetch origin\ngit log --oneline --all --graph',
        explanation:
          'Fetch dapat memperbarui ref yang menjadi acuan lease default. Jangan menganggap lease sebagai audit otomatis terhadap pekerjaan rekan yang sekarang tercatat.',
        areas: [
          ['Catatan lokal', 'Sekarang mengetahui S'],
          ['Tanggung jawab', 'Tinjau isi dan sepakati integrasi'],
          ['Lease', 'Pemeriksaan posisi, bukan jaminan kualitas'],
        ],
      },
    ],
  ),
  submodule: areas(
    'Repo tema dan pilihan versi proyek.',
    'Superproject menyimpan gitlink, sedangkan repo tema menyimpan file dan commit-nya.',
    [
      {
        title: 'Tema awal',
        command: 'git submodule status',
        explanation:
          'Superproject memilih T1. Sumber tema lokal mempunyai T2 yang belum dipilih oleh proyek.',
        areas: [
          ['Superproject', 'Gitlink tema → T1'],
          ['Folder tema', 'HEAD → T1'],
          ['Sumber tema', 'main → T2'],
        ],
      },
      {
        title: 'Pilih versi baru',
        command: 'git -C tema fetch origin\ngit -C tema switch --detach origin/main',
        explanation:
          'Folder submodule sekarang memakai T2, sementara commit superproject masih memilih T1. Detached HEAD di sini merupakan checkout versi yang dipilih.',
        areas: [
          ['Superproject HEAD', 'Masih T1'],
          ['Folder tema', 'Sekarang T2'],
          ['Perubahan lokal', 'Gitlink belum direkam pada superproject'],
        ],
      },
      {
        title: 'Rekam pilihan',
        command: 'git add tema\ngit commit -m "Pilih tema orange"',
        explanation:
          'Commit superproject yang baru memilih T2. Tim membutuhkan commit tema T2 yang dapat diakses dan commit superproject tersebut.',
        areas: [
          ['Superproject baru', 'Gitlink → T2'],
          ['Repo tema', 'Tetap menyimpan commit T2'],
          ['Dua repository', 'Isi tema dan pilihan versinya dicatat terpisah'],
        ],
      },
    ],
  ),
  'git-lfs': areas(
    'Pointer Git dan object LFS saling melengkapi.',
    'Praktik ini membutuhkan ekstensi Git LFS dan server yang mendukungnya.',
    [
      {
        title: 'Aturan pola',
        command: 'git lfs track "*.psd"\ngit diff -- .gitattributes',
        explanation:
          'Track menuliskan aturan pola pada .gitattributes. File lama tidak otomatis dipindahkan dari seluruh riwayat.',
        areas: [
          ['.gitattributes', 'Pola *.psd memakai filter LFS'],
          ['Git', 'Menyimpan pointer untuk file yang diproses'],
          ['LFS', 'Menyimpan isi file besar'],
        ],
      },
      {
        title: 'Saat mengambil',
        command: 'git lfs ls-files',
        explanation:
          'Rekan membutuhkan pointer dari snapshot Git dan object LFS yang dapat diunduh. Pointer saja tidak memberikan isi PSD asli.',
        areas: [
          ['Snapshot', 'Pointer dengan identitas object'],
          ['Server LFS', 'Object isi PSD'],
          ['Working tree', 'Isi asli setelah object tersedia'],
        ],
      },
    ],
  ),
  signing: areas(
    'Data, tanda tangan, dan kepercayaan kunci.',
    'Signature memeriksa hubungan data dan kunci sesuai mekanisme signing.',
    [
      {
        title: 'Tag ditandatangani',
        command: 'git config --get gpg.format\ngit config --get user.signingkey',
        explanation:
          'Praktik memerlukan mekanisme signing yang disiapkan sendiri. Metadata author saja tidak membuktikan kepemilikan kunci.',
        areas: [
          ['Data', 'Commit atau tag yang dipilih'],
          ['Penandatangan', 'Kunci privat tetap di perangkat pemilik'],
          ['Hasil', 'Data beserta signature'],
        ],
      },
      {
        title: 'Verifikasi',
        command: 'git tag -v NAMA_TAG_SIGNED',
        explanation:
          'Verifikasi memerlukan kunci publik dan kebijakan kepercayaan yang sesuai. Signature valid tidak membuktikan kode bebas bug.',
        areas: [
          ['Yang diperiksa', 'Hubungan data dan kunci'],
          ['Yang masih dinilai', 'Kepercayaan pada identitas kunci'],
          ['Kualitas kode', 'Tetap memerlukan review dan pengujian'],
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
  if (['amend-rebase', 'rebase-dasar'].includes(lesson.id)) return 'rebase';
  if (['reset-revert', 'reset-modes'].includes(lesson.id)) return 'reset';
  if (lesson.visual === 'remote') return 'remote';
  if (lesson.visual === 'recovery') return 'recovery';
  return null;
}

export default { scenarios, forLesson };
