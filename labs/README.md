# Kopi Kita — latihan Git sungguhan

Paket ini memerlukan Git 2.34+ dan Node.js 22+. Tidak ada `npm install`, akun layanan hosting, atau koneksi internet yang diperlukan.

1. Ekstrak ZIP ke folder milikmu dan buka terminal di folder hasil ekstraksi.
2. Jalankan `node git-lab.cjs list` untuk melihat skenario.
3. Mulai dengan `node git-lab.cjs start staging` (ganti `staging` dengan nama skenario).
4. Gunakan perintah `cd` yang dicetak untuk masuk ke repo latihan.
5. Baca tujuan di website, jalankan command Git, dan edit file dengan editor.
6. Jalankan perintah `check` yang dicetak untuk menilai keadaan akhir.

Setiap `start` membuat folder baru bernama unik di `git-labs/`. Ia tidak mereset atau menghapus latihan sebelumnya. Identitas commit dan konfigurasi yang diperlukan diatur secara lokal pada repo latihan. Nama serta email yang dipakai adalah contoh.

Perintah Git pada materi bekerja pada lokasi terminal saat itu. Sebelum reset, restore, clean, atau penulisan ulang riwayat, periksa bahwa kamu sedang berada pada repo latihan yang benar. Skenario `reset-hard` memang membuang perubahan contoh dalam repo latihan tersebut.

Untuk latihan remote, generator membuat server bare lokal, clone `rani`, dan repo `kopi-kita`. Tidak ada push ke internet. Untuk memulai ulang latihan, jalankan `start` lagi; simpan folder lama bila masih ingin memeriksanya.

Checker menilai keadaan akhir file, index, branch, commit, atau stash. Ia tidak merekam semua tindakanmu: misalnya, keadaan bersih setelah `merge --abort` bisa sama dengan keadaan sebelum kamu memulai merge. Tetap jalankan langkah observasi dan jelaskan hasilnya dengan kata-katamu sendiri.

Hash dan timestamp akan berbeda pada setiap latihan. Gunakan log, branch, dan reflog untuk menemukan commit; jangan menyalin hash ilustrasi dari gambar.
