# Memeriksa perubahan, membuat commit, dan deploy

[Kembali ke daftar panduan](README.md).

## Pemeriksaan sebelum commit

Mulai dari perubahan yang kamu lakukan:

| Perubahan                             | Pemeriksaan yang relevan                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| Teks atau CSS satu halaman            | `npm run check`, buka halaman, periksa mobile dan tema jika tampilan berubah.       |
| JSON materi, kuis, atau prasyarat     | `npm run check`, buka materi, uji contoh dan kuis yang berubah.                     |
| Route, layout, atau template bersama  | `npm run check`, `npm test`, `npm run test:browser`.                                |
| Simulator atau latihan Git            | Tes engine/latihan terkait dengan Git sungguhan, lalu browser QA jika UI terdampak. |
| Progress, bookmark, atau impor/ekspor | Tes progres dan browser QA, termasuk data lama serta data dengan format keliru.     |
| Dokumentasi                           | Periksa contoh terhadap source, tautan file, dan command yang berubah.              |

Untuk pemeriksaan lengkap dari root proyek:

```powershell
npm run check
npm test
npm run test:browser
git diff --check
```

`npm test` juga membangun website dan memakai domain pengujian `https://example.test` untuk memeriksa canonical/sitemap. Setelah tes, buat ulang hasil untuk preview/deployment dengan konfigurasi domain yang diinginkan:

```powershell
npm run build
npm run preview
```

Tes dijalankan berurutan karena sebagian tes memakai hasil kerja Astro yang sama. Tes development menjalankan servernya sendiri. Playwright juga membuat server preview miliknya sendiri dan menghentikannya setelah selesai.

## Menjalankan browser QA

Di Windows, konfigurasi Playwright mencoba menemukan Chrome atau Edge pada lokasi instalasi yang dikenal. Di lingkungan lain atau CI, pasang Chromium pengujian:

```powershell
npx playwright install --with-deps chromium
```

Jika executable berada di lokasi lain atau port 4323 sudah dipakai:

```powershell
$env:BROWSER_EXECUTABLE = 'C:\path\ke\chrome.exe'
$env:BROWSER_TEST_PORT = '4366'
npm run test:browser
```

Gunakan path executable yang benar pada komputermu. Variabel PowerShell itu berlaku pada terminal tersebut. Setelah selesai, nilai override dapat dihapus dengan `Remove-Item Env:BROWSER_EXECUTABLE` dan `Remove-Item Env:BROWSER_TEST_PORT` bila memang sebelumnya disetel.

Playwright menyimpan screenshot/trace kegagalan di `test-results/`. Screenshot contoh tampilan ada di `artifacts/`. Folder keluaran ini diabaikan Git. Pengujian memeriksa route, materi, simulator, keyboard, history, kuis, pencarian, progres, layout kecil, dan halaman tanpa JavaScript.

Untuk memilih tes tertentu, gunakan nama yang sesuai dari file tes:

```powershell
npm run test:browser -- --grep "pencarian"
node --test tests/progress.test.cjs
node --test tests/labs.test.cjs
```

Lakukan perubahan satu per satu ketika mendiagnosis kegagalan. Baca nama tes, expected/actual, dan screenshot sebelum mengubah assertion.

## Merapikan format

```powershell
npm run format
```

Script tersebut merapikan source aplikasi, script, konfigurasi Astro/Playwright, dan tes yang tercakup polanya. Untuk CSS, Markdown, atau file lain yang baru diedit, jalankan Prettier pada file itu secara eksplisit:

```powershell
npm exec prettier -- --write assets/styles.css README.md "docs/**/*.md"
```

Jangan memakai `npm run format` sebagai bukti fungsi aplikasi benar; pemeriksaan perilaku tetap dilakukan melalui preview dan tes yang relevan.

## Membuat commit yang mudah dibaca

Lihat isi perubahan dahulu:

```powershell
git status --short
git diff
```

Kelompokkan perubahan yang menyelesaikan satu tujuan. Contoh untuk memperbaiki satu materi:

```powershell
git add src/content/lessons/stash.json
git diff --cached
git commit -m "docs: clarify stash prerequisites" -m "Explain the starting repository state and how to verify restored work."
```

Jika perubahan materi juga membutuhkan pembaruan diagram atau tes, ikutkan file terkait dalam commit yang sama agar perubahan dapat dipahami dan diperiksa sebagai satu kesatuan. File dokumentasi pengembang dapat menjadi commit sendiri jika menjelaskan beberapa perubahan sekaligus.

