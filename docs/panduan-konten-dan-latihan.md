# Mengubah materi, diagram, dan latihan

[Kembali ke daftar panduan](README.md). Gunakan panduan ini untuk mengubah isi pembelajaran. Untuk tata letak halaman, lihat [panduan edit halaman](panduan-edit-halaman.md).

## Mengedit materi yang sudah ada

Setiap materi punya satu file di `src/content/lessons/`. Contohnya, `/belajar/stash/` membaca [stash.json](../src/content/lessons/stash.json).

Buka file yang sesuai, ubah field yang diinginkan, simpan, lalu buka URL materinya pada development server. Perubahan isi materi dan indeks pencarian mengikuti content collection. Setelah perubahan besar, jalankan `npm run check`.

JSON memakai tanda kutip ganda, tidak menerima komentar, dan tidak menerima koma sesudah elemen terakhir. Jika contoh command memerlukan kutip ganda, tulis `\"` di dalam string JSON. Baris baru ditulis sebagai `\n`.

```json
{
  "command": "git stash push -m \"WIP diskon\"\ngit stash list"
}
```

Contoh di atas hanya memperlihatkan bentuk satu field. Pertahankan field lain dalam file materi yang sudah ada.

## Arti field materi

| Field                | Dipakai untuk                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | Identitas materi dan slug URL; harus sama dengan nama file tanpa `.json`.                                                        |
| `order`              | Urutan global materi; angka lebih kecil muncul lebih dahulu.                                                                     |
| `chapter`            | Nomor bab yang ada pada katalog.                                                                                                 |
| `title`, `summary`   | Judul serta pengantar; juga dipakai untuk metadata halaman. Gaya penulisan ada di [panduan gaya bahasa](panduan-gaya-bahasa.md). |
| `scenario`           | Masalah yang dihadapi pembaca pada proyek Kopi Kita.                                                                             |
| `concept`, `analogy` | Penjelasan teknis dan analogi pendamping.                                                                                        |
| `initialState`       | Kondisi repo yang harus tersedia sebelum contoh dicoba.                                                                          |
| `preparationURL`     | Tautan persiapan opsional; saat ini menuju `/persiapan/`.                                                                        |
| `prerequisites`      | Array ID materi yang perlu dipahami lebih dahulu.                                                                                |
| `objectives`         | Daftar tujuan belajar yang ditampilkan di panel persiapan.                                                                       |
| `steps`              | Array objek `title`, `command`, dan `explanation` untuk langkah praktik.                                                         |
| `result`             | Keadaan atau pemahaman yang diharapkan setelah mengikuti contoh.                                                                 |
| `verification`       | Objek `command` dan `explanation` untuk memeriksa hasil.                                                                         |
| `pitfall`            | Kesalahan yang perlu dikenali beserta konteksnya.                                                                                |
| `practice`           | Tantangan pembaca yang berkaitan dengan materi.                                                                                  |
| `lab`                | Opsional. ID latihan terminal dalam `src/data/labs.json`; kosongkan bila materi dipraktikkan langsung di repo pembaca.           |
| `commands`           | Daftar command terkait; dipakai pada breadcrumb, referensi, dan pencarian.                                                       |
| `visual`             | Jenis ilustrasi dasar; beberapa ID materi mendapat diagram khusus melalui `forLesson()`. Isi `none` untuk materi tanpa diagram.  |
| `quiz`               | Kuis dengan pertanyaan, opsi, indeks jawaban benar, dan penjelasan.                                                              |
| `checkpoint`         | Tantangan tambahan opsional, saat ini dipakai pada penutup setiap bab.                                                           |
| `sources`            | Array objek `title` dan `url` untuk sumber resmi.                                                                                |
| `level`, `minutes`   | Label tingkat dan perkiraan waktu baca/praktik.                                                                                  |

Schema berada di [content.config.ts](../src/content.config.ts). Hubungan antarmateri, keberadaan latihan, urutan command, dan beberapa kriteria kelengkapan tambahan diperiksa di [scripts/check.mjs](../scripts/check.mjs). Kalau pemeriksaan gagal dengan pesan Command dipakai sebelum diajarkan, pindahkan command itu ke materi yang lebih belakang, ganti dengan command yang sudah diajarkan, atau cantumkan di field `commands` materi tempat ia pertama kali dijelaskan.

### Contoh mengganti satu langkah

Dalam array `steps`, ubah objek yang sesuai:

```json
{
  "title": "Periksa simpanan sebelum dipakai",
  "command": "git stash list\ngit stash show -p \"stash@{0}\"",
  "explanation": "Pilih simpanan yang benar dan baca perubahannya sebelum mengembalikannya ke working tree."
}
```

Sesuaikan juga `initialState`, `result`, dan `verification` jika tindakan yang dilakukan berubah. Contoh yang membutuhkan repo berisi commit tidak dapat direproduksi hanya dari folder kosong; tunjukkan cara mendapatkan titik awal itu.

### Contoh mengganti kuis

`answer` memakai indeks mulai dari nol. Pada contoh ini jawaban benar adalah opsi ketiga:

