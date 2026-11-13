# Mengubah halaman dan bagian tampilan

[Kembali ke daftar panduan](README.md). Jika masih bingung membedakan layout, komponen, dan renderer, baca [Astro dari nol](astro-dari-nol.md) dahulu.

## Peta URL ke file

| URL atau bagian                    | Isi yang terlihat                                                        | File/fungsi                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `/`                                | Hero, tombol mulai, kartu jalur belajar, demo stash, ringkasan progres   | `src/renderers/catalog.js` → `home()`                                                       |
| `/persiapan/`                      | Instalasi dan repo pertama                                               | `src/components/GettingStarted.astro`                                                       |
| `/roadmap/`, `/bab/9/`             | Daftar bab, materi, impor/ekspor progres                                 | `src/renderers/catalog.js` → `roadmap()`; kartu bab di `common.js` → `chapterCard()`        |
| `/belajar/stash/`                  | Isi khusus pelajaran stash                                               | `src/content/lessons/stash.json`                                                            |
| Semua `/belajar/<id>/`             | Tata letak judul, kasus, konsep, langkah, navigasi sebelumnya/berikutnya | `src/renderers/lesson.js` → `lessonPage()`                                                  |
| `/referensi/`                      | Referensi command dan kartu hasil filter                                 | `src/renderers/catalog.js` → `reference()`, `referenceCards()`                              |
| `/glosarium/`                      | Daftar istilah                                                           | Data `src/data/catalog.json`; tampilan `catalog.js` → `glossaryPage()`, `glossaryEntries()` |
| `/masalah/`                        | Kartu masalah sehari-hari                                                | Data `src/data/catalog.json`; tampilan `catalog.js` → `problemsPage()`                      |
| `/latihan/`, `/latihan/submodule/` | Katalog dan petunjuk satu latihan                                        | Data `src/data/labs.json`; tampilan `catalog.js` → `labsPage()`                             |
| `/playground/`                     | Struktur terminal dan panel skenario                                     | `src/renderers/catalog.js` → `playgroundPage()`                                             |
| Halaman 404                        | Pesan halaman tidak ditemukan                                            | `src/pages/404.astro`; isi di `catalog.js` → `notFound()`                                   |
| Semua halaman                      | Header, logo, footer, dialog pencarian, kerangka sidebar                 | `src/layouts/Base.astro`                                                                    |
| Semua halaman                      | Warna, font, lebar, jarak, tampilan mobile                               | `assets/styles.css`                                                                         |

Nama `catalog.js` di folder renderer berarti kumpulan template halaman. File data bernama `src/data/catalog.json` menyimpan bab, glosarium, dan masalah. Keduanya punya tugas berbeda.

## Contoh 1: mengubah judul dan tombol beranda

Buka [catalog.js](../src/renderers/catalog.js), cari `function home(`, lalu bagian berikut:

```html
<h1 class="page-title">Lebih dari sekadar<br /><em>push dan pull.</em></h1>
```

Contoh penggantinya:

```html
<h1 class="page-title">Pahami perubahan.<br /><em>Percaya diri pakai Git.</em></h1>
```

Potongan HTML tersebut berada di dalam template string JavaScript yang dibuka dan ditutup dengan backtick. Pertahankan batas template string, `${...}`, dan fungsi di sekitarnya.

Untuk mengganti tombol utama, cari `.home-actions` pada fungsi yang sama. Teks tombol dapat diganti langsung. URL seperti `href="${href('kenalan-git')}"` memakai helper yang menghasilkan `/belajar/kenalan-git/`. Jika ingin tombol menuju persiapan, ganti nilainya menjadi `href="/persiapan/"`.

Simpan lalu periksa beranda pada development server. Perubahan ini hanya mengubah judul yang terlihat di halaman. Judul tab browser dibahas berikutnya.

## Judul yang terlihat dan judul tab browser

| Yang diubah                                                   | Sumber                                                           |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| H1 beranda                                                    | `home()` di `src/renderers/catalog.js`                           |
| Judul tab dan deskripsi beranda                               | `defaults.title`, `defaults.description` di `src/lib/routes.js`  |
| H1 materi biasa                                               | `title` dalam JSON materi                                        |
| H1 materi stash                                               | Teks khusus pada `lessonPage()` di `src/renderers/lesson.js`     |
| Judul tab materi                                              | `title` JSON materi, ditambah akhiran Git Guides oleh route      |
| Deskripsi metadata materi                                     | `summary` JSON materi                                            |
| Metadata halaman Persiapan, Roadmap, dan halaman katalog lain | Pemanggilan `add(...)` untuk URL tersebut di `src/lib/routes.js` |
| Struktur tag `<title>`, description, Open Graph, canonical    | `src/layouts/Base.astro`                                         |

Stash memiliki H1 khusus agar bagian “Lanjutkan nanti” dapat diberi aksen. Jika mengganti judul stash, perbarui juga cabang `lesson.id === 'stash'` di `lessonPage()` agar tampilan dan metadata tetap sejalan.

