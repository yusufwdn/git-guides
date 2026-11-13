import Content from '../data/content.js';
function createRoutes(data) {
  const defaults = {
    title: 'Git Guides — Pahami alurnya. Kuasai Git-nya.',
    description:
      'Pahami Git lewat kasus sehari-hari, visualisasi interaktif, dan latihan terminal. Panduan berbahasa Indonesia dari snapshot pertama sampai cara kerja internal Git.',
  };
  const entries = new Map();

  function add(path, kind, title, description, id) {
    if (!/^\/(?:[a-z0-9-]+\/)*$/.test(path))
      throw new Error('Route harus memakai slug lokal yang aman');
    entries.set(path, { path, kind, id, title, description, status: 200 });
  }

  add('/', 'home', defaults.title, defaults.description);
  add(
    '/persiapan/',
    'preparation',
    'Siapkan Git dan repo pertamamu — Git Guides',
    'Instalasi Git di Windows, macOS, dan Linux, dasar terminal, serta repository Kopi Kita untuk mengikuti materi dari nol.',
  );
  add(
    '/roadmap/',
    'roadmap',
    'Peta belajar Git — Git Guides',
    `${data.chapters.length} bab dan ${data.lessons.length} materi Git, dari fondasi hingga internals. Pilih jalur belajar sesuai kebutuhanmu.`,
  );
  add(
    '/referensi/',
    'reference',
    'Referensi command Git — Git Guides',
    'Cari command Git berdasarkan nama dan masalah. Temukan kasus, dampak, langkah penggunaan, serta latihan terkait.',
  );
  add(
    '/glosarium/',
    'glossary',
    'Glosarium istilah Git — Git Guides',
    'Arti HEAD, index, branch, upstream, reflog, dan istilah Git lainnya dalam bahasa Indonesia yang mudah dipahami.',
  );
  add(
    '/masalah/',
    'problems',
    'Solusi masalah Git sehari-hari — Git Guides',
    'Temukan penjelasan untuk push ditolak, salah commit, konflik, detached HEAD, dan pekerjaan yang perlu dipulihkan.',
  );
  add(
    '/playground/',
    'playground',
    'Playground Git interaktif — Git Guides',
    'Coba staging, stash, dan konflik di simulator Git dalam browser. Pelajari efek command tanpa mengubah pekerjaan aslimu.',
  );
  add(
    '/latihan/',
    'labs',
    'Latihan terminal Git — Git Guides',
    `${Object.keys(data.labs).length} skenario Kopi Kita dengan Git sungguhan. Unduh generator lokal, ikuti petunjuk, dan periksa keadaan akhir latihan.`,
  );
  for (const chapter of data.chapters)
    add(
      `/bab/${chapter.id}/`,
      'chapter',
      `${chapter.title} — Git Guides`,
      chapter.description,
      String(chapter.id),
    );
  for (const lesson of data.lessons)
    add(
      `/belajar/${lesson.id}/`,
      'lesson',
      `${lesson.title} — Git Guides`,
      lesson.summary,
      lesson.id,
    );
  for (const [id, lab] of Object.entries(data.labs))
    add(`/latihan/${id}/`, 'lab', `${lab.title} — Latihan Git Guides`, lab.goal, id);

  function resolve(input = '/') {
    try {
      let value = String(input);
      if (value.startsWith('#/')) value = value.slice(1);
      if (!value.startsWith('/') || value.startsWith('//'))
        throw new Error('Only local route paths are accepted');
      const url = new URL(value, 'https://git-guides.invalid');
      let path = decodeURIComponent(url.pathname);
      if (path.includes('\\') || path.includes('\0') || path.includes('//'))
        throw new Error('Invalid path');
      path = path.replace(/\/index\.html$/, '/');
      if (path !== '/' && !path.endsWith('/')) path += '/';
      const record = entries.get(path);
      return record
        ? { ...record, search: url.search, hash: url.hash }
        : {
            path,
            kind: 'notFound',
            status: 404,
            title: 'Halaman tidak ditemukan — Git Guides',
            description:
              'Materi pada alamat ini tidak ditemukan. Pilih pelajaran melalui peta belajar Git Guides.',
            search: url.search,
            hash: url.hash,
          };
    } catch {
      return {
        path: '/404/',
        kind: 'notFound',
        status: 404,
        title: 'Halaman tidak ditemukan — Git Guides',
        description: 'Alamat halaman tidak valid. Kembali ke peta belajar Git Guides.',
        search: '',
        hash: '',
      };
    }
  }

  const api = {
    defaults,
    resolve,
    entries: () => [...entries.values()],
    href: (input) => {
      const page = resolve(input);
      return page.path + page.search + page.hash;
    },
    asset: (name) => '/assets/' + name.replace(/^\//, ''),
  };
  return api;
}

export default { ...createRoutes(Content), create: createRoutes };
