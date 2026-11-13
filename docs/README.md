# Panduan mengembangkan Git Guides

Mulai dari [Astro dari nol](astro-dari-nol.md) jika ini pertama kalinya kamu memakai Astro. Setelah berhasil menjalankan proyek dan mengganti satu teks, gunakan tabel di bawah untuk pekerjaan berikutnya.

Dokumentasi ini mengikuti implementasi Git Guides saat ini: Astro 7, TypeScript, materi JSON, template JavaScript, dan interaksi browser tanpa React. Sebagian HTML berada dalam fungsi di `src/renderers/`, sehingga struktur proyek ini punya beberapa langkah tambahan dibanding contoh Astro yang semua tampilannya ditulis langsung di komponen `.astro`.

## Mau mengubah apa?

| Kebutuhan                                     | File atau fungsi yang dicari                                                | Panduan                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Menjalankan proyek dan memahami `.astro`      | `package.json`, `src/layouts/Base.astro`                                    | [Astro dari nol](astro-dari-nol.md)                                                       |
| Teks utama, tombol, dan kartu beranda         | `src/renderers/catalog.js` → `home()`                                       | [Contoh edit beranda](panduan-edit-halaman.md#contoh-1-mengubah-judul-dan-tombol-beranda) |
| Logo, menu atas, sidebar, footer              | `src/layouts/Base.astro`, `src/renderers/common.js`                         | [Bagian bersama](panduan-edit-halaman.md#bagian-yang-dipakai-banyak-halaman)              |
| Warna, font, jarak, tampilan mobile           | `assets/styles.css`                                                         | [Mengubah tampilan](panduan-edit-halaman.md#contoh-3-mengubah-warna-dan-jarak)            |
| Isi satu pelajaran, contoh command, atau kuis | `src/content/lessons/<id>.json`                                             | [Edit materi dan kuis](panduan-konten-dan-latihan.md#mengedit-materi-yang-sudah-ada)      |
| Bentuk semua halaman materi                   | `src/renderers/lesson.js` → `lessonPage()`                                  | [Peta halaman](panduan-edit-halaman.md#peta-url-ke-file)                                  |
| Isi halaman Persiapan                         | `src/components/GettingStarted.astro`                                       | [Edit komponen Astro](panduan-edit-halaman.md#contoh-2-mengubah-halaman-persiapan)        |
| Nama bab, glosarium, daftar masalah           | `src/data/catalog.json`                                                     | [Katalog](panduan-konten-dan-latihan.md#bab-glosarium-dan-daftar-masalah)                 |
| Diagram dan tahap-tahapnya                    | `src/lib/visuals.js`, `src/renderers/visual.js`                             | [Diagram](panduan-konten-dan-latihan.md#mengubah-atau-menambah-diagram)                   |
| Simulator dan skenario browser                | `src/lib/scenarios.js`, `src/lib/simulator.js`, `src/scripts/playground.ts` | [Playground](panduan-konten-dan-latihan.md#menambah-skenario-playground)                  |
| Latihan Git dalam paket ZIP                   | `src/data/labs.json`, `labs/git-lab.cjs`                                    | [Latihan terminal](panduan-konten-dan-latihan.md#menambah-latihan-terminal)               |
| Pencarian atau progres belajar                | `src/lib/search-index.js`, `src/lib/progress.js`, `src/scripts/client.ts`   | [Interaksi browser](panduan-edit-halaman.md#mengubah-interaksi-browser)                   |
| Halaman baru dan URL-nya                      | `src/lib/routes.js`, `src/pages/[...path].astro`                            | [Contoh halaman baru](panduan-edit-halaman.md#contoh-4-menambah-halaman-tentang)          |
| Judul tab, deskripsi, canonical               | `src/lib/routes.js`, JSON materi, `src/layouts/Base.astro`                  | [Metadata](panduan-edit-halaman.md#judul-yang-terlihat-dan-judul-tab-browser)             |
| Pengujian, CI, domain, deployment             | `tests/`, `astro.config.mjs`, `vercel.json`                                 | [Verifikasi dan deploy](verifikasi-dan-deploy.md)                                         |

## Urutan belajar yang disarankan

1. Baca [Astro dari nol](astro-dari-nol.md), jalankan development server, lalu ubah satu teks beranda.
2. Coba [mengubah satu materi dan kuis](panduan-konten-dan-latihan.md#mengedit-materi-yang-sudah-ada).
3. Coba ubah warna atau jarak pada [panduan tampilan](panduan-edit-halaman.md#contoh-3-mengubah-warna-dan-jarak).
4. Ikuti [contoh halaman baru](panduan-edit-halaman.md#contoh-4-menambah-halaman-tentang) jika sudah memahami layout dan route.
5. Gunakan [pemeriksaan sebelum commit](verifikasi-dan-deploy.md#pemeriksaan-sebelum-commit) untuk memeriksa hasil.

Untuk menjalankan proyek dengan cepat, lihat juga [README utama](../README.md). Rencana dan cakupan pembelajaran berada di [PLAN.md](../PLAN.md).
