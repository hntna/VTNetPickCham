/* VTNet Pickleball Championship 2026 - Team Data */

const DEFAULT_TEAMS = {
  1: [
    { id: "1-1", name: "Ngô Đại Dương / Hà Trọng Trường", p1: "Ngô Đại Dương", p2: "Hà Trọng Trường" },
    { id: "1-2", name: "Lê Văn Bình / Hoàng Xuân Hưng", p1: "Lê Văn Bình", p2: "Hoàng Xuân Hưng" },
    { id: "1-3", name: "Bùi Mạnh Linh / Dương Minh Thành", p1: "Bùi Mạnh Linh", p2: "Dương Minh Thành" },
    { id: "1-4", name: "Vũ Đình Thành / Nguyễn Văn Công", p1: "Vũ Đình Thành", p2: "Nguyễn Văn Công" }
  ],
  2: [
    { id: "2-1", name: "Phạm Ngọc Nhật Linh / Nguyễn Quang Long", p1: "Phạm Ngọc Nhật Linh", p2: "Nguyễn Quang Long" },
    { id: "2-2", name: "Nguyễn Tiến Đạt / Đặng Thái Sơn", p1: "Nguyễn Tiến Đạt", p2: "Đặng Thái Sơn" },
    { id: "2-3", name: "Trần Quang Minh / Nguyễn Minh Thuần", p1: "Trần Quang Minh", p2: "Nguyễn Minh Thuần" },
    { id: "2-4", name: "Đinh Thế Sơn / Nguyễn Công Định", p1: "Đinh Thế Sơn", p2: "Nguyễn Công Định" }
  ],
  3: [
    { id: "3-1", name: "Hồ Anh Dũng / Bùi Đức Lâm", p1: "Hồ Anh Dũng", p2: "Bùi Đức Lâm" },
    { id: "3-2", name: "Dương Đức Thành / Đặng Việt Hải", p1: "Dương Đức Thành", p2: "Đặng Việt Hải" },
    { id: "3-3", name: "Nguyễn Tuấn Dũng / Nguyễn Nhân Long", p1: "Nguyễn Tuấn Dũng", p2: "Nguyễn Nhân Long" },
    { id: "3-4", name: "Phạm Ngọc Thắng / Bùi Doãn Hải", p1: "Phạm Ngọc Thắng", p2: "Bùi Doãn Hải" }
  ],
  4: [
    { id: "4-1", name: "Bùi Văn Họa / Hoàng Công Tú", p1: "Bùi Văn Họa", p2: "Hoàng Công Tú" },
    { id: "4-2", name: "Phạm Tuấn Dương / Trần Minh Tiến", p1: "Phạm Tuấn Dương", p2: "Trần Minh Tiến" },
    { id: "4-3", name: "Nguyễn Tuấn Anh / Nghiêm Chu Hiếu", p1: "Nguyễn Tuấn Anh", p2: "Nghiêm Chu Hiếu" },
    { id: "4-4", name: "Nguyễn Khắc Phi / Đặng Đình Tài", p1: "Nguyễn Khắc Phi", p2: "Đặng Đình Tài" }
  ],
  5: [
    { id: "5-1", name: "Đặng Hoài Sơn / Trần Văn Luận", p1: "Đặng Hoài Sơn", p2: "Trần Văn Luận" },
    { id: "5-2", name: "An Văn Hưởng / Vũ Công Mạnh", p1: "An Văn Hưởng", p2: "Vũ Công Mạnh" },
    { id: "5-3", name: "Đào Đại Nghĩa / Lê Ngọc Nam", p1: "Đào Đại Nghĩa", p2: "Lê Ngọc Nam" },
    { id: "5-4", name: "Nguyễn Khải Hoàn / Vũ Viết Cường", p1: "Nguyễn Khải Hoàn", p2: "Vũ Viết Cường" }
  ],
  6: [
    { id: "6-1", name: "Trần Anh Dũng / Nguyễn Hồng Lĩnh", p1: "Trần Anh Dũng", p2: "Nguyễn Hồng Lĩnh" },
    { id: "6-2", name: "Nguyễn Tuấn Tú / Nguyễn Văn Hạnh", p1: "Nguyễn Tuấn Tú", p2: "Nguyễn Văn Hạnh" },
    { id: "6-3", name: "Đỗ Quang Huy / Nguyễn Văn Thạch", p1: "Đỗ Quang Huy", p2: "Nguyễn Văn Thạch" },
    { id: "6-4", name: "Trần Tuấn Trung / Ngô Hùng Cường", p1: "Trần Tuấn Trung", p2: "Ngô Hùng Cường" }
  ]
};