```json
{
  "question": "Perintah mana yang mengembalikan perubahan sambil mempertahankan entri stash?",
  "options": ["git stash drop", "git stash pop", "git stash apply"],
  "answer": 2,
  "explanation": "Apply menerapkan perubahan tanpa menghapus entrinya. Periksa status dan isi file setelah penerapan."
}
```

Pakai bentuk objek yang sama untuk `checkpoint`. Pembaca tetap boleh menandai materi selesai secara mandiri; hasil kuis disimpan terpisah. Jika mengganti identitas materi, perhatikan bahwa progres dan bookmark menggunakan `id` lama sebagai key.

## Menambah materi

1. Salin file materi yang strukturnya paling dekat dengan topik baru.
2. Beri nama baru dengan huruf kecil, angka, dan tanda hubung, misalnya `topik-baru.json`; isi `id` menjadi `topik-baru`.
3. Pilih `chapter` yang benar dan `order` unik. Saat ini `order` adalah 0–65; untuk menyisipkan materi di tengah, sesuaikan urutan materi setelahnya supaya tetap jelas.
4. Ganti seluruh isi, command, kondisi awal, tujuan, dan sumber. Baca ulang field satu per satu agar tidak meninggalkan cerita dari materi yang disalin.
5. Isi `prerequisites` dengan ID yang benar-benar diperlukan dan berada lebih dahulu dalam urutan. Buat hubungan yang eksplisit sesuai konsepnya.
6. Pilih `lab` yang cocok dengan keterampilan yang diajarkan. Bila hanya memakai latihan fondasi pendamping, jelaskan perbedaannya; bila perlu, buat latihan khusus.
7. Pilih visual yang relevan atau tambahkan diagram khusus.
8. Pertahankan tantangan `checkpoint` pada penutup bab bila urutan akhir bab berubah.
9. Jalankan `npm run check`, `npm test`, dan QA browser yang relevan.

URL `/belajar/topik-baru/`, navigasi materi, daftar bab, referensi, pencarian, dan sitemap berasal dari data tersebut. Tidak perlu membuat satu file `.astro` lagi untuk tiap materi.

Saat jumlah materi berubah, perbarui angka inventaris route pada `tests/prerender.test.cjs`. Hitungan saat ini: 7 halaman tetap selain persiapan, 1 persiapan, 16 halaman bab, 66 materi, dan 25 latihan = 115 route. `404.html` dibuat terpisah. Penambahan satu materi menambah satu route.

Pemeriksaan kurikulum saat ini mengharapkan 16 bab, 60–80 materi, dan minimal tiga materi per bab. Aturan urutan dan prasyarat ada di [kurikulum](kurikulum.md). Jika target produk memang diperluas melewati batas itu, sesuaikan `scripts/check.mjs`, schema bab di `src/content.config.ts`, label pada UI, dan dokumentasi bersama perubahan cakupannya.

### Mengganti slug materi yang sudah ada

Mengganti nama file dan `id` mengubah URL serta identitas progres. Perbarui referensi dalam `prerequisites`, `labs.json` → `lesson`, katalog masalah, pemetaan diagram, tautan yang ditulis langsung dalam template, dan tes yang memakai ID tersebut. Tentukan juga pengalihan URL lama pada hosting jika materi sudah dipublikasikan.

Untuk perubahan judul biasa, cukup pertahankan `id` dan nama file.

## Bab, glosarium, dan daftar masalah

Ketiganya berada di [src/data/catalog.json](../src/data/catalog.json):

- `chapters`: objek dengan `id`, `title`, `description`, dan `group`.
- `glossary`: pasangan `[istilah, penjelasan]`.
- `problems`: pasangan `[kalimat masalah, idMateri]`.

Contoh entri glosarium:

```json
[
  "First parent",
  "Parent pertama suatu commit; dipakai untuk mengikuti jalur utama pada riwayat merge."
]
```

Contoh entri masalah:

```json
["Ingin mengambil satu perbaikan dari branch lain", "cherry-pick"]
```

Masukkan entri ke array yang sesuai. Pencarian mengambil glosarium dan daftar masalah dari katalog yang sama. ID materi pada daftar masalah harus benar-benar ada agar link dapat dibangun.

## Mengubah atau menambah diagram

Ada tiga bagian yang saling berhubungan:

1. **Model keadaan** di `src/lib/visuals.js`: judul skenario dan data setiap frame.
2. **HTML diagram** di `src/renderers/visual.js`: fungsi `visual()`, `flow()`, dan `conflict()`.
3. **Kontrol browser** di `src/scripts/client.ts`: `showFrame()` dan handler tombol/panah.

Untuk mengganti penjelasan atau command pada diagram yang sudah ada, mulai dari model `scenarios` dalam `visuals.js`. `forLesson()` menentukan diagram khusus untuk ID materi; pemetaan ini didahulukan sebelum fallback `lesson.visual`.

Contoh bentuk model panel sederhana, ditempatkan pada definisi skenario di modul tersebut:

