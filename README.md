# Git Guides

Website belajar Git berbahasa Indonesia melalui proyek Kopi Kita, diagram bertahap, kuis, simulator browser, dan latihan dengan Git sungguhan.

## Panduan mengubah website

Baru memakai Astro? Mulai dari [dokumentasi pengembang](docs/README.md). Di sana ada penjelasan Astro dari nol, peta “halaman/bagian → file”, contoh mengubah beranda dan tampilan, cara menambah halaman atau materi, panduan diagram/latihan, serta verifikasi dan deployment.

## Menjalankan proyek

Gunakan Node.js 22.12+; pengembangan dan CI diverifikasi dengan Node.js 24. Dependency dikunci dalam `package-lock.json`.

```powershell
npm ci
npm run dev
```

Buka URL yang dicetak Astro, biasanya <http://localhost:4321/>. Pemula bisa mulai dari `/persiapan/`, yang mencakup instalasi Git di Windows/macOS/Linux, penggunaan terminal, konfigurasi lokal, commit pertama, dan keadaan repo untuk bab awal.

```powershell
npm run build
npm run preview
```

Build Astro menghasilkan 115 route HTML, `404.html`, indeks pencarian, dan aset di `dist/`. Buka hasil melalui server; membuka source `index.html` lewat `file:` sudah digantikan oleh alur development/preview Astro. URL hash lama seperti `/#/belajar/stash` tetap dinormalisasi ke `/belajar/stash/`.

## Struktur dan konten

- `src/content/lessons/*.json`: satu file per materi, termasuk urutan, prasyarat eksplisit, kasus, contoh, sumber, latihan pendamping, dan evaluasi.
- `src/content.config.ts`: content collection Astro dan schema Zod. Build menolak struktur materi atau jawaban kuis yang tidak valid.
- `src/data/catalog.json`, `src/data/labs.json`: bab, glosarium, katalog masalah, dan deskripsi latihan.
- `src/layouts/Base.astro`, `src/components/GettingStarted.astro`: kerangka halaman dan panduan pemula.
- `src/renderers/`: template server yang dipisah menurut fungsi, digunakan saat build. Template dan seluruh kurikulum tidak dikirim sebagai JavaScript browser.
- `src/scripts/client.ts`: peningkatan progres, kuis, pencarian, tema, dan diagram pada HTML yang sudah tersedia.
- `src/scripts/playground.ts`, `src/lib/simulator.js`: simulator yang dimuat terpisah pada playground.
- `src/lib/progress.js`: validasi, kompatibilitas data lama, serta ekspor/impor progres.
- `src/lib/visuals.js`: model keadaan diagram bertahap; `assets/styles.css`: desain responsif dan tema.
- `src/lib/routes.js`: katalog URL dan metadata untuk prerender.
- `assets/content.js`, `assets/pages.js`, `assets/simulator.js`, `assets/routes.js`, `assets/visuals.js`: penghubung pengujian ke modul source; bukan skrip yang dimuat pengunjung.
- `src/pages/search-index.json.ts`: indeks pencarian dari content collections, disimpan statis saat build dan mengikuti data materi saat development.
- `scripts/prepare-assets.mjs`: menyiapkan aset publik sebelum dev/build.
- `labs/`: generator latihan mandiri; build memperbarui paket ZIP.
- `tests/`, `.github/workflows/ci.yml`: pengujian dan verifikasi otomatis.

Materi dipertahankan dalam JSON terstruktur agar contoh, kuis, dan latihan mempunyai schema yang sama. Tidak diperlukan React untuk interaksi saat ini. Astro menangani build dan halaman statis; navigasi menggunakan tautan dokumen biasa agar history dan posisi baca dikelola browser.

## Cakupan belajar

- 16 bab, 66 materi, dan 16 tantangan berbasis situasi pada penutup bab.
- 25 latihan terminal, termasuk worktree dan submodule dengan sumber lokal.
- 16 model diagram bertahap, termasuk bisect, cherry-pick, partial staging, tag, worktree, force-with-lease, signing, LFS, dan submodule. Sebagian materi memakai ilustrasi fondasi yang sama jika relevan.
- Empat skenario browser: stash termasuk untracked, staging satu tujuan, konflik stash, serta commit pada branch baru.
- Pencarian judul dan isi materi, istilah, serta masalah; semua hasil tersedia, dengan urutan relevansi dan potongan teks.
- Progres selesai manual, bookmark, hasil kuis, dan hasil latihan browser tersimpan lokal. Penandaan selesai tetap dapat diubah tanpa kewajiban lulus kuis.

