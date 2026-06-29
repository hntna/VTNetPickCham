/* Admin Controller */

// ======================================================
// Dữ liệu đội import từ file "Noi dung thi dau.xlsx"
// ======================================================
const IMPORT_DATA = {
  doi_nam: {
    1: [
      { id: '1-1', name: 'Sơn - Trung',       p1: 'Sơn',        p2: 'Trung' },
      { id: '1-2', name: 'Hiếu - Hoàng',      p1: 'Hiếu',       p2: 'Hoàng' },
      { id: '1-3', name: 'Hùng - Tiến',       p1: 'Hùng',       p2: 'Tiến' },
      { id: '1-4', name: 'Tiến Anh - Tú',     p1: 'Tiến Anh',   p2: 'Tú' }
    ],
    2: [
      { id: '2-1', name: 'Nam - Ngọc',           p1: 'Nam',    p2: 'Ngọc' },
      { id: '2-2', name: 'Linh - Quân',          p1: 'Linh',   p2: 'Quân' },
      { id: '2-3', name: 'Đoàn - Phương (bé)',   p1: 'Đoàn',   p2: 'Phương (bé)' },
      { id: '2-4', name: 'Hưng - Tuân',          p1: 'Hưng',   p2: 'Tuân' }
    ],
    3: [
      { id: '3-1', name: 'Tuấn Anh - Tuấn',   p1: 'Tuấn Anh', p2: 'Tuấn' },
      { id: '3-2', name: 'Trường - Kiên',      p1: 'Trường',   p2: 'Kiên' },
      { id: '3-3', name: 'Tấn - Thái (bé)',    p1: 'Tấn',      p2: 'Thái (bé)' }
    ]
  },
  nam_nu_a: {
    1: [
      { id: '1-1', name: 'Sơn - Trang',          p1: 'Sơn',       p2: 'Trang' },
      { id: '1-2', name: 'Trường - Huyền',        p1: 'Trường',    p2: 'Huyền' },
      { id: '1-3', name: 'Linh - Minh',           p1: 'Linh',      p2: 'Minh' },
      { id: '1-4', name: 'Tuấn Anh - Nhung',      p1: 'Tuấn Anh', p2: 'Nhung' },
      { id: '1-5', name: 'Đoàn - Hạnh',           p1: 'Đoàn',     p2: 'Hạnh' },
      { id: '1-6', name: 'Nam - Tâm',             p1: 'Nam',       p2: 'Tâm' }
    ]
  },
  nam_nu_b: {
    1: [
      { id: '1-1', name: 'Thế Anh - Hạnh',        p1: 'Thế Anh',        p2: 'Hạnh' },
      { id: '1-2', name: 'Phương (lớn) - Dung',   p1: 'Phương (lớn)',   p2: 'Dung' },
      { id: '1-3', name: 'Tú - Thái',             p1: 'Tú',             p2: 'Thái' },
      { id: '1-4', name: 'Tiến - Lý',             p1: 'Tiến',           p2: 'Lý' }
    ],
    2: [
      { id: '2-1', name: 'Khánh - Diệp',          p1: 'Khánh',       p2: 'Diệp' },
      { id: '2-2', name: 'Đức - Tươi',            p1: 'Đức',         p2: 'Tươi' },
      { id: '2-3', name: 'Thắng - Huyền My',      p1: 'Thắng',       p2: 'Huyền My' },
      { id: '2-4', name: 'Hiếu (pi) - Nga',       p1: 'Hiếu (pi)',   p2: 'Nga' },
      { id: '2-5', name: 'Huệ - Thành',           p1: 'Huệ',         p2: 'Thành' }
    ]
  }
};

let adminScores = { group: {}, ko: {}, qf: {}, sf: {}, final: null };
let adminTeams = null;
let scoresLoaded = false;
let teamsLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupAdminTabs();

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

  const categorySelect = document.getElementById('admin-category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', e => {
      CURRENT_CATEGORY = e.target.value;
      populateRoundSelect();
      loadAdminData();
    });
  }

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

  loadAdminData();
});

