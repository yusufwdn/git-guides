const clone = (value) => JSON.parse(JSON.stringify(value));
const equal = (a, b) => a === b;
const paths = (...objects) => [...new Set(objects.flatMap((object) => Object.keys(object)))].sort();
const changed = (a, b) => paths(a, b).filter((path) => !equal(a[path], b[path]));

function tokenize(command) {
  const tokens = [];
  let token = '',
    quote = null,
    started = false;
  for (const char of command.trim()) {
    if (quote) {
      if (char === quote) quote = null;
      else token += char;
      started = true;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) {
        tokens.push(token);
        token = '';
        started = false;
      }
    } else {
      token += char;
      started = true;
    }
  }
  if (quote) throw new Error('Tanda kutip belum ditutup.');
  if (started) tokens.push(token);
  return tokens;
}

function createState(scenario = 'stash') {
  const files = { 'diskon.js': 'const diskon = 0;', 'menu.json': '{"kopiSusu": 18000}' };
  const state = {
    branch: 'fitur-diskon',
    refs: { main: 'a1b2c3d', 'fitur-diskon': 'a1b2c3d' },
    commits: [
      { id: 'a1b2c3d', message: 'Siapkan menu Kopi Kita', files: clone(files), parents: [] },
    ],
    index: clone(files),
    working: clone(files),
    stashes: [],
    conflicts: [],
    sequence: 0,
  };
  state.working['diskon.js'] = 'const diskon = 10;';
  if (scenario === 'stash') state.working['catatan.txt'] = 'Ide: diskon akhir pekan';
  if (scenario === 'staging') state.working['menu.json'] = '{"kopiSusu": 20000}';
  if (scenario === 'conflict') {
    state.stashes.push({
      message: 'WIP diskon',
      branch: 'fitur-diskon',
      base: clone(files),
      index: clone(files),
      working: { ...files, 'diskon.js': 'const diskon = 10;' },
      untracked: {},
    });
    const changedFiles = { ...files, 'diskon.js': 'const diskon = 15;' };
    state.commits.push({
      id: 'b2c3d4e',
      message: 'Atur diskon dari tim',
      files: clone(changedFiles),
      parents: ['a1b2c3d'],
    });
    state.refs['fitur-diskon'] = 'b2c3d4e';
    state.working = clone(changedFiles);
    state.index = clone(changedFiles);
  }
  return state;
}

function head(state) {
  return state.commits.find((commit) => commit.id === state.refs[state.branch]);
}

function status(state) {
  const base = head(state).files;
  const staged = changed(base, state.index).filter((path) => !state.conflicts.includes(path));
  const unstaged = changed(state.index, state.working).filter(
    (path) => Object.hasOwn(state.index, path) && !state.conflicts.includes(path),
  );
  const untracked = Object.keys(state.working).filter(
    (path) => !Object.hasOwn(state.index, path) && !Object.hasOwn(base, path),
  );
  const lines = [`On branch ${state.branch}`];
  if (state.conflicts.length)
    lines.push('\nUnmerged paths:', ...state.conflicts.map((path) => `  both modified: ${path}`));
  if (staged.length)
    lines.push(
      '\nChanges to be committed:',
      ...staged.map(
        (path) =>
          `  ${!Object.hasOwn(base, path) ? 'new file' : !Object.hasOwn(state.index, path) ? 'deleted' : 'modified'}: ${path}`,
      ),
    );
  if (unstaged.length)
    lines.push(
      '\nChanges not staged for commit:',
      ...unstaged.map(
        (path) => `  ${!Object.hasOwn(state.working, path) ? 'deleted' : 'modified'}: ${path}`,
      ),
    );
  if (untracked.length) lines.push('\nUntracked files:', ...untracked.map((path) => `  ${path}`));
  if (!staged.length && !unstaged.length && !untracked.length && !state.conflicts.length)
    lines.push('nothing to commit, working tree clean');
  return lines.join('\n');
}

