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
  const inline = (value) =>
    esc(value).replace(
      /\b(git [a-z][a-z-]*(?: --[a-z-]+)?|HEAD(?:~\d)?|origin\/main|--staged|--index|--soft|--mixed|--hard|\.gitignore|\.gitattributes)\b/g,
      '<code>$1</code>',
    );
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
  const download = `<a
    class="button"
    href="${Routes.asset('downloads/kopi-kita-labs.zip')}"
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
