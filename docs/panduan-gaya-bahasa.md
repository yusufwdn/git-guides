# Panduan gaya bahasa

[Kembali ke daftar panduan](README.md). Dokumen ini mengatur cara menulis teks yang dibaca pengunjung: materi di `src/content/lessons/`, katalog, halaman Persiapan, teks UI di `src/renderers/`, dan teks diagram. Tujuannya satu: teks harus terdengar seperti orang Indonesia yang menjelaskan Git ke temannya, bukan seperti terjemahan dokumen berbahasa Inggris.

## Keputusan dasar

| Aspek          | Keputusan                                                                             | Alasan                                                                                             |
| -------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Sapaan         | "kamu", nada semi-santai                                                              | Ramah untuk pemula, tetap pantas dibaca siapa saja. "lo/gue" terlalu sempit, "Anda" terlalu kaku.  |
| Istilah Git    | Tetap bahasa Inggris: commit, branch, staging area, working tree, merge, remote, dll. | Sama dengan output terminal dan percakapan developer sehari-hari. Terjemahan memaksa pembaca menerjemahkan balik. |
| Kata kerja Git | Bentuk Indonesia biasa: di-commit, di-add, di-push, meng-commit                       | Begini cara developer Indonesia mengucapkannya.                                                    |
| Judul materi   | Topik jelas, boleh ditambah konteks setelah titik dua                                 | Mudah dipindai di sidebar dan hasil pencarian. Karakter tulisan dibawa oleh summary dan skenario.  |

## Pilihan kata

Dasarnya bahasa Indonesia yang wajar dan tidak terlalu baku. Kata percakapan umum boleh dipakai jika membuat kalimat lebih luwes: `nggak`, `bikin`, `cuma`, `biar`, `lagi` (dalam arti sedang). Hindari slang yang sempit atau cepat basi.

Ganti kata yang terasa seperti terjemahan:

| Hindari                                  | Pakai                                             |
| ---------------------------------------- | ------------------------------------------------- |
| merekam snapshot                         | menyimpan snapshot, membuat commit                |
| keadaan (untuk kondisi repo)             | kondisi, isi, posisi; atau sebut langsung isinya  |
| mempunyai                                | punya                                             |
| memperkenalkan bug (introduce)           | bikin bug muncul, yang pertama kali membawa bug   |
| secara sengaja, dengan sadar             | hapus saja, atau jelaskan apa yang perlu dicek    |
| entri stash                              | simpanan stash                                    |
| tracked changes, perubahan tracked       | perubahan di file yang sudah dilacak              |
| Kenali X / Pahami X / Bedakan X (pembuka) | kalimat yang langsung menyebut manfaat atau masalahnya |

Istilah Inggris dijelaskan sekali saat pertama kali muncul di materi yang memperkenalkannya, misalnya "staging area, yang juga disebut index". Setelah itu pakai satu istilah secara konsisten.

## Struktur kalimat

- Satu kalimat, satu ide. Tapi sambungkan kalimat yang berhubungan dengan kata penghubung (`jadi`, `karena`, `lalu`, `kalau`, `sedangkan`) supaya terbaca sebagai penjelasan, bukan daftar fakta.
- Pakai kalimat aktif dan sebut pelakunya: "git add menyalin isi file ke staging area", bukan "isi file disalin ke staging area".
- Hindari pola slogan dua kalimat pendek ("Simpan sebentar. Lanjutkan nanti.") untuk judul dan summary. Di bahasa Indonesia gaya ini terasa seperti tagline iklan yang diterjemahkan.
- Jangan pakai em dash atau en dash. Pakai koma, titik dua, atau pecah jadi dua kalimat. Untuk arah atau perubahan nilai, tulis "dari 0 menjadi 10" di prosa, atau `->` bila memang perlu simbol.

## Fungsi tiap field materi

Setiap field punya tugas sendiri. Jangan menyalin isi satu field ke field lain, karena pembaca akan melihat kalimat yang sama berulang di satu halaman.

| Field                      | Isinya                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `title`                    | Topik materi, misalnya `Stash: simpan kerjaan yang belum selesai`.                             |
| `summary`                  | Satu atau dua kalimat: apa manfaatnya buat pembaca. Juga dipakai sebagai deskripsi metadata.   |
| `scenario`                 | Masalah konkret di proyek Kopi Kita, ditulis seperti cerita singkat.                           |
| `concept`                  | Cara kerjanya. Jelaskan apa yang dilakukan Git, bukan cuma sintaks command.                    |
| `analogy`                  | Perbandingan dengan kegiatan sehari-hari. Sebutkan juga di mana perbandingannya berhenti berlaku. |
| `steps[].title`            | Instruksi singkat yang bisa langsung dikerjakan: "Cek versi Git di komputermu".                |
| `steps[].explanation`      | Apa yang terjadi setelah command dijalankan dan apa yang perlu diperhatikan di output.          |
| `result`                   | Kondisi akhir repo setelah semua langkah selesai.                                              |
| `verification.explanation` | Apa yang harus terlihat di output command verifikasi, dan apa artinya.                         |
| `objectives`               | Dua sampai tiga poin kemampuan yang didapat pembaca. Diawali kata seperti Bisa, Tahu, Paham.   |
| `pitfall`                  | Kesalahan yang sering terjadi dan cara menghindarinya.                                         |
| `initialState`             | Kondisi repo sebelum langkah pertama, ditulis sebagai kalimat lengkap.                         |

## Contoh sebelum dan sesudah

Summary materi `kenalan-git`:

- Sebelum: "Kenali Git sebagai pencatat snapshot proyek, supaya perubahan bisa dipahami dan ditinjau kembali."
- Sesudah: "Git mencatat setiap versi proyekmu, jadi kamu selalu bisa melihat apa yang berubah, kapan, dan kenapa."

Konsep materi `stash`:

- Sebelum: "git stash push menyimpan perubahan tracked pada working tree dan index, lalu mengembalikannya ke keadaan HEAD."
- Sesudah: "git stash push mengambil perubahan yang belum di-commit, baik yang sudah di-add maupun belum, lalu menyimpannya di tempat terpisah. Setelah itu working tree kembali bersih, sama seperti commit terakhir (HEAD)."

Judul langkah:

- Sebelum: "Kenali Git yang terpasang"
- Sesudah: "Cek versi Git di komputermu"

## Format teks

- Command di dalam kalimat ditulis biasa, tanpa backtick. Fungsi `inline()` di `src/renderers/context.js` otomatis membungkus pola seperti `git diff --staged`, `HEAD`, atau `origin/main` dengan `<code>`. Pola di luar daftar itu tampil sebagai teks biasa.
- Utamakan karakter ASCII. Tanda kutip lurus dan `->` lebih aman dibanding karakter tipografi.
- Setelah mengubah materi, jalankan `npm run check` lalu baca halamannya di browser. Membaca langsung di halaman lebih cepat menangkap kalimat yang janggal daripada membaca JSON.
