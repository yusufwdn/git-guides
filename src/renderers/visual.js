export default (context) => {
  const { data, Sim, Visuals, esc, fileChip, graphSVG, graphHTML } = context;
  // Isi diagram tiga kotak untuk materi bab 1-4. Materi ini belum mengenal branch dan
  // merge, jadi diagramnya statis dan riwayatnya lurus. Setiap kotak:
  // [judul, baris keterangan, label kecil]. Dibaca oleh staticBoxes().
  const introBoxes = {
    versions: [
      ['Tanpa Git', ['menu-lama.json', 'menu-baru.json', 'menu-final.json'], 'SALINAN MANUAL'],
      ['Dengan Git', ['Satu menu.json', 'plus riwayat commit'], 'SATU FILE'],
      ['Riwayat', ['Siapa, kapan,', 'dan kenapa berubah'], 'BISA DITELUSURI'],
    ],
    config: [
      ['Global', ['Berlaku untuk semua', 'repo di akunmu'], 'SEKALI ATUR'],
      ['Lokal', ['Berlaku untuk satu repo,', 'menang kalau bentrok'], 'PENGECUALIAN'],
      ['Commit', ['Nama dan email', 'tercatat di commit'], 'HASILNYA'],
    ],
    init: [
      ['Folder biasa', ['kopi-kita/', 'belum dikenali Git'], 'SEBELUM'],
      ['Repository', ['kopi-kita/', 'plus folder .git'], 'SESUDAH GIT INIT'],
      ['Siap mencatat', ['git status bisa', 'dipakai di sini'], 'BERIKUTNYA'],
    ],
    status: [
      ['Kolom kiri', ['staging area vs', 'commit terakhir'], 'SUDAH DI-ADD'],
      ['Kolom kanan', ['working tree vs', 'staging area'], 'BELUM DI-ADD'],
      ['Kode ??', ['file baru yang', 'belum dilacak'], 'UNTRACKED'],
    ],
    ignore: [
      ['File baru', ['tampil sebagai ??', 'di git status'], 'UNTRACKED'],
      ['Cocok .gitignore', ['disembunyikan dari', 'status dan add'], 'DIABAIKAN'],
      ['Sudah dilacak', ['tetap dilacak walau', 'ada di .gitignore'], 'PERLU RM --CACHED'],
    ],
    detached: [
      ['main', ['tetap menunjuk', 'commit terbaru'], 'BRANCH'],
      ['HEAD', ['langsung menunjuk', 'commit lama'], 'DETACHED'],
      ['git switch -c', ['memberi nama', 'pada posisi itu'], 'SUPAYA AMAN'],
    ],
    history: [
      ['HEAD~2', ['Abaikan catatan', 'pribadi'], 'LEBIH LAMA'],
      ['HEAD~1', ['Tambah es kopi', 'ke menu'], 'SEBELUMNYA'],
      ['HEAD', ['Batasi diskon', 'maksimal 50 persen'], 'COMMIT TERBARU'],
    ],
    clone: [
      ['kopi-kita', ['repo milikmu,', 'hasil git init'], 'ASAL'],
      ['Server', ['kopi-kita-server.git,', 'tanpa working tree'], 'BARE REPOSITORY'],
      ['kopi-kita-rani', ['clone lengkap', 'dengan riwayat'], 'LAPTOP RANI'],
    ],
    access: [
      ['Identitas', ['user.name dan', 'user.email'], 'TERCATAT DI COMMIT'],
      ['Autentikasi', ['token HTTPS atau', 'kunci SSH'], 'MEMBUKTIKAN SIAPA KAMU'],
      ['Izin', ['boleh baca atau', 'tulis ke repo'], 'DITENTUKAN SERVER'],
    ],
    tracking: [
      ['main', ['branch lokal,', 'maju saat commit'], 'MILIKMU'],
      ['origin/main', ['posisi main di server', 'saat terakhir dicek'], 'CATATAN LOKAL'],
      ['Server', ['main yang', 'sebenarnya'], 'BISA SUDAH BERUBAH'],
    ],
    push: [
      ['Laptop Rani', ['main ahead 1,', 'commit kue'], 'SEBELUM PUSH'],
      ['git push', ['kirim commit,', 'majukan main server'], 'HARUS FAST-FORWARD'],
      ['Server', ['main berisi', 'commit kue'], 'SESUDAH PUSH'],
    ],
    upstream: [
      ['Tanpa upstream', ['git status nggak', 'membandingkan'], 'HASIL GIT INIT'],
      ['--set-upstream-to', ['main mengikuti', 'origin/main'], 'SEKALI ATUR'],
      ['Dengan upstream', ['push dan pull', 'tahu tujuannya'], 'SEPERTI HASIL CLONE'],
    ],
    pull: [
      ['--ff-only', ['maju kalau cuma', 'tertinggal'], 'MENOLAK SAAT BERCABANG'],
      ['--no-rebase', ['membuat', 'merge commit'], 'RIWAYAT BERCABANG'],
      ['--rebase', ['menyalin commit lokal', 'ke atas server'], 'RIWAYAT LURUS, BAB 11'],
    ],
    review: [
      ['Branch fitur', ['commit di', 'menu-sarapan'], 'LOKAL'],
      ['git push -u', ['branch dan upstream', 'ada di server'], 'DIBAGIKAN'],
      ['Pull request', ['dibahas dan', 'disetujui tim'], 'LAYANAN HOSTING'],
    ],
    fork: [
      ['Repo asli', ['kopi-kita-server.git,', 'nggak bisa kamu tulis'], 'UPSTREAM'],
      ['Fork', ['salinan di akunmu,', 'bebas push'], 'ORIGIN'],
      ['Laptopmu', ['branch usulan,', 'lalu pull request'], 'KONTRIBUSI'],
    ],
    restore: [
      ['Commit terakhir', ['isi resmi', 'menu.json'], 'HEAD'],
      ['Staging area', ['restore --staged', 'mengembalikan ke HEAD'], 'NAMPAN'],
      ['Working tree', ['restore mengembalikan', 'ke staging area'], 'MEJA RACIK'],
    ],
    revert: [
      ['Commit salah', ['harga kue 20000,', 'sudah di-push'], 'TETAP DI RIWAYAT'],
      ['git revert', ['commit baru yang', 'membalik perubahan'], 'TAMBAH, BUKAN HAPUS'],
      ['Hasil', ['harga kue', 'kembali 18000'], 'AMAN UNTUK TIM'],
    ],
    clean: [
      ['Dilacak', ['nggak disentuh', 'git clean'], 'AMAN'],
      ['Untracked ??', ['dihapus', 'dengan -f'], 'TARGET CLEAN'],
      ['Diabaikan !!', ['aman kecuali', 'memakai -x'], 'DILINDUNGI .GITIGNORE'],
    ],
    amend: [
      ['--amend', ['ganti commit', 'terakhir'], 'SATU COMMIT'],
      ['rebase -i', ['pick, fixup, squash,', 'reword, atau hapus'], 'BEBERAPA COMMIT'],
      ['Hash baru', ['jangan untuk commit', 'yang sudah di-push'], 'HATI-HATI'],
    ],
    search: [
      ['git grep', ['cari teks di', 'versi sekarang'], 'DI MANA'],
      ['git blame', ['commit terakhir', 'per baris'], 'SIAPA DAN KAPAN'],
      ['git log -S / -G', ['commit yang', 'mengubah teks'], 'SEJAK KAPAN'],
    ],
    sparse: [
      ['Riwayat lengkap', ['semua folder', 'tetap tersimpan'], 'NGGAK BERUBAH'],
      ['set promo', ['working tree cuma', 'promo + file utama'], 'SPARSE CHECKOUT'],
      ['Partial clone', ['isi file diunduh', 'saat dibutuhkan'], 'BUTUH SERVER'],
    ],
    attributes: [
      ['Repo', ['file teks disimpan', 'dengan akhir baris LF'], 'SERAGAM'],
      ['* text=auto', ['Git mendeteksi', 'file teks sendiri'], '.GITATTRIBUTES'],
      ['Working tree', ['CRLF di Windows,', 'LF di macOS dan Linux'], 'SESUAI SISTEM'],
    ],
    secrets: [
      ['.env', ['token dan password', 'cuma di laptop'], 'DIABAIKAN'],
      ['.gitignore', ['mencegah file', 'ikut di-add'], 'PENCEGAHAN'],
      ['Terlanjur di-push', ['ganti token dulu,', 'lalu bersihkan riwayat'], 'ANGGAP BOCOR'],
    ],
    hooks: [
      ['git commit', ['memicu hook', 'pre-commit'], 'PERISTIWA'],
      ['pre-commit', ['script di', '.git/hooks'], 'PEMERIKSAAN'],
      ['Exit code', ['0 lanjut,', 'selain 0 batal'], 'KEPUTUSAN'],
    ],
    alias: [
      ['git lg', ['yang kamu', 'ketik'], 'ALIAS'],
      ['alias.lg', ['tersimpan di', 'config repo'], 'PENGATURAN'],
      ['Command asli', ['log --oneline', '--graph --all'], 'YANG DIJALANKAN'],
    ],
    refs: [
      ['Branch', ['refs/heads/main'], 'LOKAL'],
      ['Refspec fetch', ['refs/heads/* di server', 'jadi refs/remotes/origin/*'], 'PEMETAAN'],
      ['Tag', ['refs/tags/v1.0.0', 'menunjuk object tag'], 'RILIS'],
    ],
    reach: [
      ['Terjangkau', ['bisa dicapai dari', 'branch atau tag'], 'AMAN'],
      ['Cuma di reflog', ['commit setelah reset,', 'masih bisa dipulihkan'], 'SEMENTARA'],
      ['Tak terjangkau', ['tanpa nama', 'dan tanpa jejak'], 'BISA DIBERSIHKAN GC'],
    ],
    maintenance: [
      ['count-objects', ['jumlah dan ukuran', 'object'], 'UKUR'],
      ['gc dan fsck', ['padatkan dan', 'periksa object'], 'RAWAT'],
      ['bundle', ['satu file berisi', 'seluruh riwayat'], 'CADANGKAN'],
    ],
    squash: [
      ['Merge commit', ['semua commit fitur', 'plus commit pertemuan'], 'RIWAYAT LENGKAP'],
      ['Squash', ['satu commit baru', 'berisi semua perubahan'], 'RIWAYAT RINGKAS'],
      ['Rebase', ['commit disalin', 'ke ujung main'], 'RIWAYAT LURUS, BAB 11'],
    ],
  };

  // Merender diagram statis tiga kotak bersambung panah. Dipanggil dari visual()
  // untuk setiap jenis visual yang terdaftar di introBoxes. Input: array kotak dari sana.
  function staticBoxes(boxes) {
    const html = boxes.map(
      ([title, lines, label]) =>
        /* HTML */ `<div class="snapshot-box">
          <strong>${title}</strong>
          <p>${lines.join('<br />')}</p>
          <div class="snapshot-label">${label}</div>
        </div>`,
    );
    return `<div class="snapshot-visual">${html.join('<div class="snapshot-arrow">→</div>')}</div>`;
  }

  function visual(lesson, miniStep = 0, miniMode = 'pop') {
    const kind = lesson.visual;
    const selected = Visuals.forLesson(lesson);
    if (selected) return flow(selected);
    if (kind === 'conflict') return conflict(lesson);
    if (kind === 'stash') {
      let state = Sim.createState('lesson');
      if (miniStep >= 1) state = Sim.execute(state, 'git stash push -m "WIP diskon"').state;
      if (miniStep >= 2) state = Sim.execute(state, `git stash ${miniMode}`).state;
      const dirty = Sim.changed(Sim.head(state).files, state.working).length > 0;
      const commands = ['git status', 'git stash push -m "WIP diskon"', `git stash ${miniMode}`];
      const captions = [
        'Perubahan diskon masih di working tree. Belum ada entri stash.',
        'Perubahan tracked tersimpan. Working tree dan index kembali ke HEAD.',
        miniMode === 'pop'
          ? 'Perubahan kembali. Karena penerapan berhasil, entri stash dihapus.'
          : 'Perubahan kembali. Dengan apply, entri stash tetap ada untuk dipakai lagi.',
      ];
      return /* HTML */ `<div class="visual-card">
          <div class="visual-header">
            <div>
              <h3>Satu pekerjaan, tiga keadaan.</h3>
              <p>Skenario tanpa konflik · satu file tracked yang berubah</p>
            </div>
            <span class="interactive-badge">INTERAKTIF</span>
          </div>
          <div class="sim-tabs" role="tablist" aria-label="Keadaan stash">
            ${['Kerjaan awal', 'Simpan dulu', 'Lanjutkan lagi']
              .map(
                (label, index) =>
                  /* HTML */ `<button
                    class="sim-tab ${miniStep === index ? 'active' : ''}"
                    data-sim-step="${index}"
                    role="tab"
                    aria-selected="${miniStep === index}"
                    aria-controls="stash-scene"
                    id="stash-tab-${index}"
                  >
                    <span>0${index + 1}</span>${label}
                  </button>`,
              )
              .join('')}
          </div>
          <div
            class="sim-scene"
            id="stash-scene"
            role="tabpanel"
            aria-labelledby="stash-tab-${miniStep}"
          >
            <div class="sim-columns">
              <div class="sim-zone">
                <div class="zone-heading"><span>Meja kerjamu</span><span>WORKING TREE</span></div>
                ${
                  dirty
                    ? fileChip('diskon.js', 'Diskon 0 → 10 persen', 'M')
                    : '<div class="empty-zone"><div class="empty-icon">✓</div>Tidak ada perubahan tracked.<br/>Sesuai snapshot HEAD.</div>'
                }
              </div>
              <div class="sim-arrow ${miniStep === 1 ? 'active' : ''}" aria-hidden="true">
                ${miniStep === 2 ? '←' : '→'}
              </div>
              <div class="sim-zone">
                <div class="zone-heading"><span>Laci sementara</span><span>STASH</span></div>
                ${
                  state.stashes.length
                    ? fileChip('WIP diskon', 'stash@{0} · fitur-diskon', '', true)
                    : '<div class="empty-zone"><div class="empty-icon">⊟</div>Belum ada simpanan.<br/>Lacinya masih kosong.</div>'
                }
              </div>
            </div>
            <div class="sim-bottom-info">
              <span class="branch-pill">⑂ fitur-diskon</span
              ><span>Commit HEAD tetap · ${state.stashes.length} entri stash</span>
            </div>
          </div>
          <div class="sim-terminal">
            <div class="terminal-command">
              <span class="prompt">$</span><code>${esc(commands[miniStep])}</code>
            </div>
            <button class="copy-button" data-copy="${esc(commands[miniStep])}">Salin ⧉</button>
          </div>
          <div class="sim-caption" aria-live="polite">
            <span class="caption-number">${miniStep + 1}</span><span>${captions[miniStep]}</span>
          </div>
        </div>
        <div class="sim-controls">
          <button class="text-button" data-sim-reset>↻ Ulangi dari awal</button>${
            miniStep === 2
              ? /* HTML */ `<button class="button secondary small" data-sim-mode>
                  Coba ${miniMode === 'pop' ? 'apply' : 'pop'} sebagai pembanding ↔
                </button>`
              : /* HTML */ `<button class="button small" data-sim-next>
                  ${miniStep === 0 ? 'Simpan pekerjaan' : 'Kembalikan pekerjaan'} <span>→</span>
                </button>`
          }
        </div>`;
    } else if (kind === 'staging') {
      const commands = ['git status', 'git add menu.json', 'git commit -m "Perbaiki harga menu"'];
      const notes = [
        'Dua file berubah di working tree. Index dan HEAD belum berubah.',
        'Hanya menu.json disalin ke index. Perubahan diskon.js masih unstaged.',
        'Snapshot baru memuat harga menu. Pekerjaan diskon.js belum ikut di-commit.',
      ];
      return /* HTML */ `<div class="visual-card">
          <div class="visual-header">
            <div>
              <h3>Commit berisi apa yang kamu pilih.</h3>
              <p>Klik tahap untuk melihat isi tiga area.</p>
            </div>
            <span class="interactive-badge">INTERAKTIF</span>
          </div>
          <div class="sim-tabs" role="group" aria-label="Tahap staging">
            ${['Edit file', 'Pilih menu', 'Rekam commit']
              .map(
                (label, index) =>
                  /* HTML */ `<button
                    class="sim-tab ${miniStep === index ? 'active' : ''}"
                    data-sim-step="${index}"
                    aria-pressed="${miniStep === index}"
                  >
                    <span>0${index + 1}</span>${label}
                  </button>`,
              )
              .join('')}
          </div>
          <div class="snapshot-visual" style="margin:0 16px 20px">
            <div class="snapshot-box">
              <strong>Working tree</strong>
              <p>menu: 20.000<br />diskon: 10%</p>
              <div class="snapshot-label">FILE YANG DIEDIT</div>
            </div>
            <div class="snapshot-arrow">→</div>
            <div class="snapshot-box">
              <strong>Index</strong>
              <p>menu: ${miniStep >= 1 ? '20.000' : '18.000'}<br />diskon: 0%</p>
              <div class="snapshot-label">CALON SNAPSHOT</div>
            </div>
            <div class="snapshot-arrow">→</div>
            <div class="snapshot-box">
              <strong>HEAD</strong>
              <p>menu: ${miniStep === 2 ? '20.000' : '18.000'}<br />diskon: 0%</p>
              <div class="snapshot-label">SUDAH DIREKAM</div>
            </div>
          </div>
          <div class="sim-terminal">
            <div class="terminal-command">
              <span class="prompt">$</span><code>${esc(commands[miniStep])}</code>
            </div>
            <button class="copy-button" data-copy="${esc(commands[miniStep])}">Salin ⧉</button>
          </div>
          <div class="sim-caption" aria-live="polite">
            <span class="caption-number">${miniStep + 1}</span><span>${notes[miniStep]}</span>
          </div>
        </div>
        <div class="sim-controls">
          <button class="text-button" data-sim-reset>↻ Ulangi dari awal</button
          ><button class="button small" data-sim-next ${miniStep === 2 ? 'disabled' : ''}>
            ${
              miniStep === 0
                ? 'Pilih perubahan'
                : miniStep === 1
                  ? 'Buat commit'
                  : 'Snapshot sudah dibuat'
            }
            →
          </button>
        </div>`;
    } else if (kind === 'conflict') {
      return /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Dua usulan. Satu keputusan akhir.</h3>
            <p>Contoh konflik isi; pilihan benar bergantung kesepakatan tim.</p>
          </div>
          <span class="interactive-badge">COBA SENDIRI</span>
        </div>
        <div style="padding:0 22px 20px">
          <div class="output-block" id="conflict-preview">
            <code
              >&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD<br />const harga = 20000;<br />=======<br />const
              harga = 22000;<br />&gt;&gt;&gt;&gt;&gt;&gt;&gt; fitur-menu</code
            >
          </div>
          <div class="sim-controls">
            <button class="button secondary small" data-conflict-choice="20000">
              Pilih Rp20.000</button
            ><button class="button secondary small" data-conflict-choice="22000">
              Pilih Rp22.000
            </button>
          </div>
          <p id="conflict-note" class="quiz-feedback" aria-live="polite">
            Baca maksud perubahan sebelum memilih hasil.
          </p>
        </div>
      </div>`;
    } else if (kind === 'remote') {
      return /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Ambil, pahami, lalu integrasikan.</h3>
            <p>Contoh main lokal tertinggal satu commit dari server.</p>
          </div>
        </div>
        <div class="snapshot-visual" style="margin:0 16px 20px">
          <div class="snapshot-box">
            <strong>Server</strong>
            <p>main → B</p>
            <div class="snapshot-label">REPO REMOTE</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-box">
            <strong>Catatan lokal</strong>
            <p>origin/main → B</p>
            <div class="snapshot-label">SETELAH FETCH</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-box">
            <strong>Branch lokal</strong>
            <p>main: A → B</p>
            <div class="snapshot-label">SETELAH INTEGRASI FF</div>
          </div>
        </div>
        <div class="sim-caption">
          Fetch memperbarui catatan remote. Integrasi memperbarui jalur kerja lokal. Push mengirim
          perubahan menuju remote.
        </div>
      </div>`;
    } else if (kind === 'graph') {
      return /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Commit menyambung lewat parent.</h3>
            <p>Contoh percabangan dan merge; garis dibaca dari riwayat lama ke baru.</p>
          </div>
        </div>
        <div class="repo-graph" style="border:0;background:transparent;margin:0">${graphSVG()}</div>
        <div class="sim-caption">
          Label branch menunjuk commit. Commit baru pada branch aktif menggeser labelnya; riwayat
          sebelumnya tetap terhubung.
        </div>
      </div>`;
    } else if (kind === 'objects') {
      return /* HTML */ `<div class="snapshot-visual">
        <div class="snapshot-box">
          <strong>Branch / HEAD</strong>
          <p>Referensi bernama<br />menunjuk commit</p>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Commit</strong>
          <p>Tree + parent<br />+ metadata</p>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Tree → blob</strong>
          <p>Susunan path<br />dan isi file</p>
        </div>
      </div>`;
    } else if (introBoxes[kind]) {
      return staticBoxes(introBoxes[kind]);
    } else {
      return /* HTML */ `<div class="snapshot-visual">
        <div class="snapshot-box">
          <strong>Working tree</strong>
          <p>File yang sedang<br />kamu edit</p>
          <div class="snapshot-label">KERJAKAN</div>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Index</strong>
          <p>Susunan snapshot<br />commit berikutnya</p>
          <div class="snapshot-label">SIAPKAN</div>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Commit / HEAD</strong>
          <p>Snapshot yang<br />sudah direkam</p>
          <div class="snapshot-label">REKAM</div>
        </div>
      </div>`;
    }
  }

  // Diagram konflik interaktif: dasar bersama, versi branch aktif, dan versi yang digabung.
  // Untuk materi merge, angkanya mengikuti cerita bab 6: harga 20000 dinaikkan jadi 22000
  // di main, sementara branch harga-promo menurunkannya jadi 18000. Untuk stash-konflik,
  // angkanya mengikuti bab 9: diskon 20 di-commit jadi 15, sementara stash berisi 25.
  function conflict(lesson) {
    const stash = lesson.id === 'stash-konflik',
      values = stash ? [20, 15, 25] : [20000, 22000, 18000];
    const line = (value) => (stash ? `const diskon = ${value};` : `{"kopiSusu":${value}}`);
    return /* HTML */ `<div class="visual-card">
      <div class="visual-header">
        <div>
          <h3>Tiga versi membantu menjelaskan benturan.</h3>
          <p>Base adalah titik sebelum kedua perubahan. Hasil akhir tetap keputusanmu.</p>
        </div>
        <span class="interactive-badge">INTERAKTIF</span>
      </div>
      <div class="conflict-versions">
        ${['Dasar bersama', 'HEAD saat ini', stash ? 'Simpanan stash' : 'Branch yang digabung']
          .map(
            (label, index) =>
              /* HTML */ `<section>
                <strong>${label}</strong><code>${esc(line(values[index]))}</code>
              </section>`,
          )
          .join('')}
      </div>
      <div class="conflict-editor">
        <pre id="conflict-preview">
${esc(
            `<<<<<<< ${stash ? 'Updated upstream' : 'HEAD'}\n${line(values[1])}\n=======\n${line(values[2])}\n>>>>>>> ${stash ? 'Stashed changes' : 'harga-promo'}`,
          )}</pre>
        <div class="sim-controls">
          ${values
            .slice(1)
            .map(
              (value) =>
                /* HTML */ `<button
                  class="button secondary small"
                  data-resolve-value="${esc(line(value))}"
                >
                  Pilih ${value}
                </button>`,
            )
            .join('')}
        </div>
        <p id="conflict-note" class="quiz-feedback" aria-live="polite">
          Memilih nilai hanya mengedit ilustrasi ini. Di repo nyata, periksa logika, hapus marker,
          lalu add file yang sudah selesai.
        </p>
      </div>
    </div>`;
  }

  function flow(currentFlow, flowStep = 0) {
    const scenario = Visuals.scenarios[currentFlow],
      frame = scenario.frames[flowStep];
    return /* HTML */ `<div class="visual-card flow-card" data-flow="${currentFlow}">
        <div class="visual-header">
          <div>
            <h3>${esc(scenario.title)}</h3>
            <p>${esc(scenario.description)}</p>
          </div>
          <span class="interactive-badge">INTERAKTIF</span>
        </div>
        <div class="flow-tabs" role="group" aria-label="Tahap ilustrasi">
          ${scenario.frames
            .map(
              (frame, index) =>
                /* HTML */ `<button
                  class="sim-tab ${index === flowStep ? 'active' : ''}"
                  data-flow-step="${index}"
                  aria-pressed="${index === flowStep}"
                >
                  <span>${String(index + 1).padStart(2, '0')}</span>${esc(frame.title)}
                </button>`,
            )
            .join('')}
        </div>
        <div class="flow-stage">
          ${
            frame.graph
              ? graphHTML(frame.graph)
              : frame.repos
                ? /* HTML */ `<div class="flow-repositories">
                    ${frame.repos
                      .map(
                        (repo) =>
                          /* HTML */ `<section>
                            <h4>${esc(repo.title)}</h4>
                            ${graphHTML(repo)}
                          </section>`,
                      )
                      .join('')}
                  </div>`
                : /* HTML */ `<div class="flow-areas">
                    ${frame.areas
                      .map(
                        ([title, value]) =>
                          /* HTML */ `<div class="snapshot-box">
                            <strong>${esc(title)}</strong>
                            <p>${esc(value)}</p>
                          </div>`,
                      )
                      .join('')}
                  </div>`
          }
        </div>
        <div class="sim-terminal">
          <div class="terminal-command">
            <span class="prompt">$</span><code>${esc(frame.command).replace(/\n/g, '<br/>')}</code>
          </div>
          <button class="copy-button" data-copy="${esc(frame.command)}">Salin ⧉</button>
        </div>
        <div class="sim-caption" aria-live="polite">
          <span class="caption-number">${flowStep + 1}</span><span>${esc(frame.explanation)}</span>
        </div>
      </div>
      <div class="sim-controls">
        <button class="text-button" data-flow-step="0">↻ Ke keadaan awal</button
        ><button
          class="button small"
          data-flow-step="${flowStep + 1}"
          ${flowStep === scenario.frames.length - 1 ? 'disabled' : ''}
        >
          ${flowStep === scenario.frames.length - 1 ? 'Akhir ilustrasi' : 'Langkah berikutnya'} →
        </button>
      </div>
      <p class="flow-note">
        ${frame.areas ? 'Panel menunjukkan keadaan atau tanggung jawab pada tahap terpilih. Baca command dan penjelasannya sebelum berpindah tahap.' : 'Huruf adalah identitas commit ilustrasi. Garis menghubungkan commit dengan parent. Gunakan latihan terminal untuk melihat object ID yang sebenarnya.'}
      </p>`;
  }

  return { visual, conflict, flow };
};