function loadAdminData() {
  teamsLoaded = false;
  scoresLoaded = false;

  listenTeams(teams => {
    adminTeams = teams || {};
    TOURNAMENT.groups = adminTeams;
    teamsLoaded = true;
    if (scoresLoaded) {
      renderRoundMatches();
      renderTeamsManager();
    }
  });

  listenScores(scores => {
    adminScores = scores || { group: {}, ko: {}, qf: {}, sf: {}, final: null };
    if (!adminScores.group) adminScores.group = {};
    if (!adminScores.ko)    adminScores.ko    = {};
    if (!adminScores.qf)    adminScores.qf    = {};
    if (!adminScores.sf)    adminScores.sf    = {};
    scoresLoaded = true;
    if (teamsLoaded) {
      renderRoundMatches();
      renderTeamsManager();
    }
  });
}

function setupAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      const section = document.getElementById(tab.dataset.tab + '-section');
      if (section) section.classList.add('active');
    });
  });
}

function populateRoundSelect() {
  const sel = document.getElementById('round-select');
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  sel.innerHTML = `<option value="">-- Chọn vòng đấu --</option>`;
  sel.innerHTML += `<option value="all-groups">🏅 Vòng Bảng (${config.groupsCount} bảng)</option>`;

  if (config.knockoutStart === 'qf_manual') {
    sel.innerHTML += `<option value="qf">🏆 Tứ Kết (cấu hình thủ công)</option>`;
    sel.innerHTML += `<option value="sf">🥈 Bán Kết</option>`;
  } else if (config.knockoutStart === 'sf') {
    sel.innerHTML += `<option value="sf">🥈 Bán Kết</option>`;
  }

  if (config.knockoutStart !== 'none') {
    sel.innerHTML += `<option value="final">🏆 Chung Kết / Final</option>`;
  }
}

/* -------------------------------------------------- */
/* Render matches for selected round                  */
/* -------------------------------------------------- */
function renderRoundMatches() {
  const container = document.getElementById('matches-container');
  const roundVal = document.getElementById('round-select').value;
  if (!container || !roundVal) { if (container) container.innerHTML = ''; return; }

  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  let html = '';

  if (roundVal === 'all-groups') {
    for (let g = 1; g <= config.groupsCount; g++) {
      const teams = TOURNAMENT.groups[g];
      if (!teams || teams.length === 0) {
        html += `<div style="padding:16px;text-align:center;color:var(--gray-500);">Bảng ${g}: Chưa có đội</div>`;
        continue;
      }
      const matches = generateGroupMatches(teams);
      html += `<div style="background:var(--gray-50);padding:16px;margin-bottom:24px;border-radius:12px;border:1px solid #ddd;">`;
      html += `<h3 style="text-align:center;margin-bottom:16px;color:var(--primary)">🏓 Bảng ${g} (${teams.length} đội · ${matches.length} trận)</h3>`;
      matches.forEach((m, idx) => {
        const key = g + '-' + idx;
        const sc = adminScores.group[key];
        html += matchInputCard(m[0].name, m[1].name, 'group', key, sc, 11);
      });
      html += `</div>`;
    }

  } else if (roundVal === 'qf') {
    html += `<h3 style="text-align:center;margin-bottom:8px;color:var(--primary)">🏆 Tứ Kết · Admin cấu hình cặp đấu</h3>`;
    html += renderQualifiedTeamsForAdmin();
    html += `<p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;text-align:center;">Nhập tên đội (theo kết quả bốc thăm) và tỷ số cho 4 trận tứ kết.</p>`;
    
    const qfTeams = getQualifiedTeamsList();
    
    for (let i = 0; i < 4; i++) {
      const sc = adminScores.qf ? adminScores.qf['' + i] : null;
      html += qfManualCard(i, sc, qfTeams);
    }

  } else if (roundVal === 'sf') {
    html += `<h3 style="text-align:center;margin-bottom:16px;color:#8B5CF6">🥈 Bán Kết - 2 trận</h3>`;
    if (config.knockoutStart === 'qf_manual') {
      // Hiển thị tên đội từ QF winners
      const qfData = adminScores.qf || {};
      for (let i = 0; i < 2; i++) {
        const qf1 = buildQfEntry(qfData['' + (i * 2)]);
        const qf2 = buildQfEntry(qfData['' + (i * 2 + 1)]);
        const t1n = getQfEntryWinner(qf1) || '?';
        const t2n = getQfEntryWinner(qf2) || '?';
        const sc = adminScores.sf ? adminScores.sf['' + i] : null;
        html += matchInputCard(t1n, t2n, 'sf', '' + i, sc, 99);
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const sc = adminScores.sf ? adminScores.sf['' + i] : null;
        html += matchInputCard('Đội thắng BK' + (i * 2 + 1), 'Đội thắng BK' + (i * 2 + 2), 'sf', '' + i, sc, 99);
      }
    }

  } else if (roundVal === 'final') {
    html += `<h3 style="text-align:center;margin-bottom:16px;color:var(--gold)">🏆 Chung Kết</h3>`;
    const sc = adminScores.final;
    html += matchInputCard('Đội thắng BK1', 'Đội thắng BK2', 'final', 'final', sc, 99);
  }

  if (roundVal !== 'qf' || config.knockoutStart !== 'qf_manual') {
    html += `<button class="btn btn-primary" style="margin-top:20px" onclick="saveAllMatches()">💾 Lưu Tất Cả / Save All</button>`;
  }
  container.innerHTML = html;
}

