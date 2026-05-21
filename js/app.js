/* Main App Controller */

let currentScores = { group: {}, ko: {}, qf: {}, sf: {}, final: null };
let currentMainTab = 'groups';

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupMainTabs();
  listenScores(onScoresUpdate);
});

function setupMainTabs() {
  document.querySelectorAll('.main-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentMainTab = tab.dataset.tab;
      document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      const section = document.getElementById(tab.dataset.tab + '-section');
      if (section) section.classList.add('active');
    });
  });
}

function onScoresUpdate(scores) {
  currentScores = scores || { group: {}, ko: {}, qf: {}, sf: {}, final: null };
  if (!currentScores.group) currentScores.group = {};
  if (!currentScores.ko) currentScores.ko = {};
  if (!currentScores.qf) currentScores.qf = {};
  if (!currentScores.sf) currentScores.sf = {};
  renderAll();
}

function renderAll() {
  renderGroupStage(currentScores);
  renderKnockoutStage(currentScores);
}
