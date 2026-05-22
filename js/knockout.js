/* Knockout Stage Renderer */

let currentKoTab = 'round16';

function renderKnockoutStage(scores) {
  const container = document.getElementById('knockout-stage-content');
  if (!container) return;

  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const result = determineKnockoutTeams(scores);
  const bracket = buildKnockoutBracket(result.koGroups);

  let r16 = [], qf = [], sf = [], finalMatch = null;

  if (config.knockoutStart === 'ko') {
    r16 = bracket.round16.map((m, i) => ({
      ...m, key: '' + i, winner: getMatchWinner('' + i, m.t1, m.t2, scores, 'ko')
    }));
    qf = [
      { label: 'Trận 9',  t1: r16[0].winner, t2: r16[4].winner, key: '0' },
      { label: 'Trận 10', t1: r16[1].winner, t2: r16[5].winner, key: '1' },
      { label: 'Trận 11', t1: r16[2].winner, t2: r16[6].winner, key: '2' },
      { label: 'Trận 12', t1: r16[3].winner, t2: r16[7].winner, key: '3' }
    ].map(m => ({ ...m, winner: getMatchWinner(m.key, m.t1, m.t2, scores, 'qf') }));
    sf = [
      { label: 'Trận 13', t1: qf[0].winner, t2: qf[2].winner, key: '0' },
      { label: 'Trận 14', t1: qf[1].winner, t2: qf[3].winner, key: '1' }
    ].map(m => ({ ...m, winner: getMatchWinner(m.key, m.t1, m.t2, scores, 'sf') }));
  } else if (config.knockoutStart === 'qf') {
    qf = bracket.qfBase.map((m, i) => ({
      ...m, key: '' + i, winner: getMatchWinner('' + i, m.t1, m.t2, scores, 'qf')
    }));
    sf = [
      { label: 'Bán Kết 1', t1: qf[0].winner, t2: qf[2].winner, key: '0' },
      { label: 'Bán Kết 2', t1: qf[1].winner, t2: qf[3].winner, key: '1' }
    ].map(m => ({ ...m, winner: getMatchWinner(m.key, m.t1, m.t2, scores, 'sf') }));
  } else if (config.knockoutStart === 'sf') {
    sf = bracket.sfBase.map((m, i) => ({
      ...m, key: '' + i, winner: getMatchWinner('' + i, m.t1, m.t2, scores, 'sf')
    }));
  }

  finalMatch = {
    label: 'Chung Kết / Final', t1: sf[0].winner, t2: sf[1].winner, key: 'final'
  };
  finalMatch.winner = getMatchWinner('final', finalMatch.t1, finalMatch.t2, scores, 'final');

  // Render tabs + content
  let html = renderKoTabs(config);
  
  if (config.knockoutStart === 'ko') {
    const r16Content = renderKoRound(r16, scores, 'ko', 'round16') + renderQualifiedSection(result, config);
    html += '<div id="ko-round16" class="ko-round-content">' + r16Content + '</div>';
  }
  
  if (['ko', 'qf'].includes(config.knockoutStart)) {
    const qfContent = renderKoRound(qf, scores, 'qf', 'qf') + (config.knockoutStart === 'qf' ? renderQualifiedSection(result, config) : '');
    html += '<div id="ko-qf" class="ko-round-content" style="display:none">' + qfContent + '</div>';
  }

  const sfContent = renderKoRound(sf, scores, 'sf', 'sf') + (config.knockoutStart === 'sf' ? renderQualifiedSection(result, config) : '');
  html += '<div id="ko-sf" class="ko-round-content" style="display:none">' + sfContent + '</div>';
  html += '<div id="ko-final" class="ko-round-content" style="display:none">' + renderKoFinal(finalMatch, scores) + '</div>';

  container.innerHTML = html;
  
  if (config.knockoutStart === 'sf' && ['round16', 'qf'].includes(currentKoTab)) currentKoTab = 'sf';
  if (config.knockoutStart === 'qf' && currentKoTab === 'round16') currentKoTab = 'qf';
  if (!document.getElementById('ko-' + currentKoTab)) currentKoTab = config.knockoutStart === 'ko' ? 'round16' : config.knockoutStart;
  
  setActiveKoTab(currentKoTab);
  attachKoTabEvents();
}

