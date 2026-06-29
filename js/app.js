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

  updateKnockoutTabVisibility(); // ẩn/hiện tab Knock-out theo thể thức

  listenTeams(teams => {
    TOURNAMENT.groups = teams || {};
    teamsLoaded = true;
    if (scoresLoaded) renderAll();
  });

  listenScores(scores => {
    currentScores = scores || { group: {}, ko: {}, qf: {}, sf: {}, final: null };
    if (!currentScores.group) currentScores.group = {};
    if (!currentScores.ko)    currentScores.ko    = {};
    if (!currentScores.qf)    currentScores.qf    = {};
    if (!currentScores.sf)    currentScores.sf    = {};
    scoresLoaded = true;
    if (teamsLoaded) renderAll();
  });
}

// Ẩn/hiện tab Knock-out dựa vào thể thức hiện tại
function updateKnockoutTabVisibility() {
  const config    = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const koTab     = document.querySelector('.main-tab[data-tab="knockout"]');
  const koSection = document.getElementById('knockout-section');
  if (!koTab) return;

  const hasNoKnockout = config.knockoutStart === 'none'; // nam_nu_a

  koTab.style.display = hasNoKnockout ? 'none' : '';

  // Nếu đang ở tab knockout mà chuyển sang thể thức không có knockout → về groups
  if (hasNoKnockout && currentMainTab === 'knockout') {
    currentMainTab = 'groups';
    document.querySelectorAll('.main-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === 'groups')
    );
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('groups-section')?.classList.add('active');
  }
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
  if (CATEGORIES_CONFIG[CURRENT_CATEGORY].knockoutStart !== 'none') {
    renderKnockoutStage(currentScores);
  }
}