// Helper: build a simple qf entry object for winner calculation
function buildQfEntry(sc) {
  if (!sc) return null;
  return { t1Name: sc.t1_name, t2Name: sc.t2_name, s1: sc.s1, s2: sc.s2 };
}

function getQfEntryWinner(entry) {
  if (!entry || !entry.t1Name || !entry.t2Name) return null;
  if (entry.s1 == null || entry.s2 == null) return null;
  const s1 = parseInt(entry.s1), s2 = parseInt(entry.s2);
  if (isNaN(s1) || isNaN(s2) || (s1 === 0 && s2 === 0)) return null;
  return s1 > s2 ? entry.t1Name : (s2 > s1 ? entry.t2Name : null);
}

function renderQualifiedTeamsForAdmin() {
  const result = determineKnockoutTeams(adminScores);
  const { koGroups, wildcards } = result;
  if (!koGroups || Object.keys(koGroups).length === 0) {
    return `<div style="text-align:center;color:var(--gray-500);padding:12px;margin-bottom:12px;background:var(--gray-50);border-radius:8px;">⏳ Vòng bảng chưa hoàn tất — chưa xác định được 8 đội tứ kết</div>`;
  }

  let html = `<div style="background:var(--gray-50);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;">
    <strong>8 Đội vào Tứ Kết (theo thứ hạng vòng bảng):</strong><br><br>`;
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  for (let g = 1; g <= config.groupsCount; g++) {
    const kg = koGroups[g] || {};
    html += `<em>Bảng ${g}:</em> `;
    const parts = [];
    if (kg.first)  parts.push(`<span style="color:var(--green)">#1 ${kg.first.team.name}</span>`);
    if (kg.second) parts.push(`<span style="color:var(--green)">#2 ${kg.second.team.name}</span>`);
    if (kg.third)  parts.push(`<span style="color:orange">Vé vớt: ${kg.third.team.name}</span>`);
    html += parts.join(' · ') + '<br>';
  }
  html += '</div>';
  return html;
}

function getQualifiedTeamsList() {
  const result = determineKnockoutTeams(adminScores);
  const { koGroups, wildcards } = result;
  let teams = [];
  if (koGroups) {
    Object.values(koGroups).forEach(kg => {
      if (kg.first) teams.push(kg.first.team.name);
      if (kg.second) teams.push(kg.second.team.name);
    });
  }
  if (wildcards) {
    wildcards.forEach(wc => teams.push(wc.team.name));
  }
  return teams;
}

