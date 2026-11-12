# Git Guides

Website belajar Git berbahasa Indonesia dengan kasus proyek Kopi Kita, diagram, latihan, dan simulator di browser.

## Lihat contoh visual

Buka `index.html` di browser, lalu pilih **Lihat contoh interaktif**. Materi utama juga bisa dibuka dengan URL `index.html#/belajar/stash`.

Tidak ada dependency yang perlu dipasang. Semua fungsi inti berjalan lokal. Font Poppins untuk teks disertakan di `assets/fonts/` agar tetap tersedia tanpa internet; font kode tetap IBM Plex Mono dengan fallback monospace. Atribusi dan lisensi Poppins tersedia di `assets/fonts/OFL.txt`.

Untuk memakai server lokal dengan Node.js 22 atau lebih baru:

```powershell
npm run dev
```

Buka <http://localhost:4321/#/belajar/stash>. Jalankan dari folder proyek. Port bisa diganti melalui variabel `PORT`.

## Cakupan saat ini

- 16 bab, 66 subbab: kasus, konsep, analogi, kondisi awal, prasyarat, tujuan, command pemeriksaan, latihan, kuis, dan sumber resmi.
- Halaman utama, peta belajar, katalog masalah, referensi command, glosarium, dan pencarian.
- Diagram stash dan staging, ditambah ilustrasi bertahap branch, merge biasa/fast-forward, lokal/remote, rebase, reset per mode, dan pemulihan referensi.
- Tiga skenario playground: stash termasuk untracked, commit sebagian file, serta konflik stash.
- 23 skenario terminal Git asli dalam paket ZIP: termasuk partial staging, konflik/abort merge, stash/index/konflik, tiga mode reset, revert, reflog, remote lokal, rebase, cherry-pick, clean, bisect, tag, sparse checkout, dan object.
- Progres dan bookmark lokal, tema terang/gelap, navigasi keyboard, reduced motion, serta layout mobile.

Target 60–80 subbab pada [PLAN.md](PLAN.md) sekarang diisi 66 materi. Signing, Git LFS, submodule, dan autentikasi menjelaskan prasyarat serta contoh penggunaan, tetapi tidak menyediakan server eksternal, kredensial, atau lingkungan signing siap pakai. Latihan pendamping yang ditautkan pada topik tersebut menguji fondasi terkait dan diberi label sebagai latihan terpisah.

Teks utama memakai Poppins lokal 15px, kode IBM Plex Mono dengan fallback monospace. Dark mode menggunakan hitam murni untuk latar utama/sidebar dan panel abu netral; aksen orange jenuh dipakai untuk navigasi, indikator, dan tombol.

## Praktik terminal asli

Buka menu **Latihan**, unduh `assets/downloads/kopi-kita-labs.zip`, lalu ekstrak. Paket mandiri memerlukan Git 2.34+ dan Node.js 22+, tanpa dependency npm.

```powershell
node git-lab.cjs list
node git-lab.cjs start staging
```

Generator membuat folder baru dan mencetak command `cd` serta `check` dengan path yang benar. Ia tidak mereset folder latihan sebelumnya, tidak mengubah identitas Git global, dan tidak menghubungi server internet. Latihan remote memakai server bare dan dua clone di folder latihan sendiri.

Checker memeriksa keadaan akhir, bukan rekaman semua tindakan. Latihan observasi, stash yang dipulihkan, atau merge yang dibatalkan bisa kembali ke keadaan yang sama seperti awal. Pembaca tetap perlu mengamati keadaan di tengah proses. Petunjuk dan pembahasan ditutup secara default pada website.

Preview memakai HTML/CSS/JavaScript tanpa dependency karena instalasi paket dibatasi jaringan pada environment pengembangan. Struktur konten dipisahkan dari tampilan agar bisa dipindahkan ke MDX/Astro ketika dependency tersedia. Halaman dirender di browser dengan hash routing; prerender untuk SEO belum diterapkan.

## Verifikasi

```powershell
npm run check
npm test
npm run build
```

Pengujian memakai Git sungguhan pada repository sementara yang terisolasi: simulator, solusi setiap skenario terminal, penolakan hasil yang keliru, serta parent/referensi yang mendasari ilustrasi. Jalankan `node scripts/browser-check.mjs` saat server dev aktif untuk memeriksa seluruh halaman, tujuh ilustrasi bertahap, latihan/ZIP, tema, dan layout 320–1440px. Screenshot disimpan di `artifacts/`.

Skrip browser QA memerlukan Chrome atau Edge lokal di Windows. Ia menggunakan profil sementara khusus proyek dan mode browser pengujian tanpa sandbox internal Chrome agar subprocess browser dapat berjalan dalam sandbox host. Ini tidak dipakai pada website atau profil browser pribadi.

## Format source

Source memakai indentasi dua spasi, semicolon, single quote pada JavaScript, dan line ending LF. Aturan bersama ada di `.prettierrc.json` dan `.editorconfig`; gunakan Prettier saat menyunting kode. Template HTML di JavaScript diberi penanda `/* HTML */` agar isi markup ikut diformat.

Hasil build, paket unduhan, font, screenshot, cache, dan profil browser dikecualikan melalui `.prettierignore`. Paket latihan diperbarui dari source yang sudah rapi saat build.

## Batas simulator

Simulator tidak menjalankan shell, mengakses file pengguna, atau berkomunikasi dengan remote. Dukungan command dan opsi dicantumkan di playground. Merge teks kompleks, ignored files, remote, rebase, dan sebagian opsi Git belum dimodelkan. Apply/pop pada latihan dimulai dari index dan tracked working tree yang bersih.

Output simulator dan hash commit adalah ilustrasi. Untuk perilaku Git lengkap gunakan repository latihan sungguhan dan manual resmi yang ditautkan pada setiap materi.

## Struktur

- `index.html`: kerangka halaman.
- `assets/content.js`: kurikulum, kasus, langkah, dan kuis.
- `assets/curriculum.js`: pendalaman materi, prasyarat, kondisi awal, sumber, dan pembahasan latihan.
- `assets/learning.js`: panel persiapan, latihan terminal, pembahasan, dan interaksi ilustrasi.
- `assets/visuals.js`: keadaan dan hubungan parent/referensi pada ilustrasi bertahap.
- `assets/simulator.js`: mesin keadaan repository tiruan; juga dapat diuji di Node.
- `assets/app.js`: routing, render, pencarian, dan interaksi.
- `assets/styles.css`: desain responsif dan tema.
- `scripts/`: server lokal, pemeriksaan, build statis, dan browser QA.
- `tests/`: pengujian simulator dengan pembanding Git sungguhan.
- `labs/`: generator mandiri beserta petunjuk latihan. Build mengemasnya menjadi ZIP di `assets/downloads/`.

Build menghasilkan `dist/` yang bisa ditempatkan pada hosting statis. Belum ada deployment atau integrasi akun.
