/* Admin Controller */

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupAdminUI();
});

function setupAdminUI() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Round selector
  const roundSelect = document.getElementById('round-select');
  if (roundSelect) roundSelect.addEventListener('change', populateMatchSelect);

  // Save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', handleSaveScore);

  // Auth state observer
  if (FIREBASE_READY && firebaseAuth) {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) showDashboard(user);
      else showLogin();
    });
  }

  // Listen for scores to build match options
  listenScores(scores => {
    window._adminScores = scores;
    populateMatchSelect();
  });
}

function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  if (!FIREBASE_READY) {
    errEl.textContent = 'Firebase chưa được cấu hình!';
    errEl.style.display = 'block';
    return;
  }

  firebaseAuth.signInWithEmailAndPassword(email, password)
    .then(() => {})
    .catch(err => {
      errEl.textContent = 'Đăng nhập thất bại: ' + err.message;
      errEl.style.display = 'block';
    });
}

function handleLogout() {
  if (firebaseAuth) firebaseAuth.signOut();
}

function showDashboard(user) {
  document.getElementById('admin-login-section').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  document.getElementById('admin-email').textContent = user.email;
  populateRoundSelect();
}

function showLogin() {
  document.getElementById('admin-login-section').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function populateRoundSelect() {
  const select = document.getElementById('round-select');
  select.innerHTML = '<option value="">-- Chọn vòng đấu --</option>';
  for (let g = 1; g <= 6; g++) {
    select.innerHTML += `<option value="group-${g}">Vòng Bảng - Bảng ${g}</option>`;
  }
  select.innerHTML += '<option value="ko">Vòng 1/16</option>';
  select.innerHTML += '<option value="qf">Tứ Kết</option>';
  select.innerHTML += '<option value="sf">Bán Kết</option>';
  select.innerHTML += '<option value="final">Chung Kết</option>';
}

function populateMatchSelect() {
  const roundVal = document.getElementById('round-select').value;
  const matchSelect = document.getElementById('match-select');
  const scoreSection = document.getElementById('score-section');
  matchSelect.innerHTML = '<option value="">-- Chọn trận --</option>';
  scoreSection.style.display = 'none';

  if (!roundVal) return;
  const scores = window._adminScores || {};

  if (roundVal.startsWith('group-')) {
    const g = parseInt(roundVal.split('-')[1]);
    const teams = TOURNAMENT.groups[g];
    const matches = generateGroupMatches(teams);
    matches.forEach((m, idx) => {
      matchSelect.innerHTML += `<option value="group|${g}-${idx}">${m[0].p1}/${m[0].p2} vs ${m[1].p1}/${m[1].p2}</option>`;
    });
  } else if (roundVal === 'ko') {
    const result = determineKnockoutTeams(scores);
    const bracket = buildKnockoutBracket(result.koGroups);
    bracket.round16.forEach((m, idx) => {
      const t1n = m.t1 ? m.t1.team.p1 + '/' + m.t1.team.p2 : 'BYE';
      const t2n = m.t2 ? m.t2.team.p1 + '/' + m.t2.team.p2 : 'BYE';
      matchSelect.innerHTML += `<option value="ko|${idx}">${m.label}: ${t1n} vs ${t2n}</option>`;
    });
  } else if (roundVal === 'qf') {
    for (let i = 0; i < 4; i++) {
      matchSelect.innerHTML += `<option value="qf|${i}">Trận ${9 + i}</option>`;
    }
  } else if (roundVal === 'sf') {
    matchSelect.innerHTML += '<option value="sf|0">Trận 13</option>';
    matchSelect.innerHTML += '<option value="sf|1">Trận 14</option>';
  } else if (roundVal === 'final') {
    matchSelect.innerHTML += '<option value="final|final">Trận 15 - Chung Kết</option>';
  }

  matchSelect.onchange = () => {
    const val = matchSelect.value;
    if (!val) { scoreSection.style.display = 'none'; return; }
    scoreSection.style.display = 'block';

    // Pre-fill existing scores
    const [stage, key] = val.split('|');
    let sc = null;
    if (stage === 'group') {
      sc = scores.group ? scores.group[key] : null;
    } else if (stage === 'final') {
      sc = scores.final || null;
    } else {
      sc = scores[stage] ? scores[stage][key] : null;
    }
    document.getElementById('score1').value = sc ? (sc.s1 != null ? sc.s1 : '') : '';
    document.getElementById('score2').value = sc ? (sc.s2 != null ? sc.s2 : '') : '';

    // Show team names
    updateScoreLabels(val, scores);
  };
}

function updateScoreLabels(val, scores) {
  const [stage, key] = val.split('|');
  const label1 = document.getElementById('team1-label');
  const label2 = document.getElementById('team2-label');

  if (stage === 'group') {
    const parts = key.split('-');
    const g = parseInt(parts[0]);
    const idx = parseInt(parts[1]);
    const teams = TOURNAMENT.groups[g];
    const matches = generateGroupMatches(teams);
    const m = matches[idx];
    label1.textContent = m[0].p1 + ' / ' + m[0].p2;
    label2.textContent = m[1].p1 + ' / ' + m[1].p2;
  } else {
    label1.textContent = 'Đội 1';
    label2.textContent = 'Đội 2';
  }
}

function handleSaveScore() {
  const matchVal = document.getElementById('match-select').value;
  if (!matchVal) { showToast('Chọn trận trước!', 'error'); return; }

  const s1 = document.getElementById('score1').value;
  const s2 = document.getElementById('score2').value;
  if (s1 === '' || s2 === '') { showToast('Nhập đủ tỷ số!', 'error'); return; }

  const [stage, key] = matchVal.split('|');
  const realStage = stage === 'final' ? 'final' : stage;

  saveScore(realStage, key, parseInt(s1), parseInt(s2))
    .then(() => showToast('✅ Đã lưu thành công!', 'success'))
    .catch(err => showToast('❌ Lỗi: ' + err, 'error'));
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}
