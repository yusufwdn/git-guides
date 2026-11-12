(function (root) {
  'use strict';

  const data =
    typeof module !== 'undefined' && module.exports
      ? require('./content.js')
      : root.GitGuidesContent;
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

  const browser = typeof document !== 'undefined';
  const script = browser ? document.currentScript?.src : null;
  const rootURL = browser
    ? new URL('../', script || new URL('assets/routes.js', location.href).href)
    : null;
  const fileMode = browser && location.protocol === 'file:';
  let onRoute = null;

  function href(input = '/') {
    const page = resolve(input);
    const route = page.path + page.search + page.hash;
    return fileMode ? new URL('index.html', rootURL).href + '#' + route : route;
  }

  function asset(name) {
    return browser
      ? new URL('assets/' + name.replace(/^\//, ''), rootURL).href
      : '/assets/' + name.replace(/^\//, '');
  }

  function current() {
    if (browser && location.hash.startsWith('#/')) return resolve(location.hash);
    if (fileMode)
      return resolve(
        (document.querySelector('#main')?.dataset.pagePath || '/') +
          location.search +
          location.hash,
      );
    return resolve(location.pathname + location.search + location.hash);
  }

  function rewriteLinks(scope = document) {
    for (const link of scope.querySelectorAll('a[href]')) {
      const value = link.getAttribute('href');
      if (
        value.startsWith('#/') ||
        (value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/assets/'))
      )
        link.setAttribute('href', href(value));
      if (value.startsWith('./assets/'))
        link.setAttribute('href', asset(value.slice('./assets/'.length)));
    }
  }

  function applyMetadata(page) {
    document.title = page.title;
    document.querySelector('meta[name="description"]').content = page.description;
    const origin = document.querySelector('meta[name="gitguides-site-url"]')?.content;
    const canonicalURL =
      page.status === 404
        ? null
        : origin
          ? new URL(page.path, origin).href
          : fileMode
            ? null
            : new URL(page.path, location.origin).href;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonicalURL) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.append(canonical);
      }
      canonical.href = canonicalURL;
    } else if (page.status === 404) {
      canonical?.remove();
      document.querySelector('meta[property="og:url"]')?.remove();
    }
    for (const [property, value] of Object.entries({
      'og:title': page.title,
      'og:description': page.description,
      'og:type': page.kind === 'lesson' ? 'article' : 'website',
      ...(canonicalURL ? { 'og:url': canonicalURL } : {}),
    })) {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.append(meta);
      }
      meta.content = value;
    }
    let robots = document.querySelector('meta[name="robots"]');
    if (page.status === 404) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.append(robots);
      }
      robots.content = 'noindex, follow';
    } else if (robots) robots.remove();
  }

  function notify(options = {}) {
    const page = current();
    if (!fileMode && (location.hash.startsWith('#/') || location.pathname !== page.path))
      window.history.replaceState(window.history.state, '', page.path + page.search + page.hash);
    onRoute?.(page, options);
    rewriteLinks();
  }

  function navigate(input, { replace = false } = {}) {
    if (fileMode) {
      location.href = href(input);
      return;
    }
    const page = resolve(input);
    const destination = page.path + page.search + page.hash;
    const before = location.pathname + location.search + location.hash;
    if (destination === before) return;
    window.history.replaceState(
      { ...window.history.state, gitGuidesScroll: window.scrollY },
      '',
      before,
    );
    window.history[replace ? 'replaceState' : 'pushState']({ gitGuidesScroll: 0 }, '', destination);
    notify({ focus: true });
  }

  function section(id) {
    const page = current();
    const destination = href(page.path + page.search + '#' + encodeURIComponent(id));
    window.history.replaceState(window.history.state, '', destination);
  }

  function start(handler) {
    onRoute = handler;
    rewriteLinks();
    for (const control of document.querySelectorAll('[data-prerender-disabled]')) {
      control.disabled = false;
      control.removeAttribute('data-prerender-disabled');
    }
    document.documentElement.classList.remove('no-js');
    window.addEventListener('popstate', (event) =>
      notify({ scrollY: event.state?.gitGuidesScroll ?? 0 }),
    );
    window.addEventListener('hashchange', () => {
      if (fileMode || location.hash.startsWith('#/')) notify();
    });
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (
        !link ||
        fileMode ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self') ||
        link.hasAttribute('data-scroll') ||
        link.classList.contains('skip-link')
      )
        return;
      const raw = link.getAttribute('href');
      if (raw.startsWith('#') && !raw.startsWith('#/')) return;
      const target = new URL(link.href, location.href);
      if (
        target.origin !== location.origin ||
        !['http:', 'https:'].includes(target.protocol) ||
        target.pathname.startsWith('/assets/')
      )
        return;
      event.preventDefault();
      navigate(target.pathname + target.search + target.hash);
    });
    notify();
  }

  const api = {
    defaults,
    resolve,
    href,
    asset,
    entries: () => [...entries.values()],
    current,
    rewriteLinks,
    applyMetadata,
    navigate,
    section,
    start,
  };
  root.GitGuidesRoutes = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
