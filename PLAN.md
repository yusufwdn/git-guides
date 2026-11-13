# Rencana Git Guides

Status: implementasi dimigrasikan ke Astro + TypeScript. Tersedia 16 bab/66 materi pada content collections JSON yang divalidasi schema, halaman persiapan untuk memasang Git dan mengenal terminal, 25 latihan terminal Git asli, 16 diagram bertahap, empat skenario browser, serta 16 tantangan penutup bab. Pencarian mencakup isi materi, istilah, dan masalah; progres lokal menyimpan hasil kuis/latihan dan mendukung ekspor/impor. Pengujian mencakup build Astro, fixture Git, dan Playwright; workflow CI ditambahkan. Hosting publik belum dijalankan dari sesi ini.

## 1. Tujuan dan ruang lingkup

Membangun website belajar Git berbahasa Indonesia yang membawa pembaca dari belum memahami version control sampai mampu bekerja dalam tim, menyelidiki masalah, memulihkan kesalahan yang masih dapat dipulihkan, dan memahami mekanisme Git.

Hasil belajar: pembaca dapat menjelaskan keadaan repository sebelum menjalankan perintah, memilih tindakan berdasarkan masalah, dan memeriksa hasilnya. Hafalan sintaks menjadi pelengkap pemahaman.

“Menyeluruh” berarti mencakup fondasi, pekerjaan sehari-hari, kolaborasi, pemulihan, alat lanjutan, serta pengantar internals. Seluruh flag dan plumbing command yang sangat khusus ditempatkan dalam indeks referensi dan tautan manual resmi. Materi inti tetap dipelajari bertahap.

Perencanaan menggunakan Pro Git dan manual resmi Git sebagai dasar. Riset per subbab dan verifikasi contoh dengan Git sungguhan dilakukan selama penulisan; dokumen ini bukan klaim bahwa seluruh perilaku Git sudah diaudit.

## 2. Cara orang belajar

Tiga pintu masuk menggunakan materi yang sama:

- **Belajar dari nol:** jalur berurutan dengan prasyarat dan tujuan yang jelas.
- **Cari berdasarkan masalah:** misalnya “kerjaan belum selesai, harus pindah branch” atau “commit masuk branch yang salah”.
- **Referensi command:** sintaks, opsi penting, dampak, contoh, dan tautan ke bab terkait.

Satu proyek contoh menjadi benang merah: website toko kopi **Kopi Kita**. Pembaca mengubah menu, membuat keranjang, memperbaiki checkout, bekerja dengan anggota tim, dan merilis versi. Setiap latihan menyertakan keadaan awal sendiri agar bisa dibuka langsung tanpa menamatkan bab sebelumnya.

Bahasa santai dan jelas. Istilah teknis tetap ditulis dalam bentuk aslinya, diperkenalkan dengan definisi singkat, dan masuk glosarium. Istilah CLI seperti `HEAD`, `index`, dan `upstream` tidak dianggap sudah dipahami.

Analogi utama adalah meja kerja, area persiapan, dan album snapshot. Analogi membantu pengenalan; diagram keadaan Git menjelaskan mekanisme sebenarnya. Batas analogi disebutkan ketika diperlukan: branch adalah referensi yang bergerak, dan commit merepresentasikan snapshot proyek.

## 3. Kurikulum yang diusulkan

Target awal sekitar 60–80 pelajaran singkat dalam 16 bab. Jumlah final mengikuti pemecahan materi, dengan satu tujuan utama per pelajaran.

Urutan bab mengikuti ketergantungan pengetahuan, bukan pengelompokan tema:

- Setiap command dan istilah dikenalkan pada materi tempat ia pertama kali dipakai, atau pada materi sebelumnya. Materi tidak boleh memakai command yang baru diajarkan di bab sesudahnya.
- Praktik dimulai setelah Git terpasang dan identitas diatur (bab 1). Repository Kopi Kita dibangun bertahap di bab 2, mulai dari folder kosong.
- Halaman Persiapan hanya menyiapkan lingkungan: memasang Git dan membuka terminal. Halaman ini tidak menjalankan command Git selain `git --version`.
- Konsep yang membutuhkan branch, merge, atau remote ditempatkan setelah topik tersebut diajarkan, walaupun temanya dekat dengan bab yang lebih awal.

Aturan ini dan alasan perubahannya dicatat di [docs/kurikulum.md](docs/kurikulum.md).

