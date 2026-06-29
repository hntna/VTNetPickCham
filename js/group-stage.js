/* Group Stage Renderer */

function renderGroupStage(scores) {
  const container = document.getElementById('group-stage-content');
  if (!container) return;

  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  let html = '<div class="groups-grid">';
  for (let g = 1; g <= config.groupsCount; g++) {
    html += renderGroupCard(g, scores);
  }
  html += '</div>';

  // Sau vòng bảng: hiện danh sách đội vào vòng tiếp theo
  if (config.knockoutStart === 'qf_manual' || config.knockoutStart === 'sf') {
    // doi_nam / nam_nu_b: hiện 8 / 4 đội vào tứ kết / bán kết
    const result = determineKnockoutTeams(scores);
    html += renderQualifiedSection(result, config);
  } else if (config.knockoutStart === 'final') {
    // nam_nu_a: hiện kết quả nhất nhì ba luôn
    html += renderFinalResultInline(scores);
  }

  container.innerHTML = html;

  container.querySelectorAll('.matches-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      btn.nextElementSibling.classList.toggle('open');
    });
  });
}

/* ---- Kết quả Nhất / Nhì / Ba (dành cho nam_nu_a) ---- */

function renderFinalResultInline(scores) {
  const standings = calcStandings(1, scores);
  if (standings.length === 0) return '';

  const finalSc = scores.final;
  const hasFinal = finalSc && finalSc.s1 != null && finalSc.s2 != null
    && finalSc.s1 !== '' && finalSc.s2 !== ''
    && !(parseInt(finalSc.s1) === 0 && parseInt(finalSc.s2) === 0);

  const finalist1 = standings[0]; // #1 bảng
  const finalist2 = standings[1]; // #2 bảng
  const third     = standings[2]; // #3 bảng

  let champion = null, runnerUp = null;
  if (hasFinal && finalist1 && finalist2) {
    const s1 = parseInt(finalSc.s1), s2 = parseInt(finalSc.s2);
    champion = s1 > s2 ? finalist1 : (s2 > s1 ? finalist2 : null);
    runnerUp = champion === finalist1 ? finalist2 : finalist1;
  }

  let html = `
    <div class="qualified-section" style="margin-top:24px;">
      <h3 class="qualified-title">🏆 Kết Quả Chung Kết</h3>`;

  if (!hasFinal) {
    html += `<div style="text-align:center;padding:24px 16px;color:var(--gray-500);">`;
    if (finalist1 && finalist2) {
      html += `<p style="font-size:15px;margin-bottom:8px;">⚔️ <strong>${finalist1.team.name}</strong> vs <strong>${finalist2.team.name}</strong></p>`;
      html += `<p style="font-size:13px;">⏳ Chờ kết quả chung kết...</p>`;
    } else {
      html += `<p>⏳ Chờ hoàn tất vòng bảng...</p>`;
    }
    html += `</div>`;
  } else {
    html += `<div style="display:flex;flex-direction:column;gap:12px;max-width:480px;margin:16px auto 0;">`;

    if (champion) {
      html += `
        <div style="display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#FEF3C7,#FDE68A);border-radius:14px;padding:16px 20px;border:2px solid #F59E0B;box-shadow:0 4px 16px rgba(245,158,11,0.2);">
          <span style="font-size:32px;line-height:1;">🥇</span>
          <div style="flex:1;">
            <div style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Vô Địch</div>
            <div style="font-size:16px;font-weight:800;color:#78350F;">${champion.team.name}</div>
          </div>
          <span style="font-size:18px;font-weight:900;color:#92400E;">${finalSc.s1} – ${finalSc.s2}</span>
        </div>`;
    }

    if (runnerUp) {
      html += `
        <div style="display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#F1F5F9,#E2E8F0);border-radius:14px;padding:16px 20px;border:2px solid #94A3B8;">
          <span style="font-size:32px;line-height:1;">🥈</span>
          <div style="flex:1;">
            <div style="font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Á Quân</div>
            <div style="font-size:16px;font-weight:700;color:#334155;">${runnerUp.team.name}</div>
          </div>
        </div>`;
    }

    if (third) {
      html += `
        <div style="display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#FFF7ED,#FFEDD5);border-radius:14px;padding:16px 20px;border:2px solid #FB923C;">
          <span style="font-size:32px;line-height:1;">🥉</span>
          <div style="flex:1;">
            <div style="font-size:11px;color:#9A3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Hạng Ba</div>
            <div style="font-size:16px;font-weight:700;color:#7C2D12;">${third.team.name}</div>
          </div>
        </div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

/* ---- Group card ---- */

function renderGroupCard(groupNum, scores) {
  const teams = TOURNAMENT.groups[groupNum];

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

  const matches  = generateGroupMatches(teams);
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
          <th>#</th><th>Đội / Team</th><th>Tr</th><th>T</th><th>B</th><th>HS</th><th>Đ</th>
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
    const diff    = s.sf - s.sa;
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
    const sc  = scores.group ? scores.group[key] : null;
    const s1  = sc ? sc.s1 : null;
    const s2  = sc ? sc.s2 : null;
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