const CATEGORIES_CONFIG = {
  'doi_nam': {
    id: 'doi_nam',
    name: 'Đôi Nam',
    groupsCount: 6,
    advanceRule: 'top3', // Nhất nhì + vé vớt
    knockoutStart: 'ko' // 1/16
  },
  'doi_nu': {
    id: 'doi_nu',
    name: 'Đôi Nữ',
    groupsCount: 2,
    advanceRule: 'top2', // Nhất nhì
    knockoutStart: 'sf' // Bán kết
  },
  'nam_nu': {
    id: 'nam_nu',
    name: 'Đôi Nam Nữ',
    groupsCount: 4,
    advanceRule: 'top2', // Nhất nhì
    knockoutStart: 'qf' // Tứ kết
  }
};

let CURRENT_CATEGORY = 'doi_nam';

let TOURNAMENT = {
  name: "VTNet Pickleball Championship 2026",
  nameVi: "Giải Pickleball Đôi Nam VTNet 2026",
  groups: DEFAULT_TEAMS
};

// KO group labels: group 1→A, 2→B, etc.
const KO_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Generate round-robin matches for 4 teams (6 matches)
function generateGroupMatches(teams) {
  return [
    [teams[0], teams[1]], // match 0
    [teams[0], teams[2]], // match 1
    [teams[0], teams[3]], // match 2
    [teams[1], teams[2]], // match 3
    [teams[1], teams[3]], // match 4
    [teams[2], teams[3]]  // match 5
  ];
}