Ekspor/impor tersedia di `/roadmap/` untuk mencadangkan atau memindahkan progres. Format ekspor berversi; impor mengganti progres lokal setelah validasi. Tidak ada akun, database, atau sinkronisasi otomatis antarperangkat. Data lama `gitguides:completed` dan `gitguides:bookmarks` tetap dikenali. Data dengan format keliru dipulihkan ke nilai awal tanpa mematikan interaksi.

Signing dan LFS masih memerlukan alat/kunci atau dukungan server yang disiapkan pengguna; halaman menjelaskan prasyaratnya. Simulator memiliki daftar dukungan terbatas dan tidak menjalankan shell, mengakses file pengguna, atau menghubungi remote. Untuk Git lengkap gunakan latihan terminal dan manual resmi yang ditautkan.

## Latihan terminal

Unduh ZIP dari menu Latihan, ekstrak, lalu buka terminal pada folder tersebut. Paket memerlukan Git 2.34+ dan Node.js 22+, tanpa dependency npm.

```powershell
node git-lab.cjs list
node git-lab.cjs start staging
```

Ikuti command `cd` dan `check` yang dicetak. Generator membuat folder baru setiap kali dijalankan dan mengatur identitas/config Git secara lokal. Remote dan submodule memakai repository lokal. Latihan worktree membuat folder saudara di root latihan yang baru.

Checker menilai keadaan akhir. Ia tidak membuktikan setiap tindakan observasi atau pembatalan sudah dijalankan. Periksa keadaan di tengah proses dan jelaskan hasilnya. Gunakan folder latihan yang memang boleh diubah ketika mencoba reset, clean, atau penulisan ulang riwayat.

## Verifikasi

```powershell
npm run check
npm test
npm run test:browser
```

`check` memeriksa kontrak data dan TypeScript/Astro. Tes Node menjalankan fixture Git asli, pemulihan/validasi progres, dan build Astro. Tes build memakai `SITE_URL=https://example.test` untuk memeriksa canonical dan sitemap; jalankan `npm run build` lagi untuk hasil deployment dengan konfigurasi domain sebenarnya.

Playwright memulai dan menghentikan server preview miliknya sendiri, memeriksa semua route, seluruh materi, empat playground, history/scroll, fokus keyboard, pencarian, kuis, impor/ekspor, mode tanpa JavaScript, dan layout 320–1440px. Di Windows ia menemukan Chrome atau Edge lokal. Untuk browser lain, set `BROWSER_EXECUTABLE` ke path executable; untuk port lain set `BROWSER_TEST_PORT` (default 4323).

Di Linux/CI, pasang Chromium pengujian lebih dahulu:

```powershell
npx playwright install --with-deps chromium
```

CI menjalankan pemeriksaan, tes/build, dan browser QA pada setiap push/pull request. Hasil kegagalan browser disimpan sebagai artefak. Screenshot lokal tersedia di `artifacts/`; hasil dan trace gagal berada di `test-results/`.

## Deployment Vercel

`vercel.json` menggunakan preset **Astro**, build `npm run build`, output `dist`, dan trailing slash. Pilih Node.js 24 pada pengaturan proyek. Set `SITE_URL` ke origin domain produksi, tanpa path, query, hash, atau kredensial:

```powershell
$env:SITE_URL = 'https://domain-kamu.com'
npm run build
```

Dengan `SITE_URL`, setiap route mempunyai canonical absolut dan tercantum dalam sitemap. Tanpanya, build tidak mengarang domain; sitemap kosong dan canonical absolut dihilangkan. Hosting perlu melayani directory index serta `404.html` dengan status 404. Progres localhost dan domain produksi terpisah menurut origin browser.

Perubahan ini belum dipublikasikan dari workspace. Preview bukan server produksi.

## Aset dan format

Desain mempertahankan Poppins 15px, aksen orange, dan dark mode hitam dengan panel abu netral. Poppins disajikan sebagai WOFF2 lokal; lisensi/atribusi ada di `assets/fonts/OFL.txt`, dan source TTF dipertahankan. Font kode memakai monospace sistem tanpa request font eksternal. Diagram menghormati reduced motion dan kontrol tahap mempertahankan fokus keyboard.

Jalankan `npm run format` untuk merapikan source. Aturan bersama ada di `.prettierrc.json`, `.editorconfig`, dan `.prettierignore`. Aset publik hasil persiapan, cache, build, serta keluaran QA tidak disunting langsung.