```js
Object.assign(scenarios, {
  'contoh-diagram': {
    title: 'Lihat keadaan sebelum dan sesudah.',
    description: 'Contoh panel untuk satu tujuan belajar.',
    frames: [
      {
        title: 'Sebelum tindakan',
        command: 'git status',
        explanation: 'Index dan HEAD belum memuat perubahan pada file kerja.',
        areas: [
          ['HEAD', 'Versi awal'],
          ['Index', 'Versi awal'],
          ['Working tree', 'Versi hasil edit'],
        ],
      },
      {
        title: 'Sesudah add',
        command: 'git add menu.json',
        explanation: 'Versi file pada saat add kini menjadi usulan snapshot dalam index.',
        areas: [
          ['HEAD', 'Versi awal'],
          ['Index', 'Versi hasil edit'],
          ['Working tree', 'Versi hasil edit'],
        ],
      },
    ],
  },
});
```

Hubungkan ID materi ke `'contoh-diagram'` dalam objek `specific` pada `forLesson()`. Jika diagram butuh grafik commit, gunakan `frame.graph`; untuk dua repo gunakan `frame.repos`. Lihat skenario `branch`, `rebase`, dan `remote` sebagai contoh struktur yang sudah dipakai.

Route utama menyiapkan HTML setiap frame untuk halaman materi itu. Browser memilih frame dan mengembalikan fokus ke kontrol yang sesuai. Jangan menghapus `data-flow-step` atau mengganti kontrak frame tanpa memperbarui renderer dan script browser bersama-sama.

Periksa frame awal/akhir, klik semua tahap, lalu ulangi memakai Tab, Enter, dan panah. Untuk diagram yang menyatakan hubungan commit, cocokkan dengan Git sungguhan seperti contoh pengujian di `tests/labs.test.cjs`.

## Menambah latihan terminal

Latihan terminal memakai Git asli dan menghasilkan folder baru. Perubahannya perlu disepakati pada beberapa file:

| File                                                | Yang ditambahkan                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `src/data/labs.json`                                | Judul, materi terkait, tujuan, petunjuk, solusi, dan penjelasan. |
| `labs/git-lab.cjs` → `definitions`                  | ID serta nama dan tujuan skenario CLI.                           |
| `labs/git-lab.cjs` → `start()`                      | Repo/file/branch/commit awal dan metadata yang perlu disimpan.   |
| `labs/git-lab.cjs` → `check()`                      | Keadaan akhir yang membuktikan tujuan tercapai.                  |
| `tests/labs.test.cjs` → `solutions`                 | Solusi otomatis dengan Git sungguhan.                            |
| JSON materi → `lab`, `initialState`, `verification` | Hubungan pelajaran dengan skenario yang baru.                    |
| `labs/README.md`                                    | Cara mulai atau prasyarat tambahan jika diperlukan.              |

Gunakan ID yang sama di seluruh katalog dan generator. Checker sebaiknya memeriksa isi snapshot, index, working tree, refs, parent, atau keadaan lain yang relevan. Membaca satu pesan sukses saja belum membuktikan hasil benar. Pertahankan pembuatan folder unik serta konfigurasi lokal pada repo latihan.

Untuk mencoba satu skenario dari root proyek:

```powershell
node labs/git-lab.cjs start submodule
```

Ikuti command `cd` dan `check` yang dicetak. Untuk menjalankan tes latihan:

```powershell
node --test tests/labs.test.cjs
```

Jalankan `npm run build` setelah source atau petunjuk paket berubah. Script build membuat ulang `assets/downloads/kopi-kita-labs.zip`, lalu menyalinnya ke aset publik. ZIP ini dilacak Git, sehingga pembaruannya ikut commit latihan. Menambah satu ID latihan juga menambah satu route `/latihan/<id>/`; perbarui inventaris route dan dokumentasi cakupan.

## Menambah skenario playground

Playground adalah simulator terbatas dengan data buatan; latihan ZIP menjalankan Git asli. Pilih bagian yang sesuai dengan perubahanmu.

Untuk skenario browser baru:

1. Tambahkan deskripsi, `suggestions`, dan `isComplete(state)` pada `src/lib/scenarios.js`.
2. Tambahkan keadaan awal pada `createState()` di `src/lib/simulator.js` jika berbeda dari skenario yang sudah ada.
3. Tambahkan `<option>` pada `playgroundPage()` di `src/renderers/catalog.js`.
4. Tinjau `src/scripts/playground.ts`. Beberapa pemeriksaan observasi stash dan kontrol resolusi konflik memang khusus untuk skenario yang ada.
5. Tambahkan ID ke daftar skenario yang diterima `readProgress()` di `src/lib/progress.js`, agar hasilnya tetap dikenali setelah reload atau impor.
6. Tambahkan pengujian skenario di `tests/browser/learning.spec.ts`; jika perilaku command mesin berubah, tambahkan verifikasi bermakna di `tests/simulator.test.cjs`.
7. Perbarui daftar command dan batas simulasi pada template playground jika kemampuan engine berubah.

`isComplete` harus menilai keadaan repo yang diminta. Definisikan pemeriksaan yang juga menolak hasil keliru, misalnya file yang salah ikut commit. Jika menambah command ke `execute()`, cocokkan perilakunya dengan Git sungguhan sebelum menyajikannya sebagai pelajaran.
