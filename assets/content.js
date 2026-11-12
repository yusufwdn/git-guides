(function (root) {
  'use strict';
  const chapters = [
    [1, 'Memahami Git', 'Mulai dari alasan Git ada, lalu kenali keadaan pekerjaanmu.', 'Fondasi'],
    [2, 'Siapkan tempat kerja', 'Siapkan Git, identitas, dan cara mencari bantuan.', 'Fondasi'],
    [
      3,
      'Perubahan jadi commit',
      'Pilih perubahan dengan sengaja dan buat snapshot pertama.',
      'Fondasi',
    ],
    [4, 'Membaca jejak perubahan', 'Jelajahi riwayat dan bandingkan versi proyek.', 'Fondasi'],
    [5, 'Bekerja dengan branch', 'Beri pekerjaan baru jalurnya sendiri.', 'Kerja sehari-hari'],
    [6, 'Merge tanpa panik', 'Gabungkan pekerjaan dan pahami konflik.', 'Kerja sehari-hari'],
    [
      7,
      'Lokal bertemu remote',
      'Pahami arah perjalanan fetch, pull, dan push.',
      'Kerja sehari-hari',
    ],
    [
      8,
      'Git untuk kerja tim',
      'Berkontribusi, menerima review, dan memilih workflow.',
      'Kerja sehari-hari',
    ],
    [
      9,
      'Jeda dengan stash',
      'Simpan pekerjaan sementara, lalu lanjutkan saat siap.',
      'Lebih percaya diri',
    ],
    [
      10,
      'Undo & pemulihan',
      'Pilih cara membatalkan sesuai keadaan perubahanmu.',
      'Lebih percaya diri',
    ],
    [11, 'Rapikan riwayat', 'Susun cerita perubahan yang mudah ditinjau.', 'Lebih percaya diri'],
    [
      12,
      'Menelusuri sumber bug',
      'Biarkan riwayat membantumu menyelidiki masalah.',
      'Lebih percaya diri',
    ],
    [
      13,
      'Tag, hotfix & rilis',
      'Tandai versi dan rawat perubahan yang sudah dirilis.',
      'Menyelam lebih dalam',
    ],
    [
      14,
      'Alat yang bikin efisien',
      'Kerjakan lebih banyak dengan staging parsial dan worktree.',
      'Menyelam lebih dalam',
    ],
    [
      15,
      'Kebiasaan tim yang sehat',
      'Jaga konsistensi file, otomasi, dan kredensial.',
      'Menyelam lebih dalam',
    ],
    [
      16,
      'Di balik layar Git',
      'Hubungkan object, snapshot, dan referensi.',
      'Menyelam lebih dalam',
    ],
  ].map(([id, title, description, group]) => ({ id, title, description, group }));

  const lessons = [];

  function lesson(
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
    lessons.push({
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
      minutes: steps.length * 2 + 2,
      level: chapter < 5 ? 'Dasar' : chapter < 13 ? 'Menengah' : 'Lanjutan',
    });
  }

  lesson(
    1,
    'kenalan-git',
    'Versi berubah. Jejaknya tetap ada.',
    'Kenali Git sebagai pencatat snapshot proyek, supaya perubahan bisa dipahami dan ditinjau kembali.',
    'Kamu punya menu-final.html, menu-final-baru.html, dan menu-final-beneran.html. Rekanmu mengedit salinan yang berbeda. Versi mana yang sebenarnya dipakai?',
    'Git adalah version control terdistribusi. Commit merekam snapshot file yang dilacak beserta metadata dan hubungan ke riwayat sebelumnya. Repository lokal bisa dipakai tanpa koneksi internet. GitHub dan GitLab adalah layanan yang bisa menyimpan repository remote dan menambahkan fitur kolaborasi.',
    'Bayangkan album foto perkembangan tokomu. Foto menyimpan keadaan pada suatu waktu, sementara keterangan menjelaskan alasan perubahan. Git menyimpan snapshot proyek, bukan foto layar dan bukan hanya daftar baris yang diedit.',
    [
      [
        'Kenali Git yang terpasang',
        'git --version',
        'Perintah ini menampilkan versi Git di komputermu. Jika belum tersedia, lanjutkan ke bab persiapan.',
      ],
      [
        'Baca pengantar lokal',
        'git help git',
        'Buka manual utama. Sebagian sistem menampilkan manual di browser atau pager; tekan q untuk keluar dari pager.',
      ],
    ],
    'Kamu bisa membedakan Git, repository, commit, dan layanan hosting. Tidak ada file proyek yang berubah dalam demonstrasi ini.',
    'Git bukan backup otomatis seluruh komputer. Perubahan yang belum direkam dan file yang tidak dilacak tidak otomatis tersimpan dalam riwayat.',
    'Bayangkan perubahan harga menu minggu ini. Tuliskan keadaan yang perlu direkam dan alasan yang akan kamu sertakan pada commit.',
    [
      'Mana yang bisa dilakukan tanpa internet?',
      [
        'Membuat commit di repository lokal',
        'Mengirim push ke server internet',
        'Membuka pull request di GitHub',
      ],
      0,
      'Commit adalah operasi lokal. Komunikasi dengan server memerlukan akses ke remote tersebut.',
    ],
    ['git --version', 'git help'],
  );

  lesson(
    1,
    'tiga-area',
    'Kenali tiga tempat perubahanmu.',
    'Working tree, staging area, dan snapshot HEAD menjawab tiga pertanyaan yang berbeda.',
    'Harga kopi dan teks tombol berubah bersamaan. Kamu ingin menyimpan harga sekarang, tetapi teks tombol masih perlu dibahas.',
    'Working tree adalah file yang kamu edit. Index atau staging area menyusun snapshot untuk commit berikutnya. HEAD biasanya merujuk branch aktif, yang menunjuk commit terakhirnya. Setelah git add, edit tambahan pada file yang sama belum otomatis ikut staged.',
    'Meja kerja berisi semua bahan. Nampan persiapan memuat pilihan yang akan disajikan. Album menyimpan hasil yang sudah direkam. Nampan di sini adalah snapshot usulan, bukan sekadar daftar nama file.',
    [
      [
        'Periksa semua keadaan',
        'git status',
        'Lihat bagian staged, unstaged, dan untracked. Untracked berarti file belum ada dalam index.',
      ],
      [
        'Lihat perubahan di meja kerja',
        'git diff',
        'Bandingkan perubahan pada file tracked di working tree terhadap index.',
      ],
      [
        'Periksa isi calon commit',
        'git diff --staged',
        'Bandingkan index terhadap HEAD. Inilah perubahan yang akan direkam saat commit.',
      ],
    ],
    'Kamu tahu apakah suatu perubahan masih di working tree, sudah staged, atau sudah menjadi bagian commit.',
    'git diff kosong tidak selalu berarti semua bersih. Perubahan mungkin sudah staged, atau ada file untracked yang tidak ditampilkan oleh diff biasa.',
    'Di repo latihan, edit sebuah file, jalankan add, lalu edit lagi. Bandingkan diff dan diff --staged untuk file yang sama.',
    [
      'Setelah add, kamu mengedit file lagi. Apa isi commit berikutnya?',
      [
        'Selalu versi terbaru di editor',
        'Versi yang terakhir dimasukkan ke index',
        'Semua file di folder',
      ],
      1,
      'Commit merekam index. Jalankan add lagi jika edit terbaru juga ingin disertakan.',
    ],
    ['git status', 'git diff', 'git diff --staged'],
  );

  lesson(
    2,
    'setup',
    'Siapkan Git untuk pekerjaanmu.',
    'Pasang Git dan atur identitas yang akan tercatat pada commit.',
    'Kamu baru bergabung di proyek Kopi Kita. Commit pertama justru memakai nama pengguna komputer lama.',
    'Instal Git dari git-scm.com/install untuk sistem operasimu. Di Windows kamu bisa memakai PowerShell atau Git Bash; macOS/Linux bisa memakai terminal yang tersedia. Konfigurasi --global berlaku untuk akun pengguna, sedangkan --local berlaku untuk satu repository dan menimpa nilai global untuk repo tersebut.',
    'Identitas commit seperti nama penulis di buku catatan. Nama ini mencatat kepengarangan; ia bukan password dan tidak otomatis membuatmu login ke server.',
    [
      [
        'Periksa instalasi',
        'git --version',
        'Buka terminal baru sesudah instalasi bila perintah belum dikenali.',
      ],
      [
        'Atur identitas',
        'git config --global user.name "Nama Kamu"\ngit config --global user.email "kamu@example.com"',
        'Ganti dengan identitasmu. Untuk proyek kantor tertentu, jalankan konfigurasi tanpa --global dari dalam repo.',
      ],
      [
        'Periksa asal konfigurasi',
        'git config --list --show-origin',
        'Lihat file mana yang memberikan nilai konfigurasi. Hindari membagikan output yang berisi informasi sensitif.',
      ],
    ],
    'Commit baru menggunakan identitas yang benar. Konfigurasi identitas tidak mengubah author pada commit lama.',
    'Email commit dapat terlihat ketika repository dibagikan. Gunakan email yang memang boleh dipublikasikan atau alamat privasi dari layanan hosting.',
    'Atur identitas global lalu gunakan --local di repo latihan. Periksa nilai user.email dari dalam dan luar repo.',
    [
      'Konfigurasi mana yang menang untuk repo tertentu?',
      ['Nilai --local pada repo itu', 'Nilai --global selalu menang', 'Yang namanya paling pendek'],
      0,
      'Konfigurasi repository menimpa nilai global yang sama.',
    ],
    ['git config', 'git --version'],
  );

  lesson(
    2,
    'bantuan',
    'Saat lupa, tahu tempat bertanya.',
    'Gunakan bantuan bawaan Git dan pahami terminal sebelum menyalin command.',
    'Tutorial memakai opsi yang belum kamu kenal. Kamu ingin memeriksanya sebelum menjalankan command pada pekerjaan asli.',
    'git <command> -h menampilkan bantuan singkat. git help <command> membuka manual yang lebih lengkap. Placeholder seperti <file> harus diganti dan tanda kurung sudutnya tidak ikut diketik. Teks output bukan command yang perlu dijalankan.',
    'Bantuan singkat seperti label pada alat; manual lengkap seperti buku petunjuk. Baca bagian yang sesuai pekerjaanmu.',
    [
      [
        'Baca ringkasan',
        'git stash -h',
        'Perhatikan opsi -u dan -m. Bantuan singkat bisa keluar dengan exit code nonzero walau informasinya berhasil ditampilkan.',
      ],
      [
        'Buka manual',
        'git help stash',
        'Di pager tekan / untuk mencari dan q untuk keluar. Jika manual lokal tidak tersedia, buka manual resmi online.',
      ],
    ],
    'Kamu bisa memeriksa sintaks tanpa mengubah repository.',
    'Command dari shell POSIX belum tentu bekerja di PowerShell, terutama kutip, variabel, dan perintah membuat file. Command Git dasar pada panduan ini dipilih agar bisa digunakan di keduanya.',
    'Cari arti --staged pada bantuan git diff. Jelaskan apa yang dibandingkan tanpa mencoba menghafal semua opsi.',
    [
      'Dalam git add <file>, apa yang kamu ketik?',
      [
        'git add <file> secara literal',
        'git add menu.json untuk file menu.json',
        'Hanya nama file',
      ],
      1,
      'Tanda <...> menandai nilai yang perlu kamu ganti.',
    ],
    ['git help', 'git stash -h'],
  );

  lesson(
    3,
    'mulai-repo',
    'Mulai dari satu repository.',
    'Pilih init untuk proyek baru atau clone untuk meneruskan proyek yang sudah ada.',
    'Folder website kopi sudah ada di laptopmu. Rekan lain justru akan mulai dari repository yang sudah tersimpan di server.',
    'git init membuat metadata Git pada folder proyek. git clone membuat salinan repository beserta riwayat dan biasanya mengatur remote bernama origin. Keduanya adalah pintu masuk alternatif; kamu tidak perlu init di dalam folder hasil clone.',
    'init berarti menyiapkan buku catatan baru. clone berarti memperoleh salinan buku beserta catatan yang sudah dibuat orang lain.',
    [
      [
        'Buat repo di folder proyek',
        'git init -b main',
        'Jalankan dari folder yang memang ingin dilacak. Opsi -b tersedia sejak Git 2.28.',
      ],
      [
        'Periksa keadaan awal',
        'git status',
        'File yang belum ditambahkan akan terlihat sebagai untracked. Branch pertama belum memiliki commit sampai kamu membuatnya.',
      ],
      [
        'Alternatif untuk proyek tim',
        'git clone https://example.com/tim/kopi-kita.git',
        'URL ini contoh. Ganti dengan URL repository yang benar dan bisa kamu akses; jalankan dari folder induk.',
      ],
    ],
    'Proyek baru memiliki folder .git, atau proyek tim sudah tersedia sebagai hasil clone.',
    'Hindari init pada folder induk yang memuat banyak proyek berbeda. Periksa lokasi terminal sebelum memulai.',
    'Buat folder latihan kosong, init main, lalu buat README.md melalui editor. Periksa apakah status menunjukkan README sebagai untracked.',
    [
      'Proyek sudah ada di server. Mulai dengan apa?',
      ['git clone URL-repo', 'git init di setiap subfolder', 'git push sebelum punya repository'],
      0,
      'Clone mengambil repository yang sudah ada, termasuk riwayatnya.',
    ],
    ['git init', 'git clone', 'git status'],
  );

  lesson(
    3,
    'staging',
    'Pilih perubahan. Baru rekam.',
    'Pahami git add dan commit dengan melihat isi yang benar-benar masuk snapshot.',
    'Kamu memperbaiki harga pada menu.json dan masih bereksperimen pada checkout.js. Hanya koreksi menu yang sudah siap.',
    'git add menyalin isi file saat itu ke index. git commit merekam snapshot index. Gunakan path yang spesifik untuk memisahkan pekerjaan, lalu periksa diff --staged sebelum commit. File lain yang masih berubah tetap berada di working tree.',
    'Sebelum mengirim paket, pilih barang yang memang siap, periksa isinya, lalu segel. Barang di meja yang belum dipilih tidak ikut terkirim.',
    [
      [
        'Lihat pekerjaanmu',
        'git status\ngit diff',
        'Pastikan kamu tahu file mana yang sudah siap dan perubahan mana yang masih percobaan.',
      ],
      [
        'Siapkan hanya menu',
        'git add menu.json\ngit diff --staged',
        'Yang disiapkan adalah versi menu saat add dijalankan. Perubahan checkout belum ikut.',
      ],
      [
        'Rekam satu tujuan',
        'git commit -m "Perbaiki harga kopi susu"',
        'Pesan menjelaskan tujuan perubahan. Gunakan status lagi untuk melihat pekerjaan yang masih tersisa.',
      ],
    ],
    'Ada satu commit baru untuk koreksi menu. Eksperimen checkout tetap belum di-commit.',
    'git add . dapat memasukkan perubahan yang belum kamu maksudkan. Periksa status dan staged diff, terutama saat banyak file berubah.',
    'Ubah dua file di repo latihan. Commit hanya satu, lalu buktikan file kedua masih berubah melalui status.',
    [
      'Apa yang direkam oleh git commit?',
      [
        'Seluruh file di komputer',
        'Snapshot pada index',
        'Hanya file yang sedang dibuka di editor',
      ],
      1,
      'Index menentukan isi snapshot commit berikutnya.',
    ],
    ['git add', 'git commit', 'git diff --staged'],
    'staging',
  );

  lesson(
    3,
    'ignore',
    'Ada file yang tak perlu ikut.',
    'Gunakan .gitignore untuk file hasil build, dependency, dan konfigurasi lokal.',
    'Folder node_modules dan file .env muncul di status. Keduanya tidak ingin kamu masukkan ke riwayat proyek.',
    '.gitignore berisi pola untuk file yang belum dilacak. Contoh pola adalah node_modules/, dist/, dan .env. Jika suatu file sudah tracked, menambahkan polanya tidak menghentikan pelacakannya. git rm --cached menghapusnya dari index sambil mempertahankan salinan lokal.',
    'Daftar barang yang tidak perlu dicatat membantu memilih bahan baru. Daftar itu tidak menghapus catatan yang terlanjur masuk buku.',
    [
      [
        'Buat daftar melalui editor',
        'git status',
        'Buat .gitignore dan isi pola yang relevan, lalu periksa daftar untracked.',
      ],
      [
        'Telusuri aturan ignore',
        'git check-ignore -v .env',
        'Pada file untracked yang diabaikan, perintah ini menunjukkan pola yang cocok.',
      ],
      [
        'Berhenti melacak file lokal',
        'git rm --cached .env\ngit add .gitignore\ngit commit -m "Abaikan konfigurasi lokal"',
        'Jalankan rm --cached hanya jika .env sudah tracked dan memang harus dikeluarkan dari index.',
      ],
    ],
    'File lokal diabaikan untuk penambahan berikutnya, dan aturan ignore bisa dibagikan melalui commit.',
    'Mengeluarkan secret dari commit terbaru tidak menghapusnya dari riwayat lama. Cabut atau rotasi kredensial yang terpapar terlebih dahulu.',
    'Buat notes-local.txt, abaikan dengan .gitignore, lalu periksa aturan yang cocok menggunakan check-ignore.',
    [
      'Apakah .gitignore menghentikan pelacakan file yang sudah tracked?',
      ['Ya, otomatis', 'Tidak, index harus diperbarui juga', 'Ya, setelah membuka ulang editor'],
      1,
      'Ignore terutama berlaku pada file yang belum tracked.',
    ],
    ['git check-ignore', 'git rm --cached'],
  );

  lesson(
    4,
    'riwayat',
    'Baca cerita di balik commit.',
    'Gunakan log dan show untuk menemukan perubahan tanpa menebak-nebak.',
    'Harga kopi di website berbeda dari daftar kasir. Kamu ingin tahu commit mana yang mengubahnya dan apa alasan penulisnya.',
    'git log menelusuri commit yang dapat dicapai dari titik awal. --oneline meringkas tampilan, --graph menggambar hubungan parent, dan --all menyertakan referensi lain. git show menampilkan detail satu commit, termasuk patch secara default untuk commit biasa.',
    'Log adalah daftar isi album; show membuka satu halaman lengkap dengan keterangannya.',
    [
      [
        'Lihat peta riwayat',
        'git log --oneline --graph --all --decorate',
        'Cari hubungan branch dan pesan perubahan. Hash pendek adalah identitas yang cukup unik dalam repo itu.',
      ],
      [
        'Fokus pada satu file',
        'git log --oneline -- menu.json',
        'Pemisah -- menyatakan bagian berikutnya adalah path.',
      ],
      [
        'Periksa snapshot terbaru',
        'git show HEAD -- menu.json',
        'Lihat perubahan menu pada commit yang ditunjuk HEAD. Gunakan hash untuk commit lain.',
      ],
    ],
    'Kamu menemukan perubahan yang relevan dan bisa membaca patch-nya sebelum mengambil tindakan.',
    'Urutan baris log tidak selalu menggambarkan satu jalur lurus. Merge bisa mempunyai lebih dari satu parent; gunakan grafik untuk konteks.',
    'Cari dua commit terakhir yang mengubah README.md dan jelaskan perbedaan tujuan keduanya.',
    [
      'Perintah mana yang cocok untuk memeriksa satu commit?',
      ['git show HASH', 'git add HASH', 'git init HASH'],
      0,
      'Show membuka detail object atau commit yang kamu pilih.',
    ],
    ['git log', 'git show'],
    'graph',
  );

  lesson(
    4,
    'revision',
    'Bandingkan titik dalam riwayat.',
    'Pahami HEAD, parent, dan dua versi yang sedang dibandingkan.',
    'Sebuah perubahan layout muncul pada commit terakhir. Kamu ingin membandingkan keadaan proyek tepat sebelum perubahan itu.',
    'HEAD biasanya merupakan symbolic reference ke branch aktif. HEAD~1 mengikuti first parent satu langkah; HEAD^2 memilih parent kedua pada merge commit. git diff A B membandingkan keadaan dua commit. A..B pada log berarti commit yang dapat dicapai dari B tetapi tidak dari A.',
    'HEAD seperti penanda posisi bacaan. Branch adalah label yang bergerak saat ada commit baru; tag biasanya dipakai untuk menunjuk versi tertentu.',
    [
      [
        'Bandingkan dengan parent pertama',
        'git diff HEAD~1 HEAD',
        'Perlu ada parent pada commit saat ini. Ini menampilkan beda snapshot, bukan memindahkan HEAD.',
      ],
      [
        'Lihat bagian riwayat terakhir',
        'git log --oneline HEAD~3..HEAD',
        'Contoh memerlukan setidaknya tiga langkah parent pertama. Untuk riwayat pendek, pilih hash yang tersedia.',
      ],
    ],
    'Kamu bisa menyebut dua titik yang dibandingkan dan membedakan rentang log dari perbandingan snapshot.',
    'HEAD~2 dan HEAD^2 berbeda. Yang pertama dua langkah first parent; yang kedua parent kedua dari commit saat ini.',
    'Pada repo dengan tiga commit atau lebih, bandingkan HEAD~1 dengan HEAD dan periksa apakah patch sesuai perubahan terakhir.',
    [
      'HEAD~1 menunjuk ke mana?',
      ['Branch alfabet pertama', 'Parent pertama satu langkah dari HEAD', 'Parent kedua selalu'],
      1,
      'Tanda ~ mengikuti jalur first parent sebanyak angka yang diberikan.',
    ],
    ['git diff', 'git rev-parse'],
    'graph',
  );

  lesson(
    5,
    'branch',
    'Kasih ide baru jalurnya sendiri.',
    'Buat branch fitur dan lihat labelnya bergerak saat commit bertambah.',
    'Kamu mau mencoba diskon akhir pekan. Sementara itu, main harus tetap mewakili keadaan yang siap dipakai tim.',
    'Branch adalah referensi ringan ke commit. git switch -c membuat branch dan berpindah ke sana. Commit baru menggerakkan branch aktif. Membuat branch tidak menyalin seluruh proyek menjadi folder terpisah.',
    'Bayangkan beberapa penanda buku pada album yang sama. Saat kamu menambahkan halaman di jalur fitur, penanda fitur maju, sedangkan penanda main tetap.',
    [
      [
        'Periksa keadaan awal',
        'git status\ngit branch',
        'Pastikan perubahan lokal diketahui. Switch bisa ditolak jika perubahan akan tertimpa; perubahan yang kompatibel bisa terbawa.',
      ],
      [
        'Buat jalur fitur',
        'git switch -c fitur-diskon',
        'Nama branch baru dimulai dari commit saat ini. switch tersedia sejak Git 2.23.',
      ],
      [
        'Kembali ke jalur utama',
        'git switch main',
        'Setelah pekerjaan sudah disimpan dengan tepat, pindah kembali ke main.',
      ],
    ],
    'main dan fitur-diskon dapat menunjuk titik yang berbeda tanpa kehilangan riwayat yang sama.',
    'Branch bukan tempat penyimpanan otomatis perubahan yang belum di-commit. Perubahan lokal bisa ikut berpindah branch bila tidak akan tertimpa.',
    'Buat branch fitur, ubah README, commit, lalu switch main. Periksa apakah isi README kembali ke snapshot main.',
    [
      'Apa yang bergeser setelah commit di branch fitur?',
      ['Semua branch', 'Referensi branch yang aktif', 'Semua tag'],
      1,
      'Commit memperbarui branch aktif, sementara referensi lain tetap.',
    ],
    ['git branch', 'git switch'],
    'graph',
  );

  lesson(
    5,
    'detached-head',
    'Saat HEAD lepas dari branch.',
    'Jelajahi commit lama dan beri nama pada pekerjaan yang ingin disimpan.',
    'Kamu membuka versi lama untuk menguji bug. Sesudah mencoba perbaikan, Git menyebut detached HEAD.',
    'Dalam detached HEAD, HEAD menunjuk commit secara langsung. Kamu masih dapat membuat commit, tetapi tidak ada branch aktif yang bergerak bersamanya. Buat branch sebelum meninggalkan pekerjaan yang ingin dipertahankan. Nama checkout dalam tutorial lama bisa berarti pindah branch ataupun memulihkan file; switch dan restore memisahkan tujuannya.',
    'Kamu sedang membaca halaman tertentu tanpa memasang penanda bernama. Pasang penanda baru agar mudah kembali ke hasil pekerjaanmu.',
    [
      [
        'Kunjungi versi lama',
        'git switch --detach HEAD~1',
        'Jalankan hanya jika parent tersebut ada. Kamu sekarang berada pada commit tanpa branch aktif.',
      ],
      [
        'Pertahankan pekerjaan',
        'git switch -c investigasi-checkout',
        'Branch baru menunjuk commit saat ini, termasuk commit percobaan yang sudah kamu buat di detached HEAD.',
      ],
    ],
    'Pekerjaan mempunyai branch yang dapat ditemukan sebelum kamu kembali ke main.',
    'Jika sudah terlanjur pindah, reflog mungkin membantu menemukan commit. Jangan menganggap semua perubahan yang belum direkam bisa dipulihkan.',
    'Buka commit sebelumnya dalam repo latihan, buat branch investigasi, lalu periksa posisi HEAD dengan log --decorate.',
    [
      'Bagaimana menyimpan jalur pekerjaan detached HEAD?',
      [
        'Hapus folder .git',
        'Buat branch pada commit pekerjaan itu',
        'Jalankan push tanpa memeriksa apa pun',
      ],
      1,
      'Branch memberi referensi bernama pada commit agar jalurnya mudah dipertahankan.',
    ],
    ['git switch --detach', 'git switch -c'],
    'graph',
  );

  lesson(
    6,
    'merge',
    'Dua jalur, satu hasil bersama.',
    'Pahami fast-forward dan merge commit sebelum menggabungkan branch.',
    'Fitur diskon selesai. Kamu ingin memasukkannya ke main tanpa kehilangan perubahan yang sudah masuk di main.',
    'Merge memasukkan riwayat branch lain ke branch aktif. Jika main adalah ancestor fitur, fast-forward cukup menggeser referensi main. Jika keduanya berkembang sendiri, merge biasanya membuat commit dengan dua parent. Jalankan merge dari branch yang ingin menerima hasil.',
    'Dua jalur perjalanan bertemu. Jika satu jalur hanya meneruskan yang lain, cukup majukan penanda. Jika keduanya punya langkah sendiri, catat titik pertemuannya.',
    [
      [
        'Pilih penerima',
        'git switch main\ngit status',
        'Pastikan pekerjaan lokal sudah ditangani sebelum integrasi.',
      ],
      [
        'Gabungkan fitur',
        'git merge fitur-diskon',
        'Git dapat melakukan fast-forward, membuat merge commit, atau berhenti karena konflik.',
      ],
      [
        'Periksa hasil',
        'git log --oneline --graph --decorate -8',
        'Uji aplikasinya juga; merge tanpa konflik belum menjamin perilaku program benar.',
      ],
    ],
    'main mencakup perubahan fitur, dengan bentuk riwayat sesuai hubungan kedua branch.',
    'Menggabungkan main saat sedang di branch fitur tidak otomatis memperbarui referensi main. Arah merge mengikuti branch aktif.',
    'Buat satu commit fitur saat main belum berubah, lalu merge. Ulangi dengan main yang juga berubah dan bandingkan grafiknya.',
    [
      'git merge fitur saat branch aktif main memperbarui apa?',
      ['main', 'Hanya fitur', 'Semua remote'],
      0,
      'Branch aktif menerima hasil integrasi.',
    ],
    ['git merge'],
    'graph',
  );

  lesson(
    6,
    'konflik',
    'Konflik itu keputusan yang tertunda.',
    'Baca kedua perubahan, putuskan hasil yang benar, lalu lanjutkan merge.',
    'Kamu dan Rani mengubah harga kopi pada baris yang sama. Git tidak tahu harga mana yang disepakati tim.',
    'Konflik berarti Git membutuhkan keputusanmu. Marker <<<<<<<, =======, dan >>>>>>> memisahkan versi yang bentrok. Dalam merge biasa, ours merujuk branch aktif dan theirs ke sisi yang digabung. Maknanya bisa membingungkan pada rebase, jadi baca konteks dan isi file.',
    'Dua orang memberi koreksi berbeda pada satu kalimat. Penyunting harus memilih atau merangkai kalimat akhir berdasarkan maksud kedua perubahan.',
    [
      [
        'Baca keadaan konflik',
        'git status\ngit diff',
        'Buka file yang konflik dan pahami maksud kedua sisi. Edit hasil akhirnya, lalu hapus semua marker.',
      ],
      [
        'Tandai sudah diselesaikan',
        'git add menu.json\ngit diff --staged',
        'Add berarti kamu menyatakan file ini sudah diselesaikan. Periksa dan uji hasilnya.',
      ],
      [
        'Selesaikan atau batalkan',
        'git merge --continue',
        'Jika belum ingin melanjutkan, alternatifnya adalah git merge --abort selama merge masih berlangsung.',
      ],
    ],
    'Merge selesai dengan hasil yang kamu pilih, atau proses dibatalkan sebelum diselesaikan.',
    'Jangan hanya menghapus marker dan menganggap hasil sudah benar. Perubahan yang tidak bentrok secara teks pun bisa bermasalah secara logika.',
    'Di repo latihan, ubah baris menu yang sama di dua branch. Gabungkan, pilih harga yang disepakati, dan periksa tidak ada marker tersisa.',
    [
      'Setelah mengedit file konflik, langkah berikutnya?',
      ['git add file yang diselesaikan', 'Menghapus seluruh repository', 'Langsung force push'],
      0,
      'Add memperbarui index dengan hasil penyelesaian sebelum merge dilanjutkan.',
    ],
    ['git merge --continue', 'git merge --abort'],
    'conflict',
  );

  lesson(
    7,
    'fetch-pull',
    'Ambil kabar dulu. Baru gabungkan.',
    'Pisahkan fetch dari integrasi supaya arah perubahan lebih mudah dipahami.',
    'Rani sudah menambah menu di remote. Kamu ingin memeriksa perubahannya tanpa langsung mengubah file kerja.',
    'git fetch mengambil object dan memperbarui remote-tracking refs sesuai konfigurasi, misalnya origin/main. Ia tidak otomatis menggabungkannya ke branch lokal. git pull menjalankan fetch lalu integrasi; hasilnya dipengaruhi opsi dan konfigurasi merge, rebase, atau fast-forward.',
    'Fetch seperti menerima surat ke kotak masuk. Merge atau rebase adalah keputusan untuk memasukkan kabar itu ke pekerjaanmu.',
    [
      [
        'Ambil pembaruan',
        'git fetch origin',
        'origin adalah nama remote, bukan branch. Kamu dapat melihat URL-nya melalui git remote -v.',
      ],
      [
        'Bandingkan lokal dan catatan remote',
        'git log --oneline main..origin/main\ngit diff main origin/main',
        'Ini memeriksa perbedaan terhadap keadaan remote yang terakhir diambil.',
      ],
      [
        'Integrasi yang hanya boleh maju',
        'git switch main\ngit merge --ff-only origin/main',
        'Jika jalurnya sudah bercabang, perintah berhenti. Tentukan strategi integrasi sesuai kesepakatan tim.',
      ],
    ],
    'Kamu mengetahui perubahan remote sebelum memutuskan integrasi.',
    'origin/main adalah catatan lokal tentang branch remote pada saat fetch terakhir, bukan tampilan live server.',
    'Gunakan dua clone repo latihan. Push dari clone pertama, fetch dari clone kedua, dan amati bahwa file kerja clone kedua belum berubah.',
    [
      'Apakah fetch otomatis mengubah file di branch aktif?',
      ['Ya, selalu', 'Tidak, fetch bukan integrasi', 'Ya, jika namanya origin'],
      1,
      'Fetch memperbarui data dan referensi remote-tracking; integrasi adalah langkah lain.',
    ],
    ['git fetch', 'git pull', 'git remote'],
    'remote',
  );

  lesson(
    7,
    'push',
    'Kirim perubahan yang sudah direkam.',
    'Atur upstream dan tangani penolakan push dengan memahami riwayat.',
    'Branch fitur sudah punya commit lokal. Kamu ingin membagikannya agar rekan dapat melakukan review.',
    'Push mengirim object yang dibutuhkan dan meminta server memperbarui referensi tujuan. Upstream menghubungkan branch lokal dengan branch remote untuk operasi tertentu. Push non-fast-forward bisa ditolak ketika perubahan tujuan tidak tercakup dalam jalur yang kamu kirim.',
    'Kamu mengirim halaman baru ke album bersama. Jika versi bersama sudah maju dengan halaman lain, jangan langsung menimpanya; pelajari kedua jalurnya.',
    [
      [
        'Periksa tujuan',
        'git remote -v\ngit branch -vv',
        'Pastikan remote dan branch aktif sesuai. Autentikasi remote terpisah dari user.name dan user.email.',
      ],
      [
        'Bagikan branch fitur',
        'git push -u origin fitur-diskon',
        'Opsi -u menetapkan upstream setelah push berhasil. Remote harus ada dan kamu harus memiliki akses.',
      ],
      [
        'Jika push ditolak',
        'git fetch origin\ngit log --oneline --graph --all -12',
        'Periksa perbedaan, lalu integrasikan menurut workflow tim sebelum mencoba push lagi.',
      ],
    ],
    'Commit fitur tersedia di remote dan branch mempunyai upstream.',
    'Jangan memakai --force sebagai obat setiap push rejected. Penolakan juga bisa berasal dari izin, autentikasi, atau protected branch.',
    'Bagikan branch latihan ke bare repository lokal dan lihat upstream melalui branch -vv.',
    [
      'Push biasa mengirim perubahan yang belum di-commit?',
      [
        'Ya, semua yang terlihat di editor',
        'Tidak, push bekerja dengan object dan refs yang direkam',
        'Hanya jika file berakhiran .js',
      ],
      1,
      'Simpan perubahan ke commit terlebih dahulu jika ingin membagikannya sebagai riwayat branch.',
    ],
    ['git push', 'git branch -vv'],
    'remote',
  );

  lesson(
    8,
    'review',
    'Bikin perubahan mudah ditinjau.',
    'Hubungkan branch, commit, dan pull request dalam satu alur kontribusi.',
    'Fitur keranjang sudah selesai. Rekanmu perlu memahami tujuan perubahan dan mengusulkan koreksi sebelum digabung.',
    'Pull request atau merge request adalah fitur layanan hosting, bukan command Git inti. Alur umum adalah membuat branch, commit terarah, push branch, lalu membuka permintaan review di layanan tim. Pada model fork, origin biasanya fork milikmu dan upstream dapat menunjuk repo sumber; nama ini hanyalah kebiasaan.',
    'Sebelum menu baru dicetak, kamu mengirim usulan beserta alasan dan cara mencobanya. Reviewer mengomentari usulan, lalu kamu memperbaruinya.',
    [
      [
        'Siapkan perubahan terarah',
        'git switch -c fitur-keranjang\ngit status',
        'Kerjakan satu tujuan dan buat commit yang menjelaskannya.',
      ],
      [
        'Kirim untuk ditinjau',
        'git push -u origin fitur-keranjang',
        'Buka PR/MR melalui layanan hosting. Sertakan masalah, hasil perubahan, dan cara pengujian.',
      ],
      [
        'Tindak lanjuti review',
        'git add keranjang.js\ngit commit -m "Validasi jumlah item keranjang"\ngit push',
        'Commit baru pada branch yang sama umumnya memperbarui permintaan review yang terkait.',
      ],
    ],
    'Tim bisa mendiskusikan dan menguji perubahan sebelum mengintegrasikannya.',
    'Perubahan lintas tujuan membuat review lebih sulit. Pisahkan refactor besar dari perbaikan kecil bila memungkinkan.',
    'Tulis deskripsi review untuk koreksi harga: masalah awal, perilaku baru, dan langkah verifikasi.',
    [
      'Pull request merupakan fitur apa?',
      [
        'Layanan kolaborasi seperti GitHub/GitLab',
        'Command git pull dengan tampilan baru',
        'Folder wajib di .git',
      ],
      0,
      'Git menyediakan riwayat dan transport; layanan hosting menambahkan alur review.',
    ],
    ['git push', 'git switch -c'],
    'graph',
  );

  lesson(
    8,
    'workflow',
    'Sepakati cara jalur bertemu.',
    'Pilih merge, squash, dan kebijakan branch berdasarkan kebutuhan tim.',
    'Tim ingin main selalu siap dirilis. Beberapa fitur mempunyai banyak commit percobaan yang belum layak menjadi cerita akhir.',
    'Feature branch memisahkan pekerjaan sampai siap diintegrasikan. Merge commit mempertahankan titik percabangan; squash merge membuat satu commit hasil pada branch tujuan; rebase menyalin perubahan menjadi commit baru pada dasar baru. Protected branch adalah kebijakan layanan hosting yang dapat membatasi push dan mewajibkan review atau checks.',
    'Tim menyepakati cara menyunting buku bersama: mempertahankan catatan percobaan, meringkas satu usulan, atau menyusun ulang urutan ceritanya.',
    [
      [
        'Perbarui pengetahuan remote',
        'git fetch origin',
        'Sebelum integrasi, ketahui keadaan branch tujuan.',
      ],
      [
        'Lihat bentuk riwayat',
        'git log --graph --oneline --all --decorate',
        'Bahas bersama tim apakah bentuk ini cocok untuk penelusuran masalah dan proses rilis.',
      ],
    ],
    'Tim memiliki aturan integrasi yang jelas, termasuk siapa yang boleh menulis ke branch utama.',
    'Jangan menganggap satu workflow cocok untuk semua tim. Rebase pada riwayat yang sudah dipakai bersama perlu koordinasi karena identitas commit berubah.',
    'Tentukan aturan untuk tim tiga orang: tujuan branch, syarat review, checks, dan cara menggabungkan fitur.',
    [
      'Apa dampak utama squash merge ke branch tujuan?',
      [
        'Satu commit hasil merangkum perubahan fitur',
        'Selalu mempertahankan semua commit fitur sebagai ancestor',
        'Menghapus semua tag',
      ],
      0,
      'Squash merangkum perubahan menjadi commit baru; hubungan riwayatnya berbeda dari merge commit biasa.',
    ],
    ['git merge --squash', 'git log'],
    'graph',
  );

  lesson(
    9,
    'stash',
    'Simpan sebentar. Lanjutkan nanti.',
    'Kerjaan belum siap di-commit, tapi ada hal lain yang harus dikerjakan? Kenalan dengan git stash, laci sementara untuk perubahanmu.',
    'Kamu lagi bikin fitur diskon di Kopi Kita. Belum selesai, tiba-tiba checkout error dan perlu diperbaiki sekarang. Kamu ingin menyimpan pekerjaan tanpa mencampurnya dengan hotfix.',
    'git stash push menyimpan perubahan tracked pada working tree dan index, lalu mengembalikannya ke keadaan HEAD. Simpanan ini berada di repository lokal. Default-nya, file untracked dan ignored tidak ikut; gunakan -u untuk untracked atau -a untuk juga menyertakan ignored bila memang diperlukan.',
    'Lagi menggambar di meja, lalu perlu mengerjakan tugas lain? Masukkan bahan yang belum selesai ke laci berlabel. Mejamu siap dipakai, dan bahan tadi bisa diambil kembali. Laci ini ada di laptopmu, bukan otomatis di server.',
    [
      [
        'Kenali yang akan disimpan',
        'git status\ngit diff\ngit diff --staged',
        'Periksa perubahan tracked dan staged. Jika ada file baru yang harus ikut, gunakan variasi -u.',
      ],
      [
        'Simpan dengan label yang jelas',
        'git stash push -m "WIP diskon"',
        'Tracked changes tersimpan dan working tree kembali ke HEAD. Beri nama supaya mudah dikenali saat simpanan bertambah.',
      ],
      [
        'Periksa lalu kerjakan hotfix',
        'git stash list\ngit switch main\ngit switch -c hotfix-checkout',
        'Pada skenario ini, pastikan file baru yang perlu disimpan sudah ditangani. Perbaiki checkout dan commit di branch hotfix.',
      ],
      [
        'Kembali dan lanjutkan',
        'git switch fitur-diskon\ngit stash pop',
        'Di kondisi tanpa konflik, perubahan kembali ke working tree dan entri stash dihapus. Periksa git status sebelum meneruskan.',
      ],
    ],
    'Pekerjaan diskon kembali, sementara commit hotfix tetap terpisah pada branch hotfix. Integrasi hotfix ke main adalah langkah berikutnya dalam workflow tim.',
    'Stash bukan backup permanen. File untracked tidak ikut secara default. Jika pop mengalami konflik, entri stash tetap ada; selesaikan konflik dan periksa hasil sebelum drop manual.',
    'Di repo latihan, ubah file tracked dan buat file baru. Bandingkan stash push biasa dengan stash push -u. Kembalikan perubahan dan pastikan kedua file sesuai harapan.',
    [
      'Kamu ingin mengembalikan pekerjaan dan tetap menyimpan entri stash. Pilih apa?',
      ['git stash pop', 'git stash apply', 'git stash drop'],
      1,
      'apply mengembalikan perubahan tanpa menghapus entri. pop menghapus entri setelah penerapan berhasil; jika konflik, entrinya tetap ada.',
    ],
    ['git stash push', 'git stash list', 'git stash pop', 'git stash apply'],
    'stash',
  );

  lesson(
    9,
    'apply-pop',
    'Ambil salinan, atau keluarkan sekalian?',
    'Bedakan apply, pop, dan drop berdasarkan nasib entri stash.',
    'Kamu ingin mencoba perubahan diskon pada branch lain, tetapi masih ingin menyimpan cadangannya di daftar stash.',
    'git stash apply menerapkan perubahan tanpa menghapus entri. pop menerapkan lalu menghapus entri hanya jika berhasil; saat konflik entrinya tetap ada. drop hanya menghapus entri yang dipilih. Gunakan show -p untuk membaca perubahan dan kutip stash@{0} agar aman pada PowerShell.',
    'Apply seperti menyalin bahan dari laci ke meja. Pop mengeluarkannya dari laci setelah berhasil diletakkan. Drop membuang catatan simpanannya tanpa mengembalikan bahan ke meja.',
    [
      [
        'Periksa simpanan yang dipilih',
        'git stash list\ngit stash show -p "stash@{0}"',
        'Indeks nol adalah entri terbaru. Nomor bisa bergeser setelah ada push, pop, atau drop.',
      ],
      [
        'Terapkan sambil mempertahankan',
        'git stash apply "stash@{0}"',
        'Periksa perubahan dan uji hasil. Gunakan --index jika kamu juga perlu mencoba memulihkan staged state.',
      ],
      [
        'Hapus setelah yakin',
        'git stash drop "stash@{0}"',
        'Jalankan hanya setelah simpanan yang dimaksud sudah tidak diperlukan. Jangan gunakan clear untuk membersihkan satu entri.',
      ],
    ],
    'Kamu dapat memulihkan pekerjaan sambil memilih kapan simpanannya dihapus.',
    'Menjalankan apply berulang pada keadaan yang sudah berubah dapat gagal atau berkonflik. Selalu baca status dan diff sebelum mengulang.',
    'Buat satu stash, apply, lalu periksa bahwa stash list masih berisi entri tersebut. Bandingkan dengan pop pada skenario baru yang bersih.',
    [
      'Apa yang terjadi jika stash pop berkonflik?',
      [
        'Entri tetap ada di daftar stash',
        'Entri selalu langsung hilang',
        'Git otomatis memilih isi yang benar',
      ],
      0,
      'Pop mempertahankan entri ketika penerapannya menghasilkan konflik.',
    ],
    ['git stash apply', 'git stash pop', 'git stash drop'],
    'stash',
  );

  lesson(
    9,
    'stash-konflik',
    'Kalau lacinya ketemu perubahan baru.',
    'Tangani konflik stash dengan memeriksa isi dan mempertahankan simpanan sampai aman.',
    'Saat diskon disimpan, baris yang sama diubah di branch tujuan. Pop sekarang berhenti dengan konflik.',
    'Stash diterapkan pada keadaan working tree saat ini, sehingga bisa berbenturan dengan perubahan lain. Tidak ada git stash --continue. Selesaikan file, gunakan add jika ingin menandai hasil di index, periksa, lalu buat commit saat pekerjaan memang siap. stash branch dapat memulai branch dari dasar asli stash.',
    'Bahan di laci dibuat untuk rancangan meja yang lama. Ketika meja sudah berubah, kamu perlu menyesuaikan bahan itu, bukan menumpuknya sembarangan.',
    [
      [
        'Baca konflik dan simpanan',
        'git status\ngit stash list',
        'Jangan menghapus entri yang masih menjadi pegangan. Buka file dan tentukan hasil yang benar.',
      ],
      [
        'Periksa hasil penyelesaian',
        'git add diskon.js\ngit diff --staged',
        'Setelah marker dihapus dan logika diuji, periksa hasil yang akan di-commit.',
      ],
      [
        'Alternatif dari dasar semula',
        'git stash branch pulihkan-diskon "stash@{0}"',
        'Ini alternatif pada keadaan kerja yang sesuai, bukan langkah wajib setelah add. Jika berhasil dari ref stash, entri itu di-drop.',
      ],
    ],
    'Perubahan dipulihkan dengan keputusan isi yang jelas atau dipindahkan ke branch berdasarkan dasar aslinya.',
    'Jangan berasumsi merge --abort membatalkan stash apply/pop. Untuk membuang hasil percobaan, identifikasi dahulu seluruh perubahan lokal yang harus dipertahankan.',
    'Buat benturan satu baris di repo latihan. Pop, periksa stash tetap ada, lalu selesaikan isi tanpa membuang perubahan yang dibutuhkan.',
    [
      'Adakah git stash --continue untuk konflik?',
      [
        'Ya, selalu wajib',
        'Tidak; selesaikan dan periksa file sesuai kebutuhan',
        'Hanya pada branch main',
      ],
      1,
      'Stash tidak mempunyai alur continue seperti rebase.',
    ],
    ['git stash branch', 'git stash show'],
    'conflict',
  );

  lesson(
    10,
    'restore',
    'Batalkan perubahan di tempat yang tepat.',
    'Pisahkan membatalkan staging dari membuang edit di working tree.',
    'menu.json tidak sengaja masuk staging. Isinya masih diperlukan, tetapi belum siap menjadi commit.',
    'git restore --staged mengembalikan path pada index dari HEAD secara default, tanpa membuang edit working tree. git restore tanpa --staged menyalin dari index ke working tree secara default dan bisa membuang edit lokal pada file tracked. Keduanya tersedia sejak Git 2.23.',
    'Mengeluarkan barang dari nampan persiapan berbeda dengan membuang barang dari meja kerja. Pastikan kamu memilih tempat yang benar.',
    [
      [
        'Periksa calon commit',
        'git status\ngit diff --staged',
        'Kenali isi yang akan dikeluarkan dari staging.',
      ],
      [
        'Unstage tanpa kehilangan edit',
        'git restore --staged menu.json',
        'Pada repo yang sudah mempunyai HEAD, file kembali belum staged dan edit working tree tetap ada.',
      ],
      [
        'Hanya jika edit memang ingin dibuang',
        'git restore menu.json',
        'Ini alternatif untuk membuang edit unstaged pada path itu. Lihat diff dulu; edit yang belum direkam mungkin tidak bisa dipulihkan.',
      ],
    ],
    'Kamu tahu kapan memakai --staged dan kapan restore berisiko membuang pekerjaan.',
    'git restore bukan undo serbaguna. Sumber dan tujuan berubah mengikuti opsi yang dipakai.',
    'Stage perubahan README, unstage dengan restore --staged, lalu pastikan teks edit masih ada.',
    [
      'Bagaimana unstage tanpa membuang edit working tree?',
      ['git restore --staged file', 'git restore file', 'git clean -fd'],
      0,
      '--staged menargetkan index; working tree tetap.',
    ],
    ['git restore', 'git restore --staged'],
  );

  lesson(
    10,
    'reset-revert',
    'Riwayat bersama butuh cara undo yang pas.',
    'Bandingkan reset, revert, dan batas bantuan reflog.',
    'Commit harga salah sudah dipakai tim. Di branch pribadi, kamu juga punya commit percobaan yang ingin disusun ulang.',
    'Revert membuat commit baru yang membalik perubahan commit terpilih. Reset dengan target commit memindahkan branch aktif: --soft mempertahankan index dan working tree, --mixed mereset index, --hard juga mereset working tree dan dapat membuang perubahan. Reflog mencatat perpindahan refs secara lokal dan dapat membantu menemukan commit yang belum dipangkas.',
    'Revert menulis koreksi baru dalam buku bersama. Reset memindahkan penanda buku milikmu; dampaknya pada meja dan nampan bergantung mode.',
    [
      [
        'Undo commit biasa yang dibagikan',
        'git revert HEAD',
        'Untuk commit non-merge, ini membuat perubahan kebalikan. Konflik masih mungkin terjadi. Merge commit memerlukan pemilihan mainline dan pemahaman tambahan.',
      ],
      [
        'Rapikan commit lokal yang belum dibagikan',
        'git reset --soft HEAD~1',
        'Ini skenario alternatif: parent harus ada dan commit memang aman ditulis ulang. Isi tetap staged.',
      ],
      [
        'Cari posisi sebelum perpindahan',
        'git reflog',
        'Jika menemukan commit yang dimaksud, buat branch dengan git branch pulih HASH untuk mempertahankannya tanpa reset tergesa-gesa.',
      ],
    ],
    'Koreksi riwayat bersama punya jejak baru, sedangkan pekerjaan lokal bisa dirapikan dengan dampak yang diketahui.',
    'Reflog bukan jaminan backup: entrinya dapat kedaluwarsa dan object bisa dipangkas. git clean menargetkan untracked; selalu mulai dengan git clean -nd untuk preview, bukan langsung menghapus.',
    'Pada repo latihan, bandingkan reset --soft dan --mixed pada keadaan awal identik. Amati status dan kedua jenis diff.',
    [
      'Mode reset mana yang mempertahankan index dan working tree?',
      ['--hard', '--mixed', '--soft'],
      2,
      'Soft memindahkan referensi tanpa mereset index atau working tree.',
    ],
    ['git reset', 'git revert', 'git reflog', 'git clean'],
    'graph',
  );

  lesson(
    11,
    'amend-rebase',
    'Rapikan cerita sebelum dibagikan.',
    'Perbaiki commit terakhir atau susun beberapa commit dengan sadar.',
    'Branch fitur berisi commit coba, typo, fix-lagi, dan akhirnya hasil yang benar. Kamu ingin reviewer membaca cerita yang lebih jelas.',
    'Amend membuat pengganti commit terakhir. Interactive rebase memutar ulang commit dan memungkinkan reword, squash, fixup, atau mengubah urutannya. Identitas commit berubah karena isi, metadata, atau parent berubah. Hindari menulis ulang riwayat yang sudah menjadi dasar kerja orang lain tanpa koordinasi.',
    'Kamu menyunting draf sebelum menyerahkannya. Sesudah orang lain memakai draf itu, pergantian versi harus dibicarakan.',
    [
      [
        'Perbaiki pesan terakhir',
        'git commit --amend',
        'Jika index berisi perubahan, perubahan itu ikut dalam commit pengganti. Periksa staged diff dulu.',
      ],
      [
        'Susun tiga commit lokal',
        'git rebase -i HEAD~3',
        'Perlu tiga commit dalam rentang yang dimaksud. Editor menampilkan instruksi; pilih reword/squash/fixup sesuai tujuan.',
      ],
      [
        'Jika rebase berhenti',
        'git status',
        'Selesaikan konflik, add file, lalu git rebase --continue. Gunakan git rebase --abort bila ingin kembali ke keadaan sebelum proses.',
      ],
    ],
    'Riwayat branch pribadi lebih mudah dibaca dan kamu tahu bahwa hash commit bisa berubah.',
    '--force-with-lease tetap menulis ulang remote. Ia menambahkan pemeriksaan lease, bukan izin untuk menimpa pekerjaan tanpa koordinasi.',
    'Di branch latihan, buat tiga commit kecil lalu gabungkan dua yang memiliki tujuan sama. Bandingkan hash sebelum dan sesudah.',
    [
      'Apakah amend mempertahankan identitas commit yang diganti?',
      [
        'Ya, selalu',
        'Umumnya menghasilkan commit pengganti dengan hash berbeda',
        'Hanya mengubah working tree',
      ],
      1,
      'Commit bersifat immutable. Amend membuat object commit pengganti.',
    ],
    ['git commit --amend', 'git rebase -i'],
    'graph',
  );

  lesson(
    11,
    'cherry-pick',
    'Ambil satu perubahan yang dibutuhkan.',
    'Pindahkan perubahan tertentu tanpa menggabungkan seluruh branch sumber.',
    'Perbaikan checkout ada di branch eksperimen bersama fitur yang belum siap. Branch rilis hanya memerlukan perbaikan checkout.',
    'Cherry-pick menerapkan perubahan dari commit terpilih pada branch aktif dan biasanya membuat commit baru. Ini tidak memindahkan object sumber dari branch asal. Perubahan bisa memerlukan dependensi commit sebelumnya dan dapat mengalami konflik.',
    'Kamu mengambil satu resep dari buku percobaan untuk buku menu utama. Periksa apakah resep itu membutuhkan bahan yang baru dijelaskan di halaman sebelumnya.',
    [
      [
        'Pilih commit dengan konteks',
        'git log --oneline fitur-eksperimen\ngit show HASH',
        'Ganti HASH dengan commit perbaikan yang benar. Periksa apakah ia bergantung pada perubahan lain.',
      ],
      [
        'Terapkan di penerima',
        'git switch rilis\ngit cherry-pick HASH',
        'Branch rilis harus sudah ada. Uji hasilnya setelah penerapan.',
      ],
      [
        'Kelola konflik bila ada',
        'git status',
        'Setelah resolve dan add, gunakan git cherry-pick --continue. Untuk membatalkan proses, gunakan git cherry-pick --abort.',
      ],
    ],
    'Branch rilis mendapatkan perubahan yang dipilih tanpa seluruh pekerjaan eksperimen.',
    'Perubahan yang sama pada dua branch bisa menimbulkan kebingungan saat integrasi berikutnya. Catat asal perubahan dan periksa riwayat.',
    'Buat dua commit pada branch fitur. Cherry-pick hanya commit kedua ke branch latihan dan cek apakah hasilnya tetap berfungsi.',
    [
      'Cherry-pick biasanya menghasilkan apa?',
      [
        'Commit baru yang menerapkan perubahan terpilih',
        'Pemindahan semua branch',
        'Penghapusan commit sumber',
      ],
      0,
      'Commit sumber tetap; perubahan diterapkan pada jalur penerima.',
    ],
    ['git cherry-pick'],
    'graph',
  );

  lesson(
    12,
    'bisect',
    'Cari bug dengan membelah riwayat.',
    'Gunakan bisect untuk mempersempit commit yang memperkenalkan masalah.',
    'Checkout masih bekerja minggu lalu, tetapi sekarang gagal. Ada puluhan commit di antara dua keadaan itu.',
    'Bisect melakukan pencarian biner pada riwayat berdasarkan penilaian good dan bad. Kamu perlu kondisi pengujian yang cukup stabil dan commit baik yang diketahui. Jika suatu versi tidak dapat diuji, skip lebih tepat daripada menebak hasilnya.',
    'Mencari halaman yang mulai salah tidak perlu satu per satu: periksa bagian tengah, lalu lanjutkan pada separuh yang masih mungkin mengandung masalah.',
    [
      [
        'Tandai batas awal',
        'git bisect start\ngit bisect bad\ngit bisect good HASH_BAIK',
        'Ganti HASH_BAIK dengan commit yang sudah kamu verifikasi benar. Simpan pekerjaan lokal sebelum berpindah snapshot.',
      ],
      [
        'Uji commit pilihan',
        'git bisect good',
        'Jalankan jika versi yang sedang diuji baik. Jika buruk, gunakan git bisect bad; jika tidak bisa diuji, gunakan git bisect skip.',
      ],
      [
        'Kembali setelah selesai',
        'git bisect reset',
        'Catat commit pertama yang dianggap buruk, lalu periksa penyebab dan buat perbaikan di branch yang sesuai.',
      ],
    ],
    'Rentang kandidat menyempit sampai Git menemukan kandidat commit yang memperkenalkan perubahan perilaku.',
    'Hasil bergantung pada definisi good/bad. Test yang tidak stabil atau perubahan dependency di luar repo bisa membuat diagnosis menyesatkan.',
    'Buat enam commit di repo latihan dengan satu perubahan yang merusak teks keluaran. Cari commit penyebab menggunakan bisect.',
    [
      'Commit pilihan bisect tidak bisa dibangun. Apa yang tepat?',
      ['Tebak good', 'git bisect skip', 'Hapus commit itu dari semua branch'],
      1,
      'Skip menandai bahwa commit tidak dapat dinilai dengan pengujian yang tersedia.',
    ],
    ['git bisect'],
    'graph',
  );

  lesson(
    12,
    'pencarian',
    'Cari alasan, bukan kambing hitam.',
    'Gabungkan blame, grep, dan pencarian riwayat untuk memahami perubahan.',
    'Aturan diskon yang aneh muncul pada checkout. Kamu ingin tahu kapan dan mengapa aturan itu ditambahkan.',
    'git blame mengaitkan baris dengan commit terakhir yang memengaruhinya sesuai penelusuran. git grep mencari teks pada file tracked. git log -S mencari perubahan jumlah kemunculan string; -G mencari patch dengan baris yang cocok regex. Setelah menemukan commit, baca konteks dan diskusi terkait.',
    'Asal catatan membantu menemukan konteks keputusan. Nama terakhir yang menyentuh baris belum tentu pencipta masalah.',
    [
      [
        'Temukan lokasinya',
        'git grep -n "diskon"',
        'Cari pada file yang dilacak. Untuk konteks lebih luas, buka file di editor.',
      ],
      [
        'Telusuri perubahan baris',
        'git blame -L 1,30 -- checkout.js',
        'Rentang baris disesuaikan dengan file. Gunakan hash yang ditemukan untuk git show.',
      ],
      [
        'Cari asal aturan',
        'git log -p -S "MINIMUM_BELANJA" -- checkout.js',
        'Periksa perubahan jumlah kemunculan string tersebut dalam riwayat file.',
      ],
    ],
    'Kamu menemukan konteks keputusan yang membantu membuat perbaikan tepat.',
    'Blame bukan penilaian kesalahan orang. Refactor dan pemindahan kode bisa memengaruhi hasil atribusi.',
    'Tambahkan string unik ke file latihan, ubah pada commit berikutnya, lalu temukan kedua perubahan melalui log -S.',
    [
      'Untuk mencari string pada file tracked saat ini, pakai apa?',
      ['git grep', 'git reset', 'git stash drop'],
      0,
      'Git grep mencari isi file; log -S mencari perubahan kemunculan string dalam riwayat.',
    ],
    ['git blame', 'git grep', 'git log -S'],
  );

  lesson(
    13,
    'tag',
    'Kasih nama pada versi yang dirilis.',
    'Gunakan tag untuk menandai commit yang mewakili rilis tertentu.',
    'Kopi Kita versi 1.0 sudah berjalan di toko. Dua minggu kemudian, tim perlu memeriksa persis kode yang dirilis saat itu.',
    'Tag menamai object, biasanya commit. Lightweight tag langsung menyimpan referensi; annotated tag mempunyai object dengan pesan dan metadata tagger. Tag tidak ikut berpindah setiap ada commit baru seperti branch. Push branch biasa tidak otomatis mengirim semua tag.',
    'Pasang label pada edisi buku yang sudah dicetak. Penulisan edisi berikutnya tidak otomatis memindahkan label edisi lama.',
    [
      [
        'Buat tag rilis',
        'git tag -a v1.0.0 -m "Rilis awal Kopi Kita"',
        'Jalankan pada commit yang sudah diuji dan memang akan dirilis.',
      ],
      [
        'Periksa tag',
        'git show v1.0.0',
        'Annotated tag menampilkan metadata tag dan commit yang ditunjuk.',
      ],
      [
        'Bagikan tag tertentu',
        'git push origin v1.0.0',
        'Periksa remote yang dituju. Tag hanyalah penanda; proses deployment merupakan langkah lain.',
      ],
    ],
    'Tim punya nama stabil untuk snapshot rilis.',
    'Memindahkan tag rilis yang sudah dibagikan bisa membingungkan pengguna. Buat versi baru sesuai kebijakan tim.',
    'Buat annotated tag pada commit latihan, tambahkan commit baru, lalu pastikan tag tetap menunjuk versi lama.',
    [
      'Tag rilis biasanya bergerak saat commit baru dibuat?',
      ['Tidak, tetap menunjuk targetnya', 'Ya, seperti branch aktif', 'Hanya jika namanya v1'],
      0,
      'Branch bergerak saat commit dibuat di jalurnya; tag tidak otomatis bergerak.',
    ],
    ['git tag', 'git push'],
    'graph',
  );

  lesson(
    13,
    'hotfix',
    'Perbaiki versi yang sedang dipakai.',
    'Mulai hotfix dari titik rilis dan pastikan perbaikannya kembali ke jalur pengembangan.',
    'Main sudah berisi fitur minggu depan. Versi v1.0.0 yang dipakai toko punya bug checkout dan harus diperbaiki lebih dahulu.',
    'Branch hotfix dapat dibuat dari tag rilis agar fitur yang belum siap tidak ikut. Setelah perbaikan diuji, buat tag rilis perbaikan dan integrasikan perbaikannya ke jalur lain yang masih membutuhkan. Penomoran versi dan otomasi rilis mengikuti kebijakan proyek.',
    'Perbaiki edisi yang sedang beredar tanpa menyisipkan bab percobaan dari naskah berikutnya.',
    [
      [
        'Mulai dari versi yang dipakai',
        'git switch -c hotfix-v1.0.1 v1.0.0',
        'Tag v1.0.0 harus tersedia. Kerjakan perbaikan dan uji pada lingkungan yang sesuai.',
      ],
      [
        'Rekam dan tandai',
        'git add checkout.js\ngit commit -m "Perbaiki validasi checkout"\ngit tag -a v1.0.1 -m "Perbaikan checkout"',
        'Pastikan hanya perubahan yang diperlukan masuk rilis.',
      ],
      [
        'Integrasikan ke pengembangan',
        'git switch main\ngit merge hotfix-v1.0.1',
        'Jika tim memakai strategi lain, cherry-pick atau PR dapat dipilih dengan konteks yang sesuai.',
      ],
    ],
    'Versi perbaikan tidak membawa fitur yang belum siap, dan bug yang sama tidak tertinggal di main.',
    'Tag bukan bukti deployment berhasil. Periksa proses rilis, konfigurasi lingkungan, dan hasil pengujian.',
    'Buat tag lama, tambahkan fitur baru di main, lalu buat hotfix dari tag. Buktikan fitur baru tidak ada pada hotfix.',
    [
      'Dari mana memulai perbaikan versi lama?',
      [
        'Titik versi yang benar-benar dirilis',
        'Selalu commit main terbaru tanpa pemeriksaan',
        'Branch acak yang paling panjang',
      ],
      0,
      'Mulai dari snapshot yang perlu diperbaiki agar fitur lain tidak ikut tanpa sengaja.',
    ],
    ['git tag', 'git switch -c'],
    'graph',
  );

  lesson(
    14,
    'partial-staging',
    'Satu file, dua tujuan perubahan.',
    'Pilih bagian perubahan melalui git add -p.',
    'Dalam checkout.js, kamu memperbaiki bug sekaligus bereksperimen dengan tampilan pesan. Kamu ingin bug fix menjadi commit terpisah.',
    'Patch staging menampilkan hunk perubahan dan meminta keputusan. y menyiapkan hunk, n melewatkan, s mencoba membelah, dan ? menampilkan bantuan. Hunk tidak selalu bisa dipisah otomatis. Periksa staged diff dan uji snapshot yang akan direkam; working tree bisa berisi gabungan pekerjaan yang berbeda.',
    'Kamu memilih kalimat yang siap diterbitkan dari satu halaman, sementara paragraf percobaan tetap ada di draf.',
    [
      [
        'Pilih hunk',
        'git add -p checkout.js',
        'Baca konteks setiap hunk. Gunakan ? untuk daftar pilihan di versi Git-mu.',
      ],
      [
        'Periksa kedua sisi',
        'git diff --staged\ngit diff',
        'Pastikan calon commit hanya berisi bug fix, sedangkan perubahan percobaan masih unstaged.',
      ],
      [
        'Rekam tujuan pertama',
        'git commit -m "Perbaiki perhitungan total"',
        'Pesan menjelaskan perubahan yang benar-benar staged.',
      ],
    ],
    'Dua tujuan pada satu file bisa direkam secara terpisah.',
    'Memilih sebagian baris dapat menghasilkan snapshot yang tidak valid jika perubahan saling bergantung. Jangan hanya menguji gabungan working tree.',
    'Ubah dua bagian README yang berjauhan. Stage satu hunk, lalu buktikan diff --staged hanya memuat bagian tersebut.',
    [
      'Apa kegunaan git add -p?',
      ['Memilih bagian perubahan untuk index', 'Menjalankan push otomatis', 'Menghapus file besar'],
      0,
      'Patch mode memungkinkan staging per hunk.',
    ],
    ['git add -p'],
    'staging',
  );

  lesson(
    14,
    'worktree',
    'Dua pekerjaan, dua meja.',
    'Gunakan worktree saat dua branch perlu terbuka bersamaan.',
    'Kamu sedang menjalankan fitur diskon, tetapi perlu menguji hotfix pada jendela editor lain tanpa menutup pekerjaan sekarang.',
    'git worktree menambahkan working tree lain yang berbagi database object dan referensi repository. Masing-masing memiliki working tree dan index sendiri. Secara normal satu branch tidak boleh aktif di dua worktree sekaligus. Ini berbeda dari clone yang merupakan repository tersendiri.',
    'Kamu menambah meja kerja kedua untuk buku catatan yang sama. Bahan di kedua meja terpisah, tetapi riwayat proyeknya dibagikan.',
    [
      [
        'Tambahkan ruang hotfix',
        'git worktree add -b hotfix-checkout ../kopi-hotfix main',
        'Jalankan dari repo Kopi Kita. Folder baru dibuat di lokasi saudara; pilih lokasi yang memang kamu miliki.',
      ],
      [
        'Lihat daftar meja',
        'git worktree list',
        'Buka folder hotfix di editor lain dan kerjakan sesuai kebutuhan.',
      ],
      [
        'Rapikan sesudah selesai',
        'git worktree remove ../kopi-hotfix',
        'Pastikan perubahan sudah disimpan. Remove worktree tidak otomatis menghapus nama branch-nya.',
      ],
    ],
    'Fitur dan hotfix bisa diuji pada folder berbeda tanpa mengganti branch pada meja pertama.',
    'Submodule melacak commit repo lain; sparse checkout membatasi path working tree; partial clone mengurangi object awal; shallow clone membatasi riwayat. Semuanya memecahkan masalah berbeda. Git LFS adalah ekstensi untuk pengelolaan file besar.',
    'Bandingkan status pada dua worktree setelah mengedit file hanya di salah satunya. Amati perubahan mana yang lokal pada meja itu.',
    [
      'Apa yang dibagikan antar linked worktree?',
      [
        'Database object dan referensi repository',
        'Semua edit working tree seketika',
        'Satu index untuk semua pekerjaan',
      ],
      0,
      'Linked worktree memiliki working tree dan index masing-masing, dengan penyimpanan repository yang dibagikan.',
    ],
    ['git worktree'],
    'graph',
  );

  lesson(
    15,
    'attributes',
    'Biar beda komputer tetap selaras.',
    'Atur atribut file agar line endings dan perlakuan file konsisten.',
    'Kamu memakai Windows, Rani memakai Linux. Satu perubahan kecil terlihat seperti seluruh file berubah karena perbedaan akhir baris.',
    '.gitattributes menyimpan aturan per path yang bisa dibagikan bersama repository. Misalnya * text=auto dan *.sh text eol=lf. Pengaturan text mengatur normalisasi pada index, sedangkan eol memengaruhi working tree. File biner perlu diperlakukan sesuai jenisnya.',
    'Tim menyepakati format kertas sebelum saling mengoreksi, agar pergantian format tidak menyamar sebagai perubahan isi.',
    [
      [
        'Periksa atribut yang berlaku',
        'git check-attr text eol -- checkout.js',
        'Buat .gitattributes melalui editor dengan aturan yang disepakati tim.',
      ],
      [
        'Normalisasi dengan peninjauan',
        'git add --renormalize .\ngit diff --staged',
        'Lakukan saat working tree sudah dipahami dan sebagai perubahan khusus. Tinjau file yang terdampak sebelum commit.',
      ],
    ],
    'Perubahan format dapat dipisahkan dari perubahan logika dan aturan konsisten ikut dibagikan.',
    'Jangan menjalankan normalisasi besar bersama bug fix kecil. Ia dapat mempersulit review dan memicu konflik pada branch lain.',
    'Buat aturan eol=lf untuk file .sh pada repo latihan dan periksa hasil check-attr.',
    [
      'File mana yang tepat untuk atribut path bersama tim?',
      ['.gitattributes', '.gitignore sebagai pengganti semua aturan', '.env'],
      0,
      'Attributes mengatur perlakuan file; ignore mengatur file untracked yang diabaikan.',
    ],
    ['git check-attr', 'git add --renormalize'],
  );

  lesson(
    15,
    'hooks-secrets',
    'Otomasi membantu. Rahasia tetap dijaga.',
    'Pahami batas hooks lokal dan tindakan pertama saat kredensial terpapar.',
    'Kamu ingin pemeriksaan cepat sebelum commit. Di saat lain, API key tidak sengaja ter-push ke repository.',
    'Hooks menjalankan program pada peristiwa tertentu. Contohnya pre-commit untuk pemeriksaan lokal; file .git/hooks tidak otomatis dibagikan melalui clone. Checks di server/CI melengkapi pemeriksaan lokal. Kredensial autentikasi remote sebaiknya dikelola credential helper atau SSH, bukan ditaruh di URL yang dibagikan.',
    'Pengingat di meja membantu mencegah kelalaian, sementara pemeriksaan bersama tetap diperlukan sebelum barang diterima.',
    [
      [
        'Periksa lokasi hook khusus',
        'git config --get core.hooksPath',
        'Jika kosong, Git memakai lokasi hook default. Untuk hook yang dibagikan, dokumentasikan cara mengaktifkannya.',
      ],
      [
        'Periksa file sensitif yang tracked',
        'git ls-files -- .env',
        'Output berarti path tersebut dilacak. Jangan tampilkan isi secret di terminal yang direkam atau dibagikan.',
      ],
    ],
    'Kamu memahami mana pemeriksaan lokal, mana kebijakan bersama, dan bagaimana menghindari kredensial masuk repo.',
    'Jika secret sudah terpapar, cabut atau rotasi terlebih dahulu. Menghapus file atau membuat repo private tidak membatalkan kredensial yang sudah bocor. Pembersihan riwayat harus direncanakan bersama pengguna repo.',
    'Tulis checklist respons secret: rotasi, identifikasi akses, hapus dari snapshot berikutnya, koordinasi pembersihan riwayat bila diperlukan, dan pencegahan.',
    [
      'Tindakan pertama saat API key sudah terpublikasi?',
      ['Cabut atau rotasi kredensial', 'Hanya tambah .env ke .gitignore', 'Rename branch'],
      0,
      'Kredensial yang sudah terlihat harus dianggap terpapar; penghapusan file saja tidak mencabut akses.',
    ],
    ['git config', 'git ls-files'],
  );

  lesson(
    16,
    'objects',
    'Snapshot dibangun dari object.',
    'Hubungkan blob, tree, commit, dan referensi dengan yang sudah kamu praktikkan.',
    'Kamu bertanya mengapa rename branch murah, tetapi rebase menghasilkan hash commit baru.',
    'Blob menyimpan isi file. Tree menghubungkan nama dan mode path ke object. Commit merujuk root tree, parent, dan metadata. Referensi branch menunjuk commit; HEAD biasanya merujuk branch itu. Commit membentuk directed acyclic graph melalui hubungan parent. Object yang sama dapat dipakai oleh banyak snapshot.',
    'Album mempunyai halaman isi, daftar susunan, dan catatan waktu. Penanda bernama menunjuk halaman riwayat; mengganti nama penanda tidak menyalin seluruh album.',
    [
      [
        'Lihat object commit',
        'git cat-file -p HEAD',
        'Cari baris tree, parent bila ada, author, committer, serta pesan commit.',
      ],
      [
        'Lihat susunan snapshot',
        'git ls-tree HEAD',
        'Setiap entri menyertakan mode, jenis object, object ID, dan nama path.',
      ],
      [
        'Periksa referensi aktif',
        'git symbolic-ref HEAD',
        'Pada branch biasa hasilnya refs/heads/nama. Pada detached HEAD perintah ini gagal karena HEAD bukan symbolic reference.',
      ],
    ],
    'Model file, index, commit, dan branch tersambung ke struktur data yang sebenarnya.',
    'Jangan mengedit file internal .git secara sembarangan. Gunakan command resmi untuk memperbarui object dan referensi.',
    'Temukan root tree dari satu commit, lalu lihat satu blob dengan cat-file -p OBJECT_ID. Bandingkan dengan isi file pada snapshot itu.',
    [
      'Object mana yang menyimpan isi file?',
      ['Blob', 'Branch', 'Remote'],
      0,
      'Blob menyimpan isi; nama dan hubungan path dicatat pada tree.',
    ],
    ['git cat-file', 'git ls-tree', 'git symbolic-ref'],
    'objects',
  );

  lesson(
    16,
    'maintenance',
    'Riwayat punya cara disimpan dan dirawat.',
    'Kenali packfiles, reachability, dan batas pemulihan repository.',
    'Repository makin besar. Kamu ingin memahami apa yang dilakukan maintenance dan mengapa object tanpa referensi belum tentu tersimpan selamanya.',
    'Git dapat mengemas object ke packfiles untuk efisiensi, termasuk kompresi delta. Reachability ditentukan dari referensi dan hubungan object. Reflog bisa mempertahankan informasi posisi lama untuk sementara; masa retensi dan garbage collection memengaruhi peluang pemulihan. Refspec menjelaskan pemetaan referensi saat transport.',
    'Gudang mengemas bahan agar hemat tempat. Bahan yang tidak lagi terhubung ke catatan aktif punya aturan penyimpanan; jangan menganggap semuanya selalu tersedia.',
    [
      [
        'Periksa ukuran object',
        'git count-objects -vH',
        'Amati perbedaan loose objects dan object dalam pack. Ini tidak menghapus apa pun.',
      ],
      [
        'Periksa konsistensi',
        'git fsck --full',
        'Baca hasil dengan konteks. Object dangling tidak otomatis berarti repository rusak.',
      ],
      [
        'Buat paket riwayat bernama',
        'git bundle create kopi-kita.bundle --all',
        'Bundle dapat memindahkan refs dan object yang dicakup, tetapi bukan backup edit working tree, index, hooks, atau semua konfigurasi.',
      ],
    ],
    'Kamu mengetahui fungsi penyimpanan object, pemeriksaan konsistensi, dan bundle tanpa menganggapnya menyimpan semua keadaan lokal.',
    'Hindari prune agresif ketika sedang mencoba memulihkan pekerjaan. Buat salinan yang sesuai sebelum tindakan maintenance berisiko.',
    'Buat bundle repo latihan lalu verifikasi dengan git bundle verify kopi-kita.bundle. Catat data lokal apa yang tidak termasuk.',
    [
      'Apakah bundle --all menyimpan edit working tree yang belum di-commit?',
      ['Tidak', 'Ya, seluruh folder otomatis', 'Hanya file JavaScript'],
      0,
      'Bundle berisi refs dan object yang dicakup, bukan seluruh keadaan folder kerja.',
    ],
    ['git count-objects', 'git fsck', 'git bundle'],
    'objects',
  );

  const glossary = [
    [
      'Repository',
      'Penyimpanan riwayat, object, dan referensi Git. Repo lokal biasanya mempunyai direktori .git.',
    ],
    ['Working tree', 'File proyek yang sedang tersedia untuk dibaca dan diedit di folder kerja.'],
    [
      'Index / staging area',
      'Keadaan usulan snapshot untuk commit berikutnya. File bisa sekaligus punya perubahan staged dan unstaged.',
    ],
    [
      'Commit',
      'Object yang merekam root tree, metadata, dan hubungan ke parent. Menjadi satu titik dalam riwayat.',
    ],
    [
      'HEAD',
      'Biasanya symbolic reference ke branch aktif. Dalam detached HEAD, menunjuk commit secara langsung.',
    ],
    [
      'Branch',
      'Referensi bernama yang menunjuk commit dan bergerak ketika ada commit baru di branch itu.',
    ],
    [
      'Remote',
      'Nama dan konfigurasi untuk repository lain, seperti origin. Tidak harus berada di internet.',
    ],
    [
      'Remote-tracking branch',
      'Catatan lokal, seperti origin/main, tentang posisi branch remote saat sinkronisasi terakhir.',
    ],
    [
      'Upstream',
      'Hubungan branch lokal ke branch lain yang dipakai sebagai acuan oleh command dan konfigurasi tertentu.',
    ],
    [
      'Stash',
      'Simpanan perubahan sementara di repository lokal. Isi yang disertakan bergantung opsi yang digunakan.',
    ],
    [
      'Merge conflict',
      'Keadaan saat Git tidak dapat menyelesaikan integrasi otomatis dan membutuhkan keputusan isi.',
    ],
    [
      'Reflog',
      'Log lokal perpindahan referensi. Berguna untuk menelusuri posisi lama, dengan retensi yang terbatas.',
    ],
    [
      'Tag',
      'Referensi bernama ke object, biasanya untuk menandai commit rilis. Tidak otomatis bergerak saat ada commit baru.',
    ],
    [
      'Tracked / untracked',
      'Tracked berarti path diketahui index; untracked adalah file working tree yang belum ada di index.',
    ],
    [
      'Fast-forward',
      'Pembaruan referensi ke keturunan commit saat ini tanpa membutuhkan merge commit baru.',
    ],
    [
      'Object ID',
      'Identitas object yang dihitung dari representasi object. Bentuk dan panjang penuh bergantung format object repository.',
    ],
  ];
  const problems = [
    ['Kerjaan belum selesai, harus pindah tugas', 'stash'],
    ['Sudah add, tapi belum mau commit', 'restore'],
    ['Push ditolak server', 'push'],
    ['Commit salah sudah dipakai tim', 'reset-revert'],
    ['File yang sama diedit dua orang', 'konflik'],
    ['Terlanjur masuk detached HEAD', 'detached-head'],
    ['Butuh satu commit dari branch lain', 'cherry-pick'],
    ['Bug muncul, tidak tahu commit penyebabnya', 'bisect'],
    ['File .env tetap muncul meski di-ignore', 'ignore'],
    ['Butuh dua branch terbuka bersamaan', 'worktree'],
  ];
  const data = { chapters, lessons, glossary, problems };
  const curriculum =
    typeof module !== 'undefined' && module.exports
      ? require('./curriculum.js')
      : root.GitGuidesCurriculum;
  curriculum.extend(data);
  root.GitGuidesContent = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof globalThis !== 'undefined' ? globalThis : window);