/* ---- QF Manual card ---- */

function qfManualCard(idx, sc, qfTeams) {
  const t1n = sc ? (sc.t1_name || '') : '';
  const t2n = sc ? (sc.t2_name || '') : '';
  const s1  = sc ? (sc.s1 != null ? sc.s1 : '') : '';
  const s2  = sc ? (sc.s2 != null ? sc.s2 : '') : '';

  const renderOptions = (selected) => {
    let opts = `<option value="">-- Chọn đội --</option>`;
    if (qfTeams && qfTeams.length > 0) {
      qfTeams.forEach(t => {
        const isSel = (t === selected) ? 'selected' : '';
        opts += `<option value="${t}" ${isSel}>${t}</option>`;
      });
      if (selected && !qfTeams.includes(selected)) {
        opts += `<option value="${selected}" selected>${selected}</option>`;
      }
    } else {
      if (selected) opts += `<option value="${selected}" selected>${selected}</option>`;
    }
    return opts;
  };

  return `
    <div class="admin-match-card" data-stage="qf_manual" data-key="${idx}">
      <div class="admin-match-teams">
        <select class="form-input team-name-1" style="font-size:12px;padding:6px 8px;margin-bottom:4px;">
          ${renderOptions(t1n)}
        </select>
        <div class="admin-match-score-row">
          <input type="number" class="score-input score-s1" min="0" max="99" value="${s1}" placeholder="0">
          <span class="score-vs">-</span>
          <input type="number" class="score-input score-s2" min="0" max="99" value="${s2}" placeholder="0">
        </div>
        <select class="form-input team-name-2" style="font-size:12px;padding:6px 8px;margin-top:4px;">
          ${renderOptions(t2n)}
        </select>
      </div>
      <button class="btn-save-one" onclick="saveQfManualMatch(this)" title="Lưu trận TK${idx + 1}">💾</button>
    </div>`;
}

function saveQfManualMatch(btn) {
  const card = btn.closest('.admin-match-card');
  const key  = card.dataset.key;
  const t1_name = card.querySelector('.team-name-1').value.trim();
  const t2_name = card.querySelector('.team-name-2').value.trim();
  const s1val   = card.querySelector('.score-s1').value;
  const s2val   = card.querySelector('.score-s2').value;

  const data = { t1_name, t2_name };
  if (s1val !== '' && s2val !== '') {
    data.s1 = parseInt(s1val);
    data.s2 = parseInt(s2val);
  }

  if (!FIREBASE_READY) { showToast('Firebase chưa kết nối!', 'error'); return; }
  firebaseDb.ref(CURRENT_CATEGORY + '/scores/qf/' + key).set(data)
    .then(() => { showToast('✅ Đã lưu Tứ Kết ' + (parseInt(key) + 1), 'success'); card.style.borderColor = 'var(--green)'; })
    .catch(err => showToast('❌ ' + err, 'error'));
}

/* ---- Standard match card ---- */

function matchInputCard(team1, team2, stage, key, sc, maxScore) {
  const s1 = sc ? (sc.s1 != null ? sc.s1 : '') : '';
  const s2 = sc ? (sc.s2 != null ? sc.s2 : '') : '';
  return `
    <div class="admin-match-card" data-stage="${stage}" data-key="${key}">
      <div class="admin-match-teams">
        <div class="admin-match-team">${team1}</div>
        <div class="admin-match-score-row">
          <input type="number" class="score-input score-s1" min="0" max="${maxScore}" value="${s1}" placeholder="0">
          <span class="score-vs">-</span>
          <input type="number" class="score-input score-s2" min="0" max="${maxScore}" value="${s2}" placeholder="0">
        </div>
        <div class="admin-match-team">${team2}</div>
      </div>
      <button class="btn-save-one" onclick="saveOneMatch(this)" title="Lưu trận này">💾</button>
    </div>`;
}

