# Kurikulum dan urutan materi

[Kembali ke daftar panduan](README.md). Dokumen ini berisi aturan urutan materi dan catatan keputusan saat urutan itu diubah. Cakupan tiap bab ada di tabel kurikulum [PLAN.md](../PLAN.md#3-kurikulum-yang-diusulkan). Urutan materi yang berlaku selalu dibaca dari field `chapter` dan `order` di `src/content/lessons/*.json`.

## Aturan urutan

1. **Dikenalkan sebelum dipakai.** Command atau istilah yang muncul di langkah, verifikasi, konsep, atau skenario sebuah materi harus sudah diajarkan di materi sebelumnya, atau dikenalkan di materi itu sendiri beserta fungsinya. Contoh pelanggaran: materi bab 1 memakai `git diff --staged` sebelum staging area dijelaskan.
2. **Halaman Persiapan hanya menyiapkan lingkungan.** Isinya memasang Git dan membuka terminal. Pembuatan repository dan commit pertama diajarkan di materi bab 2, bukan dijalankan diam-diam di halaman Persiapan.
3. **Urutan mengikuti ketergantungan, bukan tema.** Materi yang membutuhkan branch, merge, atau remote ditempatkan setelah topik itu diajarkan, walaupun temanya terasa dekat dengan bab yang lebih awal.
4. **`prerequisites` menunjuk materi yang benar-benar dibutuhkan.** `scripts/check.mjs` menolak prasyarat yang berada di urutan yang lebih belakang.
5. **Satu bab berisi minimal tiga materi.** Batas ini dipilih supaya bab bisa dikelompokkan sesuai topik tanpa memaksa materi pindah ke posisi yang salah.

## Catatan keputusan: susunan ulang bab 1-8 (2026-11-13)

### Masalah

Audit urutan command menemukan materi awal memakai command yang baru diajarkan jauh setelahnya:

- Halaman Persiapan menjalankan `init`, `config`, `add`, `commit`, `log`, `show`, dan `diff` tanpa penjelasan, sebelum bab 1 dimulai. `add` dan `commit` baru diajarkan sepuluh materi kemudian.
- Bab 1 berisi konsep, tetapi langkahnya meminta praktik: `snapshot` memakai `git diff --staged` sebelum index dijelaskan, `git-terdistribusi` memakai `git branch` dan `git log` yang baru diajarkan di bab 4 dan 5.
- Beberapa materi diletakkan menurut tema: `autentikasi` (butuh remote) di bab 2, `diff-versi` (butuh branch dan merge base) di bab 4, `branch-tracking` (butuh fetch) di bab 5, dan `commit-atomik` (lanjutan langsung dari staging) di bab 8.

### Keputusan

Bab 1-8 disusun ulang. Bab 9-16 tetap di urutan 32-65.

| Bab | Judul baru                 | Materi                                                         |
| --- | -------------------------- | -------------------------------------------------------------- |
| 1   | Kenalan dengan Git         | kenalan-git, setup, terminal-folder, bantuan                   |
| 2   | Commit pertama             | mulai-repo, tiga-area, staging, snapshot                       |
| 3   | Rapi sebelum commit        | status-singkat, ignore, commit-atomik                          |
| 4   | Membaca riwayat            | riwayat, log-filter, revision                                  |
| 5   | Bekerja dengan branch      | branch, detached-head, kelola-branch                           |
| 6   | Merge tanpa panik          | diff-versi, merge, fast-forward, konflik, abort-merge          |
| 7   | Kenalan dengan remote      | git-terdistribusi, autentikasi, branch-tracking, fetch-pull    |
| 8   | Kirim dan kerja bareng tim | upstream, push, strategi-pull, review, fork-upstream, workflow |

Materi yang pindah bab:

| Materi                                | Bab lama | Bab baru |
| ------------------------------------- | -------- | -------- |
| `setup`, `terminal-folder`, `bantuan` | 2        | 1        |
| `tiga-area`, `snapshot`               | 1        | 2        |
| `mulai-repo`, `staging`               | 3        | 2        |
| `commit-atomik`                       | 8        | 3        |
| `diff-versi`                          | 4        | 6        |
| `git-terdistribusi`                   | 1        | 7        |
| `autentikasi`                         | 2        | 7        |
| `branch-tracking`                     | 5        | 7        |
| `upstream`, `push`, `strategi-pull`   | 7        | 8        |

Alternatif yang ditolak: mempertahankan bab 1 sebagai konsep murni tanpa praktik. Pilihan ini membuat konsep tiga area diajarkan dua kali dan pembaca membaca empat materi tanpa menyentuh terminal.

### Konsekuensi

- URL materi dan progres pembaca tidak berubah karena keduanya memakai `id`, bukan nomor bab.
- Checkpoint penutup bab dipindah ke materi terakhir bab yang baru. Bab 1 mendapat checkpoint baru tentang prioritas `config` lokal terhadap global. Checkpoint lama dari `workflow` dihapus karena topiknya (memecah commit per tujuan) sudah dibahas oleh `commit-atomik`, dan `workflow` sekarang memakai checkpoint lama dari `autentikasi` tentang push yang ditolak karena izin.
- Isi materi yang pindah harus disesuaikan dengan posisi barunya:
  - `setup` tidak lagi mengasumsikan repo dari halaman Persiapan, dan `bantuan` memakai contoh command yang sudah dikenal.
  - `mulai-repo` fokus ke `git init`. Bagian `git clone` pindah ke `git-terdistribusi`.
  - `tiga-area`, `staging`, dan `snapshot` membangun repo Kopi Kita secara berurutan.
  - `riwayat` tidak memakai `--graph --all` sebelum branch diajarkan. `revision` tidak membahas `HEAD^2` sebelum merge.
  - `status-singkat` dan materi lain yang verifikasinya memakai command dari bab lebih belakang diperiksa ulang.
