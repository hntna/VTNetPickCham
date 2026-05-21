/* Knockout Stage Renderer */

let currentKoTab = 'round16';

function renderKnockoutStage(scores) {
  const container = document.getElementById('knockout-stage-content');
  if (!container) return;

  const result = determineKnockoutTeams(scores);
  const bracket = buildKnockoutBracket(result.koGroups);

  // Build full bracket with winners
  const r16 = bracket.round16.map((m, i) => ({
    ...m, key: '' + i,
    winner: getMatchWinner('' + i, m.t1, m.t2, scores, 'ko')
  }));

  const qf = [
    { label: 'Trận 9',  t1: r16[0].winner, t2: r16[4].winner, key: '0' },
    { label: 'Trận 10', t1: r16[1].winner, t2: r16[5].winner, key: '1' },
    { label: 'Trận 11', t1: r16[2].winner, t2: r16[6].winner, key: '2' },
    { label: 'Trận 12', t1: r16[3].winner, t2: r16[7].winner, key: '3' }
  ].map(m => ({ ...m, winner: getMatchWinner(m.key, m.t1, m.t2, scores, 'qf') }));

  const sf = [
    { label: 'Trận 13', t1: qf[0].winner, t2: qf[2].winner, key: '0' },
    { label: 'Trận 14', t1: qf[1].winner, t2: qf[3].winner, key: '1' }
  ].map(m => ({ ...m, winner: getMatchWinner(m.key, m.t1, m.t2, scores, 'sf') }));

  const finalMatch = {
    label: 'Trận 15 - Chung Kết / Final', t1: sf[0].winner, t2: sf[1].winner, key: 'final'
  };
  finalMatch.winner = getMatchWinner('final', finalMatch.t1, finalMatch.t2, scores, 'final');

  // Render tabs + content
  let html = renderKoTabs();
  // Qualified section lives inside the 1/16 tab so the layout is clean
  const r16Content = renderKoRound(r16, scores, 'ko', 'round16') + renderQualifiedSection(result);
  html += '<div id="ko-round16" class="ko-round-content">' + r16Content + '</div>';
  html += '<div id="ko-qf" class="ko-round-content" style="display:none">' + renderKoRound(qf, scores, 'qf', 'qf') + '</div>';
  html += '<div id="ko-sf" class="ko-round-content" style="display:none">' + renderKoRound(sf, scores, 'sf', 'sf') + '</div>';
  html += '<div id="ko-final" class="ko-round-content" style="display:none">' + renderKoFinal(finalMatch, scores) + '</div>';

  container.innerHTML = html;
  setActiveKoTab(currentKoTab);
  attachKoTabEvents();
}

function renderKoTabs() {
  return `
    <div class="ko-tabs">
      <button class="ko-tab active" data-tab="round16">1/16</button>
      <button class="ko-tab" data-tab="qf">Tứ Kết</button>
      <button class="ko-tab" data-tab="sf">Bán Kết</button>
      <button class="ko-tab" data-tab="final">Chung Kết</button>
    </div>`;
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
  const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== '';

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

function renderQualifiedSection(result) {
  const { koGroups } = result;
  let html = `
    <div class="qualified-section">
      <h3 class="qualified-title">🎯 16 Đội Vào Vòng Knock-out / Qualified Teams</h3>
      <div class="qualified-grid">`;

  ['A', 'B', 'C', 'D', 'E', 'F'].forEach(label => {
    const g = koGroups[label];
    if (!g) return;
    const groupInfo = g.origGroup ? ` (Bảng ${g.origGroup})` : '';

    if (g.first) {
      html += `<div class="qualified-item direct">
        <span class="qualified-badge badge-direct">KO ${label} - #1${groupInfo}</span>
        <span>${g.first.team.name}</span></div>`;
    }
    if (g.second) {
      html += `<div class="qualified-item direct">
        <span class="qualified-badge badge-direct">KO ${label} - #2${groupInfo}</span>
        <span>${g.second.team.name}</span></div>`;
    }
    if (g.third) {
      html += `<div class="qualified-item wildcard">
        <span class="qualified-badge badge-wildcard">KO ${label} - Top 3${groupInfo}</span>
        <span>${g.third.team.name}</span></div>`;
    }
  });

  html += '</div></div>';
  return html;
}
