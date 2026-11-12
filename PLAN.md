# Rencana Git Guides

Status: disetujui pengguna dan tersedia secara lokal. Kurikulum sekarang 16 bab/66 subbab, dilengkapi kondisi awal, prasyarat, pemeriksaan hasil, 23 skenario terminal Git asli yang dapat diunduh, serta ilustrasi branch/merge/remote/rebase/reset/pemulihan. Desain yang disepakati memakai Poppins 15px, aksen orange jenuh, dan dark mode hitam murni dengan panel abu netral. Paket Astro belum dapat diunduh pada environment ini, sehingga implementasi tetap HTML/CSS/JavaScript tanpa dependency. Hosting publik dan migrasi ke prerender belum dilakukan.

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

| Bab                               | Cakupan subbab                                                                                                                                 | Contoh kasus                                                                                      | Visual utama                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. Memahami Git                   | Version control; Git dan layanan hosting; repository lokal/remote; snapshot; working tree, staging, commit                                     | Folder `final`, `final-baru`, dan `final-fix` membuat versi menu sulit dilacak                    | Perbandingan folder manual dengan timeline snapshot; tiga area kerja |
| 2. Persiapan                      | Instalasi Windows/macOS/Linux; terminal dasar; `config`; identitas; editor; `help`; pengantar autentikasi                                      | Commit memiliki identitas salah; pengguna bingung terminal dan editor                             | Peta konfigurasi system/global/local dan alur setup                  |
| 3. Siklus perubahan               | `init`, `clone`, `status`, `add`, `commit`; tracked/untracked; `.gitignore`; `diff` dan `diff --staged`; pengantar unstage                     | Perubahan menu dan checkout tercampur, hanya menu yang perlu di-commit                            | File berpindah keadaan dengan isi sebelum/sesudah staging            |
| 4. Membaca riwayat                | `log`, `show`, grafik; hash; `HEAD`; revision seperti `HEAD~1`; rentang commit dan perbandingan versi                                          | Menemukan kapan harga kopi berubah dan perubahan apa yang ikut masuk                              | Timeline commit yang bisa dipilih dan panel diff                     |
| 5. Branch                         | `branch`, `switch`; kompatibilitas `checkout`; rename/delete; detached HEAD                                                                    | Membuat fitur diskon sambil mempertahankan versi utama                                            | Grafik commit dengan label branch dan penunjuk HEAD                  |
| 6. Merge dan konflik              | Fast-forward; merge commit; conflict markers; resolve; `merge --abort`                                                                         | Dua orang mengubah harga item yang sama                                                           | Grafik dua cabang dan panel base/ours/theirs/result                  |
| 7. Remote dan sinkronisasi        | `remote`, `fetch`, `pull`, `push`; remote-tracking refs; upstream; ahead/behind; pull merge/rebase/fast-forward; pengantar SSH/HTTPS           | Push ditolak karena rekan sudah mengirim commit                                                   | Dua repository berdampingan; posisi lokal, `origin/main`, dan remote |
| 8. Bekerja dalam tim              | Feature branch; fork; pull/merge request; review; squash merge; pilihan workflow dan protected branch                                          | Menyelesaikan review fitur keranjang tanpa mengganggu tim                                         | Alur kontribusi dari branch hingga integrasi; perbandingan workflow  |
| 9. Menyimpan pekerjaan sementara  | `stash push`, `list`, `show`, `apply`, `pop`, `drop`; `-u`; named stash; konflik; `stash branch`                                               | Sedang mengerjakan diskon, tetapi checkout harus segera diperbaiki                                | Working tree dan tumpukan stash sebelum/sesudah tiap tindakan        |
| 10. Membatalkan dan memulihkan    | `restore`; `restore --staged`; `revert`; reset soft/mixed/hard; `reflog`; `clean` dengan preview                                               | Salah stage; perubahan lokal salah; commit buruk sudah dibagikan; branch terhapus                 | Matriks dampak pada HEAD/index/working tree dan alur diagnosis       |
| 11. Merapikan riwayat             | `commit --amend`; `rebase`; interactive rebase; squash/fixup/reword; `cherry-pick`; continue/abort; batas `--force-with-lease`                 | Lima commit percobaan dirapikan; satu perbaikan dipindahkan ke branch rilis                       | Grafik sebelum/sesudah dengan identitas commit baru                  |
| 12. Menyelidiki bug               | `blame`; `bisect`; `grep`; pencarian `log -S` dan `-G`                                                                                         | Checkout rusak dan belum diketahui commit penyebabnya                                             | Pencarian biner pada riwayat dan asal perubahan per baris            |
| 13. Tag dan rilis                 | Lightweight/annotated tag; push tag; cabang hotfix; pengantar signing; hubungan dengan penomoran versi                                         | Menandai versi yang dirilis dan memperbaiki versi lama                                            | Label tag yang tetap pada commit dan jalur hotfix                    |
| 14. Produktivitas dan repo besar  | `add -p`; aliases; `worktree`; `rerere`; sparse checkout; pengantar partial/shallow clone; submodule; pengantar Git LFS sebagai ekstensi       | Menguji hotfix tanpa menutup pekerjaan; commit sebagian perubahan; mengambil bagian repo besar    | Seleksi hunk, dua working tree, dan peta dependensi                  |
| 15. Konfigurasi dan kebiasaan tim | `.gitattributes`; line endings; hooks; credential handling; commit messages; secret yang terlanjur masuk; pengantar maintenance                | Diff penuh perubahan baris di Windows/Linux; file sensitif telanjur di-commit                     | Normalisasi line endings; alur hook; alur penanganan insiden         |
| 16. Cara kerja internal           | `.git`; blob/tree/commit/tag; object ID; refs dan HEAD; DAG; reflog; pengantar packfiles, refspec, `cat-file`, `ls-tree`, `fsck`, dan `bundle` | Memahami mengapa rebase menghasilkan commit baru dan mengapa sebagian commit masih bisa ditemukan | Peta objek dan hubungan referensi menuju snapshot                    |