## Contoh 2: mengubah halaman Persiapan

Buka [GettingStarted.astro](../src/components/GettingStarted.astro). Isi di bawah penutup frontmatter `---` adalah template HTML. Cari judul atau paragraf yang ingin diganti, lalu edit seperti HTML biasa.

Komponen ini mempunyai bagian ber-ID `instalasi`, `folder`, `identitas`, `commit-pertama`, `tiga-versi`, dan `latihan-terminal`. Pertahankan ID itu jika tautan atau pengujian masih memakainya.

Kotak command dibuat dengan helper:

```astro
<Fragment set:html={command('git status\ngit log --oneline')} />
```

`\n` di dalam string berarti baris baru. `command()` menambahkan markup dan tombol Salin. Untuk mengubah isi satu kotak cukup ganti string-nya. Helper kotak command bersama berada di `src/renderers/common.js` → `commandBlock()`.

## Bagian yang dipakai banyak halaman

### Header, logo, menu, dan footer

Edit HTML pada [Base.astro](../src/layouts/Base.astro). Cari `topbar`, `brand`, `topnav`, atau `site-footer` sesuai bagian yang diinginkan.

Tautan menu memakai `data-nav` untuk penanda aktif. Pemetaan jenis halaman ke menu aktif ada di `src/scripts/client.ts`, pada variabel `section`. Jika menambahkan kelompok menu, sesuaikan keduanya.

### Sidebar dan nama bab

- Nama bab, deskripsi, serta kelompoknya berada di `src/data/catalog.json` → `chapters`.
- Daftar tautan bab disusun oleh `src/renderers/common.js` → `sidebar()`.
- Judul “PETA PERJALANAN”, label jumlah bab, dan tempat progres berada di `Base.astro`.
- Persentase serta penanda selesai diperbarui oleh `updateProgress()` di `src/scripts/client.ts`.

