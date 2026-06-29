/* Knockout Stage Renderer */

let currentKoTab = 'qf';

function renderKnockoutStage(scores) {
  const container = document.getElementById('knockout-stage-content');
  if (!container) return;

  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const result = determineKnockoutTeams(scores);
  const bracket = buildKnockoutBracket(result.koGroups);

  let html = renderKoTabs(config);

  if (config.knockoutStart === 'qf_manual') {
    // doi_nam: QF (admin cấu hình) → SF → Final
    const qfMatches = buildQfManualMatches(scores);
    const sfMatches = buildSfFromQfManual(qfMatches, scores);
    const finalMatch = buildFinalFromQfManual(sfMatches, scores);

    html += '<div id="ko-qf" class="ko-round-content">';
    html += renderNamedRound(qfMatches, 'qf');
    html += '</div>';

    html += '<div id="ko-sf" class="ko-round-content" style="display:none">';
    html += renderNamedRound(sfMatches, 'sf');
    html += '</div>';

    html += '<div id="ko-final" class="ko-round-content" style="display:none">';
    html += renderNamedFinal(finalMatch);
    html += '</div>';

  } else if (config.knockoutStart === 'sf') {
    // nam_nu_b: SF → Final
    const sf = bracket.sfBase.map((m, i) => ({
      ...m, key: '' + i,
      winner: getMatchWinner('' + i, m.t1, m.t2, scores, 'sf')
    }));
    const finalMatch = {
      label: 'Chung Kết',
      t1: sf[0] ? sf[0].winner : null,
      t2: sf[1] ? sf[1].winner : null,
      key: 'final'
    };
    finalMatch.winner = getMatchWinner('final', finalMatch.t1, finalMatch.t2, scores, 'final');

    html += '<div id="ko-sf" class="ko-round-content">';
    html += renderKoRound(sf, scores, 'sf', 'sf');
    html += '</div>';

    html += '<div id="ko-final" class="ko-round-content" style="display:none">';
    html += renderKoFinal(finalMatch, scores);
    html += '</div>';

  } else if (config.knockoutStart === 'final') {
    // nam_nu_a: kết quả hiện ở vòng bảng, không cần knockout tab
    container.innerHTML = '';
    return;
  }

  container.innerHTML = html;

  // Khởi tạo tab active
  const defaultTab = config.knockoutStart === 'qf_manual' ? 'qf'
    : config.knockoutStart === 'sf' ? 'sf' : 'final';
  if (!document.getElementById('ko-' + currentKoTab)) currentKoTab = defaultTab;
  setActiveKoTab(currentKoTab);
  attachKoTabEvents();
}

/* ---- Build data for qf_manual ---- */

function buildQfManualMatches(scores) {
  const qfData = scores.qf || {};
  return [0, 1, 2, 3].map(i => {
    const sc = qfData['' + i] || {};
    return {
      label: 'Tứ Kết ' + (i + 1),
      key: '' + i,
      t1Name: sc.t1_name || null,
      t2Name: sc.t2_name || null,
      s1: sc.s1 != null ? sc.s1 : null,
      s2: sc.s2 != null ? sc.s2 : null
    };
  });
}

function getQfWinnerName(match) {
  if (!match || !match.t1Name || !match.t2Name) return null;
  if (match.s1 == null || match.s2 == null) return null;
  const s1 = parseInt(match.s1), s2 = parseInt(match.s2);
  if (isNaN(s1) || isNaN(s2) || (s1 === 0 && s2 === 0)) return null;
  return s1 > s2 ? match.t1Name : (s2 > s1 ? match.t2Name : null);
}

function buildSfFromQfManual(qfMatches, scores) {
  const sfData = scores.sf || {};
  const w = [0, 1, 2, 3].map(i => getQfWinnerName(qfMatches[i]));
  return [
    {
      label: 'Bán Kết 1', key: '0',
      t1Name: w[0], t2Name: w[2],
      s1: sfData['0'] ? sfData['0'].s1 : null,
      s2: sfData['0'] ? sfData['0'].s2 : null
    },
    {
      label: 'Bán Kết 2', key: '1',
      t1Name: w[1], t2Name: w[3],
      s1: sfData['1'] ? sfData['1'].s1 : null,
      s2: sfData['1'] ? sfData['1'].s2 : null
    }
  ];
}