// Calculate standings for a group
function calcStandings(groupNum, scores) {
  const teams = TOURNAMENT.groups[groupNum];
  const matches = generateGroupMatches(teams);
  const stats = teams.map(t => ({ team: t, pts: 0, won: 0, lost: 0, sf: 0, sa: 0, played: 0 }));

  matches.forEach((m, idx) => {
    const key = groupNum + '-' + idx;
    const sc = scores.group ? scores.group[key] : null;
    if (!sc || sc.s1 === '' || sc.s2 === '' || sc.s1 == null || sc.s2 == null) return;
    const s1 = parseInt(sc.s1), s2 = parseInt(sc.s2);
    if (isNaN(s1) || isNaN(s2)) return;
    if (s1 === 0 && s2 === 0) return; // 0-0 means unplayed

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

// Determine 16 teams for knockout
function determineKnockoutTeams(scores) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const allStandings = {};
  const direct = [];
  const potentialWC = [];

  for (let g = 1; g <= config.groupsCount; g++) {
    const st = calcStandings(g, scores);
    allStandings[g] = st;
    if (st[0]) direct.push({ ...st[0], fromGroup: g, koRank: 1 });
    if (st[1]) direct.push({ ...st[1], fromGroup: g, koRank: 2 });
    if (config.advanceRule === 'top3' && st[2]) potentialWC.push({ ...st[2], fromGroup: g });
  }

  const koGroups = {};
  
  if (config.advanceRule === 'top3') {
    potentialWC.sort((a, b) => b.pts - a.pts || (b.sf - b.sa) - (a.sf - a.sa) || b.sf - a.sf);
    const wildcards = potentialWC.slice(0, 4).map(t => ({ ...t, koRank: 3 }));
    const wcGroupNums = wildcards.map(w => w.fromGroup).sort((a, b) => a - b);
    const nonWcGroupNums = [];
    for (let g = 1; g <= 6; g++) {
      if (!wcGroupNums.includes(g)) nonWcGroupNums.push(g);
    }
    ['A', 'B', 'C', 'D'].forEach((label, i) => {
      const g = wcGroupNums[i];
      if (!g) return;
      koGroups[label] = {
        first: direct.find(d => d.fromGroup === g && d.koRank === 1) || null,
        second: direct.find(d => d.fromGroup === g && d.koRank === 2) || null,
        third: wildcards.find(w => w.fromGroup === g) || null,
        origGroup: g
      };
    });
    ['E', 'F'].forEach((label, i) => {
      const g = nonWcGroupNums[i];
      if (!g) return;
      koGroups[label] = {
        first: direct.find(d => d.fromGroup === g && d.koRank === 1) || null,
        second: direct.find(d => d.fromGroup === g && d.koRank === 2) || null,
        third: null,
        origGroup: g
      };
    });
    return { allStandings, direct, wildcards, koGroups, wcGroupNums, nonWcGroupNums };
  } else {
    // top2 rule for 2 or 4 groups
    for (let g = 1; g <= config.groupsCount; g++) {
      koGroups[g] = {
        first: direct.find(d => d.fromGroup === g && d.koRank === 1) || null,
        second: direct.find(d => d.fromGroup === g && d.koRank === 2) || null,
        origGroup: g
      };
    }
    return { allStandings, direct, wildcards: [], koGroups };
  }
}

// Build knockout bracket matchups
function buildKnockoutBracket(koGroups) {
  const config = CATEGORIES_CONFIG[CURRENT_CATEGORY];
  const t = (group, rank) => {
    const g = koGroups[group];
    if (!g) return null;
    if (rank === 1) return g.first;
    if (rank === 2) return g.second;
    if (rank === 3) return g.third;
    return null;
  };

  if (config.knockoutStart === 'ko') {
    return {
      round16: [
        { label: 'Trận 1', t1: t('A', 1), t2: t('B', 3) },
        { label: 'Trận 2', t1: t('B', 1), t2: t('A', 3) },
        { label: 'Trận 3', t1: t('A', 2), t2: t('B', 2) },
        { label: 'Trận 4', t1: t('E', 1), t2: t('F', 2) },
        { label: 'Trận 5', t1: t('C', 1), t2: t('D', 3) },
        { label: 'Trận 6', t1: t('D', 1), t2: t('C', 3) },
        { label: 'Trận 7', t1: t('C', 2), t2: t('D', 2) },
        { label: 'Trận 8', t1: t('F', 1), t2: t('E', 2) }
      ]
    };
  } else if (config.knockoutStart === 'qf') {
    return {
      qfBase: [
        { label: 'Tứ Kết 1', t1: t(1, 1), t2: t(2, 2) },
        { label: 'Tứ Kết 2', t1: t(3, 1), t2: t(4, 2) },
        { label: 'Tứ Kết 3', t1: t(2, 1), t2: t(1, 2) },
        { label: 'Tứ Kết 4', t1: t(4, 1), t2: t(3, 2) }
      ]
    };
  } else if (config.knockoutStart === 'sf') {
    return {
      sfBase: [
        { label: 'Bán Kết 1', t1: t(1, 1), t2: t(2, 2) },
        { label: 'Bán Kết 2', t1: t(2, 1), t2: t(1, 2) }
      ]
    };
  }
}

// Get winner of a knockout match
function getMatchWinner(matchKey, t1, t2, scores, stage) {
  if (!t1 && t2) return t2; // BYE
  if (t1 && !t2) return t1; // BYE
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
  if (s1 === 0 && s2 === 0) return null; // 0-0 means unplayed
  return s1 > s2 ? t1 : (s2 > s1 ? t2 : null);
}