Mengganti nama satu bab tidak perlu mengubah fungsi sidebar. Jika menambah atau menghapus bab, periksa juga batas schema, label jumlah bab, dan pemeriksaan kurikulum yang dijelaskan pada [panduan konten](panduan-konten-dan-latihan.md#bab-glosarium-dan-daftar-masalah).

### Bagian halaman materi

Edit `lessonPage()` di `src/renderers/lesson.js` untuk mengubah urutan bagian atau tampilan semua pelajaran. Bagian yang dipakai berulang disusun di `src/renderers/common.js`:

Pengantar proyek contoh Kopi Kita muncul khusus di materi `kenalan-git`, sebelum kasus pertama, pada bagian ber-ID `proyek-latihan` di `lessonPage()`. Penjelasan singkat bagi pembaca yang langsung membuka halaman persiapan ada di `GettingStarted.astro`. Jika mengubah nama atau konteks proyek latihan, perbarui kedua pengantar dan contoh file yang terkait.

| Fungsi                       | Yang ditampilkan                              |
| ---------------------------- | --------------------------------------------- |
| `preparation()`              | Kondisi awal, tujuan, dan prasyarat.          |
| `verification()`             | Command dan penjelasan pemeriksaan hasil.     |
| `terminalLab()`              | Latihan pendamping, petunjuk, dan pembahasan. |
| `quizHTML()`, `renderQuiz()` | Kuis materi dan tantangan penutup bab.        |
| `sources()`                  | Tautan sumber resmi dan glosarium.            |
| `commandBlock()`             | Kotak command dan tombol Salin.               |

Mengganti teks khusus satu materi dilakukan dalam JSON materi; mengubah struktur di sini berdampak pada semua materi yang memakai fungsi tersebut.

## Contoh 3: mengubah warna dan jarak

Buka [assets/styles.css](../assets/styles.css). Variabel tema terang ada pada `:root`, sedangkan tema gelap memakai selector `[data-theme='dark']`. File ini memiliki beberapa aturan lanjutan untuk tema gelap; bila sebuah warna belum berubah, cari semua aturan yang mengatur variabel atau selector itu dan periksa aturan yang muncul paling akhir.

Contoh variabel yang relevan:

```css
:root {
  --accent: #ff6200;
  --paper: #faf8f5;
  --ink: #302b28;
}
```

Potongan di atas menunjukkan nama variabel. Edit blok yang sudah ada pada source sesuai kebutuhan. `--accent` memengaruhi banyak elemen; warna tombol juga menggunakan `--primary`, teks aksen memakai `--primary-ink`, dan beberapa komponen mempunyai aturan sendiri.

Untuk mengubah jarak pada satu bagian, cari nama class markup-nya. Contoh: cari `home-hero` untuk area utama beranda atau `lesson-section` untuk bagian bacaan.

**Sesudah mengedit CSS**, lakukan salah satu:

```powershell
node scripts/prepare-assets.mjs
```

Lalu reload browser; atau hentikan dan jalankan lagi `npm run dev`. Source CSS disalin ke `public/assets/` oleh script persiapan. Mengedit source CSS saat server sudah berjalan belum otomatis memperbarui salinannya.

Periksa tema terang dan gelap, serta layar kecil. Preview hasil build memerlukan `npm run build` ulang.

## Contoh 4: menambah halaman Tentang

Contoh ini adalah langkah yang bisa kamu terapkan nanti. Halaman `/tentang/` belum ditambahkan oleh dokumentasi ini. Polanya mengikuti halaman Persiapan: daftar route → komponen isi → pemilihan komponen pada route utama.

### 1. Daftarkan URL dan metadata

Di dalam `createRoutes()` pada [routes.js](../src/lib/routes.js), setelah pemanggilan `add()` untuk halaman tetap lainnya, tambahkan:

```js
add(
  '/tentang/',
  'about',
  'Tentang Git Guides — Git Guides',
  'Kenali tujuan dan cara menggunakan panduan belajar Git ini.',
);
```

`about` adalah penanda jenis halaman. Route proyek menggunakan path huruf kecil, angka, tanda hubung, dan trailing slash.

### 2. Buat komponen isi

Buat `src/components/About.astro`:

```astro
<article class="page-container">
  <div class="eyebrow">KENALI PANDUANNYA</div>
  <h1 class="page-title">Tentang Git Guides</h1>
  <p class="page-intro">Panduan belajar Git lewat kasus proyek Kopi Kita.</p>
  <a class="button" href="/roadmap/">Buka peta belajar →</a>
</article>
```

### 3. Hubungkan ke route utama

Buka `src/pages/[...path].astro`. Tambahkan import di frontmatter:

```astro
import About from '../components/About.astro';
```

Ganti penentuan `markup` dengan:

```js
const isCustomPage = ['preparation', 'about'].includes(page.kind);
const markup = isCustomPage ? '' : renderer.render(page);
```

Pada isi `<Base ...>` di bagian bawah file, gunakan pemilihan komponen berikut. Pertahankan atribut `page`, `sidebar`, dan `payload` pada `<Base>` yang sudah ada.

```astro
{
  page.kind === 'preparation' ? (
    <GettingStarted />
  ) : page.kind === 'about' ? (
    <About />
  ) : (
    <Fragment set:html={markup} />
  )
}
```

Route sudah masuk daftar `getStaticPaths()`, metadata, dan sitemap karena didaftarkan melalui `Routes.create()`. Beri tautan menuju `/tentang/` di footer atau menu jika ingin pengunjung menemukannya. Jika menambah menu tersendiri, sesuaikan penanda aktif di `client.ts`.

### 4. Periksa perubahan

Jumlah route bertambah satu. Perbarui angka inventaris route pada `tests/prerender.test.cjs` dari nilai saat ini menjadi jumlah baru; jangan menghapus pemeriksaan link atau metadata. Perbarui juga angka di README jika masih dicantumkan.

Jalankan `npm run check`, `npm test`, dan pemeriksaan browser yang sesuai. Buka `/tentang/` secara langsung lalu reload untuk memastikan halaman tidak hanya bisa dibuka dari tautan internal.

## Mengubah interaksi browser

| Perilaku                                                      | Source utama                                    |
| ------------------------------------------------------------- | ----------------------------------------------- |
| Klik bookmark, tandai selesai, tema, menu mobile, Salin, kuis | `src/scripts/client.ts`                         |
| Validasi data progres, ekspor, impor, dan kompatibilitas data | `src/lib/progress.js`                           |
| Isi indeks pencarian                                          | `src/lib/search-index.js`                       |
| Endpoint indeks pencarian                                     | `src/pages/search-index.json.ts`                |
| Urutan relevansi, potongan hasil, dialog pencarian            | Fungsi `search()` dalam `src/scripts/client.ts` |
| Pemilihan tahap diagram dan pemulihan fokus                   | `showFrame()` dalam `src/scripts/client.ts`     |
| Input terminal dan panel simulator                            | `src/scripts/playground.ts`                     |

Markup dan script terhubung melalui atribut seperti `id="bookmark"`, `id="quiz-form"`, `data-flow-step`, dan `data-sim-step`. Jika mengganti nama atribut itu, ubah selector dalam script dan pengujiannya pada perubahan yang sama. Mengganti class dekoratif biasanya hanya memerlukan pasangan markup dan CSS.

Progres memakai key berawalan `gitguides:` di localStorage. Jika mengubah format data, tambahkan validasi serta migrasinya pada `progress.js`, lalu periksa tes impor dan kompatibilitas. Memilih ulang tanda selesai berbeda dari menghapus seluruh data browser.

## Pemeriksaan setelah mengedit

Untuk perubahan teks atau CSS, mulai dengan halaman yang terdampak dan `npm run check`. Untuk perubahan struktur, route, script, atau simulator, ikuti [panduan verifikasi](verifikasi-dan-deploy.md). Semua contoh HTML harus tetap mempunyai satu H1, URL yang valid, dan kontrol yang dapat digunakan melalui keyboard.
