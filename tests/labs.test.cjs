const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Lab = require('../labs/git-lab.cjs');
const Content = require('../assets/content.js');
const Visuals = require('../assets/visuals.js');

function fresh(t, id) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'gitguides-labs-'));
  t.after(() => {
    const resolved = fs.realpathSync(parent),
      relative = path.relative(fs.realpathSync(os.tmpdir()), resolved);
    assert(
      !relative.startsWith('..') &&
        !path.isAbsolute(relative) &&
        path.basename(resolved).startsWith('gitguides-labs-'),
    );
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const lab = Lab.start(id, { directory: parent });
  return {
    ...lab,
    g: (...args) => Lab.git(lab.repo, ...args),
    w: (file, value) => Lab.write(lab.repo, file, value),
  };
}

const solutions = {
  worktree(l) {
    const linked = path.join(l.root, 'kopi-kita-hotfix');
    l.g('worktree', 'add', '-b', 'hotfix', linked, 'awal');
    Lab.write(linked, 'menu.json', '{"kopiSusu":22000}\n');
    Lab.git(linked, 'add', 'menu.json');
    Lab.git(linked, 'commit', '-m', 'Hotfix harga');
  },
  submodule(l) {
    const theme = path.join(l.repo, 'tema');
    Lab.git(theme, 'fetch', 'origin');
    Lab.git(theme, 'switch', '--detach', 'origin/main');
    l.g('add', 'tema');
    l.g('commit', '-m', 'Pilih tema orange');
  },
  basics() {},
  staging(l) {
    l.g('add', 'menu.json');
    l.g('commit', '-m', 'Menu');
  },
  'partial-staging'(l) {
    execFileSync('git', ['-c', 'color.ui=false', 'add', '-p', 'checkout.js'], {
      cwd: l.repo,
      input: 'y\nn\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    l.g('commit', '-m', 'Hitung total');
  },
  branch(l) {
    l.g('switch', '-c', 'fitur-diskon');
    l.w('diskon.js', 'const diskon = 10;\n');
    l.g('add', 'diskon.js');
    l.g('commit', '-m', 'Fitur');
  },
  'merge-ff'(l) {
    l.g('merge', '--ff-only', 'fitur-diskon');
  },
  'merge-conflict'(l) {
    assert.throws(() => l.g('merge', 'fitur-menu'));
    l.w('menu.json', '{"kopiSusu":22000}\n');
    l.g('add', 'menu.json');
    l.g('-c', 'core.editor=true', 'merge', '--continue');
  },
  'merge-abort'(l) {
    assert.throws(() => l.g('merge', 'fitur-menu'));
    l.g('merge', '--abort');
  },
  stash(l) {
    l.g('stash', 'push', '-u', '-m', 'Latihan');
    assert.equal(l.g('status', '--porcelain'), '');
    l.g('stash', 'pop');
  },
  'stash-index'(l) {
    l.g('stash', 'push', '-m', 'Index');
    l.g('stash', 'apply', '--index');
  },
  'stash-conflict'(l) {
    assert.throws(() => l.g('stash', 'pop'));
    assert.match(l.g('stash', 'list'), /WIP diskon/);
    l.w('diskon.js', 'const diskon = 10;\n');
    l.g('add', 'diskon.js');
    l.g('commit', '-m', 'Resolve');
  },
  'reset-soft'(l) {
    l.g('reset', '--soft', 'awal');
  },
  'reset-mixed'(l) {
    l.g('reset', '--mixed', 'awal');
  },
  'reset-hard'(l) {
    l.g('reset', '--hard', 'awal');
  },
  revert(l) {
    l.g('revert', '--no-edit', 'HEAD');
  },
  reflog(l) {
    const line = l
      .g('reflog', '--all', '--format=%H %gs')
      .split('\n')
      .find((line) => line.includes('Diskon yang ingin dipulihkan'));
    assert(line);
    l.g('branch', 'pulih-diskon', line.split(' ')[0]);
  },
  remote(l) {
    assert.equal(l.g('rev-parse', 'origin/main'), l.metadata.base);
    l.g('fetch', 'origin');
    assert.equal(l.g('rev-parse', 'main'), l.metadata.base);
    l.g('merge', '--ff-only', 'origin/main');
    l.w('README.md', '# Kopi Kita\n\nDokumentasi baru.\n');
    l.g('add', 'README.md');
    l.g('commit', '-m', 'Panduan baru');
    l.g('push', 'origin', 'main');
  },
  rebase(l) {
    l.g('rebase', 'main');
  },
  'cherry-pick'(l) {
    const line = l
      .g('log', '--format=%H %s', 'fitur-eksperimen')
      .split('\n')
      .find((line) => line.includes('Validasi jumlah checkout'));
    l.g('cherry-pick', line.split(' ')[0]);
  },
  clean(l) {
    assert.match(l.g('clean', '-nd'), /catatan-sementara/);
    l.g('clean', '-f', '--', 'catatan-sementara.txt');
  },
  bisect(l) {
    l.g('bisect', 'start');
    l.g('bisect', 'bad');
    l.g('bisect', 'good', 'awal');
    let bad;
    for (let count = 0; count < 12; count++) {
      const value = fs.readFileSync(path.join(l.repo, 'diskon.js'), 'utf8');
      l.g('bisect', value.includes('-10') ? 'bad' : 'good');
      // This linear history has no skipped commits. One remaining candidate means
      // every earlier commit is known good; do not parse Git's display messages.
      const candidates = l
        .g('rev-list', 'refs/bisect/bad', '--not', '--glob=refs/bisect/good-*')
        .split('\n')
        .filter(Boolean);
      assert(candidates.length > 0, 'Bisect kehilangan kandidat commit.');
      if (candidates.length === 1) {
        bad = candidates[0];
        break;
      }
      if (count === 11) assert.fail('Bisect tidak selesai.');
    }
    assert(bad);
    l.g('branch', 'bug-ditemukan', bad);
    l.g('bisect', 'reset');
  },
  tags(l) {
    l.g('tag', '-a', 'v1.0.0', '-m', 'Awal');
    l.w('README.md', '# Kopi Kita\n\nVersi sesudah rilis.\n');
    l.g('add', 'README.md');
    l.g('commit', '-m', 'Dokumen');
  },
  sparse(l) {
    l.g('sparse-checkout', 'set', '--cone', 'web');
  },
  objects(l) {
    assert.equal(l.g('cat-file', '-t', 'HEAD^{tree}'), 'tree');
    assert.equal(l.g('cat-file', '-t', 'HEAD:menu.json'), 'blob');
  },
};

for (const id of Object.keys(Lab.definitions))
  test(`Latihan ${id}: kondisi awal → solusi → hasil terverifikasi`, (t) => {
    const lab = fresh(t, id);
    assert(solutions[id], `Belum ada solusi untuk ${id}`);
    solutions[id](lab);
    const result = Lab.check(lab.repo);
    assert.equal(result.ok, true, JSON.stringify(result.items));
  });

test('solusi bisect tetap selesai saat Git memakai tanda petik pada istilah bad', (t) => {
  const lab = fresh(t, 'bisect');
  const git = lab.g;
  let reformatted = false;
  lab.g = (...args) => {
    const output = git(...args);
    if (args[0] !== 'bisect') return output;
    return output.replace(/is the first (?:bad|'bad') commit/g, () => {
      reformatted = true;
      return "is the first 'bad' commit";
    });
  };
  solutions.bisect(lab);
  assert(reformatted, 'Tes harus melewati output hasil bisect dengan format berbeda.');
  assert.equal(lab.g('rev-parse', 'bug-ditemukan'), lab.metadata.expected.bad);
  const result = Lab.check(lab.repo);
  assert.equal(result.ok, true, JSON.stringify(result.items));
});

test('checker menolak commit yang mencampur kedua pekerjaan', (t) => {
  const l = fresh(t, 'staging');
  l.g('add', '.');
  l.g('commit', '-m', 'Semua');
  const result = Lab.check(l.repo);
  assert.equal(result.ok, false);
  assert(result.items.some((item) => !item.passed));
});
test('start tidak menimpa latihan sebelumnya dan memakai konfigurasi lokal', (t) => {
  const l = fresh(t, 'branch');
  const second = Lab.start('branch', { directory: path.dirname(l.root) });
  assert.notEqual(l.root, second.root);
  assert.equal(l.g('config', '--local', 'user.email'), 'belajar@example.invalid');
  assert.equal(fs.existsSync(path.join(l.repo, 'README.md')), true);
});
test('katalog website dan generator sepakat tentang seluruh ID latihan', () => {
  assert.deepEqual(Object.keys(Content.labs).sort(), Object.keys(Lab.definitions).sort());
});

test('grafik fast-forward cocok dengan parent dan referensi Git', (t) => {
  const l = fresh(t, 'merge-ff');
  const frames = Visuals.scenarios['merge-ff'].frames;
  assert.equal(l.g('rev-parse', 'fitur-diskon^'), l.metadata.base);
  assert.equal(frames[0].graph.refs.find((ref) => ref.name === 'main / HEAD').node, 'A');
  l.g('merge', '--ff-only', 'fitur-diskon');
  assert.equal(l.g('rev-parse', 'main'), l.metadata.expected.feature);
  assert.equal(frames[1].graph.nodes.length, 2);
  assert.equal(frames[1].graph.refs.find((ref) => ref.name === 'main / HEAD').node, 'B');
});
test('grafik rebase menggambarkan dua identitas pengganti dan dasar yang sama', (t) => {
  const l = fresh(t, 'rebase');
  l.g('rebase', 'main');
  assert.equal(l.g('rev-parse', 'fitur-diskon~2'), l.metadata.expected.main);
  assert.notEqual(l.g('rev-parse', 'fitur-diskon~1'), l.metadata.expected.oldFirst);
  const graph = Visuals.scenarios.rebase.frames[1].graph;
  assert.deepEqual(graph.nodes.find((node) => node.id === 'C′').parents, ['B']);
  assert.deepEqual(graph.nodes.find((node) => node.id === 'D′').parents, ['C′']);
});
test('tabel reset sesuai isi tiga area Git sungguhan', (t) => {
  for (const mode of ['soft', 'mixed', 'hard']) {
    const l = fresh(t, `reset-${mode}`);
    l.g('reset', `--${mode}`, 'awal');
    const frame = Visuals.scenarios.reset.frames.find(
      (frame) => frame.title.toLowerCase() === mode,
    );
    const prices = frame.areas.map(([, value]) => value.match(/\d+/)[0]);
    assert.deepEqual(
      prices,
      [
        JSON.parse(l.g('show', 'HEAD:menu.json')).kopiSusu,
        JSON.parse(l.g('show', ':menu.json')).kopiSusu,
        JSON.parse(fs.readFileSync(path.join(l.repo, 'menu.json'), 'utf8')).kopiSusu,
      ].map(String),
    );
  }
});
test('fetch memperbarui tracking tanpa memindahkan branch lokal seperti diagram', (t) => {
  const l = fresh(t, 'remote');
  l.g('fetch', 'origin');
  assert.equal(l.g('rev-parse', 'main'), l.metadata.base);
  assert.equal(l.g('rev-parse', 'origin/main'), l.metadata.expected.remote);
  const frame = Visuals.scenarios.remote.frames[1];
  assert.deepEqual(
    frame.repos[0].refs.map((ref) => ref.node),
    ['A', 'B'],
  );
});