function buildFinalFromQfManual(sfMatches, scores) {
  const finalData = scores.final || {};
  const sfWinner = (m) => {
    if (!m.t1Name || !m.t2Name) return null;
    return getNamedMatchWinner(m.key, m.t1Name, m.t2Name,
      { sf: { [m.key]: { s1: m.s1, s2: m.s2 } } }, 'sf');
  };
  return {
    label: 'Chung Kết', key: 'final',
    t1Name: sfWinner(sfMatches[0]),
    t2Name: sfWinner(sfMatches[1]),
    s1: finalData.s1 != null ? finalData.s1 : null,
    s2: finalData.s2 != null ? finalData.s2 : null
  };
}

/* ---- Tab controls ---- */

function renderKoTabs(config) {
  let html = '<div class="ko-tabs">';
  if (config.knockoutStart === 'qf_manual') html += '<button class="ko-tab" data-tab="qf">Tứ Kết</button>';
  if (['qf_manual', 'sf'].includes(config.knockoutStart)) html += '<button class="ko-tab" data-tab="sf">Bán Kết</button>';
  html += '<button class="ko-tab" data-tab="final">Chung Kết</button>';
  html += '</div>';
  return html;
}

function attachKoTabEvents() {
  document.querySelectorAll('.ko-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentKoTab = tab.dataset.tab;
      setActiveKoTab(currentKoTab);
    });
  });
}

function setActiveKoTab(tabName) {
  document.querySelectorAll('.ko-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.ko-round-content').forEach(c => c.style.display = 'none');
  const active = document.getElementById('ko-' + tabName);
  if (active) active.style.display = 'block';
}

/* ---- Render: name-based matches (qf_manual) ---- */

function renderNamedRound(matches, labelClass) {
  let html = '<div class="ko-matches">';
  matches.forEach(m => { html += renderNamedMatchCard(m, labelClass); });
  html += '</div>';
  return html;
}

function renderNamedMatchCard(m, labelClass) {
  const { label, t1Name, t2Name, s1, s2 } = m;
  const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== ''
    && !(parseInt(s1) === 0 && parseInt(s2) === 0);
  const n1 = hasScore ? parseInt(s1) : null;
  const n2 = hasScore ? parseInt(s2) : null;

  const t1Display = t1Name || 'Chưa xác định';
  const t2Display = t2Name || 'Chưa xác định';
  const row1Class = hasScore ? (n1 > n2 ? 'winner-row' : 'loser-row') : '';
  const row2Class = hasScore ? (n2 > n1 ? 'winner-row' : 'loser-row') : '';

  return `
    <div class="ko-match-card">
      <div class="ko-match-label ${labelClass}">${label}</div>
      <div class="ko-match-body">
        <div class="ko-team-row ${row1Class}">
          <div class="ko-team-name">${t1Display}</div>
          <div class="ko-team-score ${hasScore && n1 > n2 ? 'win-score' : ''}">${hasScore ? s1 : '-'}</div>
        </div>
        <div class="ko-vs">VS</div>
        <div class="ko-team-row ${row2Class}">
          <div class="ko-team-name">${t2Display}</div>
          <div class="ko-team-score ${hasScore && n2 > n1 ? 'win-score' : ''}">${hasScore ? s2 : '-'}</div>
        </div>
      </div>
    </div>`;
}

function renderNamedFinal(m) {
  const { t1Name, t2Name, s1, s2 } = m;
  const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== ''
    && !(parseInt(s1) === 0 && parseInt(s2) === 0);
  const n1 = hasScore ? parseInt(s1) : null;
  const n2 = hasScore ? parseInt(s2) : null;
  const winnerName = hasScore ? (n1 > n2 ? t1Name : (n2 > n1 ? t2Name : null)) : null;

  let html = '<div class="ko-matches">' + renderNamedMatchCard(m, 'final-label') + '</div>';
  if (winnerName) {
    html += `
      <div class="champion-banner">
        <div class="champion-banner__icon">🏆</div>
        <div class="champion-banner__label">Nhà Vô Địch / Champion</div>
        <div class="champion-banner__name">${winnerName}</div>
      </div>`;
  }
  return html;
}

/* ---- Render: object-based matches (nam_nu_a, nam_nu_b) ---- */

