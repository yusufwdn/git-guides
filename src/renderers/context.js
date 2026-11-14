import Sim from '../lib/simulator.js';
import Visuals from '../lib/visuals.js';
import Routes from '../lib/routes.js';
import { scenarioInfo } from '../lib/scenarios.js';
export default function createContext(data) {
  const { chapters, lessons, glossary, problems } = data;
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  // Membungkus command dan istilah Git di teks materi dengan <code>. Dipanggil dari renderer
  // materi untuk summary, skenario, konsep, langkah, pitfall, dan latihan.
  // Lookbehind mencegah salah tangkap: "git" setelah titik atau garis miring adalah bagian
  // path (.git, kopi-kita-server.git), bukan command. Flag dan nama file yang diawali tanda
  // baca juga butuh lookbehind, karena \b tidak cocok di antara spasi dan "-" atau ".".
  const inlineCode =
    /(?<![\w./-])git [a-z][a-z-]*(?: --[a-z-]+)?\b|\bHEAD(?:~\d)?\b|\borigin\/main\b|(?<![\w-])--(?:staged|index|soft|mixed|hard)\b|(?<![\w./-])\.git(?:ignore|attributes)\b/g;
  const inline = (value) => esc(value).replace(inlineCode, (match) => `<code>${match}</code>`);
  const href = (id) => '/belajar/' + id + '/';
  const cup = `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path
      d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M8 3v2m4-3v3m4-2v2"
    />
  </svg>`;
  const bookmarkIcon = `<svg
    viewBox="0 0 14 17"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    aria-hidden="true"
  >
    <path d="M2 1h10v14L7 12l-5 3V1Z" />
  </svg>`;
  // Tombol unduh paket latihan. data-astro-prefetch="false" mencegah ZIP ikut diunduh
  // diam-diam saat kursor lewat, karena prefetch diaktifkan untuk semua link (astro.config.mjs).
  const download = `<a
    class="button"
    href="${Routes.asset('downloads/kopi-kita-labs.zip')}"
    data-astro-prefetch="false"
    download
    >Unduh paket latihan <span aria-hidden="true">↓</span></a
  >`;

  return {
    data,
    Sim,
    Visuals,
    Routes,
    chapters,
    lessons,
    glossary,
    problems,
    esc,
    inline,
    href,
    cup,
    bookmarkIcon,
    download,
    scenarioInfo,
  };
}