Pull request, protected branch, dan review dijelaskan sebagai fitur layanan kolaborasi. Git LFS dijelaskan sebagai ekstensi. Materi membedakan kemampuan Git inti dan layanan pendukung secara eksplisit.

Lampiran menyediakan glosarium, cheat sheet berdasarkan tujuan, peta command lama/modern, katalog error, serta indeks seluruh command pada reference resmi. Topik khusus seperti migrasi dari VCS lain dan administrasi server ditautkan sebagai pendalaman, dengan ruang lingkup yang terlihat jelas.

## 4. Standar wajib setiap subbab

Setiap pelajaran substantif memuat:

1. Tujuan dan prasyarat.
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

## 8. Usulan teknis

- **Astro + TypeScript:** menghasilkan halaman materi statis dan komponen yang terstruktur.
- **MDX + content collections:** konten terpisah dari UI, metadata terverifikasi, dan komponen visual bisa disisipkan pada materi.
- **React untuk bagian interaktif:** simulator, kuis, serta kontrol visual dimuat pada bagian yang memerlukannya.
- **SVG untuk grafik:** node, label, dan hubungan commit bisa dikontrol serta disertai penjelasan teks.
- **Indeks pencarian saat build dan local storage:** mendukung pencarian dan progres tanpa layanan akun.

Model konten memuat ID, slug, bab, level, prasyarat, tujuan, kasus, command terkait, latihan, sumber, serta versi Git yang relevan. Metadata wajib diperiksa saat build; keberadaan kasus dan visual juga diperiksa secara editorial agar tidak hanya menjadi kolom kosong formalitas.

Versi dependency dipilih dan dikunci saat implementasi. Website dikerjakan lokal dahulu; keputusan hosting dan audiens ditentukan ketika hasilnya sudah bisa ditinjau.

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