| Bab                               | Cakupan subbab                                                                                                                                                                                       | Contoh kasus                                                                                                                                    | Visual utama                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1. Kenalan dengan Git             | Version control; Git dan layanan hosting; `--version`; identitas dan `config` global/lokal; terminal, folder kerja, dan root repository; `help` dan `-h`                                             | Folder `final`, `final-baru`, dan `final-fix` membuat versi menu sulit dilacak; commit tercatat dengan identitas yang salah                     | Perbandingan folder manual dengan timeline snapshot; peta konfigurasi global/lokal  |
| 2. Commit pertama                 | `init`; working tree, staging area, dan HEAD; `status`, `diff`, `diff --staged`; `add`, `commit`; snapshot dan `show HEAD:path`                                                                      | Perubahan menu dan diskon tercampur, hanya menu yang siap di-commit                                                                             | Tiga area kerja; file berpindah keadaan sebelum/sesudah staging                     |
| 3. Rapi sebelum commit            | `status --short`; tracked/untracked; `.gitignore`; commit atomik                                                                                                                                     | File hasil build ikut ter-add; satu commit berisi dua tujuan                                                                                    | Kolom status singkat; pemisahan perubahan per tujuan                                |
| 4. Membaca riwayat                | `log`, `show`; filter log; hash; `HEAD~n`; rentang commit pada satu branch                                                                                                                           | Menemukan kapan harga kopi berubah dan perubahan apa yang ikut masuk                                                                            | Timeline commit yang bisa dipilih dan panel diff                                    |
| 5. Branch                         | `branch`, `switch`; kompatibilitas `checkout`; `log --graph`; detached HEAD; rename/delete                                                                                                           | Membuat fitur diskon sambil mempertahankan versi utama                                                                                          | Grafik commit dengan label branch dan penunjuk HEAD                                 |
| 6. Merge dan konflik              | Diff antarbranch dan merge base (`A...B`); fast-forward; merge commit dan `HEAD^2`; conflict markers; resolve; `merge --abort`                                                                       | Dua orang mengubah harga item yang sama                                                                                                         | Grafik dua cabang dan panel base/ours/theirs/result                                 |
| 7. Kenalan dengan remote          | Git terdistribusi; `clone` dan bare repository; remote dan `origin`; autentikasi HTTPS/SSH; remote-tracking branch dan ahead/behind; `push` dan penolakan non-fast-forward; `fetch`                  | Rani ikut mengurus menu dari laptopnya dan mengirim commit lewat server                                                                         | Tiga repo berdampingan; posisi `main`, `origin/main`, dan server                    |
| 8. Kirim dan kerja bareng tim     | Upstream dan `push -u`; `pull` dengan `--ff-only`, `--no-rebase`, `--rebase`; branch fitur dan pull request; review; fork dan remote `upstream`; squash merge; pilihan workflow dan protected branch | Push ditolak karena Rani sudah mengirim commit; menu sarapan ditinjau sebelum digabung                                                          | Pilihan pull; alur kontribusi dari branch hingga integrasi; perbandingan cara merge |
| 9. Menyimpan pekerjaan sementara  | `stash push`, `list`, `show`, `apply`, `pop`, `drop`; `-u` dan `--index`; named stash; konflik saat pop; `stash branch`                                                                              | Diskon member belum selesai, tetapi harga teh di main harus segera dinaikkan                                                                    | Working tree dan tumpukan stash sebelum/sesudah tiap tindakan                       |
| 10. Membatalkan dan memulihkan    | `restore`; `restore --staged`; reset soft/mixed/hard; `revert` untuk commit yang sudah di-push; `reflog`; `clean` dengan preview                                                                     | Salah ketik harga sudah di-add; commit belum di-push perlu ditarik; commit sudah di-push perlu dibatalkan; commit hilang setelah `reset --hard` | Matriks dampak pada HEAD/index/working tree dan alur pemulihan                      |
| 11. Merapikan riwayat             | `commit --amend`; interactive rebase dengan fixup/squash/reword; `rebase`; continue/abort; `cherry-pick`; `push --force-with-lease`                                                                  | Commit menu sore dirapikan sebelum ditinjau; diskon 15 diambil dari branch fitur ke main; branch bersama ditimpa tanpa menghapus commit rekan   | Grafik sebelum/sesudah dengan identitas commit baru                                 |
| 12. Menyelidiki bug               | `grep`; `blame`; pencarian `log -S` dan `-G`; `bisect` manual dan `bisect run`                                                                                                                       | Diskon sudah bukan 10 persen dan commit penyebabnya belum diketahui                                                                             | Pencarian biner pada riwayat dan asal perubahan per baris                           |
| 13. Tag dan rilis                 | Lightweight/annotated tag; push tag; cabang hotfix; pengantar signing; hubungan dengan penomoran versi                                                                                               | Menandai versi yang dirilis dan memperbaiki versi lama                                                                                          | Label tag yang tetap pada commit dan jalur hotfix                                   |
| 14. Produktivitas dan repo besar  | `add -p`; `worktree`; sparse checkout; pengantar partial clone; submodule; Git LFS sebagai ekstensi                                                                                                  | Commit sebagian perubahan; mengerjakan perbaikan tanpa menutup percobaan; memakai repo desain terpisah; menyimpan file desain besar             | Seleksi hunk, dua working tree, dan gitlink submodule                               |
| 15. Konfigurasi dan kebiasaan tim | `.gitattributes` dan line endings; rahasia di `.env`, `check-ignore`, dan `ls-files`; hook pre-commit; aliases                                                                                       | Akhir baris berbeda di Windows dan macOS; token pembayaran nyaris ter-commit                                                                    | Normalisasi line endings dan alur hook                                              |
| 16. Cara kerja internal           | `.git`; blob/tree/commit/tag; object ID; refs dan HEAD; DAG; reflog; pengantar packfiles, refspec, `cat-file`, `ls-tree`, `fsck`, dan `bundle`                                                       | Memahami mengapa rebase menghasilkan commit baru dan mengapa sebagian commit masih bisa ditemukan                                               | Peta objek dan hubungan referensi menuju snapshot                                   |

