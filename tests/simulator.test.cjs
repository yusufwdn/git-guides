const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Sim = require('../assets/simulator.js');

function run(state, command) {
  const result = Sim.execute(state, command);
  assert.equal(result.ok, true, result.output);
  return result.state;
}

function gitFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitguides-fixture-'));
  const git = (...args) =>
    execFileSync(
      'git',
      [
        '-c',
        'core.hooksPath=NUL',
        '-c',
        'commit.gpgsign=false',
        '-c',
        'tag.gpgsign=false',
        ...args,
      ],
      {
        cwd: dir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' },
      },
    ).trim();
  git('init', '-b', 'main');
  git('config', 'user.name', 'Git Guides Test');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'core.autocrlf', 'false');
  fs.writeFileSync(path.join(dir, 'diskon.js'), 'const diskon = 0;');
  fs.writeFileSync(path.join(dir, 'menu.json'), '{"kopiSusu": 18000}');
  git('add', '.');
  git('commit', '-m', 'Awal');
  git('switch', '-c', 'fitur-diskon');
  t.after(() => {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(dir));
    assert(
      !relative.startsWith('..') &&
        !path.isAbsolute(relative) &&
        path.basename(dir).startsWith('gitguides-fixture-'),
    );
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return {
    dir,
    git,
    write: (file, text) => fs.writeFileSync(path.join(dir, file), text),
    read: (file) => fs.readFileSync(path.join(dir, file), 'utf8'),
  };
}

test('staging satu file tidak menyertakan perubahan file lain', (t) => {
  const fixture = gitFixture(t);
  fixture.write('diskon.js', 'const diskon = 10;');
  fixture.write('menu.json', '{"kopiSusu": 20000}');
  fixture.git('add', 'menu.json');
  fixture.git('commit', '-m', 'Menu');
  let state = Sim.createState('staging');
  state = run(state, 'git add menu.json');
  state = run(state, 'git commit -m "Menu"');
  assert.equal(Sim.head(state).files['diskon.js'], fixture.git('show', 'HEAD:diskon.js'));
  assert.equal(Sim.head(state).files['menu.json'], fixture.git('show', 'HEAD:menu.json'));
  assert.equal(state.working['diskon.js'], fixture.read('diskon.js'));
  assert.equal(fixture.git('diff', '--name-only'), 'diskon.js');
});

test('stash biasa meninggalkan untracked, -u menyimpan dan memulihkannya', (t) => {
  const fixture = gitFixture(t);
  fixture.write('diskon.js', 'const diskon = 10;');
  fixture.write('catatan.txt', 'Ide: diskon akhir pekan');
  fixture.git('stash', 'push', '-m', 'WIP');
  let state = run(Sim.createState(), 'git stash push -m "WIP"');
  assert.equal(state.working['diskon.js'], fixture.read('diskon.js'));
  assert.equal(state.working['catatan.txt'], fixture.read('catatan.txt'));
  assert.equal(state.stashes.length, 1);
  fixture.git('stash', 'pop');
  state = run(state, 'git stash pop');
  fixture.git('stash', 'push', '-u', '-m', 'Semua');
  state = run(state, 'git stash push -u -m "Semua"');
  assert.equal(fs.existsSync(path.join(fixture.dir, 'catatan.txt')), false);
  assert.equal(Object.hasOwn(state.working, 'catatan.txt'), false);
  fixture.git('stash', 'pop');
  state = run(state, 'git stash pop');
  assert.equal(state.working['catatan.txt'], fixture.read('catatan.txt'));
  assert.equal(state.working['diskon.js'], fixture.read('diskon.js'));
  assert.equal(state.stashes.length, 0);
});

test('apply mempertahankan entri; --index memulihkan staged state', (t) => {
  const fixture = gitFixture(t);
  fixture.write('diskon.js', 'const diskon = 10;');
  fixture.git('add', 'diskon.js');
  fixture.git('stash', 'push', '-m', 'Staged');
  fixture.git('stash', 'apply', '--index');
  let state = Sim.createState('lesson');
  state = run(state, 'git add diskon.js');
  state = run(state, 'git stash push -m "Staged"');
  state = run(state, 'git stash apply --index');
  assert.equal(state.stashes.length, 1);
  assert.equal(state.index['diskon.js'], fixture.git('show', ':diskon.js'));
  assert.equal(state.working['diskon.js'], fixture.read('diskon.js'));
  assert.match(Sim.status(state), /Changes to be committed/);
});

test('pop berkonflik mempertahankan entri dan memerlukan penyelesaian', (t) => {
  const fixture = gitFixture(t);
  fixture.write('diskon.js', 'const diskon = 10;');
  fixture.git('stash', 'push', '-m', 'WIP');
  fixture.write('diskon.js', 'const diskon = 15;');
  fixture.git('add', 'diskon.js');
  fixture.git('commit', '-m', 'Tim');
  assert.throws(() => fixture.git('stash', 'pop'));
  let state = run(Sim.createState('conflict'), 'git stash pop');
  assert.equal(state.stashes.length, 1);
  assert.match(fixture.git('stash', 'list'), /stash@\{0\}/);
  assert.deepEqual(state.conflicts, ['diskon.js']);
  assert.match(state.working['diskon.js'], /<<<<<<< Updated upstream/);
  state = Sim.resolveConflict(state);
  state = run(state, 'git add diskon.js');
  state = run(state, 'git commit -m "Selesaikan"');
  assert.equal(Sim.head(state).files['diskon.js'], 'const diskon = 10;');
  assert.equal(state.stashes.length, 1);
});

test('additions yang staged kembali staged setelah stash pop biasa', (t) => {
  const fixture = gitFixture(t);
  fixture.write('baru.txt', 'file baru');
  fixture.git('add', 'baru.txt');
  fixture.git('stash', 'push');
  fixture.git('stash', 'pop');
  let state = Sim.createState('lesson');
  state.working['baru.txt'] = 'file baru';
  state = run(state, 'git add baru.txt');
  state = run(state, 'git stash push');
  state = run(state, 'git stash pop');
  assert.equal(state.index['baru.txt'], fixture.git('show', ':baru.txt'));
});

test('switch membawa edit kompatibel tetapi menolak overwrite', () => {
  let state = Sim.createState('lesson');
  state = run(state, 'git switch main');
  assert.equal(state.working['diskon.js'], 'const diskon = 10;');
  state = run(state, 'git add diskon.js');
  state = run(state, 'git commit -m "Diskon"');
  state = run(state, 'git switch fitur-diskon');
  state.working['diskon.js'] = 'const diskon = 20;';
  const result = Sim.execute(state, 'git switch main');
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, state);
});

test('input yang belum didukung tidak mengubah state', () => {
  const state = Sim.createState();
  for (const command of [
    'git reset --hard',
    'git stash clear',
    'rm -rf .',
    'git stash push -a',
    'git commit -m "pesan tanpa akhir',
  ]) {
    const result = Sim.execute(state, command);
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state);
  }
});

test('beberapa stash menggunakan urutan terbaru dan drop yang dipilih', () => {
  let state = run(Sim.createState('lesson'), 'git stash push -m "Pertama"');
  state.working['diskon.js'] = 'const diskon = 20;';
  state = run(state, 'git stash push -m "Kedua"');
  assert.equal(state.stashes[0].message, 'Kedua');
  state = run(state, 'git stash drop "stash@{1}"');
  assert.equal(state.stashes.length, 1);
  assert.equal(state.stashes[0].message, 'Kedua');
});
