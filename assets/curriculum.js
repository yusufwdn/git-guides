(function (root) {
  'use strict';
  const additions = [];

  function add(
    chapter,
    id,
    title,
    summary,
    scenario,
    concept,
    analogy,
    steps,
    result,
    pitfall,
    practice,
    quiz,
    commands,
    visual = 'snapshot',
  ) {
    additions.push({
      chapter,
      id,
      title,
      summary,
      scenario,
      concept,
      analogy,
      steps: steps.map(([title, command, explanation]) => ({ title, command, explanation })),
      result,
      pitfall,
      practice,
      quiz: { question: quiz[0], options: quiz[1], answer: quiz[2], explanation: quiz[3] },
      commands,
      visual,
      minutes: steps.length * 2 + 3,
      level: chapter < 5 ? 'Dasar' : chapter < 13 ? 'Menengah' : 'Lanjutan',
    });
  }

  add(
    1,
    'snapshot',
    'Yang direkam adalah keadaan proyek.',
    'Bedakan snapshot, patch, dan file yang belum direkam.',
    'Menu kembali ke harga lama setelah pindah branch. Kamu khawatir file terbaru hilang, padahal kedua versi sudah di-commit.',
    'Snapshot menjelaskan keadaan file tracked pada commit. Patch menjelaskan perbedaannya terhadap keadaan lain. Git dapat berbagi object yang sama antarsnapshot, sehingga snapshot tidak berarti menyalin folder penuh secara fisik setiap kali commit.',
    'Dua daftar menu bisa memakai foto kopi yang sama. Edisinya berbeda, tetapi bahan yang tidak berubah tidak perlu dibuat ulang.',
    [
      [
        'Baca isi tanpa pindah branch',
        'git show HEAD:menu.json',
        'Bentuk COMMIT:path mengambil file dari snapshot. Editor dan working tree tidak berubah.',
      ],
      [
        'Bandingkan dengan index',
        'git diff --staged -- menu.json',
        'Patch ini menjelaskan beda index terhadap HEAD, bukan seluruh isi snapshot.',
      ],
    ],
    'Kamu dapat membaca versi tersimpan tanpa menimpa file yang sedang dikerjakan.',
    'File baru yang untracked belum ada pada HEAD. git show HEAD:file-baru akan gagal sampai file masuk commit.',
    'Di latihan staging, bandingkan show HEAD:menu.json, file editor, dan diff. Jelaskan tiga bentuk informasi itu.',
    [
      'git show HEAD:menu.json mengubah working tree?',
      ['Tidak, hanya membaca snapshot', 'Ya, selalu menimpa editor', 'Hanya jika memakai Windows'],
      0,
      'Membaca object berbeda dari checkout atau restore yang memperbarui file.',
    ],
    ['git show', 'git diff'],
  );

  add(
    1,
    'git-terdistribusi',
    'Riwayat ada di laptopmu juga.',
    'Pahami kemampuan lokal dan batas salinan repository.',
    'Wi-Fi toko mati, tetapi kamu masih harus membuat branch dan merekam perbaikan sebelum pulang.',
    'Commit, branch, log, dan sebagian besar diff berjalan lokal. Clone biasa membawa riwayat yang dapat dijangkau melalui referensi yang diambil. Shallow clone dan partial clone dapat membatasi data awal; jangan menyamakan setiap clone dengan backup lengkap semua data server.',
    'Setiap penulis punya salinan buku kerja. Pertukaran halaman membutuhkan koneksi, tetapi menulis di salinan sendiri tidak.',
    [
      [
        'Lihat branch lokal',
        'git branch --list',
        'Tanda bintang menunjukkan branch aktif. Belum ada komunikasi jaringan.',
      ],
      [
        'Baca riwayat lokal',
        'git log --oneline -5',
        'Commit yang sudah tersedia dapat dibaca tanpa server.',
      ],
    ],
    'Kamu tahu operasi mana yang tetap bisa dilakukan offline dan mana yang perlu menghubungi remote.',
    'PR, issue, secrets server, dan aturan akses layanan hosting bukan bagian dari riwayat Git yang otomatis ikut clone.',
    'Matikan koneksi bila nyaman, lalu jalankan status, log, dan buat branch latihan. Jelaskan mengapa push ke server internet berbeda.',
    [
      'Apa yang biasanya tidak ikut dalam clone Git?',
      [
        'Riwayat commit yang diambil',
        'Issue dan pengaturan akun layanan hosting',
        'Object file yang dibutuhkan snapshot',
      ],
      1,
      'Layanan hosting menyimpan data tambahan di luar object dan refs Git.',
    ],
    ['git branch', 'git log'],
    'graph',
  );

  add(
    2,
    'terminal-folder',
    'Pastikan sedang bekerja di folder yang benar.',
    'Kenali lokasi terminal, root repository, dan path relatif.',
    'Kamu menjalankan add di folder proyek lain dan bingung mengapa file menu tidak ditemukan.',
    'Command Git memakai direktori kerja terminal sebagai konteks. Path relatif dimulai dari lokasi itu. git -C PATH menjalankan operasi dari path tertentu tanpa memindahkan terminal. Kutip path yang mengandung spasi.',
    'Alamat pengiriman yang tepat sama pentingnya dengan isi paket. Perintah yang benar di alamat berbeda tetap bisa memberi hasil yang keliru.',
    [
      [
        'Temukan root repository',
        'git rev-parse --show-toplevel',
        'Hasilnya path absolut root repo. Di luar repo, Git akan memberi pesan bukan repository.',
      ],
      [
        'Periksa folder melalui -C',
        'git -C "kopi-kita" status',
        'Contoh ini dijalankan dari folder induk yang memiliki subfolder kopi-kita. Sesuaikan dengan lokasi sebenarnya.',
      ],
    ],
    'Kamu dapat menyebut repo yang akan terkena operasi sebelum menjalankan command yang mengubah keadaan.',
    'Prompt terminal dan folder editor tidak selalu menunjuk lokasi yang sama. Periksa root sebelum restore, reset, atau clean.',
    'Buka terminal pada repo latihan, lalu satu tingkat di atasnya. Bandingkan status biasa dengan git -C "kopi-kita" status.',
    [
      'Apa fungsi git -C PATH?',
      [
        'Menjalankan Git dengan konteks folder PATH',
        'Membuat commit otomatis',
        'Mengubah seluruh konfigurasi global',
      ],
      0,
      '-C memilih konteks direktori untuk proses tersebut.',
    ],
    ['git rev-parse', 'git -C'],
  );

  add(
    2,
    'autentikasi',
    'Identitas commit berbeda dari izin server.',
    'Bedakan user.name, credential helper, HTTPS, dan SSH.',
    'Nama author sudah benar, tetapi push ke server kantor tetap ditolak. Kamu mengira mengganti user.email akan memberi akses.',
    'Identitas author adalah metadata commit. Autentikasi membuktikan akun yang mengakses server; otorisasi menentukan izin akun itu. HTTPS dapat memakai credential helper dan mekanisme login/token layanan. SSH memakai pasangan kunci dan kebijakan server. Ikuti petunjuk penyedia tanpa memasukkan token ke URL yang dibagikan.',
    'Nama di dokumen tidak sama dengan kartu akses gedung. Mengganti nama penulis tidak membuka pintu server.',
    [
      [
        'Periksa alamat remote',
        'git remote get-url origin',
        'Kenali apakah protokolnya HTTPS, SSH, atau path lokal. Jangan membagikan URL jika telanjur berisi kredensial.',
      ],
      [
        'Lihat helper yang dikonfigurasi',
        'git config --get-all credential.helper',
        'Output dapat kosong. Pengaturan helper berbeda antar sistem; jangan menyalin konfigurasi acak tanpa mengetahui alat yang tersedia.',
      ],
    ],
    'Kamu dapat membedakan error identitas, koneksi, autentikasi, dan izin branch.',
    'Jangan pernah mengunggah private key atau menaruh token dalam commit. Latihan remote pada panduan ini memakai path lokal sehingga tidak memerlukan token.',
    'Pada latihan remote, temukan URL origin. Jelaskan mengapa server lokal dapat diakses tanpa login GitHub.',
    [
      'Mengubah user.name memperbaiki izin push?',
      [
        'Tidak, izin server adalah urusan terpisah',
        'Ya, asal memakai nama admin',
        'Ya, setelah commit baru',
      ],
      0,
      'Author commit tidak memberikan hak akses ke remote.',
    ],
    ['git remote get-url', 'git config'],
    'remote',
  );

  add(
    3,
    'status-singkat',
    'Baca dua kolom status dengan tenang.',
    'Pahami posisi perubahan pada output status --short.',
    'File diskon muncul sebagai MM. Kamu ingin tahu mengapa satu file bisa terlihat berubah dua kali.',
    'Pada status singkat biasa, kolom pertama membandingkan index terhadap HEAD dan kolom kedua membandingkan working tree terhadap index. M berarti modified, A added, dan ?? untracked. Saat konflik, kombinasi huruf mempunyai makna khusus; lihat status panjang untuk penjelasan.',
    'Dua lampu menunjukkan dua tempat: nampan dan meja. Satu barang bisa berbeda di keduanya.',
    [
      [
        'Lihat bentuk ringkas',
        'git status --short',
        'Pada latihan stash-index, MM berarti versi staged dan edit berikutnya sama-sama ada.',
      ],
      [
        'Buktikan setiap kolom',
        'git diff --staged -- diskon.js\ngit diff -- diskon.js',
        'Bandingkan harga/diskon pada dua patch sebelum memilih versi yang akan direkam.',
      ],
    ],
    'Kamu bisa menjelaskan status MM tanpa menganggap Git menggandakan file.',
    'Output porcelain dirancang untuk diproses alat, sedangkan --short nyaman dibaca manusia. Jangan menyimpulkan ?? sebagai file kosong.',
    'Pada latihan stash-index, sebutkan nilai di HEAD, index, dan working tree sebelum menyimpan perubahan.',
    [
      'Apa arti MM pada file tracked tanpa konflik?',
      [
        'Ada dua salinan repo rusak',
        'Index berubah dan working tree juga berbeda dari index',
        'File sudah masuk dua commit',
      ],
      1,
      'Dua kolom mengukur dua perbandingan yang berbeda.',
    ],
    ['git status --short', 'git diff'],
    'staging',
  );

  add(
    4,
    'log-filter',
    'Persempit riwayat ke pertanyaanmu.',
    'Cari berdasarkan pesan, penulis, dan path tanpa kehilangan konteks.',
    'Repo berisi ratusan commit, tetapi kamu hanya ingin meninjau perbaikan checkout yang pernah dibuat Rani.',
    'Filter log membantu memperkecil kandidat. --grep mencari pesan commit, --author metadata penulis, dan -- PATH membatasi riwayat path. Nama penulis bukan bukti identitas terverifikasi. Setelah menemukan kandidat, buka commit dan baca konteksnya.',
    'Indeks buku membawamu ke halaman yang mungkin relevan. Kamu tetap perlu membaca halamannya.',
    [
      [
        'Cari pesan perbaikan',
        'git log --oneline --grep="checkout"',
        'Pencarian ini membaca pesan, bukan isi file atau patch.',
      ],
      [
        'Batasi path dan jumlah',
        'git log -5 --oneline -- checkout.js',
        'Periksa commit kandidat dengan show; hasil bergantung pada riwayat yang tersedia.',
      ],
    ],
    'Pencarian menghasilkan kandidat yang bisa ditinjau satu per satu.',
    'Filter yang terlalu banyak bisa menyembunyikan hasil. Mulai dari pertanyaan sederhana, lalu persempit.',
    'Cari pesan perbaikan checkout pada latihan cherry-pick, lalu baca patch dan pastikan file yang berubah memang checkout.js.',
    [
      '--grep pada log mencari apa?',
      ['Isi semua file saat ini', 'Pesan commit', 'Nama remote'],
      1,
      'Untuk isi file gunakan grep; untuk patch atau sejarah string gunakan opsi lain.',
    ],
    ['git log --grep', 'git show'],
    'graph',
  );

  add(
    4,
    'diff-versi',
    'Jelaskan dua sisi perbandingan.',
    'Pilih diff working tree, staged, atau snapshot secara sengaja.',
    'Reviewer bertanya apa yang berubah antara main dan fitur. Kamu tidak ingin mencampurnya dengan edit lokal yang belum di-commit.',
    'git diff tanpa revision membandingkan working tree tracked dengan index. --staged membandingkan index terhadap HEAD. git diff A B membandingkan snapshot A dan B; git diff A...B membandingkan merge base A/B dengan B. Tiga titik berguna untuk melihat perubahan sisi fitur sejak titik bersama, dan berbeda dari tiga titik pada log.',
    'Sebutkan dua edisi yang dibandingkan sebelum membahas halaman yang berubah. “Ada perbedaan” belum menjawab perbedaan dari mana.',
    [
      [
        'Periksa snapshot dua branch',
        'git diff main fitur-diskon',
        'Tidak memasukkan edit working tree yang belum direkam.',
      ],
      [
        'Periksa sejak dasar bersama',
        'git diff main...fitur-diskon',
        'Pada latihan rebase sebelum proses, ini menampilkan perubahan fitur sejak branch berpisah.',
      ],
    ],
    'Kamu tahu sumber setiap patch dan tidak mengira diff kosong selalu berarti repo bersih.',
    'Rentang A..B pada log memilih kumpulan commit; pada diff dua titik setara perbandingan dua endpoint. Konteks command penting.',
    'Pada latihan rebase, bandingkan diff main fitur-diskon dan diff main...fitur-diskon. Jelaskan mengapa perubahan main dapat muncul pada bentuk pertama.',
    [
      'Diff A...B membandingkan apa?',
      [
        'A dengan B secara langsung selalu',
        'Merge base A/B dengan B',
        'Working tree dengan semua tag',
      ],
      1,
      'Tiga titik pada diff memilih dasar bersama menuju sisi B.',
    ],
    ['git diff'],
    'graph',
  );

  add(
    5,
    'kelola-branch',
    'Nama branch boleh berubah, pekerjaannya tetap.',
    'Rename dan hapus referensi branch dengan memahami syaratnya.',
    'Branch typo bernama fitur-dikson sudah selesai. Kamu ingin membetulkan nama atau merapikan branch yang sudah digabung.',
    'git branch -m mengganti nama branch. git branch -d menghapus referensi dengan pemeriksaan merged terhadap upstream bila dikonfigurasi, atau HEAD bila tidak. -D melewati pemeriksaan tersebut. Penghapusan nama branch tidak otomatis menghapus branch server ataupun memastikan object hilang.',
    'Mengganti label folder tidak menulis ulang isi buku. Membuang label juga bukan tindakan yang sama dengan menghancurkan seluruh halaman.',
    [
      [
        'Rename branch aktif',
        'git branch -m fitur-diskon-baru',
        'Gunakan nama baru yang belum ada. Commit yang ditunjuk tidak berubah.',
      ],
      [
        'Periksa sebelum menghapus',
        'git branch --merged main',
        'Pindah dari branch yang ingin dihapus. Periksa pula upstream melalui branch -vv.',
      ],
      [
        'Hapus branch yang sudah dipahami',
        'git branch -d fitur-diskon-baru',
        'Jika ditolak, pelajari alasannya; jangan otomatis menggantinya dengan -D.',
      ],
    ],
    'Nama branch rapi dan kamu tahu apakah operasi hanya berlaku lokal.',
    'Branch yang aktif di linked worktree lain tidak dapat dihapus begitu saja. Pahami keberadaan worktree sebelum merapikan referensi.',
    'Gunakan latihan merge-ff, gabungkan fitur dahulu, lalu hapus branch fitur dari main. Buktikan perubahan diskon tetap ada.',
    [
      'Menghapus branch lokal otomatis menghapus branch server?',
      ['Tidak', 'Ya, selalu', 'Ya, jika bernama fitur'],
      0,
      'Penghapusan lokal dan remote adalah operasi yang berbeda.',
    ],
    ['git branch -m', 'git branch -d'],
    'graph',
  );

  add(
    5,
    'branch-tracking',
    'main dan origin/main bukan kembaran live.',
    'Bedakan branch lokal, remote-tracking ref, dan upstream.',
    'Kamu melihat main dan origin/main pada grafik, tetapi keduanya menunjuk commit berbeda setelah Rani bekerja.',
    'main adalah branch lokal. origin/main adalah referensi lokal yang biasanya diperbarui fetch dari remote origin. Upstream adalah hubungan konfigurasi branch lokal ke referensi pelacakan tertentu; nama branch lokal dan remote tidak harus sama. Informasi ahead/behind menggunakan pengetahuan lokal terakhir.',
    'Papan kerja sendiri berbeda dari foto papan tim yang terakhir kamu ambil. Foto itu baru diperbarui ketika kamu mengambil kabar lagi.',
    [
      [
        'Lihat hubungan branch',
        'git branch -vv',
        'Perhatikan label upstream dan angka ahead/behind bila ada.',
      ],
      [
        'Perbarui lalu periksa lagi',
        'git fetch origin\ngit branch -vv',
        'Pada latihan remote, origin/main maju sementara main lokal tetap pada commit sebelumnya.',
      ],
    ],
    'Perbedaan posisi dapat dijelaskan tanpa menganggap fetch melakukan merge.',
    'Angka behind bisa kedaluwarsa sebelum fetch. Jangan menyamakan nama remote origin dengan branch origin/main.',
    'Bandingkan tiga posisi pada latihan remote sebelum dan sesudah fetch: server main, origin/main, dan main lokal.',
    [
      'Apa yang biasanya menggerakkan origin/main saat mengambil kabar?',
      ['git fetch origin', 'Mengedit file menu', 'git add .'],
      0,
      'Fetch memperbarui referensi remote-tracking sesuai refspec yang dikonfigurasi.',
    ],
    ['git branch -vv', 'git fetch'],
    'remote',
  );

  add(
    6,
    'fast-forward',
    'Kadang merge cukup memajukan label.',
    'Kenali syarat fast-forward dan kegunaan --ff-only.',
    'Main belum berubah sejak fitur diskon bercabang. Kamu ingin menerima fitur tanpa membuat commit pertemuan tambahan.',
    'Fast-forward dapat dilakukan ketika ujung branch penerima merupakan ancestor ujung sumber. --ff-only membatasi operasi pada keadaan ini dan berhenti bila riwayat divergen. --no-ff justru meminta merge commit ketika integrasi membutuhkan merge dan fast-forward memungkinkan; gunakan berdasarkan aturan tim.',
    'Penanda main tertinggal beberapa halaman di jalur yang sama. Kamu cukup memajukannya ke halaman fitur.',
    [
      [
        'Pastikan penerima main',
        'git switch main\ngit log --oneline --graph --all',
        'Pada latihan merge-ff, main berada tepat sebelum commit fitur.',
      ],
      [
        'Majukan tanpa commit baru',
        'git merge --ff-only fitur-diskon',
        'Sesudah berhasil, kedua nama branch menunjuk commit yang sama.',
      ],
    ],
    'Jumlah commit tetap sama dan referensi main bergerak ke commit fitur.',
    'Jika --ff-only gagal, itu bukan alasan langsung memakai force. Riwayat mungkin telah bercabang dan memerlukan keputusan integrasi.',
    'Selesaikan latihan merge-ff. Bandingkan hash main dan fitur-diskon menggunakan rev-parse.',
    [
      'Apa yang baru pada fast-forward?',
      ['Selalu satu object merge commit', 'Posisi referensi penerima', 'Semua hash commit lama'],
      1,
      'Tidak perlu commit baru untuk menghubungkan jalur yang sudah linear.',
    ],
    ['git merge --ff-only'],
    'merge',
  );

  add(
    6,
    'abort-merge',
    'Berhenti sebelum keputusan disimpan.',
    'Batalkan merge yang masih berlangsung dan periksa pemulihannya.',
    'Harga yang benar belum disepakati, sementara merge menu sudah berhenti dengan konflik. Kamu ingin kembali dulu ke keadaan sebelumnya.',
    'git merge --abort mencoba mengembalikan keadaan sebelum merge yang masih berlangsung. Memulai dari working tree bersih membuat batas pemulihan lebih jelas. Bila perubahan lokal sudah ada sebelum merge atau ikut diedit saat konflik, rekonstruksi seluruh perubahan awal tidak selalu terjamin.',
    'Kamu membatalkan sesi penyuntingan yang belum disahkan. Lebih mudah kembali jika meja sudah rapi saat sesi dimulai.',
    [
      [
        'Mulai dari kondisi latihan bersih',
        'git merge fitur-menu',
        'Pada latihan merge-abort, konflik memang diharapkan. Jangan commit hasilnya.',
      ],
      [
        'Periksa lalu batalkan',
        'git status\ngit merge --abort',
        'Setelah abort, periksa status dan isi menu. Tidak ada proses merge yang perlu diteruskan.',
      ],
    ],
    'HEAD main, index, dan working tree kembali ke keadaan awal latihan.',
    '--abort bukan cara membalik merge yang sudah di-commit. Untuk riwayat yang sudah dibagikan, pelajari revert dengan pemilihan mainline.',
    'Jalankan start merge-abort. Catat hash HEAD, buat konflik, abort, lalu bandingkan hash dan status.',
    [
      'Kapan merge --abort digunakan?',
      [
        'Saat merge masih berlangsung',
        'Setelah semua rilis untuk menghapus riwayat',
        'Untuk membatalkan stash pop',
      ],
      0,
      'Perintah ini menangani proses merge yang belum selesai.',
    ],
    ['git merge --abort'],
    'conflict',
  );

  add(
    7,
    'upstream',
    'Tentukan branch pembandingmu.',
    'Atur upstream dan baca dampaknya pada pull serta push.',
    'Branch baru sudah ada di server, tetapi pull lokal tidak tahu branch mana yang perlu diikuti.',
    'Upstream disimpan melalui konfigurasi branch. push -u dapat menetapkannya setelah push berhasil. --set-upstream-to menghubungkan ke remote-tracking ref yang sudah tersedia. Tujuan push juga dipengaruhi push.default dan opsi eksplisit; upstream tidak berarti semua command selalu memilih tujuan yang sama.',
    'Kamu menuliskan alamat korespondensi pada buku kerja. Alamat itu membantu kebiasaan operasi, tetapi instruksi alamat eksplisit tetap perlu dibaca.',
    [
      [
        'Periksa upstream saat ini',
        'git branch -vv',
        'Latihan remote sudah memiliki main yang mengikuti origin/main.',
      ],
      [
        'Atur hubungan yang sudah tersedia',
        'git branch --set-upstream-to=origin/main main',
        'Jalankan setelah origin/main tersedia dari fetch. Tidak menggabungkan commit atau mengubah file.',
      ],
    ],
    'Hubungan main ke origin/main terlihat pada branch -vv.',
    'Menetapkan upstream tidak memperbaiki riwayat divergen, menambah izin, atau mengirim commit.',
    'Pada latihan remote, catat posisi main, atur upstream, lalu buktikan posisi commit tidak bergerak.',
    [
      'Menetapkan upstream otomatis melakukan merge?',
      ['Tidak', 'Ya, selalu', 'Hanya bila repo bare'],
      0,
      'Ini mengubah konfigurasi hubungan branch, bukan snapshot.',
    ],
    ['git branch --set-upstream-to', 'git push -u'],
    'remote',
  );

  add(
    7,
    'strategi-pull',
    'Pull punya pilihan cara bertemu.',
    'Pilih fast-forward, merge, atau rebase sesuai keadaan dan aturan tim.',
    'Kamu dan Rani sama-sama punya commit baru. Pull meminta keputusan cara mempertemukan kedua jalur.',
    'Pull mengambil data lalu mengintegrasikan branch yang dipilih. --ff-only menolak divergensi; --no-rebase memilih merge; --rebase memutar ulang commit lokal di atas hasil yang diambil. Perubahan hash akibat rebase perlu dipahami sebelum jalur lokal yang sudah dibagikan ditulis ulang.',
    'Menerima kiriman baru bisa berarti melanjutkan halaman yang sama, membuat titik pertemuan, atau menyusun ulang draf sendiri.',
    [
      [
        'Tentukan keadaan dahulu',
        'git fetch origin\ngit log --graph --oneline --all -10',
        'Lihat apakah main hanya tertinggal atau benar-benar divergen.',
      ],
      [
        'Jika hanya tertinggal',
        'git pull --ff-only origin main',
        'Contoh ini untuk main aktif pada latihan remote sebelum commit lokal tambahan.',
      ],
      [
        'Alternatif pada branch pribadi',
        'git pull --rebase origin main',
        'Ini pilihan berbeda ketika commit lokal memang boleh diputar ulang. Jangan jalankan sebagai langkah lanjutan wajib setelah contoh sebelumnya.',
      ],
    ],
    'Strategi integrasi dipilih secara sadar dan tidak tergantung tebakan tentang default konfigurasi.',
    'Perilaku default pull dapat berbeda karena konfigurasi. Tulis opsi eksplisit saat sedang belajar.',
    'Selesaikan latihan remote melalui fetch + merge --ff-only, lalu jelaskan hubungannya dengan pull --ff-only.',
    [
      'Strategi mana yang menolak divergensi?',
      ['--ff-only', '--rebase selalu menolak', '--no-rebase selalu menolak'],
      0,
      'FF-only mengizinkan integrasi yang cukup memajukan referensi.',
    ],
    ['git pull --ff-only', 'git pull --rebase'],
    'remote',
  );

  add(
    8,
    'fork-upstream',
    'Berkontribusi lewat salinan milikmu.',
    'Susun remote origin dan upstream pada model fork.',
    'Kamu tidak punya akses menulis ke repo komunitas Kopi Kita, tetapi ingin mengirim perbaikan dokumentasi.',
    'Fork adalah fitur layanan hosting untuk salinan repo pada akun lain. Secara konvensi origin menunjuk fork milikmu dan upstream menunjuk repo sumber. Perubahan dikirim ke branch fork, lalu diajukan lewat PR/MR. Nama remote bebas dipilih dan tidak memberikan izin khusus.',
    'Kamu mengerjakan salinan naskah sendiri, lalu mengirim usulan koreksi kepada pemilik naskah utama.',
    [
      [
        'Tinjau remote',
        'git remote -v',
        'Pastikan origin benar-benar fork milikmu. URL contoh pada penjelasan harus diganti alamat layanan yang sah.',
      ],
      [
        'Ambil kabar sumber setelah dikonfigurasi',
        'git fetch upstream',
        'Sebelum langkah ini, tambahkan remote upstream dengan URL repo sumber melalui git remote add upstream URL_SUMBER.',
      ],
      [
        'Bagikan usulan di fork',
        'git push -u origin perbaikan-dokumen',
        'Buat PR/MR menuju branch sumber yang disepakati. Push ini bukan merge ke upstream.',
      ],
    ],
    'Kamu tahu tujuan setiap remote dan dapat mengajukan kontribusi tanpa akses push ke sumber.',
    'Nama upstream pada remote berbeda dari istilah upstream branch. Satu nama adalah alamat repo, satunya hubungan konfigurasi branch.',
    'Gambarkan alur repo sumber → fork → branch usulan → PR. Tandai operasi yang berasal dari Git dan fitur hosting.',
    [
      'Apakah remote bernama upstream otomatis punya izin menulis?',
      ['Tidak, nama tidak memberi izin', 'Ya, karena namanya khusus', 'Hanya setelah clone'],
      0,
      'Hak akses ditentukan server dan akun, bukan nama remote.',
    ],
    ['git remote', 'git fetch', 'git push'],
    'remote',
  );

  add(
    8,
    'commit-atomik',
    'Biar satu commit menjawab satu alasan.',
    'Pisahkan perubahan yang bisa ditinjau dan dibatalkan secara masuk akal.',
    'Perbaikan harga masuk satu commit bersama refactor checkout. Saat harga perlu dibatalkan, refactor ikut terkena.',
    'Commit atomik berfokus pada satu tujuan yang dapat dipahami dan diuji. Ukurannya tidak harus satu baris atau satu file. Pesan menjelaskan maksud, sementara diff menjelaskan implementasi. Perubahan yang saling bergantung sebaiknya tetap membentuk snapshot yang valid.',
    'Satu kuitansi untuk satu transaksi membuat pemeriksaan dan koreksi lebih jelas. Memecah transaksi sampai tidak lengkap juga merepotkan.',
    [
      [
        'Tinjau perubahan per tujuan',
        'git diff\ngit status --short',
        'Pada latihan staging, pilih koreksi menu dan sisakan diskon.',
      ],
      [
        'Periksa calon cerita',
        'git add menu.json\ngit diff --staged\ngit commit -m "Sesuaikan harga kopi susu"',
        'Pastikan commit dapat berdiri sendiri dan pesan mencerminkan isi yang staged.',
      ],
    ],
    'Reviewer bisa menjelaskan tujuan commit tanpa menebak hubungan perubahan yang tidak relevan.',
    'Commit kecil bukan jaminan berkualitas. Jangan memisahkan perubahan yang membuat proyek gagal dibangun di tengah riwayat bila bisa dihindari.',
    'Tulis dua pesan untuk perubahan menu dan fitur diskon pada latihan staging. Sebutkan cara menguji masing-masing.',
    [
      'Commit atomik harus selalu satu file?',
      [
        'Tidak, ukurannya mengikuti satu tujuan yang utuh',
        'Ya, tanpa pengecualian',
        'Harus selalu satu baris',
      ],
      0,
      'Satu tujuan bisa membutuhkan beberapa file yang saling mendukung.',
    ],
    ['git diff --staged', 'git commit'],
    'staging',
  );

  add(
    9,
    'stash-untracked',
    'File baru perlu diajak secara eksplisit.',
    'Pilih perubahan tracked, untracked, dan staged yang perlu disimpan.',
    'diskon.js sudah dilacak, sedangkan catatan.txt baru dibuat. Setelah stash biasa, catatan masih terlihat di working tree.',
    'Stash biasa menyimpan perubahan tracked dan index. -u juga menyertakan untracked; -a juga ignored. --index pada penerapan mencoba memulihkan pemisahan staged/unstaged. Pilihan ini berbeda: -u menentukan apa yang disimpan, --index menentukan keadaan index yang dicoba dipulihkan.',
    'Kamu memberi daftar bahan yang masuk laci, lalu nanti memilih apakah susunan nampannya ikut dipasang kembali.',
    [
      [
        'Simpan file baru juga',
        'git stash push -u -m "Diskon dan catatan"',
        'Gunakan latihan stash. Periksa status untuk membuktikan file baru tidak tertinggal.',
      ],
      [
        'Pulihkan dan periksa',
        'git stash pop\ngit status --short',
        'catatan.txt kembali sebagai untracked bila memang awalnya belum ditambahkan.',
      ],
      [
        'Variasi staging pada latihan terpisah',
        'git stash push -m "Pisahkan index"\ngit stash apply --index',
        'Jalankan variasi ini pada start stash-index, bukan lanjutan wajib dari latihan -u.',
      ],
    ],
    'Cakupan simpanan dan pemulihan staging dapat dijelaskan secara terpisah.',
    '-a dapat memasukkan file ignored besar atau sensitif. Jangan menggunakannya sebagai kebiasaan tanpa meninjau isi.',
    'Selesaikan stash dan stash-index pada dua folder latihan berbeda. Periksa diff biasa dan staged setelah apply --index.',
    [
      'Opsi untuk ikut menyimpan untracked adalah?',
      ['-u saat stash push', '--index saat status', '--force saat push remote'],
      0,
      '-u atau --include-untracked menambah cakupan file yang disimpan.',
    ],
    ['git stash push -u', 'git stash apply --index'],
    'stash',
  );

  add(
    10,
    'reset-modes',
    'Satu target, tiga dampak berbeda.',
    'Bandingkan reset soft, mixed, dan hard dari keadaan awal yang sama.',
    'HEAD berisi harga 20000, index 22000, dan editor 24000. Kamu ingin kembali ke commit harga 18000 dengan dampak yang diketahui.',
    'Untuk reset dengan target commit, soft memindahkan branch aktif tanpa mengganti index dan working tree. Mixed juga mengisi ulang index dari target. Hard mengisi ulang keduanya dan dapat menimpa pekerjaan lokal, termasuk untracked yang menghalangi penulisan path tracked. Ini berbeda dari reset per path yang tidak memindahkan HEAD.',
    'Kamu bisa memundurkan penanda saja, mengatur ulang nampan juga, atau mengatur ulang seluruh meja sesuai foto lama.',
    [
      [
        'Catat tiga versi',
        'git show HEAD:menu.json\ngit show :menu.json\ngit diff -- menu.json',
        'Mulai salah satu latihan reset. Jangan mencoba tiga mode berurutan lalu membandingkannya sebagai keadaan awal yang sama.',
      ],
      [
        'Pilih satu mode di folder latihan',
        'git reset --soft awal',
        'Ganti --soft dengan --mixed atau --hard hanya pada folder latihan mode yang sesuai. Tag awal menunjuk snapshot 18000.',
      ],
      [
        'Buktikan hasil',
        'git show HEAD:menu.json\ngit show :menu.json\ngit status --short',
        'Periksa isi editor juga. Checker menilai ketiga tempat tersebut.',
      ],
    ],
    'Soft: index 22000/working 24000; mixed: index 18000/working 24000; hard: keduanya 18000.',
    'Gunakan hard hanya bila perubahan contoh memang boleh dibuang. Reflog mencatat perpindahan commit, bukan seluruh edit yang belum direkam.',
    'Jalankan start reset-soft, reset-mixed, dan reset-hard pada folder berbeda. Tuliskan tabel hasil sebelum dan sesudah.',
    [
      'Mode mana yang mengganti index tetapi mempertahankan working tree?',
      ['soft', 'mixed', 'hard'],
      1,
      'Mixed mengisi ulang index dari target dan mempertahankan working tree.',
    ],
    ['git reset'],
    'reset',
  );

  add(
    10,
    'reflog-rescue',
    'Cari jejak sebelum memindahkan lagi.',
    'Pulihkan referensi menuju commit yang masih tersedia.',
    'Branch fitur terhapus sebelum digabung. Kamu ingin menemukan commit pekerjaan dan memasang nama baru padanya.',
    'Reflog adalah catatan lokal pembaruan referensi, termasuk perpindahan HEAD. Temukan kandidat berdasarkan pesan/waktu, baca isinya, lalu buat branch baru pada hash yang benar. Jangan berasumsi HEAD@{1} selalu posisi yang dicari. Retensi dan pemangkasan object membatasi pemulihan.',
    'Buku kunjungan menunjukkan halaman yang sempat kamu buka. Temukan halaman yang benar, lalu pasang penanda lagi sebelum lanjut.',
    [
      [
        'Cari kandidat',
        'git reflog --all --date=iso',
        'Pada latihan reflog, cari commit berpesan Diskon yang ingin dipulihkan. Hash berbeda setiap latihan.',
      ],
      [
        'Periksa kandidat pilihan',
        'git show HASH_KANDIDAT',
        'Ganti placeholder dengan hash nyata. Pastikan diskon 10 ada pada commit tersebut.',
      ],
      [
        'Pasang nama yang baru',
        'git branch pulih-diskon HASH_KANDIDAT\ngit show pulih-diskon:diskon.js',
        'Ini mempertahankan referensi tanpa menimpa working tree.',
      ],
    ],
    'Branch pulih-diskon menunjuk commit yang tadi kehilangan nama branch.',
    'File untracked yang tidak pernah ditambahkan atau disimpan tidak otomatis memiliki jejak object yang bisa dipulihkan dari reflog.',
    'Selesaikan latihan reflog tanpa menggunakan reset. Jelaskan mengapa branch baru cukup untuk mempertahankan commit.',
    [
      'Apa langkah setelah menemukan hash kandidat?',
      [
        'Periksa isinya sebelum membuat referensi',
        'Langsung prune semua object',
        'Hapus folder .git',
      ],
      0,
      'Buktikan kandidat benar agar tidak memulihkan titik yang salah.',
    ],
    ['git reflog', 'git branch'],
    'recovery',
  );

  add(
    10,
    'clean-preview',
    'Lihat daftar sebelum membersihkan.',
    'Gunakan dry-run dan path spesifik untuk file untracked.',
    'Ada catatan sementara, cache ignored, dan edit harga yang belum di-commit. Kamu hanya ingin membuang catatan sementara.',
    'Clean menghapus file untracked sesuai opsi/path. -n adalah dry-run, -d menyertakan direktori, dan -f meminta pelaksanaan. File ignored dikecualikan secara default; -x mengubah cakupan itu. Clean tidak memindahkan HEAD dan bukan cara mengembalikan isi tracked.',
    'Sebelum membuang barang di meja, tulis daftar yang akan masuk tempat sampah. Pilih satu barang bila hanya itu yang ingin dibuang.',
    [
      [
        'Lihat kandidat',
        'git status --short\ngit clean -nd',
        'Latihan clean punya satu catatan untracked dan satu folder cache ignored. Perhatikan yang tidak masuk daftar.',
      ],
      [
        'Hapus path yang memang dipilih',
        'git clean -f -- catatan-sementara.txt',
        'Hapus hanya file contoh itu. Tidak perlu menambahkan -x.',
      ],
      [
        'Periksa yang dipertahankan',
        'git diff -- menu.json\ngit status --short --ignored',
        'Edit menu dan cache seharusnya tetap ada.',
      ],
    ],
    'Hanya catatan-sementara.txt terhapus; cache dan perubahan tracked tetap ada.',
    'Untracked yang dihapus clean biasanya tidak bisa dikembalikan oleh Git. Mulai dari preview dan jangan menjadikan -fdx kebiasaan.',
    'Selesaikan latihan clean dan jelaskan mengapa status biasa tidak menampilkan cache ignored.',
    [
      'Opsi mana yang hanya menampilkan rencana clean?',
      ['-n', '-f', '-x'],
      0,
      'Dry-run tidak menghapus file.',
    ],
    ['git clean -n', 'git clean'],
  );

  add(
    11,
    'rebase-dasar',
    'Pindahkan dasar, simpan maksud perubahannya.',
    'Lihat commit fitur diputar ulang di atas main yang lebih baru.',
    'Main mendapat harga terbaru, sedangkan fitur-diskon punya dua commit lokal yang belum dipakai orang lain.',
    'Rebase memilih perubahan commit fitur dan menerapkannya di dasar baru. Jika parent berubah, identitas commit berubah. Branch main tidak otomatis bergerak. Commit yang sudah setara dengan perubahan di upstream dapat dilewati; contoh ini memakai dua perubahan fitur yang memang unik.',
    'Kamu menyalin dua koreksi draf ke edisi naskah terbaru. Maksudnya dipertahankan, tetapi halaman dan hubungan riwayatnya baru.',
    [
      [
        'Lihat dua jalur',
        'git log --oneline --graph --all',
        'Pada latihan rebase, menu berubah di main dan diskon berubah di fitur-diskon.',
      ],
      [
        'Putar ulang fitur',
        'git switch fitur-diskon\ngit rebase main',
        'Contoh tidak bentrok karena file berbeda. Konflik nyata membutuhkan resolve, add, dan rebase --continue.',
      ],
      [
        'Periksa garis hasil',
        'git log --oneline --graph --all\ngit diff main...fitur-diskon',
        'Main tetap pada harga baru; dua commit fitur sekarang berada setelahnya.',
      ],
    ],
    'Fitur memuat harga terbaru dan diskon 10, dengan dua commit baru di atas main.',
    'Rebase dapat mengubah banyak hash meski pesan mirip. Koordinasikan penulisan ulang jalur yang sudah dibagikan.',
    'Selesaikan latihan rebase. Catat hash dua commit fitur sebelum dan sesudah, lalu jelaskan perubahan parent.',
    [
      'Apakah git rebase main pada branch fitur memajukan main?',
      ['Tidak, yang disusun ulang adalah jalur fitur', 'Ya, selalu', 'Menghapus main'],
      0,
      'Main berperan sebagai dasar, bukan branch penerima yang otomatis berubah.',
    ],
    ['git rebase'],
    'rebase',
  );

  add(
    11,
    'force-lease',
    'Menulis ulang remote perlu ekspektasi jelas.',
    'Pahami lease, koordinasi, dan keterbatasan pemeriksaannya.',
    'Tim menyetujui rebase branch pribadi yang sudah di-push. Sementara itu rekan mungkin menambah commit di branch server tersebut.',
    '--force-with-lease mengizinkan pembaruan non-fast-forward hanya bila referensi tujuan memenuhi nilai yang diharapkan. Bentuk tanpa nilai eksplisit biasanya memakai remote-tracking ref; fetch otomatis dapat memperbarui acuan itu. Bentuk ref:expected menyatakan ekspektasi lebih jelas, tetapi tetap tidak menilai apakah perubahan yang kamu buang layak dipertahankan.',
    'Kamu meminta penggantian dokumen hanya bila edisi di lemari masih sama dengan edisi yang sudah disepakati. Pemeriksaan edisi tidak menggantikan persetujuan orang yang memakai dokumen.',
    [
      [
        'Periksa dan sepakati jalur',
        'git fetch origin\ngit log --graph --oneline --all -12',
        'Bahas commit mana yang diganti dan apakah ada pekerjaan orang lain. Catat object ID tujuan yang benar-benar diperiksa.',
      ],
      [
        'Pelajari bentuk eksplisit',
        'git push --force-with-lease=refs/heads/fitur-diskon:OID_YANG_DITINJAU origin fitur-diskon',
        'Ini template, bukan command siap salin. Ganti OID dengan nilai tujuan yang sudah ditinjau dan jalankan hanya pada jalur yang memang disetujui untuk ditulis ulang.',
      ],
    ],
    'Kamu bisa menjelaskan apa yang diperiksa lease dan apa yang tetap memerlukan keputusan tim.',
    'Jangan menambahkan force setelah push rejected tanpa diagnosis. Protected branch juga bisa melarang operasi ini.',
    'Gambarkan server pada hash X yang telah ditinjau, lalu berubah ke Y. Prediksi hasil lease yang masih mengharapkan X sebelum mencoba pada repo latihan pribadi.',
    [
      'Lease memeriksa apa?',
      [
        'Kesesuaian referensi tujuan dengan ekspektasi',
        'Kebenaran seluruh logika program',
        'Izin moral untuk membuang perubahan tim',
      ],
      0,
      'Lease menambah pemeriksaan posisi referensi, bukan audit seluruh perubahan.',
    ],
    ['git push --force-with-lease'],
    'remote',
  );

  add(
    12,
    'log-pickaxe',
    'Cari kapan sebuah aturan mulai ada.',
    'Bedakan pencarian string -S dari pencarian patch -G.',
    'Aturan MINIMUM_BELANJA diganti namanya beberapa kali. Kamu perlu menemukan commit yang memperkenalkan atau mengubah penggunaannya.',
    '-S memilih perubahan yang mengubah jumlah kemunculan string. -G memilih commit dengan baris patch yang cocok regex. Pemindahan string tanpa perubahan jumlah bisa luput dari -S. Setelah kandidat ditemukan, lihat seluruh konteks karena satu baris jarang menceritakan semua alasan.',
    'Menghitung jumlah kata berbeda dari mencari kalimat yang direvisi. Pilih metode sesuai pertanyaan.',
    [
      [
        'Cari perubahan jumlah string',
        'git log -p -S "diskon" -- diskon.js',
        'Pada latihan rebase, perubahan nilai tetap memakai jumlah kata diskon yang sama sehingga tidak semua perubahan terpilih.',
      ],
      [
        'Cari baris patch yang cocok',
        'git log -p -G "diskon.*10" -- diskon.js',
        'Regex ini menelusuri baris perubahan yang menyebut nilai 10.',
      ],
    ],
    'Hasil dua pencarian dapat berbeda dan kamu tahu alasannya.',
    'Quote dan regex diproses sesuai shell sebelum diterima Git. Gunakan contoh sederhana dan periksa bantuan untuk pola kompleks.',
    'Gunakan latihan rebase sebelum proses. Bandingkan commit yang dipilih -S diskon dan -G diskon.',
    [
      'String dipindah tanpa perubahan jumlah. -S pasti memilihnya?',
      ['Tidak selalu', 'Ya, selalu', 'Tidak ada hubungan dengan jumlah'],
      0,
      '-S berfokus pada perubahan jumlah kemunculan string.',
    ],
    ['git log -S', 'git log -G'],
  );

  add(
    12,
    'bisect-run',
    'Biarkan pengujian menjawab good atau bad.',
    'Kenali kontrak exit code sebelum mengotomatiskan bisect.',
    'Bug bisa diuji lewat script yang stabil. Kamu ingin mengurangi penilaian manual pada setiap kandidat commit.',
    'bisect run menjalankan command berulang pada kandidat. Exit 0 berarti good, 1–127 selain 125 berarti bad, dan 125 berarti skip. Kesalahan setup yang kebetulan menghasilkan exit 1 dapat dianggap bug, sehingga script harus membedakan build gagal, versi tidak dapat diuji, dan perilaku yang memang salah.',
    'Petugas pemeriksa boleh membantu membelah tumpukan, tetapi kode hasil pemeriksaannya harus konsisten.',
    [
      [
        'Tetapkan batas yang sudah diuji',
        'git bisect start\ngit bisect bad\ngit bisect good awal',
        'Pada latihan bisect, tag awal adalah titik baik. Pastikan working tree bersih.',
      ],
      [
        'Gunakan script pengujian milikmu',
        'git bisect run node ../uji-diskon.cjs',
        'Siapkan script di luar working tree yang berpindah commit. Script harus mengikuti kontrak exit code; ini template bila script belum dibuat.',
      ],
      [
        'Tutup proses setelah hasil dicatat',
        'git bisect reset',
        'Verifikasi kandidat buruk dengan membaca patch dan mengulang pengujian yang relevan.',
      ],
    ],
    'Kamu memahami kapan otomasi bisect dapat dipercaya dan kapan kandidat harus di-skip.',
    'Jangan memakai test yang bergantung internet, waktu, atau layanan tidak stabil sebagai penentu tanpa kontrol yang memadai.',
    'Selesaikan bisect manual dahulu. Tulis rancangan script yang mengembalikan 0 untuk diskon >= 0 dan 1 untuk diskon negatif.',
    [
      'Exit code 125 berarti apa bagi bisect run?',
      ['Skip kandidat', 'Good', 'Bad selalu'],
      0,
      '125 menandai bahwa versi ini tidak dapat dinilai.',
    ],
    ['git bisect run'],
    'graph',
  );

  add(
    13,
    'catatan-rilis',
    'Hubungkan versi dengan perubahan yang dipakai.',
    'Susun catatan rilis dari rentang commit dan perilaku yang berubah.',
    'Kasir bertanya apa yang baru pada v1.0.1. Daftar hash saja tidak menjelaskan manfaat atau perubahan perilakunya.',
    'Tag membantu menentukan batas versi. Log memberi kandidat perubahan, tetapi catatan rilis perlu disunting menjadi perubahan perilaku, perbaikan, dan kebutuhan migrasi bila ada. Tidak semua commit internal perlu menjadi butir untuk pengguna.',
    'Daftar bahan dapur tidak sama dengan penjelasan menu baru. Gunakan riwayat sebagai bahan untuk menulis informasi yang berguna.',
    [
      [
        'Baca perubahan antarversi',
        'git log --oneline v1.0.0..HEAD',
        'Pada latihan tags, buat tag awal dan commit baru lebih dahulu.',
      ],
      [
        'Periksa lingkup file',
        'git diff --stat v1.0.0 HEAD',
        'Stat membantu melihat lingkup, lalu buka patch yang perlu dijelaskan.',
      ],
    ],
    'Catatan rilis menghubungkan versi dan perilaku, bukan sekadar menyalin semua pesan commit.',
    'Rentang log pada riwayat bercabang mengikuti reachability. Jangan mengandalkan tanggal saja untuk menentukan isi versi.',
    'Selesaikan latihan tags, lalu tulis satu butir rilis untuk perubahan README dan sebutkan cara memverifikasinya.',
    [
      'Sumber awal yang tepat untuk catatan antarversi?',
      [
        'Rentang commit beserta patch yang ditinjau',
        'Hanya nama file paling besar',
        'Semua issue tanpa pemeriksaan',
      ],
      0,
      'Riwayat adalah bahan; penjelasan rilis tetap perlu konteks produk.',
    ],
    ['git log', 'git diff --stat'],
    'graph',
  );

  add(
    13,
    'signing',
    'Tanda tangan menambah bukti asal, bukan kebenaran.',
    'Kenali signed commit/tag dan prasyarat verifikasinya.',
    'Tim ingin memeriksa asal tag rilis. Kamu perlu tahu apa yang dibuktikan tanda tangan dan alat apa yang harus disiapkan.',
    'Git dapat memakai mekanisme signing yang dikonfigurasi, misalnya OpenPGP atau SSH pada versi yang mendukung. Signed tag dibuat dengan tag -s; commit signing memakai commit -S. Verifikasi memerlukan kunci publik dan kebijakan kepercayaan yang benar. Tanda tangan valid tidak membuktikan kode bebas bug.',
    'Segel penulis membantu membuktikan asal surat. Isi surat tetap perlu dibaca dan diuji.',
    [
      [
        'Periksa konfigurasi tanpa mengubahnya',
        'git config --get gpg.format\ngit config --get user.signingkey',
        'Nilai kosong berarti belum disiapkan secara eksplisit. Alat dan konfigurasi signing berbeda antar sistem.',
      ],
      [
        'Verifikasi tag yang memang signed',
        'git tag -v NAMA_TAG_SIGNED',
        'Ganti placeholder dengan tag nyata. Annotated tag biasa pada latihan tags tidak ditandatangani dan verifikasinya tidak akan sukses sebagai signed tag.',
      ],
    ],
    'Kamu dapat membedakan author metadata, signature, kepercayaan kunci, dan hasil pengujian kode.',
    'Jangan membuat atau mengunggah private key sebagai bagian materi. Latihan dasar sengaja menonaktifkan signing agar tidak memerlukan rahasia pengguna.',
    'Baca metadata tag annotated pada latihan tags. Jelaskan informasi tambahan yang diperlukan sebelum dapat memverifikasi signed tag.',
    [
      'Signature valid menjamin kode tanpa bug?',
      ['Tidak', 'Ya, selalu', 'Hanya untuk tag versi 1'],
      0,
      'Signature memverifikasi hubungan data dan kunci sesuai mekanismenya; kualitas kode dinilai terpisah.',
    ],
    ['git tag -v', 'git commit -S'],
    'objects',
  );

  add(
    14,
    'sparse-partial',
    'Ambil bagian yang dibutuhkan dengan cara yang tepat.',
    'Bedakan sparse checkout, partial clone, dan shallow clone.',
    'Repo Kopi Kita berkembang menjadi monorepo. Kamu hanya mengerjakan web dan tidak ingin semua folder tampil di working tree.',
    'Sparse checkout memilih path yang dimaterialisasi di working tree, bukan menghapus file dari commit. Partial clone meminta sebagian object awal dengan filter bila server mendukung dan dapat mengambil object kemudian. Shallow clone membatasi riwayat. Ketiganya tidak saling menggantikan.',
    'Kamu dapat membuka hanya satu rak, meminjam bahan secara bertahap, atau membawa beberapa edisi terakhir. Itu tiga pilihan yang berbeda.',
    [
      [
        'Pilih direktori dengan cone mode',
        'git sparse-checkout set --cone web',
        'Pada latihan sparse, folder web tetap tampil. File tingkat root juga dapat tetap tersedia dalam cone mode.',
      ],
      [
        'Buktikan dokumen masih tersimpan',
        'git show HEAD:docs/panduan.md\ngit sparse-checkout list',
        'Path docs tidak tampil di working tree, tetapi masih dapat dibaca dari snapshot.',
      ],
      [
        'Kembali ke tampilan penuh',
        'git sparse-checkout disable',
        'Ini alternatif setelah kamu memeriksa hasil sparse. Untuk checker sparse, jalankan check sebelum disable.',
      ],
    ],
    'Pilihan tampilan working tree dapat diubah tanpa menghapus file dari riwayat.',
    'Server lokal biasa belum tentu mendukung partial clone filter. Jangan menyimpulkan sparse checkout otomatis mengurangi seluruh download.',
    'Selesaikan latihan sparse dan jelaskan perbedaan file yang tidak ditampilkan dengan file yang dihapus melalui commit.',
    [
      'Sparse checkout menghapus docs dari commit?',
      ['Tidak', 'Ya, otomatis', 'Hanya di main'],
      0,
      'Pemilihan path working tree tidak menulis ulang snapshot yang sudah direkam.',
    ],
    ['git sparse-checkout'],
    'snapshot',
  );

  add(
    14,
    'submodule',
    'Repo di dalam repo punya posisi versinya sendiri.',
    'Pahami gitlink, .gitmodules, dan pembaruan submodule.',
    'Tim memakai pustaka tema dari repository terpisah dan ingin versi tema terikat pada satu commit yang sudah diuji.',
    'Superproject menyimpan gitlink yang menunjuk commit submodule dan .gitmodules berisi konfigurasi seperti path/URL. Clone biasa tidak selalu mengisi isi submodule; update --init --recursive dapat menyiapkannya. Commit di submodule dan commit pembaruan gitlink pada superproject adalah dua pekerjaan berbeda.',
    'Daftar resep utama menyebut edisi tertentu dari buku lain. Mengubah buku kedua belum otomatis mengganti edisi yang dicatat daftar utama.',
    [
      [
        'Periksa submodule bila ada',
        'git submodule status',
        'Pada repo tanpa submodule, output kosong adalah keadaan yang wajar.',
      ],
      [
        'Isi versi yang direkam superproject',
        'git submodule update --init --recursive',
        'Jalankan pada repo contoh yang memang punya .gitmodules dan URL yang dapat diakses. Ini dapat menghubungi remote.',
      ],
      [
        'Tinjau perubahan penunjuk',
        'git diff --submodule',
        'Setelah memilih commit baru di submodule, tinjau dan commit perubahan gitlink pada superproject.',
      ],
    ],
    'Kamu tahu repo mana yang menyimpan perubahan dan repo mana yang menyimpan pilihan versi.',
    'Jangan menghapus folder submodule untuk “memperbaiki” keadaan tanpa memeriksa perubahan lokal di dalamnya. Detached HEAD di submodule bisa merupakan keadaan checkout versi yang diharapkan.',
    'Gambarkan superproject yang menunjuk tema commit T1, lalu tema berkembang ke T2. Jelaskan dua commit yang perlu dibagikan agar tim memakai T2.',
    [
      'Apa yang dicatat gitlink?',
      [
        'Commit tertentu pada submodule',
        'Semua branch submodule secara live',
        'Password repo tema',
      ],
      0,
      'Superproject merekam pilihan commit, bukan mengikuti setiap perubahan otomatis.',
    ],
    ['git submodule', 'git diff --submodule'],
    'objects',
  );

  add(
    14,
    'git-lfs',
    'File besar punya alur penyimpanan tambahan.',
    'Kenali Git LFS sebagai ekstensi dengan object server terpisah.',
    'Foto menu beresolusi tinggi berganti berkali-kali. Tim ingin mengelolanya tanpa menganggap file biner seperti kode teks kecil.',
    'Git LFS menggunakan pointer pada riwayat Git dan menyimpan isi besar melalui layanan LFS. git lfs track menambahkan aturan ke .gitattributes; aturan tersebut perlu di-commit. Mengaktifkan tracking baru tidak otomatis memigrasikan seluruh file besar di riwayat lama. Dukungan, kuota, dan akses server perlu diperiksa pada penyedia.',
    'Katalog mencatat nomor penyimpanan barang besar. Memiliki kartu katalog belum berarti barang fisiknya sudah tersedia di tempatmu.',
    [
      [
        'Periksa ekstensi',
        'git lfs version',
        'Ini memerlukan Git LFS terpasang terpisah; command tidak tersedia pada Git inti saja.',
      ],
      [
        'Atur pola pada repo yang siap LFS',
        'git lfs track "*.psd"\ngit diff -- .gitattributes',
        'Contoh pola adalah pilihan tim. Commit .gitattributes dan file yang relevan setelah memeriksa hasil.',
      ],
    ],
    'Kamu dapat membedakan riwayat pointer dan ketersediaan data besar pada layanan LFS.',
    'Clone atau bundle Git tidak otomatis menjadi backup semua object LFS. Jangan memigrasikan riwayat bersama tanpa rencana serta verifikasi data.',
    'Jelaskan data apa yang dibutuhkan rekan agar bisa membuka file LFS dari snapshot tertentu. Latihan ini tidak meminta akun atau upload file besar.',
    [
      'Git LFS termasuk command bawaan Git inti?',
      ['Tidak, ekstensi terpisah', 'Ya, selalu sudah tersedia', 'Hanya built-in pada repo public'],
      0,
      'LFS adalah alat dan alur object tambahan yang perlu dipasang serta didukung server.',
    ],
    ['git lfs track', 'git lfs version'],
    'objects',
  );

  add(
    15,
    'hooks',
    'Jalankan pemeriksaan pada peristiwa yang jelas.',
    'Bedakan hooks lokal, konfigurasi distribusi, dan checks bersama.',
    'Tim ingin memeriksa format sebelum commit, tetapi rekan yang baru clone tidak mendapat hook yang sama.',
    'Hook adalah executable yang dipanggil Git pada peristiwa tertentu. pre-commit dapat menolak commit dengan exit nonzero; pre-push bekerja sebelum pengiriman. .git/hooks tidak menjadi konten tracked biasa. core.hooksPath dapat menunjuk direktori hook yang disepakati, tetapi setiap lingkungan perlu konfigurasi dan interpreter yang cocok.',
    'Alarm di meja masing-masing membantu kebiasaan lokal. Gerbang pemeriksaan bersama tetap dibutuhkan untuk aturan tim.',
    [
      [
        'Periksa jalur aktif',
        'git config --get core.hooksPath',
        'Paket latihan memakai direktori kosong agar hook pribadi tidak dijalankan pada repo contoh.',
      ],
      [
        'Pelajari kontrak hook',
        'git help hooks',
        'Pilih peristiwa, input, exit code, dan interpreter sesuai dokumentasi sebelum memasang script.',
      ],
    ],
    'Kamu tahu mengapa hook bisa berjalan pada satu komputer tetapi tidak pada clone lain.',
    'Hooks lokal bisa dilewati pada alur tertentu. Jangan menaruh satu-satunya aturan penting tim di pemeriksaan lokal saja.',
    'Rancang pre-commit yang menolak whitespace error dan tentukan checks server/CI yang mengulang pemeriksaan penting.',
    [
      'Hook di .git/hooks otomatis ikut clone?',
      ['Tidak', 'Ya, seluruh .git pengguna disalin', 'Hanya file berakhiran .sample'],
      0,
      'Distribusi dan aktivasi hook perlu alur tersendiri.',
    ],
    ['git config', 'git help hooks'],
  );

  add(
    15,
    'aliases',
    'Singkat boleh, asal maksudnya tetap jelas.',
    'Buat alias Git lokal dan hindari menyembunyikan efek berisiko.',
    'Kamu sering mengetik log dengan grafik dan ingin shortcut tanpa mengubah kebiasaan semua proyek di laptop.',
    'Alias Git menyimpan perluasan command melalui konfigurasi. Tanpa --global, pengaturan berlaku pada repo saat ini. Alias yang diawali ! menjalankan shell dan memiliki konsekuensi berbeda; contoh panduan cukup memakai alias command Git biasa.',
    'Singkatan pada catatan membantu menulis cepat, selama semua orang masih tahu kalimat lengkapnya.',
    [
      [
        'Buat alias hanya untuk latihan',
        'git config alias.lg "log --oneline --graph --decorate"',
        'Pengaturan ini tidak mengubah konfigurasi global.',
      ],
      [
        'Pakai dan periksa definisinya',
        'git lg\ngit config --get alias.lg',
        'Pastikan shortcut menghasilkan informasi yang kamu harapkan.',
      ],
      [
        'Hapus bila tidak diperlukan',
        'git config --unset alias.lg',
        'Yang dihapus adalah nilai konfigurasi alias, bukan commit atau file proyek.',
      ],
    ],
    'Kamu punya shortcut yang bisa diperiksa dan dibatalkan dengan jelas.',
    'Jangan membungkus reset --hard, clean, atau force push dengan nama samar. Shortcut tidak mengurangi dampak operasinya.',
    'Buat lg pada salah satu repo latihan, pakai, lalu hapus. Buktikan log dan isi proyek tidak berubah karena pengaturan itu.',
    [
      'Tanpa --global, alias disimpan di mana?',
      ['Konfigurasi repo saat ini', 'Semua komputer tim otomatis', 'Server GitHub'],
      0,
      'Scope lokal sesuai untuk mencoba preferensi di satu repo.',
    ],
    ['git config alias.lg', 'git config'],
  );

  add(
    16,
    'refs-refspec',
    'Nama dan jalur pertukaran punya pemetaan.',
    'Hubungkan refs/heads, refs/remotes, dan refspec fetch.',
    'Remote memiliki branch main. Kamu ingin memahami mengapa fetch menyimpannya sebagai origin/main di laptop.',
    'Refs memberi nama pada object ID. Branch lokal biasanya di refs/heads, tag di refs/tags, dan referensi pelacakan remote di refs/remotes. Refspec memetakan sisi sumber ke tujuan saat fetch/push; konfigurasi fetch default clone biasanya memetakan heads remote ke refs/remotes/origin.',
    'Alamat di daftar pengiriman mempunyai nama asal dan rak tujuan. Nama di kedua sisi bisa berbeda meski mengacu pada isi yang sama.',
    [
      [
        'Lihat referensi yang tersedia',
        'git show-ref',
        'Ini membaca nama dan object ID tanpa mengubah posisi branch.',
      ],
      [
        'Lihat aturan pemetaan',
        'git config --get-all remote.origin.fetch',
        'Pada latihan remote, amati wildcard yang memetakan branch sumber ke origin.',
      ],
    ],
    'Kamu dapat menghubungkan nama singkat main/origin/main dengan namespace referensinya.',
    'Jangan mengedit file refs secara manual; penyimpanan referensi dapat berbentuk packed atau backend lain. Gunakan command Git resmi.',
    'Pada latihan remote, temukan refs/heads/main dan refs/remotes/origin/main sebelum dan sesudah fetch.',
    [
      'Namespace branch lokal yang umum?',
      ['refs/heads', 'refs/passwords', 'refs/issues'],
      0,
      'Nama branch lokal berada pada namespace heads.',
    ],
    ['git show-ref', 'git config'],
    'objects',
  );

  add(
    16,
    'reachability',
    'Ada di penyimpanan belum tentu punya nama.',
    'Bedakan object yang tersedia dengan commit yang dapat dicapai dari branch.',
    'Setelah branch dihapus, commit fitur tidak tampak pada log main. Namun reflog masih bisa menunjukkannya.',
    'Reachability mengikuti referensi menuju object dan hubungan parent/tree/blob. Menghapus satu referensi bisa membuat commit tidak terjangkau dari branch, tetapi object dapat tetap tersedia untuk sementara melalui reflog atau sampai pemangkasan. Rebase juga tidak langsung memusnahkan object versi lama.',
    'Halaman bisa masih ada di gudang meski penanda katalog dilepas. Tanpa aturan penyimpanan, ketersediaannya tidak boleh dianggap selamanya.',
    [
      [
        'Amati jalur yang bernama',
        'git log --oneline --all',
        'Pada latihan reflog, jalur fitur yang referensinya dihapus tidak otomatis terlihat dari main.',
      ],
      [
        'Cari posisi lama',
        'git reflog --all',
        'Setelah mendapat hash, cat-file -t HASH dapat memeriksa object selama masih tersedia.',
      ],
    ],
    'Kamu tahu mengapa pemulihan mungkin berhasil hari ini tetapi tidak dijamin setelah retensi dan maintenance.',
    'Jangan menjalankan prune agresif saat investigasi pemulihan. Menyalin log hash saja bukan salinan object yang dirujuknya.',
    'Pulihkan branch pada latihan reflog. Bandingkan log --all sebelum dan setelah branch pulih-diskon dibuat.',
    [
      'Hapus nama branch berarti object commit langsung hilang?',
      ['Tidak selalu', 'Ya, seketika selalu', 'Hanya jika branch berawalan fitur'],
      0,
      'Penghapusan referensi dan pemangkasan object adalah hal yang berbeda.',
    ],
    ['git reflog', 'git cat-file'],
    'recovery',
  );

  const order = [
    ['kenalan-git', 'snapshot', 'git-terdistribusi', 'tiga-area'],
    ['setup', 'terminal-folder', 'bantuan', 'autentikasi'],
    ['mulai-repo', 'status-singkat', 'staging', 'ignore'],
    ['riwayat', 'log-filter', 'diff-versi', 'revision'],
    ['branch', 'detached-head', 'kelola-branch', 'branch-tracking'],
    ['merge', 'fast-forward', 'konflik', 'abort-merge'],
    ['fetch-pull', 'upstream', 'push', 'strategi-pull'],
    ['commit-atomik', 'review', 'fork-upstream', 'workflow'],
    ['stash', 'stash-untracked', 'apply-pop', 'stash-konflik'],
    ['restore', 'reset-revert', 'reset-modes', 'reflog-rescue', 'clean-preview'],
    ['amend-rebase', 'rebase-dasar', 'cherry-pick', 'force-lease'],
    ['pencarian', 'log-pickaxe', 'bisect', 'bisect-run'],
    ['tag', 'catatan-rilis', 'hotfix', 'signing'],
    ['partial-staging', 'worktree', 'sparse-partial', 'submodule', 'git-lfs'],
    ['attributes', 'hooks-secrets', 'hooks', 'aliases'],
    ['objects', 'refs-refspec', 'reachability', 'maintenance'],
  ];
  // These describe the narrative examples, not a promise that every lesson uses
  // the same fixture. The separate lab panel names its own reproducible scenario.
  const contexts = {
    'kenalan-git':
      'Tidak memerlukan repo. Git sudah terpasang untuk contoh --version; instalasi dijelaskan pada bab 02.',
    snapshot:
      'Repo punya commit HEAD yang melacak menu.json. Working tree boleh berbeda; perintah contoh hanya membaca.',
    'git-terdistribusi':
      'Repo lokal sudah punya setidaknya satu commit dan sebuah branch. Tidak memerlukan remote internet.',
    'tiga-area':
      'Repo sudah mempunyai HEAD. Satu file tracked diedit, di-add, lalu diedit lagi agar staged dan unstaged dapat dibandingkan.',
    setup:
      'Git terpasang. Contoh --global memang mengubah preferensi pengguna; gunakan nilai identitas sendiri. Scope --local memerlukan repo.',
    'terminal-folder':
      'Tersedia folder repo kopi-kita dan folder induknya. Perhatikan dari folder mana setiap command dijalankan.',
    bantuan:
      'Git terpasang. Bantuan command tidak memerlukan file proyek berubah; manual lokal mungkin tidak tersedia pada semua instalasi.',
    autentikasi:
      'Repo mempunyai origin. Latihan remote menggunakan path lokal; contoh HTTPS/SSH membutuhkan konfigurasi penyedia bila dipakai nyata.',
    'mulai-repo':
      'Pilih salah satu: folder proyek baru tanpa .git, atau URL repo yang benar-benar dapat diakses untuk clone.',
    'status-singkat':
      'Branch fitur-diskon, HEAD diskon 0, index diskon 5, working tree diskon 10. Gunakan latihan stash-index.',
    staging:
      'Branch fitur-diskon. menu.json berubah 18000→20000, diskon.js berubah 0→10; belum ada perubahan staged.',
    ignore:
      'Repo sudah punya HEAD. Contoh .env harus file dummy; langkah rm --cached hanya untuk path yang memang sudah tracked.',
    riwayat:
      'Repo punya beberapa commit dan menu.json tracked. Jika pencarian kosong, periksa apakah file pernah berubah pada riwayat itu.',
    'log-filter':
      'Repo punya commit dengan pesan checkout dan file checkout.js. Latihan cherry-pick menyediakan riwayat tersebut.',
    'diff-versi':
      'main dan fitur-diskon sama-sama ada dan sudah divergen. Latihan rebase menyediakan keadaan ini sebelum proses dimulai.',
    revision:
      'HEAD mempunyai parent. HEAD~3 memerlukan tiga langkah first-parent; gunakan hash yang tersedia bila riwayat lebih pendek.',
    branch:
      'main mempunyai satu commit dan working tree bersih. Buat fitur-diskon baru melalui latihan branch.',
    'detached-head':
      'Repo mempunyai dua commit atau lebih. Simpan pekerjaan lokal sebelum membuka commit parent.',
    'kelola-branch':
      'Branch fitur aktif dan nama tujuan belum dipakai. Untuk langkah delete, branch harus sudah ditinjau dan kamu sudah pindah darinya.',
    'branch-tracking':
      'Latihan remote: main dan origin/main lokal masih di A, sedangkan server sudah punya commit B dari Rani.',
    merge:
      'Branch main aktif dan bersih; branch fitur-diskon sudah mempunyai perubahan commit. Jangan merge dari branch penerima yang salah.',
    'fast-forward':
      'Latihan merge-ff: main pada A; fitur-diskon pada B dengan parent A. Tidak ada commit tambahan di main.',
    konflik:
      'Latihan merge-conflict: main harga 20000 dan fitur-menu harga 22000 mengubah baris yang sama dari dasar 18000.',
    'abort-merge':
      'Latihan merge-abort dimulai bersih di main. Kedua branch mengubah satu baris menu sehingga merge akan berkonflik.',
    'fetch-pull':
      'Latihan remote: server dan clone Rani sudah punya harga baru, tetapi main serta origin/main lokal masih lama.',
    upstream:
      'Remote origin dan referensi origin/main sudah tersedia. Pengaturan upstream tidak memindahkan commit.',
    push: 'Branch fitur-diskon punya commit yang ingin dibagikan. Remote origin sudah diatur dan tersedia sesuai hak akses pengguna.',
    'strategi-pull':
      'Latihan remote dimulai pada main yang hanya tertinggal. Contoh --rebase adalah alternatif untuk keadaan berbeda, bukan urutan wajib.',
    'commit-atomik':
      'Latihan staging: menu dan diskon sama-sama berubah, belum staged. Hanya koreksi menu siap menjadi commit.',
    review:
      'Untuk alur nyata, tersedia repo hosting dengan izin membuat branch/PR. Perintah lokal tidak otomatis membuat pull request.',
    'fork-upstream':
      'Fork sudah dibuat melalui layanan hosting. origin mengarah ke fork, remote upstream perlu ditambahkan memakai URL sumber yang sah.',
    workflow:
      'Tim mempunyai branch utama dan kesepakatan integrasi. Materi ini membandingkan pilihan, bukan meminta semua strategi dijalankan berurutan.',
    stash:
      'Latihan stash: branch fitur-diskon, diskon.js tracked berubah, catatan.txt untracked. Gunakan -u bila ingin keduanya tersimpan.',
    'stash-untracked':
      'Latihan stash untuk -u; latihan stash-index terpisah untuk --index. Mulai folder baru saat membandingkan dua skenario.',
    'apply-pop':
      'Ada entri stash yang sudah ditinjau. Untuk apply/pop pada contoh sederhana, index dan tracked working tree bersih.',
    'stash-konflik':
      'Latihan stash-conflict: HEAD dan file diskon 15; stash menyimpan perubahan dari 0 ke 10. Index bersih sebelum pop.',
    restore:
      'Repo sudah punya HEAD dan menu.json tracked. Untuk unstage, ada perubahan menu pada index dan salinan edit di working tree.',
    'reset-revert':
      'Contoh revert berlaku untuk commit biasa yang sudah direkam. Contoh soft adalah skenario lokal terpisah dengan parent yang tersedia.',
    'reset-modes':
      'Pilih salah satu latihan reset: tag awal harga 18000, HEAD 20000, index 22000, working tree 24000.',
    'reflog-rescue':
      'Latihan reflog: branch fitur dihapus; commit diskon masih tersedia melalui jejak HEAD. Main dan working tree bersih.',
    'clean-preview':
      'Latihan clean: catatan-sementara.txt untracked, cache/data.txt ignored, dan menu.json tracked berubah. Hanya catatan boleh dibuang.',
    'amend-rebase':
      'Branch pribadi punya setidaknya tiga commit dalam rentang yang ingin dirapikan. Periksa index sebelum amend; jangan ubah jalur bersama tanpa koordinasi.',
    'rebase-dasar':
      'Latihan rebase: main punya harga baru; fitur-diskon punya dua commit diskon yang belum digabung, index dan working tree bersih.',
    'cherry-pick':
      'Latihan cherry-pick: branch rilis pada dasar awal; fitur-eksperimen punya eksperimen menu lalu commit perbaikan checkout yang independen.',
    'force-lease':
      'Penulisan ulang branch remote sudah disepakati. Referensi tujuan dan object ID ekspektasi telah diperiksa. Command memuat placeholder.',
    pencarian:
      'checkout.js atau diskon.js tracked dan mempunyai riwayat. Sesuaikan rentang baris blame jika panjang file berbeda.',
    'log-pickaxe':
      'Latihan rebase mempunyai beberapa perubahan nilai diskon dengan jumlah kata diskon yang tetap. Tidak perlu menjalankan rebase dahulu.',
    bisect:
      'Latihan bisect: tag awal baik, HEAD buruk, working tree bersih. Bug yang dicari adalah diskon negatif.',
    'bisect-run':
      'Gunakan latihan bisect yang baru. Script ../uji-diskon.cjs harus dibuat lebih dahulu dan stabil untuk seluruh kandidat yang diuji.',
    tag: 'Latihan tags dimulai pada commit awal yang akan diberi v1.0.0. Nama tag belum dipakai; tidak memerlukan server.',
    'catatan-rilis':
      'Tag v1.0.0 sudah ada dan main punya commit sesudahnya. Gunakan latihan tags setelah membuat commit README tambahan.',
    hotfix:
      'Tag v1.0.0 tersedia dan main sudah maju dengan fitur yang belum masuk versi rilis. Working tree bersih sebelum membuat hotfix.',
    signing:
      'Git dan mekanisme signing yang sesuai harus dikonfigurasi untuk praktik nyata. Contoh verifikasi memerlukan tag yang memang signed dan kunci publik tepercaya.',
    'partial-staging':
      'Satu file tracked memiliki dua hunk terpisah yang mengerjakan tujuan berbeda. Pilih sendiri edit melalui editor sebelum add -p.',
    worktree:
      'Repo memiliki main; branch hotfix-checkout dan folder ../kopi-hotfix belum ada. Pilih folder saudara milikmu yang boleh dibuat.',
    'sparse-partial':
      'Latihan sparse mempunyai folder web dan docs yang keduanya sudah di-commit. Working tree bersih.',
    submodule:
      'Repo contoh memang mempunyai .gitmodules dan URL submodule yang dapat diakses. Command update dapat menghubungi remote.',
    'git-lfs':
      'Git LFS harus dipasang terpisah untuk praktik. Gunakan file contoh, dukungan server yang diketahui, dan repository yang boleh menerima aturan baru.',
    attributes:
      'Repo latihan bersih sebelum normalisasi. Buat .gitattributes melalui editor; jangan gabungkan renormalisasi dengan edit logika yang belum ditinjau.',
    'hooks-secrets':
      'Gunakan .env dummy saja. Pemeriksaan tidak membutuhkan private key, token nyata, atau unggahan ke internet.',
    hooks:
      'Repo lokal tersedia dan jalur hooks dapat diperiksa. Paket latihan memakai direktori hook kosong khusus repo.',
    aliases:
      'Berada di repo latihan. Contoh memakai konfigurasi lokal dan nama alias lg yang boleh dibuat/dihapus.',
    objects:
      'Latihan objects mempunyai HEAD, menu.json tracked, dan branch main aktif. Semua command contoh bersifat membaca.',
    'refs-refspec':
      'Latihan remote mempunyai origin dengan konfigurasi fetch serta refs main dan origin/main.',
    reachability:
      'Latihan reflog: branch dihapus tetapi commit masih tersimpan. Jangan jalankan prune selama investigasi.',
    maintenance:
      'Repo lokal mempunyai object dan referensi. Bundle adalah file baru; pilih nama output yang belum ada dan cukup ruang.',
  };
  const labs = {
    basics: {
      title: 'Tiga area',
      lesson: 'tiga-area',
      goal: 'Baca diskon 0 di HEAD/index dan diskon 10 di working tree.',
      hints: [
        'Bandingkan show HEAD:diskon.js dan show :diskon.js.',
        'Diff biasa membandingkan working tree terhadap index.',
      ],
      solution:
        'git status --short\ngit show HEAD:diskon.js\ngit show :diskon.js\ngit diff -- diskon.js',
      explanation:
        'Latihan ini observasional. Checker mengonfirmasi data awal masih tersedia; ia tidak membuktikan bahwa kamu membaca output.',
    },
    staging: {
      title: 'Commit satu tujuan',
      lesson: 'staging',
      goal: 'Commit menu 20000, sisakan diskon 10 sebagai edit unstaged.',
      hints: ['Jangan add . bila hanya menu yang siap.', 'Periksa diff --staged sebelum commit.'],
      solution:
        'git add menu.json\ngit diff --staged\ngit commit -m "Sesuaikan harga menu"\ngit status --short',
      explanation:
        'HEAD menu menjadi 20000. HEAD diskon tetap 0, sedangkan working tree diskon 10.',
    },
    branch: {
      title: 'Branch fitur',
      lesson: 'branch',
      goal: 'Buat fitur-diskon, edit diskon.js menjadi const diskon = 10; dan commit. Main tetap di versi awal.',
      hints: ['Buat branch dari main yang bersih.', 'Edit file lewat editor sebelum add.'],
      solution:
        'git switch -c fitur-diskon\n# Edit diskon.js menjadi: const diskon = 10;\ngit add diskon.js\ngit commit -m "Tambah diskon"\ngit show main:diskon.js',
      explanation:
        'Commit baru menggerakkan fitur-diskon. Referensi main dan isi snapshot main tetap pada diskon 0.',
    },
    'merge-ff': {
      title: 'Fast-forward',
      lesson: 'fast-forward',
      goal: 'Gabungkan fitur-diskon ke main tanpa membuat commit baru.',
      hints: ['Main masih ancestor fitur.', 'Bandingkan dua hash setelah merge.'],
      solution:
        'git switch main\ngit merge --ff-only fitur-diskon\ngit rev-parse main fitur-diskon',
      explanation:
        'Kedua referensi menunjuk commit fitur yang sama. Tidak ada commit pertemuan tambahan.',
    },
    'merge-conflict': {
      title: 'Konflik merge',
      lesson: 'konflik',
      goal: 'Gabungkan fitur-menu, pilih menu {"kopiSusu":22000}, lalu selesaikan merge.',
      hints: [
        'Konflik memang diharapkan pada command pertama.',
        'Edit file dan hapus semua marker sebelum add.',
      ],
      solution:
        'git merge fitur-menu\n# Edit menu.json menjadi: {"kopiSusu":22000}\ngit add menu.json\ngit -c core.editor=true merge --continue\ngit log --graph --oneline --all',
      explanation:
        'core.editor=true pada latihan ini menerima pesan merge yang sudah disiapkan tanpa membuka editor. Commit main memiliki dua parent.',
    },
    'merge-abort': {
      title: 'Batalkan merge',
      lesson: 'abort-merge',
      goal: 'Mulai merge yang konflik, amati, lalu batalkan dan buktikan main bersih kembali.',
      hints: ['Catat HEAD dahulu.', 'Abort digunakan selama proses masih berlangsung.'],
      solution:
        'git rev-parse HEAD\ngit merge fitur-menu\ngit status\ngit merge --abort\ngit status\ngit rev-parse HEAD',
      explanation:
        'Keadaan akhir sama dengan keadaan sebelum merge. Checker tidak bisa membuktikan kamu sempat menjalankan merge; bandingkan pengamatanmu sendiri.',
    },
    stash: {
      title: 'Stash dan file baru',
      lesson: 'stash-untracked',
      goal: 'Simpan diskon dan catatan baru, pastikan bersih, lalu pop dan periksa keduanya.',
      hints: ['File catatan masih untracked.', 'Gunakan -u pada push.'],
      solution:
        'git status --short\ngit stash push -u -m "WIP diskon"\ngit status\ngit stash list\ngit stash pop\ngit status --short',
      explanation:
        'Sesudah pop berhasil, entri kosong dan kedua perubahan kembali. Karena keadaan akhir bisa sama dengan awal, amati juga keadaan bersih di tengah latihan.',
    },
    'stash-index': {
      title: 'Index tetap terpisah',
      lesson: 'status-singkat',
      goal: 'Pulihkan index diskon 5 dan working tree diskon 10 tanpa menghapus entri stash.',
      hints: [
        'Perhatikan dua kolom MM sebelum push.',
        'Pakai apply --index untuk memulihkan staged state.',
      ],
      solution:
        'git stash push -m "Diskon bertahap"\ngit stash apply --index\ngit show :diskon.js\ngit diff --staged\ngit diff',
      explanation:
        'HEAD tetap 0, index kembali 5, working tree 10. Apply mempertahankan entri sehingga checker bisa membedakan dari keadaan awal.',
    },
    'stash-conflict': {
      title: 'Konflik pop',
      lesson: 'stash-konflik',
      goal: 'Pop, pilih diskon 10, commit hasil, dan biarkan entri stash konflik tetap tersimpan.',
      hints: [
        'Index awal bersih, tetapi dasar stash berbeda dari HEAD.',
        'Tidak ada stash --continue.',
      ],
      solution:
        'git stash pop\n# Edit diskon.js menjadi: const diskon = 10;\ngit add diskon.js\ngit commit -m "Selesaikan konflik diskon"\ngit stash list',
      explanation:
        'Pop yang konflik tidak menghapus entri. Kamu membuat commit hasil yang dipilih dan dapat menilai kapan simpanan aman untuk dihapus.',
    },
    'reset-soft': {
      title: 'Reset soft',
      lesson: 'reset-modes',
      goal: 'HEAD ke awal; index 22000 dan working tree 24000 tetap.',
      hints: [
        'Jalankan hanya pada folder reset-soft yang baru.',
        'Target awal adalah tag yang disediakan generator.',
      ],
      solution:
        'git reset --soft awal\ngit show HEAD:menu.json\ngit show :menu.json\ngit diff -- menu.json',
      explanation:
        'Soft hanya menggerakkan branch. Data index dan working tree tetap seperti sebelum reset.',
    },
    'reset-mixed': {
      title: 'Reset mixed',
      lesson: 'reset-modes',
      goal: 'HEAD dan index ke 18000; working tree tetap 24000.',
      hints: ['Mulai dari folder reset-mixed tersendiri.', 'Mixed mereset index dari target.'],
      solution:
        'git reset --mixed awal\ngit show HEAD:menu.json\ngit show :menu.json\ngit diff -- menu.json',
      explanation:
        'Perubahan working tree dipertahankan dan terlihat sebagai unstaged terhadap index yang kembali ke awal.',
    },
    'reset-hard': {
      title: 'Reset hard',
      lesson: 'reset-modes',
      goal: 'Pada repo latihan sekali pakai ini, kembalikan HEAD, index, dan working tree ke 18000.',
      hints: [
        'Periksa root dengan rev-parse --show-toplevel.',
        'Perubahan contoh 22000 dan 24000 memang akan dibuang.',
      ],
      solution:
        'git rev-parse --show-toplevel\ngit diff\ngit diff --staged\ngit reset --hard awal\ngit status',
      explanation:
        'Hard mengganti ketiga keadaan. Jalankan hanya di folder latihan yang memang boleh kehilangan perubahan contoh.',
    },
    reflog: {
      title: 'Pulihkan branch',
      lesson: 'reflog-rescue',
      goal: 'Buat pulih-diskon pada commit berpesan Diskon yang ingin dipulihkan.',
      hints: ['Cari melalui reflog, jangan menebak HEAD@{1}.', 'Baca show sebelum membuat branch.'],
      solution:
        'git reflog --all\ngit show HASH_KANDIDAT\ngit branch pulih-diskon HASH_KANDIDAT\ngit show pulih-diskon:diskon.js',
      explanation:
        'Ganti kedua placeholder dengan hash hasil pengamatanmu. Branch mempertahankan commit tanpa menimpa working tree.',
    },
    remote: {
      title: 'Remote tanpa internet',
      lesson: 'fetch-pull',
      goal: 'Fetch perubahan Rani, integrasikan, lalu buat satu commit README dan push. Server dan main lokal harus sama.',
      hints: [
        'Server sudah maju, origin/main lokal belum tahu.',
        'Sesudah fetch, file lokal belum otomatis berubah.',
      ],
      solution:
        'git fetch origin\ngit log --oneline main..origin/main\ngit merge --ff-only origin/main\n# Tambahkan satu kalimat di README.md melalui editor.\ngit add README.md\ngit commit -m "Perbarui panduan toko"\ngit push origin main',
      explanation:
        'Path server.git adalah remote lokal. Fetch memperbarui catatan, merge memperbarui main, dan push mengirim commit README.',
    },
    rebase: {
      title: 'Dasar baru untuk fitur',
      lesson: 'rebase-dasar',
      goal: 'Putar ulang dua commit fitur di atas main; menu baru dan diskon tetap ada.',
      hints: [
        'Catat hash fitur sebelum proses.',
        'Main mengubah menu dan fitur mengubah diskon, jadi contoh ini tidak bentrok.',
      ],
      solution:
        'git log --graph --oneline --all\ngit rebase main\ngit log --graph --oneline --all\ngit show HEAD:menu.json\ngit show HEAD:diskon.js',
      explanation:
        'Main menjadi ancestor fitur. Dua commit fitur mempunyai parent baru dan object ID pengganti.',
    },
    'cherry-pick': {
      title: 'Satu perbaikan ke rilis',
      lesson: 'cherry-pick',
      goal: 'Ambil commit Validasi jumlah checkout saja. Harga eksperimen 25000 tidak boleh masuk rilis.',
      hints: [
        'Cari hash melalui log fitur-eksperimen.',
        'Periksa checkout saja yang berubah pada commit kandidat.',
      ],
      solution:
        'git log --oneline fitur-eksperimen\ngit show HASH_PERBAIKAN\ngit cherry-pick HASH_PERBAIKAN\ngit show HEAD:menu.json',
      explanation:
        'Ganti placeholder dengan hash commit perbaikan. Perubahan checkout independen dari menu eksperimen sehingga dapat diterapkan terpisah.',
    },
    clean: {
      title: 'Bersihkan satu file',
      lesson: 'clean-preview',
      goal: 'Hapus hanya catatan-sementara.txt; cache ignored dan edit menu tetap ada.',
      hints: ['Awali dengan -n.', 'Pilih path spesifik dan hindari -x.'],
      solution:
        'git clean -nd\ngit clean -f -- catatan-sementara.txt\ngit status --short --ignored',
      explanation:
        'Clean membuang file yang belum tracked. Cache diabaikan secara default dan edit tracked tidak menjadi sasaran clean.',
    },
    bisect: {
      title: 'Pencarian biner bug',
      lesson: 'bisect',
      goal: 'Temukan commit pertama diskon negatif, buat bug-ditemukan di sana, lalu tutup bisect.',
      hints: [
        'Tag awal baik dan HEAD buruk.',
        'Pada setiap kandidat, baca diskon.js lalu pilih good atau bad.',
      ],
      solution:
        'git bisect start\ngit bisect bad\ngit bisect good awal\n# Ulangi membaca diskon.js dan beri good/bad sesuai nilainya.\n# Sesudah Git mengumumkan commit buruk pertama:\ngit branch bug-ditemukan\ngit bisect reset',
      explanation:
        'Jumlah langkah bisa berbeda menurut pemilihan kandidat. Jangan menyalin urutan jawaban tanpa membaca versi yang sedang diuji.',
    },
    tags: {
      title: 'Tag tidak ikut bergerak',
      lesson: 'tag',
      goal: 'Tag annotated v1.0.0 di awal, lalu commit perubahan README. Tag harus tetap di awal.',
      hints: ['Buat tag sebelum commit berikutnya.', 'Bandingkan tag yang di-peel dengan main.'],
      solution:
        'git tag -a v1.0.0 -m "Rilis awal"\n# Tambahkan satu kalimat di README.md melalui editor.\ngit add README.md\ngit commit -m "Lanjutkan dokumentasi"\ngit show v1.0.0\ngit log --decorate --oneline',
      explanation: 'Tag menunjuk edisi yang dipilih; commit baru hanya memajukan branch main.',
    },
    sparse: {
      title: 'Working tree terpilih',
      lesson: 'sparse-partial',
      goal: 'Tampilkan web tanpa docs, tetapi docs harus tetap tersedia di HEAD.',
      hints: [
        'Cone mode memilih direktori.',
        'Jangan menghapus docs dengan rm atau commit penghapusan.',
      ],
      solution:
        'git sparse-checkout set --cone web\ngit sparse-checkout list\ngit show HEAD:docs/panduan.md',
      explanation:
        'Pembatasan tampilan bukan penghapusan file dari snapshot. Jalankan check sebelum sparse-checkout disable.',
    },
    objects: {
      title: 'Baca penyimpanan snapshot',
      lesson: 'objects',
      goal: 'Temukan commit, root tree, dan blob menu tanpa mengedit repository.',
      hints: [
        'cat-file -t menunjukkan jenis object.',
        'HEAD:path dapat dipakai untuk menunjuk blob sebuah file.',
      ],
      solution:
        'git cat-file -p HEAD\ngit cat-file -t HEAD^{tree}\ngit ls-tree HEAD\ngit cat-file -p HEAD:menu.json',
      explanation:
        'Ini latihan observasi. Di PowerShell, kutip "HEAD^{tree}" bila shell memperlakukan ekspresi revision secara khusus.',
    },
  };
  const labLinks = {
    'kenalan-git': 'basics',
    snapshot: 'basics',
    'git-terdistribusi': 'basics',
    'tiga-area': 'basics',
    setup: 'basics',
    'terminal-folder': 'basics',
    bantuan: 'basics',
    autentikasi: 'remote',
    'mulai-repo': 'basics',
    'status-singkat': 'stash-index',
    staging: 'staging',
    ignore: 'clean',
    riwayat: 'tags',
    'log-filter': 'cherry-pick',
    'diff-versi': 'rebase',
    revision: 'bisect',
    branch: 'branch',
    'detached-head': 'rebase',
    'kelola-branch': 'merge-ff',
    'branch-tracking': 'remote',
    merge: 'merge-ff',
    'fast-forward': 'merge-ff',
    konflik: 'merge-conflict',
    'abort-merge': 'merge-abort',
    'fetch-pull': 'remote',
    upstream: 'remote',
    push: 'remote',
    'strategi-pull': 'remote',
    'commit-atomik': 'staging',
    review: 'branch',
    'fork-upstream': 'remote',
    workflow: 'merge-ff',
    stash: 'stash',
    'stash-untracked': 'stash',
    'apply-pop': 'stash',
    'stash-konflik': 'stash-conflict',
    restore: 'staging',
    'reset-revert': 'reset-soft',
    'reset-modes': 'reset-soft',
    'reflog-rescue': 'reflog',
    'clean-preview': 'clean',
    'amend-rebase': 'rebase',
    'rebase-dasar': 'rebase',
    'cherry-pick': 'cherry-pick',
    'force-lease': 'remote',
    pencarian: 'cherry-pick',
    'log-pickaxe': 'rebase',
    bisect: 'bisect',
    'bisect-run': 'bisect',
    tag: 'tags',
    'catatan-rilis': 'tags',
    hotfix: 'tags',
    signing: 'tags',
    'partial-staging': 'staging',
    worktree: 'branch',
    'sparse-partial': 'sparse',
    submodule: 'objects',
    'git-lfs': 'objects',
    attributes: 'basics',
    'hooks-secrets': 'basics',
    hooks: 'basics',
    aliases: 'basics',
    objects: 'objects',
    'refs-refspec': 'remote',
    reachability: 'reflog',
    maintenance: 'objects',
  };
  const checks = {
    'kenalan-git': 'git --version',
    snapshot: 'git show HEAD:menu.json',
    'git-terdistribusi': 'git log --oneline -5',
    'tiga-area': 'git diff\ngit diff --staged',
    setup: 'git config --show-origin --get user.name\ngit config --show-origin --get user.email',
    'terminal-folder': 'git rev-parse --show-toplevel',
    bantuan: 'git stash -h',
    autentikasi: 'git remote get-url origin',
    'mulai-repo': 'git status --short',
    'status-singkat': 'git status --short\ngit show :diskon.js',
    staging: 'git show HEAD:menu.json\ngit diff -- diskon.js',
    ignore: 'git ls-files -- .env\ngit status --short --ignored',
    riwayat: 'git log --oneline -- menu.json',
    'log-filter': 'git log --oneline -- checkout.js',
    'diff-versi': 'git diff main...fitur-diskon',
    revision: 'git log --oneline -5',
    branch: 'git log --graph --oneline --all --decorate',
    'detached-head': 'git status\ngit log --oneline --decorate -3',
    'kelola-branch': 'git branch -vv',
    'branch-tracking': 'git branch -vv',
    merge: 'git log --graph --oneline --all',
    'fast-forward': 'git rev-parse main fitur-diskon',
    konflik: 'git status\ngit log --parents -1',
    'abort-merge': 'git status\ngit rev-parse HEAD',
    'fetch-pull': 'git log --oneline --graph --all\ngit branch -vv',
    upstream: 'git branch -vv',
    push: 'git branch -vv',
    'strategi-pull': 'git log --oneline --graph --all',
    'commit-atomik': 'git show --stat HEAD\ngit status --short',
    review: 'git log --oneline -3',
    'fork-upstream': 'git remote -v',
    workflow: 'git log --graph --oneline --all',
    stash: 'git status --short\ngit stash list',
    'stash-untracked': 'git diff --staged\ngit diff\ngit stash list',
    'apply-pop': 'git stash list\ngit status --short',
    'stash-konflik': 'git ls-files -u\ngit stash list',
    restore: 'git diff --staged\ngit diff',
    'reset-revert': 'git log --oneline -3\ngit show HEAD:menu.json',
    'reset-modes': 'git show HEAD:menu.json\ngit show :menu.json\ngit diff -- menu.json',
    'reflog-rescue': 'git show pulih-diskon:diskon.js',
    'clean-preview': 'git status --short --ignored\ngit diff -- menu.json',
    'amend-rebase': 'git log --oneline --graph -6',
    'rebase-dasar': 'git log --oneline --graph --all\ngit diff main...fitur-diskon',
    'cherry-pick': 'git show HEAD:menu.json\ngit show HEAD:checkout.js',
    'force-lease': 'git branch -vv',
    pencarian: 'git log --oneline -- checkout.js',
    'log-pickaxe': 'git log --oneline -G "diskon" -- diskon.js',
    bisect: 'git show bug-ditemukan:diskon.js',
    'bisect-run': 'git status\ngit log --oneline -3',
    tag: 'git cat-file -t v1.0.0\ngit show v1.0.0',
    'catatan-rilis': 'git log --oneline v1.0.0..HEAD',
    hotfix: 'git show v1.0.1\ngit log --graph --oneline --all',
    signing: 'git config --get gpg.format',
    'partial-staging': 'git show HEAD:checkout.js\ngit diff -- checkout.js',
    worktree: 'git worktree list',
    'sparse-partial': 'git sparse-checkout list\ngit show HEAD:docs/panduan.md',
    submodule: 'git submodule status',
    'git-lfs': 'git lfs ls-files',
    attributes: 'git check-attr text eol -- checkout.js',
    'hooks-secrets': 'git ls-files -- .env',
    hooks: 'git config --get core.hooksPath',
    aliases: 'git config --get alias.lg',
    objects: 'git cat-file -p HEAD\ngit ls-tree HEAD',
    'refs-refspec': 'git show-ref',
    reachability: 'git log --oneline --all',
    maintenance: 'git bundle verify kopi-kita.bundle',
  };

  function extend(data) {
    data.lessons.push(...additions);
    const sequence = order.flat(),
      position = new Map(sequence.map((id, index) => [id, index]));
    data.lessons.sort((a, b) => position.get(a.id) - position.get(b.id));
    for (const lesson of data.lessons) {
      const chapter = order[lesson.chapter - 1],
        at = chapter.indexOf(lesson.id);
      lesson.prerequisites =
        at > 0 ? [chapter[at - 1]] : lesson.chapter > 1 ? [order[lesson.chapter - 2][0]] : [];
      lesson.initialState = contexts[lesson.id];
      lesson.lab = labLinks[lesson.id];
      lesson.objectives = [lesson.summary, `Periksa hasilnya: ${lesson.result}`];
      const commands = [
        ...new Set(
          lesson.commands
            .map((command) => command.split(' ')[1])
            .filter((command) => command && !command.startsWith('-')),
        ),
      ];
      lesson.sources = commands.map((command) => ({
        title: command === 'lfs' ? 'Dokumentasi Git LFS' : `Manual git ${command}`,
        url: command === 'lfs' ? 'https://git-lfs.com/' : `https://git-scm.com/docs/git-${command}`,
      }));
      if (!lesson.sources.length)
        lesson.sources = [{ title: 'Manual Git', url: 'https://git-scm.com/docs/git' }];
      lesson.verification = {
        command: checks[lesson.id] || 'git status --short',
        explanation: lesson.result,
      };
    }
    const staging = data.lessons.find((lesson) => lesson.id === 'staging');
    staging.scenario = staging.scenario.replace('checkout.js', 'diskon.js');
    staging.concept = staging.concept.replace('checkout', 'diskon');
    staging.result = staging.result.replace('checkout', 'diskon');
    const conflict = data.lessons.find((lesson) => lesson.id === 'konflik');
    conflict.steps[0].command = 'git merge fitur-menu\ngit status\ngit diff';
    const stash = data.lessons.find((lesson) => lesson.id === 'stash');
    stash.steps[1].command = 'git stash push -u -m "WIP diskon"';
    stash.steps[1].explanation +=
      ' Pada latihan yang juga mempunyai catatan.txt, -u menyertakan file baru tersebut.';
    const objects = data.lessons.find((lesson) => lesson.id === 'objects');
    objects.sources.push({
      title: 'Model object Git',
      url: 'https://git-scm.com/book/en/v2/Git-Internals-Git-Objects',
    });
    const rebase = data.lessons.find((lesson) => lesson.id === 'amend-rebase');
    rebase.lab = 'rebase';
    data.labs = labs;
    labs['partial-staging'] = {
      title: 'Satu hunk untuk satu tujuan',
      lesson: 'partial-staging',
      goal: 'Commit hanya perbaikan Math.max pada checkout.js; pesan Pesanan diterima tetap unstaged.',
      hints: [
        'Ada dua hunk yang berjauhan.',
        'Jawab y untuk perhitungan dan n untuk pesan; baca patch sebelum menjawab.',
      ],
      solution:
        'git add -p checkout.js\n# Pilih y pada perhitungan, n pada pesan.\ngit diff --staged\ngit commit -m "Validasi jumlah checkout"\ngit diff',
      explanation:
        'Hasil commit tetap memakai pesan Terima kasih. Working tree masih punya pesan percobaan yang belum disertakan.',
    };
    labs.revert = {
      title: 'Undo lewat commit koreksi',
      lesson: 'reset-revert',
      goal: 'Kembalikan harga ke 18000 melalui revert, sambil mempertahankan commit salah sebagai ancestor.',
      hints: [
        'HEAD adalah commit harga yang ingin dibatalkan.',
        'Jangan memakai reset bila tujuannya menjaga riwayat commit lama.',
      ],
      solution:
        'git show HEAD\ngit revert --no-edit HEAD\ngit log --oneline -3\ngit show HEAD:menu.json',
      explanation:
        'Revert membuat satu commit koreksi setelah commit salah. Tidak ada penulisan ulang atau pemindahan branch ke commit awal.',
    };
    data.lessons.find((lesson) => lesson.id === 'partial-staging').lab = 'partial-staging';
    data.lessons.find((lesson) => lesson.id === 'reset-revert').lab = 'revert';
    data.lessons
      .find((lesson) => lesson.id === 'hooks')
      .sources.push({
        title: 'Peristiwa dan kontrak hooks',
        url: 'https://git-scm.com/docs/githooks',
      });
    data.lessons
      .find((lesson) => lesson.id === 'attributes')
      .sources.push({
        title: 'Aturan atribut path',
        url: 'https://git-scm.com/docs/gitattributes',
      });
    data.lessons.find((lesson) => lesson.id === 'bisect').verification.explanation =
      'Setelah latihan pendamping, bug-ditemukan menunjuk commit pertama diskon negatif. Bila hanya mencatat hash tanpa membuat branch, gunakan hash temuan pada git show.';
    labs.bisect.solution = labs.bisect.solution.replace(
      'git branch bug-ditemukan\n',
      'git branch bug-ditemukan HASH_BURUK_PERTAMA\n',
    );
    labs.bisect.explanation +=
      ' Ganti HASH_BURUK_PERTAMA dengan hash yang diumumkan Git; HEAD pada saat pengumuman belum tentu commit itu.';
    data.problems.push(
      ['File baru tertinggal setelah stash', 'stash-untracked'],
      ['Mau undo tanpa membuang edit', 'reset-modes'],
      ['Commit hilang sesudah branch dihapus', 'reflog-rescue'],
      ['Perlu membatalkan merge yang masih konflik', 'abort-merge'],
      ['Ingin membersihkan file sementara', 'clean-preview'],
      ['Hanya perlu satu folder monorepo', 'sparse-partial'],
    );
    data.glossary.push(
      [
        'Refspec',
        'Pemetaan sumber dan tujuan referensi untuk pertukaran Git, misalnya heads server ke remote-tracking refs lokal.',
      ],
      [
        'Reachability',
        'Hubungan keterjangkauan object dari referensi melalui hubungan commit, parent, tree, dan blob.',
      ],
      ['Gitlink', 'Entri tree superproject yang mencatat object ID commit submodule.'],
      ['Dry-run', 'Pratinjau tindakan tanpa melaksanakannya, seperti clean -n.'],
    );
  }

  const api = { extend, order, labs };
  root.GitGuidesCurriculum = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