Pull request, protected branch, dan review dijelaskan sebagai fitur layanan kolaborasi. Git LFS dijelaskan sebagai ekstensi. Materi membedakan kemampuan Git inti dan layanan pendukung secara eksplisit.

Lampiran menyediakan glosarium, cheat sheet berdasarkan tujuan, peta command lama/modern, katalog error, serta indeks seluruh command pada reference resmi. Topik khusus seperti migrasi dari VCS lain dan administrasi server ditautkan sebagai pendalaman, dengan ruang lingkup yang terlihat jelas.

## 4. Standar wajib setiap subbab

Setiap pelajaran substantif memuat:

1. Tujuan dan prasyarat. Command yang dipakai sudah diajarkan sebelumnya, atau dikenalkan di materi ini beserta fungsinya.
2. Situasi konkret yang menjelaskan mengapa materi diperlukan.
3. Konsep singkat dan analogi bila membantu.
4. Kondisi awal: branch, file, staged/unstaged changes, dan commit yang relevan.
5. Perintah beserta alasan pemilihannya, arti opsi, dan contoh output.
6. Visual sebelum/sesudah serta penjelasan perubahan keadaan.
7. Kesalahan umum, batasan, serta langkah pembatalan bila tersedia.
8. Latihan dengan target keadaan akhir, petunjuk bertahap, dan pembahasan.
9. Ringkasan pemilihan tindakan serta tautan manual resmi.

Semua subbab wajib punya kasus yang spesifik. Kalimat umum seperti “biasanya dipakai saat bekerja” tidak memenuhi standar. Bab pengantar dan internals memakai demonstrasi yang bisa diamati, walaupun tidak selalu mengubah repository.

Contoh yang dipengaruhi shell menyediakan varian PowerShell dan POSIX. Versi minimum Git dicatat untuk fitur yang membutuhkannya. Output contoh menyatakan bahwa hash, timestamp, nama pengguna, dan sebagian pesan dapat berbeda.

## 5. Contoh bentuk pelajaran: stash saat hotfix

**Situasi:** perubahan diskon masih setengah jadi di branch `fitur-diskon`. Ada laporan checkout gagal di branch utama. Pembaca belum ingin membuat commit untuk pekerjaan diskon tersebut.

**Analogi:** simpan bahan pekerjaan ke laci berlabel, kosongkan meja, selesaikan pekerjaan mendesak, kemudian keluarkan bahan tadi.

**Urutan demonstrasi:**

