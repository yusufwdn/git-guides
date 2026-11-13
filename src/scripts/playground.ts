import Simulator from '../lib/simulator.js';
import { scenarioInfo } from '../lib/scenarios.js';

export function startPlayground(onComplete: (scenario: string) => void) {
  const Sim: any = Simulator;
  const scenarios: any = scenarioInfo;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector)!;
  const selected = new URLSearchParams(location.search).get('scenario') || 'stash';
  const scenario = Object.hasOwn(scenarios, selected) ? selected : 'stash';
  const info = scenarios[scenario];
  let state = Sim.createState(scenario),
    history: string[] = [];
  $('#scenario-select')
    .querySelectorAll('option')
    .forEach((option) => {
      option.selected = option.value === scenario;
    });
  $('.practice-instructions h2').textContent = info.title;
  $('.practice-instructions p').textContent = info.description;
  const suggestions = $('.command-suggestions');
  suggestions.replaceChildren();
  for (const command of info.suggestions) {
    const button = document.createElement('button');
    button.className = 'suggestion';
    button.textContent = command;
    button.addEventListener('click', () => {
      $<HTMLInputElement>('#terminal-input').value = command;
      $('#terminal-input').focus();
    });
    suggestions.append(button);
  }
  function append(text: string, error = false) {
    const line = document.createElement('div');
    line.textContent = text || '(tidak ada output)';
    if (error) line.className = 'history-error';
    $('#terminal-history').append(line);
    $('#terminal-history').scrollTop = $('#terminal-history').scrollHeight;
  }
  function refresh() {
    const files = $('#sandbox-files');
    files.replaceChildren();
    const title = document.createElement('h3');
    title.textContent = 'Keadaan pekerjaan · ' + state.branch;
    files.append(title);
    for (const [name, content] of Object.entries(state.working)) {
      const row = document.createElement('p');
      row.textContent = name + ': ' + content;
      files.append(row);
    }
    const head = document.createElement('p');
    head.textContent =
      'HEAD: ' +
      Sim.head(state).id +
      ' · Index: ' +
      Sim.changed(Sim.head(state).files, state.index).length +
      ' perubahan staged';
    files.append(head);
    if (state.conflicts.length) {
      const button = document.createElement('button');
      button.id = 'resolve-sandbox';
      button.className = 'button secondary small';
      button.textContent = 'Pilih diskon 10% di file';
      button.addEventListener('click', () => {
        state = Sim.resolveConflict(state);
        append('Editor: diskon.js diubah menjadi diskon 10. Jalankan git add diskon.js.');
        refresh();
        $('#terminal-input').focus();
      });
      files.append(button);
    }
    const stashes = $('#sandbox-stashes');
    stashes.replaceChildren();
    const stashTitle = document.createElement('h3');
    stashTitle.textContent = 'Laci stash (' + state.stashes.length + ')';
    stashes.append(stashTitle);
    state.stashes.forEach((stash: any, index: number) => {
      const line = document.createElement('p');
      line.textContent = 'stash@{' + index + '}: ' + stash.message;
      stashes.append(line);
    });
  }
  const form = $<HTMLFormElement>('#terminal-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $<HTMLInputElement>('#terminal-input'),
      command = input.value.trim();
    if (!command) return;
    append('$ ' + command);
    const result = Sim.execute(state, command);
    state = result.state;
    if (result.ok) history.push(command);
    append(result.output, !result.ok);
    input.value = '';
    refresh();
  });
  $('#scenario-select').addEventListener('change', (event) => {
    location.href = '/playground/?scenario=' + (event.target as HTMLSelectElement).value;
  });
  $('#reset-playground').addEventListener('click', () => {
    state = Sim.createState(scenario);
    history = [];
    $('#terminal-history').replaceChildren();
    $('#practice-result').textContent = '';
    refresh();
    $('#terminal-input').focus();
  });
  $('#check-practice').addEventListener('click', () => {
    const observed =
      scenario !== 'stash' ||
      (history.some((command) => /^git stash(?: push)?.*-u/.test(command)) &&
        history.some((command) => /^git stash (?:pop|apply)/.test(command)));
    const complete = observed && info.isComplete(state);
    $('#practice-result').className = 'quiz-feedback ' + (complete ? 'correct' : 'incorrect');
    $('#practice-result').textContent = complete
      ? 'Tepat! Keadaan akhir sesuai tujuan latihan. Hasil tersimpan di perangkat ini jika penyimpanan tersedia.'
      : 'Belum sampai tujuan. Bandingkan keadaan file, index, branch, dan stash dengan instruksi.';
    if (complete) onComplete(scenario);
  });
  append('Selamat datang di Kopi Kita. Ketik git status atau pilih command di bawah.');
  refresh();
}