function renderKoRound(matches, scores, stage, roundClass) {
  let html = '<div class="ko-matches">';
  matches.forEach(m => { html += renderKoMatchCard(m, scores, stage, roundClass); });
  html += '</div>';
  return html;
}

function renderKoMatchCard(match, scores, stage, labelClass) {
  const { label, t1, t2, key } = match;
  const sc = stage === 'final' ? (scores.final || null) : (scores[stage] ? scores[stage][key] : null);
  const s1 = sc ? sc.s1 : null;
  const s2 = sc ? sc.s2 : null;
  const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== ''
    && !(parseInt(s1) === 0 && parseInt(s2) === 0);

  const t1Name = t1 ? t1.team.name : 'Chưa xác định';
  const t2Name = t2 ? t2.team.name : 'Chưa xác định';
  const winner = match.winner;

  let row1Class = '', row2Class = '';
  if (hasScore && winner) {
    row1Class = winner === t1 ? 'winner-row' : 'loser-row';
    row2Class = winner === t2 ? 'winner-row' : 'loser-row';
  }

  return `
    <div class="ko-match-card">
      <div class="ko-match-label ${labelClass}">${label}</div>
      <div class="ko-match-body">
        <div class="ko-team-row ${row1Class}">
          <div class="ko-team-name">${t1Name}</div>
          <div class="ko-team-score ${hasScore && parseInt(s1) > parseInt(s2) ? 'win-score' : ''}">${hasScore ? s1 : '-'}</div>
        </div>
        <div class="ko-vs">VS</div>
        <div class="ko-team-row ${row2Class}">
          <div class="ko-team-name">${t2Name}</div>
          <div class="ko-team-score ${hasScore && parseInt(s2) > parseInt(s1) ? 'win-score' : ''}">${hasScore ? s2 : '-'}</div>
        </div>
      </div>
    </div>`;
}

function renderKoFinal(match, scores) {
  let html = '<div class="ko-matches">' + renderKoMatchCard(match, scores, 'final', 'final-label') + '</div>';
  if (match.winner) {
    html += `
      <div class="champion-banner">
        <div class="champion-banner__icon">🏆</div>
        <div class="champion-banner__label">Nhà Vô Địch / Champion</div>
        <div class="champion-banner__name">${match.winner.team.name}</div>
      </div>`;
  }
  return html;
}

/* ---- Qualified teams section ---- */

function renderQualifiedSection(result, config) {
  const { koGroups } = result;
  const numTeams = config.knockoutStart === 'qf_manual' ? 8
    : config.knockoutStart === 'sf' ? 4 : 2;

  if (!koGroups || Object.keys(koGroups).length === 0) {
    return `
      <div class="qualified-section">
        <h3 class="qualified-title" style="color:var(--gray-500);text-align:center;">⏳ Đang chờ hoàn tất Vòng Bảng...</h3>
      </div>`;
  }

  let html = `
    <div class="qualified-section">
      <h3 class="qualified-title">🎯 ${numTeams} Đội Vào Vòng Knock-out</h3>
      <div class="groups-grid" style="gap:16px;margin-top:16px;">`;

  for (let g = 1; g <= config.groupsCount; g++) {
    const kg = koGroups[g];
    if (!kg) continue;
    const { first: t1, second: t2, third: t3 } = kg;
    if (!t1 && !t2 && !t3) continue;

    html += `<div style="background:var(--white);border:1px solid var(--gray-200);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
               <h4 style="color:var(--gray-800);font-size:16px;border-bottom:1px solid var(--gray-100);padding-bottom:8px;margin-bottom:4px;">🏓 Bảng ${g}</h4>`;
    if (t1) html += `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--gray-800);"><span class="qualified-badge badge-direct" style="min-width:65px;text-align:center;">#1</span><span style="flex:1;">${t1.team.name}</span></div>`;
    if (t2) html += `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--gray-800);"><span class="qualified-badge badge-direct" style="min-width:65px;text-align:center;">#2</span><span style="flex:1;">${t2.team.name}</span></div>`;
    if (t3) html += `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--gray-800);"><span class="qualified-badge badge-wildcard" style="min-width:65px;text-align:center;">Vé Vớt</span><span style="flex:1;">${t3.team.name}</span></div>`;
    html += `</div>`;
  }

  html += '</div></div>';
  return html;
}