1. Baca `git status` dan diff untuk mengetahui pekerjaan yang akan disimpan.
2. Jalankan `git stash push -m "WIP diskon"`. Sediakan variasi `-u` bila ada file untracked yang harus ikut disimpan.
3. Perlihatkan perubahan working tree, index, dan daftar stash.
4. Pindah ke branch utama dan buat branch hotfix; perbaiki checkout lalu commit.
5. Kembali ke branch fitur dan bandingkan `git stash apply` dengan `git stash pop` pada keadaan awal yang sama.
6. Tambahkan variasi konflik, lalu jelaskan cara menyelesaikan dan memeriksa hasilnya.

**Ketepatan yang wajib dijaga:** secara default file untracked tidak ikut disimpan. `apply` mempertahankan entri stash; `pop` menghapusnya setelah penerapan berhasil, tetapi mempertahankannya ketika terjadi konflik. Pemulihan staged state dibahas tersendiri melalui `--index`.

**Latihan:** pilih file yang perlu disimpan, kerjakan hotfix, lalu pulihkan diskon tanpa kehilangan pekerjaan. Penilaian melihat isi file, branch aktif, dan keadaan stash, bukan sekadar kecocokan teks command.

## 6. Visualisasi dan playground

Empat komponen visual dipakai ulang di banyak pelajaran:

- **Papan keadaan repository:** working tree, index, dan snapshot HEAD; isi file bisa dibandingkan.
- **Commit graph:** node commit, hubungan parent, label branch/tag, dan HEAD yang bergerak.
- **Perbandingan lokal/remote:** fetch, integrasi, dan push ditampilkan sebagai langkah terpisah.
- **Diff dan konflik:** tampilan berdampingan dengan penjelasan per bagian perubahan.

Kontrol interaktif meliputi Langkah berikutnya, Langkah sebelumnya, Ulangi skenario, serta prediksi keadaan sebelum menjalankan command. Animasi dapat dijeda dan menghormati reduced motion. Versi statis dan deskripsi teks tetap menjelaskan seluruh konsep.

Playground adalah simulator edukasi dengan daftar command dan opsi yang didukung secara eksplisit. Tahap pertama mendukung alur dasar, branch/merge sederhana, dan stash. Dukungan undo, konflik, remote, rebase, dan cherry-pick ditambahkan sesuai pengujian. Seluruh command lain tetap diajarkan melalui contoh dan latihan terminal lokal.

Simulator tidak mengeksekusi shell pengguna atau mengakses repository pengguna. Input yang belum didukung memberi pesan yang jelas. Kasus tepi yang belum dimodelkan tidak dibuat seolah-olah berhasil. Keadaan simulator dibandingkan dengan repository fixture yang dijalankan memakai Git sungguhan.

## 7. Struktur website dan desain

Halaman utama langsung menunjukkan jalur belajar, satu demonstrasi singkat, dan pintu masuk berdasarkan masalah. Materi memiliki sidebar bab, area baca, daftar isi, serta panel visual yang relevan. Di layar kecil panel disusun vertikal dengan kontrol tetap mudah dijangkau.

Halaman yang direncanakan:

- Beranda dan roadmap belajar.
- Halaman bab dan subbab dengan tautan langsung.
- Playground dan kumpulan tantangan.
- Pencarian materi, command, serta masalah sehari-hari.
- Katalog masalah seperti push rejected, detached HEAD, konflik, dan salah branch.
- Referensi command, glosarium, dan cheat sheet.

Arah visual: buku panduan modern yang nyaman dibaca, dengan bidang diagram kontras, tipografi teks yang lapang, dan monospace untuk command. Warna branch konsisten tetapi selalu dilengkapi label. Diagram menjadi elemen utama untuk menjelaskan materi.

Fitur pendukung versi pertama: pencarian lokal, tombol salin command, navigasi lanjut/kembali, tema terang/gelap, bookmark, dan progres di perangkat melalui local storage. Progres tidak tersinkron lintas perangkat. Akun, backend, dan koneksi GitHub langsung belum diperlukan untuk pengalaman inti.

## 8. Implementasi teknis

- **Astro + TypeScript:** menghasilkan halaman materi statis dan komponen yang terstruktur.
- **Content collections JSON:** satu berkas per materi di src/content/lessons, schema Zod untuk metadata dan isi, serta prasyarat eksplisit. JSON mempertahankan struktur latihan yang ada; MDX dapat ditambahkan untuk materi naratif yang membutuhkannya.
- **Modul interaksi TypeScript:** halaman mempertahankan HTML hasil build. Simulator dimuat terpisah pada playground; kontrol diagram memakai frame halaman yang sudah disiapkan. React belum diperlukan untuk interaksi yang ada.
- **SVG untuk grafik:** node, label, dan hubungan commit bisa dikontrol serta disertai penjelasan teks.
- **Indeks pencarian saat build dan local storage:** mendukung pencarian dan progres tanpa layanan akun.

