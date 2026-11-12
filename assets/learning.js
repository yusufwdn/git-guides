(function (root) {
  'use strict';
  const data = root.GitGuidesContent,
    Pages = root.GitGuidesPages;
  let currentFlow = null,
    flowStep = 0;
  function enhanceLesson(lesson) {
    currentFlow = root.GitGuidesVisuals.forLesson(lesson);
    flowStep = 0;
  }
  function renderLabs(id) {
    if (id && !Object.hasOwn(data.labs, id)) return false;
    document.querySelector('#main').innerHTML = Pages.labs(id);
    return true;
  }
  document.addEventListener('click', (event) => {
    const resolution = event.target.closest('[data-resolve-value]');
    if (resolution) {
      document.querySelector('#conflict-preview').textContent = resolution.dataset.resolveValue;
      document.querySelector('#conflict-note').textContent =
        'Hasil pilihan sudah mengganti marker pada ilustrasi. Di Git sungguhan, uji hasil, jalankan add pada file yang selesai, lalu lanjutkan proses yang sesuai. Konflik stash tidak memiliki stash --continue.';
      return;
    }
    const target = event.target.closest('[data-flow-step]');
    if (!target || !currentFlow) return;
    const step = Number(target.dataset.flowStep);
    if (step < 0 || step >= root.GitGuidesVisuals.scenarios[currentFlow].frames.length) return;
    flowStep = step;
    document.querySelector('#lesson-visual').innerHTML = Pages.flow(currentFlow, flowStep);
  });
  root.GitGuidesLearning = { enhanceLesson, renderLabs };
})(window);