function renderKoTabs(config) {
  let html = '<div class="ko-tabs">';
  if (config.knockoutStart === 'ko') html += '<button class="ko-tab" data-tab="round16">1/16</button>';
  if (['ko', 'qf'].includes(config.knockoutStart)) html += '<button class="ko-tab" data-tab="qf">Tứ Kết</button>';
  html += '<button class="ko-tab" data-tab="sf">Bán Kết</button>';
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

function renderKoRound(matches, scores, stage, roundClass) {
  const labelClass = roundClass === 'round16' ? 'round16' : roundClass === 'qf' ? 'qf' : 'sf';
  let html = '<div class="ko-matches">';
  matches.forEach(m => {
    html += renderKoMatchCard(m, scores, stage, labelClass);
  });
  html += '</div>';
  return html;
}

function renderKoMatchCard(match, scores, stage, labelClass) {
  const { label, t1, t2, key, winner } = match;
  const sc = stage === 'final' ? (scores.final || null) : (scores[stage] ? scores[stage][key] : null);
  const s1 = sc ? sc.s1 : null;
  const s2 = sc ? sc.s2 : null;
  const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== '' && !(parseInt(s1) === 0 && parseInt(s2) === 0);

  const isBye1 = !t1 && t2;
  const isBye2 = t1 && !t2;
  const t1Name = t1 ? t1.team.name : (isBye1 ? 'BYE' : 'Chưa xác định');
  const t2Name = t2 ? t2.team.name : (isBye2 ? 'BYE' : 'Chưa xác định');

  let row1Class = '', row2Class = '';
  if (hasScore && winner) {
    row1Class = winner === t1 ? 'winner-row' : 'loser-row';
    row2Class = winner === t2 ? 'winner-row' : 'loser-row';
  }
  if (isBye1) row1Class = 'bye-row';
  if (isBye2) row2Class = 'bye-row';

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
  let html = '<div class="ko-matches">';
  html += renderKoMatchCard(match, scores, 'final', 'final-label');
  html += '</div>';

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

function renderQualifiedSection(result, config) {
  const { koGroups } = result;
  const numTeams = config.knockoutStart === 'ko' ? 16 : (config.knockoutStart === 'qf' ? 8 : 4);
  
  if (Object.keys(koGroups).length === 0) {
    return `
      <div class="qualified-section">
        <h3 class="qualified-title" style="color: var(--gray-500); text-align: center;">⏳ Đang chờ hoàn tất Vòng Bảng...</h3>
      </div>`;
  }

  let html = `
    <div class="qualified-section">
      <h3 class="qualified-title">🎯 ${numTeams} Đội Vào Vòng Knock-out / Qualified Teams</h3>
      <div class="groups-grid" style="gap: 16px; margin-top: 16px;">`;

  for (let g = 1; g <= config.groupsCount; g++) {
    let t1 = null, t2 = null, t3 = null;
    let label = '';
    
    for (const key of Object.keys(koGroups)) {
      if (koGroups[key].origGroup == g) {
        t1 = koGroups[key].first;
        t2 = koGroups[key].second;
        t3 = koGroups[key].third;
        label = key;
        break;
      }
    }

    if (!t1 && !t2 && !t3) continue;

    html += `<div style="background: var(--white); border: 1px solid var(--gray-200); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
               <h4 style="color: var(--gray-800); font-size: 16px; border-bottom: 1px solid var(--gray-100); padding-bottom: 8px; margin-bottom: 4px;">🏓 Bảng ${g} ${config.advanceRule === 'top3' ? '<span style="font-size:12px; color:var(--gray-500); font-weight:normal">(Nhánh KO ' + label + ')</span>' : ''}</h4>`;
    
    if (t1) {
      html += `<div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color: var(--gray-800);"><span class="qualified-badge badge-direct" style="min-width: 65px; text-align: center;">#1</span> <span style="flex:1;">${t1.team.name}</span></div>`;
    }
    if (t2) {
      html += `<div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color: var(--gray-800);"><span class="qualified-badge badge-direct" style="min-width: 65px; text-align: center;">#2</span> <span style="flex:1;">${t2.team.name}</span></div>`;
    }
    if (t3) {
      html += `<div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color: var(--gray-800);"><span class="qualified-badge badge-wildcard" style="min-width: 65px; text-align: center;">Top 3</span> <span style="flex:1;">${t3.team.name}</span></div>`;
    }
    html += `</div>`;
  }

  html += '</div></div>';
  return html;
}