Model konten memuat ID, slug, bab, level, prasyarat, tujuan, kasus, command terkait, latihan, sumber, serta versi Git yang relevan. Metadata wajib diperiksa saat build; keberadaan kasus dan visual juga diperiksa secara editorial agar tidak hanya menjadi kolom kosong formalitas.

Versi dependency dikunci di package-lock.json. Website dikerjakan lokal dahulu; keputusan hosting dan audiens ditentukan ketika hasilnya sudah bisa ditinjau.

## 9. Urutan pelaksanaan setelah persetujuan

1. **Riset dan rancangan materi:** finalisasi daftar subbab, peta prasyarat, skenario latihan, sumber tiap topik, dan batas command simulator.
2. **Satu alur belajar lengkap:** bangun struktur website, komponen visual utama, pelajaran staging/commit, dan pelajaran stash. Hasil ini menjadi contoh kualitas bahasa, kedalaman, dan interaksi untuk seluruh materi.
3. **Kurikulum inti:** selesaikan bab 1–10 beserta kasus, visual, latihan, referensi, dan katalog masalah terkait. Milestone ini diberi label cakupan yang jujur selama materi lanjutan belum selesai.
4. **Materi lanjutan:** selesaikan bab 11–16, lampiran, dan perluasan simulator yang telah teruji. Cakupan menyeluruh dinilai setelah tahap ini selesai.
5. **Verifikasi dan pemolesan:** audit materi, jalankan skenario, uji navigasi dan aksesibilitas, validasi build, serta siapkan hasil yang bisa ditinjau dan pilihan deployment.

Tahap bertahap adalah urutan pengerjaan seluruh scope. Materi lanjutan tetap merupakan bagian dari hasil yang direncanakan.

## 10. Kriteria selesai

- Keenam belas bab terisi materi substantif dan seluruh subbab memenuhi standar kasus, penjelasan, visual, serta latihan.
- Pembaca bisa memulai dari nol, mencari berdasarkan masalah, dan menemukan penjelasan command secara langsung.
- Contoh dapat direproduksi di repository latihan terisolasi; contoh remote memakai bare repository lokal untuk pengujian.
- Pengujian bermakna mencakup perubahan state simulator: partial staging, branch/HEAD, merge, stash termasuk konflik dan untracked, reset modes, serta alur pemulihan yang didukung.
- Perintah yang membuang perubahan atau mengubah riwayat menjelaskan keadaan yang terdampak, prasyarat, langkah pemeriksaan, dan batas pemulihan.
- Reflog tidak digambarkan sebagai backup permanen atau jaminan pemulihan semua data; `.gitignore` tidak digambarkan menghapus file yang sudah tracked; force-with-lease tidak digambarkan bebas risiko.
- Perbedaan Git dan fitur penyedia hosting terlihat jelas.
- Navigasi, pencarian, tautan sumber, salin command, tema, dan progres berfungsi; build berhasil.
- Tampilan dapat digunakan pada ponsel dan desktop, dengan keyboard, label yang jelas, kontras yang memadai, reduced motion, serta alternatif teks untuk visual.

## 11. Referensi awal

- [Pro Git, edisi kedua](https://git-scm.com/book/en/v2): kerangka fondasi hingga internals.
- [Git command reference](https://git-scm.com/docs): perilaku command dan opsi; sumber utama per pelajaran.
- [Reset Demystified](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified): HEAD, index, dan working tree.
- [git-stash](https://git-scm.com/docs/git-stash): penyimpanan perubahan, apply/pop, dan konflik.
- [git-reflog](https://git-scm.com/docs/git-reflog): log referensi dan batas retensinya.
- [git-worktree](https://git-scm.com/docs/git-worktree): beberapa working tree dalam satu repository.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/): pengelolaan konten terstruktur.
- [Astro islands](https://docs.astro.build/en/concepts/islands/): komponen interaktif di halaman statis.

Penjelasan dan ilustrasi website ditulis sendiri. Sumber dirujuk pada bagian terkait; kutipan atau aset dari luar harus mengikuti lisensinya.
