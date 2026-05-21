/* Admin Controller - All matches per round */

let adminScores = { group: {}, ko: {}, qf: {}, sf: {}, final: null };

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();

  // Login form
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';
    if (!FIREBASE_READY) { errEl.textContent = 'Firebase chưa cấu hình!'; errEl.style.display = 'block'; return; }
    firebaseAuth.signInWithEmailAndPassword(email, password)
      .catch(err => { errEl.textContent = 'Lỗi: ' + err.message; errEl.style.display = 'block'; });
  });

  document.getElementById('logout-btn').addEventListener('click', () => firebaseAuth.signOut());
  document.getElementById('round-select').addEventListener('change', renderRoundMatches);

  if (FIREBASE_READY && firebaseAuth) {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        document.getElementById('admin-email').textContent = user.email;
        populateRoundSelect();
      } else {
        document.getElementById('admin-login-section').style.display = 'flex';
        document.getElementById('admin-dashboard').style.display = 'none';
      }
    });
  }

  listenScores(scores => {
    adminScores = scores || { group: {}, ko: {}, qf: {}, sf: {}, final: null };
    if (!adminScores.group) adminScores.group = {};
    if (!adminScores.ko) adminScores.ko = {};
    if (!adminScores.qf) adminScores.qf = {};
    if (!adminScores.sf) adminScores.sf = {};
    renderRoundMatches();
  });
});

function populateRoundSelect() {
  const sel = document.getElementById('round-select');
  sel.innerHTML = '<option value="">-- Chọn vòng đấu / Select Round --</option>';
  for (let g = 1; g <= 6; g++) sel.innerHTML += `<option value="group-${g}">Bảng ${g} / Group ${g}</option>`;
  sel.innerHTML += '<option value="ko">Vòng 1/16</option><option value="qf">Tứ Kết / Quarter Finals</option>';
  sel.innerHTML += '<option value="sf">Bán Kết / Semi Finals</option><option value="final">Chung Kết / Final</option>';
}

function renderRoundMatches() {
  const container = document.getElementById('matches-container');
  const roundVal = document.getElementById('round-select').value;
  if (!container || !roundVal) { if (container) container.innerHTML = ''; return; }

  let html = '';

  if (roundVal.startsWith('group-')) {
    const g = parseInt(roundVal.split('-')[1]);
    const teams = TOURNAMENT.groups[g];
    const matches = generateGroupMatches(teams);
    html += `<h3 style="text-align:center;margin-bottom:16px;color:var(--primary)">🏓 Bảng ${g} - ${matches.length} trận</h3>`;
    matches.forEach((m, idx) => {
      const key = g + '-' + idx;
      const sc = adminScores.group[key];
      html += matchInputCard(m[0].name, m[1].name, 'group', key, sc, 11);
    });
  } else if (roundVal === 'ko') {
    const result = determineKnockoutTeams(adminScores);
    const bracket = buildKnockoutBracket(result.koGroups);
    html += '<h3 style="text-align:center;margin-bottom:16px;color:var(--primary)">🔥 Vòng 1/16 - 8 trận</h3>';
    bracket.round16.forEach((m, idx) => {
      const t1n = m.t1 ? m.t1.team.name : 'BYE';
      const t2n = m.t2 ? m.t2.team.name : 'BYE';
      const sc = adminScores.ko['' + idx];
      html += matchInputCard(t1n, t2n, 'ko', '' + idx, sc, 99);
    });
  } else if (roundVal === 'qf') {
    html += '<h3 style="text-align:center;margin-bottom:16px;color:var(--blue)">🏆 Tứ Kết - 4 trận</h3>';
    for (let i = 0; i < 4; i++) {
      const sc = adminScores.qf['' + i];
      html += matchInputCard('Đội thắng', 'Đội thắng', 'qf', '' + i, sc, 99);
    }
  } else if (roundVal === 'sf') {
    html += '<h3 style="text-align:center;margin-bottom:16px;color:#8B5CF6">🏅 Bán Kết - 2 trận</h3>';
    for (let i = 0; i < 2; i++) {
      const sc = adminScores.sf['' + i];
      html += matchInputCard('Đội thắng', 'Đội thắng', 'sf', '' + i, sc, 99);
    }
  } else if (roundVal === 'final') {
    html += '<h3 style="text-align:center;margin-bottom:16px;color:var(--gold)">🏆 Chung Kết</h3>';
    const sc = adminScores.final;
    html += matchInputCard('Đội thắng BK1', 'Đội thắng BK2', 'final', 'final', sc, 99);
  }

  html += `<button class="btn btn-primary" style="margin-top:20px" onclick="saveAllMatches()">💾 Lưu Tất Cả / Save All</button>`;
  container.innerHTML = html;
}

function matchInputCard(team1, team2, stage, key, sc, maxScore) {
  const s1 = sc ? (sc.s1 != null ? sc.s1 : '') : '';
  const s2 = sc ? (sc.s2 != null ? sc.s2 : '') : '';
  const isBye = team1 === 'BYE' || team2 === 'BYE';
  return `
    <div class="admin-match-card ${isBye ? 'bye' : ''}" data-stage="${stage}" data-key="${key}">
      <div class="admin-match-teams">
        <div class="admin-match-team">${team1}</div>
        <div class="admin-match-score-row">
          <input type="number" class="score-input score-s1" min="0" max="${maxScore}" value="${s1}" placeholder="0" ${isBye ? 'disabled' : ''}>
          <span class="score-vs">-</span>
          <input type="number" class="score-input score-s2" min="0" max="${maxScore}" value="${s2}" placeholder="0" ${isBye ? 'disabled' : ''}>
        </div>
        <div class="admin-match-team">${team2}</div>
      </div>
      <button class="btn-save-one" onclick="saveOneMatch(this)" title="Lưu trận này">💾</button>
    </div>`;
}

function saveOneMatch(btn) {
  const card = btn.closest('.admin-match-card');
  const stage = card.dataset.stage;
  const key = card.dataset.key;
  const s1 = card.querySelector('.score-s1').value;
  const s2 = card.querySelector('.score-s2').value;
  if (s1 === '' || s2 === '') { showToast('Nhập đủ tỷ số!', 'error'); return; }

  const realStage = stage === 'final' ? 'final' : stage;
  saveScore(realStage, key, parseInt(s1), parseInt(s2))
    .then(() => { showToast('✅ Đã lưu!', 'success'); card.style.borderColor = 'var(--green)'; })
    .catch(err => showToast('❌ ' + err, 'error'));
}

function saveAllMatches() {
  const cards = document.querySelectorAll('.admin-match-card:not(.bye)');
  let promises = [];
  let hasError = false;

  cards.forEach(card => {
    const stage = card.dataset.stage;
    const key = card.dataset.key;
    const s1 = card.querySelector('.score-s1').value;
    const s2 = card.querySelector('.score-s2').value;
    if (s1 === '' || s2 === '') return;

    const realStage = stage === 'final' ? 'final' : stage;
    promises.push(
      saveScore(realStage, key, parseInt(s1), parseInt(s2))
        .then(() => { card.style.borderColor = 'var(--green)'; })
        .catch(() => { hasError = true; card.style.borderColor = '#991B1B'; })
    );
  });

  if (promises.length === 0) { showToast('Chưa nhập tỷ số nào!', 'error'); return; }

  Promise.all(promises).then(() => {
    showToast(hasError ? '⚠️ Một số trận bị lỗi' : `✅ Đã lưu ${promises.length} trận!`, hasError ? 'error' : 'success');
  });
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}