function diff(a, b) {
  const differences = changed(a, b);
  return differences.length
    ? differences
        .map(
          (path) =>
            `diff --git a/${path} b/${path}\n--- a/${path}\n+++ b/${path}\n${a[path] === undefined ? '' : `-${a[path]}\n`}${b[path] === undefined ? '' : `+${b[path]}`}`,
        )
        .join('\n\n')
    : '';
}

function stashIndex(state, ref) {
  if (ref === undefined) return 0;
  const match = /^(?:stash@\{(\d+)\}|(\d+))$/.exec(ref);
  if (!match) throw new Error('Gunakan referensi seperti "stash@{0}" atau angka 0.');
  return Number(match[1] ?? match[2]);
}

function assertOptions(args, allowed) {
  const unsupported = args.find((arg) => arg.startsWith('-') && !allowed.includes(arg));
  if (unsupported)
    throw new Error(
      `Opsi ${unsupported} belum didukung simulator. Baca daftar dukungan di bawah terminal.`,
    );
}

function execute(input, command) {
  const state = clone(input);
  try {
    const tokens = tokenize(command);
    if (!tokens.length) return { state, output: '', ok: true };
    if (tokens[0] === 'help')
      return {
        state,
        output:
          'Didukung: git status, diff [--staged], add FILE|., commit -m "pesan", log [--oneline], switch [-c] BRANCH, stash [push [-u] [-m "pesan"]|list|show [-p] REF|apply [--index] REF|pop [--index] REF|drop REF].\nIni simulator terbatas, bukan shell atau Git penuh.',
        ok: true,
      };
    if (tokens[0] !== 'git')
      throw new Error('Simulator ini menerima command Git. Ketik help untuk daftar dukungan.');
    const action = tokens[1],
      args = tokens.slice(2);
    let output = '';
    if (action === 'status') {
      if (args.length) throw new Error('Contoh yang didukung: git status');
      output = status(state);
    } else if (action === 'diff') {
      assertOptions(args, ['--staged', '--cached']);
      if (args.some((arg) => !arg.startsWith('-')))
        throw new Error(
          'Diff simulator mendukung seluruh file, dengan opsi --staged atau --cached.',
        );
      output = args.length
        ? diff(head(state).files, state.index)
        : diff(
            state.index,
            Object.fromEntries(
              Object.entries(state.working).filter(([path]) => Object.hasOwn(state.index, path)),
            ),
          );
    } else if (action === 'add') {
      assertOptions(args, []);
      if (args.length !== 1) throw new Error('Contoh: git add diskon.js atau git add .');
      const selected = args[0] === '.' ? paths(state.index, state.working) : [args[0]];
      for (const path of selected) {
        if (!Object.hasOwn(state.working, path) && !Object.hasOwn(state.index, path))
          throw new Error(`File ${path} tidak ada pada skenario ini.`);
        if (state.working[path]?.includes('<<<<<<<'))
          throw new Error(
            'Marker konflik masih ada. Gunakan tombol Selesaikan konflik pada panel file dahulu.',
          );
        if (Object.hasOwn(state.working, path)) state.index[path] = state.working[path];
        else delete state.index[path];
        state.conflicts = state.conflicts.filter((item) => item !== path);
      }
    } else if (action === 'commit') {
      if (args.length !== 2 || args[0] !== '-m' || !args[1].trim())
        throw new Error('Contoh yang didukung: git commit -m "Perbaiki menu"');
      if (state.conflicts.length)
        throw new Error('Masih ada konflik. Selesaikan lalu add file yang relevan.');
      if (!changed(head(state).files, state.index).length)
        throw new Error(
          'nothing to commit: belum ada perubahan staged. Gunakan git add terlebih dahulu.',
        );
      const parent = head(state).id;
      state.sequence++;
      const id = 'f' + state.sequence.toString(16).padStart(6, '0');
      state.commits.push({ id, message: args[1], files: clone(state.index), parents: [parent] });
      state.refs[state.branch] = id;
      output = `[${state.branch} ${id}] ${args[1]}`;
    } else if (action === 'log') {
      assertOptions(args, ['--oneline']);
      if (args.some((arg) => !arg.startsWith('-')))
        throw new Error('Contoh yang didukung: git log --oneline');
      let commit = head(state);
      const lines = [];
      while (commit) {
        const labels = Object.entries(state.refs)
          .filter(([, id]) => id === commit.id)
          .map(([name]) => (name === state.branch ? `HEAD -> ${name}` : name));
        lines.push(
          `${commit.id}${labels.length ? ' (' + labels.join(', ') + ')' : ''} ${commit.message}`,
        );
        commit = state.commits.find((item) => item.id === commit.parents[0]);
      }
      output = lines.join('\n');
    } else if (action === 'switch') {
      const create = args[0] === '-c';
      assertOptions(args, ['-c']);
      if (args.length !== (create ? 2 : 1))
        throw new Error('Contoh: git switch main atau git switch -c hotfix');
      if (state.conflicts.length) throw new Error('Selesaikan konflik sebelum berpindah branch.');
      const name = args[create ? 1 : 0];
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name))
        throw new Error('Simulator mendukung nama branch berisi huruf, angka, tanda - dan _.');
      if (create) {
        if (Object.hasOwn(state.refs, name)) throw new Error(`Branch ${name} sudah ada.`);
        state.refs[name] = head(state).id;
        state.branch = name;
        output = `Switched to a new branch '${name}'`;
      } else {
        if (!Object.hasOwn(state.refs, name)) throw new Error(`Branch ${name} belum ada.`);
        const current = head(state).files,
          target = state.commits.find((commit) => commit.id === state.refs[name]).files;
        const local = new Set([
          ...changed(current, state.index),
          ...changed(state.index, state.working),
        ]);
        const updated = changed(current, target);
        if (updated.some((path) => local.has(path) && state.working[path] !== target[path]))
          throw new Error('Perubahan lokal akan tertimpa. Simpan dengan commit atau stash dahulu.');
        for (const path of updated) {
          if (Object.hasOwn(target, path)) {
            state.index[path] = target[path];
            state.working[path] = target[path];
          } else {
            delete state.index[path];
            delete state.working[path];
          }
        }
        state.branch = name;
        output = `Switched to branch '${name}'`;
      }
    } else if (action === 'stash') {
      const sub = args[0] && !args[0].startsWith('-') ? args.shift() : 'push';
      if (sub === 'push') {
        assertOptions(args, ['-u', '--include-untracked', '-m']);
        if (state.conflicts.length) throw new Error('Selesaikan konflik sebelum membuat stash.');
        let message = 'WIP diskon',
          include = false;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-m') {
            if (!args[i + 1]) throw new Error('Tambahkan pesan sesudah -m.');
            message = args[++i];
          } else if (args[i] === '-u' || args[i] === '--include-untracked') include = true;
          else throw new Error('Gunakan push [-u] [-m "pesan"].');
        }
        const base = head(state).files,
          tracked = new Set(paths(base, state.index));
        const working = Object.fromEntries(
          Object.entries(state.working).filter(([path]) => tracked.has(path)),
        );
        const untracked = include
          ? Object.fromEntries(Object.entries(state.working).filter(([path]) => !tracked.has(path)))
          : {};
        if (
          !changed(base, state.index).length &&
          !changed(state.index, working).length &&
          !Object.keys(untracked).length
        ) {
          output = 'No local changes to save';
        } else {
          state.stashes.unshift({
            message,
            branch: state.branch,
            base: clone(base),
            index: clone(state.index),
            working: clone(working),
            untracked: clone(untracked),
          });
          for (const path of new Set([...tracked, ...Object.keys(untracked)]))
            delete state.working[path];
          Object.assign(state.working, clone(base));
          state.index = clone(base);
          output = `Saved working directory and index state On ${state.branch}: ${message}`;
        }
      } else if (sub === 'list') {
        if (args.length) throw new Error('Contoh: git stash list');
        output = state.stashes
          .map((stash, index) => `stash@{${index}}: On ${stash.branch}: ${stash.message}`)
          .join('\n');
      } else if (['show', 'apply', 'pop', 'drop'].includes(sub)) {
        assertOptions(args, sub === 'show' ? ['-p'] : sub === 'drop' ? [] : ['--index']);
        const refs = args.filter((arg) => !arg.startsWith('-'));
        if (refs.length > 1) throw new Error('Pilih satu entri stash.');
        const index = stashIndex(state, refs[0]),
          stash = state.stashes[index];
        if (!stash) throw new Error('Entri stash tidak ditemukan. Periksa git stash list.');
        if (sub === 'show') {
          output =
            diff(stash.base, stash.working) +
            (Object.keys(stash.untracked).length
              ? '\n\nCatatan: entri ini juga menyimpan file untracked.'
              : '');
        } else if (sub === 'drop') {
          state.stashes.splice(index, 1);
          output = `Dropped stash@{${index}}`;
        } else {
          if (state.conflicts.length)
            throw new Error('Selesaikan konflik yang sedang berlangsung terlebih dahulu.');
          if (
            changed(
              state.index,
              Object.fromEntries(
                Object.entries(state.working).filter(([path]) => Object.hasOwn(state.index, path)),
              ),
            ).length ||
            changed(head(state).files, state.index).length
          )
            throw new Error(
              'Untuk latihan ini, mulai apply/pop dari working tree tracked dan index yang bersih. Simulator belum memodelkan semua kombinasi perubahan lokal.',
            );
          const updates = changed(stash.base, stash.working);
          if (Object.keys(stash.untracked).some((path) => Object.hasOwn(state.working, path)))
            throw new Error(
              'File untracked tujuan sudah ada; penerapan tidak dijalankan pada simulator. Entri stash dipertahankan.',
            );
          for (const path of updates) {
            const current = state.working[path],
              base = stash.base[path],
              incoming = stash.working[path];
            if (current !== base && current !== incoming) {
              state.conflicts.push(path);
              state.working[path] =
                `<<<<<<< Updated upstream\n${current ?? ''}\n=======\n${incoming ?? ''}\n>>>>>>> Stashed changes`;
            } else if (incoming === undefined) delete state.working[path];
            else state.working[path] = incoming;
          }
          Object.assign(state.working, clone(stash.untracked));
          // Without --index, additions saved in the stash are staged by Git;
          // ordinary tracked modifications return as unstaged changes.
          for (const path of updates)
            if (
              !Object.hasOwn(stash.base, path) &&
              Object.hasOwn(stash.working, path) &&
              !state.conflicts.includes(path)
            )
              state.index[path] = stash.working[path];
          if (args.includes('--index') && !state.conflicts.length) {
            for (const path of changed(stash.base, stash.index)) {
              if (Object.hasOwn(stash.index, path)) state.index[path] = stash.index[path];
              else delete state.index[path];
            }
          }
          if (state.conflicts.length)
            output = `CONFLICT (content): Merge conflict in ${state.conflicts.join(', ')}\nEntri stash tetap disimpan. Selesaikan isi file, lalu git add file tersebut. Tidak ada git stash --continue.`;
          else {
            output = status(state);
            if (sub === 'pop') {
              state.stashes.splice(index, 1);
              output += '\nDropped stash@{' + index + '}';
            }
          }
        }
      } else throw new Error(`git stash ${sub} belum didukung. Ketik help untuk daftar dukungan.`);
    } else
      throw new Error(
        `git ${action || ''} belum didukung simulator. Ketik help atau baca referensi command.`,
      );
    return { state, output, ok: true };
  } catch (error) {
    return { state: clone(input), output: error.message, ok: false };
  }
}

function resolveConflict(input) {
  const state = clone(input);
  for (const path of state.conflicts) state.working[path] = 'const diskon = 10;';
  return state;
}

export default { createState, execute, status, head, diff, changed, resolveConflict, tokenize };
