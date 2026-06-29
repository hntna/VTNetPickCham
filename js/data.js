/* VTNet Pickleball Championship 2026 - Data & Config */

const CATEGORIES_CONFIG = {
  'doi_nam': {
    id: 'doi_nam',
    name: 'Nam A',
    groupsCount: 3,
    advanceRule: 'top2wc2', // Nhất nhì mỗi bảng + 2 hạng 3 tốt nhất → 8 đội tứ kết
    knockoutStart: 'qf_manual' // Admin cấu hình cặp tứ kết sau bốc thăm
  },
  'nam_nu_a': {
    id: 'nam_nu_a',
    name: 'Nam Nữ A',
    groupsCount: 1,
    advanceRule: 'top2',
    knockoutStart: 'none' // Không có knock-out, vòng bảng = kết quả cuối cùng
  },
  'nam_nu_b': {
    id: 'nam_nu_b',
    name: 'Nam Nữ B',
    groupsCount: 2,
    advanceRule: 'top2',
    knockoutStart: 'sf' // Nhất nhì mỗi bảng → bán kết
  }
};

let CURRENT_CATEGORY = 'doi_nam';

let TOURNAMENT = {
  name: "VTNet Pickleball Championship 2026",
  nameVi: "Giải Pickleball VTNet 2026",
  groups: {}
};

// Generate round-robin matches for N teams: C(N,2) matches
function generateGroupMatches(teams) {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push([teams[i], teams[j]]);
    }
  }
  return matches;
}

// Calculate standings for a group (supports any number of teams)
function calcStandings(groupNum, scores) {
  const teams = TOURNAMENT.groups[groupNum];
  if (!teams || teams.length === 0) return [];
  const matches = generateGroupMatches(teams);
  const stats = teams.map(t => ({ team: t, pts: 0, won: 0, lost: 0, sf: 0, sa: 0, played: 0 }));

  matches.forEach((m, idx) => {
    const key = groupNum + '-' + idx;
    const sc = scores.group ? scores.group[key] : null;
    if (!sc || sc.s1 === '' || sc.s2 === '' || sc.s1 == null || sc.s2 == null) return;
    const s1 = parseInt(sc.s1), s2 = parseInt(sc.s2);
    if (isNaN(s1) || isNaN(s2)) return;
    if (s1 === 0 && s2 === 0) return; // 0-0 = chưa đấu

    const t1 = stats.find(s => s.team.id === m[0].id);
    const t2 = stats.find(s => s.team.id === m[1].id);
    t1.sf += s1; t1.sa += s2; t1.played++;
    t2.sf += s2; t2.sa += s1; t2.played++;

    if (s1 > s2) { t1.pts++; t1.won++; t2.lost++; }
    else if (s2 > s1) { t2.pts++; t2.won++; t1.lost++; }
  });

  stats.sort((a, b) => b.pts - a.pts || (b.sf - b.sa) - (a.sf - a.sa) || b.sf - a.sf);
  return stats;
}

// Tính thành tích điều chỉnh của đội xếp thứ 3:
// Loại bỏ kết quả trận gặp đội xếp thứ 4 (để so sánh công bằng giữa các bảng)
function calcThirdPlaceAdjustedStats(groupNum, scores) {
  const fullStandings = calcStandings(groupNum, scores);
  if (fullStandings.length < 3) return null;

  const thirdTeam = fullStandings[2].team;
  const fourthTeam = fullStandings.length >= 4 ? fullStandings[3].team : null;

  const teams = TOURNAMENT.groups[groupNum];
  const matches = generateGroupMatches(teams);

  let pts = 0, won = 0, lost = 0, sf = 0, sa = 0, played = 0;

  matches.forEach((m, idx) => {
    const involves3rd = m[0].id === thirdTeam.id || m[1].id === thirdTeam.id;
    const involves4th = fourthTeam && (m[0].id === fourthTeam.id || m[1].id === fourthTeam.id);
    if (!involves3rd || involves4th) return; // bỏ qua trận không liên quan hoặc trận với đội 4

    const key = groupNum + '-' + idx;
    const sc = scores.group ? scores.group[key] : null;
    if (!sc || sc.s1 === '' || sc.s2 === '' || sc.s1 == null || sc.s2 == null) return;
    const s1 = parseInt(sc.s1), s2 = parseInt(sc.s2);
    if (isNaN(s1) || isNaN(s2) || (s1 === 0 && s2 === 0)) return;

    played++;
    if (m[0].id === thirdTeam.id) {
      sf += s1; sa += s2;
      if (s1 > s2) { pts++; won++; } else if (s2 > s1) { lost++; }
    } else {
      sf += s2; sa += s1;
      if (s2 > s1) { pts++; won++; } else if (s1 > s2) { lost++; }
    }
  });

  return { team: thirdTeam, pts, won, lost, sf, sa, played, fromGroup: groupNum };
}

function areAllGroupMatchesFinished(scores) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  for (let g = 1; g <= config.groupsCount; g++) {
    const teams = TOURNAMENT.groups[g] || [];
    const matches = generateGroupMatches(teams);
    for (let i = 0; i < matches.length; i++) {
      const matchKey = g + '-' + i;
      const sc = scores.group && scores.group[matchKey];
      if (!sc || sc.s1 == null || sc.s2 == null || sc.s1 === '' || sc.s2 === '') return false;
      if (parseInt(sc.s1) === 0 && parseInt(sc.s2) === 0) return false;
    }
  }
  return true;
}

