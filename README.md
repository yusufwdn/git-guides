# Git Guides

Website belajar Git berbahasa Indonesia dengan kasus proyek Kopi Kita, diagram, latihan, dan simulator di browser.

## Lihat contoh visual

Buka `index.html` di browser, lalu pilih **Lihat contoh interaktif**. Materi utama juga bisa dibuka dengan URL `index.html#/belajar/stash`.

Tidak ada dependency yang perlu dipasang. Semua fungsi inti berjalan lokal. Font Poppins untuk teks disertakan di `assets/fonts/` agar tetap tersedia tanpa internet; font kode tetap IBM Plex Mono dengan fallback monospace. Atribusi dan lisensi Poppins tersedia di `assets/fonts/OFL.txt`.

Untuk memakai server lokal dengan Node.js 22 atau lebih baru:

```powershell
npm run dev
```

Buka <http://localhost:4321/belajar/stash/>. Server development langsung mengirim HTML yang berisi materi. Jalankan dari folder proyek; port bisa diganti melalui variabel `PORT`.

Untuk memeriksa hasil build statis yang akan dihosting:

```powershell
npm run build
npm run preview
```

Server preview melayani file hasil build dari `dist/`. Hentikan server development lebih dahulu bila memakai port yang sama.

## URL dan prerender

- Materi: `/belajar/stash/`, `/belajar/rebase-dasar/`, dan URL per subbab lainnya.
- Daftar bab: `/roadmap/`; satu bab: `/bab/9/`.
- Latihan: `/latihan/` dan `/latihan/remote/`.
- Referensi, glosarium, katalog masalah, serta playground juga memiliki URL sendiri.

Build menghasilkan **112 halaman HTML**, `404.html`, dan aset. Contohnya, `/belajar/stash/` dilayani dari `dist/belajar/stash/index.html`. Isi materi, kondisi awal, command, diagram awal, petunjuk, dan pembahasan latihan sudah ada di HTML tanpa menunggu JavaScript. JavaScript mengaktifkan simulator, kuis, pencarian, progres, dan navigasi dalam halaman.

Browser dan build memakai template bersama di `assets/pages.js` serta definisi route di `assets/routes.js`. Navigasi online menggunakan History API; refresh pada URL nested tetap membaca file HTML yang benar. URL lama seperti `/#/belajar/stash` tetap dikenali dan dinormalisasi oleh browser. Jika membuka `index.html` langsung melalui `file:`, navigasi hash tetap dipakai sebagai kompatibilitas lokal.

Setiap halaman memiliki judul, deskripsi, Open Graph, dan canonical sesuai URL. Ketika domain publik sudah diketahui, set `SITE_URL` ke origin domain asli sebelum build agar canonical menjadi absolut serta `sitemap.xml` dan `robots.txt` ikut dibuat. Tanpa `SITE_URL`, canonical memakai path relatif terhadap origin dan build tidak mengarang domain publik.

```powershell
# Ganti domain contoh dengan domain asli sebelum deployment.
$env:SITE_URL = 'https://domain-kamu.com'
npm run build
```

Hosting statis perlu mendukung directory index dan menyajikan `404.html` dengan status 404 untuk alamat yang tidak ditemukan. Jangan mengarahkan seluruh alamat yang salah ke halaman utama dengan status 200. Server development dan preview sudah menerapkan perilaku ini, termasuk redirect URL tanpa trailing slash.

## Deployment Vercel

Konfigurasi [vercel.json](vercel.json) menetapkan preset Other, build `npm run build`, output `dist`, dan URL dengan trailing slash. Pengaturan ini mengikuti [dokumentasi konfigurasi Vercel](https://vercel.com/docs/project-configuration/vercel-json).

Import repository ke Vercel dengan root directory proyek ini. Pilih Node.js 22 atau lebih baru, lalu isi environment variable `SITE_URL` dengan origin domain produksi, misalnya `https://nama-proyek.vercel.app`. Setelah mengganti domain atau `SITE_URL`, lakukan build/deploy ulang supaya canonical dan sitemap memakai domain tersebut. Domain pada contoh harus diganti dengan domain proyek asli.

Deployment Vercel belum dijalankan dari workspace ini. Progres belajar tetap disimpan di localStorage masing-masing browser dan origin; progres localhost tidak ikut berpindah ke domain produksi.

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

Website memakai HTML/CSS/JavaScript tanpa dependency runtime. Konten dipisahkan dari template, controller interaksi, serta routing; build melakukan prerender dengan Node.js tanpa memerlukan browser atau framework tambahan.

## Verifikasi

```powershell
npm run check
npm test
npm run build
```

Pengujian memakai Git sungguhan pada repository sementara yang terisolasi: simulator, solusi setiap skenario terminal, penolakan hasil yang keliru, serta parent/referensi yang mendasari ilustrasi. Tes prerender memeriksa seluruh route, konten HTML, canonical, aset nested, serta status HTTP pada server development dan preview.

Sesudah build, jalankan `npm run preview`, lalu `node scripts/browser-check.mjs` di terminal lain untuk memeriksa seluruh halaman, tujuh ilustrasi bertahap, latihan/ZIP, tema, dan layout 320–1440px. QA browser juga mencakup URL langsung, refresh, Back/Forward, query playground, anchor bagian, URL hash lama, pembukaan file lokal, dan halaman tanpa JavaScript. Screenshot disimpan di `artifacts/`.

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
- `assets/app.js`: controller pencarian, kuis, progres, dan interaksi halaman.
- `assets/pages.js`: template HTML bersama untuk prerender dan browser.
- `assets/routes.js`: definisi URL, metadata, navigasi History API, dan kompatibilitas file lokal.
- `assets/styles.css`: desain responsif dan tema.
- `scripts/`: server lokal, pemeriksaan, build statis, dan browser QA.
- `scripts/render-page.mjs`: penyusunan dokumen HTML beserta metadata dan aset per halaman.
- `tests/`: pengujian simulator dengan pembanding Git sungguhan.
- `labs/`: generator mandiri beserta petunjuk latihan. Build mengemasnya menjadi ZIP di `assets/downloads/`.

Build menghasilkan `dist/` yang bisa ditempatkan pada hosting statis. Belum ada deployment atau integrasi akun.
