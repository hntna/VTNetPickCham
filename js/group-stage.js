/* Group Stage Renderer */

function renderGroupStage(scores) {
  const container = document.getElementById('group-stage-content');
  if (!container) return;

  let html = '<div class="groups-grid">';
  const maxGroups = CATEGORIES_CONFIG[CURRENT_CATEGORY].groupsCount;
  for (let g = 1; g <= maxGroups; g++) {
    html += renderGroupCard(g, scores);
  }
  html += '</div>';
  container.innerHTML = html;

  // Attach toggle events
  container.querySelectorAll('.matches-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      btn.nextElementSibling.classList.toggle('open');
    });
  });
}

function renderGroupCard(groupNum, scores) {
  const teams = TOURNAMENT.groups[groupNum];

  // Chưa có đội
  if (!teams || teams.length === 0) {
    return `
      <div class="group-card" id="group-${groupNum}">
        <div class="group-card__header">
          <h3 class="group-card__title">🎾 Bảng ${groupNum}</h3>
        </div>
        <div class="group-card__body">
          <p style="text-align:center;color:var(--gray-500);padding:20px 0;">Chưa có dữ liệu đội</p>
        </div>
      </div>`;
  }

  const matches = generateGroupMatches(teams);
  const standings = calcStandings(groupNum, scores);

  return `
    <div class="group-card" id="group-${groupNum}">
      <div class="group-card__header">
        <h3 class="group-card__title">🎾 Bảng ${groupNum}</h3>
        <span class="group-card__badge">Round Robin</span>
      </div>
      <div class="group-card__body">
        ${renderStandingsTable(standings, groupNum)}
        <button class="matches-toggle" aria-label="Toggle matches">
          <span class="arrow">▶</span> Kết quả chi tiết / Match Details
        </button>
        <div class="matches-list">
          ${renderMatchList(matches, groupNum, scores)}
        </div>
      </div>
    </div>`;
}

function renderStandingsTable(standings, groupNum) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  let html = `
    <table class="standings">
      <thead>
        <tr>
          <th>#</th>
          <th>Đội / Team</th>
          <th>Tr</th>
          <th>T</th>
          <th>B</th>
          <th>HS</th>
          <th>Đ</th>
        </tr>
      </thead>
      <tbody>`;

  standings.forEach((s, idx) => {
    const rank = idx + 1;
    let rowClass = '';
    if (config.advanceRule === 'top2wc2') {
      rowClass = rank <= 2 ? 'qualified' : rank === 3 ? 'wildcard' : '';
    } else if (config.advanceRule === 'top2') {
      rowClass = rank <= 2 ? 'qualified' : '';
    }
    const diff = s.sf - s.sa;
    const diffStr = diff > 0 ? '+' + diff : diff.toString();

    html += `
      <tr class="${rowClass}" data-team-id="${s.team.id}">
        <td><span class="rank-badge rank-${rank}">${rank}</span></td>
        <td>${s.team.name}</td>
        <td>${s.played}</td>
        <td>${s.won}</td>
        <td>${s.lost}</td>
        <td>${s.played > 0 ? diffStr : '-'}</td>
        <td><strong>${s.pts}</strong></td>
      </tr>`;
  });

  html += '</tbody></table>';
  return html;
}

function renderMatchList(matches, groupNum, scores) {
  let html = '';
  matches.forEach((m, idx) => {
    const key = groupNum + '-' + idx;
    const sc = scores.group ? scores.group[key] : null;
    const s1 = sc ? sc.s1 : null;
    const s2 = sc ? sc.s2 : null;
    const hasScore = s1 != null && s2 != null && s1 !== '' && s2 !== ''
      && !(parseInt(s1) === 0 && parseInt(s2) === 0);

    let scoreHtml;
    if (hasScore) {
      const n1 = parseInt(s1), n2 = parseInt(s2);
      scoreHtml = `<span class="${n1 > n2 ? 'winner' : ''}">${n1}</span><span class="vs">-</span><span class="${n2 > n1 ? 'winner' : ''}">${n2}</span>`;
    } else {
      scoreHtml = '<span class="pending">-</span><span class="vs">vs</span><span class="pending">-</span>';
    }

    html += `
      <div class="match-item" data-match="${key}">
        <div class="match-team">${m[0].p1} / ${m[0].p2}</div>
        <div class="match-score">${scoreHtml}</div>
        <div class="match-team right">${m[1].p1} / ${m[1].p2}</div>
      </div>`;
  });
  return html;
}