// Xác định các đội vào vòng knock-out
function determineKnockoutTeams(scores) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const allStandings = {};
  const allFinished = areAllGroupMatchesFinished(scores);

  for (let g = 1; g <= config.groupsCount; g++) {
    allStandings[g] = calcStandings(g, scores);
  }

  if (config.advanceRule === 'top2wc2') {
    // Nhất nhì mỗi bảng (6 đội) + 2 hạng 3 tốt nhất (2 đội) → 8 đội tứ kết
    const direct = [];
    const potentialWC = [];

    for (let g = 1; g <= config.groupsCount; g++) {
      const st = allStandings[g];
      if (st[0]) direct.push({ ...st[0], fromGroup: g, koRank: 1 });
      if (st[1]) direct.push({ ...st[1], fromGroup: g, koRank: 2 });
      if (st[2]) {
        const adj = allFinished ? calcThirdPlaceAdjustedStats(g, scores) : null;
        potentialWC.push(adj ? { ...adj, fromGroup: g } : { ...st[2], fromGroup: g });
      }
    }

    if (!allFinished) {
      return { allStandings, direct: [], wildcards: [], koGroups: {} };
    }

    potentialWC.sort((a, b) => b.pts - a.pts || (b.sf - b.sa) - (a.sf - a.sa) || b.sf - a.sf);
    const wildcards = potentialWC.slice(0, 2).map(t => ({ ...t, koRank: 3 }));
    const wcGroups = new Set(wildcards.map(w => w.fromGroup));

    const koGroups = {};
    for (let g = 1; g <= config.groupsCount; g++) {
      const st = allStandings[g];
      const wc = wildcards.find(w => w.fromGroup === g);
      koGroups[g] = {
        first:  st[0] ? { ...st[0], fromGroup: g, koRank: 1 } : null,
        second: st[1] ? { ...st[1], fromGroup: g, koRank: 2 } : null,
        third:  wc || null,
        origGroup: g
      };
    }

    return { allStandings, direct, wildcards, koGroups };

  } else if (config.advanceRule === 'top2') {
    const koGroups = {};
    const direct = [];

    for (let g = 1; g <= config.groupsCount; g++) {
      const st = allStandings[g];
      const f = st[0] ? { ...st[0], fromGroup: g, koRank: 1 } : null;
      const s = st[1] ? { ...st[1], fromGroup: g, koRank: 2 } : null;
      if (f) direct.push(f);
      if (s) direct.push(s);
      koGroups[g] = { first: f, second: s, origGroup: g };
    }

    return { allStandings, direct, wildcards: [], koGroups };
  }

  return { allStandings, direct: [], wildcards: [], koGroups: {} };
}

// Xây dựng thông tin bracket (cho sf và final)
function buildKnockoutBracket(koGroups) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];

  if (config.knockoutStart === 'sf') {
    const g1 = koGroups[1] || {};
    const g2 = koGroups[2] || {};
    return {
      sfBase: [
        { label: 'Bán Kết 1', t1: g1.first, t2: g2.second },
        { label: 'Bán Kết 2', t1: g2.first, t2: g1.second }
      ]
    };
  }

  if (config.knockoutStart === 'final') {
    const g1 = koGroups[1] || {};
    return {
      finalDirect: { t1: g1.first, t2: g1.second }
    };
  }

  // qf_manual: admin tự cấu hình → không cần bracket tự động
  return {};
}

// Lấy người thắng trận knock-out (dùng với team objects)
function getMatchWinner(matchKey, t1, t2, scores, stage) {
  if (!t1 && t2) return t2;
  if (t1 && !t2) return t1;
  if (!t1 && !t2) return null;

  let sc;
  if (stage === 'final') {
    sc = scores.final;
  } else {
    const stageScores = scores[stage];
    if (!stageScores) return null;
    sc = stageScores[matchKey];
  }
  if (!sc || sc.s1 === '' || sc.s2 === '' || sc.s1 == null || sc.s2 == null) return null;

  const s1 = parseInt(sc.s1), s2 = parseInt(sc.s2);
  if (isNaN(s1) || isNaN(s2)) return null;
  if (s1 === 0 && s2 === 0) return null;
  return s1 > s2 ? t1 : (s2 > s1 ? t2 : null);
}

// Lấy tên người thắng trận (dùng với name strings - cho qf_manual)
function getNamedMatchWinner(key, t1Name, t2Name, scores, stage) {
  if (!t1Name && t2Name) return t2Name;
  if (t1Name && !t2Name) return t1Name;
  if (!t1Name && !t2Name) return null;

  let sc;
  if (stage === 'final') {
    sc = scores.final;
  } else {
    sc = scores[stage] ? scores[stage][key] : null;
  }
  if (!sc || sc.s1 == null || sc.s2 == null || sc.s1 === '' || sc.s2 === '') return null;

  const s1 = parseInt(sc.s1), s2 = parseInt(sc.s2);
  if (isNaN(s1) || isNaN(s2) || (s1 === 0 && s2 === 0)) return null;
  return s1 > s2 ? t1Name : (s2 > s1 ? t2Name : null);
}
