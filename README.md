# Git Guides

Website belajar Git berbahasa Indonesia melalui proyek Kopi Kita, diagram, kuis, simulator, dan latihan terminal.

## Menjalankan proyek

Gunakan Node.js 22.12+ dan Git; pengembangan diverifikasi dengan Node.js 24.

```powershell
npm ci
npm run dev
```

Buka URL yang dicetak Astro. Halaman /persiapan/ menjelaskan instalasi Git dan repository pertama.

## Struktur Astro

Materi berada di src/content/lessons sebagai JSON dengan schema pada src/content.config.ts. Route dibuat oleh src/pages/[...path].astro, isi HTML oleh src/renderers, dan kerangka bersama oleh src/layouts/Base.astro. Interaksi browser ada di src/scripts; simulator dimuat terpisah.

CSS dan font sumber berada di assets/. Script prepare-assets menyalin aset saat development/build dimulai. Setelah mengedit CSS, jalankan node scripts/prepare-assets.mjs dan reload browser. Source index.html serta server/build khusus versi sebelumnya sudah digantikan oleh Astro.

## Verifikasi dan hasil build

```powershell
npm run check
npm test
npm run build
npm run preview
```

Tes memeriksa Git sungguhan, development, hasil build, serta validasi progres. Tes build memakai origin example.test; buat build lagi dengan SITE_URL domain produksi sebelum deployment. Hasil statis berada di dist/.

vercel.json memakai preset Astro. Set SITE_URL ke origin HTTP(S) domain asli untuk canonical dan sitemap. Tanpa SITE_URL, build tidak mengarang domain. Progres dan bookmark disimpan per origin browser.
