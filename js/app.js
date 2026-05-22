/* Main App Controller */

let currentScores = { group: {}, ko: {}, qf: {}, sf: {}, final: null };
let currentMainTab = 'groups';
let teamsLoaded = false;
let scoresLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupMainTabs();
  setupCategoryTabs();
  loadDataForCurrentCategory();
});

function loadDataForCurrentCategory() {
  teamsLoaded = false;
  scoresLoaded = false;

  listenTeams(teams => {
    if (teams) {
      TOURNAMENT.groups = teams;
    } else {
      TOURNAMENT.groups = CURRENT_CATEGORY === 'doi_nam' ? DEFAULT_TEAMS : {};
    }
    teamsLoaded = true;
    if (scoresLoaded) renderAll();
  });

  listenScores(scores => {
    currentScores = scores || { group: {}, ko: {}, qf: {}, sf: {}, final: null };
    if (!currentScores.group) currentScores.group = {};
    if (!currentScores.ko) currentScores.ko = {};
    if (!currentScores.qf) currentScores.qf = {};
    if (!currentScores.sf) currentScores.sf = {};
    scoresLoaded = true;
    if (teamsLoaded) renderAll();
  });
}

function setupCategoryTabs() {
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (CURRENT_CATEGORY === tab.dataset.cat) return;
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      CURRENT_CATEGORY = tab.dataset.cat;
      
      
      loadDataForCurrentCategory();
    });
  });
}

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

function renderAll() {
  renderGroupStage(currentScores);
  renderKnockoutStage(currentScores);
}