Sebelum selesai, periksa `git status --short` dan `git log --oneline -5`. Commit membuat riwayat lokal; `git push` adalah langkah terpisah ketika kamu ingin mengirimkannya ke remote.

## CI di GitHub

[Workflow CI](../.github/workflows/ci.yml) menjalankan instalasi bersih dari lockfile, pemeriksaan source, tes/build, dan browser QA pada push serta pull request. CI menggunakan Node.js 24 dan Chromium. Saat browser QA gagal, folder hasil pengujian diunggah sebagai artefak workflow.

Jalankan pemeriksaan lokal yang relevan sebelum push agar masalah sederhana bisa diketahui lebih cepat.

Versi Git di runner Linux bisa berbeda dari Git lokal. Tes latihan `bisect` memeriksa kandidat melalui referensi Git dan `rev-list`, sehingga perubahan kalimat output Git tidak menentukan kelulusan tes. Saat menulis tes command Git baru, gunakan status repository atau output terstruktur; hindari mencocokkan kalimat tampilan secara persis.

## Deployment Vercel

[vercel.json](../vercel.json) memakai preset Astro, build `npm run build`, output `dist`, dan trailing slash. Pilih Node.js 24 pada pengaturan proyek Vercel.

`engines.node` pada `package.json` dikunci ke `24.x`, sama dengan versi CI. Vercel membaca pengaturan ini untuk memilih versi Node saat build; rentang terbuka seperti `>=22.12.0` dapat memilih versi mayor yang lebih baru meskipun dashboard memilih 24. Lihat [dokumentasi pemilihan versi Node Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Pastikan pengaturan proyek berikut sebelum push pertama setelah migrasi:

| Pengaturan        | Nilai                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Git Repository    | Repository GitHub proyek ini.                                                                |
| Production Branch | `main`                                                                                       |
| Root Directory    | Root repository yang memuat `package.json`.                                                  |
| Framework Preset  | Astro                                                                                        |
| Node.js Version   | 24.x                                                                                         |
| Install Command   | `npm ci` atau default Vercel; dependency build dalam `devDependencies` harus ikut terpasang. |
| Build Command     | `npm run build`                                                                              |
| Output Directory  | `dist`                                                                                       |

Framework, build command, dan output directory sudah dinyatakan dalam `vercel.json`. Koneksi Git, branch produksi, root directory, dan environment variable tetap perlu diperiksa di dashboard. Jika integrasi Git Vercel aktif, push ke branch produksi memicu deployment. Workflow GitHub Actions memeriksa kualitas kode secara terpisah; workflow tersebut tidak menjalankan deployment Vercel.

Tambahkan environment variable `SITE_URL` di Vercel dengan origin domain produksi, misalnya `https://nama-proyek.vercel.app`. Ganti contoh tersebut dengan domain asli; jangan sertakan path halaman, query, hash, atau kredensial. Pengaturan dibaca saat build.

Untuk menguji build dengan origin tertentu melalui PowerShell:

```powershell
$env:SITE_URL = 'https://domain-kamu.com'
npm run build
npm run preview
```

`astro.config.mjs` memvalidasi origin. `Base.astro` membuat canonical dan metadata halaman; endpoint `sitemap.xml.ts` serta `robots.txt.ts` membuat berkas pendukungnya. Tanpa `SITE_URL`, canonical absolut dihilangkan dan sitemap kosong. Ganti domain lalu lakukan build/deploy ulang ketika domain produksi berubah.

Kalau hanya ingin kembali ke development lokal tanpa override domain pada terminal itu, hentikan preview lalu hapus environment variable dengan `Remove-Item Env:SITE_URL`.

Progres belajar disimpan per origin browser. Progres pada localhost tidak otomatis muncul di domain produksi; gunakan ekspor/impor pada halaman Roadmap bila ingin memindahkannya.

## Jika hasil production berbeda dari development

1. Pastikan yang dibuka adalah URL server yang benar, bukan proses preview lama.
2. Jalankan `npm run build` untuk memperbarui HTML dan aset publik.
3. Periksa domain pada `SITE_URL` dan konfigurasi hosting.
4. Buka URL materi langsung lalu reload untuk memeriksa directory index dan 404.
5. Periksa Console/Network browser untuk asset yang gagal dimuat.

Source yang dimasukkan ke Git adalah komponen, materi, script, konfigurasi, dan aset sumbernya. `dist/` dibuat saat deployment; perubahan langsung pada folder hasil build tidak bertahan pada build berikutnya.