function saveOneMatch(btn) {
  const card = btn.closest('.admin-match-card');
  const stage = card.dataset.stage;

  if (stage === 'qf_manual') { saveQfManualMatch(btn); return; }

  const key = card.dataset.key;
  const s1  = card.querySelector('.score-s1').value;
  const s2  = card.querySelector('.score-s2').value;
  if (s1 === '' || s2 === '') { showToast('Nhập đủ tỷ số!', 'error'); return; }

  saveScore(stage === 'final' ? 'final' : stage, key, parseInt(s1), parseInt(s2))
    .then(() => { showToast('✅ Đã lưu!', 'success'); card.style.borderColor = 'var(--green)'; })
    .catch(err => showToast('❌ ' + err, 'error'));
}

function saveAllMatches() {
  const cards = document.querySelectorAll('.admin-match-card:not([data-stage="qf_manual"])');
  let promises = [];
  let hasError = false;

  cards.forEach(card => {
    const stage = card.dataset.stage;
    const key   = card.dataset.key;
    const s1    = card.querySelector('.score-s1').value;
    const s2    = card.querySelector('.score-s2').value;
    if (s1 === '' || s2 === '') return;

    promises.push(
      saveScore(stage === 'final' ? 'final' : stage, key, parseInt(s1), parseInt(s2))
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

/* ======================================================
   Team Management
   ====================================================== */

function renderTeamsManager() {
  const container = document.getElementById('teams-container');
  if (!container) return;

  let html = '';
  const maxGroups = CATEGORIES_CONFIG[CURRENT_CATEGORY].groupsCount;
  for (let g = 1; g <= maxGroups; g++) {
    const teams = adminTeams[g] || [];
    html += `
      <div style="background:var(--gray-50);padding:16px;margin-bottom:16px;border-radius:12px;border:1px solid #ddd;">
        <h3 style="color:var(--primary);margin-bottom:12px;">🏓 Bảng ${g} (${teams.length} đội)</h3>
        <div id="team-list-g${g}">`;
    teams.forEach((t, i) => { html += teamRowHtml(g, i, t.name); });
    html += `</div>
        <button class="btn btn-outline" style="margin-top:8px;padding:4px 12px;font-size:13px;" onclick="addTeamRow(${g})">+ Thêm Đội</button>
      </div>`;
  }
  container.innerHTML = html;
}

function teamRowHtml(g, i, name) {
  return `
    <div class="team-row" data-group="${g}" data-idx="${i}">
      <input type="text" class="form-input team-input" value="${name || ''}" placeholder="Nguyễn Văn A / Trần Thị B" onchange="updateTeamData(${g}, ${i}, this.value)">
      <button class="btn-delete" onclick="deleteTeamRow(${g}, ${i})" title="Xoá">🗑</button>
    </div>`;
}

function updateTeamData(g, idx, val) {
  if (!adminTeams[g]) adminTeams[g] = [];
  if (!adminTeams[g][idx]) adminTeams[g][idx] = { id: `${g}-${idx + 1}`, name: val, p1: '', p2: '' };
  adminTeams[g][idx].name = val;
  const parts = val.split(/\s*-\s*/).map(s => s.trim());
  adminTeams[g][idx].p1 = parts[0] || '';
  adminTeams[g][idx].p2 = parts[1] || '';
}

function addTeamRow(g) {
  if (!adminTeams[g]) adminTeams[g] = [];
  adminTeams[g].push({ id: `${g}-${adminTeams[g].length + 1}`, name: '', p1: '', p2: '' });
  renderTeamsManager();
}

function deleteTeamRow(g, idx) {
  if (confirm(`Bạn có chắc muốn xoá đội này ở Bảng ${g}?`)) {
    adminTeams[g].splice(idx, 1);
    renderTeamsManager();
  }
}

function saveAllTeams() {
  const maxGroups = CATEGORIES_CONFIG[CURRENT_CATEGORY].groupsCount;
  for (let g = 1; g <= maxGroups; g++) {
    if (adminTeams[g]) {
      adminTeams[g] = adminTeams[g].filter(t => t.name.trim() !== '');
      adminTeams[g].forEach((t, i) => { t.id = `${g}-${i + 1}`; });
    }
  }

  saveTeams(adminTeams)
    .then(() => {
      TOURNAMENT.groups = adminTeams;
      showToast('✅ Đã lưu danh sách đội thành công!', 'success');
      renderTeamsManager();
    })
    .catch(err => showToast('❌ Lỗi: ' + err, 'error'));
}

/* ======================================================
   Import từ Excel
   ====================================================== */

function downloadExcelTemplate() {
  const wsData = [
    ['Bảng', 'Người chơi 1', 'Người chơi 2'],
    [1, 'Nguyễn Văn A', 'Trần Thị B'],
    [1, 'Lê Văn C', 'Hoàng Thị D'],
    [2, 'Phạm Văn E', 'Ngô Thị F']
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachDoi');
  XLSX.writeFile(wb, 'Template_DanhSachDoi.xlsx');
}

function importExcelTeams() {
  const fileInput = document.getElementById('import-excel-file');
  if (!fileInput.files.length) { showToast('Vui lòng chọn file Excel!', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const newTeams = {};
      let importedCount = 0;
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || row.length === 0) continue;
        let [bang, p1, p2] = row;
        if (bang == null) continue;
        const g = parseInt(String(bang).match(/\d+/)?.[0]);
        if (!g || g < 1 || g > CATEGORIES_CONFIG[CURRENT_CATEGORY].groupsCount) continue;
        if (!newTeams[g]) newTeams[g] = [];
        const name = (p1 && p2) ? `${p1} - ${p2}` : (p1 || p2 || '');
        if (!name) continue;
        newTeams[g].push({ id: `${g}-${newTeams[g].length + 1}`, name, p1: String(p1 || '').trim(), p2: String(p2 || '').trim() });
        importedCount++;
      }
      if (importedCount === 0) { showToast('Không tìm thấy dữ liệu!', 'error'); return; }
      adminTeams = newTeams;
      renderTeamsManager();
      fileInput.value = '';
      showToast(`✅ Đã import ${importedCount} đội! Bấm "Lưu lên Server".`, 'success');
    } catch (err) {
      console.error(err);
      showToast('❌ Lỗi đọc file Excel!', 'error');
    }
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
}

/* ======================================================
   Reset & Import tất cả dữ liệu từ file Excel Giải Q2
   ====================================================== */

async function importAllTeamsFromExcel() {
  if (!FIREBASE_READY) { showToast('Firebase chưa kết nối!', 'error'); return; }
  if (!confirm('⚠️ XÓA TOÀN BỘ dữ liệu cũ (đội + kết quả) và import đội mới từ file Excel Giải Q2?\n\nHành động này KHÔNG THỂ hoàn tác!')) return;

  try {
    showToast('⏳ Đang xóa dữ liệu cũ...', 'success');

    // Xóa toàn bộ các path cũ
    await Promise.all([
      firebaseDb.ref('doi_nu').set(null),
      firebaseDb.ref('nam_nu').set(null),
      firebaseDb.ref('doi_nam').set(null),
      firebaseDb.ref('nam_nu_a').set(null),
      firebaseDb.ref('nam_nu_b').set(null)
    ]);

    // Import đội cho 3 thể thức
    for (const [cat, teams] of Object.entries(IMPORT_DATA)) {
      await firebaseDb.ref(cat + '/teams').set(teams);
    }

    showToast('✅ Import thành công! 3 thể thức đã được cập nhật.', 'success');
    loadAdminData();
    renderRoundMatches();
  } catch (e) {
    console.error(e);
    showToast('❌ Lỗi: ' + (e.message || e), 'error');
  }
}
